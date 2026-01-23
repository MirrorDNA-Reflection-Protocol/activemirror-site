/**
 * ⟡ MIRROR AMBIENT — 2030 Vision
 * Breakthrough Features:
 * - Sentiment-aware atmosphere (colors shift with emotion)
 * - Particle field responsive to interaction
 * - Emergent typography (character-by-character reveal)
 * - Haptic feedback on mobile
 * - Memory echoes of past reflections
 * - Breath-synced animations
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';

const PROXY_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8082'
    : 'https://proxy.activemirror.ai';

// Sentiment analysis - detects emotional tone from text
const analyzeSentiment = (text) => {
    const lower = text.toLowerCase();

    const emotions = {
        joy: ['happy', 'excited', 'love', 'wonderful', 'amazing', 'great', 'joy', 'grateful', 'blessed', 'thrilled', 'delighted'],
        sadness: ['sad', 'depressed', 'lonely', 'hurt', 'pain', 'crying', 'miss', 'lost', 'grief', 'heartbreak', 'empty'],
        anger: ['angry', 'furious', 'frustrated', 'hate', 'annoyed', 'mad', 'irritated', 'pissed', 'rage'],
        fear: ['scared', 'afraid', 'anxious', 'worried', 'nervous', 'panic', 'terrified', 'dread', 'uncertain'],
        hope: ['hope', 'dream', 'wish', 'want', 'future', 'maybe', 'possible', 'believe', 'aspire'],
        calm: ['peaceful', 'calm', 'relaxed', 'content', 'serene', 'quiet', 'still', 'centered'],
        curiosity: ['wonder', 'curious', 'what if', 'why', 'how', 'think', 'question', 'explore', 'understand'],
        confusion: ['confused', 'lost', 'unsure', 'dont know', "don't know", 'unclear', 'stuck', 'overwhelmed']
    };

    let detected = 'neutral';
    let maxScore = 0;

    for (const [emotion, words] of Object.entries(emotions)) {
        const score = words.filter(w => lower.includes(w)).length;
        if (score > maxScore) {
            maxScore = score;
            detected = emotion;
        }
    }

    return detected;
};

// Emotion-to-atmosphere mapping
const emotionAtmospheres = {
    joy: { primary: '#fbbf24', secondary: '#f97316', glow: 'rgba(251, 191, 36, 0.3)' },
    sadness: { primary: '#3b82f6', secondary: '#6366f1', glow: 'rgba(59, 130, 246, 0.3)' },
    anger: { primary: '#ef4444', secondary: '#f97316', glow: 'rgba(239, 68, 68, 0.3)' },
    fear: { primary: '#8b5cf6', secondary: '#6366f1', glow: 'rgba(139, 92, 246, 0.3)' },
    hope: { primary: '#10b981', secondary: '#06b6d4', glow: 'rgba(16, 185, 129, 0.3)' },
    calm: { primary: '#06b6d4', secondary: '#8b5cf6', glow: 'rgba(6, 182, 212, 0.3)' },
    curiosity: { primary: '#f59e0b', secondary: '#ec4899', glow: 'rgba(245, 158, 11, 0.3)' },
    confusion: { primary: '#a855f7', secondary: '#6366f1', glow: 'rgba(168, 85, 247, 0.3)' },
    neutral: { primary: '#8b5cf6', secondary: '#06b6d4', glow: 'rgba(139, 92, 246, 0.3)' }
};

// Time-aware base atmosphere
const getTimeAtmosphere = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 8) return { phase: 'dawn', base: '#f59e0b' };
    if (hour >= 8 && hour < 12) return { phase: 'morning', base: '#fbbf24' };
    if (hour >= 12 && hour < 17) return { phase: 'afternoon', base: '#f97316' };
    if (hour >= 17 && hour < 20) return { phase: 'evening', base: '#ef4444' };
    if (hour >= 20 && hour < 23) return { phase: 'night', base: '#8b5cf6' };
    return { phase: 'midnight', base: '#6366f1' };
};

// Haptic feedback
const haptic = (pattern = 'light') => {
    if (!navigator.vibrate) return;
    const patterns = {
        light: [10],
        medium: [20],
        heavy: [40],
        success: [10, 50, 10, 50, 30],
        reveal: [5, 30, 5, 30, 5, 30, 10]
    };
    navigator.vibrate(patterns[pattern] || patterns.light);
};

// Floating particle component
const Particle = ({ delay, atmosphere }) => {
    const size = Math.random() * 4 + 2;
    const startX = Math.random() * 100;
    const duration = Math.random() * 20 + 15;

    return (
        <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
                width: size,
                height: size,
                left: `${startX}%`,
                background: atmosphere.primary,
                boxShadow: `0 0 ${size * 2}px ${atmosphere.primary}40`
            }}
            initial={{ y: '100vh', opacity: 0 }}
            animate={{
                y: '-100vh',
                opacity: [0, 0.6, 0.6, 0],
                x: [0, Math.random() * 50 - 25, Math.random() * 50 - 25, 0]
            }}
            transition={{
                duration,
                delay,
                repeat: Infinity,
                ease: 'linear'
            }}
        />
    );
};

// Character-by-character text reveal
const EmergentText = ({ text, delay = 0, className = '', onComplete }) => {
    const [revealed, setRevealed] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (!text) return;
        setRevealed('');
        setIsComplete(false);

        let i = 0;
        const timer = setTimeout(() => {
            const interval = setInterval(() => {
                if (i < text.length) {
                    setRevealed(text.slice(0, i + 1));
                    i++;
                    // Subtle haptic on punctuation
                    if (['.', '!', '?', ','].includes(text[i - 1])) {
                        haptic('light');
                    }
                } else {
                    clearInterval(interval);
                    setIsComplete(true);
                    onComplete?.();
                }
            }, 25 + Math.random() * 15); // Variable speed for organic feel

            return () => clearInterval(interval);
        }, delay);

        return () => clearTimeout(timer);
    }, [text, delay]);

    return (
        <span className={className}>
            {revealed}
            {!isComplete && <span className="animate-pulse">▋</span>}
        </span>
    );
};

// Memory echo - fading trace of past input
const MemoryEcho = ({ text, atmosphere }) => (
    <motion.div
        initial={{ opacity: 0.4, scale: 1, y: 0 }}
        animate={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 3 }}
        className="absolute text-center pointer-events-none"
        style={{ color: atmosphere.primary }}
    >
        "{text}"
    </motion.div>
);

const MirrorAmbient = () => {
    const [timeAtmosphere] = useState(getTimeAtmosphere);
    const [emotionAtmosphere, setEmotionAtmosphere] = useState(emotionAtmospheres.neutral);
    const [mode, setMode] = useState('idle');
    const [input, setInput] = useState('');
    const [userMessage, setUserMessage] = useState('');
    const [prism, setPrism] = useState(null);
    const [error, setError] = useState(null);
    const [memoryEchoes, setMemoryEchoes] = useState([]);
    const [revealPhase, setRevealPhase] = useState(0);
    const inputRef = useRef(null);
    const echoIdRef = useRef(0);

    // Generate particles
    const particles = useMemo(() =>
        Array.from({ length: 20 }, (_, i) => ({
            id: i,
            delay: i * 0.8
        }))
    , []);

    // Blend time + emotion atmospheres
    const atmosphere = useMemo(() => ({
        ...emotionAtmosphere,
        phase: timeAtmosphere.phase
    }), [emotionAtmosphere, timeAtmosphere]);

    useEffect(() => {
        if (mode === 'ready' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [mode]);

    // Analyze input sentiment in real-time
    useEffect(() => {
        if (input.length > 10) {
            const emotion = analyzeSentiment(input);
            setEmotionAtmosphere(emotionAtmospheres[emotion]);
        }
    }, [input]);

    const handleOrbTap = () => {
        haptic('medium');
        if (mode === 'idle') {
            setMode('ready');
        } else if (mode === 'done') {
            // Add memory echo before clearing
            setMemoryEchoes(prev => [...prev.slice(-3), {
                id: echoIdRef.current++,
                text: userMessage.slice(0, 50)
            }]);
            setPrism(null);
            setUserMessage('');
            setError(null);
            setRevealPhase(0);
            setMode('ready');
        }
    };

    const handleSubmit = async () => {
        const text = input.trim();
        if (!text) return;

        haptic('medium');

        // Final sentiment analysis
        const emotion = analyzeSentiment(text);
        setEmotionAtmosphere(emotionAtmospheres[emotion]);

        setUserMessage(text);
        setInput('');
        setPrism(null);
        setMode('loading');
        setError(null);
        setRevealPhase(0);

        try {
            const res = await fetch(`${PROXY_URL}/mirror-prism`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, lens: 'divergent' }),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();

            if (data.prism) {
                haptic('success');
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
        <div className="fixed inset-0 bg-black flex flex-col overflow-hidden" style={{ height: '100dvh' }}>
            {/* Particle field */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {particles.map(p => (
                    <Particle key={p.id} delay={p.delay} atmosphere={atmosphere} />
                ))}
            </div>

            {/* Dynamic gradient background */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{
                    background: `radial-gradient(circle at 50% 30%, ${atmosphere.primary}30, transparent 60%)`
                }}
                transition={{ duration: 1.5 }}
            />

            {/* Ambient glow that responds to emotion */}
            <motion.div
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none blur-[100px]"
                animate={{
                    backgroundColor: atmosphere.glow,
                    scale: mode === 'loading' ? [1, 1.2, 1] : 1
                }}
                transition={{
                    backgroundColor: { duration: 1.5 },
                    scale: { duration: 2, repeat: mode === 'loading' ? Infinity : 0 }
                }}
            />

            {/* Header */}
            <header className="relative z-20 flex items-center justify-between p-4">
                <a href="/" className="p-2 rounded-full bg-white/10 text-white/60 active:scale-95 transition-transform">
                    <ArrowLeft size={20} />
                </a>
                <div className="flex items-center gap-2">
                    <Sparkles size={12} style={{ color: atmosphere.primary }} className="animate-pulse" />
                    <span className="text-white/20 text-xs uppercase tracking-widest">{atmosphere.phase}</span>
                </div>
            </header>

            {/* Memory echoes */}
            <div className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-md">
                <AnimatePresence>
                    {memoryEchoes.map(echo => (
                        <MemoryEcho key={echo.id} text={echo.text} atmosphere={atmosphere} />
                    ))}
                </AnimatePresence>
            </div>

            {/* Main area */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">

                {/* IDLE: Breathing orb */}
                {mode === 'idle' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <motion.button
                            onClick={handleOrbTap}
                            whileTap={{ scale: 0.95 }}
                            className="relative w-36 h-36 rounded-full flex items-center justify-center"
                        >
                            {/* Outer ring - breath sync (4-7-8 pattern: 4s in, 7s hold, 8s out) */}
                            <motion.div
                                className="absolute inset-0 rounded-full"
                                style={{ border: `1px solid ${atmosphere.primary}40` }}
                                animate={{
                                    scale: [1, 1.1, 1.1, 1],
                                    opacity: [0.3, 0.6, 0.6, 0.3]
                                }}
                                transition={{
                                    duration: 19, // 4+7+8
                                    times: [0, 0.21, 0.58, 1], // 4/19, 11/19, 19/19
                                    repeat: Infinity,
                                    ease: 'easeInOut'
                                }}
                            />

                            {/* Inner glow */}
                            <div
                                className="absolute inset-4 rounded-full blur-xl"
                                style={{ background: `${atmosphere.primary}20` }}
                            />

                            {/* Core orb */}
                            <motion.div
                                className="w-32 h-32 rounded-full flex items-center justify-center text-5xl"
                                style={{
                                    background: `radial-gradient(circle at 30% 30%, ${atmosphere.primary}40, ${atmosphere.secondary}20, transparent)`,
                                    boxShadow: `0 0 60px ${atmosphere.primary}40, inset 0 0 30px ${atmosphere.primary}20`
                                }}
                                animate={{
                                    scale: [1, 1.02, 1],
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <motion.span
                                    animate={{ opacity: [0.6, 1, 0.6] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    style={{
                                        color: atmosphere.primary,
                                        textShadow: `0 0 30px ${atmosphere.primary}`
                                    }}
                                >
                                    ⟡
                                </motion.span>
                            </motion.div>
                        </motion.button>

                        <motion.p
                            className="text-white/40 text-sm"
                            animate={{ opacity: [0.4, 0.7, 0.4] }}
                            transition={{ duration: 4, repeat: Infinity }}
                        >
                            Touch to begin
                        </motion.p>
                    </motion.div>
                )}

                {/* READY: Input state */}
                {mode === 'ready' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-4"
                    >
                        <motion.span
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.5, 0.8, 0.5],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="text-5xl"
                            style={{
                                color: atmosphere.primary,
                                textShadow: `0 0 40px ${atmosphere.primary}`
                            }}
                        >
                            ⟡
                        </motion.span>

                        <p className="text-white/50 text-center text-lg">What's moving through you?</p>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-red-400 text-sm text-center"
                            >
                                {error}
                            </motion.p>
                        )}

                        <p className="text-white/20 text-xs">Speak below ↓</p>
                    </motion.div>
                )}

                {/* LOADING: Processing */}
                {mode === 'loading' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-6"
                    >
                        {/* Morphing orb */}
                        <motion.div
                            className="relative w-28 h-28"
                        >
                            {/* Orbiting particles */}
                            {[0, 1, 2].map(i => (
                                <motion.div
                                    key={i}
                                    className="absolute w-2 h-2 rounded-full"
                                    style={{
                                        left: '50%',
                                        top: '50%',
                                        marginLeft: -4,
                                        marginTop: -4,
                                        transformOrigin: `${50 + i * 10}px ${50 + i * 10}px`,
                                        background: atmosphere.primary,
                                        boxShadow: `0 0 10px ${atmosphere.primary}`,
                                    }}
                                    animate={{ rotate: 360 }}
                                    transition={{
                                        duration: 2,
                                        delay: i * 0.3,
                                        repeat: Infinity,
                                        ease: 'linear'
                                    }}
                                />
                            ))}

                            {/* Core */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 0.95, 1],
                                    borderRadius: ['50%', '45%', '50%', '45%', '50%']
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-full h-full flex items-center justify-center text-4xl"
                                style={{
                                    background: `radial-gradient(circle, ${atmosphere.primary}40, transparent)`,
                                    boxShadow: `0 0 50px ${atmosphere.primary}40`,
                                }}
                            >
                                <span style={{ color: atmosphere.primary }}>⟡</span>
                            </motion.div>
                        </motion.div>

                        <motion.p
                            animate={{ opacity: [0.4, 0.8, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-white/50 text-sm"
                        >
                            Refracting...
                        </motion.p>
                    </motion.div>
                )}

                {/* DONE: Prism with emergent text */}
                {mode === 'done' && prism && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-lg px-2 pb-4"
                    >
                        {/* What you said - with echo */}
                        <motion.div
                            className="text-center mb-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <p className="text-white/30 text-xs uppercase tracking-widest mb-2">You said</p>
                            <p className="text-white text-base">"{userMessage}"</p>
                        </motion.div>

                        {/* Three perspectives with emergent text */}
                        <div className="space-y-3">
                            {/* Said */}
                            <motion.div
                                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                transition={{ delay: 0.3, type: 'spring' }}
                                className="p-4 rounded-2xl backdrop-blur-sm"
                                style={{
                                    background: 'rgba(59, 130, 246, 0.08)',
                                    border: '1px solid rgba(59, 130, 246, 0.15)',
                                    boxShadow: '0 0 30px rgba(59, 130, 246, 0.1)'
                                }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <motion.div
                                        className="w-2 h-2 rounded-full bg-blue-400"
                                        animate={{ scale: [1, 1.3, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                    <span className="text-blue-400 text-[10px] uppercase tracking-wider font-medium">Said</span>
                                </div>
                                <p className="text-white/85 text-sm leading-relaxed">
                                    <EmergentText
                                        text={prism.said}
                                        delay={500}
                                        onComplete={() => setRevealPhase(1)}
                                    />
                                </p>
                            </motion.div>

                            {/* Unsaid */}
                            <motion.div
                                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                                animate={{ opacity: revealPhase >= 1 ? 1 : 0.3, x: 0, scale: 1 }}
                                transition={{ delay: 0.5, type: 'spring' }}
                                className="p-4 rounded-2xl backdrop-blur-sm"
                                style={{
                                    background: 'rgba(217, 70, 239, 0.08)',
                                    border: '1px solid rgba(217, 70, 239, 0.15)',
                                    boxShadow: '0 0 30px rgba(217, 70, 239, 0.1)'
                                }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <motion.div
                                        className="w-2 h-2 rounded-full bg-fuchsia-400"
                                        animate={{ scale: [1, 1.3, 1] }}
                                        transition={{ duration: 2, delay: 0.3, repeat: Infinity }}
                                    />
                                    <span className="text-fuchsia-400 text-[10px] uppercase tracking-wider font-medium">Unsaid</span>
                                </div>
                                <p className="text-white/85 text-sm leading-relaxed italic">
                                    {revealPhase >= 1 && (
                                        <EmergentText
                                            text={prism.unsaid}
                                            delay={200}
                                            onComplete={() => setRevealPhase(2)}
                                        />
                                    )}
                                </p>
                            </motion.div>

                            {/* Future You */}
                            <motion.div
                                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                                animate={{ opacity: revealPhase >= 2 ? 1 : 0.3, x: 0, scale: 1 }}
                                transition={{ delay: 0.7, type: 'spring' }}
                                className="p-4 rounded-2xl backdrop-blur-sm"
                                style={{
                                    background: 'rgba(245, 158, 11, 0.08)',
                                    border: '1px solid rgba(245, 158, 11, 0.15)',
                                    boxShadow: '0 0 30px rgba(245, 158, 11, 0.1)'
                                }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <motion.div
                                        className="w-2 h-2 rounded-full bg-amber-400"
                                        animate={{ scale: [1, 1.3, 1] }}
                                        transition={{ duration: 2, delay: 0.6, repeat: Infinity }}
                                    />
                                    <span className="text-amber-400 text-[10px] uppercase tracking-wider font-medium">Future You</span>
                                </div>
                                <p className="text-white/85 text-sm leading-relaxed">
                                    {revealPhase >= 2 && (
                                        <EmergentText
                                            text={prism.futureYou}
                                            delay={200}
                                            onComplete={() => {
                                                setRevealPhase(3);
                                                haptic('reveal');
                                            }}
                                        />
                                    )}
                                </p>
                            </motion.div>

                            {/* Tangent - surprise element */}
                            {prism.tangent && revealPhase >= 3 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.5 }}
                                    className="text-center pt-3"
                                >
                                    <motion.p
                                        className="text-violet-400/70 text-xs"
                                        animate={{ opacity: [0.5, 0.8, 0.5] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                    >
                                        ⚡ <EmergentText text={prism.tangent} delay={0} />
                                    </motion.p>
                                </motion.div>
                            )}
                        </div>

                        {/* Continue prompt */}
                        {revealPhase >= 3 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="text-center mt-6"
                            >
                                <p className="text-white/20 text-xs">Continue below or tap ⟡ to clear</p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </main>

            {/* Floating orb button in done mode */}
            {mode === 'done' && (
                <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2 }}
                    onClick={handleOrbTap}
                    className="absolute top-20 right-4 w-12 h-12 rounded-full flex items-center justify-center text-xl z-30"
                    style={{
                        background: `radial-gradient(circle, ${atmosphere.primary}30, transparent)`,
                        border: `1px solid ${atmosphere.primary}30`,
                        boxShadow: `0 0 20px ${atmosphere.primary}20`
                    }}
                    whileTap={{ scale: 0.9 }}
                >
                    <span style={{ color: atmosphere.primary }}>⟡</span>
                </motion.button>
            )}

            {/* Persistent input */}
            {(mode === 'ready' || mode === 'done') && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-20 p-4 border-t border-white/5"
                    style={{
                        paddingBottom: 'env(safe-area-inset-bottom, 16px)',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
                    }}
                >
                    <div className="max-w-lg mx-auto relative">
                        <textarea
                            ref={mode === 'ready' ? inputRef : null}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={mode === 'done' ? "What else is there..." : "Let it out..."}
                            className="w-full px-4 py-3 pr-14 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 resize-none focus:outline-none focus:border-white/20 text-base transition-colors"
                            style={{
                                minHeight: '52px',
                                maxHeight: '120px',
                                borderColor: input.length > 10 ? `${atmosphere.primary}40` : undefined
                            }}
                            rows={1}
                        />
                        <motion.button
                            onClick={handleSubmit}
                            disabled={!input.trim()}
                            className="absolute right-2 bottom-2 p-2.5 rounded-xl text-white/60 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                            style={{
                                background: input.trim() ? `${atmosphere.primary}30` : 'rgba(255,255,255,0.1)'
                            }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Send size={18} />
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default MirrorAmbient;
