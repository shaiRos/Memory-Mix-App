import { useEffect, useState } from "react";
import { useIndexDB } from "../../utils/IndexDBContext";
import { useMainAppContext } from "../../utils/MainAppContext";
import { getClusterCentroids, getNearbyFromLocalStorage, storeNearbyPlaces } from "../../utils/mapping_utils";
import { PhotoObject } from "../../utils/types";
import './NearbyPlaces.css'


export default function NearbyPlaces() {
    const { map, setMap } = useMainAppContext()
    const [nearbyPlacesResults, setNearbyPlacesResults] = useState([])

    const {
        ExploreImageCollection
    } = useIndexDB()

    useEffect(() => {

        if (nearbyPlacesResults.length > 0) {
            let first = nearbyPlacesResults[0]
            let firstPhoto = first.photos[0]
            // console.log(firstPhoto.getURI())
        }

    }, [nearbyPlacesResults])

    useEffect(() => {
        setNearbyPlacesResults([])
        if (ExploreImageCollection.length > 0) {
            getNearbyPlacesResults(ExploreImageCollection)
        }
    }, [ExploreImageCollection])

    async function getNearbyPlacesResults(ExploreImageCollection: PhotoObject[]) {
        const dataset = ExploreImageCollection.map((photo: PhotoObject) => {
            return {
                coords: [photo.location.lat, photo.location.lng],
                timestamp: photo.CreateDate
            }
        })
        // const dataset = locations.map(l => [l.lat, l.lng])
        // Epsilon: max distance between points (e.g., 0.1 for 100 meters), minPoints: minimum points in a cluster
        let cluster_centroids = getClusterCentroids(dataset, 0.004, 1) // very precise, inaccurate if 0.005
        let cluster_centroids_latlngObj = cluster_centroids.map(l => ({ lat: l[0], lng: l[1] }))
        // console.log(`there are ${cluster_centroids_latlngObj.length} centroids`)

        let nearbyPlacesFetchResults = await Promise.all(cluster_centroids_latlngObj.map(centroid => fetchNearbyPlaces(centroid)))

        for (let nearbyPlaces of nearbyPlacesFetchResults) {
            if (nearbyPlaces?.length) {
                let firstEntry = nearbyPlaces[0]
                let exists = nearbyPlacesResults.find(p => p.id === firstEntry.id)
                if (!exists) {
                    setNearbyPlacesResults((prevResults) => [...prevResults, firstEntry]);

                    // add marker in map for nearby places
                    if (firstEntry.photos?.length > 0) {

                        const marker = new google.maps.maps3d.Marker3DInteractiveElement({
                            position: { lat: firstEntry.location.lat, lng: firstEntry.location.lng, altitude: 50 },
                            label: firstEntry.displayName,
                            altitudeMode: 'RELATIVE_TO_GROUND',
                            extruded: true,

                        });

                        const pinBackground = new google.maps.marker.PinElement({
                            background: firstEntry.iconBackgroundColor,
                            glyph: new URL(String(firstEntry.svgIconMaskURI)),
                            glyphColor: 'white',
                            borderColor: 'white',
                            scale: 1.5
                        });

                        marker.append(pinBackground)
                        map.append(marker)
                    }

                }
            }
        }

    }
    return (
        <div className="flex-shrink-0 flex-grow-0 basis-auto">
            <h3>Places you may have visited this day..</h3>
            {
                !nearbyPlacesResults.length ?
                    <p className="text-sm pl-4 py-3 text-gray-500">Did not find any nearby places</p> :
                    <div className="flex gap-3 py-3 overflow-x-auto myScrollbar">
                        {
                            nearbyPlacesResults.map(p => {
                                let imgURL = p.photos[0]?.photoURI
                                if (!imgURL) return null
                                return <div key={imgURL} className="nearbyPlaces-carousel-preview-container">
                                    <img className="nearbyPlaces-carousel-img-preview" src={imgURL} onClick={() => window.open(p.googleMapsURI, '_blank')} />
                                    <div className="text-xs nearbyPlaces-carousel-content" style={{ width: 150 }}>{p.displayName}</div>
                                </div>

                            })
                        }
                    </div>
            }
        </div>
    )
}



// Function to fetch nearby places from Google API (if not in localStorage)
async function fetchNearbyPlaces(centroid: { lat: number, lng: number }) {
    const existingData = getNearbyFromLocalStorage(centroid);

    if (existingData) {
        // console.log('Using cached data:', existingData);
        return existingData.places; // Return cached data if found
    }

    // If no cached data, make API request
    const places = await nearbySearch(centroid)
    console.log('Fetched new nearby places data, storing in cache:', { centroid: centroid, places: places });
    storeNearbyPlaces(centroid, places); // Store in localStorage


    return places;
}

async function nearbySearch(point: { lat: number, lng: number }) {
    const { Place, SearchNearbyRankPreference } = await google.maps.importLibrary('places') as google.maps.PlacesLibrary;
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

    // Restrict within the map viewport.
    let center = new google.maps.LatLng(point.lat, point.lng);

    const request = {
        // required parameters
        fields: ['displayName', 'location', 'primaryType', 'types', 'photos', 'googleMapsURI','svgIconMaskURI', 'iconBackgroundColor'],
        locationRestriction: {
            center: center,
            radius: 100, // meters
        },
        // optional parameters
        excludedPrimaryTypes: ['parking'],
        // includedPrimaryTypes: ['restaurant'],
        maxResultCount: 5,
        rankPreference: SearchNearbyRankPreference.POPULARITY, // POPULARITY | DISTANCE
        language: 'en-US',
        region: 'us',
    };

    //@ts-ignore
    const { places } = await Place.searchNearby(request);

    if (places.length) {
        let placesJSON = places.map(p => p.toJSON())
        places.forEach((place, i) => {
            place.photos.forEach((photo, j) => {
                let photoURI = photo.getURI({ maxWidth: 250, maxHeight: parseInt(250 * (photo.heightPx / photo.widthPx)) })
                placesJSON[i].photos[j].photoURI = photoURI
            })
        })
        return placesJSON

    } else {
        console.log("No results");
        return []
    }
}