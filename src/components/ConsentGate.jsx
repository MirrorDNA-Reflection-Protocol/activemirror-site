/**
 * ⟡ CONSENT GATE — Mandatory Session Consent for /mirror
 * Version: 1.1 — Mobile-friendly rewrite
 *
 * CRITICAL: This gate MUST be passed every session.
 * No localStorage persistence. No bypass for returning users.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';
import Logo from './Logo';

const ConsentGate = ({ onConsent }) => {
    const [isHovering, setIsHovering] = useState(false);

    return (
        <div className="min-h-screen min-h-[100dvh] bg-[#020204] text-white overflow-y-auto">
            {/* Background effects - fixed so they don't scroll */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-violet-950/[0.08] via-[#020204] to-[#020204]" />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.15, 0.25, 0.15],
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-500/10 blur-[120px]"
                />
            </div>

            {/* Scrollable content area */}
            <div className="relative z-10 min-h-screen min-h-[100dvh] flex items-center justify-center p-4 py-8">
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="w-full max-w-lg"
                >
                    {/* Card */}
                    <div className="bg-zinc-900/60 backdrop-blur-2xl rounded-3xl border border-white/[0.08] shadow-2xl shadow-black/50">

                        {/* Header */}
                        <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 border-b border-white/[0.05]">
                            <div className="flex items-center gap-3 sm:gap-4 mb-4">
                                <motion.div
                                    animate={{
                                        opacity: [0.8, 1, 0.8],
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    <Logo size={56} theme="violet" />
                                </motion.div>
                                <div>
                                    <h1 className="text-lg sm:text-xl font-medium text-white">Active Mirror</h1>
                                    <p className="text-xs sm:text-sm text-zinc-500">Reflective AI Experience</p>
                                </div>
                            </div>

                            {/* Warning badge */}
                            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 sm:px-4 py-2 sm:py-3">
                                <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
                                <span className="text-amber-200/90 text-xs sm:text-sm font-medium">
                                    Experimental · Use at your own risk
                                </span>
                            </div>
                        </div>

                        {/* Content - no max-height, just flows naturally */}
                        <div className="px-6 sm:px-8 py-4 sm:py-6">
                            <div className="space-y-4 sm:space-y-5 text-sm sm:text-[15px] leading-relaxed">

                                <div>
                                    <h3 className="text-white font-medium mb-1.5 sm:mb-2 flex items-center gap-2 text-sm sm:text-base">
                                        <span className="text-violet-400">△</span> What This Is
                                    </h3>
                                    <p className="text-zinc-400">
                                        Active Mirror is a <strong className="text-zinc-300">reflective AI</strong> — it asks questions to help you think, rather than giving advice.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-white font-medium mb-1.5 sm:mb-2 flex items-center gap-2 text-sm sm:text-base">
                                        <span className="text-violet-400">◈</span> What This Is Not
                                    </h3>
                                    <ul className="text-zinc-400 space-y-1">
                                        <li>• Not a therapist or mental health service</li>
                                        <li>• Not a substitute for professional advice</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-white font-medium mb-1.5 sm:mb-2 flex items-center gap-2 text-sm sm:text-base">
                                        <Shield size={14} className="text-emerald-400" /> MirrorGate Protection
                                    </h3>
                                    <p className="text-zinc-400">
                                        All responses pass through <strong className="text-zinc-300">MirrorGate</strong>, a safety layer that blocks harmful content.
                                    </p>
                                </div>

                                <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 sm:p-4">
                                    <h3 className="text-red-300 font-medium mb-1.5 sm:mb-2 flex items-center gap-2 text-sm">
                                        <AlertTriangle size={14} /> Important
                                    </h3>
                                    <p className="text-red-200/70 text-xs sm:text-sm">
                                        This is <strong>experimental</strong>. By proceeding, you use Active Mirror at your own risk.
                                    </p>
                                </div>

                            </div>
                        </div>

                        {/* Footer with consent button */}
                        <div className="px-6 sm:px-8 py-4 sm:py-6 border-t border-white/[0.05] bg-black/20">
                            <p className="text-zinc-500 text-[10px] sm:text-xs mb-3 sm:mb-4 text-center">
                                By entering, you confirm you have read and understood the above.
                            </p>

                            <motion.button
                                onClick={onConsent}
                                onMouseEnter={() => setIsHovering(true)}
                                onMouseLeave={() => setIsHovering(false)}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 active:from-violet-500 active:to-fuchsia-500 text-white font-medium rounded-2xl flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 shadow-lg shadow-violet-500/20 text-sm sm:text-base"
                            >
                                <span>I Understand — Enter</span>
                                <ArrowRight size={16} />
                            </motion.button>

                            <div className="mt-3 sm:mt-4 flex items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-zinc-600">
                                <a href="/terms" className="hover:text-zinc-400 transition-colors flex items-center gap-1">
                                    Terms <ExternalLink size={8} />
                                </a>
                                <span>·</span>
                                <a href="/privacy" className="hover:text-zinc-400 transition-colors flex items-center gap-1">
                                    Privacy <ExternalLink size={8} />
                                </a>
                                <span>·</span>
                                <a href="/" className="hover:text-zinc-400 transition-colors">
                                    Exit
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Version tag */}
                    <div className="mt-3 sm:mt-4 text-center text-[9px] sm:text-[10px] text-zinc-700 tracking-wide">
                        Active Mirror v15.0 · MirrorGate Protected
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ConsentGate;
