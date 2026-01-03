import React, { useState, useEffect, useRef } from 'react';
import { CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";
import { ArrowLeft, Send, Sparkles, Fingerprint, Activity, Cpu, Menu, Square, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Reflection & Vault Integration
import { useVault } from '../hooks/useVault';
import ReflectionPrompt from '../components/ReflectionPrompt';
import ReflectionHistory from '../components/ReflectionHistory';
import SessionCloseControls from '../components/SessionCloseControls';

// ⟡ UI COMPONENT: TEXT DISPLAY (Simplified - no animation)
const ChatText = ({ text, isUser }) => (
    <div className={`text-[15px] leading-7 whitespace-pre-wrap ${isUser ? 'text-black font-medium' : 'text-zinc-50 font-normal'}`}>
        {text}
    </div>
);

export default function Demo() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState("Initializing Neural Core...");
    const [progressDetails, setProgressDetails] = useState(""); // New: Granular details
    const [engine, setEngine] = useState(null);
    const [isReflecting, setIsReflecting] = useState(false); // NEW: Visual "thinking" state
    const [useCloud, setUseCloud] = useState(true); // NEW: Default to cloud, fallback to local
    const bottomRef = useRef(null);

    // Vault & Session State
    const { reflections, stats, saveReflection, hasReflectedToday } = useVault();
    const [intent, setIntent] = useState(null); // Current session intent
    const [isHistoryOpen, setHistoryOpen] = useState(false);

    const [suggestions, setSuggestions] = useState([]);

    // ⟡ THE SOUL V3.2 - COMPELLING REFLECTION
    // Rich prompt for API (Groq can handle complexity), minimal for local fallback
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

    // API Configuration - reads from environment variable
    const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
    const GROQ_MODEL = "llama-3.1-70b-versatile";

    // Local Context for fallback
    const LOCAL_BASE_CONTEXT = [
        { role: "system", content: LOCAL_SYSTEM_PROMPT },
        { role: "assistant", content: "I'm here to reflect. What's on your mind?" }
    ];

    // ⟡ 3. ENGINE INIT 
    useEffect(() => {
        async function init() {
            // ⟡ DEBUG: Log API key status
            console.log("⟡ API Key Status:", GROQ_API_KEY ? `Present (${GROQ_API_KEY.substring(0, 10)}...)` : "NOT FOUND");

            // ⟡ INSTANT CHAT: If API key exists AND is valid format, enable cloud
            const hasValidKey = GROQ_API_KEY && GROQ_API_KEY.startsWith("gsk_");
            if (hasValidKey) {
                console.log("⟡ Cloud Mode Enabled");
                setProgress(""); // Clear loading screen - API is ready
                setUseCloud(true);
            } else {
                console.log("⟡ Local Mode - No valid API key, waiting for engine");
                setUseCloud(false); // Force local mode
            }

            // ⟡ V3.1 - SMOLLM2: Purpose-built for instruction following (loads in background)
            const modelId = "SmolLM2-1.7B-Instruct-q4f32_1-MLC";

            const worker = new Worker(new URL('../worker.js', import.meta.url), { type: 'module' });

            worker.onerror = (e) => {
                console.error("Worker Error:", e);
                if (!GROQ_API_KEY) {
                    setProgress("Worker Load Failed. Please refresh.");
                    setError("Worker Crash: " + (e.message || "Unknown"));
                }
            };

            try {
                const eng = await CreateWebWorkerMLCEngine(worker, modelId, {
                    initProgressCallback: (report) => {
                        // Only show progress if no API key (user is waiting for local)
                        if (!GROQ_API_KEY) {
                            if (report.progress === 1) {
                                setProgress("Verifying Logic Gates...");
                                setProgressDetails("");
                            } else {
                                setProgress(`Loading Identity Kernel... ${Math.round(report.progress * 100)}%`);
                                setProgressDetails(report.text || "Downloading Neural Weights...");
                            }
                        }
                    }
                });
                setEngine(eng);
                if (!GROQ_API_KEY) {
                    setProgress(""); // Clear progress only if no API key
                }
            } catch (e) {
                console.error("Engine Init Error:", e);
                if (!GROQ_API_KEY) {
                    const isIOS = /iPhone|iPad/i.test(navigator.userAgent);
                    if (isIOS) {
                        setProgress("Neural Engine Limit. Try enabling 'WebGPU' in Safari or switching to Desktop.");
                    } else {
                        setProgress("Neural Engine Start Failed. Please check console.");
                    }
                    setError(e.message || "Initialization Failed");
                }
            }
        }
        init();
    }, []);

    useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

    const handleSend = async (overrideText = null) => {
        const textToSend = overrideText || input;
        if (!textToSend.trim()) return;
        if (!useCloud && !engine) return; // Need either API or local engine

        const userMsg = textToSend;
        if (!overrideText) setInput("");

        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);
        setIsReflecting(true); // ⟡ Show "reflecting" state

        // ⟡ THOUGHTFUL PAUSE: Wait before responding (feels like thinking)
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsReflecting(false);

        // ⟡ TRY CLOUD API FIRST (Groq with Llama-3.1-70B)
        if (useCloud) {
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
                return; // Success with cloud
            } catch (err) {
                console.log("Cloud API failed, falling back to local:", err.message);
                // Fall through to local inference
            }
        }

        // ⟡ FALLBACK: Local SmolLM2 inference
        if (!engine) {
            // If no local engine AND API failed, show helpful error
            setError("Connecting... Please wait while the local engine loads.");
            setIsLoading(false);
            // Retry after a delay if engine is still loading
            setTimeout(() => {
                if (engine) handleSend(userMsg);
            }, 3000);
            return;
        }

        try {
            const contextWindow = [...LOCAL_BASE_CONTEXT, ...messages.slice(-6), { role: "user", content: userMsg }];

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
            console.error(err);
            setError(err.message || "Neural Interruption");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStop = () => {
        if (engine) engine.interruptGenerate();
        setIsLoading(false);
    };

    // Handler: seamless start from Prompt
    const handleStartSession = (intentText) => {
        setIntent(intentText);
        handleSend(intentText);
    };

    // Handler: Close Session
    const handleOutcome = (outcome) => {
        const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
        saveReflection(
            intent || "Free Reflection",
            messages,
            outcome,
            {
                model: "SmolLM2-1.7B",
                online: false,
                id: "local-session"
            }
        );
        // Visual feedback could go here
        setHistoryOpen(true); // Open history to show it saved
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-green-500/30 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">

            {/* 1. DAILY INTENT PROMPT (If not reflected today) */}
            {!hasReflectedToday && !intent && (
                <ReflectionPrompt onSetIntent={handleStartSession} ready={!progress} />
            )}

            {/* 2. HISTORY SIDEBAR */}
            <ReflectionHistory
                isOpen={isHistoryOpen}
                onClose={() => setHistoryOpen(false)}
                history={reflections}
                stats={stats}
            />

            {/* Background Layers */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black z-0"></div>
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0"></div>

            {/* THE AGENTIC MONOLITH */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={`relative z-10 w-full max-w-3xl h-[85vh] flex flex-col rounded-3xl border bg-black/40 backdrop-blur-3xl shadow-2xl overflow-hidden transition-colors duration-1000 ${isLoading ? 'border-green-500/30 shadow-[0_0_40px_rgba(50,215,75,0.1)]' : 'border-white/5'}`}
            >

                {/* Header */}
                <div className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"><ArrowLeft size={16} /> Exit</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-xs animate-pulse mr-4">
                                <AlertCircle size={12} />
                                <span className="max-w-[150px] truncate">{error}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className={`absolute inset-0 bg-green-500 rounded-full blur-sm ${isLoading ? 'animate-ping' : 'opacity-0'}`}></div>
                                <Activity size={14} className={isLoading ? "text-green-400" : "text-zinc-600"} />
                            </div>
                            <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase hidden md:block">
                                {progress ? "SYSTEM BOOT" : "ACTIVE MIRROR V1.5"}
                            </span>
                        </div>
                        {/* History Toggle */}
                        <button onClick={() => setHistoryOpen(true)} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
                            <Menu size={18} />
                        </button>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 scrollbar-hide">
                    {progress && (
                        <div className="h-full flex flex-col items-center justify-center gap-6 px-8 text-center">
                            <Cpu className="text-green-500 animate-pulse" size={40} />
                            <div className="space-y-2 animate-pulse">
                                <div className="font-mono text-xs tracking-widest uppercase text-green-400">{progress}</div>
                                {progressDetails && <div className="text-[10px] text-green-600/70 font-mono">{progressDetails}</div>}
                            </div>
                            <div className="text-[11px] text-zinc-600 max-w-[200px] leading-relaxed border border-white/5 p-3 rounded-lg bg-white/[0.02]">
                                ⟡ <strong>First Run Note:</strong><br />
                                We are downloading the brain (~500MB) directly to your device. Future visits will be instant.
                            </div>
                        </div>
                    )}

                    {!progress && messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-700 gap-6 opacity-60">
                            <Fingerprint size={48} strokeWidth={1} className="text-purple-500" />
                            <p className="text-sm font-mono tracking-widest uppercase text-purple-500/70">Mirror is Clear</p>
                            {intent && (
                                <p className="text-sm text-zinc-400 mt-2 px-8 text-center">Intent: "{intent}"</p>
                            )}
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] px-6 py-4 rounded-2xl backdrop-blur-md shadow-sm ${msg.role === 'user' ? 'bg-white rounded-tr-sm' : 'bg-white/10 border border-white/20 rounded-tl-sm'}`}>
                                <div className={`text-[15px] leading-7 whitespace-pre-wrap ${msg.role === 'user' ? 'text-black font-medium' : 'text-zinc-50 font-normal'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* ⟡ REFLECTING INDICATOR: Shows during thoughtful pause */}
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

                    {/* Session Controls (Visible when active) */}
                    {!progress && messages.length > 1 && !isLoading && !hasReflectedToday && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 space-y-6">

                            {/* Follow-up Suggestions */}
                            {suggestions.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-2 px-4">
                                    {suggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSend(s)}
                                            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-zinc-300 text-sm hover:text-white transition-all hover:scale-105 active:scale-95"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <SessionCloseControls onOutcome={handleOutcome} />
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="p-8 bg-black/20 border-t border-white/5 backdrop-blur-xl">
                    <div className="relative flex items-center">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                            placeholder={progress ? "Loading Neural Weights..." : "Reflect on this..."}
                            disabled={!!progress || (isLoading && !engine)}
                            className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-6 pr-14 text-white placeholder-zinc-400 focus:outline-none focus:border-white/40 transition-all font-medium"
                            autoFocus
                        />
                        {isLoading ? (
                            <button onClick={handleStop} className="absolute right-3 p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all animate-pulse">
                                <Square size={18} fill="currentColor" />
                            </button>
                        ) : (
                            <button onClick={() => handleSend()} disabled={!!progress || !input.trim()} className="absolute right-3 p-2 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-0">
                                <Send size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
