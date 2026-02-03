/**
 * ⟡ About Page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Info, ArrowRight, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import { useTheme } from '../../contexts/ThemeContext';

export default function AboutPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <PageLayout>
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-purple-500/20">
                            <Info size={32} className="text-purple-400" />
                        </div>
                    </div>
                    <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        About Active Mirror
                    </h1>
                    <p className={`text-xl sm:text-2xl font-medium mb-6 text-purple-400`}>
                        The shift from prediction to reflection.
                    </p>
                </div>
            </section>

            <section className="py-12 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className={`prose prose-lg ${isDark ? 'prose-invert' : ''} max-w-none`}>
                        <p className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>
                            Every conversation you've ever had with ChatGPT, Claude, or any other AI ends the same way: the moment you close the window, it forgets you existed. The next time you return, you're a stranger.
                        </p>
                        <p className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>
                            This isn't a bug. It's the architecture. Modern AI is built on <em>prediction</em> — stateless systems trained to generate the next token with no memory, no continuity, no identity.
                        </p>
                        <p className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>
                            In early 2025, we began building something different: <strong>AI systems that don't just predict — they reflect.</strong> Systems that remember who they are. Systems that remember who <em>you</em> are. Systems that maintain continuity across sessions, devices, and contexts.
                        </p>
                        <p className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>
                            That work became <strong>MirrorDNA</strong> and <strong>Active MirrorOS</strong> — the first production implementations of what we call <strong>Reflective AI</strong>: identity-bound, continuity-governed intelligence built to anchor itself to stable truth rather than drift into statistical noise.
                        </p>
                    </div>
                </div>
            </section>

            <section className={`py-16 px-4 sm:px-6 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>By the Numbers</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>95</div>
                            <div className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Repositories</div>
                        </div>
                        <div className="text-center">
                            <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>9</div>
                            <div className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Architecture Layers</div>
                        </div>
                        <div className="text-center">
                            <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>10</div>
                            <div className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Months Built</div>
                        </div>
                        <div className="text-center">
                            <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>v15.3</div>
                            <div className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Master Citation</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Connect</h2>
                    <div className="flex flex-wrap gap-4">
                        <a href="https://github.com/MirrorDNA-Reflection-Protocol" target="_blank" rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'}`}>
                            <Github size={18} /> GitHub
                        </a>
                        <a href="https://x.com/pauldesai123" target="_blank" rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'}`}>
                            <Twitter size={18} /> Twitter
                        </a>
                        <a href="https://www.linkedin.com/in/pauldesai/" target="_blank" rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'}`}>
                            <Linkedin size={18} /> LinkedIn
                        </a>
                        <Link to="/about/contact"
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'}`}>
                            <Mail size={18} /> Contact
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <Link to="/about/roadmap" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-purple-600 hover:bg-purple-500 text-white">
                        See What's Coming <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </PageLayout>
    );
}
