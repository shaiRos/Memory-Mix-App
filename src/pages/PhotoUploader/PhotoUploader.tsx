// src/PhotoUploader.js

import React, { useState, useEffect, useRef, useMemo } from 'react';
import exifr from 'exifr';
import { useIndexDB } from '../../utils/IndexDBContext';
import { PhotoObject } from '../../utils/types';
import { Box, Modal, Typography } from '@mui/material';
import '../../styles/PhotosDisplay.css'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { compressImage } from './PhotoUtils';

enum ViewMode {
  photosOnMap = 'photos-on-map',
  photosNoLocation = 'photos-no-location'
}

const PhotoUploader = () => {
  const fileInputRef = useRef(null);
  const [openModal, setOpenModal] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [viewMode, setViewMode] = useState(ViewMode.photosOnMap)
  // const [previewImages]
  const {
    storeImages,
    albumImageCollection, currentMemoryAlbum, setCurrentMemoryAlbum, deleteImagesByFileName

  } = useIndexDB()

  useEffect(() => {
    setSelectedPhotos([])
  },[viewMode])




  function toggleViewMode() {
    if (viewMode === ViewMode.photosOnMap) setViewMode(ViewMode.photosNoLocation)
    else setViewMode(ViewMode.photosOnMap)
  }


  // Handle file input change
  const handleFileChange = async (event) => {
    setIsUploading(true)
    const selectedFiles : File[] = Array.from(event.target.files);
    console.log({uploadedFiles: selectedFiles})

    // prepare for upload 
    // make the photos objects

    let photoObjects: PhotoObject[] = []

    for (const file of selectedFiles) {
      if (file.type === 'video/mp4') continue
      let exifrResults;
      try {
        // const { latitude, longitude } = await exifr.gps(file);
        if (file.type === 'image/jpeg') {
          exifrResults = await exifr.parse(file)
        } else if (file.type === 'video/mp4') {

        }
      } catch (error) {
        console.error("Error reading EXIF data:", error, file);
      }

        const latitude = exifrResults?.latitude
        const longitude = exifrResults?.longitude
        const altitude = exifrResults?.GPSAltitude
        const CreateDate = exifrResults?.CreateDate

        // make the photo object 
        const photoBlob = new Blob([file], { type: file.type })
        const smallPreviewBlob = await compressImage(photoBlob)
        const photoData: PhotoObject = {
          photoBlob: photoBlob,
          smallPreviewBlob: smallPreviewBlob,
          CreateDate: CreateDate,
          UploadDate: new Date(),
          originalFileName: file.name
        };

        if (!latitude && !longitude) {
          photoData.location = null
          photoData.locationInput = null
        } else {
          photoData.location = { lat: latitude, lng: longitude }
          photoData.altitude = altitude
          photoData.locationInput = 'metadata'
        }

        photoObjects.push(photoData)

    }

    console.log(photoObjects)

    await storeImages(photoObjects)
    setIsUploading(false)
    // setLocations(locationsArray);

  };


  async function deleteSelectedPhotos() {
    console.log(selectedPhotos)
    await deleteImagesByFileName(selectedPhotos)
    setSelectedPhotos([])
    setOpenModal(false)
  }

  const photosWithLocation = useMemo(() => {
    return albumImageCollection.filter((m : PhotoObject) => m.locationInput)
  },[albumImageCollection])

  const photosWithNoLocation = useMemo(() => {
    return albumImageCollection.filter((m : PhotoObject) => !m.locationInput)
  },[albumImageCollection])

  const viewPhotoObjects = useMemo(() => {
    if (viewMode === ViewMode.photosOnMap) return photosWithLocation 
    else return photosWithNoLocation
  },[viewMode,albumImageCollection])



  return (
    <div className="sidebar-page min-w-[400px] max-h-full overflow-y-auto">
      {
        currentMemoryAlbum ? null :
        <p className='text-center text-red-500'>Select or create an album on the left</p>
      }
      <div className='flex justify-evenly my-4'>
        <button className={isUploading ? `cursor-wait` : ''} onClick={() => fileInputRef.current?.click()} disabled={currentMemoryAlbum ? false : true}>{ !isUploading ? 'Upload Photos' : 'Uploading...'}</button>
        <input ref={fileInputRef} style={{ display: 'none' }} id="upload-fileInput" type="file" title=" " accept=".png, .jpg, .jpeg" multiple onChange={handleFileChange} />
        <button id="main-delete-btn" disabled={selectedPhotos?.length > 0 ? false : true} className='bg-warmRed hover:bg-dangerRed text-offWhite' onClick={() => setOpenModal(true)}>Delete Photos</button>
      </div>
      {
        viewMode === ViewMode.photosOnMap ? 
          <h3>Photos on the map ({photosWithLocation?.length ?? 0})</h3> :
          <h3>Photos with no location ({photosWithNoLocation?.length ?? 0})</h3> 

      }
      <hr></hr>
      <div className='relative mt-2'>
        {
          albumImageCollection?.length ?
          (photosWithLocation?.length ?
            <div className='flex flex-nowrap justify-between'>
              <p className='whitespace-nowrap text-sm mr-1 cursor-pointer' onClick={() => setSelectedPhotos(viewPhotoObjects.map((m: PhotoObject) => m.albumPhotoID))}>Select all photos</p>
            </div>
            :
            <div className='text-sm text-gray-400 italic pt-2 mx-4'>
            Upload photos that have location data to show in the map.
            </div>)

            : currentMemoryAlbum ?
            <div className='text-sm text-gray-400 italic pt-2 mx-4'>
                There are no photos in this album. Upoad some photos!
            </div>
            :
            <div className='text-sm text-gray-400 italic pt-2 mx-4'>
                No Selected album
            </div>

        }
        <div className='flex items-center mb-2' style={{ minHeight: 30 }}>
          {
            selectedPhotos?.length > 0 ?
              <>
                <p className='whitespace-nowrap text-sm text-red-400 mr-1'>
                  Selected {selectedPhotos?.length} photos | <span className='cursor-pointer underline' onClick={() => setSelectedPhotos([])}>Clear</span>
                </p>
              </>

              : null
          }

        </div>
        <div className='grid grid-cols-4 gap-3 px-2'>
          {viewPhotoObjects.map((imageObject: PhotoObject, index) => (
            <PhotoSelectionPreviewCard key={imageObject.albumPhotoID} imageObject={imageObject} selectedPhotos={selectedPhotos} setSelectedPhotos={setSelectedPhotos} />
          ))}
        </div>
        
      </div>

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className="modal-box">
          <h2>Are you sure you want to delete these selected photos from this album?</h2>
          <p className='text-center text-red-500 text-sm'>*This will delete from your stored images</p>
          <div className='flex justify-evenly mt-3'>
            <button onClick={deleteSelectedPhotos}>Yes</button>
            <button onClick={() => setOpenModal(false)}>Cancel</button>

          </div>
        </Box>
      </Modal>
        {
          viewMode === ViewMode.photosOnMap ? 
          <div className='text-primaryText bg-highlightColor select-none h-[40px] absolute bottom-6 right-14 p-2 rounded-lg cursor-pointer' id="alert-button-sidebar" onClick={toggleViewMode} style={{display:photosWithNoLocation?.length > 0 ? 'block' : 'none'}}>
            {photosWithNoLocation?.length} photos with no location {'>'} 
          </div>
             :
         <div className='text-primaryText bg-highlightColor select-none h-[40px] absolute bottom-6 right-14 p-2 rounded-lg cursor-pointer' id="alert-button-sidebar" onClick={toggleViewMode} style={{display:photosWithLocation?.length > 0 || albumImageCollection?.length > 0 ? 'block' : 'none'}}>
           {'<'}  {photosWithLocation?.length} photos with location
         </div>
            
        }
    </div>
  );
};

function PhotoSelectionPreviewCard({ imageObject, selectedPhotos, setSelectedPhotos }: { imageObject: PhotoObject, selectedPhotos: string[], setSelectedPhotos: () => void }) {
  const [selected, setSelected] = useState(selectedPhotos.includes(imageObject.albumPhotoID))

  function selectImage(el) {
    if (selectedPhotos.includes(imageObject.albumPhotoID)) {
      // If photo is already selected, unselect it
      setSelectedPhotos(selectedPhotos.filter(photoId => photoId !== imageObject.albumPhotoID));
    } else {
      // If photo is not selected, add it to the selected list
      setSelectedPhotos([...selectedPhotos, imageObject.albumPhotoID]);
    }
  }

  useEffect(() => {
    setSelected(selectedPhotos.includes(imageObject.albumPhotoID))
  }, [selectedPhotos])

  return (
    <div key={imageObject.albumPhotoID} className={`photo-selection-preview ${selected && 'selected'}`} onClick={selectImage}>
      <img src={URL.createObjectURL(imageObject.smallPreviewBlob)} alt="Preview" style={{ height: 'auto', objectFit: 'cover', aspectRatio: '1/1' }} />
    </div>
  )
}

export default PhotoUploader;
