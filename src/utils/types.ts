

export type PhotoObject = {
    photoBlob: Blob,
    smallPreviewBlob: Blob,
    location : {lat : number, lng: number} | null, 
    altitude: number | null,
    locationInput: 'metadata' | 'manual-input' | null,
    CreateDate: Date,
    UploadDate: Date,
    originalFileName: string
}

export type PhotoAlbum = {
    albumID: string,
    displayName: string,
    description?: ''
}