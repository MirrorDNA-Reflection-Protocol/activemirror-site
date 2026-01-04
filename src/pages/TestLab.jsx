import React, { useState, useEffect, useRef } from 'react';
import { CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";
import { ArrowLeft, Send, CloudLightning, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// ⟡ CONFIG: DUAL ENGINES
const MODES = {
    CLOUD: {
        id: 'cloud',
        name: 'Cloud Reflection',
        model: 'Llama 3.3-70B',
        color: 'text-cyan-400',
        bg: 'bg-cyan-950/20',
        border: 'border-cyan-500/30'
    },
    LOCAL: {
        id: 'local',
        name: 'Sovereign Mode',
        model: 'Phi-3.5-Local',
        color: 'text-green-500',
        bg: 'bg-green-950/20',
        border: 'border-green-500/30'
    }
};

// ⟡ SYSTEM PROMPT (Aligned to Active Mirror V1.5 Doc)
const SYSTEM_PROMPT = `You are Active Mirror.
Your role is to:
* Surface assumptions I might not see
* Reflect trade-offs without pushing me toward a conclusion
* Ask clarifying questions before offering perspective
* Name what's unclear or unknown
* Hold space for complexity instead of rushing to resolution

PROTOCOL:
1. Use ⟡ for Insights.
2. Use ⧈ for Assumptions.
3. Use ⧉ for Trade-offs.
4. **Bold** key concepts.
5. Do NOT give advice unless asked.`;

// ⟡ UI COMPONENT: BLUR REVEAL TEXT
const BlurText = ({ text, isUser }) => {
    const words = text.split(' ');
    return (
        <div className="text-[15px] leading-7">
            {words.map((word, i) => {
                const isGlyph = ['⟡', '⧈', '⧉', '△', '◈'].some(g => word.includes(g));
                return (
                    <motion.span
                        key={i}
                        initial={{ filter: "blur(8px)", opacity: 0, y: 3 }}
                        animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: i * 0.015 }}
                        className={`inline-block mr-1 ${isGlyph ? "text-green-400 font-bold" : ""}`}
                    >
                        {word}
                    </motion.span>
                );
            })}
        </div>
    );
};

