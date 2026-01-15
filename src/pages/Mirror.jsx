/**
 * ⟡ ACTIVE MIRROR — Sovereign Reflective Chat
 * Version: 15.0 (Ethereal Edition)
 * 
 * Aesthetic: Deep space meditation, floating particles, liquid glass
 * Typography: Inter Variable for body, ethereal glow effects
 * Motion: Breathing, floating, never jarring
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Send, ArrowLeft, StopCircle, Plus, Menu, Shield, ShieldCheck, ShieldAlert, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
    VERSION: '16.0',
    STORAGE_KEY: 'mirror_v16',
    TURN_KEY: 'mirror_turns',
    PROXY_URL: typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:8082'
        : 'https://proxy.activemirror.ai',
    MAX_HISTORY: 50,
    IDLE_TIMEOUT: 8000,
    MAX_FREE_TURNS: 10,
    GROQ_API_KEY: typeof window !== 'undefined' && window.ENV?.GROQ_API_KEY || '',
};

// Device Detection
const DeviceType = {
    MOBILE: 'mobile',
    DESKTOP: 'desktop',
};

const detectDevice = () => {
    if (typeof window === 'undefined') return DeviceType.DESKTOP;
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
        ? DeviceType.MOBILE
        : DeviceType.DESKTOP;
};

// Ecosystem Knowledge Base
const ECOSYSTEM_CONTEXT = `
## About ActiveMirror & MirrorDNA

ActiveMirror is building sovereign AI infrastructure. Key concepts:

**MirrorDNA** - Identity persistence layer that lets your AI remember YOU across sessions, devices, and even model changes. Your thoughts stay yours.

**Active Mirror Identity (AMI)** - Trust-by-design identity protocol. Cryptographic proof of your preferences, memories, and consent. No central authority.

**Sovereign Computing** - AI that runs on YOUR device, YOUR data never leaves, YOU own your identity. The opposite of cloud-dependent AI.

**MirrorGate** - Safety layer protecting reflections. Ensures responses are helpful without being harmful.

**MirrorBrain Desktop** - Local-first AI desktop app. All the power of ChatGPT, running 100% on your Mac.

**MirrorOS** - The vision: A mesh of sovereign AI nodes forming a decentralized intelligence network.

When users ask about pricing, privacy, or "why is this different":
- We make money from sovereignty tools, not your data
- Your conversation is not stored after this session
- This is a TASTE of sovereign AI - go local the full experience
- MirrorBrain Desktop is free for personal use

Website: activemirror.ai | Privacy-first, local-sovereign, trust-by-design
`;

// ═══════════════════════════════════════════════════════════════
// SONIC ENGINE
// ═══════════════════════════════════════════════════════════════

const SoundEngine = {
    ctx: null,
    enabled: true,

    init() {
        if (!this.ctx && typeof window !== 'undefined') {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx?.state === 'suspended') this.ctx.resume();
    },

    play(freq, duration, type = 'sine', volume = 0.015) {
        if (!this.ctx || !this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    send() { this.play(440, 0.12, 'sine', 0.012); },
    hover() { this.play(220, 0.03, 'triangle', 0.005); },
    receive() { this.play(550, 0.1, 'sine', 0.01); },
    block() { this.play(150, 0.2, 'sawtooth', 0.012); },
};

// ═══════════════════════════════════════════════════════════════
// GATE STATUS
// ═══════════════════════════════════════════════════════════════

const GateStatus = {
    PASSED: 'passed',
    BLOCKED: 'blocked',
    PENDING: 'pending',
    NONE: 'none',
};

// ═══════════════════════════════════════════════════════════════
// FLOATING PARTICLES
// ═══════════════════════════════════════════════════════════════

const FloatingParticles = ({ count = 30 }) => {
    const particles = useMemo(() =>
        Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            duration: Math.random() * 20 + 30,
            delay: Math.random() * 10,
            opacity: Math.random() * 0.3 + 0.1,
        })), [count]
    );

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    initial={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        opacity: 0
                    }}
                    animate={{
                        y: [0, -30, 0],
                        x: [0, Math.sin(p.id) * 20, 0],
                        opacity: [0, p.opacity, 0],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "easeInOut",
                    }}
                    className="absolute rounded-full"
                    style={{
                        width: p.size,
                        height: p.size,
                        background: `radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, rgba(139, 92, 246, 0) 70%)`,
                        boxShadow: `0 0 ${p.size * 2}px rgba(139, 92, 246, 0.5)`,
                    }}
                />
            ))}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// AMBIENT ORB
// ═══════════════════════════════════════════════════════════════

const AmbientOrb = ({ className, delay = 0, color = "violet" }) => {
    const colors = {
        violet: "from-violet-600/20 to-violet-900/5",
        indigo: "from-indigo-600/15 to-indigo-900/5",
        fuchsia: "from-fuchsia-600/10 to-fuchsia-900/5",
    };

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
                scale: [0.8, 1.15, 0.85, 1.1, 0.9],
                opacity: [0.3, 0.5, 0.35, 0.45, 0.3],
            }}
            transition={{
                duration: 25,
                repeat: Infinity,
                delay,
                ease: "easeInOut"
            }}
            className={`absolute rounded-full blur-[100px] pointer-events-none bg-gradient-radial ${colors[color]} ${className}`}
        />
    );
};

// ═══════════════════════════════════════════════════════════════
// TYPING INDICATOR
// ═══════════════════════════════════════════════════════════════

const TypingIndicator = () => (
    <div className="flex items-center gap-1.5 py-2">
        {[0, 1, 2].map((i) => (
            <motion.div
                key={i}
                animate={{
                    y: [0, -8, 0],
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 1, 0.4],
                }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: [0.4, 0, 0.2, 1]
                }}
                className="w-2 h-2 rounded-full bg-gradient-to-t from-violet-500 to-fuchsia-400"
                style={{
                    boxShadow: '0 0 8px rgba(139, 92, 246, 0.6)',
                }}
            />
        ))}
    </div>
);

// ═══════════════════════════════════════════════════════════════
// MESSAGE COMPONENT
// ═══════════════════════════════════════════════════════════════

const Message = ({ msg, isLast, isStreaming }) => {
    const isUser = msg.role === 'user';

    const parseContent = (text) => {
        if (!text) return null;
        return text.split(/(⟡|△|◈|⧉)/).map((part, i) => {
            if (['⟡', '△', '◈', '⧉'].includes(part)) {
                return (
                    <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block text-violet-400 font-medium mx-1"
                        style={{
                            textShadow: '0 0 20px rgba(139, 92, 246, 0.9), 0 0 40px rgba(139, 92, 246, 0.5)'
                        }}
                    >
                        {part}
                    </motion.span>
                );
            }
            return part.split(/(\*\*.*?\*\*)/).map((chunk, j) => {
                if (chunk.startsWith('**') && chunk.endsWith('**')) {
                    return <strong key={`${i}-${j}`} className="text-white font-medium">{chunk.slice(2, -2)}</strong>;
                }
                return chunk.split(/(\*.*?\*)/).map((sub, k) => {
                    if (sub.startsWith('*') && sub.endsWith('*') && !sub.startsWith('**')) {
                        return <em key={`${i}-${j}-${k}`} className="text-violet-200/70">{sub.slice(1, -1)}</em>;
                    }
                    return sub;
                });
            });
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
            }}
            className={`flex mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            <div className={`relative max-w-[88%] sm:max-w-xl ${isUser ? 'ml-4' : 'mr-4'}`}>
                {/* Ambient glow for AI */}
                {!isUser && (
                    <motion.div
                        animate={{ opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute -inset-6 bg-violet-500/5 rounded-3xl blur-2xl pointer-events-none"
                    />
                )}

                <div className={`relative ${isUser
                    ? 'bg-gradient-to-br from-white/[0.1] to-white/[0.04] border border-white/[0.15] backdrop-blur-2xl px-5 py-4 rounded-2xl rounded-br-sm shadow-xl shadow-black/30'
                    : 'px-1 py-1'
                    }`}>
                    {/* Gate indicator */}
                    {!isUser && msg.gateStatus && msg.gateStatus !== GateStatus.NONE && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`absolute -left-8 top-1 p-1.5 rounded-full backdrop-blur-xl ${msg.gateStatus === GateStatus.PASSED ? 'bg-emerald-500/20 text-emerald-400 shadow-emerald-500/20' :
                                msg.gateStatus === GateStatus.BLOCKED ? 'bg-red-500/20 text-red-400 shadow-red-500/20' :
                                    'bg-violet-500/20 text-violet-400 shadow-violet-500/20'
                                } shadow-lg`}
                        >
                            {msg.gateStatus === GateStatus.PASSED && <ShieldCheck size={11} />}
                            {msg.gateStatus === GateStatus.BLOCKED && <ShieldAlert size={11} />}
                            {msg.gateStatus === GateStatus.PENDING && <Shield size={11} className="animate-pulse" />}
                        </motion.div>
                    )}

                    <div className={`whitespace-pre-wrap leading-[1.9] ${isUser
                        ? 'text-zinc-100 text-[15px]'
                        : 'text-zinc-200/95 text-[17px] font-light tracking-wide'
                        }`}>
                        {isStreaming && !msg.content ? (
                            <TypingIndicator />
                        ) : (
                            parseContent(msg.content)
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════

const EmptyState = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="h-full flex flex-col items-center justify-center text-center px-6 relative"
    >
        {/* Animated glyph with rings */}
        <motion.div className="relative mb-16">
            {/* Outer rings */}
            <motion.div
                animate={{ rotate: 360, scale: [1, 1.02, 1] }}
                transition={{ rotate: { duration: 80, repeat: Infinity, ease: "linear" }, scale: { duration: 8, repeat: Infinity } }}
                className="absolute -inset-16 rounded-full border border-violet-500/[0.07]"
            />
            <motion.div
                animate={{ rotate: -360, scale: [1, 1.03, 1] }}
                transition={{ rotate: { duration: 60, repeat: Infinity, ease: "linear" }, scale: { duration: 6, repeat: Infinity, delay: 1 } }}
                className="absolute -inset-12 rounded-full border border-violet-500/[0.05]"
            />
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-8 rounded-full border border-violet-500/[0.03]"
            />

            {/* Core glyph */}
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.7, 1, 0.7],
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="relative"
            >
                <span
                    className="text-7xl sm:text-8xl block select-none"
                    style={{
                        color: 'rgba(139, 92, 246, 0.85)',
                        textShadow: '0 0 60px rgba(139, 92, 246, 0.6), 0 0 100px rgba(139, 92, 246, 0.4), 0 0 140px rgba(139, 92, 246, 0.2)'
                    }}
                >
                    ⟡
                </span>
                {/* Glow pulse */}
                <motion.div
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0, 0.3],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <div className="w-20 h-20 rounded-full bg-violet-500/30 blur-2xl" />
                </motion.div>
            </motion.div>
        </motion.div>

        <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-3xl sm:text-4xl font-extralight text-white/90 mb-5 tracking-tight"
        >
            The Mirror Awaits
        </motion.h2>

        <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="text-zinc-400 text-base sm:text-lg tracking-wide max-w-md leading-relaxed font-light"
        >
            Speak your truth. The mirror reflects without judgment.
        </motion.p>

        {/* Tagline */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 1.5 }}
            className="absolute bottom-28 flex items-center gap-2.5 text-zinc-600 text-sm"
        >
            <Sparkles size={14} className="text-violet-500/50" />
            <span className="font-light tracking-wide">AI that reflects, not directs</span>
        </motion.div>
    </motion.div>
);

