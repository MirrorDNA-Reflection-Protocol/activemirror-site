/**
 * AI Twins — Guardian, Scout, Synthesizer, Mirror
 *
 * Interactive interface to invoke cognitive twins
 * Supports: Single, Council, Debate, and Relay modes
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Compass, Layers, Eye,
    Send, ArrowLeft, Brain, Sparkles,
    ChevronRight, RefreshCw, Users, MessageSquare,
    GitBranch, Zap
} from 'lucide-react';
import SpotlightCard from '../components/SpotlightCard';
import MirrorLogo from '../components/MirrorLogo';
import BottomNav from '../components/BottomNav';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

const BRAIN_API = 'https://brain.activemirror.ai';

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

// Mode definitions
const MODES = {
    single: {
        name: 'Single',
        icon: Zap,
        description: 'Ask one twin',
        color: 'purple'
    },
    council: {
        name: 'Council',
        icon: Users,
        description: 'All 4 respond',
        color: 'cyan'
    },
    debate: {
        name: 'Debate',
        icon: MessageSquare,
        description: 'Two twins argue',
        color: 'rose'
    },
    relay: {
        name: 'Relay',
        icon: GitBranch,
        description: 'Chain through all',
        color: 'amber'
    }
};

export default function Twins() {
    const [mode, setMode] = useState('single');
    const [selectedTwin, setSelectedTwin] = useState(null);
    const [debateTwins, setDebateTwins] = useState({ twin_1: 'guardian', twin_2: 'mirror' });
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [brainId, setBrainId] = useState(null);

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

    const handleInvokeSingle = async () => {
        if (!query.trim() || !selectedTwin) return;
        setLoading(true);
        try {
            const brain = brainId || 'BRAIN-anonymous';
            const res = await fetch(
                `${BRAIN_API}/api/brain/${brain}/twin/${selectedTwin}?query=${encodeURIComponent(query)}`,
                { method: 'POST' }
            );
            if (!res.ok) throw new Error('Failed to invoke twin');
            setResponse(await res.json());
        } catch (err) {
            setResponse({ response: 'Connection failed. Is the brain API running?', suggestions: [] });
        }
        setLoading(false);
    };

    const handleInvokeCouncil = async () => {
        if (!query.trim()) return;
        setLoading(true);
        try {
            const brain = brainId || 'BRAIN-anonymous';
            const res = await fetch(
                `${BRAIN_API}/api/brain/${brain}/council?query=${encodeURIComponent(query)}`,
                { method: 'POST' }
            );
            if (!res.ok) throw new Error('Failed to invoke council');
            setResponse(await res.json());
        } catch (err) {
            setResponse({ synthesis: 'Connection failed. Is the brain API running?' });
        }
        setLoading(false);
    };

    const handleInvokeDebate = async () => {
        if (!query.trim()) return;
        setLoading(true);
        try {
            const brain = brainId || 'BRAIN-anonymous';
            const res = await fetch(
                `${BRAIN_API}/api/brain/${brain}/debate?query=${encodeURIComponent(query)}&twin_1=${debateTwins.twin_1}&twin_2=${debateTwins.twin_2}&rounds=2`,
                { method: 'POST' }
            );
            if (!res.ok) throw new Error('Failed to invoke debate');
            setResponse(await res.json());
        } catch (err) {
            setResponse({ conclusion: 'Connection failed. Is the brain API running?' });
        }
        setLoading(false);
    };

    const handleInvokeRelay = async () => {
        if (!query.trim()) return;
        setLoading(true);
        try {
            const brain = brainId || 'BRAIN-anonymous';
            const res = await fetch(
                `${BRAIN_API}/api/brain/${brain}/relay?query=${encodeURIComponent(query)}`,
                { method: 'POST' }
            );
            if (!res.ok) throw new Error('Failed to invoke relay');
            setResponse(await res.json());
        } catch (err) {
            setResponse({ final_output: 'Connection failed. Is the brain API running?' });
        }
        setLoading(false);
    };

    const handleInvoke = () => {
        switch (mode) {
            case 'single': return handleInvokeSingle();
            case 'council': return handleInvokeCouncil();
            case 'debate': return handleInvokeDebate();
            case 'relay': return handleInvokeRelay();
        }
    };

    const handleReset = () => {
        setResponse(null);
        setQuery('');
    };

    const handleBack = () => {
        setSelectedTwin(null);
        setResponse(null);
        setQuery('');
    };

    const showMainView = mode === 'single' && !selectedTwin;

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
            <main className="relative z-10 min-h-screen flex flex-col items-center p-4 pt-20 pb-24">
                {/* Mode Selector */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2 mb-6 p-1 rounded-xl bg-white/5 border border-white/10"
                >
                    {Object.entries(MODES).map(([key, m]) => {
                        const Icon = m.icon;
                        return (
                            <button
                                key={key}
                                onClick={() => { setMode(key); setResponse(null); setSelectedTwin(null); }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    mode === key
                                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                            >
                                <Icon size={16} />
                                <span className="hidden sm:inline">{m.name}</span>
                            </button>
                        );
                    })}
                </motion.div>

                <AnimatePresence mode="wait">
                    {/* Single Mode - Twin Selector */}
                    {showMainView && (
                        <TwinSelector
                            key="selector"
                            onSelect={handleSelectTwin}
                            brainId={brainId}
                        />
                    )}

                    {/* Single Mode - Console */}
                    {mode === 'single' && selectedTwin && (
                        <TwinConsole
                            key="console"
                            twin={TWINS[selectedTwin]}
                            query={query}
                            setQuery={setQuery}
                            response={response}
                            loading={loading}
                            onInvoke={handleInvoke}
                            onBack={handleBack}
                            onReset={handleReset}
                        />
                    )}

                    {/* Council Mode */}
                    {mode === 'council' && (
                        <CouncilView
                            key="council"
                            query={query}
                            setQuery={setQuery}
                            response={response}
                            loading={loading}
                            onInvoke={handleInvoke}
                            onReset={handleReset}
                        />
                    )}

                    {/* Debate Mode */}
                    {mode === 'debate' && (
                        <DebateView
                            key="debate"
                            query={query}
                            setQuery={setQuery}
                            debateTwins={debateTwins}
                            setDebateTwins={setDebateTwins}
                            response={response}
                            loading={loading}
                            onInvoke={handleInvoke}
                            onReset={handleReset}
                        />
                    )}

                    {/* Relay Mode */}
                    {mode === 'relay' && (
                        <RelayView
                            key="relay"
                            query={query}
                            setQuery={setQuery}
                            response={response}
                            loading={loading}
                            onInvoke={handleInvoke}
                            onReset={handleReset}
                        />
                    )}
                </AnimatePresence>
            </main>
            <BottomNav />
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
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                    AI Twins
                </h1>
                <p className="text-zinc-400 max-w-md mx-auto">
                    Four cognitive companions, each with a unique perspective.
                    <br />
                    <span className="text-purple-400">Choose your counsel.</span>
                </p>
            </div>

            {!brainId && (
                <motion.div className="mb-6 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${twin.gradient} shadow-lg ${twin.glow}`}>
                                        <Icon size={24} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`text-lg font-semibold ${twin.text} mb-1`}>{twin.name}</h3>
                                        <p className="text-sm text-zinc-400 leading-relaxed">{twin.description}</p>
                                    </div>
                                </div>
                            </SpotlightCard>
                        </motion.div>
                    );
                })}
            </div>

            <motion.div className="mt-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <Link to="/" className="text-xs text-zinc-600 hover:text-purple-400 transition-colors">
                    ← Back to Home
                </Link>
            </motion.div>
        </motion.div>
    );
}

