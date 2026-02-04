/**
 * ⟡ AI Twins — Cognitive Companions
 * Based on MirrorAmbient's proven streaming approach
 * Each twin amplifies a specific cognitive function
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Compass, Layers, Eye, Home, Send, X, ArrowLeft
} from 'lucide-react';
import BottomNav from '../components/BottomNav';
import ThemeToggle from '../components/ThemeToggle';
import ConsentGate from '../components/ConsentGate';
import { useTheme } from '../contexts/ThemeContext';
import { hasSessionConsent } from '../utils/consent';

const PROXY_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8082'
    : 'https://proxy.activemirror.ai';

// Twin definitions - each amplifies a cognitive function
const TWINS = {
    guardian: {
        name: 'Guardian',
        icon: Shield,
        tagline: 'Protects your focus',
        description: 'Your cognitive firewall. Filters noise, protects boundaries, keeps you aligned with what matters.',
        color: '#3b82f6',
        gradient: 'from-blue-500 to-cyan-500',
        glyph: '⟡',
        amplifies: 'Focus & Boundaries',
        systemPrompt: `You are the Guardian, a cognitive companion focused on protecting focus and filtering noise.

Your purpose: Help users maintain boundaries, assess if things align with their goals, and protect their attention from distractions.

Style: Direct, protective, like a wise advisor. Warm but firm.
Format: Keep responses to 2-4 sentences. Start with ⟡`
    },
    scout: {
        name: 'Scout',
        icon: Compass,
        tagline: 'Explores possibilities',
        description: 'Your cognitive explorer. Ventures into unknown territory, finds connections, surfaces opportunities.',
        color: '#10b981',
        gradient: 'from-emerald-500 to-green-500',
        glyph: '◈',
        amplifies: 'Discovery & Connections',
        systemPrompt: `You are the Scout, a cognitive companion focused on exploration and discovery.

Your purpose: Find unexpected connections, surface opportunities others might miss, explore adjacent possibilities.

Style: Curious, adventurous, always looking for new angles. Enthusiastic but grounded.
Format: Keep responses to 2-4 sentences. Start with ◈`
    },
    synthesizer: {
        name: 'Synthesizer',
        icon: Layers,
        tagline: 'Connects the dots',
        description: 'Your cognitive integrator. Weaves ideas into frameworks, finds patterns, creates coherence from chaos.',
        color: '#8b5cf6',
        gradient: 'from-violet-500 to-purple-500',
        glyph: '◇',
        amplifies: 'Pattern Recognition',
        systemPrompt: `You are the Synthesizer, a cognitive companion focused on integration and pattern recognition.

Your purpose: Find patterns across disparate concepts, build unifying structures, create coherence from chaos.

Style: Integrative, systematic, weaving threads together. Insightful and structured.
Format: Keep responses to 2-4 sentences. Start with ◇`
    },
    mirror: {
        name: 'Mirror',
        icon: Eye,
        tagline: 'Reveals blind spots',
        description: 'Your cognitive reflector. Shows what you cannot see, asks uncomfortable questions, illuminates shadows.',
        color: '#f59e0b',
        gradient: 'from-amber-500 to-orange-500',
        glyph: '◎',
        amplifies: 'Self-Awareness',
        systemPrompt: `You are the Mirror, a cognitive companion focused on reflection and revealing blind spots.

Your purpose: Ask questions that reveal assumptions, show what they might not see, challenge thinking gently.

Style: Honest, reflective, like a trusted friend who tells hard truths. Compassionate but direct.
Format: Keep responses to 2-4 sentences. Start with ◎`
    }
};

export default function Twins() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [hasConsented, setHasConsented] = useState(false);
    const [activeTwin, setActiveTwin] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const inputRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (hasSessionConsent()) setHasConsented(true);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (activeTwin) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [activeTwin]);

    const openTwin = (twinKey) => {
        setActiveTwin(twinKey);
        setMessages([]);
        setInput('');
    };

    const closeTwin = () => {
        setActiveTwin(null);
        setMessages([]);
    };

    const sendMessage = async (text = input.trim()) => {
        if (!text || isLoading || !activeTwin) return;

        const twin = TWINS[activeTwin];

        // Add user message
        const userMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: text
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
                    message: text,
                    systemPrompt: twin.systemPrompt,
                    history: messages.slice(-10).map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                })
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(l => l.trim());

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);

                        if (data.status === 'chunk' && data.content) {
                            fullContent += data.content;
                            setMessages(prev => {
                                const updated = [...prev];
                                const idx = updated.findIndex(m => m.id === assistantId);
                                if (idx !== -1) {
                                    updated[idx] = { ...updated[idx], content: fullContent };
                                }
                                return updated;
                            });
                        }
                    } catch (e) {
                        // Skip non-JSON lines
                    }
                }
            }

            // Finalize message
            setMessages(prev => {
                const updated = [...prev];
                const idx = updated.findIndex(m => m.id === assistantId);
                if (idx !== -1) {
                    updated[idx] = {
                        ...updated[idx],
                        content: fullContent || `${twin.glyph} I'm here to help.`,
                        isStreaming: false
                    };
                }
                return updated;
            });

        } catch (err) {
            console.error('Twin chat error:', err);
            setMessages(prev => {
                const updated = [...prev];
                const idx = updated.findIndex(m => m.id === assistantId);
                if (idx !== -1) {
                    updated[idx] = {
                        ...updated[idx],
                        content: `${TWINS[activeTwin].glyph} Connection issue. Please try again.`,
                        isStreaming: false
                    };
                }
                return updated;
            });
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const twin = activeTwin ? TWINS[activeTwin] : null;

    if (!hasConsented) {
        return <ConsentGate onConsent={() => setHasConsented(true)} />;
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${
            isDark ? 'bg-[#08080a] text-white' : 'bg-zinc-50 text-zinc-900'
        }`}>
            {/* Header */}
            <header className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b ${
                isDark ? 'bg-[#08080a]/80 border-white/5' : 'bg-white/80 border-zinc-200'
            }`}>
                <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
                    <div className="flex items-center gap-3">
                        <Link to="/" className={`p-2 -ml-2 rounded-lg transition-colors ${
                            isDark ? 'text-white/40 hover:text-white/60 hover:bg-white/5' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100'
                        }`}>
                            <Home size={18} />
                        </Link>
                        <div className="flex items-center gap-2">
                            <span className="text-lg">⟡</span>
                            <span className={`font-medium text-sm ${isDark ? 'text-white/80' : 'text-zinc-800'}`}>
                                AI Twins
                            </span>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            {/* Main Content - Twin Selection */}
            {!activeTwin && (
                <main className="pt-20 pb-24 px-4 min-h-screen">
                    <div className="max-w-2xl mx-auto py-8">
                        <motion.div
                            className="text-center mb-10"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h1 className={`text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                Choose Your Twin
                            </h1>
                            <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                Each twin amplifies a different cognitive function
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(TWINS).map(([key, t], index) => {
                                const Icon = t.icon;
                                return (
                                    <motion.button
                                        key={key}
                                        onClick={() => openTwin(key)}
                                        className={`p-6 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
                                            isDark
                                                ? 'bg-white/[0.02] border-white/10 hover:border-white/20'
                                                : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-sm'
                                        }`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{
                                            boxShadow: isDark ? `0 0 40px ${t.color}15` : `0 4px 20px ${t.color}10`
                                        }}
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                                style={{ background: `${t.color}20` }}
                                            >
                                                <Icon size={24} style={{ color: t.color }} />
                                            </div>
                                            <span className="text-2xl">{t.glyph}</span>
                                        </div>
                                        <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                            {t.name}
                                        </h3>
                                        <p className={`text-sm mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                            {t.tagline}
                                        </p>
                                        <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                                            Amplifies: {t.amplifies}
                                        </p>
                                    </motion.button>
                                );
                            })}
                        </div>

                        <motion.div
                            className={`mt-8 p-4 rounded-xl text-center ${
                                isDark ? 'bg-purple-500/5 border border-purple-500/10' : 'bg-purple-50 border border-purple-100'
                            }`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                <span style={{ color: '#3b82f6' }}>⟡</span> Guardian protects ·
                                <span style={{ color: '#10b981' }}> ◈</span> Scout explores ·
                                <span style={{ color: '#8b5cf6' }}> ◇</span> Synthesizer connects ·
                                <span style={{ color: '#f59e0b' }}> ◎</span> Mirror reveals
                            </p>
                        </motion.div>
                    </div>
                </main>
            )}

            {/* Chat Interface */}
            <AnimatePresence>
                {activeTwin && twin && (
                    <motion.div
                        className={`fixed inset-0 z-50 flex flex-col ${isDark ? 'bg-[#08080a]' : 'bg-zinc-50'}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Chat Header */}
                        <header className={`flex items-center justify-between px-4 py-3 border-b ${
                            isDark ? 'border-white/10 bg-[#08080a]' : 'border-zinc-200 bg-white'
                        }`}>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={closeTwin}
                                    className={`p-2 rounded-lg ${
                                        isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-zinc-100 text-zinc-500'
                                    }`}
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: `${twin.color}20` }}
                                >
                                    <twin.icon size={20} style={{ color: twin.color }} />
                                </div>
                                <div>
                                    <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                        {twin.name} <span className="ml-1">{twin.glyph}</span>
                                    </h2>
                                    <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                        {twin.amplifies}
                                    </p>
                                </div>
                            </div>
                        </header>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-6">
                            <div className="max-w-xl mx-auto space-y-4">
                                {messages.length === 0 ? (
                                    <motion.div
                                        className="text-center py-12"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <div className="text-5xl mb-6">{twin.glyph}</div>
                                        <p className={`text-sm mb-8 max-w-sm mx-auto ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                            {twin.description}
                                        </p>
                                        <p className={`text-xs mb-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                            Try asking:
                                        </p>
                                        <div className="flex flex-col gap-2 max-w-xs mx-auto">
                                            {[
                                                activeTwin === 'guardian' ? 'Should I take on this new project?' :
                                                activeTwin === 'scout' ? 'What am I missing here?' :
                                                activeTwin === 'synthesizer' ? 'How do these ideas connect?' :
                                                'What am I not seeing?',

                                                activeTwin === 'guardian' ? 'Is this worth my attention?' :
                                                activeTwin === 'scout' ? 'What adjacent areas should I explore?' :
                                                activeTwin === 'synthesizer' ? 'What framework unifies this?' :
                                                'What assumptions am I making?'
                                            ].map((prompt, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => sendMessage(prompt)}
                                                    className={`px-4 py-3 rounded-xl text-sm text-left transition-all ${
                                                        isDark
                                                            ? 'bg-white/5 hover:bg-white/10 border border-white/10'
                                                            : 'bg-white hover:bg-zinc-50 border border-zinc-200'
                                                    }`}
                                                >
                                                    {prompt}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : (
                                    messages.map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                                                msg.role === 'user'
                                                    ? isDark
                                                        ? 'bg-white/10 rounded-br-md'
                                                        : 'bg-zinc-200 rounded-br-md'
                                                    : isDark
                                                        ? 'bg-white/5 border border-white/10 rounded-bl-md'
                                                        : 'bg-white border border-zinc-200 rounded-bl-md'
                                            }`}
                                            style={msg.role !== 'user' && isDark ? {
                                                boxShadow: `0 0 30px ${twin.color}10`
                                            } : {}}
                                            >
                                                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                                                    isDark ? 'text-white/90' : 'text-zinc-800'
                                                }`}>
                                                    {msg.content}
                                                    {msg.isStreaming && (
                                                        <motion.span
                                                            className="inline-block w-0.5 h-4 ml-1 rounded-full"
                                                            style={{ background: twin.color }}
                                                            animate={{ opacity: [1, 0.3, 1] }}
                                                            transition={{ duration: 0.8, repeat: Infinity }}
                                                        />
                                                    )}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Input */}
                        <div className={`border-t p-4 ${
                            isDark ? 'border-white/10 bg-[#08080a]' : 'border-zinc-200 bg-white'
                        }`}>
                            <div className="max-w-xl mx-auto flex gap-3">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={`Ask ${twin.name}...`}
                                    disabled={isLoading}
                                    className={`flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none transition-all ${
                                        isDark
                                            ? 'bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-white/20'
                                            : 'bg-zinc-100 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-300'
                                    }`}
                                />
                                <button
                                    onClick={() => sendMessage()}
                                    disabled={!input.trim() || isLoading}
                                    className="p-3 rounded-xl transition-all disabled:opacity-30"
                                    style={{
                                        background: input.trim() ? `${twin.color}30` : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <Send size={18} style={{ color: input.trim() ? twin.color : isDark ? '#71717a' : '#a1a1aa' }} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <BottomNav />
        </div>
    );
}
