import React, { useState, useEffect, useRef } from 'react';
import React, { useState, useEffect, useRef } from 'react';
import { CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";
import { ArrowLeft, Send, Fingerprint, Menu, Cloud, Lock, Brain, Download, Check, Wifi, WifiOff, Info, Clock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Mirror Effects CSS
import '../mirror-effects.css';

// Reflection & Vault Integration
import { useVault } from '../hooks/useVault';
import ReflectionPrompt from '../components/ReflectionPrompt';
import ReflectionHistory from '../components/ReflectionHistory';
import SessionCloseControls from '../components/SessionCloseControls';
import SessionReplay from '../components/SessionReplay';

// Capability Detection
import { detectCapabilities, MODEL_TIERS } from '../utils/capabilities';

// Smart Download System
import { checkDownloadConditions, watchDownloadConditions, DOWNLOAD_CONDITIONS } from '../utils/smartDownload';

// MirrorGate v5.0 — Two-Lane Conversation System
import { gateInput, routeIntent, processAndRender } from '../utils/mirrorGate';
import { SUBSTRATE_PROMPT_CLOUD, SUBSTRATE_PROMPT_LOCAL } from '../utils/substratePrompt';

// ═══════════════════════════════════════════════════════════════════════════════
// ⟡ SOVEREIGN MIRROR PWA - PROGRESSIVE INTELLIGENCE ARCHITECTURE
// ═══════════════════════════════════════════════════════════════════════════════

export default function Demo() {
    // ─────────────────────────────────────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────────────────────────────────────
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isReflecting, setIsReflecting] = useState(false);
    const bottomRef = useRef(null);

    // Orchestration State
    const [currentTier, setCurrentTier] = useState('cloud'); // 'cloud' | 'tier1' | 'tier2'
    const [tier1Engine, setTier1Engine] = useState(null);
    const [tier2Engine, setTier2Engine] = useState(null);
    const [tier1Progress, setTier1Progress] = useState(0);
    const [tier2Progress, setTier2Progress] = useState(0);
    const [capabilities, setCapabilities] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSovereign, setIsSovereign] = useState(false);
    const [initComplete, setInitComplete] = useState(false);

    // Vault & Session State
    const { reflections, stats, saveReflection, hasReflectedToday } = useVault();
    const [intent, setIntent] = useState(null);
    const [isHistoryOpen, setHistoryOpen] = useState(false);
    const [showReplay, setShowReplay] = useState(false);
    const [sessionMeta, setSessionMeta] = useState({ timePeriod: 'day', showPrivacyNote: false });
    const [showInfo, setShowInfo] = useState(false); // Hybrid mode info panel

    // Smart Download State
    const [downloadCondition, setDownloadCondition] = useState(null);
    const [showDownloadConsent, setShowDownloadConsent] = useState(false);
    const [downloadPaused, setDownloadPaused] = useState(false);
    const [userDeclinedDownload, setUserDeclinedDownload] = useState(false);

    // MirrorGate v5.0 — Schema tracking for transparency
    const [lastSchema, setLastSchema] = useState(null);
    const [showThinking, setShowThinking] = useState(false);

    // Two-Lane Dial: 0 = More Direct, 1 = More Mirror, 0.5 = Balanced
    const [dial, setDial] = useState(0.5);

    // WebGPU support detection (v0.2 Polish)
    const [hasWebGPU, setHasWebGPU] = useState(true);

    // v7.0 — Session awareness
    const [sessionStart] = useState(() => new Date().toISOString());
    const [showSomaticAnchor, setShowSomaticAnchor] = useState(true);
    const [showExitRitual, setShowExitRitual] = useState(false);
    const [exitReflection, setExitReflection] = useState("");
    const [sessionMeta, setSessionMeta] = useState({ emotional_weight: 5, time_period: 'day' });

    // ─────────────────────────────────────────────────────────────────────────
    // CONFIGURATION
    // ─────────────────────────────────────────────────────────────────────────
    const [groqKey, setGroqKey] = useState(import.meta.env.VITE_GROQ_API_KEY || "");
    const GROQ_MODEL = "llama-3.3-70b-versatile";

    // v4.0 — Substrate prompts (JSON only, no persona)
    // Cloud and Local prompts now imported from substratePrompt.js

    // ─────────────────────────────────────────────────────────────────────────
    // INITIALIZATION - PROGRESSIVE LOADING WITH SMART DOWNLOAD
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        async function init() {
            console.log("⟡ Sovereign Mirror Initializing...");

            // FIRST: Load API key from config.json if not in env
            let apiKey = import.meta.env.VITE_GROQ_API_KEY || "";
            if (!apiKey) {
                try {
                    const cfg = await fetch('/config.json').then(r => r.json());
                    if (cfg.groqKey) {
                        apiKey = cfg.groqKey;
                        setGroqKey(apiKey);
                        console.log("⟡ Loaded API key from config.json");
                    }
                } catch (e) {
                    console.log("⟡ No config.json found");
                }
            }

            // Detect capabilities
            const caps = await detectCapabilities();
            setCapabilities(caps);
            console.log("⟡ Capabilities:", caps);

            // Check WebGPU support (v0.2 Polish)
            const webGPUSupported = !!navigator.gpu;
            setHasWebGPU(webGPUSupported);
            if (!webGPUSupported) {
                console.log("⟡ WebGPU not available — local models disabled, cloud mode enabled");
            }

            // Check download conditions
            const conditions = await checkDownloadConditions();
            setDownloadCondition(conditions);
            console.log("⟡ Download Conditions:", conditions);

            // Check API key
            const hasValidKey = apiKey && apiKey.startsWith("gsk_");
            console.log("⟡ API Key:", hasValidKey ? "Valid" : "Not found");

            // INSTANT START: Mobile and cloud-capable devices start immediately
            // Mobile devices (canRunLocal=false) MUST start in cloud mode instantly
            if (hasValidKey && navigator.onLine) {
                setCurrentTier('cloud');
                setInitComplete(true);
                console.log("⟡ Cloud Mode Ready - Instant Start");
            } else if (!caps.canRunLocal) {
                // Mobile/low-capability: Try cloud anyway, mark init complete
                // This ensures mobile UI isn't stuck on "Initializing..."
                setCurrentTier('cloud');
                setInitComplete(true);
                console.log("⟡ Mobile/Cloud-Only Mode - Instant Start (will fail gracefully if offline)");
            }

            // SMART DOWNLOAD: Check conditions before loading local models
            if (caps.canRunLocal) {
                if (conditions.shouldAutoDownload) {
                    console.log("⟡ Auto-downloading local models:", conditions.reason);
                    loadLocalModels(caps.recommendedTier);
                } else if (conditions.condition === DOWNLOAD_CONDITIONS.METERED) {
                    console.log("⟡ Metered connection - asking user consent");
                    setShowDownloadConsent(true);
                } else if (conditions.condition === DOWNLOAD_CONDITIONS.BATTERY_LOW) {
                    console.log("⟡ Battery low - pausing download");
                    setDownloadPaused(true);
                } else {
                    console.log("⟡ Download conditions not met:", conditions.reason);
                }
            }

            // Watch for condition changes
            watchDownloadConditions((newConditions) => {
                console.log("⟡ Conditions changed:", newConditions);
                setDownloadCondition(newConditions);

                // Auto-resume if conditions improve
                if (newConditions.shouldAutoDownload && downloadPaused && !userDeclinedDownload) {
                    console.log("⟡ Conditions improved - resuming download");
                    setDownloadPaused(false);
                    if (caps.canRunLocal && !tier1Engine) {
                        loadLocalModels(caps.recommendedTier);
                    }
                }

                // Auto-pause if conditions worsen
                if (!newConditions.shouldAutoDownload && !downloadPaused) {
                    if (newConditions.condition === DOWNLOAD_CONDITIONS.BATTERY_LOW) {
                        console.log("⟡ Battery low - pausing download");
                        setDownloadPaused(true);
                    }
                }
            });
        }

        // Online/Offline listeners
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => {
            setIsOnline(false);
            // Auto-switch to local if available
            if (tier2Engine) setCurrentTier('tier2');
            else if (tier1Engine) setCurrentTier('tier1');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        init();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // PROGRESSIVE MODEL LOADING (with idle-time awareness)
    // ─────────────────────────────────────────────────────────────────────────
    async function loadLocalModels(recommendedTier) {
        // Skip if user declined
        if (userDeclinedDownload) {
            console.log("⟡ User declined download - skipping");
            return;
        }

        const worker = new Worker(new URL('../worker.js', import.meta.url), { type: 'module' });

        // TIER 1: Load small model first (fast fallback) - always try this
        try {
            console.log("⟡ Loading Tier 1 (SmolLM2-135M)...");
            const eng1 = await CreateWebWorkerMLCEngine(worker, MODEL_TIERS.tier1.modelId, {
                initProgressCallback: (report) => {
                    if (!downloadPaused) {
                        setTier1Progress(Math.round(report.progress * 100));
                    }
                }
            });
            setTier1Engine(eng1);
            setTier1Progress(100);
            console.log("⟡ Tier 1 Ready");

            // If no cloud, this is now our fallback
            if (!groqKey || !navigator.onLine) {
                setCurrentTier('tier1');
                setInitComplete(true);
            }
        } catch (e) {
            console.error("⟡ Tier 1 Failed:", e.message);
        }

        // TIER 2: Only load if conditions are good and device supports it
        if ((recommendedTier === 'tier2' || recommendedTier === 'cloud') && !downloadPaused) {
            // Re-check conditions before heavy download
            const currentConditions = await checkDownloadConditions();
            if (!currentConditions.shouldAutoDownload && currentConditions.condition !== DOWNLOAD_CONDITIONS.GOOD) {
                console.log("⟡ Conditions degraded - skipping Tier 2 for now");
                return;
            }

            try {
                console.log("⟡ Loading Tier 2 (SmolLM2-1.7B) in background...");
                const worker2 = new Worker(new URL('../worker.js', import.meta.url), { type: 'module' });
                const eng2 = await CreateWebWorkerMLCEngine(worker2, MODEL_TIERS.tier2.modelId, {
                    initProgressCallback: (report) => {
                        if (!downloadPaused) {
                            setTier2Progress(Math.round(report.progress * 100));
                        }
                    }
                });
                setTier2Engine(eng2);
                setTier2Progress(100);
                setIsSovereign(true);
                console.log("⟡ Tier 2 Ready - SOVEREIGN MODE ACHIEVED 🔒");
            } catch (e) {
                console.error("⟡ Tier 2 Failed:", e.message);
            }
        }
    }

    // Handle user consent for metered download
    function handleDownloadConsent(accepted) {
        setShowDownloadConsent(false);
        if (accepted) {
            console.log("⟡ User accepted download on metered connection");
            if (capabilities?.canRunLocal) {
                loadLocalModels(capabilities.recommendedTier);
            }
        } else {
            console.log("⟡ User declined download - staying cloud-only");
            setUserDeclinedDownload(true);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SMART INFERENCE - SELECTS BEST AVAILABLE ENGINE
    // ─────────────────────────────────────────────────────────────────────────
    async function handleSend(overrideText = null) {
        const textToSend = overrideText || input;
        if (!textToSend.trim()) return;

        const userMsg = textToSend;
        if (!overrideText) setInput("");

        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);
        setIsReflecting(true);
        setError(null);

        try {
            // Thoughtful pause
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIsReflecting(false);

            // TRY CLOUD FIRST
            if (currentTier === 'cloud' && groqKey && isOnline) {
                // Pre-inference gate check
                const gateResult = gateInput(userMsg);
                if (!gateResult.allowed) {
                    console.log(`⟡ Input blocked by MirrorGate: ${gateResult.reason}`);
                    setMessages(prev => [...prev, { role: "assistant", content: gateResult.response }]);
                    setIsLoading(false);
                    return;
                }

                // v5.1: Route intent with dial
                const intentConfig = routeIntent(userMsg, dial);
                console.log(`⟡ Intent: ${intentConfig.intentLabel}, Mix: ${Math.round(intentConfig.laneMix.direct * 100)}% Direct`);

                // UTILITY SHORTCUT: computed locally, no model call
                if (intentConfig.shortcut?.handled) {
                    setLastSchema(intentConfig.shortcut.schema);
                    setMessages(prev => [...prev, { role: "assistant", content: intentConfig.shortcut.result }]);
                    setIsLoading(false);
                    return;
                }

                try {
                    // MIRRORGATE OS (v8.0): Conversational with history
                    const PROXY_URL = window.location.hostname === 'localhost' 
                        ? 'http://localhost:8082' 
                        : 'https://proxy.activemirror.ai';
                    
                    const response = await fetch(`${PROXY_URL}/mirror`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            message: userMsg,
                            history: messages.slice(-20),  // Send last 20 messages (10 exchanges)
                            dial: dial
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`MirrorGate OS Error: ${response.status}`);
                    }

                    const data = await response.json();

                    if (data.status === "blocked" || data.status === "rate_limited") {
                        setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
                        setIsLoading(false);
                        return;
                    }

                    // v8.0: Simple response format - just add the content
                    setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
                    setIsLoading(false);
                    return;
                } catch (err) {
                    console.log("⟡ MirrorGate OS failed, trying local:", err.message);
                    // Fall through to local
                }
            }

            // TRY TIER 2 (Full local - sovereign)
            if (tier2Engine) {
                // Pre-inference gate check
                const gateResult = gateInput(userMsg);
                if (!gateResult.allowed) {
                    console.log(`⟡ Input blocked by MirrorGate: ${gateResult.reason}`);
                    setMessages(prev => [...prev, { role: "assistant", content: gateResult.response }]);
                    setIsLoading(false);
                    return;
                }
                const intentConfig = routeIntent(userMsg, dial);
                setCurrentTier('tier2');
                await runLocalInference(tier2Engine, userMsg, intentConfig);
                return;
            }

            // TRY TIER 1 (Mini local)
            if (tier1Engine) {
                // Pre-inference gate check
                const gateResult = gateInput(userMsg);
                if (!gateResult.allowed) {
                    console.log(`⟡ Input blocked by MirrorGate: ${gateResult.reason}`);
                    setMessages(prev => [...prev, { role: "assistant", content: gateResult.response }]);
                    setIsLoading(false);
                    return;
                }
                const intentConfig = routeIntent(userMsg, dial);
                setCurrentTier('tier1');
                await runLocalInference(tier1Engine, userMsg, intentConfig);
                return;
            }

            // STATIC FALLBACK - Always works, no API needed
            console.log("⟡ Using static fallback (no cloud key or local engine)");
            const fallbackConfig = routeIntent(userMsg, dial);
            const { text, schema } = processAndRender(null, fallbackConfig);
            setLastSchema(schema);
            setMessages(prev => [...prev, { role: "assistant", content: text }]);
        } catch (err) {
            console.error("⟡ handleSend error:", err);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "I'm having trouble connecting. What feels most important right now?"
            }]);
        } finally {
            setIsLoading(false);
            setIsReflecting(false);
        }
    }

    async function runLocalInference(engine, userMsg, intentConfig) {
        try {
            // v5.0: Use substrate prompt (JSON only)
            const response = await engine.chat.completions.create({
                messages: [
                    { role: "system", content: SUBSTRATE_PROMPT_LOCAL },
                    { role: "user", content: userMsg }
                ],
                stream: false,
                temperature: 0.3
            });

            const rawOutput = response.choices[0]?.message?.content || "";

            // v5.0: Process through Two-Lane MirrorGate
            const { text, schema } = processAndRender(rawOutput, intentConfig);
            setLastSchema(schema);
            setMessages(prev => [...prev, { role: "assistant", content: text }]);

        } catch (err) {
            console.error("⟡ Local inference error:", err);
            const { text, schema } = processAndRender(null, intentConfig);
            setLastSchema(schema);
            setMessages(prev => [...prev, { role: "assistant", content: text }]);
        } finally {
            setIsLoading(false);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VAULT INTEGRATION
    // ─────────────────────────────────────────────────────────────────────────
    function handleOutcome(outcome) {
        if (intent) {
            saveReflection(intent, messages, outcome, {
                model: currentTier === 'cloud' ? 'Llama-3.3-70B' : 'SmolLM2',
                online: isOnline,
                sovereign: isSovereign,
                id: "local-session"
            });
        }
        setIntent(null);
        setMessages([]);
    }

    function handleIntentSubmit(intentText) {
        setIntent(intentText);
    }

    useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    const tierIcons = {
        'cloud': <Cloud size={14} className="text-blue-400" />,
        'tier1': <Lock size={14} className="text-amber-400" />,
        'tier2': <Brain size={14} className="text-purple-400" />
    };

    const tierLabels = {
        'cloud': 'Cloud',
        'tier1': 'Local',
        'tier2': 'Sovereign'
    };

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden flex flex-col">
            {/* Reflection Prompt */}
            <AnimatePresence>
                {!hasReflectedToday && !intent && initComplete && (
                    <ReflectionPrompt onSubmit={handleIntentSubmit} ready={initComplete} />
                )}
            </AnimatePresence>

            {/* History Drawer */}
            <AnimatePresence>
                {isHistoryOpen && (
                    <ReflectionHistory
                        reflections={reflections}
                        stats={stats}
                        onClose={() => setHistoryOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* ⟡ SESSION REPLAY - Your Journey */}
            <AnimatePresence>
                {showReplay && (
                    <SessionReplay
                        messages={messages}
                        onClose={() => setShowReplay(false)}
                    />
                )}
            </AnimatePresence>

            {/* ⟡ DOWNLOAD CONSENT MODAL - Mobile Data Warning */}
            <AnimatePresence>
                {showDownloadConsent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full"
                        >
                            <div className="text-center space-y-4">
                                <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
                                    <Download className="text-amber-400" size={24} />
                                </div>
                                <h3 className="text-lg font-medium text-white">Enable Offline Mode?</h3>
                                <p className="text-sm text-zinc-400">
                                    Download the local AI model (~40MB) for offline use.
                                    You appear to be on mobile data.
                                </p>
                                <div className="text-xs text-zinc-500 bg-white/5 rounded-lg p-3">
                                    ⟡ Your reflections will work without internet once downloaded
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => handleDownloadConsent(false)}
                                        className="flex-1 py-2 px-4 rounded-lg border border-white/10 text-zinc-400 hover:bg-white/5 transition-colors"
                                    >
                                        Stay Cloud
                                    </button>
                                    <button
                                        onClick={() => handleDownloadConsent(true)}
                                        className="flex-1 py-2 px-4 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors"
                                    >
                                        Download
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ⟡ DOWNLOAD STATUS BANNER - Shows when paused */}
            <AnimatePresence>
                {downloadPaused && !userDeclinedDownload && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-amber-500/10 border-b border-amber-500/20 overflow-hidden"
                    >
                        <div className="px-4 py-2 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-amber-400">
                                <Download size={14} />
                                <span>
                                    {downloadCondition?.condition === DOWNLOAD_CONDITIONS.BATTERY_LOW
                                        ? 'Download paused - battery low'
                                        : 'Download paused - will resume when conditions improve'}
                                </span>
                            </div>
                            <button
                                onClick={() => {
                                    setDownloadPaused(false);
                                    if (capabilities?.canRunLocal && !tier1Engine) {
                                        loadLocalModels(capabilities.recommendedTier);
                                    }
                                }}
                                className="px-2 py-1 text-amber-300 hover:bg-amber-500/20 rounded transition-colors"
                            >
                                Resume Now
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Chat Interface */}
            <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
                            <ArrowLeft size={18} />
                        </Link>

                        {/* ⟡ LOGO / BRAND */}
                        <div className="flex items-center gap-2">
                            <span className="text-purple-400 text-lg">⟡</span>
                            <span className="text-sm font-medium text-white">Active Mirror</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                            {/* Cloud Icon - Glows Blue ONLY when no local available */}
                            <div className={`relative p-2 rounded-lg transition-all duration-300 ${!tier1Engine && !isSovereign
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-white/5 text-zinc-600'
                                }`}>
                                {!tier1Engine && !isSovereign && (
                                    <div className="absolute inset-0 bg-blue-500/30 rounded-lg blur-md animate-pulse"></div>
                                )}
                                <Cloud size={18} className="relative z-10" />
                            </div>

                            {/* Divider with download progress */}
                            <div className="relative w-8 h-0.5 bg-white/10 mx-1">
                                {/* Download progress bar */}
                                {(tier1Progress > 0 && tier1Progress < 100) || (tier2Progress > 0 && tier2Progress < 100) ? (
                                    <div
                                        className="absolute inset-y-0 left-0 bg-purple-500 transition-all duration-300"
                                        style={{ width: `${Math.max(tier1Progress, tier2Progress)}%` }}
                                    ></div>
                                ) : null}
                            </div>

                            {/* Local Icon - Glows Purple when local/sovereign ready */}
                            <div className={`relative p-2 rounded-lg transition-all duration-300 ${isSovereign
                                ? 'bg-purple-500/30 text-purple-400'
                                : tier1Engine
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'bg-white/5 text-zinc-600'
                                }`}>
                                {(tier1Engine || isSovereign) && (
                                    <div className={`absolute inset-0 rounded-lg blur-md animate-pulse ${isSovereign ? 'bg-purple-500/30' : 'bg-amber-500/20'
                                        }`}></div>
                                )}
                                <Brain size={18} className="relative z-10" />
                            </div>

                            {/* Status Label - Shows what's AVAILABLE, not just what's being used */}
                            <div className="ml-2 px-2 py-1 rounded bg-white/5 border border-white/10">
                                <span className={`font-medium ${isSovereign ? 'text-purple-400' :
                                    tier1Engine ? 'text-amber-400' : 'text-blue-400'
                                    }`}>
                                    {isSovereign ? '🔒 Sovereign' :
                                        tier1Engine ? '📱 Local Ready' :
                                            tier1Progress > 0 ? `⬇ ${tier1Progress}%` : '☁️ Cloud'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Info & Menu */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowInfo(!showInfo)}
                            className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
                            title="About Hybrid Mode"
                        >
                            <Info size={16} />
                        </button>
                        <button onClick={() => setHistoryOpen(true)} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
                            <Menu size={18} />
                        </button>
                    </div>
                </div>

                {/* INFO PANEL - Explains Hybrid Architecture */}
                <AnimatePresence>
                    {showInfo && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-b border-white/10 bg-white/[0.02] overflow-hidden"
                        >
                            <div className="p-4 text-xs space-y-3">
                                <div className="font-medium text-purple-400">⟡ How Active Mirror Works</div>
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div className={`p-2 rounded-lg ${currentTier === 'cloud' ? 'bg-blue-500/20 ring-1 ring-blue-500/50' : 'bg-white/5'}`}>
                                        <div className="text-blue-400 mb-1">☁️ Cloud</div>
                                        <div className="text-zinc-500 text-[10px]">Instant response via Groq</div>
                                    </div>
                                    <div className={`p-2 rounded-lg ${currentTier === 'tier1' ? 'bg-amber-500/20 ring-1 ring-amber-500/50' : 'bg-white/5'}`}>
                                        <div className="text-amber-400 mb-1">📱 Local</div>
                                        <div className="text-zinc-500 text-[10px]">On-device AI fallback</div>
                                    </div>
                                    <div className={`p-2 rounded-lg ${isSovereign ? 'bg-purple-500/20 ring-1 ring-purple-500/50' : 'bg-white/5'}`}>
                                        <div className="text-purple-400 mb-1">🔒 Sovereign</div>
                                        <div className="text-zinc-500 text-[10px]">100% offline capable</div>
                                    </div>
                                </div>
                                <div className="text-zinc-600 text-[10px] text-center">
                                    Your data stays private. Local AI downloads in background for offline use.
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* WebGPU Fallback Banner (v0.2 Polish) */}
                {!hasWebGPU && initComplete && (
                    <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-center gap-2 text-xs text-amber-300">
                        <span>⚠️</span>
                        <span>Local AI requires WebGPU. Using cloud mode — your data is still private.</span>
                    </div>
                )}

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 scrollbar-hide">
                    {/* Initial Loading */}
                    {!initComplete && (
                        <div className="h-full flex flex-col items-center justify-center gap-6 px-8 text-center">
                            <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            <div className="text-xs text-zinc-500 font-mono">Initializing Sovereign Mirror...</div>
                        </div>
                    )}

                    {/* Ready State — with Somatic Anchor */}
                    {initComplete && messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center gap-6">
                            {showSomaticAnchor ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="somatic-anchor max-w-md"
                                >
                                    <div className="glyph-breathing text-purple-400 text-3xl mb-6">⟡</div>
                                    <div className="somatic-anchor-step">Put your feet flat on the floor.</div>
                                    <div className="somatic-anchor-step">Take one breath.</div>
                                    <div className="somatic-anchor-step">Notice where you're holding tension.</div>
                                    <button 
                                        onClick={() => setShowSomaticAnchor(false)}
                                        className="somatic-anchor-ready mt-6 px-6 py-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-full transition-colors"
                                    >
                                        I'm ready
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center"
                                >
                                    <Fingerprint size={48} strokeWidth={1} className="text-purple-500 mx-auto mb-4" />
                                    <p className="text-sm font-mono tracking-widest uppercase text-purple-500/70">Mirror is Clear</p>
                                    {sessionMeta.time_period === 'late_night' && (
                                        <div className="time-badge mt-4 mx-auto">
                                            <Clock size={12} />
                                            <span>Late night session</span>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    )}

                    {/* Messages */}
                    {messages.map((msg, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] px-6 py-4 rounded-2xl backdrop-blur-md shadow-sm ${msg.role === 'user' ? 'bg-white rounded-tr-sm' : 'bg-white/15 border border-white/25 rounded-tl-sm'}`}>
                                <div className={`text-[16px] leading-7 whitespace-pre-wrap mirror-response ${msg.role === 'user' ? 'text-black font-medium' : 'text-white font-normal'}`}>
                                    {msg.role === 'assistant' ? (
                                        // Render glyphs with breathing animation
                                        msg.content.split('⟡').map((part, idx) => (
                                            <React.Fragment key={idx}>
                                                {idx > 0 && <span className="glyph glyph-breathe">⟡</span>}
                                                {part}
                                            </React.Fragment>
                                        ))
                                    ) : msg.content}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Reflecting Indicator */}
                    {isReflecting && (
                        <div className="flex justify-start">
                            <div className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 rounded-tl-sm">
                                <div className="flex items-center gap-3 text-zinc-400">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                    <span className="text-xs font-mono uppercase tracking-widest">Reflecting...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Session Controls */}
                    {initComplete && messages.length > 1 && !isLoading && !hasReflectedToday && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <SessionCloseControls onOutcome={handleOutcome} />
                        </div>
                    )}

                    {/* ⟡ Session Replay Button - Shows after 5+ exchanges */}
                    {messages.length >= 6 && !isLoading && (
                        <div className="flex justify-center mt-4">
                            <button
                                onClick={() => setShowReplay(true)}
                                className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 transition-colors px-4 py-2 rounded-full bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20"
                            >
                                <Sparkles size={14} />
                                See your journey
                            </button>
                        </div>
                    )}

                    {/* Show Thinking Toggle - v4.0 Transparency Feature */}
                    {lastSchema && messages.length > 0 && (
                        <div className="flex flex-col items-center gap-2 mt-4">
                            <button
                                onClick={() => setShowThinking(!showThinking)}
                                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-3 py-1 rounded-full bg-white/5 hover:bg-white/10"
                            >
                                {showThinking ? "Hide thinking ↑" : "Show thinking ↓"}
                            </button>

                            {showThinking && (
                                <div className="w-full max-w-xl p-4 bg-zinc-900/70 rounded-lg border border-zinc-700/50 backdrop-blur-sm">
                                    <div className="text-xs text-zinc-500 mb-2 font-mono">
                                        ⟡ Raw Schema (what the model produced)
                                    </div>
                                    <pre className="text-xs text-zinc-400 overflow-x-auto whitespace-pre-wrap">
                                        {JSON.stringify(lastSchema, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="text-center text-red-400 text-sm py-2">{error}</div>
                    )}

                    <div ref={bottomRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex gap-3 items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                            placeholder={initComplete ? "Share what's on your mind..." : "Initializing..."}
                            disabled={!initComplete || isLoading}
                            className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 disabled:opacity-50"
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!initComplete || isLoading || !input.trim()}
                            className="p-3 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 disabled:opacity-50 rounded-full transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </div>

                    {/* Two-Lane Dial */}
                    <div className="mt-3 flex items-center justify-center gap-3 text-xs text-zinc-500">
                        <span className={dial < 0.4 ? 'text-blue-400' : ''}>Direct</span>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={dial}
                            onChange={(e) => setDial(parseFloat(e.target.value))}
                            className="w-24 h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                        />
                        <span className={dial > 0.6 ? 'text-purple-400' : ''}>Mirror</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
