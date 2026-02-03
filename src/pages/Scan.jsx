/**
 * BrainScan — Cognitive Architecture Quiz
 *
 * 8 questions → Your brain archetype
 * Connects to brain API at localhost:8100
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Brain, Sparkles, Share2, Home, Users } from 'lucide-react';
import SpotlightCard from '../components/SpotlightCard';
import MirrorLogo from '../components/MirrorLogo';
import BottomNav from '../components/BottomNav';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

const BRAIN_API = 'https://brain.activemirror.ai';

// Archetype colors for results
const ARCHETYPE_COLORS = {
    architect: { bg: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
    explorer: { bg: 'from-purple-500/20 to-violet-500/20', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'shadow-purple-500/20' },
    builder: { bg: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30', text: 'text-green-400', glow: 'shadow-green-500/20' },
    analyst: { bg: 'from-yellow-500/20 to-amber-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400', glow: 'shadow-yellow-500/20' },
    connector: { bg: 'from-blue-500/20 to-indigo-500/20', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
    creative: { bg: 'from-orange-500/20 to-red-500/20', border: 'border-orange-500/30', text: 'text-orange-400', glow: 'shadow-orange-500/20' },
    scholar: { bg: 'from-gray-400/20 to-zinc-500/20', border: 'border-gray-400/30', text: 'text-gray-300', glow: 'shadow-gray-400/20' },
    strategist: { bg: 'from-red-500/20 to-rose-500/20', border: 'border-red-500/30', text: 'text-red-400', glow: 'shadow-red-500/20' },
};

// Dimension labels
const DIMENSION_INFO = {
    topology: { label: 'Topology', desc: 'Connectedness', icon: '🔗' },
    velocity: { label: 'Velocity', desc: 'Speed of thought', icon: '⚡' },
    depth: { label: 'Depth', desc: 'Deep diving', icon: '🔬' },
    entropy: { label: 'Entropy', desc: 'Chaos tolerance', icon: '🌀' },
    evolution: { label: 'Evolution', desc: 'Growth rate', icon: '🌱' },
};

export default function Scan() {
    const [phase, setPhase] = useState('intro'); // intro, quiz, loading, results
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // Fetch questions on mount
    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const res = await fetch(`${BRAIN_API}/api/quiz/questions`);
            if (!res.ok) throw new Error('Failed to load questions');
            const data = await res.json();
            // API returns { questions: [...] }
            setQuestions(data.questions || data);
        } catch (err) {
            setError('Could not connect to Brain API. Make sure it\'s running on port 8100.');
        }
    };

    const handleStart = () => {
        setPhase('quiz');
        setCurrentQuestion(0);
        setAnswers([]);
    };

    const handleAnswer = async (answerIndex) => {
        const newAnswers = [...answers, { question_id: questions[currentQuestion].id, answer_index: answerIndex }];
        setAnswers(newAnswers);

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            // Submit quiz
            setPhase('loading');
            try {
                const res = await fetch(`${BRAIN_API}/api/quiz/submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ answers: newAnswers })
                });
                if (!res.ok) throw new Error('Failed to submit quiz');
                const data = await res.json();
                setResult(data);
                // Save brain ID for twins
                if (data.brain_id) {
                    localStorage.setItem('mirrorBrainId', data.brain_id);
                }
                setPhase('results');
            } catch (err) {
                setError('Failed to process your results. Please try again.');
                setPhase('intro');
            }
        }
    };

    const handleBack = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
            setAnswers(answers.slice(0, -1));
        }
    };

    const handleRetake = () => {
        setPhase('intro');
        setResult(null);
        setAnswers([]);
        setCurrentQuestion(0);
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
                    <div className="flex items-center gap-4 text-xs text-zinc-400">
                        <span className="hidden sm:inline">BrainScan v1.0</span>
                        <Brain size={16} className="text-purple-400" />
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 min-h-screen flex items-center justify-center p-4 pt-20 pb-24">
                <AnimatePresence mode="wait">
                    {phase === 'intro' && (
                        <IntroScreen
                            key="intro"
                            onStart={handleStart}
                            error={error}
                            questionsLoaded={questions.length > 0}
                        />
                    )}
                    {phase === 'quiz' && questions.length > 0 && (
                        <QuizScreen
                            key="quiz"
                            question={questions[currentQuestion]}
                            questionNumber={currentQuestion + 1}
                            totalQuestions={questions.length}
                            onAnswer={handleAnswer}
                            onBack={handleBack}
                            canGoBack={currentQuestion > 0}
                        />
                    )}
                    {phase === 'loading' && (
                        <LoadingScreen key="loading" />
                    )}
                    {phase === 'results' && result && (
                        <ResultsScreen
                            key="results"
                            result={result}
                            onRetake={handleRetake}
                        />
                    )}
                </AnimatePresence>
            </main>
            <BottomNav />
        </div>
    );
}

function IntroScreen({ onStart, error, questionsLoaded }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-lg"
        >
            <SpotlightCard className="text-center p-8 sm:p-12 border border-purple-500/20 bg-black/40 backdrop-blur-3xl">
                {/* Icon */}
                <motion.div
                    className="mb-6 flex justify-center"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30 flex items-center justify-center">
                        <Brain size={40} className="text-purple-400" />
                    </div>
                </motion.div>

                {/* Headline */}
                <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                    BrainScan
                </h1>
                <p className="text-zinc-400 mb-8 leading-relaxed">
                    Discover your cognitive architecture in 8 questions.
                    <br />
                    <span className="text-purple-400">Your brain has a shape. Let's find it.</span>
                </p>

                {/* Error State */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Start Button */}
                <button
                    onClick={onStart}
                    disabled={!questionsLoaded}
                    className="group w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {questionsLoaded ? (
                        <>
                            Begin Scan <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                        </>
                    ) : (
                        <>
                            <motion.div
                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            Loading...
                        </>
                    )}
                </button>

                {/* Info */}
                <p className="mt-6 text-xs text-zinc-400">
                    ~2 minutes • No signup required • Results are private
                </p>
            </SpotlightCard>
        </motion.div>
    );
}

