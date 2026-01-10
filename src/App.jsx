import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Demo from './pages/Demo';
import Mirror from './pages/Mirror';
import MirrorWithAuth from './pages/MirrorWithAuth';
import Pricing from './pages/Pricing';
import Legal from './pages/Legal';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import TestLab from './pages/TestLab';
import Hub from './pages/Hub';
import Confessions from './pages/Confessions';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/legal" element={<Legal />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/mirror" element={<MirrorWithAuth />} />
                <Route path="/reflect" element={<Mirror />} />
                <Route path="/demo" element={<Demo />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/lab" element={<TestLab />} />
                <Route path="/hub" element={<Hub />} />
                <Route path="/confessions" element={<Confessions />} />
            </Routes>
        </BrowserRouter>
    );
}
