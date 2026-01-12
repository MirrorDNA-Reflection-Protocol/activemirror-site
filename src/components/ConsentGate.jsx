/**
 * ⟡ CONSENT GATE — Mandatory Session Consent for /mirror
 * Version: 1.0
 * 
 * CRITICAL: This gate MUST be passed every session.
 * No localStorage persistence. No bypass for returning users.
 * 
 * Disclosure: Experimental, use at own risk, reflective AI.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';

const ConsentGate = ({ onConsent }) => {
    const [isHovering, setIsHovering] = useState(false);
    const [hasScrolled, setHasScrolled] = useState(false);

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollTop + clientHeight >= scrollHeight - 50) {
            setHasScrolled(true);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 bg-[#020204] text-white flex items-center justify-center overflow-hidden"
        >
            {/* Background effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-violet-950/[0.08] via-[#020204] to-[#020204]" />
                <motion.div
                    animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.15, 0.25, 0.15],
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-500/10 blur-[120px]"
                />
                {/* Noise */}
                <div 
                    className="absolute inset-0 opacity-[0.015]" 
                    style={{ 
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` 
                    }} 
                />
            </div>

            {/* Main container */}
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="relative z-10 w-full max-w-lg mx-4"
            >
                {/* Card */}
                <div className="bg-zinc-900/60 backdrop-blur-2xl rounded-3xl border border-white/[0.08] shadow-2xl shadow-black/50 overflow-hidden">
                    
                    {/* Header */}
                    <div className="px-8 pt-8 pb-6 border-b border-white/[0.05]">
                        <div className="flex items-center gap-4 mb-4">
                            <motion.div
                                animate={{ 
                                    scale: [1, 1.1, 1],
                                    opacity: [0.7, 1, 0.7],
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="text-4xl"
                                style={{ 
                                    color: 'rgba(139, 92, 246, 0.9)',
                                    textShadow: '0 0 30px rgba(139, 92, 246, 0.5)' 
                                }}
                            >
                                ⟡
                            </motion.div>
                            <div>
                                <h1 className="text-xl font-medium text-white">Active Mirror</h1>
                                <p className="text-sm text-zinc-500">Reflective AI Experience</p>
                            </div>
                        </div>
                        
                        {/* Warning badge */}
                        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                            <AlertTriangle size={18} className="text-amber-400 flex-shrink-0" />
                            <span className="text-amber-200/90 text-sm font-medium">
                                Experimental · Use at your own risk
                            </span>
                        </div>
                    </div>

                    {/* Scrollable content */}
                    <div 
                        className="px-8 py-6 max-h-[45vh] overflow-y-auto scrollbar-hide"
                        onScroll={handleScroll}
                    >
                        <div className="space-y-5 text-[15px] leading-relaxed">
                            
                            <div>
                                <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                                    <span className="text-violet-400">△</span> What This Is
                                </h3>
                                <p className="text-zinc-400">
                                    Active Mirror is a <strong className="text-zinc-300">reflective AI</strong> — it asks questions to help you think, rather than giving advice or answers. It mirrors your thoughts back to you.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                                    <span className="text-violet-400">◈</span> What This Is Not
                                </h3>
                                <ul className="text-zinc-400 space-y-1.5">
                                    <li>• Not a therapist or mental health service</li>
                                    <li>• Not a substitute for professional advice</li>
                                    <li>• Not a source of medical, legal, or financial guidance</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                                    <Shield size={14} className="text-emerald-400" /> MirrorGate Protection
                                </h3>
                                <p className="text-zinc-400">
                                    All responses pass through <strong className="text-zinc-300">MirrorGate</strong>, a safety layer that blocks harmful content, enforces reflective-only responses, and prevents the AI from giving direct advice.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                                    <span className="text-violet-400">⧉</span> Privacy
                                </h3>
                                <p className="text-zinc-400">
                                    Conversations are processed to generate responses but are not stored long-term or used to train models. See our <a href="/privacy" className="text-violet-400 hover:text-violet-300 underline underline-offset-2">Privacy Policy</a> for details.
                                </p>
                            </div>

                            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                                <h3 className="text-red-300 font-medium mb-2 flex items-center gap-2">
                                    <AlertTriangle size={14} /> Important
                                </h3>
                                <p className="text-red-200/70 text-sm">
                                    This is an <strong>experimental project</strong>. By proceeding, you acknowledge that you use Active Mirror entirely at your own risk. The creators accept no liability for any outcomes arising from its use.
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* Footer with consent button */}
                    <div className="px-8 py-6 border-t border-white/[0.05] bg-black/20">
                        <p className="text-zinc-500 text-xs mb-4 text-center">
                            By entering, you confirm you have read and understood the above.
                        </p>
                        
                        <motion.button
                            onClick={onConsent}
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4 px-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
                        >
                            <span>I Understand — Enter the Mirror</span>
                            <motion.div
                                animate={{ x: isHovering ? 4 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ArrowRight size={18} />
                            </motion.div>
                        </motion.button>

                        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-zinc-600">
                            <a href="/terms" className="hover:text-zinc-400 transition-colors flex items-center gap-1">
                                Terms <ExternalLink size={10} />
                            </a>
                            <span>·</span>
                            <a href="/privacy" className="hover:text-zinc-400 transition-colors flex items-center gap-1">
                                Privacy <ExternalLink size={10} />
                            </a>
                            <span>·</span>
                            <a href="/" className="hover:text-zinc-400 transition-colors">
                                Exit
                            </a>
                        </div>
                    </div>
                </div>

                {/* Version tag */}
                <div className="mt-4 text-center text-[10px] text-zinc-700 tracking-wide">
                    Active Mirror v15.0 · MirrorGate Protected · N1 Intelligence
                </div>
            </motion.div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </motion.div>
    );
};

export default ConsentGate;
