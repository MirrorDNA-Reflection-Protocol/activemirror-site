import React from 'react';
import { ArrowLeft, Shield, CheckCircle, AlertTriangle, XCircle, Lock, RefreshCw, Eye, Hash } from 'lucide-react';

/**
 * Trust Page - Explains the dual-node verification architecture
 * Part of SC1 Canaryd Phase 1 implementation
 */
const Trust = () => {
    const lastUpdated = "January 17, 2026";

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-3xl mx-auto px-6 py-12">
                {/* Header */}
                <header className="mb-12">
                    <a href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8">
                        <ArrowLeft size={18} />
                        <span>Back to Active Mirror</span>
                    </a>
                    <h1 className="text-4xl font-bold mb-4">How We Verify Every Response</h1>
                    <p className="text-zinc-500">Last updated: {lastUpdated}</p>
                </header>

                {/* TL;DR */}
                <section className="mb-12 p-6 rounded-xl bg-green-500/10 border border-green-500/20">
                    <h2 className="text-xl font-semibold text-green-400 mb-4 flex items-center gap-2">
                        <Shield size={20} />
                        TL;DR — Trust by Verification
                    </h2>
                    <ul className="space-y-2 text-zinc-300">
                        <li>• Every AI response is independently verified by a <strong>second node</strong>.</li>
                        <li>• Verification checks policy compliance, forbidden patterns, and structural integrity.</li>
                        <li>• You see "Verified ⟡" only when a response passes all checks.</li>
                        <li>• No confidence scores. No "trust us." Only verifiable process integrity.</li>
                    </ul>
                </section>

                {/* The Problem */}
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                        <AlertTriangle size={24} className="text-amber-400" />
                        The Problem with AI Today
                    </h2>
                    <p className="text-zinc-400 leading-relaxed mb-4">
                        Most AI systems ask you to trust their outputs blindly. They show you
                        "confidence percentages" that mean nothing. They claim to be "safe" but
                        provide no verifiable proof.
                    </p>
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-red-400 font-medium">The hidden truth:</p>
                        <ul className="text-zinc-400 mt-2 space-y-1">
                            <li>• "95% confident" doesn't mean 95% correct</li>
                            <li>• Safety filters can be bypassed without you knowing</li>
                            <li>• There's no audit trail for what actually happened</li>
                        </ul>
                    </div>
                </section>

                {/* Our Solution */}
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                        <CheckCircle size={24} className="text-green-400" />
                        Our Solution: Dual-Node Verification
                    </h2>

                    {/* Architecture Diagram */}
                    <div className="mb-8 p-6 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center">
                            <div className="p-4 rounded-lg bg-violet-500/20 border border-violet-500/30">
                                <div className="text-violet-400 font-mono text-sm mb-2">Node A (M4)</div>
                                <div className="text-white font-semibold">Interactive Brain</div>
                                <div className="text-zinc-500 text-sm mt-1">Generates Response</div>
                            </div>

                            <div className="flex flex-col items-center">
                                <RefreshCw size={24} className="text-zinc-500 mb-2" />
                                <div className="text-zinc-500 text-xs">Response Package</div>
                            </div>

                            <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/30">
                                <div className="text-green-400 font-mono text-sm mb-2">Node B (M1)</div>
                                <div className="text-white font-semibold">Canary Verifier</div>
                                <div className="text-zinc-500 text-sm mt-1">Independent Verification</div>
                            </div>

                            <div className="flex flex-col items-center">
                                <CheckCircle size={24} className="text-green-400" />
                                <div className="text-green-400 text-xs font-semibold">Verified ⟡</div>
                            </div>
                        </div>
                    </div>

                    <p className="text-zinc-400 leading-relaxed">
                        Every response from Active Mirror:
                    </p>
                    <ol className="mt-4 space-y-3 text-zinc-400">
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-sm flex items-center justify-center">1</span>
                            <span>Passes through <strong>MirrorGate</strong> policy enforcement on Node A</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-sm flex items-center justify-center">2</span>
                            <span>Is packaged with cryptographic metadata (hashes, timestamps, signatures)</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-sm flex items-center justify-center">3</span>
                            <span>Is sent to <strong>Node B</strong> for independent verification</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-sm flex items-center justify-center">4</span>
                            <span>Returns with a <strong>tamper-evident verification signature</strong></span>
                        </li>
                    </ol>
                </section>

                {/* What Verified Means */}
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                        <Eye size={24} className="text-violet-400" />
                        What "Verified" Actually Means
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-white/5">
                            <div className="flex items-center gap-2 text-green-400 font-medium mb-3">
                                <CheckCircle size={18} />
                                Verified ⟡
                            </div>
                            <ul className="text-zinc-400 space-y-2 text-sm">
                                <li>✓ Response passed all safety gates</li>
                                <li>✓ Policy version is known and approved</li>
                                <li>✓ Output contains no forbidden patterns</li>
                                <li>✓ Verification signed by independent node</li>
                                <li>✓ Structural integrity confirmed</li>
                            </ul>
                        </div>

                        <div className="p-4 rounded-lg bg-white/5">
                            <div className="flex items-center gap-2 text-red-400 font-medium mb-3">
                                <XCircle size={18} />
                                Rejected
                            </div>
                            <ul className="text-zinc-400 space-y-2 text-sm">
                                <li>✗ Contains forbidden AI patterns</li>
                                <li>✗ Unknown or unapproved policy bundle</li>
                                <li>✗ Signature verification failed</li>
                                <li>✗ Structural integrity compromised</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* What We Don't Do */}
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-4">What We Don't Do</h2>
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                        <ul className="text-zinc-400 space-y-2">
                            <li className="flex items-center gap-2">
                                <XCircle size={16} className="text-red-400" />
                                <span>No "confidence scores" (meaningless theater)</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <XCircle size={16} className="text-red-400" />
                                <span>No "trust us" promises (trust is earned)</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <XCircle size={16} className="text-red-400" />
                                <span>No hidden filtering (all checks are documented)</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <XCircle size={16} className="text-red-400" />
                                <span>No security theater (real verification or nothing)</span>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Technical Details */}
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                        <Lock size={24} className="text-violet-400" />
                        Technical Details
                    </h2>

                    <div className="space-y-4 text-zinc-400">
                        <div>
                            <h3 className="text-lg font-medium text-zinc-200 mb-2">Response Package</h3>
                            <p className="text-sm leading-relaxed">
                                Each response is wrapped in a signed package containing: request ID,
                                timestamps, input/output hashes, policy bundle hash, gate results,
                                and an ed25519 signature from the generating node.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium text-zinc-200 mb-2">Verification Process</h3>
                            <ul className="text-sm space-y-1">
                                <li>• <strong>Step 1:</strong> Envelope checks (request ID, timestamp sanity, signature)</li>
                                <li>• <strong>Step 2:</strong> Policy integrity (bundle hash in allowlist)</li>
                                <li>• <strong>Step 3:</strong> Output compliance (forbidden patterns, intent constraints)</li>
                                <li>• <strong>Step 4:</strong> Verdict determination + independent signature</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium text-zinc-200 mb-2">Cryptography</h3>
                            <p className="text-sm leading-relaxed">
                                Ed25519 for signatures, SHA-256 for hashes. Keys are rotated monthly.
                                Each node has its own keypair, enabling cross-verification.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Coming Soon */}
                <section className="mb-12 p-6 rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <h2 className="text-xl font-semibold text-violet-400 mb-4 flex items-center gap-2">
                        <Hash size={20} />
                        Coming Soon: Public Verification Roots
                    </h2>
                    <p className="text-zinc-400">
                        Soon, we'll publish daily Merkle roots of all verification events —
                        a tamper-evident audit trail that anyone can verify. Not blockchain hype,
                        just cryptographic honesty.
                    </p>
                </section>

                {/* Learn More */}
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-4">Learn More</h2>
                    <div className="flex flex-wrap gap-4">
                        <a href="/privacy" className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            Privacy Policy
                        </a>
                        <a href="/terms" className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            Terms of Service
                        </a>
                    </div>
                </section>

                {/* Footer */}
                <footer className="mt-16 pt-8 border-t border-white/10 text-center text-zinc-600 text-sm">
                    <p>⟡ Active Mirror · N1 Intelligence</p>
                    <p className="mt-2">Trust by Verification · Privacy by Default · Sovereignty by Choice</p>
                </footer>
            </div>
        </div>
    );
};

export default Trust;
