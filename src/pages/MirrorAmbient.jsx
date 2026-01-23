/**
 * ⟡ MIRROR AMBIENT — 2030 Vision
 * Simplified for reliability
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, ArrowLeft, Volume2, Send } from 'lucide-react';

const PROXY_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8082'
    : 'https://proxy.activemirror.ai';

// Time-aware colors
const getAtmosphere = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { primary: '#f59e0b', secondary: '#8b5cf6', phase: 'morning' };
    if (hour >= 12 && hour < 17) return { primary: '#f97316', secondary: '#ec4899', phase: 'afternoon' };
    if (hour >= 17 && hour < 21) return { primary: '#ef4444', secondary: '#8b5cf6', phase: 'evening' };
    return { primary: '#8b5cf6', secondary: '#06b6d4', phase: 'night' };
};

const MirrorAmbient = () => {
    const [atmosphere] = useState(getAtmosphere);
    const [mode, setMode] = useState('idle'); // idle, ready, loading, done
    const [input, setInput] = useState('');
    const [userMessage, setUserMessage] = useState('');
    const [prism, setPrism] = useState(null);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);

    // Focus input when ready
    useEffect(() => {
        if (mode === 'ready' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [mode]);

    const handleOrbTap = () => {
        if (mode === 'idle') {
            setMode('ready');
        } else if (mode === 'done') {
            setPrism(null);
            setUserMessage('');
            setError(null);
            setMode('ready');
        }
    };

    const handleSubmit = async () => {
        const text = input.trim();
        if (!text) return;

        setUserMessage(text);
        setInput('');
        setMode('loading');
        setError(null);

        try {
            const res = await fetch(`${PROXY_URL}/mirror-prism`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, lens: 'divergent' }),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();

            if (data.prism) {
                setPrism(data.prism);
                setMode('done');
            } else {
                throw new Error('No prism returned');
            }
        } catch (err) {
            console.error('API Error:', err);
            setError(err.message);
            setMode('ready');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="fixed inset-0 bg-black flex flex-col" style={{ height: '100dvh' }}>
            {/* Background gradient */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    background: `radial-gradient(circle at 50% 30%, ${atmosphere.primary}40, transparent 60%)`
                }}
            />

            {/* Header */}
            <header className="relative z-20 flex items-center justify-between p-4">
                <a href="/" className="p-2 rounded-full bg-white/10 text-white/60">
                    <ArrowLeft size={20} />
                </a>
                <span className="text-white/20 text-xs uppercase tracking-widest">{atmosphere.phase}</span>
            </header>

            {/* Main area */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">

                {/* IDLE: Show orb */}
                {mode === 'idle' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <motion.button
                            onClick={handleOrbTap}
                            whileTap={{ scale: 0.95 }}
                            className="w-32 h-32 rounded-full flex items-center justify-center text-5xl"
                            style={{
                                background: `radial-gradient(circle at 30% 30%, ${atmosphere.primary}30, ${atmosphere.secondary}20, transparent)`,
                                boxShadow: `0 0 60px ${atmosphere.primary}40`,
                                border: `1px solid ${atmosphere.primary}40`,
                            }}
                        >
                            <motion.span
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                style={{ color: atmosphere.primary, textShadow: `0 0 20px ${atmosphere.primary}` }}
                            >
                                ⟡
                            </motion.span>
                        </motion.button>
                        <p className="text-white/40 text-sm">Touch to begin</p>
                    </motion.div>
                )}

                {/* READY: Show input */}
                {mode === 'ready' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-md flex flex-col items-center gap-6"
                    >
                        <motion.span
                            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="text-4xl"
                            style={{ color: atmosphere.primary, textShadow: `0 0 30px ${atmosphere.primary}` }}
                        >
                            ⟡
                        </motion.span>

                        <p className="text-white/60 text-center">What's on your mind?</p>

                        {error && (
                            <p className="text-red-400 text-sm text-center">Error: {error}</p>
                        )}

                        <div className="w-full relative">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Speak your truth..."
                                className="w-full px-4 py-3 pr-14 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 resize-none focus:outline-none focus:border-white/30"
                                style={{ minHeight: '56px', maxHeight: '120px' }}
                                rows={2}
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={!input.trim()}
                                className="absolute right-2 bottom-2 p-2 rounded-xl bg-white/10 text-white/60 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <Send size={20} />
                            </button>
                        </div>

                        <p className="text-white/20 text-xs">Press Enter to reflect</p>
                    </motion.div>
                )}

                {/* LOADING: Processing */}
                {mode === 'loading' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
                            style={{
                                background: `radial-gradient(circle, ${atmosphere.primary}30, transparent)`,
                                boxShadow: `0 0 40px ${atmosphere.primary}30`,
                            }}
                        >
                            <span style={{ color: atmosphere.primary }}>⟡</span>
                        </motion.div>
                        <motion.p
                            animate={{ opacity: [0.4, 0.8, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-white/50 text-sm"
                        >
                            Refracting your thought...
                        </motion.p>
                    </motion.div>
                )}

                {/* DONE: Show prism */}
                {mode === 'done' && prism && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-lg px-2"
                    >
                        {/* What you said */}
                        <div className="text-center mb-8">
                            <p className="text-white/30 text-xs uppercase tracking-widest mb-2">You said</p>
                            <p className="text-white text-lg">"{userMessage}"</p>
                        </div>

                        {/* Three perspectives */}
                        <div className="space-y-4">
                            {/* Said */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="p-4 rounded-2xl"
                                style={{
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    border: '1px solid rgba(59, 130, 246, 0.2)'
                                }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                                    <span className="text-blue-400 text-xs uppercase tracking-wider">Said</span>
                                </div>
                                <p className="text-white/80 text-sm">{prism.said}</p>
                            </motion.div>

                            {/* Unsaid */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="p-4 rounded-2xl"
                                style={{
                                    background: 'rgba(217, 70, 239, 0.1)',
                                    border: '1px solid rgba(217, 70, 239, 0.2)'
                                }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-fuchsia-400" />
                                    <span className="text-fuchsia-400 text-xs uppercase tracking-wider">Unsaid</span>
                                </div>
                                <p className="text-white/80 text-sm italic">{prism.unsaid}</p>
                            </motion.div>

                            {/* Future You */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                                className="p-4 rounded-2xl"
                                style={{
                                    background: 'rgba(245, 158, 11, 0.1)',
                                    border: '1px solid rgba(245, 158, 11, 0.2)'
                                }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                                    <span className="text-amber-400 text-xs uppercase tracking-wider">Future You</span>
                                </div>
                                <p className="text-white/80 text-sm">{prism.futureYou}</p>
                            </motion.div>

                            {/* Tangent if exists */}
                            {prism.tangent && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="text-center pt-4"
                                >
                                    <p className="text-violet-400/60 text-xs">⚡ {prism.tangent}</p>
                                </motion.div>
                            )}
                        </div>

                        {/* Reflect again */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="text-center mt-8"
                        >
                            <button
                                onClick={handleOrbTap}
                                className="text-white/30 text-sm hover:text-white/60 transition-colors"
                            >
                                ↻ Reflect again
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default MirrorAmbient;
