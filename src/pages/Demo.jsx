import React, { useState, useEffect, useRef } from 'react';
import { CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";
import { ArrowLeft, Send, Sparkles, Fingerprint } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Demo() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState("Initializing Reflection Protocol...");
    const [engine, setEngine] = useState(null);
    const bottomRef = useRef(null);

    // 1. THE SOUL (System Prompt)
    const SYSTEM_PROMPT = "You are Active Mirror — a reflective thinking partner. You help users think, not tell them what to do. Surface assumptions, reflect trade-offs, ask clarifying questions. Tag uncertainty honestly. The user makes final decisions. You're a mirror, not a driver.";

    // 2. THE ENGINE MOUNT
    useEffect(() => {
        async function init() {
            // Device Detection
            const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
            const modelId = isMobile ? "Qwen2.5-0.5B-Instruct-q4f16_1-MLC" : "Llama-3.2-1B-Instruct-q4f16_1-MLC";

            // The Worker Blob (Fixes UI Freeze)
            const workerScript = `
        import { WebWorkerMLCEngineHandler } from "https://esm.run/@mlc-ai/web-llm";
        const handler = new WebWorkerMLCEngineHandler();
        self.onmessage = (msg) => { handler.onmessage(msg); };
      `;
            const worker = new Worker(URL.createObjectURL(new Blob([workerScript], { type: "application/javascript" })), { type: "module" });

            try {
                const eng = await CreateWebWorkerMLCEngine(worker, modelId, {
                    initProgressCallback: (report) => {
                        // User-Friendly Loading Logic
                        if (report.progress === 1) {
                            setProgress("");
                        } else {
                            // Extract percentage if available, or just show text
                            // The report object structure usually has text. report.progress is 0-1.
                            setProgress(`Downloading Neural Weights... ${Math.round(report.progress * 100)}%`);
                        }
                    }
                });
                setEngine(eng);
                // Inject System Prompt logic handled in chat loop
            } catch (e) {
                console.error(e);
                setProgress("Error: WebGPU not supported or initialization failed.");
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
            // 3. THE WRAPPER (Pre-Inference)
            // We combine System Prompt + History
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
            setMessages(prev => [...prev, { role: "assistant", content: "Error: Reflection failed." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen font-sans text-white overflow-hidden selection:bg-green-500/30 bg-black flex items-center justify-center p-4">
            {/* BACKGROUND NOISE */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none"></div>

            {/* THE GLASS MONOLITH */}
            <div className="relative z-10 w-full max-w-2xl h-[85vh] flex flex-col rounded-3xl border border-white/5 bg-black/40 backdrop-blur-3xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-white/[0.02]">
                    <Link to="/" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm"><ArrowLeft size={16} /> Exit</Link>
                    <span className="text-xs font-mono tracking-widest text-zinc-600 uppercase">Active Mirror v2</span>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    {progress && (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
                            <Sparkles className="animate-pulse text-zinc-700" size={32} />
                            <div className="font-mono text-xs">{progress}</div>
                        </div>
                    )}

                    {!progress && messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-4 opacity-50">
                            <p>System Ready. Initialize thought.</p>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm leading-relaxed backdrop-blur-md ${msg.role === 'user' ? 'bg-white text-black font-medium' : 'bg-white/5 border border-white/5 text-zinc-300'
                                }`}>{msg.content}</div>
                        </div>
                    ))}

                    {/* 4. THE WRAPPER (Post-Inference Upsell) */}
                    {messages.length > 1 && !isLoading && (
                        <div className="flex justify-center animate-fade-in-up pt-4">
                            <a href="https://id.activemirror.ai" target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-2 text-green-500/80 hover:text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 transition-all cursor-pointer">
                                <Fingerprint size={12} /> Claim your Identity Kernel
                            </a>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white/[0.02] border-t border-white/5">
                    <div className="relative flex items-center">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={progress ? "Loading Neural Weights..." : "Reflect on this..."}
                            disabled={!!progress || isLoading}
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-5 pr-12 text-white placeholder-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
                            autoFocus
                        />
                        <button
                            onClick={handleSend}
                            disabled={!!progress || isLoading || !input.trim()}
                            className="absolute right-3 p-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-all disabled:opacity-0"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