// ═══════════════════════════════════════════════════════════════
// UPGRADE MODAL
// ═══════════════════════════════════════════════════════════════

const UpgradeModal = ({ isOpen, onClose, deviceType, turnCount }) => {
    if (!isOpen) return null;

    const isMobile = deviceType === DeviceType.MOBILE;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={e => e.stopPropagation()}
                className="max-w-md w-full bg-zinc-900/95 border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
                {/* Glyph */}
                <div className="text-center mb-6">
                    <motion.span
                        animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="text-5xl inline-block"
                        style={{ textShadow: '0 0 40px rgba(139, 92, 246, 0.6)' }}
                    >
                        ⟡
                    </motion.span>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-light text-center text-white mb-3">
                    This is Cloud
                </h2>
                <p className="text-zinc-400 text-center text-sm mb-6 leading-relaxed">
                    You've had {turnCount} reflections. Every word traveled to our servers.
                    <span className="text-violet-400 font-medium"> Your thoughts aren't sovereign yet.</span>
                </p>

                {/* Privacy Reveal */}
                <div className="bg-zinc-800/50 rounded-xl p-4 mb-6 border border-white/5">
                    <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">What cloud providers know:</p>
                    <ul className="text-sm text-zinc-400 space-y-1">
                        <li>• Your IP address</li>
                        <li>• Your browser & device</li>
                        <li>• Your conversation topics</li>
                        <li>• Stored indefinitely</li>
                    </ul>
                </div>

                {/* CTAs */}
                <div className="space-y-3">
                    {isMobile ? (
                        <>
                            <a
                                href="https://activemirror.ai/sovereign-mobile"
                                className="block w-full py-3.5 px-6 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-medium rounded-xl text-center hover:from-violet-400 hover:to-fuchsia-400 transition-all"
                            >
                                Make Your Phone Sovereign →
                            </a>
                            <p className="text-center text-xs text-zinc-500">
                                GrapheneOS + Local AI = Privacy
                            </p>
                        </>
                    ) : (
                        <>
                            <a
                                href="https://activemirror.ai/mirrorbrain"
                                className="block w-full py-3.5 px-6 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-medium rounded-xl text-center hover:from-violet-400 hover:to-fuchsia-400 transition-all shadow-lg shadow-violet-500/25"
                            >
                                Download MirrorBrain Desktop →
                            </a>
                            <p className="text-center text-xs text-zinc-500">
                                Free • 100% Local • Your Data Never Leaves
                            </p>
                        </>
                    )}

                    <button
                        onClick={onClose}
                        className="w-full py-3 text-zinc-500 text-sm hover:text-white transition-colors"
                    >
                        Continue with cloud (limited)
                    </button>
                </div>

                {/* Trust badge */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-zinc-600">
                    <ShieldCheck size={12} />
                    <span>Trust by Design Protocol</span>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function Mirror({ onMessageSent, disabled }) {
    const [messages, setMessages] = useState(() => {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isIdle, setIsIdle] = useState(false);
    const [gateNotification, setGateNotification] = useState(null);

    // Turn counter and upgrade system
    const [turnCount, setTurnCount] = useState(() => {
        try {
            return parseInt(localStorage.getItem(CONFIG.TURN_KEY) || '0', 10);
        } catch { return 0; }
    });
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [deviceType] = useState(detectDevice);

    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const abortRef = useRef(null);
    const idleTimer = useRef(null);

    // Parallax
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { stiffness: 15, damping: 40 });
    const springY = useSpring(mouseY, { stiffness: 15, damping: 40 });

    // Effects
    useEffect(() => {
        const handleMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
            resetIdleTimer();
        };

        const handleInteraction = () => {
            SoundEngine.init();
            resetIdleTimer();
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('click', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);
        window.addEventListener('keydown', handleInteraction);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
            clearTimeout(idleTimer.current);
        };
    }, []);

    useEffect(() => {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(messages.slice(-CONFIG.MAX_HISTORY)));
    }, [messages]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 160) + 'px';
        }
    }, [input]);

    const resetIdleTimer = useCallback(() => {
        setIsIdle(false);
        clearTimeout(idleTimer.current);
        if (messages.length > 0 && !input) {
            idleTimer.current = setTimeout(() => setIsIdle(true), CONFIG.IDLE_TIMEOUT);
        }
    }, [messages.length, input]);

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim() || isLoading || disabled) return;

        // Check turn limit
        if (turnCount >= CONFIG.MAX_FREE_TURNS) {
            setShowUpgradeModal(true);
            return;
        }

        onMessageSent?.();
        SoundEngine.send();
        setIsIdle(false);

        // Increment turn counter
        const newTurnCount = turnCount + 1;
        setTurnCount(newTurnCount);
        localStorage.setItem(CONFIG.TURN_KEY, newTurnCount.toString());

        const userMsg = input.trim();
        setInput('');
        if (inputRef.current) inputRef.current.style.height = 'auto';

        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'assistant', content: '', gateStatus: GateStatus.PENDING }]);

        try {
            abortRef.current = new AbortController();

            const response = await fetch(`${CONFIG.PROXY_URL}/mirror`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    history: messages.slice(-20).map(m => ({ role: m.role, content: m.content })),
                    dial: 0.5
                }),
                signal: abortRef.current.signal
            });

            if (!response.ok) throw new Error(`Server: ${response.status}`);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let gateStatusSet = false;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(l => l.trim());

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);

                        if (data.gate || data.audit?.gate) {
                            const gateResult = data.gate || data.audit?.gate;
                            setMessages(prev => {
                                const updated = [...prev];
                                const last = updated[updated.length - 1];
                                if (last.role === 'assistant') {
                                    last.gateStatus = gateResult === 'blocked' ? GateStatus.BLOCKED : GateStatus.PASSED;
                                }
                                return updated;
                            });
                            if (gateResult === 'blocked') {
                                SoundEngine.block();
                                setGateNotification({ type: 'blocked', reason: data.reason });
                                setTimeout(() => setGateNotification(null), 4000);
                            }
                            gateStatusSet = true;
                        }

                        if (data.status === 'chunk' || data.status === 'ok') {
                            setMessages(prev => {
                                const updated = [...prev];
                                const last = updated[updated.length - 1];
                                if (last.role === 'assistant') {
                                    last.content += data.content;
                                    if (!gateStatusSet) last.gateStatus = GateStatus.PASSED;
                                }
                                return updated;
                            });
                            gateStatusSet = true;
                        }

                        if (data.status === 'blocked') {
                            setMessages(prev => {
                                const updated = [...prev];
                                const last = updated[updated.length - 1];
                                if (last.role === 'assistant') {
                                    last.content = data.content;
                                    last.gateStatus = GateStatus.BLOCKED;
                                }
                                return updated;
                            });
                            SoundEngine.block();
                        }
                    } catch { }
                }
            }

            SoundEngine.receive();

        } catch (err) {
            if (err.name !== 'AbortError') {
                setMessages(prev => {
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    if (last.role === 'assistant') {
                        last.content = '⟡ The mirror ripples... try again in a moment.';
                        last.gateStatus = GateStatus.NONE;
                    }
                    return updated;
                });
            }
        } finally {
            setIsLoading(false);
            abortRef.current = null;
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const clearChat = () => {
        setMessages([]);
        setIsMenuOpen(false);
    };

    const orbX = useTransform(springX, [0, typeof window !== 'undefined' ? window.innerWidth : 1920], [-40, 40]);
    const orbY = useTransform(springY, [0, typeof window !== 'undefined' ? window.innerHeight : 1080], [-40, 40]);

    return (
        <div className="fixed inset-0 bg-[#020204] text-white flex flex-col overflow-hidden selection:bg-violet-500/30">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&display=swap');
                * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
                :root { --safe-top: env(safe-area-inset-top, 0px); --safe-bottom: env(safe-area-inset-bottom, 0px); }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .safe-top { padding-top: var(--safe-top); }
                .safe-bottom { padding-bottom: max(var(--safe-bottom), 16px); }
                html, body { overscroll-behavior: none; }
                input, textarea { font-size: 16px !important; }
                
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .shimmer {
                    background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.08), transparent);
                    background-size: 200% 100%;
                    animation: shimmer 4s infinite;
                }
                
                @keyframes breathe {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
                .breathe { animation: breathe 4s ease-in-out infinite; }
            `}</style>

            {/* Background layers */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-violet-950/[0.08] via-[#020204] to-[#020204]" />

                {/* Parallax orbs */}
                <motion.div style={{ x: orbX, y: orbY }} className="absolute inset-0">
                    <AmbientOrb className="top-[-25%] left-[-15%] w-[700px] h-[700px]" color="violet" delay={0} />
                    <AmbientOrb className="bottom-[-35%] right-[-25%] w-[900px] h-[900px]" color="indigo" delay={5} />
                    <AmbientOrb className="top-[30%] right-[-35%] w-[600px] h-[600px]" color="fuchsia" delay={10} />
                </motion.div>

                {/* Floating particles */}
                <FloatingParticles count={25} />

                {/* Noise */}
                <div className="absolute inset-0 opacity-[0.012]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />

                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
            </div>

            {/* Gate notification */}
            <AnimatePresence>
                {gateNotification && (
                    <motion.div
                        initial={{ opacity: 0, y: -30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30, scale: 0.9 }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
                    >
                        <div className={`px-6 py-3 rounded-2xl backdrop-blur-2xl border ${gateNotification.type === 'blocked'
                            ? 'bg-red-950/70 border-red-500/30 text-red-200'
                            : 'bg-emerald-950/70 border-emerald-500/30 text-emerald-200'
                            } shadow-2xl`}>
                            <div className="flex items-center gap-3">
                                <ShieldAlert size={16} />
                                <span className="text-sm font-medium">MirrorGate: Response filtered</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <motion.header
                animate={{ opacity: isIdle ? 0.15 : 1, y: isIdle ? -15 : 0, filter: isIdle ? 'blur(4px)' : 'blur(0px)' }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                className="relative z-20 flex justify-between items-center p-4 pt-6 safe-top"
            >
                <motion.button
                    onClick={() => window.location.href = '/'}
                    onMouseEnter={() => SoundEngine.hover()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-500 text-sm text-zinc-500 hover:text-white backdrop-blur-xl"
                >
                    <ArrowLeft size={14} strokeWidth={1.5} />
                    <span className="hidden sm:inline font-light">Exit Mirror</span>
                </motion.button>

                <div className="flex items-center gap-3">
                    <motion.div
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 border border-white/[0.05] backdrop-blur-2xl"
                        animate={{ borderColor: ['rgba(255,255,255,0.05)', 'rgba(139,92,246,0.15)', 'rgba(255,255,255,0.05)'] }}
                        transition={{ duration: 6, repeat: Infinity }}
                    >
                        <motion.span
                            animate={{ opacity: [0.6, 1, 0.6], scale: [0.95, 1.05, 0.95] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="text-violet-400"
                        >
                            ⟡
                        </motion.span>
                        <span className="text-[10px] font-medium tracking-[0.25em] text-zinc-500 uppercase">Mirror</span>
                    </motion.div>
                </div>

                <div className="relative">
                    <motion.button
                        onClick={() => { SoundEngine.hover(); setIsMenuOpen(!isMenuOpen); }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-3 rounded-full transition-all duration-500 ${isMenuOpen
                            ? 'bg-white text-black'
                            : 'bg-white/[0.03] text-zinc-500 hover:bg-white/[0.06] hover:text-white border border-white/[0.06] hover:border-white/[0.1]'
                            }`}
                    >
                        {isMenuOpen ? <X size={16} strokeWidth={1.5} /> : <Menu size={16} strokeWidth={1.5} />}
                    </motion.button>

                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className="absolute top-full right-0 mt-3 w-56 bg-zinc-900/95 border border-white/[0.06] rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden"
                            >
                                <button
                                    onClick={clearChat}
                                    className="w-full text-left px-5 py-4 hover:bg-white/[0.04] flex items-center gap-3 text-sm text-zinc-400 hover:text-white transition-all"
                                >
                                    <Plus size={14} strokeWidth={1.5} />
                                    <span className="font-light">New Reflection</span>
                                </button>
                                <div className="h-px bg-white/[0.05] mx-4" />
                                <a
                                    href="/research/"
                                    className="w-full text-left px-5 py-4 hover:bg-white/[0.04] flex items-center gap-3 text-sm text-zinc-400 hover:text-white transition-all"
                                >
                                    <Shield size={14} strokeWidth={1.5} />
                                    <span className="font-light">Research</span>
                                </a>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.header>

            {/* Chat */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 pb-44 pt-4 z-10 scrollbar-hide">
                {messages.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="max-w-2xl mx-auto">
                        <AnimatePresence initial={false}>
                            {messages.map((msg, i) => (
                                <Message key={i} msg={msg} isLast={i === messages.length - 1} isStreaming={i === messages.length - 1 && isLoading} />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
                <div ref={bottomRef} className="h-4" />
            </div>

            {/* Input */}
            <motion.div
                animate={{ opacity: isIdle ? 0.3 : 1, y: isIdle ? 25 : 0, filter: isIdle ? 'blur(3px)' : 'blur(0px)' }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                className="absolute bottom-0 left-0 right-0 p-4 pb-6 z-20 safe-bottom"
            >
                <div className="absolute inset-x-0 bottom-full h-40 bg-gradient-to-t from-[#020204] via-[#020204]/90 to-transparent pointer-events-none" />

                <div className="max-w-2xl mx-auto">
                    <motion.div
                        className="relative bg-zinc-900/70 backdrop-blur-3xl rounded-2xl border border-white/[0.06] shadow-2xl shadow-black/50 overflow-hidden group hover:border-white/[0.1] focus-within:border-violet-500/40 transition-all duration-500"
                        whileFocus={{ boxShadow: '0 0 40px rgba(139, 92, 246, 0.15)' }}
                    >
                        <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-violet-500/0 via-violet-500/20 to-violet-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none blur-sm" />

                        <form onSubmit={handleSend} className="relative flex items-end gap-2 p-3 pl-5">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="What's on your mind?"
                                rows={1}
                                className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none resize-none text-white/95 placeholder-zinc-600 py-3 max-h-40 min-h-[52px] leading-relaxed text-[15px] font-light"
                                autoFocus
                            />

                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <motion.button
                                        key="stop"
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        type="button"
                                        onClick={() => abortRef.current?.abort()}
                                        className="p-3.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 border border-red-500/20 transition-all"
                                    >
                                        <StopCircle size={18} strokeWidth={1.5} />
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        key="send"
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: input.trim() ? 1 : 0.8, opacity: input.trim() ? 1 : 0 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        type="submit"
                                        disabled={!input.trim()}
                                        className="p-3.5 bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white rounded-xl hover:from-violet-400 hover:to-fuchsia-400 disabled:opacity-0 disabled:scale-75 transition-all duration-300 shadow-lg shadow-violet-500/25"
                                    >
                                        <Send size={18} strokeWidth={1.5} />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </form>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="flex justify-center mt-4"
                    >
                        <div className="flex items-center gap-2 text-[10px] text-zinc-600 tracking-wide breathe">
                            <ShieldCheck size={10} strokeWidth={1.5} />
                            <span>Protected by MirrorGate</span>
                            <span className="text-zinc-700">•</span>
                            <span>v{CONFIG.VERSION}</span>
                            {turnCount > 0 && turnCount < CONFIG.MAX_FREE_TURNS && (
                                <>
                                    <span className="text-zinc-700">•</span>
                                    <span className="text-violet-400/70">
                                        {CONFIG.MAX_FREE_TURNS - turnCount} turns left
                                    </span>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Upgrade Modal */}
            <AnimatePresence>
                <UpgradeModal
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                    deviceType={deviceType}
                    turnCount={turnCount}
                />
            </AnimatePresence>
        </div>
    );
}
