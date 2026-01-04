import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Github, Book, Globe } from 'lucide-react';
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
        <div className="relative min-h-screen font-sans text-white overflow-hidden selection:bg-purple-500/30">
            {/* AMBIENT LAYERS */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-black to-black z-0"></div>
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0"></div>

            {/* TOP NAVIGATION BAR */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-purple-500/10">
                <div className="flex justify-center gap-x-6 gap-y-2 py-3 px-4 text-xs text-zinc-400">
                    <a href="/blog/" className="hover:text-purple-400 transition-colors">Blog</a>
                    <a href="/mobile/" className="hover:text-purple-400 transition-colors">Mobile</a>
                    <a href="/architecture/" className="hover:text-purple-400 transition-colors">Architecture</a>
                    <a href="https://mirrordna-reflection-protocol.github.io/MirrorDNA-Docs/ecosystem/" className="hover:text-purple-400 transition-colors" target="_blank">Ecosystem</a>
                    <a href="/open-source/" className="hover:text-purple-400 transition-colors">Open Source</a>
                    <a href="/enterprise/" className="hover:text-purple-400 transition-colors">Enterprise</a>
                </div>
            </nav>

            <main className="relative z-10 w-full min-h-screen flex items-center justify-center p-6 pt-16">
                <SpotlightCard className="w-full max-w-2xl text-center p-12 md:p-16 border border-purple-500/20 bg-black/40 backdrop-blur-3xl shadow-2xl shadow-purple-500/10 ring-1 ring-purple-500/10">

                    {/* LOGO HERO */}
                    <div className="mb-8 flex justify-center">
                        <MirrorLogo className="w-20 h-20 text-white" />
                    </div>

                    {/* HEADLINE */}
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight md:tracking-tighter mb-6 bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent">
                        Intelligence<br />Reflected.
                    </h1>

                    <p className="text-lg text-zinc-400 leading-relaxed mb-10 font-light max-w-lg mx-auto">
                        The universal sovereign protocol. <br />
                        Native to your hardware. Owned by you.
                    </p>

                    {/* ACTIONS STACK */}
                    <div className="flex flex-col gap-4 mb-12 max-w-md mx-auto w-full">
                        {/* 1. START REFLECTION (Primary) - Use <a> for full page nav to static file */}
                        <a href="/mirror/" className="group w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-bold text-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(168,85,247,0.3)] hover:shadow-[0_0_35px_rgba(168,85,247,0.4)]">
                            Start Reflection <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </a>

                        {/* 2. VISIT SITE (Secondary, Glowing) */}
                        <a href="./legacy/index.html" className="w-full py-4 rounded-xl border border-purple-500/20 bg-white/5 text-white font-medium hover:bg-purple-500/10 hover:border-purple-500/30 transition-all flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(168,85,247,0.05)] hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] group">
                            <Globe size={18} className="group-hover:rotate-12 transition-transform text-zinc-400 group-hover:text-purple-400" />
                            Visit Site
                        </a>

                        {/* 3. ECOSYSTEM (Eye-catching) */}
                        <a href="https://mirrordna-reflection-protocol.github.io/MirrorDNA-Docs/ecosystem/" target="_blank" className="w-full py-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 font-medium hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,211,238,0.1)] hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] group">
                            <span className="text-lg">✦</span>
                            Explore the Ecosystem
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </a>

                        {/* 4. SOCIALS (Tertiary) */}
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <a href="https://github.com/MirrorDNA-Reflection-Protocol" className="py-3 rounded-xl border border-purple-500/10 bg-white/5 hover:bg-purple-500/10 hover:border-purple-500/20 transition-colors flex items-center justify-center gap-2 text-zinc-300 hover:text-purple-400 text-sm font-medium">
                                <Github size={16} /> Protocol
                            </a>
                            <a href="https://mirrordna-reflection-protocol.github.io/MirrorDNA-Docs/story/" className="py-3 rounded-xl border border-purple-500/10 bg-white/5 hover:bg-purple-500/10 hover:border-purple-500/20 transition-colors flex items-center justify-center gap-2 text-zinc-300 hover:text-purple-400 text-sm font-medium">
                                <Book size={16} /> The Story
                            </a>
                        </div>
                    </div>



                    {/* FOOTER: LEGALS ONLY */}
                    <div className="pt-6 border-t border-purple-500/10 flex justify-center items-center text-[10px] md:text-xs font-mono text-zinc-600 uppercase tracking-widest w-full mt-6">
                        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-center">
                            <Link to="/terms" className="hover:text-purple-400 transition-colors">Terms of Service</Link>
                            <Link to="/privacy" className="hover:text-purple-400 transition-colors">Privacy Policy</Link>
                        </div>
                    </div>
                </SpotlightCard>
            </main>
        </div>
    );
}
