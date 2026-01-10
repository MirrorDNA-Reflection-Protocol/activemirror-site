import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Demo from './pages/Demo';
import Legal from './pages/Legal';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import TestLab from './pages/TestLab';
import Hub from './pages/Hub';
import Confessions from './pages/Confessions';

export default function App() {
    return (
        // Handling GitHub Pages routing quirks if any. 
        // Assuming Custom Domain activemirror.ai is Root.
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/legal" element={<Legal />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/mirror" element={<Demo />} />
                <Route path="/lab" element={<TestLab />} />
                <Route path="/hub" element={<Hub />} />
                <Route path="/confessions" element={<Confessions />} />
            </Routes>
        </BrowserRouter>
    );
}
