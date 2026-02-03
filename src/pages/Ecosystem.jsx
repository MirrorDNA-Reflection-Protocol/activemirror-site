/**
 * ⟡ Ecosystem Page — Stunning Visual Architecture
 * Interactive visualization of the MirrorDNA sovereign AI ecosystem
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, Github, BookOpen, Zap, ArrowRight, Globe, Server, Activity } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import EcosystemVisual from '../components/EcosystemVisual';
import { useTheme } from '../contexts/ThemeContext';

const liveEndpoints = [
    {
        name: 'activemirror.ai',
        description: 'Main experience hub',
        status: 'live',
        url: 'https://activemirror.ai'
    },
    {
        name: 'id.activemirror.ai',
        description: 'Mirror Seed identity protocol',
        status: 'live',
        url: 'https://id.activemirror.ai'
    },
    {
        name: 'brain.activemirror.ai',
        description: 'MirrorBrain cognitive API',
        status: 'live',
        url: 'https://brain.activemirror.ai/health'
    },
    {
        name: 'docs.activemirror.ai',
        description: 'Protocol documentation',
        status: 'live',
        url: 'https://mirrordna-reflection-protocol.github.io/MirrorDNA-Docs/'
    }
];

const stats = [
    { label: 'Open Source Repos', value: '95+' },
    { label: 'Protocol Version', value: 'v15.3' },
    { label: 'Architectural Layers', value: '9' },
    { label: 'Live Endpoints', value: '4' }
];

export default function Ecosystem() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <PageLayout>
            {/* Hero */}
            <section className="relative py-20 px-4 sm:px-6 overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl ${
                        isDark ? 'bg-purple-500/10' : 'bg-purple-200/30'
                    }`} />
                    <div className={`absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl ${
                        isDark ? 'bg-cyan-500/10' : 'bg-cyan-200/30'
                    }`} />
                </div>

                <div className="relative max-w-6xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 mb-6"
                    >
                        <Activity size={16} className="text-purple-400" />
                        <span className="text-sm font-medium bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                            Sovereign AI Architecture
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 ${isDark ? 'text-white' : 'text-zinc-900'}`}
                    >
                        The MirrorDNA
                        <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                            Ecosystem
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className={`text-lg sm:text-xl max-w-2xl mx-auto mb-12 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
                    >
                        A complete sovereign AI stack — from cognitive interfaces to trust infrastructure.
                        Open source. Self-hostable. Owned by you.
                    </motion.p>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto mb-16"
                    >
                        {stats.map((stat, i) => (
                            <div
                                key={stat.label}
                                className={`p-4 rounded-xl ${
                                    isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-zinc-200'
                                }`}
                            >
                                <div className={`text-2xl sm:text-3xl font-bold mb-1 ${
                                    isDark ? 'text-white' : 'text-zinc-900'
                                }`}>
                                    {stat.value}
                                </div>
                                <div className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Main Visual */}
            <section className="py-12 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    <EcosystemVisual />
                </div>
            </section>

            {/* Live Endpoints */}
            <section className={`py-16 px-4 sm:px-6 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <Server size={24} className="text-green-500" />
                        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                            Live Endpoints
                        </h2>
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs text-green-500 font-medium">All Systems Operational</span>
                        </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {liveEndpoints.map((endpoint, i) => (
                            <motion.a
                                key={endpoint.name}
                                href={endpoint.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`group p-5 rounded-xl border transition-all hover:scale-[1.02] ${
                                    isDark
                                        ? 'bg-zinc-900/50 border-white/10 hover:border-green-500/30'
                                        : 'bg-white border-zinc-200 hover:border-green-300 hover:shadow-lg'
                                }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500" />
                                        <span className={`font-mono text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                            {endpoint.name}
                                        </span>
                                    </div>
                                    <ExternalLink size={14} className={`${isDark ? 'text-zinc-500' : 'text-zinc-400'} group-hover:text-green-500 transition-colors`} />
                                </div>
                                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                    {endpoint.description}
                                </p>
                            </motion.a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Products Grid */}
            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Explore the Stack
                    </h2>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { name: 'MirrorGate', desc: 'Inference control plane', href: '/products/mirrorgate', color: 'purple' },
                            { name: 'MirrorBrain', desc: 'Cognitive engine API', href: '/products/mirrorbrain', color: 'blue' },
                            { name: 'LingOS', desc: 'Conversational framework', href: '/products/lingos', color: 'cyan' },
                            { name: 'MirrorRecall', desc: 'Session memory layer', href: '/products/mirrorrecall', color: 'pink' },
                            { name: 'GlyphTrail', desc: 'Trace visualization', href: '/products/glyphtrail', color: 'amber' },
                            { name: 'TrustByDesign', desc: 'Compliance framework', href: '/products/trustbydesign', color: 'green' },
                            { name: 'AgentDNA', desc: 'Persona engine', href: '/products/agentdna', color: 'violet' },
                            { name: 'Vault', desc: 'Secure storage', href: '/products/vault', color: 'rose' },
                            { name: 'Mirror Seed', desc: 'Identity protocol', href: 'https://id.activemirror.ai', color: 'emerald', external: true },
                        ].map((product) => (
                            <Link
                                key={product.name}
                                to={product.external ? product.href : product.href}
                                {...(product.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                className={`group p-4 rounded-xl border transition-all hover:scale-[1.02] ${
                                    isDark
                                        ? 'bg-white/5 border-white/10 hover:border-purple-500/30'
                                        : 'bg-white border-zinc-200 hover:border-purple-300 hover:shadow-md'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                            {product.name}
                                        </h3>
                                        <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                            {product.desc}
                                        </p>
                                    </div>
                                    {product.external ? (
                                        <ExternalLink size={16} className="text-zinc-400 group-hover:text-purple-400 transition-colors" />
                                    ) : (
                                        <ArrowRight size={16} className="text-zinc-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-4 sm:px-6">
                <div className={`max-w-3xl mx-auto text-center p-8 sm:p-12 rounded-3xl ${
                    isDark
                        ? 'bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20'
                        : 'bg-gradient-to-br from-purple-50 to-cyan-50 border border-purple-200'
                }`}>
                    <h2 className={`text-2xl sm:text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Ready to build with sovereign AI?
                    </h2>
                    <p className={`mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Explore the documentation, clone a repo, or start reflecting.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href="https://github.com/MirrorDNA-Reflection-Protocol"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
                        >
                            <Github size={18} />
                            View on GitHub
                        </a>
                        <Link
                            to="/docs"
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                                isDark
                                    ? 'bg-white/10 hover:bg-white/20 text-white'
                                    : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-900'
                            }`}
                        >
                            <BookOpen size={18} />
                            Read Docs
                        </Link>
                        <Link
                            to="/start"
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                                isDark
                                    ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30'
                                    : 'bg-cyan-100 hover:bg-cyan-200 text-cyan-700 border border-cyan-200'
                            }`}
                        >
                            <Zap size={18} />
                            Get Started
                        </Link>
                    </div>
                </div>
            </section>
        </PageLayout>
    );
}
