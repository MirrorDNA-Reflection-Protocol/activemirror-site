/**
 * Start — Viral Onboarding Journey
 * Landing → Brain Scan → MirrorSig → Archetype → Twin → Reflect → Share
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight, Brain, Sparkles, Shield, Compass, Layers, Eye,
    Share2, ChevronRight, Zap, Lock, Download, Fingerprint
} from 'lucide-react';
import MirrorSig from '../components/MirrorSig';
import ShareCard from '../components/ShareCard';
import ThemeToggle from '../components/ThemeToggle';
import BottomNav from '../components/BottomNav';
import LightConsentBanner from '../components/LightConsentBanner';
import { useTheme } from '../contexts/ThemeContext';

const BRAIN_API = 'https://brain.activemirror.ai';

// Archetype details
const ARCHETYPES = {
    architect: {
        name: 'The Architect',
        tagline: 'Systems thinker. Pattern builder.',
        description: 'You see the world as interconnected systems. Where others see chaos, you see structure waiting to be revealed.',
        strengths: ['Systems thinking', 'Pattern recognition', 'Long-term planning'],
        blindSpots: ['Analysis paralysis', 'Over-engineering', 'Impatience with ambiguity'],
        twin: 'guardian',
        color: 'blue',
        gradient: 'from-blue-500 to-cyan-500',
    },
    explorer: {
        name: 'The Explorer',
        tagline: 'Boundary pusher. Unknown seeker.',
        description: 'You thrive at the edges of the known. Curiosity isn\'t just a trait—it\'s your operating system.',
        strengths: ['Curiosity', 'Adaptability', 'Finding connections'],
        blindSpots: ['Restlessness', 'Scattered focus', 'Incomplete projects'],
        twin: 'scout',
        color: 'purple',
        gradient: 'from-purple-500 to-violet-500',
    },
    builder: {
        name: 'The Builder',
        tagline: 'Maker of things. Shipping machine.',
        description: 'Ideas are worthless until they exist. You turn thoughts into tangible reality.',
        strengths: ['Execution', 'Pragmatism', 'Iteration speed'],
        blindSpots: ['Premature optimization', 'Ignoring feedback', 'Burnout'],
        twin: 'guardian',
        color: 'emerald',
        gradient: 'from-emerald-500 to-green-500',
    },
    analyst: {
        name: 'The Analyst',
        tagline: 'Data whisperer. Truth finder.',
        description: 'You don\'t trust intuition alone. Evidence is your compass, logic your map.',
        strengths: ['Critical thinking', 'Detail orientation', 'Objectivity'],
        blindSpots: ['Overthinking', 'Dismissing intuition', 'Decision fatigue'],
        twin: 'synthesizer',
        color: 'amber',
        gradient: 'from-amber-500 to-yellow-500',
    },
    connector: {
        name: 'The Connector',
        tagline: 'Bridge builder. Network weaver.',
        description: 'You see people as nodes in a network. Your power is in bringing the right minds together.',
        strengths: ['Networking', 'Empathy', 'Communication'],
        blindSpots: ['People-pleasing', 'Overcommitment', 'Avoiding conflict'],
        twin: 'scout',
        color: 'indigo',
        gradient: 'from-indigo-500 to-blue-500',
    },
    creative: {
        name: 'The Creative',
        tagline: 'Idea generator. Pattern breaker.',
        description: 'Rules are starting points, not endpoints. You see possibilities others miss.',
        strengths: ['Innovation', 'Lateral thinking', 'Vision'],
        blindSpots: ['Follow-through', 'Practicality', 'Conventional constraints'],
        twin: 'synthesizer',
        color: 'orange',
        gradient: 'from-orange-500 to-red-500',
    },
    scholar: {
        name: 'The Scholar',
        tagline: 'Deep diver. Knowledge keeper.',
        description: 'Depth over breadth. You master domains others only skim.',
        strengths: ['Deep expertise', 'Patience', 'Thoroughness'],
        blindSpots: ['Narrow focus', 'Ivory tower thinking', 'Slow adaptation'],
        twin: 'mirror',
        color: 'gray',
        gradient: 'from-gray-400 to-zinc-500',
    },
    strategist: {
        name: 'The Strategist',
        tagline: 'Move maker. Future seer.',
        description: 'You play the long game. Every action is a move in a larger plan.',
        strengths: ['Strategic thinking', 'Anticipation', 'Resource optimization'],
        blindSpots: ['Manipulation risk', 'Missing the present', 'Over-planning'],
        twin: 'guardian',
        color: 'red',
        gradient: 'from-red-500 to-rose-500',
    },
};

const TWIN_INFO = {
    guardian: { name: 'Guardian', icon: Shield, desc: 'Protects your focus and boundaries' },
    scout: { name: 'Scout', icon: Compass, desc: 'Explores opportunities and connections' },
    synthesizer: { name: 'Synthesizer', icon: Layers, desc: 'Integrates ideas into insights' },
    mirror: { name: 'Mirror', icon: Eye, desc: 'Reflects your thoughts back with clarity' },
};

// Journey phases
const PHASES = {
    LANDING: 'landing',
    SCAN: 'scan',
    GENERATING: 'generating',
    REVEAL: 'reveal',
    TWIN: 'twin',
    SEED: 'seed',
    COMPLETE: 'complete',
};

export default function Start() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [consentGiven, setConsentGiven] = useState(false);
    const [phase, setPhase] = useState(PHASES.LANDING);
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [result, setResult] = useState(null);
    const [mirrorId, setMirrorId] = useState('');
    const [showShareCard, setShowShareCard] = useState(false);
    const [error, setError] = useState(null);

    // Fetch questions
    useEffect(() => {
        fetch(`${BRAIN_API}/api/quiz/questions`)
            .then(r => r.json())
            .then(data => setQuestions(data.questions || []))
            .catch(() => setError('Could not load scan. Try again.'));
    }, []);

    const handleStart = () => {
        if (questions.length > 0) {
            setPhase(PHASES.SCAN);
        }
    };

    const handleAnswer = (optionIndex) => {
        const newAnswers = [...answers, {
            question_id: questions[currentQuestion].id,
            selected_option: optionIndex,
        }];
        setAnswers(newAnswers);

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            submitScan(newAnswers);
        }
    };

    const submitScan = async (finalAnswers) => {
        setPhase(PHASES.GENERATING);

        // Transform answers to match API format
        const formattedAnswers = finalAnswers.map(a => ({
            question_id: a.question_id,
            answer_index: a.selected_option
        }));

        try {
            const response = await fetch(`${BRAIN_API}/api/quiz/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: formattedAnswers }),
            });

            const data = await response.json();
            setResult(data);

            // Generate MirrorSig ID
            const sig = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;
            setMirrorId(sig);

            // Dramatic pause then reveal
            setTimeout(() => setPhase(PHASES.REVEAL), 2000);
        } catch (err) {
            setError('Scan failed. Try again.');
            setPhase(PHASES.LANDING);
        }
    };

    const archetype = result?.archetype?.toLowerCase() || 'architect';
    const archetypeInfo = ARCHETYPES[archetype] || ARCHETYPES.architect;
    const twinInfo = TWIN_INFO[archetypeInfo.twin];

    return (
        <div className={`min-h-screen font-sans overflow-x-hidden transition-colors duration-300 ${
            isDark ? 'bg-[#08080a] text-white' : 'bg-[#fafafa] text-zinc-900'
        }`}>
            {/* Ambient Background */}
            <div className={`fixed inset-0 transition-opacity duration-500 ${
                isDark
                    ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent'
                    : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-100/50 via-transparent to-transparent'
            }`} />

            {/* Light Consent Banner */}
            <LightConsentBanner
                feature="start"
                onConsent={() => setConsentGiven(true)}
                isDark={isDark}
            />

            {/* Theme Toggle */}
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            {/* Main Content */}
            <main className="relative z-10 min-h-screen flex items-center justify-center p-4 pb-24">
                <AnimatePresence mode="wait">
                    {/* LANDING */}
                    {phase === PHASES.LANDING && (
                        <LandingPhase
                            key="landing"
                            onStart={handleStart}
                            isDark={isDark}
                            ready={questions.length > 0}
                            error={error}
                        />
                    )}

                    {/* SCAN */}
                    {phase === PHASES.SCAN && questions.length > 0 && (
                        <ScanPhase
                            key="scan"
                            question={questions[currentQuestion]}
                            questionNum={currentQuestion + 1}
                            total={questions.length}
                            onAnswer={handleAnswer}
                            isDark={isDark}
                        />
                    )}

                    {/* GENERATING */}
                    {phase === PHASES.GENERATING && (
                        <GeneratingPhase key="generating" isDark={isDark} />
                    )}

                    {/* REVEAL */}
                    {phase === PHASES.REVEAL && result && (
                        <RevealPhase
                            key="reveal"
                            archetype={archetype}
                            archetypeInfo={archetypeInfo}
                            mirrorId={mirrorId}
                            result={result}
                            onContinue={() => setPhase(PHASES.TWIN)}
                            isDark={isDark}
                        />
                    )}

                    {/* TWIN */}
                    {phase === PHASES.TWIN && (
                        <TwinPhase
                            key="twin"
                            twinInfo={twinInfo}
                            archetypeInfo={archetypeInfo}
                            onContinue={() => setPhase(PHASES.SEED)}
                            isDark={isDark}
                        />
                    )}

                    {/* SEED - Mirror Seed Generation */}
                    {phase === PHASES.SEED && (
                        <SeedPhase
                            key="seed"
                            archetype={archetype}
                            archetypeInfo={archetypeInfo}
                            twinInfo={twinInfo}
                            mirrorId={mirrorId}
                            result={result}
                            onContinue={() => setPhase(PHASES.COMPLETE)}
                            isDark={isDark}
                        />
                    )}

                    {/* COMPLETE */}
                    {phase === PHASES.COMPLETE && (
                        <CompletePhase
                            key="complete"
                            archetype={archetype}
                            archetypeInfo={archetypeInfo}
                            mirrorId={mirrorId}
                            twinInfo={twinInfo}
                            onShare={() => setShowShareCard(true)}
                            onMirror={() => navigate('/mirror')}
                            onTwins={() => navigate('/twins')}
                            isDark={isDark}
                        />
                    )}
                </AnimatePresence>
            </main>

            {/* Share Card Modal */}
            <AnimatePresence>
                {showShareCard && (
                    <ShareCard
                        archetype={archetype}
                        mirrorId={mirrorId}
                        insight={archetypeInfo.tagline}
                        onClose={() => setShowShareCard(false)}
                    />
                )}
            </AnimatePresence>

            <BottomNav />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Phase Components
