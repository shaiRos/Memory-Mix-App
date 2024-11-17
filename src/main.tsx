import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {IndexDBProvider} from './utils/IndexDBContext.tsx'

import "@fontsource/lexend-deca"; // Defaults to weight 400
import { MainAppContextProvider } from './utils/MainAppContext.tsx'
// import "@fontsource/lexend-deca/400.css"; // Specify weight
// import "@fontsource/lexend-deca/400-italic.css"; // Specify weight and style

createRoot(document.getElementById('root')!).render(
    <MainAppContextProvider>
        <IndexDBProvider>
            <App />
        </IndexDBProvider>
    </MainAppContextProvider>
)
