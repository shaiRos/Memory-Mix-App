import { useCallback, useEffect, useRef, useState } from 'react'

import Google3DMapComponent from './components/Google3dMapComponent/Google3dMapComponent';
import { useMainAppContext } from './utils/MainAppContext';
import ExploreModeInterface from './pages/ExploreMode/ExploreModeInterface';
import UploadModeInterface from './pages/UploadMode/UploadModeInterface';

import UploadFilled  from './assets/noun-image-upload-filled-4345714.svg?react'
import UploadIcon  from './assets/noun-upload-2059661.svg?react'
import InfoIcon  from './assets/noun-info-6553140.svg?react'
import AlbumSelectorWindow from './pages/AlbumSelectorWindow/AlbumSelectorWindow';
import { useIndexDB } from './utils/IndexDBContext';
import { Box, Modal } from '@mui/material';

function App() {
  const { isUploadMode, setIsUploadMode, albumSelectionOpen,setAlbumSelectionOpen } = useMainAppContext()
  const {currentMemoryAlbum} = useIndexDB()
  const [instructionsOpen,setInstructionsOpen] = useState(true)

  useEffect(() => {
    const isFirstVisit = JSON.parse(localStorage.getItem('firstVisit'));

    if (!isFirstVisit) {
      // show instructions and set to true in local storage
      setInstructionsOpen(true)
      localStorage.setItem('firstVisit', "true");
    }
  },[])




  // const { Map3DElement } = await google.maps.importLibrary("maps3d");

  const albumBtnClickHandler = () => {
    setAlbumSelectionOpen(p => !p)
  }

  return (
    <>
      <Google3DMapComponent />
      {
        isUploadMode ?
          <UploadModeInterface />
          :
          <ExploreModeInterface />
      }
      <AlbumSelectorWindow />



      <div className='map-footer absolute bottom-8 left-3 h-[40px] flex gap-3'>
        <button className='p-0 bg-offWhite rounded-[50%] aspect-square h-full flex justify-center items-center select-none cursor-pointer' onClick={() => setInstructionsOpen(true)} title="About the app">
          <InfoIcon />
          </button>
        {
          !isUploadMode &&
          <button className='p-0 bg-offWhite rounded-[50%] aspect-square h-full flex justify-center items-center select-none cursor-pointer' onClick={() => setIsUploadMode(true)} title="Upload photos">
            <UploadIcon />
            {/* <UploadFilled /> */}
          </button>
        }
        <button className={`bg-offWhite flex items-center rounded-3xl px-6 cursor-pointer select-none text-primaryText hover:scale-105 ${currentMemoryAlbum ? '' : 'pulse-size-animate'}`} onClick={albumBtnClickHandler}>
          Album Mix: {currentMemoryAlbum?.displayName ? currentMemoryAlbum?.displayName: 'Select an album'}
        </button>
      </div>
      <InstructionsModal openModal={instructionsOpen} setOpenModal={setInstructionsOpen} />
    </>
  )
}

function InstructionsModal({openModal, setOpenModal}) {
  return (
    <Modal
    open={openModal}
    onClose={() => setOpenModal(false)}
    aria-labelledby="modal-modal-title"
    aria-describedby="modal-modal-description"
  >
    <Box className="modal-box w-[90%] max-w-[800px] px-9" id="instructions-content">
      <h1 className='text-center mb-4'>Welcome to your Memory Mix!</h1>
      <p>
      Transform the way you experience your memories with Memory Mix. Using Google’s cutting-edge Photorealistic 3D Maps and Places API, Memory Mix places your memories right where they happened, letting you relive your moments like never before.   
      Upload your favorite photos, organize them into meaningful albums, and explore them in a breathtaking 3D world. 
      </p>
      <p>
      Discover a whole new way to relive your favorite moments!
      </p>
      <ul className='pl-8' style={{listStyle:'disc',listStylePosition:'outside'}}>
        <li><b>Upload Your Memories:</b> Easily upload your pictures into the app.
          <p className='text-sm text-gray-500 mb-0'>*note: photos must have location data attached to them. (e.g. You can download photos from google photos and upload them to the app)</p>
        </li>
        <li><b>Organize by Albums:</b> Group your photos into albums for seamless organization.</li>
        <li><b>Explore in 3D:</b> View your photos displayed on a stunning photorealistic 3D map.</li>
        <li><b>Place Recognition:</b> Automatically associate photos with real-world locations using Google’s advanced Maps and Places APIs.</li>
      </ul>
      <p>
      How to Navigate the Map
      </p>
      <ul className='pl-8' style={{listStyle:'disc',listStylePosition:'outside'}}>
        <li><b>Pan the Map:</b> Simply <b>drag</b> the map with your mouse left click to move around and explore different areas.
        </li>
        <li><b>Tilt the Map:</b> <b>Click and hold</b> the mouse wheel (middle button) to <b>tilt</b> the map for a more dynamic 3D view.</li>
        <li><b>Zoom In and Out:</b> <b>Scroll your mouse wheel</b> or Hold the right mouse button and move the mouse up to zoom in or down to zoom out.</li>
      </ul>
      <p className='italic my-3 text-gray-500'>*Please dismiss the message from google above the page for a full view of the app</p>

      {/* <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin varius turpis, et scelerisque urna faucibus ut. Donec consectetur, diam et condimentum scelerisque, augue quam pharetra odio, sed semper est orci id nibh. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Aliquam sed ligula facilisis, dictum metus at, finibus arcu. Nulla ut aliquet neque. Vestibulum commodo dui ac faucibus euismod. Proin ac massa nibh. Quisque consequat consequat turpis tincidunt iaculis. Vestibulum vestibulum tristique dui eu lobortis. Nullam dignissim rhoncus libero quis congue. Aliquam eu turpis vel velit porta mattis eget at lorem.
      </p> */}
      <div className='flex justify-evenly mt-6'>
        <button onClick={() => setOpenModal(false)}>Ready to dive in? Let's create your mix</button>

      </div>
    </Box>
  </Modal>
  )
}



export default App
