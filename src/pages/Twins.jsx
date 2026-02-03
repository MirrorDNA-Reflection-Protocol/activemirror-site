/**
 * AI Twins — Simplified UX
 * Click a twin → Start chatting immediately
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Compass, Layers, Eye,
    Send, ArrowLeft, X, Sparkles
} from 'lucide-react';
import MirrorLogo from '../components/MirrorLogo';
import BottomNav from '../components/BottomNav';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

const BRAIN_API = 'https://brain.activemirror.ai';

// Twin definitions
const TWINS = {
    guardian: {
        name: 'Guardian',
        icon: Shield,
        tagline: 'Protects your focus',
        description: 'Watches over your attention and energy. Filters distractions, protects boundaries, keeps you aligned.',
        color: '#3b82f6',
        gradient: 'from-blue-500 to-cyan-500',
        prompts: [
            'Should I take on this new project?',
            'Is this worth my attention?',
            'What should I focus on today?'
        ]
    },
    scout: {
        name: 'Scout',
        icon: Compass,
        tagline: 'Explores possibilities',
        description: 'Ventures into unknown territory. Finds connections, surfaces opportunities you might miss.',
        color: '#10b981',
        gradient: 'from-emerald-500 to-green-500',
        prompts: [
            'What am I missing here?',
            'What adjacent areas should I explore?',
            'Where are the hidden connections?'
        ]
    },
    synthesizer: {
        name: 'Synthesizer',
        icon: Layers,
        tagline: 'Connects the dots',
        description: 'Weaves ideas into frameworks. Finds patterns, creates coherence from complexity.',
        color: '#8b5cf6',
        gradient: 'from-violet-500 to-purple-500',
        prompts: [
            'How do these ideas connect?',
            'What framework unifies this?',
            'Help me structure this chaos'
        ]
    },
    mirror: {
        name: 'Mirror',
        icon: Eye,
        tagline: 'Reveals blind spots',
        description: 'Shows what you cannot see. Asks uncomfortable questions, illuminates shadows in your thinking.',
        color: '#f59e0b',
        gradient: 'from-amber-500 to-orange-500',
        prompts: [
            'What am I not seeing?',
            'What assumptions am I making?',
            'Why am I really avoiding this?'
        ]
    }
};

export default function Twins() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [activeTwin, setActiveTwin] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const inputRef = useRef(null);
    const messagesEndRef = useRef(null);

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
        if (!text || loading || !activeTwin) return;

        const userMsg = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch(`${BRAIN_API}/api/twins/invoke`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    twin: activeTwin,
                    query: text
                })
            });

            if (!response.ok) throw new Error('Failed');

            const data = await response.json();
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.response || data.message || "I'm here to help. What's on your mind?"
            }]);
        } catch (err) {
            // Fallback response if API fails
            const twin = TWINS[activeTwin];
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `As your ${twin.name}, I'm here to help. ${twin.description} What would you like to explore?`
            }]);
        } finally {
            setLoading(false);
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
                        <Link to="/" className={`p-2 -ml-2 ${isDark ? 'text-white/40 hover:text-white/60' : 'text-zinc-400 hover:text-zinc-600'}`}>
                            <ArrowLeft size={18} />
                        </Link>
                        <div className="flex items-center gap-2">
                            <MirrorLogo className="w-6 h-6" />
                            <span className={`font-medium text-sm ${isDark ? 'text-white/80' : 'text-zinc-800'}`}>
                                AI Twins
                            </span>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-16 pb-20 px-4 min-h-screen">
                <div className="max-w-2xl mx-auto py-8">
                    {/* Intro */}
                    <motion.div
                        className="text-center mb-8"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                            Choose Your Twin
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            Each twin has a different perspective. Tap one to start.
                        </p>
                    </motion.div>

                    {/* Twin Cards */}
                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(TWINS).map(([key, t], index) => {
                            const Icon = t.icon;
                            return (
                                <motion.button
                                    key={key}
                                    onClick={() => openTwin(key)}
                                    className={`p-5 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
                                        isDark
                                            ? 'bg-white/[0.02] border-white/10 hover:border-white/20'
                                            : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-sm'
                                    }`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{
                                        boxShadow: isDark ? `0 0 30px ${t.color}20` : `0 4px 20px ${t.color}15`
                                    }}
                                >
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                                        style={{ background: `${t.color}20` }}
                                    >
                                        <Icon size={20} style={{ color: t.color }} />
                                    </div>
                                    <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                        {t.name}
                                    </h3>
                                    <p className={`text-xs ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                        {t.tagline}
                                    </p>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* What they do */}
                    <motion.div
                        className={`mt-8 p-4 rounded-xl ${
                            isDark ? 'bg-white/[0.02] border border-white/5' : 'bg-zinc-100'
                        }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <p className={`text-xs text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            <Sparkles size={12} className="inline mr-1" />
                            Each twin brings a different cognitive lens to your questions
                        </p>
                    </motion.div>
                </div>
            </main>

            {/* Chat Modal */}
            <AnimatePresence>
                {activeTwin && twin && (
                    <motion.div
                        className="fixed inset-0 z-50 flex flex-col"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Backdrop */}
                        <div
                            className={`absolute inset-0 ${isDark ? 'bg-[#08080a]' : 'bg-zinc-50'}`}
                            style={isDark ? {
                                background: `radial-gradient(ellipse at top, ${twin.color}10, #08080a 60%)`
                            } : {}}
                        />

                        {/* Chat Header */}
                        <header className={`relative z-10 flex items-center justify-between px-4 py-3 border-b ${
                            isDark ? 'border-white/10' : 'border-zinc-200'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ background: `${twin.color}20` }}
                                >
                                    <twin.icon size={16} style={{ color: twin.color }} />
                                </div>
                                <div>
                                    <h2 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                        {twin.name}
                                    </h2>
                                    <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                        {twin.tagline}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={closeTwin}
                                className={`p-2 rounded-lg ${
                                    isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-zinc-100 text-zinc-500'
                                }`}
                            >
                                <X size={18} />
                            </button>
                        </header>

                        {/* Messages */}
                        <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4">
                            <div className="max-w-xl mx-auto space-y-4">
                                {messages.length === 0 ? (
                                    <motion.div
                                        className="text-center py-8"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <p className={`text-sm mb-6 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                                            {twin.description}
                                        </p>
                                        <p className={`text-xs mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                            Try asking:
                                        </p>
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {twin.prompts.map((prompt, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => sendMessage(prompt)}
                                                    className={`px-3 py-2 rounded-xl text-xs transition-all ${
                                                        isDark
                                                            ? 'bg-white/10 hover:bg-white/15 text-white border border-white/20'
                                                            : 'bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200'
                                                    }`}
                                                >
                                                    {prompt}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : (
                                    messages.map((msg, i) => (
                                        <motion.div
                                            key={i}
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
                                            style={msg.role !== 'user' ? {
                                                boxShadow: isDark ? `0 0 20px ${twin.color}10` : 'none'
                                            } : {}}
                                            >
                                                <p className={`text-sm leading-relaxed ${
                                                    isDark ? 'text-white/90' : 'text-zinc-800'
                                                }`}>
                                                    {msg.content}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                                {loading && (
                                    <motion.div
                                        className="flex justify-start"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <div className={`px-4 py-3 rounded-2xl rounded-bl-md ${
                                            isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-zinc-200'
                                        }`}>
                                            <div className="flex gap-1">
                                                {[0, 1, 2].map(i => (
                                                    <motion.div
                                                        key={i}
                                                        className="w-2 h-2 rounded-full"
                                                        style={{ background: twin.color }}
                                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Input */}
                        <div className={`relative z-10 border-t p-4 ${
                            isDark ? 'border-white/10 bg-[#08080a]/80' : 'border-zinc-200 bg-white/80'
                        } backdrop-blur-sm`}>
                            <div className="max-w-xl mx-auto flex gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={`Ask ${twin.name}...`}
                                    disabled={loading}
                                    className={`flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none transition-all ${
                                        isDark
                                            ? 'bg-white/5 border border-white/10 text-white placeholder-zinc-600 focus:border-white/20'
                                            : 'bg-zinc-100 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-300'
                                    }`}
                                />
                                <button
                                    onClick={() => sendMessage()}
                                    disabled={!input.trim() || loading}
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
