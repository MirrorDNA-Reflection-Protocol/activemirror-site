/**
 * ⟡ MIRROR AMBIENT v2 — Clean, Elegant Chat Interface
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Send, Mic, MicOff, Volume2, VolumeX,
    Paperclip, X, Copy, Check, RefreshCw, Download,
    ChevronDown, Sparkles
} from 'lucide-react';
import Logo from '../components/Logo';

const PROXY_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8082'
    : 'https://proxy.activemirror.ai';

// ============================================
// SIMPLE MESSAGE COMPONENT
// ============================================
const Message = ({ message, isLast, onRegenerate }) => {
    const isUser = message.role === 'user';
    const [copied, setCopied] = useState(false);

    const copyText = async () => {
        await navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
        >
            <div className={`max-w-[80%] ${isUser ? 'order-1' : 'order-1'}`}>
                {/* Model indicator - subtle, only for assistant */}
                {!isUser && message.model && (
                    <div className="flex items-center gap-2 mb-1.5 ml-1">
                        <span className="text-[10px] text-white/30 uppercase tracking-wider">
                            {message.model}
                        </span>
                    </div>
                )}

                {/* Message bubble */}
                <div
                    className={`px-4 py-3 rounded-2xl ${
                        isUser
                            ? 'bg-white/10 text-white rounded-br-md'
                            : 'bg-white/[0.03] text-white/90 border border-white/[0.06] rounded-bl-md'
                    }`}
                >
                    {/* User's attached image */}
                    {message.image && (
                        <img
                            src={message.image}
                            alt="Attached"
                            className="max-w-full max-h-48 rounded-lg mb-2"
                        />
                    )}

                    {/* Generated image */}
                    {message.generatedImage && (
                        <div className="mb-3 relative group">
                            <img
                                src={message.generatedImage}
                                alt={message.imagePrompt || "Generated"}
                                className="max-w-full rounded-xl"
                            />
                            <a
                                href={message.generatedImage}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute bottom-2 right-2 p-2 rounded-lg bg-black/60 text-white/60 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Download size={14} />
                            </a>
                        </div>
                    )}

                    {/* Text content */}
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                        {message.content}
                        {message.isStreaming && (
                            <span className="inline-block w-0.5 h-4 ml-0.5 bg-white/50 animate-pulse" />
                        )}
                    </p>
                </div>

                {/* Actions - only for assistant, minimal */}
                {!isUser && !message.isStreaming && message.content && (
                    <div className="flex items-center gap-1 mt-1.5 ml-1 opacity-0 hover:opacity-100 transition-opacity">
                        <button
                            onClick={copyText}
                            className="p-1.5 text-white/20 hover:text-white/50 transition-colors"
                            title="Copy"
                        >
                            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                        {isLast && onRegenerate && (
                            <button
                                onClick={onRegenerate}
                                className="p-1.5 text-white/20 hover:text-white/50 transition-colors"
                                title="Regenerate"
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
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pastedImage, setPastedImage] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [showTierMenu, setShowTierMenu] = useState(false);
    const [currentTier, setCurrentTier] = useState('smart');

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const recognitionRef = useRef(null);

    const tiers = [
        { id: 'smart', name: 'Smart Router', desc: 'Auto-selects best model' },
        { id: 'browser', name: 'Browser', desc: 'Runs locally in browser' },
    ];

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Speech recognition setup
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

    // Handle paste for images
    const handlePaste = useCallback((e) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const file = item.getAsFile();
                const reader = new FileReader();
                reader.onload = (ev) => setPastedImage({ dataUrl: ev.target.result, file });
                reader.readAsDataURL(file);
                break;
            }
        }
    }, []);

    // Submit
    const handleSubmit = async () => {
        const text = input.trim();
        if (!text && !pastedImage) return;
        if (isLoading) return;

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

        // Add streaming placeholder
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
                            setMessages(prev => {
                                const updated = [...prev];
                                const last = updated[updated.length - 1];
                                if (last.id === assistantId) {
                                    updated[updated.length - 1] = { ...last, model: modelName };
                                }
                                return updated;
                            });
                        }

                        if (data.status === 'chunk' && data.content) {
                            fullContent += data.content;
                            setMessages(prev => {
                                const updated = [...prev];
                                const last = updated[updated.length - 1];
                                if (last.id === assistantId) {
                                    updated[updated.length - 1] = { ...last, content: fullContent };
                                }
                                return updated;
                            });
                        }

                        if (data.status === 'image') {
                            setMessages(prev => {
                                const updated = [...prev];
                                const last = updated[updated.length - 1];
                                if (last.id === assistantId) {
                                    updated[updated.length - 1] = {
                                        ...last,
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
                                const last = updated[updated.length - 1];
                                if (last.id === assistantId) {
                                    updated[updated.length - 1] = {
                                        ...last,
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

            // Finalize
            setMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last.id === assistantId && last.isStreaming) {
                    updated[updated.length - 1] = { ...last, isStreaming: false };
                }
                return updated;
            });

            if (voiceEnabled && fullContent) speak(fullContent);

        } catch (err) {
            console.error(err);
            setMessages(prev => prev.filter(m => m.id !== assistantId));
        } finally {
            setIsLoading(false);
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

    return (
        <div className="fixed inset-0 bg-[#0a0a0b] flex flex-col" style={{ height: '100dvh' }}>
            {/* Header - Minimal */}
            <header className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
                <div className="flex items-center gap-3">
                    <a href="/" className="p-2 -ml-2 text-white/40 hover:text-white/60 transition-colors">
                        <ArrowLeft size={18} />
                    </a>
                    <div className="flex items-center gap-2">
                        <Logo size={24} theme="amber" />
                        <span className="text-white/80 font-medium text-sm">Mirror</span>
                    </div>
                </div>

                {/* Tier selector - compact */}
                <div className="relative">
                    <button
                        onClick={() => setShowTierMenu(!showTierMenu)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/60 hover:bg-white/[0.03] transition-colors"
                    >
                        <Sparkles size={12} />
                        <span>{tiers.find(t => t.id === currentTier)?.name}</span>
                        <ChevronDown size={12} className={showTierMenu ? 'rotate-180' : ''} />
                    </button>
                    <AnimatePresence>
                        {showTierMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="absolute right-0 top-full mt-1 w-48 bg-[#141416] border border-white/[0.06] rounded-xl overflow-hidden shadow-xl z-50"
                            >
                                {tiers.map(tier => (
                                    <button
                                        key={tier.id}
                                        onClick={() => { setCurrentTier(tier.id); setShowTierMenu(false); }}
                                        className={`w-full px-3 py-2.5 text-left hover:bg-white/[0.03] transition-colors ${
                                            currentTier === tier.id ? 'bg-white/[0.02]' : ''
                                        }`}
                                    >
                                        <div className="text-white/80 text-sm">{tier.name}</div>
                                        <div className="text-white/30 text-[11px]">{tier.desc}</div>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </header>

            {/* Messages */}
            <main className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-2xl mx-auto">
                    {messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center text-center pt-20"
                        >
                            <Logo size={48} theme="amber" className="mb-6 opacity-60" />
                            <h1 className="text-xl font-light text-white/80 tracking-wide mb-2">
                                Active Mirror
                            </h1>
                            <p className="text-white/30 text-sm max-w-xs">
                                Ask anything. The intelligent router selects the best model for your query.
                            </p>
                        </motion.div>
                    ) : (
                        <>
                            {messages.map((msg, idx) => (
                                <Message
                                    key={msg.id}
                                    message={msg}
                                    isLast={idx === messages.length - 1 && msg.role === 'assistant'}
                                    onRegenerate={regenerate}
                                />
                            ))}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>
            </main>

            {/* Input - Clean */}
            <div className="border-t border-white/[0.04] p-4 bg-[#0a0a0b]">
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
                                        className="h-16 w-16 object-cover rounded-lg border border-white/10"
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
                        {/* Attach */}
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
                                if (file && file.type.startsWith('image/')) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => setPastedImage({ dataUrl: ev.target.result, file });
                                    reader.readAsDataURL(file);
                                }
                                e.target.value = '';
                            }}
                        />

                        {/* Mic */}
                        <button
                            onClick={toggleListening}
                            className={`p-2.5 transition-colors ${
                                isListening ? 'text-red-400' : 'text-white/30 hover:text-white/50'
                            }`}
                        >
                            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>

                        {/* Input */}
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
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-white text-[15px] placeholder-white/25 resize-none focus:outline-none focus:border-white/10 transition-colors disabled:opacity-50"
                                style={{ minHeight: '48px', maxHeight: '120px' }}
                            />
                        </div>

                        {/* Send */}
                        <motion.button
                            onClick={handleSubmit}
                            disabled={(!input.trim() && !pastedImage) || isLoading}
                            className="p-2.5 rounded-xl bg-white/10 text-white/60 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/15 transition-colors"
                            whileTap={{ scale: 0.95 }}
                        >
                            {isLoading ? (
                                <div className="w-[18px] h-[18px] border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                            ) : (
                                <Send size={18} />
                            )}
                        </motion.button>

                        {/* Voice */}
                        <button
                            onClick={() => setVoiceEnabled(!voiceEnabled)}
                            className={`p-2.5 transition-colors ${
                                voiceEnabled ? 'text-violet-400' : 'text-white/30 hover:text-white/50'
                            }`}
                        >
                            {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MirrorAmbient;
