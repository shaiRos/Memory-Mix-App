
import { useEffect, useState } from "react"
import { useIndexDB } from "../../utils/IndexDBContext"
import { useMainAppContext } from "../../utils/MainAppContext";
import NearbyPlaces from "./NearbyPlaces";

import PhotoGalleryExplore from "./PhotoGalleryExplore";
// const dbscan = require('ml-dbscan');


export default function ExploreSidebarContent() {


    return (
        <div className="sidebar-page flex flex-col h-full gap-3 min-w-[500px]">
            <NearbyPlaces />
            <PhotoGalleryExplore />
        </div>
    )

}

