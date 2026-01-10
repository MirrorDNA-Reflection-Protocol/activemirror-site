import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Trash2 } from 'lucide-react';
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
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    // Persistence
    useEffect(() => {
        localStorage.setItem("mirror_chat_v10", JSON.stringify(messages));
    }, [messages]);

    // Debug mount
    useEffect(() => {
        console.log("⟡ Mirror v10.1 ELEGANCE Mounted");
    }, []);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    // Auto-resize textarea
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
        }
    }, [input]);

    const clearHistory = () => {
        if (confirm("Clear reflection history?")) {
            setMessages([]);
        }
    };

    // Simple Markdown Parser
    const renderMarkdown = (text) => {
        if (!text) return null;
        return text.split(/(⟡)/).map((part, i) => {
            if (part === '⟡') return <span key={i} className="text-purple-400 font-bold mx-1">⟡</span>;

            const formatted = part.split(/(\*\*.*?\*\*|\*.*?\*)/).map((chunk, j) => {
                if (chunk.startsWith('**') && chunk.endsWith('**')) {
                    return <strong key={j} className="text-white font-semibold">{chunk.slice(2, -2)}</strong>;
                }
                if (chunk.startsWith('*') && chunk.endsWith('*')) {
                    return <em key={j} className="text-purple-200/90 italic">{chunk.slice(1, -1)}</em>;
                }
                return chunk;
            });
            return <span key={i}>{formatted}</span>;
        });
    };

    async function handleSend(e) {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setInput("");
        if (inputRef.current) inputRef.current.style.height = 'auto';

        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

        // Placeholder for streaming
        setMessages(prev => [...prev, { role: "assistant", content: "" }]);

        try {
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
                })
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
                    } catch (e) { console.error(e); }
                }
            }
        } catch (err) {
            console.error("Mirror Error:", err);
            setMessages(prev => {
                const newHistory = [...prev];
                const lastMsg = newHistory[newHistory.length - 1];
                lastMsg.content = "⟡ Connection lost. The mirror is silent.";
                return newHistory;
            });
        } finally {
            setIsLoading(false);
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-purple-500/30"
        >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-xl z-10">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="text-purple-400 text-xl shadow-purple-500/50 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">⟡</span>
                        <span className="font-medium tracking-wide text-zinc-200">Mirror</span>
                    </div>
                </div>

                <button onClick={clearHistory} className="p-2 hover:bg-white/10 rounded-full text-zinc-600 hover:text-red-400 transition-colors" title="Clear History">
                    <Trash2 size={18} />
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide">
                <style>{`
                    .scrollbar-hide::-webkit-scrollbar { display: none; }
                    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>

                {messages.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 0.6, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="h-full flex flex-col items-center justify-center text-zinc-500 mt-20"
                    >
                        <span className="text-4xl mb-6 text-purple-500/40 animate-pulse">⟡</span>
                        <p className="font-light tracking-widest text-sm uppercase">Reflect</p>
                    </motion.div>
                )}

                <AnimatePresence initial={false}>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[90%] md:max-w-2xl px-6 py-4 rounded-2xl leading-relaxed ${msg.role === 'user'
                                    ? 'bg-zinc-100 text-black rounded-tr-sm shadow-lg shadow-white/5'
                                    : 'bg-white/5 text-zinc-200 rounded-tl-sm border border-white/5 shadow-2xl'
                                }`}>
                                <div className={`whitespace-pre-wrap ${msg.role === 'assistant' ? 'font-light' : 'font-normal'}`}>
                                    {msg.role === 'assistant'
                                        ? renderMarkdown(msg.content)
                                        : msg.content
                                    }
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Loading Indicator */}
                {isLoading && messages[messages.length - 1]?.content === "" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="px-6 py-4 rounded-2xl bg-white/5 border border-white/5 rounded-tl-sm">
                            <span className="text-purple-400 text-2xl glyph-pulse">⟡</span>
                        </div>
                    </motion.div>
                )}

                <div ref={bottomRef} className="h-4" />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-black sticky bottom-0">
                <form onSubmit={handleSend} className="max-w-3xl mx-auto relative flex items-end gap-3 bg-zinc-900/50 border border-white/10 rounded-[2rem] p-2 focus-within:bg-zinc-900 focus-within:border-purple-500/30 transition-all duration-300 shadow-2xl">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Reflect..."
                        rows={1}
                        className="flex-1 bg-transparent border-none focus:ring-0 resize-none text-zinc-200 placeholder-zinc-600 py-3 px-5 max-h-40 min-h-[48px] leading-relaxed"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || (isLoading && messages[messages.length - 1]?.role !== 'assistant')}
                        className="p-3 bg-white text-black rounded-full hover:bg-zinc-200 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200 mb-1 mr-1 shadow-lg hover:scale-105 active:scale-95"
                    >
                        <Send size={18} fill="currentColor" className="ml-0.5" />
                    </button>
                </form>
            </div>
        </motion.div>
    );
}
