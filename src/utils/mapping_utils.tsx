import { DBSCAN } from 'density-clustering';

// Function to calculate the centroid of a cluster
export function calculateCentroid(cluster, data) {
    let sumLat = 0, sumLng = 0;
    
    // Sum latitudes and longitudes
    cluster.forEach(index => {
      sumLat += data[index][0]; // Latitude
      sumLng += data[index][1]; // Longitude
    });
    
    // Calculate average for latitude and longitude
    const centroidLat = sumLat / cluster.length;
    const centroidLng = sumLng / cluster.length;
    
    return [centroidLat, centroidLng]; // Return centroid as [latitude, longitude]
}

export function getClusterCentroids(
    data : Array<{coords: number[],timestamp:Date}>,
    eps : number, // Epsilon: max distance between points (e.g., 0.1 for 100 meters), minPoints: minimum points in a cluster found 0.004 the best for our app
    min_points : number
  ) {
    // Extract coordinates for clustering
    const coordinates = data.map(point => point.coords);
    // Run DBSCAN
    const dbscan = new DBSCAN();
    const clusters = dbscan.run(coordinates, eps, min_points);

    // Filter clusters based on time spent in each cluster
    const minStayDuration = 0; // Set the minimum time to consider (e.g., 5 minutes)
    const filteredClusters = clusters.filter(cluster => {
        let timestamps = cluster.map(index => data[index].timestamp).sort();
        timestamps = timestamps.filter( exists => exists)
        const timeSpent = timeDifferenceInMinutes(timestamps[0], timestamps[timestamps.length - 1]);
        return timeSpent >= minStayDuration; // Only keep clusters where the time spent is >= 5 minutes
      });

    // Loop through each cluster and calculate its centroid
    const centroids = filteredClusters.map(cluster => calculateCentroid(cluster, coordinates));

    return centroids
}

// Function to calculate time difference in minutes between two timestamps
function timeDifferenceInMinutes(t1, t2) {
    const diffMs = Math.abs(new Date(t2) - new Date(t1)); // Difference in milliseconds
    return Math.floor(diffMs / 1000 / 60); // Convert to minutes
}

// Function to calculate distance between two coordinates (Haversine formula)
function getDistance(lat1, lng1, lat2, lng2) {
  const toRad = x => (x * Math.PI) / 180;

  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

// Function to check if a centroid has nearby places already in localStorage
export function getNearbyFromLocalStorage(centroid, threshold = 0.3) {
  const storedData = JSON.parse(localStorage.getItem('nearbyPlaces')) || [];

  // Check if any stored places are within the threshold distance
  return storedData.find(entry => {
      const distance = getDistance(centroid.lat, centroid.lng, entry.centroid.lat, entry.centroid.lng);
      return distance <= threshold; // Threshold in km
  });
}

// Function to store results for a centroid in localStorage
export function storeNearbyPlaces(centroid, places) {
  const storedData = JSON.parse(localStorage.getItem('nearbyPlaces')) || [];
  storedData.push({ centroid, places });
  localStorage.setItem('nearbyPlaces', JSON.stringify(storedData));
}

export function getRandomBetween(min, max) {
  return Math.random() * (max - min) + min;
}