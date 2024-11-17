import React, {useContext, createContext, useState, useEffect} from 'react'

const MainAppContext = createContext({}); 

export const useMainAppContext = () => useContext(MainAppContext)

export function MainAppContextProvider({children}) {
    const [isUploadMode, setIsUploadMode] = useState(true)
    const [map,setMap] = useState(null)
    const [albumSelectionOpen,setAlbumSelectionOpen] = useState(false)

    useEffect(() => {
        if (isUploadMode) {
            setAlbumSelectionOpen(true); 
            return
        } 
        setAlbumSelectionOpen(false)
    },[isUploadMode])

    return (
        <MainAppContext.Provider value={{
            isUploadMode, setIsUploadMode,
            map, setMap,
            albumSelectionOpen,setAlbumSelectionOpen
        }}>
            {children}
        </MainAppContext.Provider>
    )
}

