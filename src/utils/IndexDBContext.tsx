import React, { createContext, useState, useContext, useEffect } from 'react'
import { createPhotoAlbum, deleteItemFromStore, getKeyFromIndex, getPhotoAlbums, PromiseWrapper, storePhotoObject } from './IndexDBUtilFunctions';
import { useMainAppContext } from './MainAppContext';
import { PhotoAlbum, PhotoObject } from './types';


const IndexDBContext = createContext<Any | undefined>(undefined);

export const useIndexDB = () => useContext(IndexDBContext);

const PHOTO_DBSTORE = 'photos'
const PHOTO_ALBUM_DBSTORE = 'photo-memory-albums'

export function IndexDBProvider({ children }) {
    const dbName = 'PhotoApp'
    const [db, setDB] = useState(null)
    const [dbStore, setDBStore] = useState('photos')
    const [currentMemoryAlbum, setCurrentMemoryAlbum] : [currentMemoryAlbum : PhotoAlbum, setCurrentMemoryAlbum: VoidFunction] = useState<PhotoAlbum>()
    const [albumImageCollection,setAlbumImageCollection] = useState([])
    const [ExploreImageCollection,setExploreImageCollection] = useState([])
    const [ExploreImageCollection_UniqueDates,setExploreImageCollection_UniqueDates]= useState([])
    const [ExploreImageCollection_CurrentDate,setExploreImageCollection_CurrentDate]= useState()
    const {isUploadMode,setIsUploadMode} = useMainAppContext()
    useEffect(() => {
        // when on upload mode, the stored images is all images in the current album
        if (ExploreImageCollection_CurrentDate) {
            const photoCollection = albumImageCollection
            // filter for photos with location
            const filteredPhotos = photoCollection.filter((photo: PhotoObject) => {

                if (!photo.locationInput || !photo.CreateDate) return false
                const photoDate = photo.CreateDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                  });

                // Convert targetDate to the same comparable format
                const targetDateString = (new Date(ExploreImageCollection_CurrentDate)).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                });
                // Compare the formatted dates
                return photoDate === targetDateString;
            }).sort((a, b) => a.CreateDate - b.CreateDate);
            // then filter for photos with the current date
            setExploreImageCollection(filteredPhotos)

        } else {
            setExploreImageCollection([])
        }
        // otherwise on explore mode, it is per day
    },[ExploreImageCollection_CurrentDate])


    useEffect(() => {
        // get the unique dates of all the images in this album 
        let uniqueDates = new Set() 
        for (let img of albumImageCollection) {
            if (img.CreateDate && img.locationInput) {
                const date = img.CreateDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long', // 'long' gives the full month name
                    day: 'numeric'
                  });
                uniqueDates.add(date)
            }
        }
        const sortedDates = Array.from(uniqueDates).sort((a, b) => new Date(a) - new Date(b));
        setExploreImageCollection_UniqueDates(sortedDates)
        if (sortedDates.length > 0) setExploreImageCollection_CurrentDate(sortedDates[0])
    },[albumImageCollection])

    // Open the IndexedDB database
    useEffect(() => {
        const request = indexedDB.open(dbName, 2);

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            const photoStore = db.createObjectStore(PHOTO_DBSTORE, { keyPath: 'originalFileName', autoIncrement: true });
            const photoMemoryAlbumsStore = db.createObjectStore(PHOTO_ALBUM_DBSTORE, { keyPath: 'albumID' });

            photoStore.createIndex('memoryAlbumID', 'memoryAlbumID', { unique: false })
            photoStore.createIndex('originalFileName', 'originalFileName')
            photoStore.createIndex('CreateDate','CreateDate', {unique: false})
            photoStore.createIndex('UploadDate','UploadDate', {unique: false})
            photoStore.createIndex('locationInput','locationInput', {unique: false})


            photoMemoryAlbumsStore.createIndex('displayName', 'displayName')
        };

        request.onsuccess = function (event) {
            console.log("Database opened successfully!");
            setDB(event.target.result)
        };

        request.onerror = function (event) {
            console.error("Database error: ", event.target.error);
        };

        (async () => {

            // const quota = await navigator.storage.estimate();
            // const totalSpace = quota.quota;
            // const usedSpace = quota.usage;
            // console.log({quota,totalSpace,usedSpace})
            // const percentageUsed = (quota.usage / quota.quota) * 100
            // console.log(`You've used ${percentageUsed}% of the available storage`)
            // const remaining = (quota.quota - quota.usage) / 1024/1024;
            // console.log(`You can write up to ${remaining} more MB`) 
            // console.log(`You can write up to ${remaining/1000} more GB`) 
        })()

    }, []);

    useEffect(() => {
        if (db && dbStore && currentMemoryAlbum) {
            // check if photo store exists
            setAlbumImageCollection([])
            setExploreImageCollection([])
            setExploreImageCollection_UniqueDates([])
            
            setExploreImageCollection_CurrentDate([])

            void (async() => {
                let images = await getImages()
                if (images.status === "rejected") {
                    //error

                    return
                }
                if (!images?.length) setIsUploadMode(true)
                else {
                    // setAlbumImageCollection(event.target.result)
                }
            })()
        }
    }, [db, dbStore, currentMemoryAlbum])

    function openTransactionInStore(store) {
        const transaction = db.transaction([store], 'readwrite')
        const objectStore = transaction.objectStore(store)
        return {transaction,objectStore}
    }

    function getImages(memoryAlbum?: string) {
        return new Promise((resolve, reject) => {

            const transaction = db.transaction([dbStore], 'readonly');
            const store = transaction.objectStore(dbStore);

            // Example 2: Retrieve all items from the object store
            let getAllRequest;
            const index = store.index('memoryAlbumID')
            getAllRequest = index.getAll(currentMemoryAlbum.albumID);
            // if (memoryAlbum) {
            //     const index = store.index('memoryAlbumID')
            //     getAllRequest = index.getAll(currentMemoryAlbum);
            // } else {
            //     getAllRequest = store.getAll();
            // }
            getAllRequest.onsuccess = function (event) {
                setAlbumImageCollection(event.target.result)
                resolve(event.target.result)
            };

            getAllRequest.onerror = (event) => {
                console.error('Error fetching data from store:', event.target.error);
                reject(event.target.error);
            };
        })

    }

    // Store images in IndexedDB
    async function storeImages(photoObjects: Array<{ photoBlob: Blob, location: { lat: number, lng: number }, locationInput: string }>) {
            const transaction = db.transaction([dbStore], 'readwrite');
            const store = transaction.objectStore(dbStore);

            const success = []
            const error = []

            const storePromises = photoObjects.map(obj => {
                const photoData = { ...obj, memoryAlbumID: currentMemoryAlbum.albumID }
                return storePhotoObject(store,photoData)
            } )

            let results = await Promise.allSettled(storePromises)
            // ## TODO handle files that should be uploaded to multiple albums
            for (let queries of results) {
                if (queries.status === "rejected") {
                    // Key already exists in the object store.

                    // if it does, find if it has the same album id that we are uploading to

                    // if it is not, upload as another file name (allow same file to be in different albums)
                    // console.log(queries)
                }
            }
            getImages(currentMemoryAlbum.albumID)
    
    };

    function deleteImagesInAlbum(albumID) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([PHOTO_DBSTORE], 'readwrite')
            const objectStore = transaction.objectStore(PHOTO_DBSTORE)

            const request = objectStore.openCursor();

            request.onsuccess = function (event) {
                const cursor = event.target.result;
                if (cursor) {
                    const record = cursor.value;
                    if (record.memoryAlbumID === albumID) { 
                        const deleteRequest = cursor.delete();
                        deleteRequest.onsuccess = function () {
                            // console.log("Deleted item with album name");
                        };
                        deleteRequest.onerror = function () {
                            reject("Error deleting item with album name");
                        };
                    }
                    cursor.continue();
                } else {
                    resolve("Finished clearing items with album name");
                }
            };

            request.onerror = function (event) {
                console.log("Error reading store", event);
                reject(event);
            };
        })

    }

    async function deleteImagesByFileName(fileNames : Array<string>) {
        const {objectStore} = openTransactionInStore(PHOTO_DBSTORE)
        const fileNameIndex = objectStore.index('originalFileName')

        const deletePromises = fileNames.map(async (fileName) => {
            // Get the key for the file using the index
            const key = await getKeyFromIndex(fileNameIndex, fileName)
            if (key) {
                // delete the record by key 
                await deleteItemFromStore(objectStore, key);
            }

        })

        await Promise.allSettled(deletePromises)
        getImages(currentMemoryAlbum.albumID)
    }

    async function createAlbum(newAlbumObject) {
        const {transaction,objectStore} = openTransactionInStore(PHOTO_ALBUM_DBSTORE)
        try {
            let results = await createPhotoAlbum(transaction,objectStore,newAlbumObject)
            return results
        } catch(err) {

        }
    }

    function deleteAlbumByID(albumID) {
        return PromiseWrapper(async(resolve,reject) => {

            // delete the photos first
    
            let deleteAlbumPhotos = await deleteImagesInAlbum(albumID)
    
            if (deleteAlbumPhotos?.status === "rejected") {
                alert('Something went wrong when trying to delete photos...')
                reject(deleteAlbumPhotos?.reason)
                return
            } 
            console.log('successfully deleted photos!')
            console.log('Deleting album entry...')
    
            // delete album entry
            const {objectStore} = openTransactionInStore(PHOTO_ALBUM_DBSTORE)
            let deleteAlbumResults = await deleteItemFromStore(objectStore, albumID);
    
            if (deleteAlbumResults?.status === "rejected") {
                alert('Something went wrong when trying to delete the album...')
                reject(deleteAlbumResults?.reason)
                return          
            }
            console.log('successfully deleted album.')
            resolve('success')
        })

        
    }

    async function getAllAlbums() {
        const {transaction,objectStore} = openTransactionInStore(PHOTO_ALBUM_DBSTORE)

        try {
            let albums = await getPhotoAlbums(objectStore)
            return albums
        } catch(err) {
            return {error: err}
        }
    }

    return (
        <IndexDBContext.Provider value={{
            db,
            setDB,
            dbStore,
            getImages, storeImages,
            albumImageCollection,setAlbumImageCollection,
            ExploreImageCollection, 
            ExploreImageCollection_UniqueDates,
            ExploreImageCollection_CurrentDate,setExploreImageCollection_CurrentDate,
            currentMemoryAlbum, setCurrentMemoryAlbum, deleteImagesInAlbum, deleteImagesByFileName, createAlbum, getAllAlbums, deleteAlbumByID,
            isUploadMode
        }}
        >
            {children}
        </IndexDBContext.Provider>
    )
}