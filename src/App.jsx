import React, { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import { Terminal, Shield, Cpu, Activity, Database, Brain, Lock, Network, ArrowRight } from 'lucide-react';
import SpotlightCard from './components/SpotlightCard';

export default function App() {
    useEffect(() => {
        const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
        function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
    }, []);

    return (
        <div className="min-h-screen bg-black bg-noise text-white selection:bg-green-500/30">
            {/* The Dynamic Island Status */}
            <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
                <div className="flex items-center gap-3 px-5 py-2 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl pointer-events-auto">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-slow"></div>
                    <span className="text-xs font-medium tracking-wide text-zinc-300">ACTIVE MIRROR OS</span>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 pt-40 pb-20">
                {/* HERO SECTION */}
                <div className="text-center mb-32">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
                        <span className="text-green-500">⟡</span>
                        <span className="text-sm text-zinc-300">Open Source · MIT Licensed · Local-First</span>
                    </div>
                    <h1 className="text-7xl md:text-8xl font-bold tracking-tighter mb-8 bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent">
                        Your AI. <br /> Your Hardware. <br /> Your Rules.
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
                        Sovereign AI infrastructure for builders who want control. <br />
                        Start with your identity kernel — runs on your hardware, works with major models.
                    </p>
                    <div className="flex justify-center gap-4">
                        <a href="https://id.activemirror.ai" className="group relative px-8 py-4 bg-white text-black rounded-full font-bold hover:scale-105 transition-all flex items-center gap-2">
                            Start Free <ArrowRight size={18} />
                        </a>
                        <a href="https://mirrordna-reflection-protocol.github.io/MirrorDNA-Docs/" className="px-8 py-4 bg-white/10 text-white rounded-full font-medium hover:bg-white/20 transition-all backdrop-blur-sm border border-white/10">
                            Read Docs
                        </a>
                    </div>
                </div>

                {/* THE BENTO GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">

                    {/* Card 1: Persistent Identity (Brain) */}
                    <SpotlightCard className="col-span-1 md:col-span-2">
                        <div className="h-full flex flex-col justify-between">
                            <Brain className="text-white/80" size={32} />
                            <div>
                                <h3 className="text-3xl font-medium tracking-tight mb-2">Persistent Identity</h3>
                                <p className="text-zinc-400 max-w-md">Your AI remembers who you are, what you're building, and how you think. Portable across Claude, GPT, and local models.</p>
                            </div>
                        </div>
                    </SpotlightCard>

                    {/* Card 2: Truth-State Enforcement (Status) */}
                    <SpotlightCard className="bg-zinc-900/80">
                        <div className="flex items-center gap-4 mb-8">
                            <Activity className="text-green-500" />
                            <span className="font-mono text-sm text-green-500">TRUTH STATE: VERIFIED</span>
                        </div>
                        <div className="space-y-3 font-mono text-sm text-zinc-500">
                            <p>&gt; claim_classification: <span className="text-green-400">FACT</span></p>
                            <p>&gt; hallucination_check: <span className="text-green-400">PASSED</span></p>
                            <p>&gt; source_integrity: <span className="text-green-400">100%</span></p>
                        </div>
                    </SpotlightCard>

                    {/* Card 3: Vault Memory (Database/Lock) */}
                    <SpotlightCard>
                        <Lock className="mb-4 text-zinc-400" size={32} />
                        <h3 className="text-xl font-medium mb-2">Vault Memory</h3>
                        <p className="text-sm text-zinc-500 mb-6">Data stays local. Explicit read/write boundaries.</p>
                        <div className="text-xs font-mono text-zinc-600 border-t border-white/5 pt-4">
                            ~/.mirror/vault/memory.json
                        </div>
                    </SpotlightCard>

                    {/* Card 4: Orchestration (Network) */}
                    <SpotlightCard className="col-span-1 md:col-span-2">
                        <Network className="mb-4 text-zinc-400" size={32} />
                        <h3 className="text-2xl font-medium mb-2">Multi-Model Orchestration</h3>
                        <p className="text-zinc-400 mb-6">Route reasoning to Claude, creativity to GPT-4, and private tasks to Llama running on your M4.</p>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-zinc-400 border border-white/5">Claude 3.5</span>
                            <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-zinc-400 border border-white/5">GPT-4o</span>
                            <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs border border-green-500/20">Llama 3.2 (Local)</span>
                        </div>
                    </SpotlightCard>

                    {/* Card 5: Research */}
                    <SpotlightCard>
                        <Shield className="mb-4 text-zinc-400" size={32} />
                        <h3 className="text-xl font-medium mb-2">Peer Reviewed</h3>
                        <p className="text-sm text-zinc-500 mb-6">3 publications. DOI 10.5281/zenodo.17787619</p>
                        <a href="https://github.com/MirrorDNA-Reflection-Protocol" className="text-sm underline decoration-zinc-700 underline-offset-4 hover:text-white transition-colors">Access Archives →</a>
                    </SpotlightCard>

                    {/* Card 6: Getting Started */}
                    <SpotlightCard className="col-span-1 md:col-span-3 bg-gradient-to-r from-zinc-900 to-black">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 h-full">
                            <div>
                                <h3 className="text-2xl font-medium mb-2">Start With Your Kernel</h3>
                                <p className="text-zinc-400">Download the identity JSON. Use it everywhere.</p>
                            </div>
                            <div className="flex gap-4">
                                <a href="https://id.activemirror.ai" className="px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-colors">
                                    Launch Generator
                                </a>
                                <a href="/demo/" className="px-6 py-3 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-colors border border-white/10">
                                    Try Demo
                                </a>
                            </div>
                        </div>
                    </SpotlightCard>

                </div>
            </main>
        </div>
    );
}
