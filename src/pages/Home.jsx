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
        <div className="relative min-h-screen font-sans text-white overflow-hidden selection:bg-green-500/30">
            {/* AMBIENT LAYERS */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black z-0"></div>
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0"></div>

            <main className="relative z-10 w-full min-h-screen flex items-center justify-center p-6">
                <SpotlightCard className="w-full max-w-2xl text-center p-12 md:p-16 border-white/5 bg-black/40 backdrop-blur-3xl shadow-2xl">

                    {/* LOGO HERO */}
                    <div className="mb-8 flex justify-center">
                        <MirrorLogo className="w-20 h-20 text-white" />
                    </div>

                    {/* HEADLINE */}
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent">
                        Intelligence,<br />Reflected.
                    </h1>

                    <p className="text-lg text-zinc-400 leading-relaxed mb-10 font-light max-w-lg mx-auto">
                        The universal sovereign protocol. <br />
                        Native to your hardware. Owned by you.
                    </p>

                    {/* ACTIONS STACK */}
                    <div className="flex flex-col gap-4 mb-12 max-w-md mx-auto w-full">
                        {/* 1. START REFLECTION (Primary) */}
                        <Link to="/demo" className="group w-full py-4 rounded-xl bg-white text-black font-bold text-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)]">
                            Start Reflection <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>

                        {/* 2. VISIT SITE (Secondary, Glowing) */}
                        <a href="./legacy/index.html" className="w-full py-4 rounded-xl border border-white/10 bg-white/5 text-white font-medium hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] group">
                            <Globe size={18} className="group-hover:rotate-12 transition-transform text-zinc-400 group-hover:text-white" />
                            Visit Site
                        </a>

                        {/* 3. SOCIALS (Tertiary) */}
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <a href="https://github.com/MirrorDNA-Reflection-Protocol" className="py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-zinc-300 hover:text-white text-sm font-medium">
                                <Github size={16} /> Protocol
                            </a>
                            <a href="https://mirrordna-reflection-protocol.github.io/MirrorDNA-Docs/" className="py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-zinc-300 hover:text-white text-sm font-medium">
                                <Book size={16} /> Manifesto
                            </a>
                        </div>
                    </div>

                    {/* FOOTER: LEGALS ONLY */}
                    <div className="pt-8 border-t border-white/5 flex justify-center items-center text-[10px] md:text-xs font-mono text-zinc-600 uppercase tracking-widest w-full">
                        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-center">
                            <Link to="/legal#terms" className="hover:text-zinc-400 transition-colors">Terms and Conditions</Link>
                            <Link to="/legal#privacy" className="hover:text-zinc-400 transition-colors">Privacy Policy</Link>
                        </div>
                    </div>
                </SpotlightCard>
            </main>
        </div>
    );
}
