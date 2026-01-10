import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Mirror1() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef(null);

    // Debug mount
    useEffect(() => {
        console.log("⟡ Mirror1 (v9.1) Mounted");
    }, []);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    async function handleSend(e) {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

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

            const data = await response.json();
            const content = data.content || "⟡ The mirror is clouded.";

            setMessages(prev => [...prev, { role: "assistant", content }]);
        } catch (err) {
            console.error("Mirror Error:", err);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "⟡ Connection lost. The mirror is silent."
            }]);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur z-10">
                <Link to="/" className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div className="flex items-center gap-2">
                    <span className="text-purple-400 text-xl">⟡</span>
                    <span className="font-medium tracking-wide">Mirror 1</span>
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30">v9.1 FRESH</span>
                </div>
                <div className="w-9"></div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 opacity-60 mt-20">
                        <div className="relative">
                            <span className="text-5xl text-purple-500/50">⟡</span>
                            <div className="absolute -bottom-2 -right-2 bg-zinc-800 text-xs px-1 rounded text-zinc-400">v9.1</div>
                        </div>
                        <p className="mt-4">Fresh Install. Speak.</p>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] md:max-w-2xl px-5 py-3 rounded-2xl ${msg.role === 'user'
                                ? 'bg-white text-black rounded-tr-sm'
                                : 'bg-white/10 text-zinc-100 rounded-tl-sm border border-white/5'
                            }`}>
                            <div className="whitespace-pre-wrap leading-relaxed">
                                {msg.role === 'assistant' ? (
                                    msg.content.split(/(⟡)/).map((part, idx) =>
                                        part === '⟡'
                                            ? <span key={idx} className="text-purple-400 font-bold mx-1">⟡</span>
                                            : part
                                    )
                                ) : msg.content}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
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
                <form onSubmit={handleSend} className="max-w-3xl mx-auto relative flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Reflect..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-4 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-white placeholder-zinc-500"
                        disabled={isLoading}
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="p-4 bg-white text-black rounded-full hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
