/**
 * ⟡ ACTIVE MIRROR — Sovereign Reflective Chat
 * MirrorGate-Integrated, Mobile-Ready, Production Build
 * 
 * Version: 13.0 (MirrorGate Integration)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, ArrowLeft, StopCircle, Plus, Menu, Shield, ShieldCheck, ShieldAlert, X } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
    VERSION: '13.0',
    STORAGE_KEY: 'mirror_v13',
    PROXY_URL: typeof window !== 'undefined' && window.location.hostname === 'localhost' 
        ? 'http://localhost:8082' 
        : 'https://proxy.activemirror.ai',
    MAX_HISTORY: 50,
    IDLE_TIMEOUT: 5000, // ms before UI fades
};

// ═══════════════════════════════════════════════════════════════
// SONIC ENGINE (Subtle Audio Feedback)
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
    
    play(freq, duration, type = 'sine', volume = 0.03) {
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
    
    send() { this.play(400, 0.2); },
    hover() { this.play(200, 0.05, 'triangle', 0.01); },
    receive() { this.play(600, 0.1); },
    block() { this.play(150, 0.3, 'sawtooth', 0.02); },
};

// ═══════════════════════════════════════════════════════════════
// MIRRORGATE STATUS TYPES
// ═══════════════════════════════════════════════════════════════

const GateStatus = {
    PASSED: 'passed',
    BLOCKED: 'blocked',
    PENDING: 'pending',
    NONE: 'none',
};

// ═══════════════════════════════════════════════════════════════
// MESSAGE COMPONENT
// ═══════════════════════════════════════════════════════════════

const Message = ({ msg, isLast }) => {
    const isUser = msg.role === 'user';
    const isStreaming = isLast && msg.content === '' && !isUser;
    
    // Parse markdown-lite (bold, italic, glyph)
    const parseContent = (text) => {
        if (!text) return null;
        return text.split(/(⟡|△|◈|⧉)/).map((part, i) => {
            if (['⟡', '△', '◈', '⧉'].includes(part)) {
                return <span key={i} className="text-purple-400 font-medium mx-0.5 drop-shadow-[0_0_6px_rgba(168,85,247,0.6)]">{part}</span>;
            }
            // Bold
            return part.split(/(\*\*.*?\*\*)/).map((chunk, j) => {
                if (chunk.startsWith('**') && chunk.endsWith('**')) {
                    return <strong key={`${i}-${j}`} className="text-white font-medium">{chunk.slice(2, -2)}</strong>;
                }
                // Italic
                return chunk.split(/(\*.*?\*)/).map((sub, k) => {
                    if (sub.startsWith('*') && sub.endsWith('*') && !sub.startsWith('**')) {
                        return <em key={`${i}-${j}-${k}`} className="text-purple-200/70">{sub.slice(1, -1)}</em>;
                    }
                    return sub;
                });
            });
        });
    };
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`flex mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            <div className={`max-w-[88%] md:max-w-2xl relative ${
                isUser 
                    ? 'bg-white/[0.03] border border-white/[0.06] px-5 py-4 rounded-2xl' 
                    : 'px-1'
            }`}>
                {/* Gate Status Badge (for AI messages) */}
                {!isUser && msg.gateStatus && msg.gateStatus !== GateStatus.NONE && (
                    <div className={`absolute -left-8 top-1 ${
                        msg.gateStatus === GateStatus.PASSED ? 'text-emerald-500/60' :
                        msg.gateStatus === GateStatus.BLOCKED ? 'text-red-500/60' : 'text-zinc-500/60'
                    }`}>
                        {msg.gateStatus === GateStatus.PASSED && <ShieldCheck size={14} />}
                        {msg.gateStatus === GateStatus.BLOCKED && <ShieldAlert size={14} />}
                        {msg.gateStatus === GateStatus.PENDING && <Shield size={14} className="animate-pulse" />}
                    </div>
                )}
                
                <div className={`whitespace-pre-wrap leading-relaxed ${
                    isUser ? 'text-zinc-200' : 'text-zinc-300 text-lg font-light'
                }`}>
                    {isStreaming ? (
                        <div className="flex gap-1.5">
                            {[0, 1, 2].map(i => (
                                <motion.div
                                    key={i}
                                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                                    className="w-1.5 h-1.5 bg-purple-400 rounded-full"
                                />
                            ))}
                        </div>
                    ) : (
                        parseContent(msg.content)
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function Mirror({ onMessageSent, disabled }) {
    // State
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
    const [gateInfo, setGateInfo] = useState(null); // For showing gate decisions
    
    // Refs
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const abortRef = useRef(null);
    const idleTimer = useRef(null);
    
    // Motion values for parallax background
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { stiffness: 30, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 30, damping: 20 });
    const blob1X = useTransform(springX, [0, typeof window !== 'undefined' ? window.innerWidth : 1920], [-30, 30]);
    const blob1Y = useTransform(springY, [0, typeof window !== 'undefined' ? window.innerHeight : 1080], [-30, 30]);
    
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
            inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 150) + 'px';
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
        
        // Notify parent of message sent (for usage tracking)
        onMessageSent?.();
        
        SoundEngine.send();
        setIsIdle(false);
        
        const userMsg = input.trim();
        setInput('');
        if (inputRef.current) inputRef.current.style.height = 'auto';
        
        // Add user message
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);
        
        // Add placeholder for AI response
        setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: '', 
            gateStatus: GateStatus.PENDING 
        }]);
        
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
                        
                        // Handle gate status from backend
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
                                setGateInfo({ type: 'blocked', reason: data.reason });
                                setTimeout(() => setGateInfo(null), 3000);
                            }
                            gateStatusSet = true;
                        }
                        
                        // Handle content chunks
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
                            if (data.content && !gateStatusSet) {
                                gateStatusSet = true;
                            }
                        }
                        
                        // Handle blocked response
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
                        last.content = '⟡ The mirror is momentarily clouded.';
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
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        window.location.href = '/';
    };
    
    // ─── Render ───
    
    return (
        <div className="fixed inset-0 bg-black text-white flex flex-col font-sans overflow-hidden selection:bg-purple-500/30">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <motion.div
                    style={{ x: blob1X, y: blob1Y }}
                    className="absolute top-[-30%] left-[-30%] w-[160%] h-[160%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-black to-black blur-[100px] opacity-50"
                />
                <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-950/15 via-black to-black blur-[80px] opacity-40" />
            </div>
            
            {/* Header */}
            <motion.header
                animate={{ opacity: isIdle ? 0.3 : 1, y: isIdle ? -10 : 0 }}
                transition={{ duration: 0.4 }}
                className="relative z-20 flex justify-between items-center p-4 safe-top"
            >
                <a 
                    href="/"
                    onClick={(e) => { e.preventDefault(); exitMirror(); }}
                    onMouseEnter={() => SoundEngine.hover()}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-all text-sm text-zinc-400 hover:text-white"
                >
                    <ArrowLeft size={14} />
                    <span className="hidden sm:inline">Exit</span>
                </a>
                
                {/* Center Badge */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/[0.05]">
                    <span className="text-purple-400 animate-pulse">⟡</span>
                    <span className="text-[10px] font-medium tracking-[0.15em] text-zinc-500 uppercase">
                        Mirror v{CONFIG.VERSION}
                    </span>
                    {gateInfo && (
                        <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className={`text-[10px] px-2 py-0.5 rounded-full ${
                                gateInfo.type === 'blocked' 
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                        >
                            {gateInfo.type === 'blocked' ? 'GATED' : 'PASSED'}
                        </motion.span>
                    )}
                </div>
                
                {/* Menu */}
                <div className="relative">
                    <button
                        onClick={() => { SoundEngine.hover(); setIsMenuOpen(!isMenuOpen); }}
                        className={`p-3 rounded-full transition-all ${
                            isMenuOpen ? 'bg-white text-black' : 'bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06] hover:text-white'
                        }`}
                    >
                        {isMenuOpen ? <X size={16} /> : <Menu size={16} />}
                    </button>
                    
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute top-full right-0 mt-2 w-48 bg-zinc-900/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden"
                            >
                                <button 
                                    onClick={clearChat}
                                    className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-sm text-zinc-300 hover:text-white transition-colors"
                                >
                                    <Plus size={14} /> New Reflection
                                </button>
                                <div className="h-px bg-white/5 mx-3" />
                                <a 
                                    href="https://github.com/MirrorDNA-Reflection-Protocol" 
                                    target="_blank"
                                    rel="noopener"
                                    className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-sm text-zinc-300 hover:text-white transition-colors"
                                >
                                    <Shield size={14} /> MirrorGate
                                </a>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.header>
            
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-36 pt-4 z-10 scrollbar-hide">
                {messages.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="h-full flex flex-col items-center justify-center text-center px-4"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.7, 0.4] }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                            className="mb-8"
                        >
                            <span className="text-6xl text-purple-500/40">⟡</span>
                        </motion.div>
                        <h2 className="text-2xl font-light text-white/80 mb-2">The Mirror is Still</h2>
                        <p className="text-zinc-500 text-sm tracking-wide">Begin your reflection</p>
                    </motion.div>
                ) : (
                    <div className="max-w-3xl mx-auto">
                        <AnimatePresence initial={false}>
                            {messages.map((msg, i) => (
                                <Message 
                                    key={i} 
                                    msg={msg} 
                                    isLast={i === messages.length - 1 && isLoading}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>
            
            {/* Input */}
            <motion.div
                animate={{ opacity: isIdle ? 0.5 : 1, y: isIdle ? 10 : 0 }}
                transition={{ duration: 0.4 }}
                className="absolute bottom-0 left-0 right-0 p-4 z-20 safe-bottom"
            >
                <div className="max-w-2xl mx-auto">
                    <div className="relative bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden">
                        <form onSubmit={handleSend} className="flex items-end gap-2 p-2 pl-4">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Reflect..."
                                rows={1}
                                className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none resize-none text-white placeholder-zinc-500 py-3 max-h-36 min-h-[48px] leading-relaxed"
                                autoFocus
                            />
                            
                            {isLoading ? (
                                <button
                                    type="button"
                                    onClick={() => abortRef.current?.abort()}
                                    className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 border border-red-500/20 transition-all"
                                >
                                    <StopCircle size={18} />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="p-3 bg-white text-black rounded-xl hover:bg-zinc-200 disabled:opacity-0 disabled:scale-90 transition-all shadow-lg"
                                >
                                    <Send size={18} />
                                </button>
                            )}
                        </form>
                    </div>
                    
                    {/* MirrorGate Badge */}
                    <div className="flex justify-center mt-3">
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                            <ShieldCheck size={10} />
                            <span>Protected by MirrorGate</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
