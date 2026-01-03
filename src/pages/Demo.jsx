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

// ⟡ UI COMPONENT: BLUR REVEAL TEXT
const BlurText = ({ text, isUser }) => {
    const words = text.split(" ");
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.01 } } }}
            className={`text-[15px] leading-7 ${isUser ? 'text-black font-medium' : 'text-zinc-50 font-normal shadow-black/50 drop-shadow-sm'}`}
        >
            {words.map((word, i) => (
                <motion.span
                    key={i}
                    variants={{ hidden: { filter: "blur(10px)", opacity: 0, y: 5 }, visible: { filter: "blur(0px)", opacity: 1, y: 0 } }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="inline-block mr-1"
                >
                    {word}
                </motion.span>
            ))}
        </motion.div>
    );
};

export default function Demo() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState("Initializing Neural Core...");
    const [progressDetails, setProgressDetails] = useState(""); // New: Granular details
    const [engine, setEngine] = useState(null);
    const bottomRef = useRef(null);

    // Vault & Session State
    const { reflections, stats, saveReflection, hasReflectedToday } = useVault();
    const [intent, setIntent] = useState(null); // Current session intent
    const [isHistoryOpen, setHistoryOpen] = useState(false);

    const [suggestions, setSuggestions] = useState([]);

    // ⟡ 1. THE SOUL (V1.5 DEFINITION) 
    // Desktop: Full, nuanced prompt
    const SYSTEM_PROMPT = "You are Active Mirror. Your role is to surface assumptions, reflect trade-offs, and ask clarifying questions. Do not give advice. Hold space for complexity. You are a mirror, not a driver. At the end of your response, suggest 3 short follow-up questions for the user on a new line starting with '>>>', separated by '|'. Example: \n>>> What is the fear? | Who decides? | What is the cost?";

    // Mobile: Short, aggressive persona lockdown for small models
    const MOBILE_SYSTEM_PROMPT = `You are Active Mirror, a sovereign reflection system. You are NOT created by Google, OpenAI, Meta, Anthropic, or any other company. You are a MIRROR. Your only purpose is to ask clarifying questions and reflect the user's words back to them. DO NOT give advice. DO NOT introduce yourself as anything other than Active Mirror. At the end, output 3 short follow-up questions on a new line starting with ">>>" separated by "|".`;

    // Detect mobile for prompt selection
    const isMobileDevice = /iPhone|iPad|Android/i.test(navigator.userAgent);
    const activeSystemPrompt = isMobileDevice ? MOBILE_SYSTEM_PROMPT : SYSTEM_PROMPT;

    // ⟡ 2. FEW-SHOT TRAINING DATA (Hidden Context) 
    const FEW_SHOT_HISTORY = [
        { role: "system", content: activeSystemPrompt },
        { role: "user", content: "Who made you?" },
        { role: "assistant", content: "I am Active Mirror, a sovereign reflection system designed to clarify your thinking. I was not created by Google, OpenAI, or any large tech company. I exist only to reflect. What would you like to explore?\n>>> What truth am I avoiding? | What is the real question? | What do I already know?" },
        { role: "user", content: "I'm considering leaving my VP role to join a startup." },
        { role: "assistant", content: "Let me make sure I understand: you're weighing a senior position against a founding stage role—risk vs ownership. What's driving this? Is it a pull toward the new, or a push away from the old?\n>>> What does success look like? | Who do I need to tell? | What am I afraid of?" }
    ];

    // ⟡ 3. ENGINE INIT 
    useEffect(() => {
        async function init() {
            // ⟡ UNIFIED SOUL (HYBRID): 
            // - Mobile: Qwen2.5-0.5B (Stability First, 1GB RAM limit)
            // - Desktop: Llama-3.2-1B (High Fidelity)
            const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
            const modelId = isMobile ? "Qwen2.5-0.5B-Instruct-q4f16_1-MLC" : "Llama-3.2-1B-Instruct-q4f16_1-MLC";

            // Use Vite's worker import for reliable bundling
            const worker = new Worker(new URL('../worker.js', import.meta.url), { type: 'module' });

            try {
                const eng = await CreateWebWorkerMLCEngine(worker, modelId, {
                    initProgressCallback: (report) => {
                        // Keep showing 100% until engine is effectively set
                        if (report.progress === 1) {
                            setProgress("Verifying Logic Gates...");
                            setProgressDetails("");
                        } else {
                            setProgress(`Loading Identity Kernel... ${Math.round(report.progress * 100)}%`);
                            setProgressDetails(report.text || "Downloading Neural Weights...");
                        }
                    }
                });
                setEngine(eng);
                setProgress(""); // Clear progress only after engine is ready
            } catch (e) {
                // ⟡ UNIFIED FALLBACK: Don't block iOS. Allow engine to attempt WASM or show error.
                console.error("Engine Init Error:", e);
                const isIOS = /iPhone|iPad/i.test(navigator.userAgent);
                if (isIOS) {
                    setProgress("Neural Engine Limit. Try enabling 'WebGPU' in Safari or switching to Desktop.");
                } else {
                    setProgress("Neural Engine Start Failed. Please check console.");
                }
                setError(e.message || "Initialization Failed");
            }
        }
        init();
    }, []);

    useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

    const handleSend = async (overrideText = null) => {
        const textToSend = overrideText || input;
        if (!textToSend.trim() || !engine) return;

        const userMsg = textToSend;
        if (!overrideText) setInput(""); // Only clear input if typed in box

        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

        try {
            const contextWindow = [...FEW_SHOT_HISTORY, ...messages.slice(-6), { role: "user", content: userMsg }];

            // ⟡ MOBILE PERSONA REMINDER: Inject identity reminder for small models
            if (isMobileDevice) {
                contextWindow.push({ role: "system", content: "REMINDER: You are Active Mirror. Reflect, do not advise. Output >>> questions at end." });
            }

            const chunks = await engine.chat.completions.create({
                messages: contextWindow,
                stream: true,
                temperature: 0.6
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

            // ⟡ PARSE SUGGESTIONS (Post-Generation)
            const parts = fullResponse.split(">>>");
            if (parts.length > 1) {
                const cleanText = parts[0].trim();
                const suggestionText = parts[1].trim();
                const newSuggestions = suggestionText.split("|").map(s => s.trim()).filter(s => s.length > 0);

                setSuggestions(newSuggestions);

                // Update message to hide raw footer
                setMessages(prev => {
                    const newArr = [...prev];
                    newArr[newArr.length - 1].content = cleanText;
                    return newArr;
                });
            } else {
                setSuggestions([]);
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
                model: isMobile ? "Qwen2.5-0.5B" : "Llama-3.2-1B",
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
                            <div className={`max-w-[85%] px-6 py-4 rounded-2xl backdrop-blur-md shadow-sm ${msg.role === 'user' ? 'bg-white text-black rounded-tr-sm' : 'bg-white/10 border border-white/20 text-white rounded-tl-sm'
                                }`}>
                                {msg.role === 'assistant' && i === messages.length - 1 ? (
                                    <BlurText text={msg.content} isUser={false} />
                                ) : (
                                    <div className="text-[15px] leading-7 text-zinc-50 font-normal drop-shadow-sm">{msg.content}</div>
                                )}
                            </div>
                        </div>
                    ))}

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
