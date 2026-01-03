import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Github, Book, History } from 'lucide-react';
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
        <div className="relative min-h-screen font-sans text-white overflow-hidden selection:bg-green-500/30">
            {/* AMBIENT LAYERS */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black z-0"></div>
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0"></div>

            <main className="relative z-10 w-full min-h-screen flex items-center justify-center p-6">
                <SpotlightCard className="w-full max-w-2xl text-center p-12 md:p-16 border-white/5 bg-black/40 backdrop-blur-3xl shadow-2xl">

                    {/* LOGO */}
                    <div className="mb-8 flex justify-center">
                        <div className="p-4 rounded-full bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                            <MirrorLogo className="w-10 h-10" />
                        </div>
                    </div>

                    {/* POSITIVE COPY (Universal & Elegant) */}
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent">
                        Intelligence,<br />Reflected.
                    </h1>

                    <p className="text-lg text-zinc-400 leading-relaxed mb-10 font-light max-w-lg mx-auto">
                        The universal sovereign protocol. <br />
                        Native to your hardware. Owned by you.
                    </p>

                    {/* ACTIONS */}
                    <div className="flex flex-col gap-4 mb-12">
                        {/* Primary: Demo */}
                        <Link to="/demo" className="group w-full py-4 rounded-xl bg-white text-black font-bold text-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)]">
                            Initialize System <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>

                        {/* Secondary: Socials */}
                        <div className="grid grid-cols-2 gap-4">
                            <a href="https://github.com/MirrorDNA-Reflection-Protocol" className="py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-zinc-300 text-sm font-medium">
                                <Github size={16} /> Protocol
                            </a>
                            <a href="https://mirrordna-reflection-protocol.github.io/MirrorDNA-Docs/" className="py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-zinc-300 text-sm font-medium">
                                <Book size={16} /> Manifesto
                            </a>
                        </div>
                    </div>

                    {/* FOOTER: SYSTEM & LEGACY LINK */}
                    <div className="pt-8 border-t border-white/5 flex justify-between items-center text-[10px] md:text-xs font-mono text-zinc-600 uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            v2.0 UNIVERSAL
                        </div>

                        {/* THE LEGACY LINK (Restored) */}
                        <a href="./legacy/index.html" className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer group">
                            <History size={12} className="group-hover:-translate-x-0.5 transition-transform" />
                            Archive [v1.0]
                        </a>
                    </div>
                </SpotlightCard>
            </main>
        </div>
    );
}
