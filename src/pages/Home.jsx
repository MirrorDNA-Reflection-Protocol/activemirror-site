import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Github, Book, Globe, FileText, Zap } from 'lucide-react';
import SpotlightCard from '../components/SpotlightCard';
import MirrorLogo from '../components/MirrorLogo';
import Lenis from '@studio-freight/lenis';

export default function Home() {
    useEffect(() => {
        const lenis = new Lenis();
        function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
    }, []);

    return (
        <div className="relative min-h-screen font-sans text-white overflow-x-hidden selection:bg-purple-500/30">
            {/* AMBIENT LAYERS */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-black to-black z-0"></div>
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0"></div>

            {/* TOP NAVIGATION BAR - Two rows on mobile */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-purple-500/10">
                <div className="flex flex-wrap justify-center gap-x-4 sm:gap-x-6 gap-y-1 py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs text-zinc-400">
                    <a href="/mobile/" className="hover:text-purple-400 transition-colors">Mobile</a>
                    <a href="/architecture/" className="hover:text-purple-400 transition-colors">Architecture</a>
                    <a href="https://mirrordna-reflection-protocol.github.io/MirrorDNA-Docs/ecosystem/" className="hover:text-purple-400 transition-colors" target="_blank">Ecosystem</a>
                    <a href="/open-source/" className="hover:text-purple-400 transition-colors">Open Source</a>
                    <a href="/enterprise/" className="hover:text-purple-400 transition-colors">Enterprise</a>
                </div>
            </nav>

            <main className="relative z-10 w-full min-h-screen flex items-center justify-center p-4 sm:p-6 pt-14 sm:pt-16 pb-8">
                <SpotlightCard className="w-full max-w-2xl text-center p-6 sm:p-12 md:p-16 border border-purple-500/20 bg-black/40 backdrop-blur-3xl shadow-2xl shadow-purple-500/10 ring-1 ring-purple-500/10">

                    {/* LOGO HERO */}
                    <div className="mb-4 sm:mb-8 flex justify-center">
                        <MirrorLogo className="w-14 h-14 sm:w-20 sm:h-20 text-white" />
                    </div>

                    {/* HEADLINE - Smaller on mobile to prevent cutoff */}
                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight md:tracking-tighter mb-4 sm:mb-6 bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent leading-tight">
                        Intelligence<br />Reflected.
                    </h1>

                    <p className="text-sm sm:text-lg text-zinc-400 leading-relaxed mb-6 sm:mb-10 font-light max-w-lg mx-auto">
                        The universal sovereign protocol. <br className="hidden sm:block" />
                        Native to your hardware. Owned by you.
                    </p>

                    {/* ACTIONS STACK */}
                    <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-12 max-w-md mx-auto w-full">
                        {/* 1. START REFLECTION (Primary) */}
                        <a href="/mirror/" className="group w-full py-3 sm:py-4 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-bold text-base sm:text-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(168,85,247,0.3)] hover:shadow-[0_0_35px_rgba(168,85,247,0.4)]">
                            Start Reflection <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                        </a>

                        {/* 2. VISIT SITE (Secondary) */}
                        <a href="/legacy/index.html" className="w-full py-3 sm:py-4 rounded-xl border border-purple-500/20 bg-white/5 text-white font-medium hover:bg-purple-500/10 hover:border-purple-500/30 transition-all flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(168,85,247,0.05)] hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] group text-sm sm:text-base">
                            <Globe size={16} className="group-hover:rotate-12 transition-transform text-zinc-400 group-hover:text-purple-400" />
                            Visit Site
                        </a>

                        {/* 3. DAILY BRIEFING (Intelligence) - NEW */}
                        <a href="https://brief.activemirror.ai" target="_blank" className="w-full py-3 sm:py-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-500 font-medium hover:bg-amber-500/10 hover:border-amber-500/30 transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] group text-sm sm:text-base">
                            <Zap size={16} className="text-amber-500 fill-amber-500/20 group-hover:fill-amber-500/40 transition-colors" />
                            Daily Briefing
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform opacity-50" />
                        </a>

                        {/* 4. ECOSYSTEM (Eye-catching) */}
                        <a href="https://mirrordna-reflection-protocol.github.io/MirrorDNA-Docs/ecosystem/" target="_blank" className="w-full py-3 sm:py-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 font-medium hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-[0_0_20px_rgba(34,211,238,0.1)] hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] group text-sm sm:text-base">
                            <span className="text-base sm:text-lg">✦</span>
                            Explore Ecosystem
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </a>

                        {/* 4. QUICK LINKS - 2x2 Grid */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-1 sm:mt-2">
                            <a href="https://github.com/MirrorDNA-Reflection-Protocol" className="py-2 sm:py-3 rounded-xl border border-purple-500/10 bg-white/5 hover:bg-purple-500/10 hover:border-purple-500/20 transition-colors flex items-center justify-center gap-2 text-zinc-300 hover:text-purple-400 text-xs sm:text-sm font-medium">
                                <Github size={14} /> Protocol
                            </a>
                            <a href="/research/" className="py-2 sm:py-3 rounded-xl border border-purple-500/10 bg-white/5 hover:bg-purple-500/10 hover:border-purple-500/20 transition-colors flex items-center justify-center gap-2 text-zinc-300 hover:text-purple-400 text-xs sm:text-sm font-medium">
                                <FileText size={14} /> Research
                            </a>
                            <a href="https://mirrordna-reflection-protocol.github.io/MirrorDNA-Docs/story/" className="py-2 sm:py-3 rounded-xl border border-purple-500/10 bg-white/5 hover:bg-purple-500/10 hover:border-purple-500/20 transition-colors flex items-center justify-center gap-2 text-zinc-300 hover:text-purple-400 text-xs sm:text-sm font-medium">
                                <Book size={14} /> The Story
                            </a>
                            <a href="/blog/" className="py-2 sm:py-3 rounded-xl border border-purple-500/10 bg-white/5 hover:bg-purple-500/10 hover:border-purple-500/20 transition-colors flex items-center justify-center gap-2 text-zinc-300 hover:text-purple-400 text-xs sm:text-sm font-medium">
                                <ArrowRight size={14} /> Blog
                            </a>
                        </div>

                        {/* 5. PREVIEW LINK */}
                        <Link to="/preview" className="mt-2 sm:mt-4 text-[10px] sm:text-xs text-zinc-600 hover:text-purple-400 transition-colors">
                            ✨ Preview upcoming features →
                        </Link>
                    </div>

                    {/* FOOTER: LEGALS ONLY */}
                    <div className="pt-4 sm:pt-6 border-t border-purple-500/10 flex justify-center items-center text-[9px] sm:text-[10px] md:text-xs font-mono text-zinc-600 uppercase tracking-widest w-full mt-2 sm:mt-6">
                        <div className="flex flex-wrap justify-center gap-x-4 sm:gap-x-8 gap-y-2 text-center">
                            <Link to="/terms" className="hover:text-purple-400 transition-colors">Terms</Link>
                            <Link to="/privacy" className="hover:text-purple-400 transition-colors">Privacy</Link>
                        </div>
                    </div>
                </SpotlightCard>
            </main>
        </div>
    );
}