// ─────────────────────────────────────────────────────────────

function LandingPhase({ onStart, isDark, ready, error }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center max-w-lg mx-auto"
        >
            {/* Glyph */}
            <motion.div
                className="text-6xl mb-8"
                animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 3, repeat: Infinity }}
            >
                ⟡
            </motion.div>

            {/* Headline */}
            <motion.h1
                className={`text-4xl sm:text-5xl font-bold mb-4 ${
                    isDark ? 'text-white' : 'text-zinc-900'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                Ready to meet yourself?
            </motion.h1>

            <motion.p
                className={`text-lg mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                60 seconds. 8 questions. Your cognitive archetype revealed.
            </motion.p>

            {error && (
                <motion.p
                    className="text-red-400 mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {error}
                </motion.p>
            )}

            <motion.button
                onClick={onStart}
                disabled={!ready}
                className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all ${
                    ready
                        ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:scale-105 active:scale-95'
                        : isDark
                            ? 'bg-white/10 text-zinc-400 cursor-not-allowed'
                            : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={ready ? { scale: 1.02 } : {}}
                whileTap={ready ? { scale: 0.98 } : {}}
            >
                {ready ? (
                    <span className="flex items-center gap-2">
                        Begin Scan <ArrowRight size={20} />
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        <Brain size={20} className="animate-pulse" /> Loading...
                    </span>
                )}
            </motion.button>

            {/* Trust signals */}
            <motion.div
                className={`mt-12 flex items-center justify-center gap-6 text-sm ${
                    isDark ? 'text-zinc-400' : 'text-zinc-400'
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                <span className="flex items-center gap-1">
                    <Lock size={14} /> Private
                </span>
                <span className="flex items-center gap-1">
                    <Zap size={14} /> Instant
                </span>
                <span className="flex items-center gap-1">
                    <Sparkles size={14} /> Free
                </span>
            </motion.div>
        </motion.div>
    );
}

function ScanPhase({ question, questionNum, total, onAnswer, isDark }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-xl"
        >
            {/* Progress */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-400'}`}>
                        Question {questionNum} of {total}
                    </span>
                    <span className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-400'}`}>
                        {Math.round((questionNum / total) * 100)}%
                    </span>
                </div>
                <div className={`h-1 rounded-full ${isDark ? 'bg-white/10' : 'bg-zinc-200'}`}>
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${(questionNum / total) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Question */}
            <motion.h2
                key={question.id}
                className={`text-2xl sm:text-3xl font-bold mb-8 ${
                    isDark ? 'text-white' : 'text-zinc-900'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {question.question || question.text}
            </motion.h2>

            {/* Options */}
            <div className="space-y-3">
                {question.options.map((option, index) => (
                    <motion.button
                        key={index}
                        onClick={() => onAnswer(index)}
                        className={`w-full p-4 rounded-xl text-left transition-all ${
                            isDark
                                ? 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 text-white'
                                : 'bg-white hover:bg-purple-50 border border-zinc-200 hover:border-purple-300 text-zinc-900'
                        }`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        {option}
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
}

function GeneratingPhase({ isDark }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
        >
            <motion.div
                className="text-6xl mb-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
                ⟡
            </motion.div>

            <motion.p
                className={`text-xl ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                Mapping your cognitive architecture...
            </motion.p>
        </motion.div>
    );
}

function RevealPhase({ archetype, archetypeInfo, mirrorId, result, onContinue, isDark }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-lg text-center"
        >
            {/* MirrorSig */}
            <motion.div
                className="mb-6 flex justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
                <MirrorSig
                    archetype={archetype}
                    seed={mirrorId}
                    size={180}
                    animated={true}
                />
            </motion.div>

            {/* Archetype Name */}
            <motion.h1
                className={`text-4xl sm:text-5xl font-bold mb-2 bg-gradient-to-r ${archetypeInfo.gradient} bg-clip-text text-transparent`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                {archetypeInfo.name}
            </motion.h1>

            <motion.p
                className={`text-lg mb-6 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                {archetypeInfo.tagline}
            </motion.p>

            {/* Description */}
            <motion.p
                className={`mb-8 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                {archetypeInfo.description}
            </motion.p>

            {/* Strengths & Blindspots */}
            <motion.div
                className="grid grid-cols-2 gap-4 mb-8 text-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
            >
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white border border-zinc-200'}`}>
                    <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        Strengths
                    </h3>
                    <ul className={`text-sm space-y-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        {archetypeInfo.strengths.map((s, i) => (
                            <li key={i}>• {s}</li>
                        ))}
                    </ul>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white border border-zinc-200'}`}>
                    <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                        Blind Spots
                    </h3>
                    <ul className={`text-sm space-y-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        {archetypeInfo.blindSpots.map((s, i) => (
                            <li key={i}>• {s}</li>
                        ))}
                    </ul>
                </div>
            </motion.div>

            {/* MirrorSig ID */}
            <motion.p
                className={`text-xs font-mono mb-6 ${isDark ? 'text-zinc-400' : 'text-zinc-400'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
            >
                MirrorSig: {mirrorId}
            </motion.p>

            <motion.button
                onClick={onContinue}
                className={`px-8 py-4 rounded-2xl font-semibold bg-gradient-to-r ${archetypeInfo.gradient} text-white`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                Meet Your AI Twin <ChevronRight size={20} className="inline" />
            </motion.button>
        </motion.div>
    );
}

function TwinPhase({ twinInfo, archetypeInfo, onContinue, isDark }) {
    const Icon = twinInfo.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-lg text-center"
        >
            {/* Twin Icon */}
            <motion.div
                className={`w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${archetypeInfo.gradient} flex items-center justify-center`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
            >
                <Icon size={48} className="text-white" />
            </motion.div>

            <motion.p
                className={`text-sm mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-400'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                Your matched AI companion
            </motion.p>

            <motion.h1
                className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                The {twinInfo.name}
            </motion.h1>

            <motion.p
                className={`text-lg mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                {twinInfo.desc}
            </motion.p>

            <motion.div
                className={`p-6 rounded-2xl mb-8 text-left ${
                    isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-zinc-200'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-400'} mb-3`}>
                    Why this match?
                </p>
                <p className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>
                    As {archetypeInfo.name.replace('The ', 'an ')}, you'll benefit from a {twinInfo.name} who
                    {archetypeInfo.twin === 'guardian' && ' helps you maintain focus and protect your cognitive boundaries.'}
                    {archetypeInfo.twin === 'scout' && ' explores possibilities and surfaces opportunities you might miss.'}
                    {archetypeInfo.twin === 'synthesizer' && ' integrates your ideas into coherent insights and patterns.'}
                    {archetypeInfo.twin === 'mirror' && ' reflects your thoughts with clarity and helps you see blind spots.'}
                </p>
            </motion.div>

            <motion.button
                onClick={onContinue}
                className={`px-8 py-4 rounded-2xl font-semibold bg-gradient-to-r ${archetypeInfo.gradient} text-white`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                Continue <ChevronRight size={20} className="inline" />
            </motion.button>
        </motion.div>
    );
}

function SeedPhase({ archetype, archetypeInfo, twinInfo, mirrorId, result, onContinue, isDark }) {
    const [seedGenerated, setSeedGenerated] = useState(false);
    const [downloading, setDownloading] = useState(false);

    // Generate Mirror Seed data
    const generateSeed = () => {
        const seed = {
            version: '1.0',
            protocol: 'MirrorDNA',
            created: new Date().toISOString(),
            identity: {
                mirrorId: mirrorId,
                archetype: archetype,
                archetypeName: archetypeInfo.name,
                twin: archetypeInfo.twin,
                twinName: twinInfo.name,
            },
            cognition: {
                strengths: archetypeInfo.strengths,
                blindSpots: archetypeInfo.blindSpots,
                scores: result?.scores || {},
            },
            consent: {
                timestamp: new Date().toISOString(),
                version: '1.0',
                source: 'activemirror.ai/start',
            },
            portability: {
                format: 'ami',
                compatible: ['ChatGPT', 'Claude', 'Gemini', 'Local LLMs'],
                instructions: 'Share this file with any AI to establish your identity context.',
            }
        };
        return seed;
    };

    const handleDownload = () => {
        setDownloading(true);
        const seed = generateSeed();
        const blob = new Blob([JSON.stringify(seed, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mirror-seed-${archetype}-${mirrorId.slice(2, 10)}.ami`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setSeedGenerated(true);
        setDownloading(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="w-full max-w-lg text-center"
        >
            {/* Seed Icon */}
            <motion.div
                className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
                    seedGenerated
                        ? 'bg-gradient-to-br from-emerald-500 to-green-500'
                        : `bg-gradient-to-br ${archetypeInfo.gradient}`
                }`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
            >
                {seedGenerated ? (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <Lock size={40} className="text-white" />
                    </motion.div>
                ) : (
                    <Fingerprint size={40} className="text-white" />
                )}
            </motion.div>

            <motion.p
                className={`text-sm mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                {seedGenerated ? 'Identity Secured' : 'Create Your Portable Identity'}
            </motion.p>

            <motion.h1
                className={`text-3xl sm:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                {seedGenerated ? 'Mirror Seed Downloaded' : 'Your Mirror Seed'}
            </motion.h1>

            <motion.p
                className={`mb-6 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                {seedGenerated
                    ? 'Your identity file is yours. Share it with any AI to carry your context.'
                    : 'A portable identity file that works across any AI platform. Owned by you, not them.'}
            </motion.p>

            {/* Seed Contents Preview */}
            <motion.div
                className={`p-4 rounded-xl mb-6 text-left ${
                    isDark ? 'bg-white/5 border border-white/10' : 'bg-zinc-100 border border-zinc-200'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <p className={`text-xs font-mono mb-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    MIRROR SEED CONTAINS:
                </p>
                <ul className={`text-sm space-y-1 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    <li className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${archetypeInfo.gradient}`} />
                        Archetype: {archetypeInfo.name}
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        AI Twin: {twinInfo.name}
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Cognitive Profile (strengths + blind spots)
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        Consent Proof
                    </li>
                </ul>
            </motion.div>

            {/* Download Button */}
            {!seedGenerated ? (
                <motion.button
                    onClick={handleDownload}
                    disabled={downloading}
                    className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 mb-4 ${
                        downloading
                            ? 'bg-zinc-500 cursor-wait'
                            : `bg-gradient-to-r ${archetypeInfo.gradient} hover:opacity-90`
                    } text-white transition-all`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: downloading ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Download size={20} />
                    {downloading ? 'Generating...' : 'Download Mirror Seed (.ami)'}
                </motion.button>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-xl mb-4 ${
                        isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'
                    }`}
                >
                    <p className={`text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        ✓ Seed saved to your downloads
                    </p>
                </motion.div>
            )}

            {/* Advanced Options Link */}
            <motion.a
                href="https://id.activemirror.ai"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 text-sm mb-6 ${
                    isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
            >
                <Fingerprint size={16} />
                Advanced identity options at id.activemirror.ai
                <ArrowRight size={14} />
            </motion.a>

            {/* Continue Button */}
            <motion.button
                onClick={onContinue}
                className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                    isDark
                        ? 'bg-white/10 hover:bg-white/15 text-white'
                        : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-900'
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {seedGenerated ? 'Continue' : 'Skip for Now'}
                <ChevronRight size={20} />
            </motion.button>
        </motion.div>
    );
}

function CompletePhase({ archetype, archetypeInfo, mirrorId, twinInfo, onShare, onMirror, onTwins, isDark }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-lg text-center"
        >
            {/* Success Glyph */}
            <motion.div
                className="text-5xl mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
            >
                ⟡
            </motion.div>

            <motion.h1
                className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                Your Mirror is Ready
            </motion.h1>

            <motion.p
                className={`mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                You're {archetypeInfo.name}. Your {twinInfo.name} Twin awaits.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
                className="space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <button
                    onClick={onMirror}
                    className={`w-full py-4 rounded-xl font-semibold bg-gradient-to-r ${archetypeInfo.gradient} text-white flex items-center justify-center gap-2`}
                >
                    <Sparkles size={20} /> Start Reflecting
                </button>

                <button
                    onClick={onTwins}
                    className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                        isDark
                            ? 'bg-white/10 hover:bg-white/15 text-white'
                            : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'
                    }`}
                >
                    <twinInfo.icon size={20} /> Meet All Twins
                </button>

                <button
                    onClick={onShare}
                    className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 border ${
                        isDark
                            ? 'border-white/10 hover:bg-white/5 text-white'
                            : 'border-zinc-200 hover:bg-zinc-50 text-zinc-900'
                    }`}
                >
                    <Share2 size={20} /> Share Your MirrorSig
                </button>
            </motion.div>

            {/* MirrorSig */}
            <motion.div
                className="mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                <MirrorSig
                    archetype={archetype}
                    seed={mirrorId}
                    size={100}
                    animated={false}
                    className="mx-auto"
                />
                <p className={`text-xs font-mono mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-400'}`}>
                    {mirrorId}
                </p>
            </motion.div>
        </motion.div>
    );
}
