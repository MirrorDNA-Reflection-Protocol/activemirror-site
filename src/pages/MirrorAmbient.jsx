/**
 * ⟡ MIRROR AMBIENT v3 — Glass Morphism + Graph Aesthetics
 *
 * Visual language inspired by Obsidian's knowledge graphs:
 * - Floating particles (nodes)
 * - Glass morphism (frosted surfaces)
 * - Model-specific accent colors
 * - Shadow thoughts (transparent reasoning)
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Send, Mic, MicOff, Volume2, VolumeX,
    Paperclip, X, Copy, Check, RefreshCw, Download,
    ChevronDown, Shield
} from 'lucide-react';
import Logo from '../components/Logo';
import ConsentGate from '../components/ConsentGate';

const PROXY_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8082'
    : 'https://proxy.activemirror.ai';

// ============================================
// MODEL COLORS - Each model has a signature color
// ============================================
const MODEL_COLORS = {
    'Llama 3.3 70B': { primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.15)' },      // Amber
    'DeepSeek R1': { primary: '#06b6d4', glow: 'rgba(6, 182, 212, 0.15)' },          // Cyan
    'Mistral Large': { primary: '#a855f7', glow: 'rgba(168, 85, 247, 0.15)' },       // Violet
    'FLUX Schnell': { primary: '#10b981', glow: 'rgba(16, 185, 129, 0.15)' },        // Emerald
    'Llama 4 Scout': { primary: '#3b82f6', glow: 'rgba(59, 130, 246, 0.15)' },       // Blue
    default: { primary: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.15)' }                // Purple
};

const getModelColor = (model) => MODEL_COLORS[model] || MODEL_COLORS.default;

// ============================================
// SAFETY - Crisis detection
// ============================================
const CRISIS_PATTERN = /\b(kill\s*(myself|me)|suicide|end\s*(my|it\s*all)|hurt\s*myself|self.?harm|want\s*to\s*die)\b/i;
const CRISIS_RESOURCES = {
    message: "I noticed you might be going through a difficult time. Please know that help is available.",
    resources: [
        { name: "National Suicide Prevention Lifeline", contact: "988 (US)" },
        { name: "Crisis Text Line", contact: "Text HOME to 741741" },
        { name: "International Association for Suicide Prevention", contact: "https://www.iasp.info/resources/Crisis_Centres/" }
    ]
};

// ============================================
// FLOATING PARTICLES - Graph-like nodes
// ============================================
const Particle = ({ delay, color }) => {
    const size = Math.random() * 3 + 1;
    const startX = Math.random() * 100;
    const duration = Math.random() * 30 + 25;
    const drift = Math.random() * 60 - 30;

    return (
        <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
                width: size,
                height: size,
                left: `${startX}%`,
                background: color,
                boxShadow: `0 0 ${size * 3}px ${color}`
            }}
            initial={{ y: '110vh', opacity: 0 }}
            animate={{
                y: '-10vh',
                opacity: [0, 0.6, 0.6, 0],
                x: [0, drift, 0]
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

// ============================================
// SHADOW THOUGHTS - Transparent reasoning
// ============================================
const ShadowThoughts = ({ thought, color }) => (
    <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        className="fixed bottom-32 left-1/2 -translate-x-1/2 z-40 max-w-md w-[90%]"
    >
        <div
            className="px-5 py-3 rounded-2xl backdrop-blur-xl border border-white/[0.08] shadow-2xl"
            style={{
                background: 'rgba(15, 15, 18, 0.8)',
                boxShadow: `0 0 40px ${color}20`
            }}
        >
            <div className="flex items-center gap-2 mb-1">
                <motion.div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: color }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                    Shadow Intent
                </span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed italic">
                {thought}
            </p>
        </div>
    </motion.div>
);

// ============================================
// GLASS MESSAGE BUBBLE
// ============================================
const Message = ({ message, isLast, onRegenerate, accentColor }) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';
    const [copied, setCopied] = useState(false);
    const color = getModelColor(message.model);

    const copyText = async () => {
        await navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 group`}
        >
            <div className={`max-w-[85%] relative`}>
                {/* Connecting line to previous (graph edge effect) */}
                {!isUser && !isSystem && (
                    <div
                        className="absolute -left-4 top-1/2 w-3 h-px opacity-20"
                        style={{ background: color.primary }}
                    />
                )}

                {/* Model indicator with color dot */}
                {!isUser && !isSystem && message.model && (
                    <div className="flex items-center gap-2 mb-1.5 ml-1">
                        <motion.div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: color.primary }}
                            animate={{ boxShadow: [`0 0 4px ${color.primary}`, `0 0 8px ${color.primary}`, `0 0 4px ${color.primary}`] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <span className="text-[10px] text-white/40 uppercase tracking-wider">
                            {message.model}
                        </span>
                    </div>
                )}

                {/* Glass bubble */}
                <div
                    className={`px-4 py-3 rounded-2xl backdrop-blur-md transition-all duration-300 ${
                        isSystem
                            ? 'bg-amber-500/10 border border-amber-500/20'
                            : isUser
                                ? 'bg-white/[0.08] border border-white/[0.08] rounded-br-md'
                                : 'bg-white/[0.03] border border-white/[0.05] rounded-bl-md'
                    }`}
                    style={!isUser && !isSystem ? {
                        boxShadow: `0 0 30px ${color.glow}`,
                        borderColor: `${color.primary}15`
                    } : {}}
                >
                    {/* System message header */}
                    {isSystem && (
                        <div className="flex items-center gap-2 mb-2">
                            <Shield size={14} className="text-amber-400" />
                            <span className="text-amber-400 text-xs font-medium">Support Resources</span>
                        </div>
                    )}

                    {/* User's attached image */}
                    {message.image && (
                        <img
                            src={message.image}
                            alt="Attached"
                            className="max-w-full max-h-48 rounded-xl mb-3 border border-white/10"
                        />
                    )}

                    {/* Generated image */}
                    {message.generatedImage && (
                        <div className="mb-3 relative group/img">
                            <img
                                src={message.generatedImage}
                                alt={message.imagePrompt || "Generated"}
                                className="max-w-full rounded-xl border border-white/10"
                            />
                            <a
                                href={message.generatedImage}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute bottom-2 right-2 p-2 rounded-lg bg-black/60 backdrop-blur-sm text-white/60 hover:text-white opacity-0 group-hover/img:opacity-100 transition-opacity"
                            >
                                <Download size={14} />
                            </a>
                            {message.imagePrompt && (
                                <p className="text-[10px] text-white/30 mt-2 italic text-center">
                                    "{message.imagePrompt}"
                                </p>
                            )}
                        </div>
                    )}

                    {/* Text content */}
                    <p className={`text-[15px] leading-relaxed whitespace-pre-wrap ${
                        isSystem ? 'text-amber-200/90' : 'text-white/90'
                    }`}>
                        {message.content}
                        {message.isStreaming && (
                            <motion.span
                                className="inline-block w-0.5 h-4 ml-0.5 rounded-full"
                                style={{ background: color.primary }}
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                            />
                        )}
                    </p>

                    {/* Crisis resources */}
                    {message.resources && (
                        <div className="mt-3 pt-3 border-t border-amber-500/20 space-y-2">
                            {message.resources.map((r, i) => (
                                <div key={i} className="text-xs">
                                    <span className="text-amber-300">{r.name}:</span>
                                    <span className="text-amber-200/70 ml-2">{r.contact}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions - glass style */}
                {!isUser && !isSystem && !message.isStreaming && message.content && (
                    <div className="flex items-center gap-1 mt-1.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                            onClick={copyText}
                            className="p-1.5 rounded-lg text-white/25 hover:text-white/50 hover:bg-white/5 transition-all"
                        >
                            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                        {isLast && onRegenerate && (
                            <button
                                onClick={onRegenerate}
                                className="p-1.5 rounded-lg text-white/25 hover:text-white/50 hover:bg-white/5 transition-all"
                            >
                                <RefreshCw size={12} />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================
const MirrorAmbient = () => {
    const [hasConsented, setHasConsented] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pastedImage, setPastedImage] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [shadowThought, setShadowThought] = useState(null);
    const [currentModel, setCurrentModel] = useState(null);
    const [showTierMenu, setShowTierMenu] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const recognitionRef = useRef(null);

    // Current accent color based on last model used
    const accentColor = useMemo(() =>
        getModelColor(currentModel),
        [currentModel]
    );

    // Generate particles
    const particles = useMemo(() =>
        Array.from({ length: 20 }, (_, i) => ({ id: i, delay: i * 1.5 })),
        []
    );

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input after consent
    useEffect(() => {
        if (hasConsented) inputRef.current?.focus();
    }, [hasConsented]);

    // Speech recognition
    useEffect(() => {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SR();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.onresult = (e) => {
                const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
                setInput(transcript);
            };
            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const speak = useCallback((text) => {
        if (!voiceEnabled || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    }, [voiceEnabled]);

    const handlePaste = useCallback((e) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const file = item.getAsFile();
                const reader = new FileReader();
                reader.onload = (ev) => setPastedImage({ dataUrl: ev.target.result });
                reader.readAsDataURL(file);
                break;
            }
        }
    }, []);

    const handleSubmit = async () => {
        const text = input.trim();
        if (!text && !pastedImage) return;
        if (isLoading) return;

        // Crisis check
        if (CRISIS_PATTERN.test(text)) {
            setMessages(prev => [...prev,
                { id: `user-${Date.now()}`, role: 'user', content: text },
                { id: `system-${Date.now()}`, role: 'system', content: CRISIS_RESOURCES.message, resources: CRISIS_RESOURCES.resources }
            ]);
            setInput('');
            return;
        }

        const messageText = text || "What's in this image?";
        const userMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: messageText,
            image: pastedImage?.dataUrl || null
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Keep focus on input for continuous typing
        setTimeout(() => inputRef.current?.focus(), 0);
        setShadowThought("Analyzing intent and selecting optimal model...");

        const assistantId = `assistant-${Date.now()}`;
        setMessages(prev => [...prev, {
            id: assistantId,
            role: 'assistant',
            content: '',
            isStreaming: true
        }]);

        try {
            const response = await fetch(`${PROXY_URL}/mirror`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: messageText,
                    image: pastedImage?.dataUrl
                })
            });

            setPastedImage(null);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';
            let modelName = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(l => l.trim());

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);

                        if (data.status === 'routing' && data.model_info) {
                            modelName = data.model_info.model;
                            setCurrentModel(modelName);
                            setShadowThought(`Routing to ${modelName}...`);
                            setTimeout(() => setShadowThought(null), 2000);

                            setMessages(prev => {
                                const updated = [...prev];
                                const idx = updated.findIndex(m => m.id === assistantId);
                                if (idx !== -1) updated[idx] = { ...updated[idx], model: modelName };
                                return updated;
                            });
                        }

                        if (data.status === 'chunk' && data.content) {
                            fullContent += data.content;
                            setMessages(prev => {
                                const updated = [...prev];
                                const idx = updated.findIndex(m => m.id === assistantId);
                                if (idx !== -1) updated[idx] = { ...updated[idx], content: fullContent };
                                return updated;
                            });
                        }

                        if (data.status === 'image') {
                            setMessages(prev => {
                                const updated = [...prev];
                                const idx = updated.findIndex(m => m.id === assistantId);
                                if (idx !== -1) {
                                    updated[idx] = {
                                        ...updated[idx],
                                        generatedImage: data.image_url,
                                        imagePrompt: data.prompt
                                    };
                                }
                                return updated;
                            });
                        }

                        if (data.status === 'done') {
                            setMessages(prev => {
                                const updated = [...prev];
                                const idx = updated.findIndex(m => m.id === assistantId);
                                if (idx !== -1) {
                                    updated[idx] = {
                                        ...updated[idx],
                                        content: fullContent || data.response || '',
                                        isStreaming: false,
                                        model: data.model_used || modelName
                                    };
                                }
                                return updated;
                            });
                        }
                    } catch {}
                }
            }

            setMessages(prev => {
                const updated = [...prev];
                const idx = updated.findIndex(m => m.id === assistantId);
                if (idx !== -1 && updated[idx].isStreaming) {
                    updated[idx] = { ...updated[idx], isStreaming: false };
                }
                return updated;
            });

            if (voiceEnabled && fullContent) speak(fullContent);

        } catch (err) {
            console.error(err);
            setMessages(prev => prev.filter(m => m.id !== assistantId));
            setShadowThought(null);
        } finally {
            setIsLoading(false);
            // Refocus input for continuous conversation
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
        if (e.key === 'Escape') {
            setInput('');
            setPastedImage(null);
        }
    };

    const regenerate = useCallback(() => {
        if (messages.length < 2 || isLoading) return;
        let lastUserIdx = -1;
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === 'user') { lastUserIdx = i; break; }
        }
        if (lastUserIdx === -1) return;
        setMessages(messages.slice(0, lastUserIdx + 1));
        setInput(messages[lastUserIdx].content);
    }, [messages, isLoading]);

    // Consent gate
    if (!hasConsented) {
        return <ConsentGate onConsent={() => setHasConsented(true)} />;
    }

    return (
        <div className="fixed inset-0 bg-[#08080a] flex flex-col overflow-hidden" style={{ height: '100dvh' }}>
            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {particles.map(p => (
                    <Particle key={p.id} delay={p.delay} color={accentColor.primary} />
                ))}
            </div>

            {/* Ambient gradient */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{
                    background: `radial-gradient(ellipse at 50% 0%, ${accentColor.glow}, transparent 60%)`
                }}
                transition={{ duration: 1 }}
            />

            {/* Shadow thoughts overlay */}
            <AnimatePresence>
                {shadowThought && (
                    <ShadowThoughts thought={shadowThought} color={accentColor.primary} />
                )}
            </AnimatePresence>

            {/* Header - Glass */}
            <header className="relative z-20 flex items-center justify-between px-4 py-3 border-b border-white/[0.04] backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <a href="/" className="p-2 -ml-2 text-white/40 hover:text-white/60 transition-colors">
                        <ArrowLeft size={18} />
                    </a>
                    <div className="flex items-center gap-2">
                        <Logo size={24} theme="amber" />
                        <span className="text-white/80 font-medium text-sm">Mirror</span>
                    </div>
                </div>

                {/* Model indicator */}
                {currentModel && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]"
                    >
                        <motion.div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: accentColor.primary }}
                            animate={{ boxShadow: [`0 0 4px ${accentColor.primary}`, `0 0 8px ${accentColor.primary}`] }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
                        />
                        <span className="text-[11px] text-white/50">{currentModel}</span>
                    </motion.div>
                )}
            </header>

            {/* Messages */}
            <main className="relative z-10 flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-2xl mx-auto">
                    {messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="h-full flex flex-col items-center justify-center text-center pt-20"
                        >
                            <motion.div
                                animate={{
                                    boxShadow: [`0 0 40px ${accentColor.glow}`, `0 0 60px ${accentColor.glow}`, `0 0 40px ${accentColor.glow}`]
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="mb-8 p-6 rounded-full bg-white/[0.02] border border-white/[0.05]"
                            >
                                <Logo size={48} theme="amber" />
                            </motion.div>
                            <h1 className="text-xl font-light text-white/80 tracking-wide mb-3">
                                Active Mirror ⟡
                            </h1>
                            <p className="text-white/30 text-sm max-w-sm leading-relaxed">
                                Sovereign reflection engine. The intelligent router automatically selects the best model for your query.
                            </p>
                            <div className="flex gap-4 mt-8">
                                {Object.entries(MODEL_COLORS).slice(0, 4).map(([name, color]) => (
                                    <div key={name} className="flex items-center gap-1.5">
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ background: color.primary, boxShadow: `0 0 6px ${color.primary}` }}
                                        />
                                        <span className="text-[10px] text-white/30">{name.split(' ')[0]}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <>
                            {messages.map((msg, idx) => (
                                <Message
                                    key={msg.id}
                                    message={msg}
                                    isLast={idx === messages.length - 1 && msg.role === 'assistant'}
                                    onRegenerate={regenerate}
                                    accentColor={accentColor}
                                />
                            ))}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>
            </main>

            {/* Input - Glass */}
            <div className="relative z-20 border-t border-white/[0.04] p-4 backdrop-blur-sm bg-[#08080a]/80">
                <div className="max-w-2xl mx-auto">
                    {/* Image preview */}
                    <AnimatePresence>
                        {pastedImage && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-3"
                            >
                                <div className="relative inline-block">
                                    <img
                                        src={pastedImage.dataUrl}
                                        alt="Attached"
                                        className="h-16 w-16 object-cover rounded-xl border border-white/10"
                                    />
                                    <button
                                        onClick={() => setPastedImage(null)}
                                        className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-black border border-white/10 text-white/60 hover:text-white"
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-end gap-2">
                        <button
                            onClick={() => document.getElementById('file-input').click()}
                            className="p-2.5 text-white/30 hover:text-white/50 transition-colors"
                        >
                            <Paperclip size={18} />
                        </button>
                        <input
                            type="file"
                            id="file-input"
                            hidden
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file?.type.startsWith('image/')) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => setPastedImage({ dataUrl: ev.target.result });
                                    reader.readAsDataURL(file);
                                }
                                e.target.value = '';
                            }}
                        />

                        <button
                            onClick={toggleListening}
                            className={`p-2.5 transition-colors ${isListening ? 'text-red-400' : 'text-white/30 hover:text-white/50'}`}
                        >
                            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>

                        <div className="flex-1 relative">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onPaste={handlePaste}
                                placeholder={isListening ? "Listening..." : "Message Mirror..."}
                                disabled={isLoading}
                                rows={1}
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-white text-[15px] placeholder-white/25 resize-none focus:outline-none focus:border-white/10 focus:bg-white/[0.04] transition-all disabled:opacity-50 backdrop-blur-sm"
                                style={{ minHeight: '48px', maxHeight: '120px' }}
                            />
                        </div>

                        <motion.button
                            onClick={handleSubmit}
                            disabled={(!input.trim() && !pastedImage) || isLoading}
                            className="p-2.5 rounded-xl text-white/60 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                            style={{
                                background: (input.trim() || pastedImage) && !isLoading
                                    ? `${accentColor.primary}30`
                                    : 'rgba(255,255,255,0.05)'
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isLoading ? (
                                <motion.div
                                    className="w-[18px] h-[18px] border-2 rounded-full"
                                    style={{ borderColor: `${accentColor.primary}30`, borderTopColor: accentColor.primary }}
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                />
                            ) : (
                                <Send size={18} />
                            )}
                        </motion.button>

                        <button
                            onClick={() => setVoiceEnabled(!voiceEnabled)}
                            className={`p-2.5 transition-colors ${voiceEnabled ? 'text-violet-400' : 'text-white/30 hover:text-white/50'}`}
                        >
                            {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                        </button>
                    </div>

                    {/* Subtle footer */}
                    <div className="flex items-center justify-center gap-3 mt-3">
                        <span className="text-[10px] text-white/20">⟡ Sovereign Reflection</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MirrorAmbient;
