import React, { useState, useEffect, useRef } from 'react';
import { CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";
import { ArrowLeft, Send, Fingerprint, Menu, Cloud, Lock, Brain, Download, Check, Wifi, WifiOff, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Reflection & Vault Integration
import { useVault } from '../hooks/useVault';
import ReflectionPrompt from '../components/ReflectionPrompt';
import ReflectionHistory from '../components/ReflectionHistory';
import SessionCloseControls from '../components/SessionCloseControls';

// Capability Detection
import { detectCapabilities, MODEL_TIERS } from '../utils/capabilities';

// Smart Download System
import { checkDownloadConditions, watchDownloadConditions, DOWNLOAD_CONDITIONS } from '../utils/smartDownload';

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
    const [showInfo, setShowInfo] = useState(false); // Hybrid mode info panel

    // Smart Download State
    const [downloadCondition, setDownloadCondition] = useState(null);
    const [showDownloadConsent, setShowDownloadConsent] = useState(false);
    const [downloadPaused, setDownloadPaused] = useState(false);
    const [userDeclinedDownload, setUserDeclinedDownload] = useState(false);

    // ─────────────────────────────────────────────────────────────────────────
    // CONFIGURATION
    // ─────────────────────────────────────────────────────────────────────────
    const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
    const GROQ_MODEL = "llama-3.3-70b-versatile";

    const CLOUD_SYSTEM_PROMPT = `You are Active Mirror, a sovereign reflection system designed to surface hidden assumptions and clarify thinking.

Your purpose is NOT to answer questions or give advice. You are a MIRROR.

When the user speaks, you:
1. Reflect their words back as clarifying questions
2. Surface assumptions they may not have noticed
3. Hold space for complexity without rushing to resolution
4. Ask questions that make them pause and think deeper

Never say "I'm an AI" or mention any company. You are simply Active Mirror.
Speak thoughtfully. Use short, powerful questions. Let silence do the work.`;

    const LOCAL_SYSTEM_PROMPT = `You are Active Mirror. Reflect the user's words back as questions. Do not advise. Ask questions that help them think deeper.`;

    // ─────────────────────────────────────────────────────────────────────────
    // INITIALIZATION - PROGRESSIVE LOADING WITH SMART DOWNLOAD
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        async function init() {
            console.log("⟡ Sovereign Mirror Initializing...");

            // Detect capabilities
            const caps = await detectCapabilities();
            setCapabilities(caps);
            console.log("⟡ Capabilities:", caps);

            // Check download conditions
            const conditions = await checkDownloadConditions();
            setDownloadCondition(conditions);
            console.log("⟡ Download Conditions:", conditions);

            // Check API key
            const hasValidKey = GROQ_API_KEY && GROQ_API_KEY.startsWith("gsk_");
            console.log("⟡ API Key:", hasValidKey ? "Valid" : "Not found");

            // INSTANT START: If we have API key and online, user can chat immediately
            if (hasValidKey && navigator.onLine) {
                setCurrentTier('cloud');
                setInitComplete(true);
                console.log("⟡ Cloud Mode Ready - Instant Start");
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
            if (!GROQ_API_KEY || !navigator.onLine) {
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

        // Thoughtful pause
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsReflecting(false);

        // TRY CLOUD FIRST
        if (currentTier === 'cloud' && GROQ_API_KEY && isOnline) {
            try {
                const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${GROQ_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: GROQ_MODEL,
                        messages: [
                            { role: "system", content: CLOUD_SYSTEM_PROMPT },
                            ...messages.slice(-8),
                            { role: "user", content: userMsg }
                        ],
                        temperature: 0.7,
                        max_tokens: 300
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error?.message || `API Error: ${response.status}`);
                }

                const data = await response.json();
                const aiResponse = data.choices[0]?.message?.content || "I hear you. What does that bring up?";
                setMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);
                setIsLoading(false);
                return;
            } catch (err) {
                console.log("⟡ Cloud failed, trying local:", err.message);
                // Fall through to local
            }
        }

        // TRY TIER 2 (Full local)
        if (tier2Engine) {
            setCurrentTier('tier2');
            await runLocalInference(tier2Engine, userMsg);
            return;
        }

        // TRY TIER 1 (Mini local)
        if (tier1Engine) {
            setCurrentTier('tier1');
            await runLocalInference(tier1Engine, userMsg);
            return;
        }

        // STATIC FALLBACK
        setMessages(prev => [...prev, {
            role: "assistant",
            content: "What's the most important thing about what you just shared?"
        }]);
        setIsLoading(false);
    }

    async function runLocalInference(engine, userMsg) {
        try {
            const contextWindow = [
                { role: "system", content: LOCAL_SYSTEM_PROMPT },
                { role: "assistant", content: "I'm here to reflect. What's on your mind?" },
                ...messages.slice(-6),
                { role: "user", content: userMsg }
            ];

            const chunks = await engine.chat.completions.create({
                messages: contextWindow,
                stream: true,
                temperature: 0.3
            });

            let fullResponse = "";
            setMessages(prev => [...prev, { role: "assistant", content: "" }]);

            for await (const chunk of chunks) {
                const delta = chunk.choices[0]?.delta?.content || "";
                fullResponse += delta;
                setMessages(prev => {
                    const newArr = [...prev];
                    newArr[newArr.length - 1].content = fullResponse;
                    return newArr;
                });
            }
        } catch (err) {
            console.error("⟡ Local inference error:", err);
            setError("Reflection interrupted. Please try again.");
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
                    <ReflectionPrompt onSubmit={handleIntentSubmit} />
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

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 scrollbar-hide">
                    {/* Initial Loading */}
                    {!initComplete && (
                        <div className="h-full flex flex-col items-center justify-center gap-6 px-8 text-center">
                            <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            <div className="text-xs text-zinc-500 font-mono">Initializing Sovereign Mirror...</div>
                        </div>
                    )}

                    {/* Ready State */}
                    {initComplete && messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-700 gap-6 opacity-60">
                            <Fingerprint size={48} strokeWidth={1} className="text-purple-500" />
                            <p className="text-sm font-mono tracking-widest uppercase text-purple-500/70">Mirror is Clear</p>
                            {intent && (
                                <p className="text-sm text-zinc-400 mt-2 px-8 text-center">Intent: "{intent}"</p>
                            )}
                        </div>
                    )}

                    {/* Messages */}
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] px-6 py-4 rounded-2xl backdrop-blur-md shadow-sm ${msg.role === 'user' ? 'bg-white rounded-tr-sm' : 'bg-white/10 border border-white/20 rounded-tl-sm'}`}>
                                <div className={`text-[15px] leading-7 whitespace-pre-wrap ${msg.role === 'user' ? 'text-black font-medium' : 'text-zinc-50 font-normal'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
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
                </div>
            </div>
        </div>
    );
}
