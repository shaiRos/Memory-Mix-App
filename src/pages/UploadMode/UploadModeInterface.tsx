import { useIndexDB } from "../../utils/IndexDBContext";
import { useMainAppContext } from "../../utils/MainAppContext";
import PhotoUploader from "../PhotoUploader/PhotoUploader";
import CloseIcon from '@mui/icons-material/Close';
import './UploadModeInterface.css'

export default function UploadModeInterface() {
    return (
        <>
        <div className='main-sidebar'>
          <PhotoUploader />
        </div>
        <UploadModeHeader />
      </>
    )
}

function UploadModeHeader() {
    const { isUploadMode, setIsUploadMode } = useMainAppContext()
    const {currentMemoryAlbum} = useIndexDB()
  
    return (
      <div className='absolute top-4 left-3 flex flex-nowrap h-[56px] items-center'>
        <div className='p-3 px-8 rounded-2xl text-2xl text-primaryText bg-offWhite shadow-xl select-none mr-6'>
          Upload, Select, and Map Photos
        </div>
        <button className='aspect-square h-[85%] w-[60px] bg-warmRed flex items-center justify-center rounded-xl shadow-xl cursor-pointer' onClick={() => setIsUploadMode(false)}
            disabled={currentMemoryAlbum ? false : true}
          >
          <CloseIcon sx={{ color: 'white' }} fontSize='large' />
        </button>
        <p className="bg-white" id="exit-text">exit and head to explore mode</p>
      </div>
    )
  }
  