import { useEffect, useState } from "react";
import { useMainAppContext } from "../../utils/MainAppContext";
import { useIndexDB } from "../../utils/IndexDBContext";
import { PhotoAlbum } from "../../utils/types";
import POIIcon from '../../assets/noun-poi-317484.svg?react'
import DeleteIcon from '../../assets/noun-delete-7385365-FFFFFF.svg?react'

import './AlbumSelectorWindow.css'
import { Box, Modal, TextField } from "@mui/material";



export default function AlbumSelectorWindow() {
    const { albumSelectionOpen, setAlbumSelectionOpen, setIsUploadMode } = useMainAppContext()
    const [albumsList, setAlbumsList] = useState([])
    const { db,currentMemoryAlbum, setCurrentMemoryAlbum, createAlbum, getAllAlbums, deleteAlbumByID } = useIndexDB()

    useEffect(() => {
        if (!db) return
        if (albumSelectionOpen) {
            void fetchAlbumList()
        }
    }, [db,albumSelectionOpen])

    useEffect(() => {
        if (!currentMemoryAlbum) {
            // setAlbumSelectionOpen(true)
        }
    }, [currentMemoryAlbum])

    if (!albumSelectionOpen) return null



    const selectAlbumHandler = (albumObject: PhotoAlbum) => {
        setCurrentMemoryAlbum(albumObject)

    }

    async function fetchAlbumList() {
        let albums = await getAllAlbums()
        setAlbumsList(albums)

        // if
    }

    const createAlbumHandler = async (albumName) => {
        const newAlbumObject: PhotoAlbum = {
            displayName: albumName
        }
        let results = await createAlbum(newAlbumObject)
        if (results.error) {
            // there was error
        } else {
            // if success
            setCurrentMemoryAlbum(results)
            fetchAlbumList()
            setIsUploadMode(true)
        }
        return results
    }

    const deleteAlbumHandler = async (albumObject: PhotoAlbum) => {
        console.log('delete album', albumObject)

        let results = await deleteAlbumByID(albumObject.albumID)

        if (results?.status !== "rejected") {
            setCurrentMemoryAlbum(undefined)
            fetchAlbumList()
        }
        return results

    }

    return (
        <>
            <div className='secondary-sidebar'>
                <div className="sidebar-page">

                    <h2 className="text-center mb-3">Memory Mix Albums</h2>
                    <div className="album-list-container">
                        {
                            albumsList.map((album: PhotoAlbum) =>
                                <button key={album.albumID} className={`album-item ${currentMemoryAlbum && currentMemoryAlbum.albumID === album.albumID ? 'selected' : ''}`} onClick={() => selectAlbumHandler(album)}>
                                    <div className="flex gap-1">
                                        <POIIcon />
                                        <label className="text-left flex-grow px-2">{album.displayName}</label>
                                    </div>
                                    <DeleteAlbumAction deleteAlbumHandler={deleteAlbumHandler} album={album} />
                                </button>)
                        }
                        {/* <button className='album-item'>
                            <div className="flex">
                                <div className="w-[20px]">
                                    <POIIcon />
                                </div>
                                <label className="text-left flex-grow px-2">{'Really long album name here just testing the amount of'}</label>
                            </div>
                            <DeleteAlbumAction deleteAlbumHandler={deleteAlbumHandler} album={album} />
                        </button> */}
                        <CreateAlbumButton createAlbumHandler={createAlbumHandler} />

                    </div>
                </div>
            </div>
        </>
    )
}

function CreateAlbumButton({ createAlbumHandler }) {
    const [openModal, setOpenModal] = useState(false)
    const { currentMemoryAlbum, setCurrentMemoryAlbum, createAlbum, getAllAlbums } = useIndexDB()
    const [textInputValue, setTextInputValue] = useState('')

    // useEffect(() => {
    //     console.log(textInputValue)
    // }, [textInputValue])

    const createAlbumAction = async () => {
        let results = await createAlbumHandler(textInputValue)
        if (results.status === "rejected") {
            // there was error
        } else {
            // if success
            setOpenModal(false)
        }

    }


    return (
        <>
            <button onClick={() => setOpenModal(true)}>Create new album</button>
            <Modal
                open={openModal}
                onClose={() => setOpenModal(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box className="modal-box w-[400px]">
                    {/* <h2>Enter the name of your album</h2> */}
                    <TextField id="standard-basic" label="Enter the name of your album" variant="standard" sx={{ width: '100%' }} onChange={el => setTextInputValue(el.target.value)} autoComplete='off' inputProps={{ maxLength: 65 }} />
                    <div className='flex justify-evenly mt-3'>
                        {/* <button onClick={() => setOpenModal(false)}>Cancel</button> */}
                        <button value={textInputValue} onClick={createAlbumAction} disabled={textInputValue?.length > 0 ? false : true}>Create Album</button>
                    </div>
                </Box>
            </Modal>
        </>

    )
}

function DeleteAlbumAction({ deleteAlbumHandler, album }) {
    const [openModal, setOpenModal] = useState(false)

    const deleteAlbumAction = async () => {
        let results = await deleteAlbumHandler(album)
        if (results.status === "rejected") {
            // there was error
        } else {
            // if success
            setOpenModal(false)
        }

    }

    return (
        <div onClick={(e) => e.stopPropagation()}>
            <div className="delete-btn bg-warmRed self-center rounded-md flex justify-center items-center" onClick={(e) => setOpenModal(true) }>
                <DeleteIcon />
            </div>
            <Modal
                open={openModal}
                onClose={() => setOpenModal(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box className="modal-box">
                    <h2>Are you sure you want to delete this album?</h2>
                    <p className='text-center text-red-500 text-sm'>*This will delete all stored images in the album</p>
                    <div className='flex justify-evenly mt-3'>
                        <button onClick={deleteAlbumAction}>Yes</button>
                        <button onClick={() => setOpenModal(false)}>Cancel</button>

                    </div>
                </Box>
            </Modal>
        </div>
    )
}