import { useEffect, useRef, useState } from 'react'
import '../../styles/PhotosDisplay.css'
import { useIndexDB } from '../../utils/IndexDBContext'
import { PhotoObject } from '../../utils/types'
import { useMainAppContext } from '../../utils/MainAppContext'
import { getRandomBetween } from '../../utils/mapping_utils'



export default function PhotoGalleryExplore() {
    const [photoMap, setPhotoMap] = useState<Map<number, object>>(new Map())

    const { ExploreImageCollection }: { ExploreImageCollection: PhotoObject[] } = useIndexDB()
    const {map} = useMainAppContext()
    const lastAltitude = useRef()

    useEffect(() => {

        const newPhotosMap = new Map();
        ExploreImageCollection.forEach((photo: PhotoObject) => {
            const hourKey = photo.CreateDate?.getHours()
            if (hourKey == undefined) return
            // If the hour doesn't exist in the map, create a new array for that hour
            else if (!newPhotosMap.has(hourKey)) {
                newPhotosMap.set(hourKey, []);
            }
            // Push the current photo to the array of the corresponding hour
            newPhotosMap.get(hourKey).push(photo);

        })
        setPhotoMap(newPhotosMap)
    }, [ExploreImageCollection])

    function getAMPMTimeDisplay(hour) {
        const ampm = hour >= 12 ? 'PM' : 'AM';

        // Convert 24-hour format to 12-hour format
        hour = hour % 12;
        hour = hour ? hour : 12; // hour '0' should be '12'

        return `${hour}:00 ${ampm}`;
    }

    const photoClickHandler = (imageObject) => {
        // console.log('goto photo:',imageObject)
        map.stopCameraAnimation()

        let altitude = imageObject?.altitude 
        if (altitude) {
            lastAltitude.current = altitude
        } else {
            altitude = lastAltitude.current
        }

        const randomValue = getRandomBetween(-90, 90);
        map.flyCameraTo({
            endCamera: {
                // center: {...(locations[0]),altitude:0},
                center: {lat:imageObject.location.lat,lng:imageObject.location.lng,altitude: altitude},
                tilt: 30,
                heading: randomValue,
                range: 200

            },
            durationMillis: 3000
        })

    }

    return (
        <>
            <h3>Photos taken this day..</h3>
            <div className="photo-gallery-container">
            {
                ExploreImageCollection?.length ?
                Array.from(photoMap?.entries()).map(([time, images]) => (
                    <div key={time} className="photo-gallery-section-block">
                        <div className="photo-gallery-section-block-heading">
                            <hr className="flex-grow"></hr>
                            <p>{getAMPMTimeDisplay(time)}</p>
                        </div>
                        <div className="photo-gallery-section-block-imgs grid grid-cols-3 gap-3 px-2">
                            {images.map((imageObject : PhotoObject, index) => (
                                <div key={index} className="photo-selection-preview aspect-square" onClick={() => photoClickHandler(imageObject)}>
                                    <img src={URL.createObjectURL(imageObject.smallPreviewBlob)} alt={`Photo taken at ${time}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))
                :
                <p className="text-sm py-3 text-gray-500">No photos with location to show in the map</p>
            }
            {/* <Example /> */}
            </div>
        </>
    )
}
function Example() {
    return (
        <>
            
                <div className="photo-gallery-section-block">
                    <div className="photo-gallery-section-block-heading">
                        <hr className="flex-grow"></hr>
                        <text>1:00 PM</text>
                    </div>
                    <div className="photo-gallery-section-block-imgs grid grid-cols-3 gap-3 px-2">
                        <div className="photo-selection-preview">
                        </div>
                        <div className="photo-selection-preview">
                        </div>
                        <div className="photo-selection-preview">
                        </div>
                        <div className="photo-selection-preview">
                        </div>
                    </div>
                </div>
                <div className="photo-gallery-section-block">
                    <div className="photo-gallery-section-block-heading">
                        <hr className="flex-grow"></hr>
                        <text>2:00 PM</text>
                    </div>
                    <div className="photo-gallery-section-block-imgs grid grid-cols-3 gap-3 px-2">
                        <div className="photo-selection-preview">
                        </div>
                        <div className="photo-selection-preview">
                        </div>
                        <div className="photo-selection-preview">
                        </div>
                        <div className="photo-selection-preview">
                        </div>
                    </div>
                </div>
                <div className="photo-gallery-section-block">
                    <div className="photo-gallery-section-block-heading">
                        <hr className="flex-grow"></hr>
                        <text>3:00 PM</text>
                    </div>
                    <div className="photo-gallery-section-block-imgs grid grid-cols-3 gap-3 px-2">
                        <div className="photo-selection-preview">
                        </div>
                        <div className="photo-selection-preview">
                        </div>
                        <div className="photo-selection-preview">
                        </div>
                        <div className="photo-selection-preview">
                        </div>
                    </div>
                </div>
                <div className="photo-gallery-section-block">
                    <div className="photo-gallery-section-block-heading">
                        <hr className="flex-grow"></hr>
                        <text>4:00 PM</text>
                    </div>
                    <div className="photo-gallery-section-block-imgs grid grid-cols-3 gap-3 px-2">
                        <div className="photo-selection-preview">
                        </div>
                        <div className="photo-selection-preview">
                        </div>
                        <div className="photo-selection-preview">
                        </div>
                        <div className="photo-selection-preview">
                        </div>
                    </div>
                </div>
                <div className="photo-gallery-section-block">
                    <div className="photo-gallery-section-block-heading">
                        <hr className="flex-grow"></hr>
                        <text>5:00 PM</text>
                    </div>
                    <div className="photo-gallery-section-block-imgs grid grid-cols-3 gap-3 px-2">
                        <div className="photo-selection-preview">
                        </div>
                        <div className="photo-selection-preview">
                        </div>
                        <div className="photo-selection-preview">
                        </div>
                        <div className="photo-selection-preview">
                        </div>
                    </div>
                </div>
        </>
    )
}