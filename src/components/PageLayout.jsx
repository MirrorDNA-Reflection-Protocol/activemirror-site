/**
 * ⟡ Page Layout — Consistent wrapper for all pages with nav
 */

import React from 'react';
import { Link } from 'react-router-dom';
import Nav from './Nav';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

export default function PageLayout({ children, showNav = true }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className={`min-h-screen transition-colors duration-300 ${
            isDark ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'
        }`}>
            {/* Background */}
            <div className={`fixed inset-0 z-0 ${
                isDark
                    ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black'
                    : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100/50 via-zinc-50 to-zinc-50'
            }`} />

            {/* Nav */}
            {showNav && <Nav />}

            {/* Theme Toggle */}
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            {/* Content */}
            <main className={`relative z-10 ${showNav ? 'pt-16' : ''}`}>
                {children}
            </main>

            {/* Footer */}
            <footer className={`relative z-10 border-t mt-20 ${
                isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-white/50'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {/* Products */}
                        <div>
                            <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Products</h4>
                            <ul className={`space-y-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                <li><Link to="/products/mirrorgate" className="hover:text-purple-500">MirrorGate</Link></li>
                                <li><Link to="/products/mirrorbrain" className="hover:text-purple-500">MirrorBrain</Link></li>
                                <li><Link to="/products/lingos" className="hover:text-purple-500">LingOS</Link></li>
                                <li><Link to="/products/mirrorrecall" className="hover:text-purple-500">MirrorRecall</Link></li>
                            </ul>
                        </div>

                        {/* Use Cases */}
                        <div>
                            <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Use Cases</h4>
                            <ul className={`space-y-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                <li><Link to="/use-cases/individuals" className="hover:text-purple-500">Individuals</Link></li>
                                <li><Link to="/use-cases/teams" className="hover:text-purple-500">Teams</Link></li>
                                <li><Link to="/use-cases/enterprise" className="hover:text-purple-500">Enterprise</Link></li>
                                <li><Link to="/use-cases/government" className="hover:text-purple-500">Government</Link></li>
                            </ul>
                        </div>

                        {/* Resources */}
                        <div>
                            <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Resources</h4>
                            <ul className={`space-y-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                <li><Link to="/docs" className="hover:text-purple-500">Documentation</Link></li>
                                <li><Link to="/about/roadmap" className="hover:text-purple-500">Roadmap</Link></li>
                                <li><a href="https://github.com/MirrorDNA-Reflection-Protocol" className="hover:text-purple-500">GitHub</a></li>
                                <li><Link to="/research" className="hover:text-purple-500">Research</Link></li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Legal</h4>
                            <ul className={`space-y-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                <li><Link to="/terms" className="hover:text-purple-500">Terms of Service</Link></li>
                                <li><Link to="/privacy" className="hover:text-purple-500">Privacy Policy</Link></li>
                                <li><Link to="/trust" className="hover:text-purple-500">Trust Center</Link></li>
                                <li><Link to="/about/contact" className="hover:text-purple-500">Contact</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className={`mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4 ${
                        isDark ? 'border-zinc-800' : 'border-zinc-200'
                    }`}>
                        <div className="flex items-center gap-2">
                            <span className={`text-xl ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>⟡</span>
                            <span className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Active Mirror</span>
                        </div>
                        <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                            © 2025-2026 N1 Intelligence.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
