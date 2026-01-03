import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Demo from './pages/Demo';
import Legal from './pages/Legal';

export default function App() {
    return (
        // Handling GitHub Pages routing quirks if any. 
        // Assuming Custom Domain activemirror.ai is Root.
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/legal" element={<Legal />} />
                <Route path="/demo" element={<Demo />} />
            </Routes>
        </BrowserRouter>
    );
}
