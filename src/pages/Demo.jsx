import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Trash2, StopCircle, Plus, Sparkles, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Demo() {
    const [messages, setMessages] = useState(() => {
        try {
            const saved = localStorage.getItem("mirror_chat_v10");
            return saved ? JSON.parse(saved) : [];
        } catch (e) { return []; }
    });
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const abortController = useRef(null);

    // Persistence
    useEffect(() => {
        localStorage.setItem("mirror_chat_v10", JSON.stringify(messages));
    }, [messages]);

    // Debug mount
    useEffect(() => {
        console.log("⟡ Mirror v11.0 ETHEREAL Mounted");
    }, []);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    // Auto-resize textarea
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
        }
    }, [input]);

    const clearHistory = () => {
        if (confirm("Reset the reflection?")) {
            setMessages([]);
            setIsMenuOpen(false);
        }
    };

    const stopGeneration = () => {
        if (abortController.current) {
            abortController.current.abort();
            setIsLoading(false);
            setMessages(prev => {
                const newHistory = [...prev];
                const lastMsg = newHistory[newHistory.length - 1];
                if (lastMsg.role === "assistant" && !lastMsg.content.includes("[Interrupted]")) {
                    lastMsg.content += " ...";
                }
                return newHistory;
            });
        }
    };

    // Simple Markdown Parser
    const renderMarkdown = (text) => {
        if (!text) return null;
        return text.split(/(⟡)/).map((part, i) => {
            if (part === '⟡') return <span key={i} className="text-purple-400 font-bold mx-1 drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">⟡</span>;

            const formatted = part.split(/(\*\*.*?\*\*|\*.*?\*)/).map((chunk, j) => {
                if (chunk.startsWith('**') && chunk.endsWith('**')) {
                    return <strong key={j} className="text-white font-semibold transform-gpu text-shadow-sm">{chunk.slice(2, -2)}</strong>;
                }
                if (chunk.startsWith('*') && chunk.endsWith('*')) {
                    return <em key={j} className="text-purple-200/90 italic tracking-wide">{chunk.slice(1, -1)}</em>;
                }
                return chunk;
            });
            return <span key={i}>{formatted}</span>;
        });
    };

    async function handleSend(e) {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setInput("");
        if (inputRef.current) inputRef.current.style.height = 'auto';

        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

        // Placeholder for streaming
        setMessages(prev => [...prev, { role: "assistant", content: "" }]);

        try {
            abortController.current = new AbortController();
            const PROXY_URL = window.location.hostname === 'localhost'
                ? 'http://localhost:8082'
                : 'https://proxy.activemirror.ai';

            const response = await fetch(`${PROXY_URL}/mirror`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMsg,
                    history: messages.slice(-20).map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                    dial: 0.5
                }),
                signal: abortController.current.signal
            });

            if (!response.ok) throw new Error(`Server error: ${response.status}`);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const data = JSON.parse(line);
                        if (data.status === "chunk" || data.status === "ok") {
                            setMessages(prev => {
                                const newHistory = [...prev];
                                const lastMsg = newHistory[newHistory.length - 1];
                                if (lastMsg.role === "assistant") {
                                    lastMsg.content += data.content;
                                }
                                return newHistory;
                            });
                        } else if (data.status === "error" || data.status === "blocked") {
                            setMessages(prev => {
                                const newHistory = [...prev];
                                const lastMsg = newHistory[newHistory.length - 1];
                                lastMsg.content = data.content;
                                return newHistory;
                            });
                        }
                    } catch (e) { }
                }
            }
        } catch (err) {
            if (err.name === 'AbortError') {
                console.log('Use stopped generation');
            } else {
                console.error("Mirror Error:", err);
                setMessages(prev => {
                    const newHistory = [...prev];
                    const lastMsg = newHistory[newHistory.length - 1];
                    lastMsg.content = "⟡ The connection was severed.";
                    return newHistory;
                });
            }
        } finally {
            setIsLoading(false);
            abortController.current = null;
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 bg-black text-white flex flex-col font-sans overflow-hidden"
        >
            {/* AMBIENT AURORA BACKGROUND */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                        rotate: [0, 45, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black blur-3xl opacity-30"
                />
                <motion.div
                    animate={{
                        x: [-50, 50, -50],
                        y: [-20, 20, -20],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[100px]"
                />
            </div>

            {/* HEADER (Floating Glass) */}
            <header className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center">
                <Link to="/" className="group flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/5 hover:bg-white/10 transition-all hover:border-white/10">
                    <ArrowLeft size={16} className="text-zinc-400 group-hover:text-white transition-colors" />
                    <span className="text-sm font-medium text-zinc-300 group-hover:text-white">Exit</span>
                </Link>

                <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/5 shadow-2xl">
                    <span className="text-purple-400 text-lg animate-pulse" style={{ animationDuration: '3s' }}>⟡</span>
                    <span className="text-sm font-medium tracking-widest text-zinc-400 uppercase">Mirror</span>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`p-3 rounded-full transition-all ${isMenuOpen ? 'bg-white text-black' : 'bg-white/5 text-zinc-300 hover:bg-white/10'}`}
                    >
                        <Menu size={18} />
                    </button>

                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className="absolute top-full right-0 mt-2 w-48 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl z-50"
                            >
                                <button onClick={() => { setMessages([]); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-sm text-zinc-300 hover:text-white transition-colors">
                                    <Plus size={16} /> New Reflection
                                </button>
                                <div className="h-px bg-white/5 mx-4" />
                                <div className="px-4 py-2 text-[10px] text-zinc-600 uppercase tracking-widest text-center">
                                    v11.0 ETHEREAL
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </header>

            {/* CHAT AREA */}
            <div className="flex-1 overflow-y-auto px-4 pt-24 pb-32 scrollbar-hide z-10 relative">
                <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

                {messages.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full flex flex-col items-center justify-center text-center px-4"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="mb-8 relative"
                        >
                            <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
                            <span className="text-6xl relative z-10 text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">⟡</span>
                        </motion.div>
                        <h2 className="text-2xl font-light text-white mb-2 tracking-tight">The Mirror is clear.</h2>
                        <p className="text-zinc-500 max-w-sm font-light">
                            Speak to yourself. I will reflect what is true.
                        </p>
                    </motion.div>
                )}

                <AnimatePresence initial={false}>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className={`flex mb-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] md:max-w-2xl px-6 py-4 rounded-3xl leading-relaxed backdrop-blur-sm ${msg.role === 'user'
                                    ? 'bg-white/10 text-white rounded-tr-sm border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                                    : 'text-zinc-100'
                                }`}>
                                <div className={`whitespace-pre-wrap ${msg.role === 'assistant' ? 'font-light text-lg/relaxed' : 'font-normal'}`}>
                                    {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Loading Wave */}
                {isLoading && messages[messages.length - 1]?.content === "" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start px-2">
                        <div className="flex gap-1">
                            {[0, 1, 2].map(i => (
                                <motion.div
                                    key={i}
                                    animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                    className="w-1.5 h-1.5 bg-purple-400 rounded-full"
                                />
                            ))}
                        </div>
                    </motion.div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* FLOATING INPUT BAR */}
            <div className="absolute bottom-6 left-0 right-0 px-4 z-20 flex justify-center">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-full max-w-3xl relative"
                >
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl" />

                    <form onSubmit={handleSend} className="relative flex items-end gap-2 p-2">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Reflect..."
                            rows={1}
                            className="flex-1 bg-transparent border-none focus:ring-0 resize-none text-white placeholder-zinc-500 py-3 px-5 max-h-40 min-h-[48px] leading-relaxed text-lg"
                            autoFocus
                        />

                        {isLoading ? (
                            <button
                                type="button"
                                onClick={stopGeneration}
                                className="p-3 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 border border-red-500/30 transition-all active:scale-95 mb-1 mr-1"
                            >
                                <StopCircle size={20} fill="currentColor" className="opacity-50" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="p-3 bg-white text-black rounded-full hover:bg-zinc-200 disabled:opacity-0 disabled:scale-75 transition-all duration-300 mb-1 mr-1 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] active:scale-95"
                            >
                                <Send size={20} fill="currentColor" className="ml-0.5" />
                            </button>
                        )}
                    </form>
                </motion.div>
            </div>
        </motion.div>
    );
}
