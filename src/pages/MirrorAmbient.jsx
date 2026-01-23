/**
 * ⟡ MIRROR AMBIENT — 2030 Vision
 *
 * Not a chat. An emergence.
 * The reflection blooms from your words like light through a prism.
 *
 * Design Principles:
 * - Zero chrome until needed
 * - Voice-first, type-optional
 * - Time-aware atmosphere
 * - Single focal point
 * - Organic animation, not boxes
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, ArrowLeft, Volume2, VolumeX } from 'lucide-react';

const PROXY_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8082'
    : 'https://proxy.activemirror.ai';

// ═══════════════════════════════════════════════════════════════
// TIME-AWARE ATMOSPHERE
// ═══════════════════════════════════════════════════════════════

const getTimeAtmosphere = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 8) return { phase: 'dawn', primary: '#f59e0b', secondary: '#7c3aed', bg: 'from-amber-950/20 via-black to-violet-950/10' };
    if (hour >= 8 && hour < 12) return { phase: 'morning', primary: '#fbbf24', secondary: '#3b82f6', bg: 'from-amber-900/10 via-black to-blue-950/10' };
    if (hour >= 12 && hour < 17) return { phase: 'afternoon', primary: '#f97316', secondary: '#8b5cf6', bg: 'from-orange-950/10 via-black to-violet-950/10' };
    if (hour >= 17 && hour < 20) return { phase: 'evening', primary: '#ef4444', secondary: '#ec4899', bg: 'from-red-950/15 via-black to-pink-950/10' };
    if (hour >= 20 && hour < 23) return { phase: 'night', primary: '#8b5cf6', secondary: '#06b6d4', bg: 'from-violet-950/20 via-black to-cyan-950/10' };
    return { phase: 'midnight', primary: '#6366f1', secondary: '#14b8a6', bg: 'from-indigo-950/20 via-black to-teal-950/10' };
};

// ═══════════════════════════════════════════════════════════════
// CENTRAL ORB — The Prism Core
// ═══════════════════════════════════════════════════════════════

const PrismOrb = ({ isActive, isListening, isProcessing, atmosphere }) => (
    <div className="relative">
        {/* Outer glow */}
        <motion.div
            className="absolute inset-0 rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${atmosphere.primary}40, transparent 70%)` }}
            animate={{
                scale: isListening ? [1, 1.3, 1] : isProcessing ? [1, 1.1, 1] : [1, 1.05, 1],
                opacity: isActive ? [0.4, 0.7, 0.4] : [0.2, 0.3, 0.2],
            }}
            transition={{ duration: isListening ? 1 : 3, repeat: Infinity }}
        />

        {/* Inner orb */}
        <motion.div
            className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full"
            style={{
                background: `radial-gradient(circle at 30% 30%, ${atmosphere.primary}30, ${atmosphere.secondary}20, transparent)`,
                boxShadow: `0 0 60px ${atmosphere.primary}30, inset 0 0 40px ${atmosphere.secondary}20`,
                border: `1px solid ${atmosphere.primary}30`,
            }}
            animate={{
                scale: isProcessing ? [1, 0.95, 1] : 1,
            }}
            transition={{ duration: 0.5, repeat: isProcessing ? Infinity : 0 }}
        >
            {/* Glass reflection */}
            <div
                className="absolute inset-2 rounded-full"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
                }}
            />

            {/* Center symbol */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center text-4xl sm:text-5xl"
                animate={{
                    opacity: [0.6, 1, 0.6],
                    rotate: isProcessing ? 360 : 0,
                }}
                transition={{
                    opacity: { duration: 3, repeat: Infinity },
                    rotate: { duration: 8, repeat: Infinity, ease: 'linear' }
                }}
                style={{
                    color: atmosphere.primary,
                    textShadow: `0 0 30px ${atmosphere.primary}`,
                    filter: 'brightness(1.2)',
                }}
            >
                ⟡
            </motion.div>
        </motion.div>

        {/* Listening indicator */}
        <AnimatePresence>
            {isListening && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1"
                >
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-1 rounded-full"
                            style={{ background: atmosphere.primary }}
                            animate={{ height: [8, 24, 8] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                        />
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

// ═══════════════════════════════════════════════════════════════
// EMERGENCE — The Reflection Bloom
// ═══════════════════════════════════════════════════════════════

const ReflectionEmergence = ({ userMessage, prism, atmosphere, onSpeak }) => {
    const { said, unsaid, futureYou } = prism || {};

    const perspectives = [
        { key: 'said', label: 'What you said', content: said, color: '#3b82f6', angle: -30, delay: 0 },
        { key: 'unsaid', label: 'What remained unsaid', content: unsaid, color: '#d946ef', angle: 0, delay: 0.2 },
        { key: 'future', label: 'Your future self reflects', content: futureYou, color: '#f59e0b', angle: 30, delay: 0.4 },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl mx-auto px-4"
        >
            {/* User's words - the source of light */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <p className="text-white/40 text-xs uppercase tracking-[0.3em] mb-3">You spoke</p>
                <p className="text-white text-lg sm:text-xl font-light leading-relaxed max-w-lg mx-auto">
                    "{userMessage}"
                </p>
            </motion.div>

            {/* The Emergence - perspectives bloom outward */}
            <div className="relative min-h-[400px] flex items-center justify-center">
                {/* Central light source */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute w-4 h-4 rounded-full"
                    style={{
                        background: `radial-gradient(circle, white, ${atmosphere.primary})`,
                        boxShadow: `0 0 40px ${atmosphere.primary}`,
                    }}
                />

                {/* Light rays */}
                {perspectives.map((p, i) => (
                    <motion.div
                        key={p.key}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: p.delay + 0.3, duration: 0.6 }}
                        className="absolute w-full max-w-xs"
                        style={{
                            transform: `translateY(${i === 1 ? '-140px' : '80px'}) translateX(${i === 0 ? '-45%' : i === 2 ? '45%' : '0'})`,
                        }}
                    >
                        {/* Light beam */}
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: i === 1 ? 100 : 60 }}
                            transition={{ delay: p.delay, duration: 0.4 }}
                            className="absolute left-1/2 -translate-x-1/2 w-px"
                            style={{
                                background: `linear-gradient(to ${i === 1 ? 'top' : 'bottom'}, ${p.color}80, transparent)`,
                                bottom: i === 1 ? '100%' : 'auto',
                                top: i === 1 ? 'auto' : '100%',
                            }}
                        />

                        {/* Perspective card - glass morphism */}
                        <motion.div
                            whileHover={{ scale: 1.02, y: -4 }}
                            className="relative p-5 rounded-2xl cursor-pointer group"
                            style={{
                                background: `linear-gradient(135deg, ${p.color}15, ${p.color}05)`,
                                border: `1px solid ${p.color}30`,
                                backdropFilter: 'blur(20px)',
                            }}
                            onClick={() => onSpeak(p.content)}
                        >
                            {/* Glow effect */}
                            <div
                                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{ boxShadow: `0 0 40px ${p.color}30` }}
                            />

                            {/* Header */}
                            <div className="flex items-center gap-2 mb-3">
                                <motion.div
                                    className="w-2 h-2 rounded-full"
                                    style={{ background: p.color }}
                                    animate={{ scale: [1, 1.3, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                                <span className="text-xs uppercase tracking-wider" style={{ color: p.color }}>
                                    {p.label}
                                </span>
                                <Volume2
                                    size={12}
                                    className="ml-auto opacity-0 group-hover:opacity-50 transition-opacity"
                                    style={{ color: p.color }}
                                />
                            </div>

                            {/* Content */}
                            <p className="text-white/80 text-sm leading-relaxed">
                                {p.content || '...'}
                            </p>
                        </motion.div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════
// AMBIENT INPUT — Appears when needed
// ═══════════════════════════════════════════════════════════════

const AmbientInput = ({ value, onChange, onSubmit, onVoice, isListening, atmosphere, inputRef }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl mx-auto px-4"
    >
        <div
            className="relative rounded-2xl overflow-hidden"
            style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
            }}
        >
            <textarea
                ref={inputRef}
                value={value}
                onChange={e => onChange(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmit(); } }}
                placeholder="Speak your truth..."
                className="w-full px-5 py-4 pr-24 bg-transparent text-white placeholder-white/30 resize-none focus:outline-none text-base"
                style={{ minHeight: '56px', maxHeight: '120px' }}
                rows={1}
            />

            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {/* Voice button */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onVoice}
                    className={`p-3 rounded-xl transition-all ${
                        isListening
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                    }`}
                    style={isListening ? { boxShadow: '0 0 20px rgba(239,68,68,0.3)' } : {}}
                >
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </motion.button>

                {/* Submit button */}
                {value.trim() && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onSubmit}
                        className="p-3 rounded-xl"
                        style={{
                            background: `linear-gradient(135deg, ${atmosphere.primary}40, ${atmosphere.secondary}40)`,
                            border: `1px solid ${atmosphere.primary}50`,
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" />
                        </svg>
                    </motion.button>
                )}
            </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-3">
            Press Enter to reflect · Click mic to speak
        </p>
    </motion.div>
);

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

const MirrorAmbient = () => {
    const [atmosphere, setAtmosphere] = useState(getTimeAtmosphere);
    const [phase, setPhase] = useState('waiting'); // waiting, input, processing, reflecting
    const [input, setInput] = useState('');
    const [userMessage, setUserMessage] = useState('');
    const [prism, setPrism] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const inputRef = useRef(null);
    const recognitionRef = useRef(null);

    // Update atmosphere every minute
    useEffect(() => {
        const interval = setInterval(() => setAtmosphere(getTimeAtmosphere()), 60000);
        return () => clearInterval(interval);
    }, []);

    // Initialize speech recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                setInput(transcript);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const toggleVoice = useCallback(() => {
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
            setPhase('input');
        }
    }, [isListening]);

    const speak = useCallback((text) => {
        if (!voiceEnabled || !text) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
    }, [voiceEnabled]);

    const handleSubmit = useCallback(async () => {
        if (!input.trim()) return;

        const message = input.trim();
        setUserMessage(message);
        setInput('');
        setPhase('processing');

        try {
            const response = await fetch(`${PROXY_URL}/mirror-prism`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, lens: 'divergent' }),
            });

            if (!response.ok) throw new Error('API error');

            const data = await response.json();
            if (data.prism) {
                setPrism(data.prism);
                setPhase('reflecting');
            } else {
                throw new Error('No prism in response');
            }
        } catch (error) {
            console.error('Prism error:', error);
            // Show error state briefly then return to input
            setPhase('input');
        }
    }, [input]);

    const handleOrbClick = () => {
        if (phase === 'waiting') {
            setPhase('input');
            setTimeout(() => inputRef.current?.focus(), 100);
        } else if (phase === 'reflecting') {
            setPrism(null);
            setUserMessage('');
            setPhase('input');
        }
    };

    const handleBack = () => {
        if (phase === 'reflecting') {
            setPrism(null);
            setUserMessage('');
            setPhase('input');
        } else {
            window.location.href = '/';
        }
    };

    return (
        <div
            className="fixed inset-0 flex flex-col overflow-hidden"
            style={{ height: '100dvh' }}
        >
            {/* Atmospheric background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${atmosphere.bg} transition-all duration-[3000ms]`} />
            <div className="absolute inset-0 bg-black/40" />

            {/* Ambient particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full"
                        style={{
                            background: i % 2 === 0 ? atmosphere.primary : atmosphere.secondary,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            filter: 'blur(1px)',
                        }}
                        animate={{
                            y: [0, -100, 0],
                            opacity: [0, 0.6, 0],
                        }}
                        transition={{
                            duration: 8 + Math.random() * 4,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                        }}
                    />
                ))}
            </div>

            {/* Minimal header */}
            <header className="relative z-10 flex items-center justify-between p-4">
                <button
                    onClick={handleBack}
                    className="p-2 rounded-full bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all"
                >
                    <ArrowLeft size={20} />
                </button>

                <motion.button
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`p-2 rounded-full transition-all ${voiceEnabled ? 'bg-white/5 text-white/50' : 'bg-white/10 text-white/30'}`}
                    whileTap={{ scale: 0.9 }}
                >
                    {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </motion.button>
            </header>

            {/* Main content area */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center min-h-0 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {(phase === 'waiting' || phase === 'input' || phase === 'processing') && !prism && (
                        <motion.div
                            key="orb"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex flex-col items-center gap-8"
                        >
                            {/* The Orb */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleOrbClick}
                                className="cursor-pointer"
                            >
                                <PrismOrb
                                    isActive={phase !== 'waiting'}
                                    isListening={isListening}
                                    isProcessing={phase === 'processing'}
                                    atmosphere={atmosphere}
                                />
                            </motion.div>

                            {/* Instruction text */}
                            <AnimatePresence mode="wait">
                                {phase === 'waiting' && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-white/30 text-sm"
                                    >
                                        Touch to begin
                                    </motion.p>
                                )}
                                {phase === 'processing' && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="text-white/50 text-sm"
                                    >
                                        Refracting your thought...
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {phase === 'reflecting' && prism && (
                        <motion.div
                            key="reflection"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full"
                        >
                            <ReflectionEmergence
                                userMessage={userMessage}
                                prism={prism}
                                atmosphere={atmosphere}
                                onSpeak={speak}
                            />

                            {/* Reflect again prompt */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.5 }}
                                className="text-center mt-8"
                            >
                                <button
                                    onClick={handleOrbClick}
                                    className="text-white/30 text-sm hover:text-white/50 transition-colors"
                                >
                                    ↻ Reflect on something else
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Input area - slides up when active */}
            <AnimatePresence>
                {(phase === 'input' || isListening) && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="relative z-10 pb-4 sm:pb-6"
                        style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
                    >
                        <AmbientInput
                            value={input}
                            onChange={setInput}
                            onSubmit={handleSubmit}
                            onVoice={toggleVoice}
                            isListening={isListening}
                            atmosphere={atmosphere}
                            inputRef={inputRef}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Time indicator */}
            <div className="absolute bottom-4 left-4 text-white/10 text-[10px] uppercase tracking-widest">
                {atmosphere.phase}
            </div>
        </div>
    );
};

export default MirrorAmbient;
