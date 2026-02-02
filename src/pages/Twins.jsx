/**
 * AI Twins — Guardian, Scout, Synthesizer, Mirror
 *
 * Interactive interface to invoke cognitive twins
 * Connects to brain API at localhost:8100
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Compass, Layers, Eye,
    Send, ArrowLeft, Brain, Sparkles,
    ChevronRight, RefreshCw
} from 'lucide-react';
import SpotlightCard from '../components/SpotlightCard';
import MirrorLogo from '../components/MirrorLogo';

const BRAIN_API = 'http://localhost:8100';

// Twin definitions with icons and colors
const TWINS = {
    guardian: {
        name: 'Guardian',
        icon: Shield,
        description: 'Protects boundaries, filters noise, maintains focus',
        longDescription: 'Your Guardian watches over your attention and energy. It helps you stay aligned with what matters, filtering distractions and protecting your cognitive boundaries.',
        color: 'blue',
        gradient: 'from-blue-500 to-cyan-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        glow: 'shadow-blue-500/20',
        prompts: [
            'Should I take on this new project?',
            'Is this worth my attention right now?',
            'What should I focus on today?'
        ]
    },
    scout: {
        name: 'Scout',
        icon: Compass,
        description: 'Explores territory, finds connections, surfaces opportunities',
        longDescription: 'Your Scout ventures into unknown territories, mapping connections and finding opportunities you might miss. It thrives on curiosity and serendipity.',
        color: 'emerald',
        gradient: 'from-emerald-500 to-green-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        glow: 'shadow-emerald-500/20',
        prompts: [
            'What adjacent fields should I explore?',
            'Where are the hidden connections here?',
            'What opportunities am I missing?'
        ]
    },
    synthesizer: {
        name: 'Synthesizer',
        icon: Layers,
        description: 'Merges ideas, creates coherence, builds frameworks',
        longDescription: 'Your Synthesizer weaves disparate threads into unified tapestries. It finds the underlying patterns and builds frameworks that make complexity manageable.',
        color: 'violet',
        gradient: 'from-violet-500 to-purple-500',
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/30',
        text: 'text-violet-400',
        glow: 'shadow-violet-500/20',
        prompts: [
            'How do these ideas connect?',
            'What framework unifies this?',
            'How can I structure this chaos?'
        ]
    },
    mirror: {
        name: 'Mirror',
        icon: Eye,
        description: 'Reflects, questions, reveals blind spots',
        longDescription: 'Your Mirror shows you what you cannot see yourself. It asks the uncomfortable questions and illuminates the shadows in your thinking.',
        color: 'amber',
        gradient: 'from-amber-500 to-orange-500',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        glow: 'shadow-amber-500/20',
        prompts: [
            'What am I not seeing here?',
            'What assumptions am I making?',
            'Why am I really avoiding this?'
        ]
    }
};

export default function Twins() {
    const [selectedTwin, setSelectedTwin] = useState(null);
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [brainId, setBrainId] = useState(null);
    const [history, setHistory] = useState([]);

    // Check for saved brain ID
    useEffect(() => {
        const savedBrainId = localStorage.getItem('mirrorBrainId');
        if (savedBrainId) {
            setBrainId(savedBrainId);
        }
    }, []);

    const handleSelectTwin = (twinType) => {
        setSelectedTwin(twinType);
        setResponse(null);
        setQuery('');
    };

    const handleInvoke = async () => {
        if (!query.trim() || !selectedTwin) return;

        setLoading(true);
        try {
            const brain = brainId || 'BRAIN-anonymous';
            const res = await fetch(
                `${BRAIN_API}/api/brain/${brain}/twin/${selectedTwin}?query=${encodeURIComponent(query)}`,
                { method: 'POST' }
            );
            if (!res.ok) throw new Error('Failed to invoke twin');
            const data = await res.json();
            setResponse(data);
            setHistory(prev => [...prev, { twin: selectedTwin, query, response: data }]);
        } catch (err) {
            setResponse({
                response: 'Connection to cognitive engine failed.',
                reasoning: 'Make sure the brain API is running on port 8100.',
                suggestions: ['Check API status', 'Try again'],
                resonance_hints: []
            });
        }
        setLoading(false);
    };

    const handlePromptClick = (prompt) => {
        setQuery(prompt);
    };

    const handleBack = () => {
        setSelectedTwin(null);
        setResponse(null);
        setQuery('');
    };

    const handleReset = () => {
        setResponse(null);
        setQuery('');
    };

    return (
        <div className="relative min-h-screen font-sans text-white overflow-x-hidden selection:bg-purple-500/30">
            {/* Ambient Background */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-black to-black z-0" />
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0" />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-purple-500/10">
                <div className="flex justify-between items-center py-3 px-4 max-w-4xl mx-auto">
                    <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                        <MirrorLogo className="w-6 h-6" />
                        <span className="text-sm font-medium">Active Mirror</span>
                    </Link>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                        {brainId && (
                            <span className="text-emerald-400 flex items-center gap-1">
                                <Brain size={12} /> Synced
                            </span>
                        )}
                        <Sparkles size={16} className="text-purple-400" />
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 min-h-screen flex items-center justify-center p-4 pt-20 pb-8">
                <AnimatePresence mode="wait">
                    {!selectedTwin ? (
                        <TwinSelector
                            key="selector"
                            onSelect={handleSelectTwin}
                            brainId={brainId}
                        />
                    ) : (
                        <TwinConsole
                            key="console"
                            twin={TWINS[selectedTwin]}
                            twinType={selectedTwin}
                            query={query}
                            setQuery={setQuery}
                            response={response}
                            loading={loading}
                            onInvoke={handleInvoke}
                            onBack={handleBack}
                            onReset={handleReset}
                            onPromptClick={handlePromptClick}
                        />
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

function TwinSelector({ onSelect, brainId }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-3xl"
        >
            {/* Header */}
            <div className="text-center mb-8">
                <motion.h1
                    className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    AI Twins
                </motion.h1>
                <p className="text-zinc-400 max-w-md mx-auto">
                    Four cognitive companions, each with a unique perspective.
                    <br />
                    <span className="text-purple-400">Choose your counsel.</span>
                </p>
            </div>

            {/* Brain Status */}
            {!brainId && (
                <motion.div
                    className="mb-6 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Link
                        to="/scan"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm hover:bg-purple-500/20 transition-colors"
                    >
                        <Brain size={14} />
                        Take BrainScan for personalized twins
                        <ChevronRight size={14} />
                    </Link>
                </motion.div>
            )}

            {/* Twin Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(TWINS).map(([type, twin], index) => {
                    const Icon = twin.icon;
                    return (
                        <motion.div
                            key={type}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.1 }}
                        >
                            <SpotlightCard
                                className={`cursor-pointer hover:scale-[1.02] transition-transform ${twin.border} ${twin.bg}`}
                                onClick={() => onSelect(type)}
                            >
                                <button
                                    onClick={() => onSelect(type)}
                                    className="w-full text-left"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl bg-gradient-to-br ${twin.gradient} shadow-lg ${twin.glow}`}>
                                            <Icon size={24} className="text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`text-lg font-semibold ${twin.text} mb-1`}>
                                                {twin.name}
                                            </h3>
                                            <p className="text-sm text-zinc-400 leading-relaxed">
                                                {twin.description}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            </SpotlightCard>
                        </motion.div>
                    );
                })}
            </div>

            {/* Footer Link */}
            <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <Link
                    to="/"
                    className="text-xs text-zinc-600 hover:text-purple-400 transition-colors"
                >
                    ← Back to Home
                </Link>
            </motion.div>
        </motion.div>
    );
}

function TwinConsole({
    twin,
    twinType,
    query,
    setQuery,
    response,
    loading,
    onInvoke,
    onBack,
    onReset,
    onPromptClick
}) {
    const Icon = twin.icon;

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onInvoke();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-2xl"
        >
            <SpotlightCard className={`${twin.border} bg-black/40 backdrop-blur-3xl overflow-hidden`}>
                {/* Header */}
                <div className={`p-6 border-b ${twin.border} bg-gradient-to-r ${twin.bg}`}>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft size={20} className="text-zinc-400" />
                        </button>
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${twin.gradient}`}>
                            <Icon size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className={`text-xl font-semibold ${twin.text}`}>
                                {twin.name}
                            </h2>
                            <p className="text-sm text-zinc-500">{twin.description}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Response Area */}
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center justify-center py-12"
                            >
                                <motion.div
                                    className={`p-4 rounded-full ${twin.bg}`}
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                >
                                    <Icon size={32} className={twin.text} />
                                </motion.div>
                            </motion.div>
                        ) : response ? (
                            <motion.div
                                key="response"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                {/* Main Response */}
                                <div className={`p-4 rounded-xl ${twin.bg} border ${twin.border}`}>
                                    <p className="text-zinc-200 leading-relaxed">
                                        {response.response}
                                    </p>
                                </div>

                                {/* Reasoning */}
                                {response.reasoning && (
                                    <div className="p-3 rounded-lg bg-white/5">
                                        <p className="text-xs text-zinc-500 italic">
                                            {response.reasoning}
                                        </p>
                                    </div>
                                )}

                                {/* Suggestions */}
                                {response.suggestions?.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">
                                            Suggestions
                                        </h4>
                                        <div className="space-y-2">
                                            {response.suggestions.map((suggestion, i) => (
                                                <div
                                                    key={i}
                                                    className={`flex items-start gap-2 text-sm ${twin.text}`}
                                                >
                                                    <ChevronRight size={16} className="mt-0.5 opacity-50" />
                                                    {suggestion}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Resonance Hints */}
                                {response.resonance_hints?.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {response.resonance_hints.map((hint, i) => (
                                            <span
                                                key={i}
                                                className={`px-2 py-1 rounded-full text-xs ${twin.bg} ${twin.border} border ${twin.text}`}
                                            >
                                                {hint}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Ask Again */}
                                <button
                                    onClick={onReset}
                                    className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                                >
                                    <RefreshCw size={14} /> Ask again
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="prompts"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-4"
                            >
                                {/* Description */}
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    {twin.longDescription}
                                </p>

                                {/* Suggested Prompts */}
                                <div>
                                    <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3">
                                        Try asking
                                    </h4>
                                    <div className="space-y-2">
                                        {twin.prompts.map((prompt, i) => (
                                            <button
                                                key={i}
                                                onClick={() => onPromptClick(prompt)}
                                                className={`w-full text-left p-3 rounded-lg border ${twin.border} ${twin.bg} hover:bg-opacity-20 transition-colors text-sm text-zinc-300`}
                                            >
                                                "{prompt}"
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Input Area */}
                    {!response && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-6"
                        >
                            <div className={`flex gap-2 p-2 rounded-xl border ${twin.border} bg-black/40`}>
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={`Ask the ${twin.name}...`}
                                    className="flex-1 bg-transparent px-3 py-2 text-white placeholder-zinc-600 focus:outline-none"
                                />
                                <button
                                    onClick={onInvoke}
                                    disabled={!query.trim() || loading}
                                    className={`px-4 py-2 rounded-lg bg-gradient-to-r ${twin.gradient} text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center gap-2`}
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </SpotlightCard>
        </motion.div>
    );
}