function TwinConsole({ twin, query, setQuery, response, loading, onInvoke, onBack, onReset }) {
    const Icon = twin.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-2xl"
        >
            <SpotlightCard className={`${twin.border} bg-black/40 backdrop-blur-3xl`}>
                <div className={`p-6 border-b ${twin.border} bg-gradient-to-r ${twin.bg}`}>
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                            <ArrowLeft size={20} className="text-zinc-400" />
                        </button>
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${twin.gradient}`}>
                            <Icon size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className={`text-xl font-semibold ${twin.text}`}>{twin.name}</h2>
                            <p className="text-sm text-zinc-500">{twin.description}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <LoadingSpinner icon={Icon} className={twin.text} bg={twin.bg} />
                        ) : response ? (
                            <motion.div
                                key="response"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                <div className={`p-4 rounded-xl ${twin.bg} border ${twin.border}`}>
                                    <p className="text-zinc-200 leading-relaxed">{response.response}</p>
                                </div>
                                {response.suggestions?.length > 0 && (
                                    <div className="space-y-2">
                                        {response.suggestions.map((s, i) => (
                                            <div key={i} className={`flex items-center gap-2 text-sm ${twin.text}`}>
                                                <ChevronRight size={14} /> {s}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button onClick={onReset} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300">
                                    <RefreshCw size={14} /> Ask again
                                </button>
                            </motion.div>
                        ) : (
                            <QueryInput
                                query={query}
                                setQuery={setQuery}
                                onInvoke={onInvoke}
                                placeholder={`Ask the ${twin.name}...`}
                                gradient={twin.gradient}
                                prompts={twin.prompts}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </SpotlightCard>
        </motion.div>
    );
}

function CouncilView({ query, setQuery, response, loading, onInvoke, onReset }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl"
        >
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-2 text-cyan-400">Council Mode</h1>
                <p className="text-zinc-500 text-sm">All four twins respond to the same question</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <motion.div
                        className="p-6 rounded-full bg-cyan-500/10"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        <Users size={40} className="text-cyan-400" />
                    </motion.div>
                </div>
            ) : response ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    {/* Synthesis */}
                    {response.synthesis && (
                        <SpotlightCard className="border-cyan-500/30 bg-cyan-500/5">
                            <div className="p-4">
                                <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">Council Synthesis</h3>
                                <p className="text-zinc-200">{response.synthesis}</p>
                            </div>
                        </SpotlightCard>
                    )}

                    {/* Individual Responses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['guardian', 'scout', 'synthesizer', 'mirror'].map((key) => {
                            const twin = TWINS[key];
                            const Icon = twin.icon;
                            const r = response[key];
                            return (
                                <SpotlightCard key={key} className={`${twin.border} ${twin.bg}`}>
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Icon size={16} className={twin.text} />
                                            <span className={`font-semibold ${twin.text}`}>{twin.name}</span>
                                        </div>
                                        <p className="text-sm text-zinc-300">{r?.response || 'No response'}</p>
                                    </div>
                                </SpotlightCard>
                            );
                        })}
                    </div>

                    <button onClick={onReset} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 mx-auto">
                        <RefreshCw size={14} /> Ask the council again
                    </button>
                </motion.div>
            ) : (
                <QueryInput
                    query={query}
                    setQuery={setQuery}
                    onInvoke={onInvoke}
                    placeholder="Ask the council..."
                    gradient="from-cyan-500 to-blue-500"
                />
            )}
        </motion.div>
    );
}

function DebateView({ query, setQuery, debateTwins, setDebateTwins, response, loading, onInvoke, onReset }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-3xl"
        >
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-2 text-rose-400">Debate Mode</h1>
                <p className="text-zinc-500 text-sm">Two twins argue different perspectives</p>
            </div>

            {/* Twin Selector */}
            {!response && !loading && (
                <div className="flex justify-center gap-4 mb-6">
                    {['twin_1', 'twin_2'].map((key, idx) => (
                        <div key={key}>
                            <label className="text-xs text-zinc-500 block mb-1">{idx === 0 ? 'First' : 'Second'}</label>
                            <select
                                value={debateTwins[key]}
                                onChange={(e) => setDebateTwins(prev => ({ ...prev, [key]: e.target.value }))}
                                className="bg-black/40 border border-rose-500/30 rounded-lg px-3 py-2 text-sm text-zinc-300"
                            >
                                {Object.entries(TWINS).map(([k, t]) => (
                                    <option key={k} value={k}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-16">
                    <motion.div
                        className="p-6 rounded-full bg-rose-500/10"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        <MessageSquare size={40} className="text-rose-400" />
                    </motion.div>
                </div>
            ) : response ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {/* Debate Turns */}
                    {response.turns?.map((turn, i) => {
                        const twin = TWINS[turn.twin_type];
                        const Icon = twin.icon;
                        const isLeft = turn.twin_type === response.twin_1;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`flex ${isLeft ? 'justify-start' : 'justify-end'}`}
                            >
                                <div className={`max-w-[80%] p-4 rounded-xl ${twin.bg} border ${twin.border}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icon size={14} className={twin.text} />
                                        <span className={`text-sm font-medium ${twin.text}`}>{twin.name}</span>
                                    </div>
                                    <p className="text-sm text-zinc-300">{turn.response}</p>
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Conclusion */}
                    {response.conclusion && (
                        <SpotlightCard className="border-rose-500/30 bg-rose-500/5 mt-6">
                            <div className="p-4">
                                <h3 className="text-xs font-mono text-rose-400 uppercase tracking-wider mb-2">Debate Conclusion</h3>
                                <p className="text-zinc-200">{response.conclusion}</p>
                            </div>
                        </SpotlightCard>
                    )}

                    <button onClick={onReset} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 mx-auto">
                        <RefreshCw size={14} /> Start new debate
                    </button>
                </motion.div>
            ) : (
                <QueryInput
                    query={query}
                    setQuery={setQuery}
                    onInvoke={onInvoke}
                    placeholder="What should they debate?"
                    gradient="from-rose-500 to-pink-500"
                />
            )}
        </motion.div>
    );
}

