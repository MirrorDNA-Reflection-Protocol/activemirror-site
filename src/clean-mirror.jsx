import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import Demo from './pages/Demo'
import './index.css'

// Wrapper to inject the MPA Badge for verification
function CleanMirrorApp() {
    return (
        <BrowserRouter>
            <div className="fixed top-28 right-4 z-50 pointer-events-none opacity-50">
                <div className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-1 rounded text-xs font-mono">
                    MPA MODE
                </div>
            </div>
            <Demo />
        </BrowserRouter>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <CleanMirrorApp />
    </React.StrictMode>,
)
