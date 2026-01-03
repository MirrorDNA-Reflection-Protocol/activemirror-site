import React, { useState, useEffect, useRef } from 'react';
import { CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";
import { ArrowLeft, Send, Sparkles, Fingerprint, Activity, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ⟡ UI COMPONENT: BLUR REVEAL TEXT
const BlurText = ({ text, isUser }) => {
    const words = text.split(" ");
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.01 } } }}
            className={`text-[15px] leading-7 ${isUser ? 'text-black' : 'text-zinc-200'}`}
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
    const [progress, setProgress] = useState("Initializing Neural Core...");
    const [engine, setEngine] = useState(null);
    const bottomRef = useRef(null);

    // ⟡ 1. THE SOUL (V1.5 DEFINITION) 
    const SYSTEM_PROMPT = "You are Active Mirror. Your role is to surface assumptions, reflect trade-offs, and ask clarifying questions. Do not give advice. Hold space for complexity. You are a mirror, not a driver.";

    // ⟡ 2. FEW-SHOT TRAINING DATA (Hidden Context) 
    // We feed this to the model so it mimics the "Sarah" conversation style from the PDF. 
    const FEW_SHOT_HISTORY = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: "I'm considering leaving my VP role to join a startup." },
        { role: "assistant", content: "Let me make sure I understand: you're weighing a senior position against a founding stage role—risk vs ownership. What's driving this? Is it a pull toward the new, or a push away from the old?" }
    ];

    // ⟡ 3. ENGINE INIT 
    useEffect(() => {
        async function init() {
            const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
            const modelId = isMobile ? "Qwen2.5-0.5B-Instruct-q4f16_1-MLC" : "Llama-3.2-1B-Instruct-q4f16_1-MLC";

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
                        else setProgress(`Loading Identity Kernel... ${Math.round(report.progress * 100)}%`);
                    }
                });
                setEngine(eng);
            } catch (e) {
                setProgress("WebGPU Error. Please use Chrome/Edge/Safari.");
            }
        }
        init();
    }, []);

    useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

    const handleSend = async () => {
        if (!input.trim() || !engine) return;
        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

        try {
            // Combine: Few-Shot (Hidden) + Real History
            // Note: We only send the last 10 messages to save context window on 1B model
            const contextWindow = [...FEW_SHOT_HISTORY, ...messages.slice(-6), { role: "user", content: userMsg }];

            const chunks = await engine.chat.completions.create({
                messages: contextWindow,
                stream: true,
                temperature: 0.6 // Lower temp for more precision
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
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-green-500/30 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
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
                    <Link to="/" className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"><ArrowLeft size={16} /> Exit</Link>
                    <div className="flex items-center gap-3">
                        {/* Heartbeat Animation */}
                        <div className="relative">
                            <div className={`absolute inset-0 bg-green-500 rounded-full blur-sm ${isLoading ? 'animate-ping' : 'opacity-0'}`}></div>
                            <Activity size={14} className={isLoading ? "text-green-400" : "text-zinc-600"} />
                        </div>
                        <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase">
                            {progress ? "SYSTEM BOOT" : "ACTIVE MIRROR V1.5"}
                        </span>
                    </div>
                </div>
                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 scrollbar-hide">
                    {progress && (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-6">
                            <Cpu className="animate-pulse text-zinc-700" size={40} />
                            <div className="font-mono text-xs tracking-widest uppercase animate-pulse">{progress}</div>
                        </div>
                    )}

                    {!progress && messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-700 gap-6 opacity-60">
                            <Fingerprint size={48} strokeWidth={1} />
                            <p className="text-sm font-mono tracking-widest uppercase text-green-500/50">Identity Kernel: ACTIVE</p>
                        </div>
                    )}
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] px-6 py-4 rounded-2xl backdrop-blur-md shadow-sm ${msg.role === 'user' ? 'bg-white text-black rounded-tr-sm' : 'bg-white/5 border border-white/5 text-zinc-200 rounded-tl-sm'
                                }`}>
                                {/* Use BlurText for AI responses to create "Thought Formation" effect */}
                                {msg.role === 'assistant' && i === messages.length - 1 ? (
                                    <BlurText text={msg.content} isUser={false} />
                                ) : (
                                    <div className="text-[15px] leading-7">{msg.content}</div>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>
                {/* Input */}
                <div className="p-8 bg-black/20 border-t border-white/5 backdrop-blur-xl">
                    <div className="relative flex items-center">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={progress ? "Loading Neural Weights..." : "Reflect on this..."}
                            disabled={!!progress || isLoading}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-white placeholder-zinc-600 focus:outline-none focus:border-white/20 transition-all"
                            autoFocus
                        />
                        <button onClick={handleSend} disabled={!!progress || isLoading || !input.trim()} className="absolute right-3 p-2 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-0"><Send size={18} /></button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
