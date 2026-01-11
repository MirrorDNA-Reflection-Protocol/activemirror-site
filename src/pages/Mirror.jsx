/**
 * ⟡ ACTIVE MIRROR — Sovereign Reflective Chat
 * Version: 14.0 (Crystalline Edition)
 * 
 * Aesthetic: Dark crystalline, meditative, still water at night
 * Typography: Geist for body, subtle glow effects
 * Motion: Liquid, breathing, never jarring
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, ArrowLeft, StopCircle, Plus, Menu, Shield, ShieldCheck, ShieldAlert, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
    VERSION: '14.0',
    STORAGE_KEY: 'mirror_v14',
    PROXY_URL: typeof window !== 'undefined' && window.location.hostname === 'localhost' 
        ? 'http://localhost:8082' 
        : 'https://proxy.activemirror.ai',
    MAX_HISTORY: 50,
    IDLE_TIMEOUT: 8000,
};

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
    
    play(freq, duration, type = 'sine', volume = 0.02) {
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
    
    send() { this.play(520, 0.15, 'sine', 0.015); },
    hover() { this.play(280, 0.04, 'triangle', 0.008); },
    receive() { this.play(660, 0.12, 'sine', 0.012); },
    block() { this.play(180, 0.25, 'sawtooth', 0.015); },
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
// AMBIENT ORB COMPONENT
// ═══════════════════════════════════════════════════════════════

const AmbientOrb = ({ className, delay = 0 }) => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
            scale: [0.8, 1.1, 0.9, 1.05, 0.85],
            opacity: [0.15, 0.25, 0.18, 0.22, 0.15],
        }}
        transition={{
            duration: 20,
            repeat: Infinity,
            delay,
            ease: "easeInOut"
        }}
        className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
    />
);

// ═══════════════════════════════════════════════════════════════
// TYPING INDICATOR
// ═══════════════════════════════════════════════════════════════

const TypingIndicator = () => (
    <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
            <motion.div
                key={i}
                animate={{
                    y: [0, -6, 0],
                    opacity: [0.3, 1, 0.3],
                }}
                transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.12,
                    ease: [0.4, 0, 0.2, 1]
                }}
                className="w-2 h-2 rounded-full bg-gradient-to-t from-violet-500 to-fuchsia-400"
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
                    <span 
                        key={i} 
                        className="text-violet-400 font-medium mx-0.5 animate-pulse"
                        style={{ 
                            textShadow: '0 0 12px rgba(139, 92, 246, 0.8), 0 0 24px rgba(139, 92, 246, 0.4)' 
                        }}
                    >
                        {part}
                    </span>
                );
            }
            return part.split(/(\*\*.*?\*\*)/).map((chunk, j) => {
                if (chunk.startsWith('**') && chunk.endsWith('**')) {
                    return <strong key={`${i}-${j}`} className="text-white/95 font-semibold">{chunk.slice(2, -2)}</strong>;
                }
                return chunk.split(/(\*.*?\*)/).map((sub, k) => {
                    if (sub.startsWith('*') && sub.endsWith('*') && !sub.startsWith('**')) {
                        return <em key={`${i}-${j}-${k}`} className="text-violet-200/60 italic">{sub.slice(1, -1)}</em>;
                    }
                    return sub;
                });
            });
        });
    };
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ 
                duration: 0.6, 
                ease: [0.16, 1, 0.3, 1],
            }}
            className={`flex mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            <div className={`relative max-w-[85%] sm:max-w-xl ${
                isUser 
                    ? 'ml-8' 
                    : 'mr-8'
            }`}>
                {/* Glow effect for AI messages */}
                {!isUser && (
                    <div className="absolute -inset-4 bg-violet-500/5 rounded-3xl blur-2xl pointer-events-none" />
                )}
                
                <div className={`relative ${
                    isUser 
                        ? 'bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/[0.12] backdrop-blur-xl px-5 py-4 rounded-2xl rounded-br-md shadow-lg shadow-black/20' 
                        : 'px-1'
                }`}>
                    {/* Gate status indicator */}
                    {!isUser && msg.gateStatus && msg.gateStatus !== GateStatus.NONE && (
                        <motion.div 
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`absolute -left-8 top-0 p-1.5 rounded-full ${
                                msg.gateStatus === GateStatus.PASSED ? 'bg-emerald-500/20 text-emerald-400' :
                                msg.gateStatus === GateStatus.BLOCKED ? 'bg-red-500/20 text-red-400' : 
                                'bg-violet-500/20 text-violet-400'
                            }`}
                        >
                            {msg.gateStatus === GateStatus.PASSED && <ShieldCheck size={12} />}
                            {msg.gateStatus === GateStatus.BLOCKED && <ShieldAlert size={12} />}
                            {msg.gateStatus === GateStatus.PENDING && <Shield size={12} className="animate-pulse" />}
                        </motion.div>
                    )}
                    
                    <div className={`whitespace-pre-wrap leading-[1.8] ${
                        isUser 
                            ? 'text-zinc-100 text-[15px]' 
                            : 'text-zinc-200/90 text-lg font-light tracking-wide'
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
// EMPTY STATE COMPONENT
// ═══════════════════════════════════════════════════════════════

const EmptyState = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="h-full flex flex-col items-center justify-center text-center px-6 relative"
    >
        {/* Animated glyph */}
        <motion.div
            className="relative mb-12"
        >
            {/* Outer ring */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-12 rounded-full border border-violet-500/10"
            />
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-8 rounded-full border border-violet-500/5"
            />
            
            {/* Core glyph */}
            <motion.div
                animate={{ 
                    scale: [1, 1.08, 1],
                    opacity: [0.6, 1, 0.6],
                }}
                transition={{ 
                    duration: 6, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                }}
                className="relative"
            >
                <span 
                    className="text-7xl sm:text-8xl block"
                    style={{ 
                        color: 'rgba(139, 92, 246, 0.7)',
                        textShadow: '0 0 60px rgba(139, 92, 246, 0.5), 0 0 120px rgba(139, 92, 246, 0.3), 0 0 180px rgba(139, 92, 246, 0.1)' 
                    }}
                >
                    ⟡
                </span>
            </motion.div>
        </motion.div>
        
        <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-2xl sm:text-3xl font-extralight text-white/80 mb-4 tracking-tight"
        >
            The Mirror Awaits
        </motion.h2>
        
        <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-zinc-500 text-sm sm:text-base tracking-[0.02em] max-w-sm leading-relaxed"
        >
            Speak your truth. The mirror reflects without judgment.
        </motion.p>
        
        {/* Subtle hint */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-32 flex items-center gap-2 text-zinc-600 text-xs"
        >
            <Sparkles size={12} />
            <span>AI that reflects, not directs</span>
        </motion.div>
    </motion.div>
);

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
    
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const abortRef = useRef(null);
    const idleTimer = useRef(null);
    const chatContainerRef = useRef(null);
    
    // Parallax motion
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { stiffness: 20, damping: 30 });
    const springY = useSpring(mouseY, { stiffness: 20, damping: 30 });
    
    // ─── Effects ───
    
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
    
    // ─── Handlers ───
    
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
        
        onMessageSent?.();
        SoundEngine.send();
        setIsIdle(false);
        
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
                        
                        if (data.gate) {
                            setMessages(prev => {
                                const updated = [...prev];
                                const last = updated[updated.length - 1];
                                if (last.role === 'assistant') {
                                    last.gateStatus = data.gate === 'blocked' ? GateStatus.BLOCKED : GateStatus.PASSED;
                                }
                                return updated;
                            });
                            if (data.gate === 'blocked') {
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
                    } catch {}
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
    
    const exitMirror = () => {
        window.location.href = '/';
    };
    
    // Transform for parallax orbs
    const orbX = useTransform(springX, [0, typeof window !== 'undefined' ? window.innerWidth : 1920], [-50, 50]);
    const orbY = useTransform(springY, [0, typeof window !== 'undefined' ? window.innerHeight : 1080], [-50, 50]);
    
    // ─── Render ───
    
    return (
        <div className="fixed inset-0 bg-[#030305] text-white flex flex-col overflow-hidden selection:bg-violet-500/30">
            {/* Import font and global styles */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Geist:wght@100;200;300;400;500&display=swap');
                * { font-family: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif; }
                
                :root {
                    --safe-top: env(safe-area-inset-top, 0px);
                    --safe-bottom: env(safe-area-inset-bottom, 0px);
                }
                
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                
                .safe-top { padding-top: var(--safe-top); }
                .safe-bottom { padding-bottom: max(var(--safe-bottom), 16px); }
                
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                
                .shimmer {
                    background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.1), transparent);
                    background-size: 200% 100%;
                    animation: shimmer 3s infinite;
                }
                
                html, body { overscroll-behavior: none; }
                input, textarea { font-size: 16px !important; }
            `}</style>
            
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Base gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-violet-950/10 via-[#030305] to-[#030305]" />
                
                {/* Animated orbs */}
                <motion.div style={{ x: orbX, y: orbY }} className="absolute inset-0">
                    <AmbientOrb 
                        className="top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-900/30" 
                        delay={0} 
                    />
                    <AmbientOrb 
                        className="bottom-[-30%] right-[-20%] w-[800px] h-[800px] bg-indigo-900/20" 
                        delay={5} 
                    />
                    <AmbientOrb 
                        className="top-[40%] right-[-30%] w-[500px] h-[500px] bg-fuchsia-900/15" 
                        delay={10} 
                    />
                </motion.div>
                
                {/* Noise texture */}
                <div 
                    className="absolute inset-0 opacity-[0.015]"
                    style={{ 
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                />
                
                {/* Subtle vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
            </div>
            
            {/* Gate Notification Toast */}
            <AnimatePresence>
                {gateNotification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
                    >
                        <div className={`px-5 py-3 rounded-2xl backdrop-blur-xl border ${
                            gateNotification.type === 'blocked'
                                ? 'bg-red-950/60 border-red-500/30 text-red-200'
                                : 'bg-emerald-950/60 border-emerald-500/30 text-emerald-200'
                        } shadow-2xl`}>
                            <div className="flex items-center gap-3">
                                <ShieldAlert size={16} />
                                <span className="text-sm font-medium">
                                    {gateNotification.type === 'blocked' ? 'MirrorGate: Response filtered' : 'MirrorGate: Passed'}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Header */}
            <motion.header
                animate={{ 
                    opacity: isIdle ? 0.2 : 1, 
                    y: isIdle ? -20 : 0,
                    filter: isIdle ? 'blur(4px)' : 'blur(0px)'
                }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="relative z-20 flex justify-between items-center p-4 pt-6 safe-top"
            >
                <motion.button 
                    onClick={exitMirror}
                    onMouseEnter={() => SoundEngine.hover()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 text-sm text-zinc-400 hover:text-white backdrop-blur-sm"
                >
                    <ArrowLeft size={14} strokeWidth={1.5} />
                    <span className="hidden sm:inline font-light">Exit Mirror</span>
                </motion.button>
                
                {/* Center indicator */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/[0.06] backdrop-blur-xl">
                        <motion.span 
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="text-violet-400"
                        >
                            ⟡
                        </motion.span>
                        <span className="text-[10px] font-medium tracking-[0.2em] text-zinc-500 uppercase">
                            Mirror
                        </span>
                    </div>
                </div>
                
                {/* Menu */}
                <div className="relative">
                    <motion.button
                        onClick={() => { SoundEngine.hover(); setIsMenuOpen(!isMenuOpen); }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-3 rounded-full transition-all duration-300 ${
                            isMenuOpen 
                                ? 'bg-white text-black' 
                                : 'bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06] hover:text-white border border-white/[0.08] hover:border-white/[0.12]'
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
                                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                                className="absolute top-full right-0 mt-3 w-52 bg-zinc-900/90 border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 backdrop-blur-xl overflow-hidden"
                            >
                                <button 
                                    onClick={clearChat}
                                    className="w-full text-left px-5 py-4 hover:bg-white/[0.04] flex items-center gap-3 text-sm text-zinc-300 hover:text-white transition-all duration-200"
                                >
                                    <Plus size={14} strokeWidth={1.5} /> 
                                    <span className="font-light">New Reflection</span>
                                </button>
                                <div className="h-px bg-white/[0.06] mx-4" />
                                <a 
                                    href="/research/"
                                    className="w-full text-left px-5 py-4 hover:bg-white/[0.04] flex items-center gap-3 text-sm text-zinc-300 hover:text-white transition-all duration-200"
                                >
                                    <Shield size={14} strokeWidth={1.5} /> 
                                    <span className="font-light">Research Papers</span>
                                </a>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.header>
            
            {/* Chat Area */}
            <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 pb-40 pt-4 z-10 scrollbar-hide"
            >
                {messages.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="max-w-2xl mx-auto">
                        <AnimatePresence initial={false}>
                            {messages.map((msg, i) => (
                                <Message 
                                    key={i} 
                                    msg={msg} 
                                    isLast={i === messages.length - 1}
                                    isStreaming={i === messages.length - 1 && isLoading}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
                <div ref={bottomRef} className="h-4" />
            </div>
            
            {/* Input Area */}
            <motion.div
                animate={{ 
                    opacity: isIdle ? 0.4 : 1, 
                    y: isIdle ? 20 : 0,
                    filter: isIdle ? 'blur(2px)' : 'blur(0px)'
                }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="absolute bottom-0 left-0 right-0 p-4 pb-6 z-20 safe-bottom"
            >
                {/* Gradient fade */}
                <div className="absolute inset-x-0 bottom-full h-32 bg-gradient-to-t from-[#030305] via-[#030305]/80 to-transparent pointer-events-none" />
                
                <div className="max-w-2xl mx-auto">
                    <motion.div 
                        whileFocus={{ scale: 1.01 }}
                        className="relative bg-zinc-900/60 backdrop-blur-2xl rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/40 overflow-hidden group hover:border-white/[0.12] transition-colors duration-300"
                    >
                        {/* Shimmer effect on hover */}
                        <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        
                        <form onSubmit={handleSend} className="relative flex items-end gap-2 p-3 pl-5">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="What's on your mind?"
                                rows={1}
                                className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none resize-none text-white/90 placeholder-zinc-500 py-3 max-h-40 min-h-[48px] leading-relaxed text-[15px] font-light"
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
                                        className="p-3.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 border border-red-500/20 transition-all duration-200"
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
                                        className="p-3.5 bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white rounded-xl hover:from-violet-400 hover:to-fuchsia-400 disabled:opacity-0 disabled:scale-75 transition-all duration-300 shadow-lg shadow-violet-500/20"
                                    >
                                        <Send size={18} strokeWidth={1.5} />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </form>
                    </motion.div>
                    
                    {/* Footer badge */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex justify-center mt-4"
                    >
                        <div className="flex items-center gap-2 text-[10px] text-zinc-600 tracking-wide">
                            <ShieldCheck size={10} strokeWidth={1.5} />
                            <span>Protected by MirrorGate</span>
                            <span className="text-zinc-700">•</span>
                            <span>v{CONFIG.VERSION}</span>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
