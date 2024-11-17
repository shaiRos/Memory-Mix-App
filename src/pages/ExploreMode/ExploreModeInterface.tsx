import { useEffect, useState } from "react"
import ExploreSidebarContent from "./ExploreSidebarContent"
import { useIndexDB } from "../../utils/IndexDBContext"
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';



export default function ExploreModeInterface() {

  return (
    <>
      <div className='main-sidebar'>
        <ExploreSidebarContent />
      </div>
      <ExploreModeHeader />
    </>
  )
}

function ExploreModeHeader() {

  const {
    ExploreImageCollection_UniqueDates,
    ExploreImageCollection_CurrentDate,
    setExploreImageCollection_CurrentDate
  } = useIndexDB()
  const [dateIndex, setDateIndex] = useState(0)

  useEffect(() => {
    setDateIndex(0)
    // find current date index 
    let index = ExploreImageCollection_UniqueDates.findIndex(item => item === ExploreImageCollection_CurrentDate)
    setDateIndex(index)
  }, [ExploreImageCollection_CurrentDate])

  const onClickNavigateDates = (value) => {
    let currentDateIndex = dateIndex 
    let newDateIndex = dateIndex + value

    // check if index is in range 
    // don't need to do checking if we disable the buttons 
    setExploreImageCollection_CurrentDate(ExploreImageCollection_UniqueDates[newDateIndex])
  }


  return (
    <div className='absolute top-4 left-3 flex flex-nowrap gap-6 h-[56px] items-center'>
      <div className='flex items-center gap-3 p-3 px-9 rounded-2xl text-xl text-primaryText bg-offWhite shadow-xl select-none'>
        {
          ExploreImageCollection_UniqueDates.length > 1 &&
        <button className="px-3 py-1" onClick={() => onClickNavigateDates(-1)} disabled={dateIndex == 0 ? true : false}>
          <NavigateBeforeIcon/>
        </button>
        }
        {ExploreImageCollection_CurrentDate}
        {
          ExploreImageCollection_UniqueDates.length > 1 &&
            <button className="px-3 py-1" onClick={() => onClickNavigateDates(1)} disabled={dateIndex == ExploreImageCollection_UniqueDates.length - 1 ? true : false}>
            <NavigateNextIcon/>
            </button>
        }
      </div>
    </div>
  )
}

