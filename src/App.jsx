import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Demo from './pages/Demo';
import MirrorPage from './pages/MirrorPage';
import MirrorWithAuth from './pages/MirrorWithAuth';
import Pricing from './pages/Pricing';
import Legal from './pages/Legal';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Trust from './pages/Trust';
import TestLab from './pages/TestLab';
import Hub from './pages/Hub';
import Confessions from './pages/Confessions';
import NotFound from './pages/NotFound';
import MirrorAmbient from './pages/MirrorAmbient';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/preview" element={<Landing />} />
                <Route path="/legal" element={<Legal />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/trust" element={<Trust />} />
                <Route path="/mirror" element={<MirrorPage />} />
                <Route path="/mirror-beta" element={<MirrorWithAuth />} />
                <Route path="/demo" element={<Demo />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/lab" element={<TestLab />} />
                <Route path="/hub" element={<Hub />} />
                <Route path="/confessions" element={<Confessions />} />
                <Route path="/ambient" element={<MirrorAmbient />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}