function RelayView({ query, setQuery, response, loading, onInvoke, onReset }) {
    const relayOrder = ['guardian', 'scout', 'synthesizer', 'mirror'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-3xl"
        >
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-2 text-amber-400">Relay Mode</h1>
                <p className="text-zinc-500 text-sm">Guardian filters → Scout explores → Synthesizer frames → Mirror challenges</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <motion.div
                        className="p-6 rounded-full bg-amber-500/10"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        <GitBranch size={40} className="text-amber-400" />
                    </motion.div>
                </div>
            ) : response ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {/* Relay Stages */}
                    <div className="relative">
                        {/* Connection Line */}
                        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-500 via-violet-500 to-amber-500" />

                        {response.stages?.map((stage, i) => {
                            const twin = TWINS[stage.twin_type];
                            const Icon = twin.icon;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.15 }}
                                    className="relative flex gap-4 mb-4"
                                >
                                    <div className={`z-10 p-2 rounded-full bg-gradient-to-br ${twin.gradient}`}>
                                        <Icon size={16} className="text-white" />
                                    </div>
                                    <div className={`flex-1 p-4 rounded-xl ${twin.bg} border ${twin.border}`}>
                                        <span className={`text-xs font-medium ${twin.text} uppercase`}>{twin.name}</span>
                                        <p className="text-sm text-zinc-300 mt-1">{stage.response}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Final Output */}
                    {response.final_output && (
                        <SpotlightCard className="border-amber-500/30 bg-amber-500/5">
                            <div className="p-4">
                                <h3 className="text-xs font-mono text-amber-400 uppercase tracking-wider mb-2">Final Insight</h3>
                                <p className="text-zinc-200">{response.final_output}</p>
                            </div>
                        </SpotlightCard>
                    )}

                    <button onClick={onReset} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 mx-auto">
                        <RefreshCw size={14} /> Run relay again
                    </button>
                </motion.div>
            ) : (
                <QueryInput
                    query={query}
                    setQuery={setQuery}
                    onInvoke={onInvoke}
                    placeholder="What should the twins process?"
                    gradient="from-amber-500 to-orange-500"
                />
            )}
        </motion.div>
    );
}

function QueryInput({ query, setQuery, onInvoke, placeholder, gradient, prompts }) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onInvoke();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            {prompts && (
                <div className="space-y-2">
                    {prompts.map((prompt, i) => (
                        <button
                            key={i}
                            onClick={() => setQuery(prompt)}
                            className="w-full text-left p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-sm text-zinc-400"
                        >
                            "{prompt}"
                        </button>
                    ))}
                </div>
            )}

            <div className="flex gap-2 p-2 rounded-xl border border-white/10 bg-black/40">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent px-3 py-2 text-white placeholder-zinc-600 focus:outline-none"
                />
                <button
                    onClick={onInvoke}
                    disabled={!query.trim()}
                    className={`px-4 py-2 rounded-lg bg-gradient-to-r ${gradient} text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center gap-2`}
                >
                    <Send size={16} />
                </button>
            </div>
        </motion.div>
    );
}

function LoadingSpinner({ icon: Icon, className, bg }) {
    return (
        <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-12"
        >
            <motion.div
                className={`p-4 rounded-full ${bg}`}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
                <Icon size={32} className={className} />
            </motion.div>
        </motion.div>
    );
}