function QuizScreen({ question, questionNumber, totalQuestions, onAnswer, onBack, canGoBack }) {
    const progress = (questionNumber / totalQuestions) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-xl"
        >
            <SpotlightCard className="p-6 sm:p-10 border border-purple-500/20 bg-black/40 backdrop-blur-3xl">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-zinc-400 font-mono">Question {questionNumber}/{totalQuestions}</span>
                        <span className="text-xs text-purple-400 font-mono">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 to-violet-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

                {/* Question */}
                <h2 className="text-xl sm:text-2xl font-semibold mb-8 text-white leading-relaxed">
                    {question.question}
                </h2>

                {/* Options */}
                <div className="space-y-3">
                    {question.options.map((option, index) => (
                        <motion.button
                            key={index}
                            onClick={() => onAnswer(index)}
                            className="w-full text-left p-4 rounded-xl border border-purple-500/10 bg-white/5 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all group"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            <div className="flex items-center gap-4">
                                <span className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-sm font-mono text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                                    {String.fromCharCode(65 + index)}
                                </span>
                                <span className="text-zinc-300 group-hover:text-white transition-colors">
                                    {option}
                                </span>
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Back Button */}
                {canGoBack && (
                    <button
                        onClick={onBack}
                        className="mt-6 flex items-center gap-2 text-zinc-400 hover:text-zinc-300 transition-colors text-sm"
                    >
                        <ArrowLeft size={16} /> Previous question
                    </button>
                )}
            </SpotlightCard>
        </motion.div>
    );
}

function LoadingScreen() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
        >
            <motion.div
                className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30 flex items-center justify-center"
                animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 180, 360]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <Sparkles size={40} className="text-purple-400" />
            </motion.div>
            <h2 className="text-xl font-semibold mb-2">Analyzing your brain...</h2>
            <p className="text-zinc-400 text-sm">Mapping cognitive architecture</p>
        </motion.div>
    );
}