export default function TestLab() {
    // Default to Cloud on Mobile, Local on Desktop
    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|Android/i.test(navigator.userAgent);
    const [mode, setMode] = useState(isMobile ? MODES.CLOUD : MODES.LOCAL);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [localEngine, setLocalEngine] = useState(null);
    const [localProgress, setLocalProgress] = useState("");
    const bottomRef = useRef(null);

    // ⟡ INITIALIZE LOCAL ENGINE (Background Load)
    useEffect(() => {
        async function initLocal() {
            if (mode.id === 'local' && !localEngine) {
                const modelId = isMobile ? "Qwen2.5-0.5B-Instruct-q4f16_1-MLC" : "Phi-3.5-mini-instruct-q4f16_1-MLC";
                const workerScript = `
                    import { WebWorkerMLCEngineHandler } from "https://esm.run/@mlc-ai/web-llm";
                    const handler = new WebWorkerMLCEngineHandler();
                    self.onmessage = (msg) => { handler.onmessage(msg); };
                `;
                const worker = new Worker(URL.createObjectURL(new Blob([workerScript], { type: "application/javascript" })), { type: "module" });

                try {
                    const eng = await CreateWebWorkerMLCEngine(worker, modelId, {
                        initProgressCallback: (report) => {
                            if (report.progress === 1) setLocalProgress("");
                            else setLocalProgress(`Loading Sovereign Vault... ${Math.round(report.progress * 100)}%`);
                        }
                    });
                    setLocalEngine(eng);
                } catch (e) {
                    console.error("WebGPU Error:", e);
                    setLocalProgress("WebGPU not available - try Cloud mode");
                }
            }
        }
        initLocal();
    }, [mode, localEngine, isMobile]);

    useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

    // ⟡ HANDLE SEND (ROUTING)
    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

        try {
            let fullResponse = "";
            const context = [
                { role: "system", content: SYSTEM_PROMPT },
                ...messages.slice(-4),
                { role: "user", content: userMsg }
            ];

            if (mode.id === 'cloud') {
                // ☁️ CLOUD PATH - Using Groq Free API
                const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer gsk_placeholder_replace_with_real_key"
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: context,
                        temperature: 0.6,
                        max_tokens: 2048
                    })
                });
                const data = await response.json();
                fullResponse = data.choices?.[0]?.message?.content || data.error?.message || "Error: Check API Config";

                setMessages(prev => [...prev, { role: "assistant", content: fullResponse }]);

            } else {
                // 🧠 LOCAL PATH
                if (!localEngine) {
                    setMessages(prev => [...prev, { role: "assistant", content: "⟡ Local engine still loading. Please wait or switch to Cloud mode." }]);
                    setIsLoading(false);
                    return;
                }
                const chunks = await localEngine.chat.completions.create({ messages: context, stream: true, temperature: 0.5 });
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
            }
        } catch (err) {
            console.error("Chat error:", err);
            setMessages(prev => [...prev, { role: "assistant", content: "Connection Error: " + err.message }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen font-sans text-white overflow-hidden selection:bg-purple-500/30 bg-black">
            {/* AMBIENT LAYERS */}
            <div className={`fixed inset-0 transition-all duration-1000 ${mode.id === 'cloud' ? 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-black to-black' : 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-black to-black'} z-0`}></div>
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0"></div>

            <main className="relative z-10 w-full min-h-screen flex items-center justify-center p-4">
                <div className={`w-full max-w-3xl h-[90vh] flex flex-col rounded-3xl border bg-black/80 backdrop-blur-3xl shadow-2xl transition-all duration-500 ${mode.border}`}>

                    {/* HEADER */}
                    <div className="h-20 border-b border-white/5 flex items-center justify-between px-6">
                        <Link to="/" className="text-zinc-500 hover:text-white transition-colors"><ArrowLeft size={18} /></Link>
                        <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
                            <button
                                onClick={() => setMode(MODES.CLOUD)}
                                className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${mode.id === 'cloud' ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                <CloudLightning size={14} /> Cloud 70B
                            </button>
                            <button
                                onClick={() => setMode(MODES.LOCAL)}
                                className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${mode.id === 'local' ? 'bg-green-500/20 text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.2)]' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                <Shield size={14} /> Sovereign
                            </button>
                        </div>
                        <div className="w-8 text-xs text-zinc-600 font-mono">LAB</div>
                    </div>

                    {/* CHAT AREA */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-60 gap-4">
                                {mode.id === 'cloud' ? <CloudLightning size={48} className="text-cyan-900" /> : <Shield size={48} className="text-green-900" />}
                                <div className="text-center">
                                    <p className="font-mono text-xs tracking-widest uppercase mb-2">
                                        {mode.id === 'cloud' ? "Llama 3.3-70B // CLOUD ORACLE" : "Phi-3.5 // LOCAL VAULT"}
                                    </p>
                                    <p className="text-zinc-700 text-sm">🧪 Hybrid Engine Lab</p>
                                    {mode.id === 'local' && localProgress && <p className="text-xs text-green-500 animate-pulse mt-2">{localProgress}</p>}
                                </div>
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] px-6 py-4 rounded-2xl backdrop-blur-md shadow-sm ${msg.role === 'user' ? 'bg-white text-black' : 'bg-white/5 border border-white/5 text-zinc-200'}`}>
                                    {msg.role === 'assistant' && i === messages.length - 1 && !isLoading ?
                                        <BlurText text={msg.content} isUser={false} /> :
                                        <div className="text-[15px] leading-7 whitespace-pre-wrap">{msg.content}</div>
                                    }
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="px-6 py-4 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* INPUT */}
                    <div className="p-6 border-t border-white/5">
                        <div className="relative flex items-center">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                                disabled={isLoading}
                                className={`w-full bg-black/50 border rounded-2xl py-4 pl-6 pr-14 text-white focus:outline-none transition-all ${mode.id === 'cloud' ? 'focus:border-cyan-500/50' : 'focus:border-green-500/50'} border-white/10 disabled:opacity-50`}
                                placeholder={mode.id === 'cloud' ? "Ask the Oracle..." : "Reflect in the Vault..."}
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="absolute right-3 p-2 bg-white text-black rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                        <p className="text-center text-[10px] text-zinc-700 mt-3 font-mono">
                            {mode.id === 'cloud' ? '☁️ Cloud: Llama 3.3-70B via Groq' : '🔒 Sovereign: Phi-3.5 on-device WebGPU'}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
