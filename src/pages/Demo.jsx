import React, { useState, useEffect, useRef } from 'react';
import { CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";
import { ArrowLeft, Send, Zap, Trash2 } from 'lucide-react';
import MirrorLogo from '../components/MirrorLogo';
import { Link } from 'react-router-dom';

// Models - user can choose
const MODELS = [
    { id: "Qwen2.5-3B-Instruct-q4f16_1-MLC", name: "Qwen 2.5 3B", icon: "🌐", size: "1.9GB", desc: "Best multilingual" },
    { id: "Llama-3.2-3B-Instruct-q4f16_1-MLC", name: "Llama 3.2 3B", icon: "⟡", size: "1.8GB", desc: "Best reasoning" },
    { id: "Phi-3-mini-4k-instruct-q4f16_1-MLC", name: "Phi-3 Mini", icon: "◈", size: "2.2GB", desc: "Complex tasks" },
];

// Worker code as blob URL
const workerCode = `
import { WebWorkerMLCEngineHandler } from "https://esm.run/@mlc-ai/web-llm";
const handler = new WebWorkerMLCEngineHandler();
self.onmessage = (msg) => handler.onmessage(msg);
`;

export default function Demo() {
    const [selectedModel, setSelectedModel] = useState(null);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [engine, setEngine] = useState(null);
    const [progress, setProgress] = useState("");
    const [stats, setStats] = useState({ tps: 0 });
    const bottomRef = useRef(null);
    const workerRef = useRef(null);

    // Auto-scroll
    useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

    // Load model with Web Worker
    const loadModel = async (model) => {
        setSelectedModel(model);
        setProgress(`Loading ${model.name}...`);
        
        try {
            // Create worker from blob
            const blob = new Blob([workerCode], { type: 'application/javascript' });
            const workerUrl = URL.createObjectURL(blob);
            const worker = new Worker(workerUrl, { type: 'module' });
            workerRef.current = worker;

            const eng = await CreateWebWorkerMLCEngine(
                worker,
                model.id,
                {
                    initProgressCallback: (report) => {
                        const pct = Math.round(report.progress * 100);
                        setProgress(`${model.name}: ${pct}% - ${report.text}`);
                    }
                }
            );
            
            setEngine(eng);
            setProgress("");
            setMessages([{ role: "assistant", content: `⟡ ${model.name} ready. What's on your mind?` }]);
        } catch (e) {
            console.error("Engine error:", e);
            setProgress(`Error: ${e.message}`);
        }
    };

    // Cleanup worker on unmount
    useEffect(() => {
        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
            }
        };
    }, []);

    const handleClear = () => {
        setMessages([{ role: "assistant", content: "⟡ Ready." }]);
    };

    const handleSend = async () => {
        if (!input.trim() || !engine) return;
        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

        try {
            const chunks = await engine.chat.completions.create({
                messages: [...messages, { role: "user", content: userMsg }],
                stream: true,
                max_tokens: 500
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
            console.error("Generation error:", err);
            setMessages(prev => [...prev, { role: "assistant", content: `[ERROR]: ${err.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Model Selection Screen
    if (!selectedModel) {
        return (
            <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none"></div>
                
                <Link to="/" className="absolute top-4 left-4 p-2 rounded-full bg-white/5 backdrop-blur border border-white/10 hover:bg-white/10 transition-colors">
                    <ArrowLeft size={16} />
                </Link>

                <div className="text-center mb-12">
                    <MirrorLogo className="w-16 h-16 mx-auto mb-6 text-green-500" />
                    <h1 className="text-3xl font-bold mb-2">Active Mirror</h1>
                    <p className="text-zinc-400">Sovereign AI. Runs locally. You own it.</p>
                </div>

                <div className="grid gap-4 w-full max-w-md">
                    {MODELS.map(model => (
                        <button
                            key={model.id}
                            onClick={() => loadModel(model)}
                            className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur hover:bg-white/10 hover:border-green-500/50 transition-all text-left group"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-3xl">{model.icon}</span>
                                <div className="flex-1">
                                    <div className="font-semibold text-lg group-hover:text-green-400 transition-colors">{model.name}</div>
                                    <div className="text-sm text-zinc-400">{model.desc}</div>
                                </div>
                                <div className="text-sm text-zinc-500">{model.size}</div>
                            </div>
                        </button>
                    ))}
                </div>

                <p className="mt-8 text-xs text-zinc-600 text-center">
                    🔒 Everything runs in your browser. No data leaves your device.
                </p>
            </main>
        );
    }

    // Chat Screen
    return (
        <main className="relative min-h-screen bg-black text-white font-sans flex flex-col overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none"></div>

            {/* Header */}
            <header className="fixed top-0 inset-x-0 p-4 z-50 flex items-center justify-between pointer-events-none">
                <button 
                    onClick={() => { setSelectedModel(null); setEngine(null); setMessages([]); }}
                    className="p-2 rounded-full bg-white/5 backdrop-blur border border-white/10 pointer-events-auto hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft size={16} />
                </button>
                <div className="flex items-center gap-3 px-3 py-1 rounded-full bg-black/40 backdrop-blur border border-white/10 text-[10px] font-mono text-zinc-400 pointer-events-auto">
                    <button onClick={handleClear} className="hover:text-red-400 transition-colors" title="Clear">
                        <Trash2 size={12} />
                    </button>
                    <div className="w-px h-3 bg-white/10"></div>
                    <div className="flex items-center gap-2">
                        <Zap size={10} className={stats.tps > 0 ? "text-green-500" : "text-zinc-600"} />
                        {stats.tps > 0 ? `${stats.tps} T/s` : "IDLE"}
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 max-w-2xl w-full mx-auto flex flex-col pt-20 pb-4 px-4">

                {/* Loading */}
                {progress && (
                    <div className="absolute inset-x-4 top-20 z-50 p-6 rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl text-center">
                        <MirrorLogo className="w-8 h-8 mx-auto mb-4 animate-spin text-green-500" />
                        <div className="text-sm font-medium">{progress}</div>
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-6 pb-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-4 rounded-2xl text-[15px] leading-relaxed ${
                                msg.role === 'user'
                                    ? 'bg-white text-black font-medium'
                                    : 'bg-white/5 border border-white/10 text-zinc-200'
                            }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="mt-auto">
                    <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="What's on your mind?"
                            disabled={isLoading || !!progress}
                            className="w-full bg-transparent p-4 pr-12 outline-none text-white placeholder-zinc-600"
                            autoFocus
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !!progress}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-xl hover:bg-white/20 disabled:opacity-30 transition-all"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                    <div className="text-center mt-3 text-[10px] text-zinc-600 font-mono">
                        LOCAL • {selectedModel.name}
                    </div>
                </div>
            </div>
        </main>
    );
}
