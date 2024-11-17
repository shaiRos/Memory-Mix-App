import { v4 as uuidv4 } from 'uuid';

export function getKeyFromIndex(storeIndex, indexValue) {
    return new Promise((resolve, reject) => {
        const indexRequest = storeIndex.getKey(indexValue);

        indexRequest.onsuccess = () => resolve(indexRequest.result);
        indexRequest.onerror = (event) => reject(event.target.error);
    });
}

export function deleteItemFromStore(objectStore, key) {
    return PromiseWrapper((resolve, reject) => {
        const deleteRequest = objectStore.delete(key);

        deleteRequest.onsuccess = () => resolve("Item deleted successfully");  // Pass a result here
        deleteRequest.onerror = (event) => reject(event.target.error);
    });
}

// export function deleteItemsInAlbum(objectStore,albumName) {
//     return new Promise((resolve,reject) => {
//         let index = objectStore.index(albumName) 
//     })
// }

export function storePhotoObject(objectStore,photoObject) {
    return new Promise((resolve,reject) => {
        const request = objectStore.add(photoObject) 

        request.onsuccess = () => resolve(request)
        request.onerror = (event) => reject(event.target.error);
    })
}

export function createPhotoAlbum(transaction,objectStore, newAlbumObject : object) {
    return PromiseWrapper((resolve,reject) => {
          console.log('adding new album',newAlbumObject)
      
          // Generate a UUID and add the item with that ID
          let id = uuidv4();  // Generate a UUID
          let objectStoreItem = { albumID: id, ...newAlbumObject }
          objectStore.add(objectStoreItem);
      
          transaction.oncomplete = function() {
              console.log("Item added successfully with a UUID");
              resolve(objectStoreItem)
            };
          
            transaction.onerror = function() {
              console.log("Error adding item");
              reject({error: true})
            };

    })
}

export function getPhotoAlbums(objectStore, albumID ?: string) {
    return PromiseWrapper((resolve,reject) => {
        let getRequest;
        if (!albumID) {
            getRequest = objectStore.getAll()
        } else {
            // get specific id
            const index = objectStore.index('albumID')
            getRequest = index.getAll(albumID);
        }

        getRequest.onsuccess = function (event) {
            resolve(event.target.result)
        };

        getRequest.onerror = (event) => {
            console.error('Error fetching data from store:', event.target.error);
            reject(event.target.error);
        };
    })
}

export function PromiseWrapper(childFunction) {
    return new Promise((resolve,reject) => {
        childFunction(resolve,reject)
    })
}