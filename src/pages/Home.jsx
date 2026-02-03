/**
 * ⟡ Home — Full Landing Page
 * Combines simple onboarding with full site explanation
 */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Github, Book, Zap, Brain, Users, Send, Target, Sparkles, HelpCircle, Globe } from 'lucide-react';
import SpotlightCard from '../components/SpotlightCard';
import MirrorLogo from '../components/MirrorLogo';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import Lenis from '@studio-freight/lenis';

export default function Home() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    useEffect(() => {
        const lenis = new Lenis();
        function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
    }, []);

    return (
        <div className={`relative min-h-screen font-sans overflow-x-hidden transition-colors duration-300 ${
            isDark
                ? 'bg-black text-white selection:bg-purple-500/30'
                : 'bg-zinc-50 text-zinc-900 selection:bg-purple-500/30'
        }`}>
            {/* AMBIENT LAYERS */}
            <div className={`fixed inset-0 z-0 transition-opacity duration-300 ${
                isDark
                    ? 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-black to-black'
                    : 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-100/30 via-zinc-50 to-zinc-50'
            }`}></div>
            {isDark && (
                <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0"></div>
            )}

            {/* THEME TOGGLE */}
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            {/* TOP NAVIGATION BAR */}
            <nav className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b transition-colors duration-300 ${
                isDark
                    ? 'bg-black/80 border-purple-500/10'
                    : 'bg-white/80 border-zinc-200'
            }`} role="navigation" aria-label="Main navigation">
                <div className={`flex flex-wrap justify-center gap-x-4 sm:gap-x-6 gap-y-1 py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs ${
                    isDark ? 'text-zinc-400' : 'text-zinc-500'
                }`}>
                    <a href="https://mirrordna-reflection-protocol.github.io/MirrorDNA-Docs/capabilities/" className="hover:text-purple-500 transition-colors" target="_blank" rel="noopener noreferrer">Capabilities</a>
                    <a href="https://mirrordna-reflection-protocol.github.io/MirrorDNA-Docs/architecture/" className="hover:text-purple-500 transition-colors" target="_blank" rel="noopener noreferrer">Architecture</a>
                    <a href="https://mirrordna-reflection-protocol.github.io/MirrorDNA-Docs/ecosystem/" className="hover:text-purple-500 transition-colors" target="_blank" rel="noopener noreferrer">Ecosystem</a>
                    <a href="https://github.com/MirrorDNA-Reflection-Protocol" className="hover:text-purple-500 transition-colors" target="_blank" rel="noopener noreferrer">Open Source</a>
                    <a href="mailto:enterprise@activemirror.ai" className="hover:text-purple-500 transition-colors">Enterprise</a>
                </div>
            </nav>

            <main className="relative z-10 w-full min-h-screen flex items-center justify-center p-4 sm:p-6 pt-14 sm:pt-16 pb-8" role="main">
                <SpotlightCard className={`w-full max-w-2xl text-center p-6 sm:p-12 md:p-16 border backdrop-blur-3xl shadow-2xl ring-1 transition-colors duration-300 ${
                    isDark
                        ? 'border-purple-500/20 bg-black/40 shadow-purple-500/10 ring-purple-500/10'
                        : 'border-zinc-200 bg-white/60 shadow-zinc-500/10 ring-zinc-200'
                }`}>

                    {/* LOGO + GLYPH */}
                    <div className="mb-4 sm:mb-8 flex flex-col items-center gap-2">
                        <span className={`text-4xl glyph-breathe ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>⟡</span>
                        <MirrorLogo className={`w-14 h-14 sm:w-20 sm:h-20 ${isDark ? 'text-white' : 'text-zinc-800'}`} />
                    </div>

                    {/* HEADLINE */}
                    <h1 className={`text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight md:tracking-tighter mb-4 sm:mb-6 bg-clip-text text-transparent leading-tight ${
                        isDark
                            ? 'bg-gradient-to-b from-white via-white to-zinc-500'
                            : 'bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-500'
                    }`}>
                        Intelligence<br />Reflected.
                    </h1>

                    <p className={`text-sm sm:text-lg leading-relaxed mb-6 sm:mb-10 font-light max-w-lg mx-auto ${
                        isDark ? 'text-zinc-400' : 'text-zinc-600'
                    }`}>
                        The universal sovereign protocol. <br className="hidden sm:block" />
                        Native to your hardware. Owned by you.
                    </p>

                    {/* WHAT IS THIS - Simple explanation */}
                    <div className={`mb-6 p-4 rounded-xl text-left ${
                        isDark ? 'bg-white/5 border border-white/10' : 'bg-zinc-100 border border-zinc-200'
                    }`}>
                        <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                            <HelpCircle size={16} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                            What happens when you start?
                        </h3>
                        <ol className={`text-sm space-y-2 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                            <li className="flex items-start gap-2">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>1</span>
                                Answer 8 quick questions (60 seconds)
                            </li>
                            <li className="flex items-start gap-2">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>2</span>
                                Discover your cognitive archetype
                            </li>
                            <li className="flex items-start gap-2">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>3</span>
                                Meet your matched AI companion
                            </li>
                            <li className="flex items-start gap-2">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>4</span>
                                Start reflecting with intelligence that learns you
                            </li>
                        </ol>
                    </div>

                    {/* ACTIONS STACK */}
                    <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-12 max-w-md mx-auto w-full">
                        {/* 1. DISCOVER (Viral Journey - Primary) */}
                        <Link to="/start" className="group w-full py-3 sm:py-4 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-bold text-base sm:text-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(168,85,247,0.3)] hover:shadow-[0_0_35px_rgba(168,85,247,0.4)]" aria-label="Discover your cognitive archetype">
                            <Sparkles size={18} /> Get Started <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                        </Link>

                        {/* 2. START REFLECTION (Secondary) */}
                        <Link to="/mirror" className={`w-full py-3 sm:py-4 rounded-xl border font-medium transition-all flex items-center justify-center gap-3 group text-sm sm:text-base ${
                            isDark
                                ? 'border-purple-500/20 bg-white/5 text-white hover:bg-purple-500/10 hover:border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.05)] hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]'
                                : 'border-zinc-300 bg-white text-zinc-800 hover:bg-purple-50 hover:border-purple-300'
                        }`}>
                            Start Reflection
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>

                        {/* 3. ECOSYSTEM */}
                        <a href="https://mirrordna-reflection-protocol.github.io/MirrorDNA-Docs/ecosystem/" target="_blank" className={`w-full py-3 sm:py-4 rounded-xl border font-medium transition-all flex items-center justify-center gap-2 sm:gap-3 group text-sm sm:text-base ${
                            isDark
                                ? 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.1)] hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]'
                                : 'border-cyan-300 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 hover:border-cyan-400'
                        }`}>
                            <Globe size={16} />
                            Explore Ecosystem
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </a>

                        {/* 4. INTELLIGENCE SUITE - 2x2 Grid */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-1 sm:mt-2">
                            <Link to="/scan" className={`group py-3 sm:py-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 hover:scale-[1.02] ${
                                isDark
                                    ? 'border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/40'
                                    : 'border-purple-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-300'
                            }`}>
                                <Brain size={20} className={`transition-colors ${isDark ? 'text-purple-400 group-hover:text-purple-300' : 'text-purple-600 group-hover:text-purple-700'}`} />
                                <span className={`text-xs sm:text-sm font-medium ${isDark ? 'text-purple-400 group-hover:text-purple-300' : 'text-purple-600'}`}>BrainScan</span>
                                <span className={`text-[9px] sm:text-[10px] hidden sm:block ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Discover your archetype</span>
                            </Link>
                            <Link to="/twins" className={`group py-3 sm:py-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 hover:scale-[1.02] ${
                                isDark
                                    ? 'border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 hover:border-violet-500/40'
                                    : 'border-violet-200 bg-violet-50 hover:bg-violet-100 hover:border-violet-300'
                            }`}>
                                <Users size={20} className={`transition-colors ${isDark ? 'text-violet-400 group-hover:text-violet-300' : 'text-violet-600 group-hover:text-violet-700'}`} />
                                <span className={`text-xs sm:text-sm font-medium ${isDark ? 'text-violet-400 group-hover:text-violet-300' : 'text-violet-600'}`}>AI Twins</span>
                                <span className={`text-[9px] sm:text-[10px] hidden sm:block ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Cognitive companions</span>
                            </Link>
                            <Link to="/brief" className={`group py-3 sm:py-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 hover:scale-[1.02] ${
                                isDark
                                    ? 'border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/40'
                                    : 'border-amber-200 bg-amber-50 hover:bg-amber-100 hover:border-amber-300'
                            }`}>
                                <Target size={20} className={`transition-colors ${isDark ? 'text-amber-400 group-hover:text-amber-300' : 'text-amber-600 group-hover:text-amber-700'}`} />
                                <span className={`text-xs sm:text-sm font-medium ${isDark ? 'text-amber-400 group-hover:text-amber-300' : 'text-amber-600'}`}>Brief</span>
                                <span className={`text-[9px] sm:text-[10px] hidden sm:block ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Temporal intelligence</span>
                            </Link>
                            <Link to="/cast" className={`group py-3 sm:py-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 hover:scale-[1.02] ${
                                isDark
                                    ? 'border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 hover:border-cyan-500/40'
                                    : 'border-cyan-200 bg-cyan-50 hover:bg-cyan-100 hover:border-cyan-300'
                            }`}>
                                <Send size={20} className={`transition-colors ${isDark ? 'text-cyan-400 group-hover:text-cyan-300' : 'text-cyan-600 group-hover:text-cyan-700'}`} />
                                <span className={`text-xs sm:text-sm font-medium ${isDark ? 'text-cyan-400 group-hover:text-cyan-300' : 'text-cyan-600'}`}>Cast</span>
                                <span className={`text-[9px] sm:text-[10px] hidden sm:block ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Messages through time</span>
                            </Link>
                        </div>

                        {/* 5. EXTERNAL LINKS */}
                        <div className={`flex justify-center gap-4 sm:gap-6 mt-3 sm:mt-4 text-[10px] sm:text-xs ${
                            isDark ? 'text-zinc-400' : 'text-zinc-500'
                        }`}>
                            <a href="https://github.com/MirrorDNA-Reflection-Protocol" className="hover:text-purple-500 transition-colors flex items-center gap-1">
                                <Github size={12} /> Protocol
                            </a>
                            <a href="https://mirrordna-reflection-protocol.github.io/MirrorDNA-Docs/story/" target="_blank" rel="noopener noreferrer" className="hover:text-purple-500 transition-colors flex items-center gap-1">
                                <Book size={12} /> Story
                            </a>
                            <Link to="/research" className="hover:text-purple-500 transition-colors flex items-center gap-1">
                                <ArrowRight size={12} /> Research
                            </Link>
                        </div>
                    </div>

                    {/* LEGAL DISCLAIMER */}
                    <div className={`mt-6 p-4 rounded-xl text-center ${
                        isDark ? 'bg-amber-500/5 border border-amber-500/10' : 'bg-amber-50 border border-amber-200'
                    }`}>
                        <p className={`text-[10px] sm:text-xs leading-relaxed ${isDark ? 'text-amber-200/70' : 'text-amber-700/80'}`}>
                            <strong className={isDark ? 'text-amber-300' : 'text-amber-800'}>⚠ Disclaimer:</strong> Active Mirror is experimental AI technology.
                            It is <strong>not</strong> therapy, medical advice, or a substitute for professional help.
                            Use at your own risk. By using this site, you accept our{' '}
                            <Link to="/terms" className={`underline ${isDark ? 'hover:text-amber-300' : 'hover:text-amber-900'}`}>Terms</Link> and{' '}
                            <Link to="/privacy" className={`underline ${isDark ? 'hover:text-amber-300' : 'hover:text-amber-900'}`}>Privacy Policy</Link>.
                        </p>
                    </div>

                    {/* FOOTER: LEGALS */}
                    <div className={`pt-4 sm:pt-6 border-t flex justify-center items-center text-[9px] sm:text-[10px] md:text-xs font-mono uppercase tracking-widest w-full mt-4 ${
                        isDark ? 'border-purple-500/10 text-zinc-600' : 'border-zinc-200 text-zinc-400'
                    }`}>
                        <div className="flex flex-wrap justify-center gap-x-4 sm:gap-x-8 gap-y-2 text-center items-center">
                            <Link to="/terms" className="hover:text-purple-500 transition-colors">Terms</Link>

                            {/* Hidden/Subtle Intelligence Link */}
                            <Link to="/brief" className="relative group/zap" aria-label="Intelligence">
                                <div className="absolute inset-0 bg-amber-500/30 blur-lg rounded-full animate-pulse-slow opacity-0 group-hover/zap:opacity-100 transition-opacity duration-1000"></div>
                                <Zap size={10} className="inline-block text-amber-500 animate-pulse-slow drop-shadow-[0_0_3px_rgba(245,158,11,0.3)] group-hover/zap:text-amber-300 group-hover/zap:animate-none group-hover/zap:drop-shadow-[0_0_15px_rgba(245,158,11,1)] transition-all duration-500" />
                            </Link>

                            <Link to="/privacy" className="hover:text-purple-500 transition-colors">Privacy</Link>
                        </div>
                    </div>
                </SpotlightCard>
            </main>
        </div>
    );
}
