import React, { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import { ArrowRight, Github, Book } from 'lucide-react';
import SpotlightCard from '../components/SpotlightCard';
import MirrorLogo from '../components/MirrorLogo';
import { Link } from 'react-router-dom';

export default function Home() {
    useEffect(() => {
        const lenis = new Lenis();
        function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
    }, []);

    return (
        <div className="relative min-h-screen font-sans text-white overflow-hidden selection:bg-green-500/30">
            {/* THE VOID (Background) */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black z-0"></div>
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0"></div>

            {/* THE PORTAL (Single Floating Monolith) */}
            <main className="relative z-10 w-full min-h-screen flex items-center justify-center p-6">

                <SpotlightCard className="w-full max-w-2xl text-center p-12 md:p-16 border-white/5 bg-black/40 backdrop-blur-3xl shadow-2xl">

                    {/* 1. IDENTITY */}
                    <div className="mb-10 inline-flex items-center justify-center p-3 rounded-full bg-white/5 border border-white/10">
                        <MirrorLogo className="w-8 h-8 text-white" />
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                        Don't Rent Your Mind.
                    </h1>

                    <p className="text-lg md:text-xl text-zinc-400 leading-relaxed mb-12 font-light">
                        The Universal Sovereign Intelligence Protocol.<br />
                        Native to Apple Silicon. Portable to Any Iron.
                    </p>

                    {/* 2. THE GATEWAY (Real Links) */}
                    <div className="flex flex-col gap-4">
                        {/* Demo Link - Points to the restored local demo */}
                        <Link to="/demo" className="group w-full py-5 rounded-2xl bg-white text-black font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                            Enter the Demo <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <div className="grid grid-cols-2 gap-4">
                            <a href="https://github.com/MirrorDNA-Reflection-Protocol" className="py-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-zinc-300">
                                <Github size={18} /> Source
                            </a>
                            <a href="https://mirrordna-reflection-protocol.github.io/MirrorDNA-Docs/" className="py-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-zinc-300">
                                <Book size={18} /> Docs
                            </a>
                        </div>
                    </div>

                    {/* 3. STATUS FOOTER */}
                    <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center text-xs font-mono text-zinc-600">
                        <span>v2.0.0 [SOVEREIGN]</span>
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            SYSTEM ONLINE
                        </span>
                    </div>
                </SpotlightCard>
            </main>
        </div>
    );
}
