import React, { useState, useEffect, useRef } from 'react';
import { CreateMLCEngine } from "@mlc-ai/web-llm";
import { ArrowLeft, Send, Cpu, Activity, Zap, Terminal } from 'lucide-react';
import MirrorLogo from '../components/MirrorLogo';

const MODELS = {
    mobile: "Qwen2.5-0.5B-Instruct-q4f16_1-MLC", // Fast, lightweight
    desktop: "Llama-3-8B-Instruct-q4f32_1-MLC" // Powerful
};

export default function Demo() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([{ role: "assistant", content: "⟡ Active MirrorOS Online. Systems Nominal. Ready for input." }]);
    const [isLoading, setIsLoading] = useState(false);
    const [engine, setEngine] = useState(null);
    const [progress, setProgress] = useState("");
    const [stats, setStats] = useState({ tps: 0, ram: "0GB" });
    const bottomRef = useRef(null);

    // 1. Initialize Engine (The Brain)
    useEffect(() => {
        async function init() {
            const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
            const model = isMobile ? MODELS.mobile : MODELS.desktop;

            setProgress(`Initializing ${model}...`);
            const eng = await CreateMLCEngine(model, {
                initProgressCallback: (report) => setProgress(report.text)
            });
            setEngine(eng);
            setProgress("");
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
                // Update UI with stream
                setMessages(prev => {
                    const newArr = [...prev];
                    newArr[newArr.length - 1].content = fullResponse;
                    return newArr;
                });
                // Fake stats update
                if (tokens % 5 === 0) {
                    const elapsed = (performance.now() - startTime) / 1000;
                    setStats({ tps: Math.round(tokens / elapsed), ram: "1.2GB" });
                }
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: "assistant", content: `[ERROR]: ${err.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        /* MAIN GRID */
        <main className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 relative min-h-screen bg-black text-white font-sans selection:bg-green-500/30">
            {/* BACKGROUND NOISE */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none"></div>

            {/* LEFT TELEMETRY (Hidden on Mobile) */}
            <div className="hidden md:flex flex-col gap-4">
                <div className="flex-1 rounded-2xl border border-white/10 bg-zinc-900/30 p-4 backdrop-blur-sm">
                    <h3 className="text-xs text-zinc-500 mb-4 flex items-center gap-2"><Zap size={12} /> PERFORMANCE</h3>
                    <div className="text-4xl font-bold mb-1">{stats.tps}</div>
                    <div className="text-xs text-green-400 mb-6">TOKENS / SEC</div>
                    <div className="h-px bg-white/5 mb-6"></div>
                    <div className="text-sm text-zinc-400 mb-2">MEMORY FOOTPRINT</div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full w-[40%] animate-pulse"></div>
                    </div>
                    <div className="text-right text-xs mt-1 text-zinc-500">{stats.ram} / 16GB</div>
                </div>
            </div>

            {/* CENTER CHAT (The Stream) */}
            <div className="col-span-1 md:col-span-2 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl flex flex-col relative overflow-hidden h-[90vh] md:h-auto">
                {/* LOADING OVERLAY */}
                {progress && (
                    <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-8 text-center">
                        <MirrorLogo className="w-12 h-12 mb-6 animate-spin-slow" />
                        <div className="text-green-500 text-sm animate-pulse">{progress}</div>
                        <p className="text-zinc-600 text-xs mt-2">Downloading weights to browser cache...</p>
                    </div>
                )}
                {/* MESSAGES */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-white text-black'
                                    : 'bg-zinc-900 border border-white/10 text-zinc-300'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>
                {/* INPUT */}
                <div className="p-4 border-t border-white/10 bg-zinc-900/50">
                    <div className="flex gap-2">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Input command..."
                            disabled={isLoading || !!progress}
                            className="flex-1 bg-transparent border-none outline-none text-white placeholder-zinc-600 font-sans"
                            autoFocus
                        />
                        <button onClick={handleSend} disabled={isLoading || !!progress} className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 disabled:opacity-50">
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT LOGS (Hidden on Mobile) */}
            <div className="hidden md:flex flex-col gap-4">
                <div className="flex-1 rounded-2xl border border-white/10 bg-zinc-900/30 p-4 backdrop-blur-sm font-mono text-[10px] text-zinc-600 overflow-hidden">
                    <h3 className="text-xs text-zinc-500 mb-4 flex items-center gap-2"><Terminal size={12} /> SYSTEM_LOGS</h3>
                    <div className="space-y-1 opacity-70">
                        <p>&gt; init_sequence_start</p>
                        <p>&gt; neural_engine: DETECTED</p>
                        <p>&gt; memory_safe_mode: ACTIVE</p>
                        {progress ? <p className="text-yellow-500">&gt; downloading_weights...</p> : <p className="text-green-500">&gt; model_ready</p>}
                        {messages.length > 1 && <p>&gt; inference_stream_active</p>}
                    </div>
                </div>
            </div>
        </main>
    );
}
