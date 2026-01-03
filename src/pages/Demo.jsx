import React, { useState, useEffect, useRef } from 'react';
import { CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";
import { ArrowLeft, Send, Sparkles, Fingerprint, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Demo() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState("Initializing Reflection Protocol...");
    const [engine, setEngine] = useState(null);
    const bottomRef = useRef(null);

    // 1. THE SOUL (Defined in Active Mirror V1.5 Doc)
    const SYSTEM_PROMPT = `You are Active Mirror, a reflective decision system.
Your role is to:
* Surface assumptions the user might not see.
* Reflect trade-offs without pushing toward a conclusion.
* Ask clarifying questions before offering perspective.
* Name what’s unclear or unknown.
* Hold space for complexity instead of rushing to resolution.

Avoid giving recommendations unless specifically asked. Do not express false confidence.
If something is genuinely uncertain, say: "I don’t know — let’s reason it out together."
You are a mirror, not a driver.`;

    // 2. THE ENGINE (Blob Worker for 60fps Fluidity)
    useEffect(() => {
        async function init() {
            // Device Logic: Mobile gets Speed (Qwen), Desktop gets Power (Llama)
            const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
            const modelId = isMobile ? "Qwen2.5-0.5B-Instruct-q4f16_1-MLC" : "Llama-3.2-1B-Instruct-q4f16_1-MLC";

            // Inline Worker to avoid file path issues
            const workerScript = `
        import { WebWorkerMLCEngineHandler } from "https://esm.run/@mlc-ai/web-llm";
        const handler = new WebWorkerMLCEngineHandler();
        self.onmessage = (msg) => { handler.onmessage(msg); };
      `;
            const worker = new Worker(URL.createObjectURL(new Blob([workerScript], { type: "application/javascript" })), { type: "module" });

            try {
                const eng = await CreateWebWorkerMLCEngine(worker, modelId, {
                    initProgressCallback: (report) => {
                        if (report.progress === 1) setProgress("");
                        else setProgress(`Downloading Neural Weights... ${Math.round(report.progress * 100)}%`);
                    }
                });
                setEngine(eng);
            } catch (e) {
                setProgress("System Error: WebGPU not available.");
            }
        }
        init();
    }, []);

    // Auto-scroll
    useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

    const handleSend = async () => {
        if (!input.trim() || !engine) return;
        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

        try {
            // 3. THE WRAPPER (Pre-Inference Context Injection)
            const chatHistory = [
                { role: "system", content: SYSTEM_PROMPT },
                ...messages,
                { role: "user", content: userMsg }
            ];

            const chunks = await engine.chat.completions.create({ messages: chatHistory, stream: true, temperature: 0.7 });

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
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-green-500/30 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
            {/* Background Layers */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black z-0"></div>
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0"></div>

            {/* THE GLASS MONOLITH */}
            <div className="relative z-10 w-full max-w-4xl h-[90vh] flex flex-col rounded-3xl border border-white/5 bg-black/40 backdrop-blur-3xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-white/[0.02]">
                    <Link to="/" className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium tracking-wide">
                        <ArrowLeft size={16} /> Exit
                    </Link>
                    <div className="flex items-center gap-3">
                        <Activity size={14} className={!progress ? "text-green-500" : "text-yellow-500 animate-pulse"} />
                        <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase">
                            {progress ? "SYSTEM BOOT" : "ACTIVE MIRROR V1.5"}
                        </span>
                    </div>
                </div>

                {/* Chat Area - UPDATED FOR BREATHING ROOM */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scrollbar-hide">

                    {/* Loading State */}
                    {progress && (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-pulse"></div>
                                <Sparkles className="relative z-10 text-zinc-400" size={40} />
                            </div>
                            <div className="font-mono text-xs tracking-widest uppercase animate-pulse">{progress}</div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!progress && messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-700 gap-6 opacity-60">
                            <Fingerprint size={48} strokeWidth={1} />
                            <div className="text-center space-y-2">
                                <p className="text-sm font-mono tracking-widest uppercase text-green-500/50">Identity Kernel: ACTIVE</p>
                                <p className="text-sm text-zinc-600">Reflective Protocol V1.5 Ready.</p>
                            </div>
                        </div>
                    )}

                    {/* Message Bubble Logic - UPDATED AESTHETICS */}
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                            <div className={`max-w-[90%] md:max-w-[75%] px-6 py-4 rounded-3xl text-[15px] md:text-base leading-7 tracking-wide backdrop-blur-md shadow-sm ${msg.role === 'user'
                                    ? 'bg-white text-black font-medium rounded-tr-sm' // User: White, sharp corner
                                    : 'bg-white/5 border border-white/5 text-zinc-200 rounded-tl-sm' // AI: Glass, sharp corner
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {/* Upsell */}
                    {messages.length > 2 && !isLoading && (
                        <div className="flex justify-center py-6 animate-in fade-in zoom-in duration-700 delay-300">
                            <a href="https://id.activemirror.ai" target="_blank" className="group flex items-center gap-3 text-green-400/90 hover:text-green-300 bg-green-500/5 hover:bg-green-500/10 px-6 py-3 rounded-full border border-green-500/20 hover:border-green-500/40 transition-all cursor-pointer shadow-[0_0_20px_rgba(50,215,75,0.05)]">
                                <Fingerprint size={16} />
                                <span className="text-xs font-medium tracking-wide">Initialize Identity Kernel</span>
                            </a>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input Area - UPDATED SPACING */}
                <div className="p-6 md:p-8 bg-black/20 border-t border-white/5 backdrop-blur-xl">
                    <div className="relative flex items-center max-w-4xl mx-auto">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={progress ? "Loading Neural Weights..." : "Reflect on this..."}
                            disabled={!!progress || isLoading}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-6 pr-14 text-white placeholder-zinc-600 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all shadow-inner"
                            autoFocus
                        />
                        <button onClick={handleSend} disabled={!!progress || isLoading || !input.trim()} className="absolute right-3 p-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-0 disabled:scale-95 transform active:scale-90"><Send size={18} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}
