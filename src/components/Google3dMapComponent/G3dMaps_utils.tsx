

export function deleteAllMarkers() {
    const oldMarkers = document.querySelectorAll('gmp-marker-3d-interactive');
    // Iterate over the NodeList and remove each element
    oldMarkers.forEach(element => element.remove());
}


export function addMarkerGroupToMap(map,locations : Array<{lat:number,lng:number}>) {
    const bounds = new google.maps.LatLngBounds()
    for (const loc of locations) {
        const marker = new google.maps.maps3d.Marker3DInteractiveElement({
            position: loc,
            title: 'title here'
        });

        map.append(marker)
        bounds.extend(loc)

        marker.addEventListener('gmp-click', (event) => {
            // TODO: Do some work here. `event.position` can be used to get coordinates of the
            // click. `event.target.position` can be used to get marker's position.
        });
    }
    return bounds
}

export function getCenterAndRangeFromBounds(bounds) {
    const centerBounds = bounds.getCenter() 
    const centerlat = centerBounds.lat()
    const centerlng = centerBounds.lng()
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    // Calculate the diagonal distance using the computeDistanceBetween method
    const diagonalDistance = google.maps.geometry.spherical.computeDistanceBetween(ne, sw);

    // Calculate the range (distance from the center to the edge)
    const range = diagonalDistance / 2;


    return {centerBounds,range}
}