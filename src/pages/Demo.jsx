import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

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
        console.log("⟡ Mirror v10.0 POLISH Mounted");
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
        // Split by ⟡ first to handle glyphs separately
        return text.split(/(⟡)/).map((part, i) => {
            if (part === '⟡') return <span key={i} className="text-purple-400 font-bold mx-1">⟡</span>;

            // Handle bold (**text**) and italic (*text*)
            // Note: This is a very simple parser. For full MD use a library.
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
        // Reset height
        if (inputRef.current) inputRef.current.style.height = 'auto';

        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

        // Placeholder for streaming response
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

                        // Handle different statuses
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
                                lastMsg.content = data.content; // Replace with error message
                                return newHistory;
                            });
                        }
                    } catch (e) {
                        console.error("Parse error", e);
                    }
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
            // Re-focus input after stream ends (optional, usually better to leave focus alone)
            // inputRef.current?.focus(); 
        }
    }

    // Handle Enter key in textarea
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur z-10">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="text-purple-400 text-xl">⟡</span>
                        <span className="font-medium tracking-wide">Mirror</span>
                        <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded border border-purple-500/30">v10.0 STREAM</span>
                    </div>
                </div>

                <button onClick={clearHistory} className="p-2 hover:bg-white/10 rounded-full text-zinc-500 hover:text-red-400 transition-colors" title="Clear History">
                    <Trash2 size={18} />
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 opacity-60 mt-20">
                        <span className="text-4xl mb-4 text-purple-500/50 animate-pulse">⟡</span>
                        <p>Reflect.</p>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] md:max-w-2xl px-5 py-3 rounded-2xl ${msg.role === 'user'
                                ? 'bg-white text-black rounded-tr-sm'
                                : 'bg-white/10 text-zinc-100 rounded-tl-sm border border-white/5'
                            }`}>
                            <div className="whitespace-pre-wrap leading-relaxed">
                                {msg.role === 'assistant'
                                    ? renderMarkdown(msg.content)
                                    : msg.content
                                }
                            </div>
                        </div>
                    </div>
                ))}

                {/* Loading Indicator (Only show if total wait, not during stream) */}
                {isLoading && messages[messages.length - 1]?.content === "" && (
                    <div className="flex justify-start">
                        <div className="px-6 py-4 rounded-2xl bg-white/5 border border-white/5 rounded-tl-sm">
                            <span className="text-purple-400 text-2xl glyph-pulse">⟡</span>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} className="h-4" />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-black sticky bottom-0">
                <form onSubmit={handleSend} className="max-w-3xl mx-auto relative flex items-end gap-2 bg-white/5 border border-white/10 rounded-3xl p-2 focus-within:bg-white/10 focus-within:border-purple-500/50 transition-all">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Reflect..."
                        rows={1}
                        className="flex-1 bg-transparent border-none focus:ring-0 resize-none text-white placeholder-zinc-500 py-3 px-4 max-h-32"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || (isLoading && messages[messages.length - 1]?.role !== 'assistant')}
                        className="p-3 bg-white text-black rounded-full hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-1 mr-1"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
