import { useEffect, useMemo, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader"
import { useIndexDB } from "../../utils/IndexDBContext";
import { PhotoObject } from "../../utils/types";
import { useMainAppContext } from "../../utils/MainAppContext";
import { addMarkerGroupToMap, deleteAllMarkers, getCenterAndRangeFromBounds } from "./G3dMaps_utils";
import { getRandomBetween } from "../../utils/mapping_utils";
import {config} from '../../../google.config'

export default function Google3DMapComponent() {
	const { map, setMap, setIsUploadMode } = useMainAppContext()
	const infoWindowRef = useRef()

	const loader = new Loader(config.loaderConfig);
	const {
		db, setDB,
		dbStore,
		getImages, storeImages, currentMemoryAlbum,
		albumImageCollection, ExploreImageCollection, 
		isUploadMode

	} = useIndexDB()

	useEffect(() => {
		if (!map) return
		
		const photosWithLocations = albumImageCollection.filter((m: PhotoObject) => m.locationInput).map((p: PhotoObject) => p.location)
		deleteAllMarkers()
		if (isUploadMode && photosWithLocations.length > 0) {
			map.stopCameraAnimation()
			const bounds = addMarkerGroupToMap(map, photosWithLocations)
			const { centerBounds, range } = getCenterAndRangeFromBounds(bounds)
			const centerlat = centerBounds.lat()
			const centerlng = centerBounds.lng()
			map.flyCameraTo({
				endCamera: {
					// center: {...(locations[0]),altitude:0},
					center: { lat: centerlat, lng: centerlng, altitude: photosWithLocations[0]?.altitude || 1000 },
					// tilt: 0,
					range: Math.max(range + range * 3, 200)

				}
			})
		} else if (!photosWithLocations.length) {
			map.stopCameraAnimation()
		}
	}, [map, albumImageCollection, isUploadMode])

	useEffect(() => {
		if (!map) return
		const photosWithLocations = ExploreImageCollection.filter((m: PhotoObject) => m.locationInput).map((p: PhotoObject) => ({...p.location,altitude:p?.altitude}))
		if (!isUploadMode && photosWithLocations.length > 0) {
			deleteAllMarkers()
			const bounds = addMarkerGroupToMap(map, photosWithLocations)
			const { centerBounds, range } = getCenterAndRangeFromBounds(bounds)
			const centerlat = centerBounds.lat()
			const centerlng = centerBounds.lng()
			const randomValue = getRandomBetween(-90, 90);

			const flyToCamera = {
				center: { lat: centerlat, lng: centerlng, altitude: photosWithLocations[0]?.altitude + 40 || 1000 },
				tilt: 40,
				heading: randomValue,
				range: Math.max(range + range * 3, 350)

			};
			map.flyCameraTo({
				endCamera: flyToCamera,
				durationMillis: 3500
			})
			map.addEventListener('gmp-animationend', () => {
				map.flyCameraAround({
				  camera: flyToCamera,
				  durationMillis: 40000,
				  rounds: 1
				});
			  }, {once: true});

			// DRAW POLYLINES TRACKING TRAVEL BETWEENT THE PINS BY TIME
			const polyline = document.querySelector('gmp-polyline-3d');
			polyline?.remove();
			// let coordinates = photosWithLocations.map(p => ({...p.location,altitude:p?.altitude}))
			let coordinates = photosWithLocations.map(p => ({lat: p.lat, lng: p.lng}))

			const polylineOptions = {
				strokeColor: "rgba(229, 226, 255, 0.75)",
				strokeWidth: 7,
				altitudeMode: "CLAMP_TO_GROUND",
				// altitudeMode: "ABSOLUTE",
				drawsOccludedSegments: true,
			}

			const polylineTravelSequence = new google.maps.maps3d.Polyline3DElement(polylineOptions);
			polylineTravelSequence.coordinates = coordinates
			map.append(polylineTravelSequence);


		}

	}, [map, ExploreImageCollection, isUploadMode])

	useEffect(() => {
		if (map) {

			function stopFlyCamera() {
				map.stopCameraAnimation();
			}
			// Add event listeners to stop the animation if the user interacts with the map
			map.addEventListener('gmp-click', stopFlyCamera);
		}

	},[map])


	useEffect(() => {
		loader.load().then(async () => {
			const { Map3DElement, Marker3DInteractiveElement, Polygon3DElement,Polyline3DElement, AltitudeMode } = await google.maps.importLibrary("maps3d");
			await google.maps.importLibrary('geometry')
			const { PinElement } = await google.maps.importLibrary("marker");

			const map3DElement = new Map3DElement({
				center: { lat: 43.6425, lng: -79.3871, altitude: 400 },
				range: 1000,
				tilt: 60,
			});
			map3DElement.defaultLabelsDisabled = true;

			setMap(map3DElement)

			// Create an InfoWindow
			infoWindowRef.current = new google.maps.InfoWindow({
				content: "<h3>This is a 3D marker</h3><p>Here is some additional info about this location.</p>"
			});
		});

	}, [])
	const mapContainerRef = useRef(null);

	useEffect(() => {
		if (map && mapContainerRef.current) {

			// replace to HTMLElement to the map container
			mapContainerRef.current.replaceChildren(map);
		}
	}, [map]); // Runs when map3DElement changes

	useEffect(() => {
		// clear all features
		const polyline = document.querySelector('gmp-polyline-3d');
		polyline?.remove();
		const markers = document.querySelectorAll('gmp-marker-3d-interactive');
		markers.forEach(element => element.remove());
	},[currentMemoryAlbum])

	return (
		<div id="map">
			<div ref={mapContainerRef} style={{ height: '100%', width: '100%' }}></div>
		</div>
	);
}
