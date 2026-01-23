/**
 * ⟡ MIRROR AMBIENT — Conversational AI with 2030 Aesthetic
 *
 * A full ChatGPT/Claude-like experience with:
 * - Streaming responses
 * - Conversation history
 * - Sentiment-aware atmosphere
 * - Ambient visual design
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Sparkles, RotateCcw, Trash2 } from 'lucide-react';

const PROXY_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8082'
    : 'https://proxy.activemirror.ai';

// Sentiment analysis
const analyzeSentiment = (text) => {
    const lower = text.toLowerCase();
    const emotions = {
        joy: ['happy', 'excited', 'love', 'wonderful', 'amazing', 'great', 'joy', 'grateful', 'awesome', 'fantastic'],
        sadness: ['sad', 'depressed', 'lonely', 'hurt', 'pain', 'crying', 'miss', 'lost', 'grief', 'empty'],
        anger: ['angry', 'furious', 'frustrated', 'hate', 'annoyed', 'mad', 'irritated'],
        fear: ['scared', 'afraid', 'anxious', 'worried', 'nervous', 'panic', 'terrified'],
        hope: ['hope', 'dream', 'wish', 'future', 'maybe', 'possible', 'believe'],
        calm: ['peaceful', 'calm', 'relaxed', 'content', 'serene', 'quiet'],
        curiosity: ['wonder', 'curious', 'what if', 'why', 'how', 'think', 'question']
    };

    let detected = 'neutral';
    let maxScore = 0;
    for (const [emotion, words] of Object.entries(emotions)) {
        const score = words.filter(w => lower.includes(w)).length;
        if (score > maxScore) { maxScore = score; detected = emotion; }
    }
    return detected;
};

// Emotion-to-atmosphere mapping
const emotionAtmospheres = {
    joy: { primary: '#fbbf24', secondary: '#f97316', glow: 'rgba(251, 191, 36, 0.25)' },
    sadness: { primary: '#3b82f6', secondary: '#6366f1', glow: 'rgba(59, 130, 246, 0.25)' },
    anger: { primary: '#ef4444', secondary: '#f97316', glow: 'rgba(239, 68, 68, 0.25)' },
    fear: { primary: '#8b5cf6', secondary: '#6366f1', glow: 'rgba(139, 92, 246, 0.25)' },
    hope: { primary: '#10b981', secondary: '#06b6d4', glow: 'rgba(16, 185, 129, 0.25)' },
    calm: { primary: '#06b6d4', secondary: '#8b5cf6', glow: 'rgba(6, 182, 212, 0.25)' },
    curiosity: { primary: '#f59e0b', secondary: '#ec4899', glow: 'rgba(245, 158, 11, 0.25)' },
    neutral: { primary: '#8b5cf6', secondary: '#06b6d4', glow: 'rgba(139, 92, 246, 0.25)' }
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
    const patterns = { light: [10], medium: [20], success: [10, 50, 10, 50, 30] };
    navigator.vibrate(patterns[pattern] || patterns.light);
};

// Floating particle
const Particle = ({ delay, atmosphere }) => {
    const size = Math.random() * 3 + 1;
    const startX = Math.random() * 100;
    const duration = Math.random() * 25 + 20;

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
                opacity: [0, 0.5, 0.5, 0],
                x: [0, Math.random() * 40 - 20, 0]
            }}
            transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
        />
    );
};

// Message bubble component
const MessageBubble = ({ message, atmosphere, isLatest }) => {
    const isUser = message.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
        >
            <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                    isUser
                        ? 'bg-white/10 border border-white/10'
                        : 'bg-white/5 border border-white/5'
                }`}
                style={isUser ? {
                    borderColor: `${atmosphere.primary}30`,
                    boxShadow: `0 0 20px ${atmosphere.primary}10`
                } : {}}
            >
                {!isUser && (
                    <div className="flex items-center gap-2 mb-1">
                        <span style={{ color: atmosphere.primary }} className="text-sm">⟡</span>
                        <span className="text-white/40 text-xs">Mirror</span>
                    </div>
                )}
                <p className={`text-sm leading-relaxed ${isUser ? 'text-white' : 'text-white/85'}`}>
                    {message.content}
                    {message.isStreaming && (
                        <span className="inline-block w-2 h-4 ml-1 bg-white/50 animate-pulse" />
                    )}
                </p>
            </div>
        </motion.div>
    );
};

const MirrorAmbient = () => {
    const [timeAtmosphere] = useState(getTimeAtmosphere);
    const [emotionAtmosphere, setEmotionAtmosphere] = useState(emotionAtmospheres.neutral);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Generate particles
    const particles = useMemo(() =>
        Array.from({ length: 15 }, (_, i) => ({ id: i, delay: i * 1.2 }))
    , []);

    // Blend atmospheres
    const atmosphere = useMemo(() => ({
        ...emotionAtmosphere,
        phase: timeAtmosphere.phase
    }), [emotionAtmosphere, timeAtmosphere]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Analyze input sentiment in real-time
    useEffect(() => {
        if (input.length > 10) {
            const emotion = analyzeSentiment(input);
            setEmotionAtmosphere(emotionAtmospheres[emotion]);
        }
    }, [input]);

    const handleSubmit = async () => {
        const text = input.trim();
        if (!text || isLoading) return;

        haptic('medium');
        setError(null);

        // Detect emotion from input
        const emotion = analyzeSentiment(text);
        setEmotionAtmosphere(emotionAtmospheres[emotion]);

        // Add user message
        const userMessage = { role: 'user', content: text };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        // Add placeholder for assistant response
        const assistantMessage = { role: 'assistant', content: '', isStreaming: true };
        setMessages([...newMessages, assistantMessage]);

        try {
            const response = await fetch(`${PROXY_URL}/mirror`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    messages: newMessages.slice(-10).map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                }),
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            // Read streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim());

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (data.status === 'chunk' && data.content) {
                            fullContent += data.content;
                            // Update message with streamed content
                            setMessages(prev => {
                                const updated = [...prev];
                                updated[updated.length - 1] = {
                                    role: 'assistant',
                                    content: fullContent,
                                    isStreaming: true
                                };
                                return updated;
                            });
                        } else if (data.status === 'done') {
                            // Streaming complete
                            setMessages(prev => {
                                const updated = [...prev];
                                updated[updated.length - 1] = {
                                    role: 'assistant',
                                    content: fullContent || data.response || '',
                                    isStreaming: false
                                };
                                return updated;
                            });
                        }
                    } catch (e) {
                        // Not JSON, might be raw text
                        if (line.trim() && !line.includes('{')) {
                            fullContent += line;
                        }
                    }
                }
            }

            // Finalize message
            setMessages(prev => {
                const updated = [...prev];
                if (updated[updated.length - 1].isStreaming) {
                    updated[updated.length - 1] = {
                        role: 'assistant',
                        content: fullContent || 'I received your message.',
                        isStreaming: false
                    };
                }
                return updated;
            });

            haptic('success');
        } catch (err) {
            console.error('API Error:', err);
            setError(err.message);
            // Remove the streaming placeholder on error
            setMessages(prev => prev.filter(m => !m.isStreaming));
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const clearChat = () => {
        setMessages([]);
        setError(null);
        haptic('light');
    };

    return (
        <div className="fixed inset-0 bg-black flex flex-col" style={{ height: '100dvh' }}>
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
                    background: `radial-gradient(circle at 50% 20%, ${atmosphere.primary}20, transparent 50%)`
                }}
                transition={{ duration: 1.5 }}
            />

            {/* Ambient glow */}
            <motion.div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none blur-[120px]"
                animate={{ backgroundColor: atmosphere.glow }}
                transition={{ duration: 1.5 }}
            />

            {/* Header */}
            <header className="relative z-20 flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <a href="/" className="p-2 rounded-full bg-white/10 text-white/60 active:scale-95 transition-transform">
                        <ArrowLeft size={18} />
                    </a>
                    <div className="flex items-center gap-2">
                        <motion.span
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            style={{ color: atmosphere.primary, textShadow: `0 0 20px ${atmosphere.primary}` }}
                            className="text-xl"
                        >
                            ⟡
                        </motion.span>
                        <span className="text-white/80 font-medium">Mirror</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Sparkles size={12} style={{ color: atmosphere.primary }} className="animate-pulse" />
                    <span className="text-white/30 text-xs uppercase tracking-widest">{atmosphere.phase}</span>
                    {messages.length > 0 && (
                        <button
                            onClick={clearChat}
                            className="ml-2 p-2 rounded-full bg-white/5 text-white/40 hover:text-white/60 transition-colors"
                            title="Clear chat"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </header>

            {/* Messages area */}
            <main className="relative z-10 flex-1 overflow-y-auto px-4 py-4">
                {messages.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="h-full flex flex-col items-center justify-center text-center"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="text-6xl mb-6"
                            style={{ color: atmosphere.primary, textShadow: `0 0 40px ${atmosphere.primary}` }}
                        >
                            ⟡
                        </motion.div>
                        <h2 className="text-white/70 text-xl font-light mb-2">What's on your mind?</h2>
                        <p className="text-white/30 text-sm max-w-xs">
                            I'm here to chat, help think through ideas, answer questions, or just listen.
                        </p>
                    </motion.div>
                ) : (
                    <div className="max-w-2xl mx-auto">
                        <AnimatePresence>
                            {messages.map((message, index) => (
                                <MessageBubble
                                    key={index}
                                    message={message}
                                    atmosphere={atmosphere}
                                    isLatest={index === messages.length - 1}
                                />
                            ))}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                    </div>
                )}

                {/* Error display */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl mx-auto mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
                    >
                        <p className="text-red-400 text-sm text-center">
                            Connection error: {error}
                            <button
                                onClick={() => setError(null)}
                                className="ml-2 text-red-300 underline"
                            >
                                Dismiss
                            </button>
                        </p>
                    </motion.div>
                )}
            </main>

            {/* Input area */}
            <div
                className="relative z-20 p-4 border-t border-white/5"
                style={{
                    paddingBottom: 'env(safe-area-inset-bottom, 16px)',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.7))'
                }}
            >
                <div className="max-w-2xl mx-auto relative">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything..."
                        disabled={isLoading}
                        className="w-full px-4 py-3 pr-14 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 resize-none focus:outline-none focus:border-white/20 text-base transition-all disabled:opacity-50"
                        style={{
                            minHeight: '52px',
                            maxHeight: '150px',
                            borderColor: input.length > 10 ? `${atmosphere.primary}40` : undefined
                        }}
                        rows={1}
                    />
                    <motion.button
                        onClick={handleSubmit}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 bottom-2 p-2.5 rounded-xl text-white/60 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                        style={{
                            background: input.trim() && !isLoading ? `${atmosphere.primary}40` : 'rgba(255,255,255,0.1)'
                        }}
                        whileTap={{ scale: 0.9 }}
                    >
                        {isLoading ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                                <RotateCcw size={18} />
                            </motion.div>
                        ) : (
                            <Send size={18} />
                        )}
                    </motion.button>
                </div>
                <p className="text-center text-white/20 text-xs mt-2">
                    Mirror may make mistakes. Verify important information.
                </p>
            </div>
        </div>
    );
};

export default MirrorAmbient;