function ResultsScreen({ result, onRetake }) {
    const archetype = result.archetype?.toLowerCase() || 'explorer';
    const colors = ARCHETYPE_COLORS[archetype] || ARCHETYPE_COLORS.explorer;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl"
        >
            <SpotlightCard className={`p-6 sm:p-10 border ${colors.border} bg-black/40 backdrop-blur-3xl shadow-2xl ${colors.glow}`}>
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        className="text-6xl mb-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                    >
                        {result.archetype_emoji}
                    </motion.div>
                    <motion.h1
                        className={`text-3xl sm:text-4xl font-bold mb-2 ${colors.text}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        {result.archetype_name}
                    </motion.h1>
                    <motion.p
                        className="text-zinc-400 leading-relaxed max-w-md mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        {result.description}
                    </motion.p>
                </div>

                {/* Dimensions */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <h3 className="text-sm font-mono text-zinc-400 mb-4 uppercase tracking-wider">Cognitive Dimensions</h3>
                    <div className="space-y-3">
                        {Object.entries(result.dimensions || {}).map(([key, value], index) => {
                            const info = DIMENSION_INFO[key] || { label: key, desc: '', icon: '◉' };
                            const percentage = Math.round(value * 100);
                            return (
                                <motion.div
                                    key={key}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-zinc-300 flex items-center gap-2">
                                            <span>{info.icon}</span>
                                            {info.label}
                                            <span className="text-xs text-zinc-400">({info.desc})</span>
                                        </span>
                                        <span className="text-sm font-mono text-zinc-400">{percentage}%</span>
                                    </div>
                                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full bg-gradient-to-r ${colors.bg.replace('/20', '')}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                                        />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Strengths */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <h3 className="text-sm font-mono text-zinc-400 mb-3 uppercase tracking-wider">Your Strengths</h3>
                    <div className="flex flex-wrap gap-2">
                        {(result.strengths || []).map((strength, index) => (
                            <span
                                key={index}
                                className={`px-3 py-1 rounded-full text-sm border ${colors.border} bg-gradient-to-r ${colors.bg} ${colors.text}`}
                            >
                                {strength}
                            </span>
                        ))}
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div
                    className="grid grid-cols-2 gap-4 mb-8 p-4 rounded-xl bg-white/5 border border-white/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                >
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">{(result.node_count || 0).toLocaleString()}</div>
                        <div className="text-xs text-zinc-400">Neural Nodes</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">{(result.connection_count || 0).toLocaleString()}</div>
                        <div className="text-xs text-zinc-400">Connections</div>
                    </div>
                </motion.div>

                {/* Actions */}
                <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                >
                    {/* Primary CTA - Meet Twins */}
                    <Link
                        to="/twins"
                        className={`w-full py-4 rounded-xl bg-gradient-to-r ${colors.bg.replace('/20', '')} text-white font-bold text-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 shadow-lg ${colors.glow}`}
                    >
                        <Users size={20} /> Meet Your AI Twins <ArrowRight size={18} />
                    </Link>

                    {/* Secondary Actions */}
                    <div className="flex gap-3">
                        <Link
                            to="/"
                            className="flex-1 py-3 rounded-xl border border-purple-500/20 bg-white/5 text-white font-medium hover:bg-purple-500/10 hover:border-purple-500/30 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <Home size={16} /> Home
                        </Link>
                        <button
                            onClick={onRetake}
                            className="flex-1 py-3 rounded-xl border border-purple-500/20 bg-white/5 text-white font-medium hover:bg-purple-500/10 hover:border-purple-500/30 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <ArrowLeft size={16} /> Retake
                        </button>
                    </div>
                </motion.div>

                {/* Brain ID */}
                <motion.div
                    className="mt-6 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                >
                    <p className="text-xs text-zinc-400 font-mono">
                        Brain ID: {result.brain_id || 'LOCAL'}
                    </p>
                </motion.div>
            </SpotlightCard>
        </motion.div>
    );
}
