import React, { useState, useEffect, useRef } from 'react';
import { CreateMLCEngine } from "@mlc-ai/web-llm";
import { ArrowLeft, Send, Zap } from 'lucide-react';
import MirrorLogo from '../components/MirrorLogo';
import { Link } from 'react-router-dom';

// Hardcoded Llama 3.2 1B for speed
const MODEL = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

export default function Demo() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([{ role: "assistant", content: "⟡ Intelligence Reflected. Ready." }]);
    const [isLoading, setIsLoading] = useState(false);
    const [engine, setEngine] = useState(null);
    const [progress, setProgress] = useState("");
    const [stats, setStats] = useState({ tps: 0 });
    const bottomRef = useRef(null);

    // 1. Initialize Engine
    useEffect(() => {
        async function init() {
            setProgress(`Initializing ${MODEL}...`);
            try {
                const eng = await CreateMLCEngine(MODEL, {
                    initProgressCallback: (report) => setProgress(report.text)
                });
                setEngine(eng);
                setProgress("");
            } catch (e) {
                setProgress(`Error: ${e.message}`);
            }
        }
        init();
    }, []);

    // 2. Auto-scroll
    useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

    // 3. Handle Chat
    const handleSend = async () => {
        if (!input.trim() || !engine) return;
        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

        try {
            const chunks = await engine.chat.completions.create({
                messages: [...messages, { role: "user", content: userMsg }],
                stream: true
            });
            let fullResponse = "";
            setMessages(prev => [...prev, { role: "assistant", content: "" }]);

            let startTime = performance.now();
            let tokens = 0;
            for await (const chunk of chunks) {
                const delta = chunk.choices[0]?.delta?.content || "";
                fullResponse += delta;
                tokens++;
                setMessages(prev => {
                    const newArr = [...prev];
                    newArr[newArr.length - 1].content = fullResponse;
                    return newArr;
                });
                if (tokens % 5 === 0) {
                    const elapsed = (performance.now() - startTime) / 1000;
                    setStats({ tps: Math.round(tokens / elapsed) });
                }
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: "assistant", content: `[ERROR]: ${err.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen bg-black text-white font-sans selection:bg-green-500/30 flex flex-col overflow-hidden">
            {/* BACKGROUND NOISE */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none"></div>

            {/* HEADER */}
            <header className="fixed top-0 inset-x-0 p-4 z-50 flex items-center justify-between pointer-events-none">
                <Link to="/" className="p-2 rounded-full bg-white/5 backdrop-blur border border-white/10 pointer-events-auto hover:bg-white/10 transition-colors">
                    <ArrowLeft size={16} />
                </Link>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur border border-white/10 text-[10px] font-mono text-zinc-400">
                    <Zap size={10} className={stats.tps > 0 ? "text-green-500" : "text-zinc-600"} />
                    {stats.tps > 0 ? `${stats.tps} T/s` : "IDLE"}
                </div>
            </header>

            {/* CENTER GLASS PANEL */}
            <div className="flex-1 max-w-2xl w-full mx-auto relative flex flex-col pt-20 pb-4 px-4 h-full">

                {/* LOADING OVERLAY */}
                {progress && (
                    <div className="absolute inset-x-4 top-20 z-50 p-6 rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl text-center shadow-2xl">
                        <MirrorLogo className="w-8 h-8 mx-auto mb-4 animate-spin-slow text-green-500" />
                        <div className="text-sm font-medium animate-pulse">{progress}</div>
                    </div>
                )}

                {/* MESSAGES */}
                <div className="flex-1 overflow-y-auto space-y-6 pb-4 no-scrollbar">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-4 rounded-2xl text-[15px] leading-relaxed backdrop-blur-sm ${msg.role === 'user'
                                    ? 'bg-white text-black shadow-lg font-medium'
                                    : 'bg-white/5 border border-white/10 text-zinc-200'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>

                {/* INPUT */}
                <div className="mt-auto">
                    <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-2xl focus-within:border-white/20 transition-colors">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Initialize instruction..."
                            disabled={isLoading || !!progress}
                            className="w-full bg-transparent p-4 pr-12 outline-none text-white placeholder-zinc-600 text-base"
                            autoFocus
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !!progress}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/10 text-white rounded-xl hover:bg-white/20 disabled:opacity-0 transition-all"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                    <div className="text-center mt-3 text-[10px] text-zinc-600 font-mono">
                        RUNNING LOCAL • {MODEL}
                    </div>
                </div>
            </div>
        </main>
    );
}
