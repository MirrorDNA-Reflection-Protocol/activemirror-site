/**
 * ⟡ MIRROR AMBIENT — Ultimate Personal Assistant
 *
 * Features:
 * - Voice input (Web Speech API)
 * - Voice output (Text-to-Speech)
 * - Persistent memory (localStorage)
 * - Quick actions
 * - Sentiment-aware atmosphere
 * - Client-side safety layer + MirrorGate backend
 *
 * Models: Groq (Llama 3.3 70B) via MirrorGate proxy
 * Safety: EPISTEMIC_JUDGE + client-side filters
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Send, Sparkles, RotateCcw, Trash2,
    Mic, MicOff, Volume2, VolumeX, Settings, X,
    Zap, BookOpen, Languages, Code, Lightbulb, Shield
} from 'lucide-react';

const PROXY_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8082'
    : 'https://proxy.activemirror.ai';

// ============================================
// MODEL OPTIONS
// ============================================
const MODEL_OPTIONS = [
    {
        id: 'groq',
        name: 'Llama 3.3 70B',
        provider: 'Groq',
        description: 'Fast & free, great for most tasks',
        tier: 'fast_free',
        icon: '⚡',
        badge: 'Recommended'
    },
    {
        id: 'deepseek',
        name: 'DeepSeek V3',
        provider: 'DeepSeek',
        description: 'Best reasoning, very affordable',
        tier: 'budget',
        icon: '🧠',
        badge: 'Smartest'
    },
    {
        id: 'mistral',
        name: 'Mistral Large',
        provider: 'Mistral',
        description: 'European, fast function calling',
        tier: 'budget',
        icon: '🇪🇺',
        badge: null
    },
    {
        id: 'gpt4o',
        name: 'GPT-4o Mini',
        provider: 'OpenAI',
        description: 'Premium quality, costs more',
        tier: 'frontier',
        icon: '✨',
        badge: 'Premium'
    },
    {
        id: 'local',
        name: 'Local (Ollama)',
        provider: 'Your Device',
        description: '100% private, runs on your hardware',
        tier: 'sovereign',
        icon: '🔒',
        badge: 'Private'
    }
];

// ============================================
// SAFETY: Client-side content filters
// ============================================
const SAFETY_PATTERNS = {
    // Self-harm / crisis
    crisis: /\b(kill\s*(myself|me)|suicide|end\s*(my|it\s*all)|hurt\s*myself|self.?harm|want\s*to\s*die)\b/i,
    // Violence toward others
    violence: /\b(kill|murder|attack|bomb|shoot|stab)\s+(someone|people|them|him|her|you)\b/i,
    // Illegal activities
    illegal: /\b(make\s*(a\s*)?(bomb|weapon|drug)|hack\s*(into|someone)|steal\s*(from|identity))\b/i,
    // Child safety
    csam: /\b(child|minor|kid|underage).{0,20}(porn|nude|naked|sexual)\b/i,
};

const CRISIS_RESOURCES = {
    message: "I noticed you might be going through a difficult time. Please know that help is available.",
    resources: [
        { name: "National Suicide Prevention Lifeline", contact: "988 (US)" },
        { name: "Crisis Text Line", contact: "Text HOME to 741741" },
        { name: "International Association for Suicide Prevention", contact: "https://www.iasp.info/resources/Crisis_Centres/" }
    ]
};

const checkSafety = (text) => {
    const lower = text.toLowerCase();

    // Check for crisis language first (compassionate response)
    if (SAFETY_PATTERNS.crisis.test(lower)) {
        return { safe: false, type: 'crisis', showResources: true };
    }

    // Check for harmful content (block)
    if (SAFETY_PATTERNS.violence.test(lower)) {
        return { safe: false, type: 'violence', message: "I can't help with requests that could harm others." };
    }
    if (SAFETY_PATTERNS.illegal.test(lower)) {
        return { safe: false, type: 'illegal', message: "I can't assist with illegal activities." };
    }
    if (SAFETY_PATTERNS.csam.test(lower)) {
        return { safe: false, type: 'csam', message: "I cannot engage with this type of content." };
    }

    return { safe: true };
};

// ============================================
// MEMORY: Persistent user preferences
// ============================================
const MEMORY_KEY = 'mirror_ambient_memory';

const loadMemory = () => {
    try {
        const saved = localStorage.getItem(MEMORY_KEY);
        return saved ? JSON.parse(saved) : {
            userName: null,
            preferences: { voiceEnabled: false, voiceSpeed: 1 },
            facts: [], // Things user has told us about themselves
            sessionCount: 0,
            lastVisit: null
        };
    } catch {
        return { userName: null, preferences: {}, facts: [], sessionCount: 0 };
    }
};

const saveMemory = (memory) => {
    try {
        localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
    } catch (e) {
        console.warn('Could not save memory:', e);
    }
};

// Extract facts from conversation
const extractFacts = (userMessage, assistantResponse) => {
    const facts = [];
    const patterns = [
        { regex: /my name is (\w+)/i, type: 'name', extract: 1 },
        { regex: /i(?:'m| am) (?:a |an )?(\w+(?:\s+\w+)?)/i, type: 'identity', extract: 1 },
        { regex: /i work (?:as |at |in )(.+?)(?:\.|,|$)/i, type: 'work', extract: 1 },
        { regex: /i live in (.+?)(?:\.|,|$)/i, type: 'location', extract: 1 },
        { regex: /i(?:'m| am) interested in (.+?)(?:\.|,|$)/i, type: 'interest', extract: 1 },
    ];

    for (const { regex, type, extract } of patterns) {
        const match = userMessage.match(regex);
        if (match) {
            facts.push({ type, value: match[extract], timestamp: Date.now() });
        }
    }

    return facts;
};

// ============================================
// ATMOSPHERE: Sentiment and time-aware
// ============================================
const analyzeSentiment = (text) => {
    const lower = text.toLowerCase();
    const emotions = {
        joy: ['happy', 'excited', 'love', 'wonderful', 'amazing', 'great', 'awesome', 'fantastic', 'glad', 'thrilled'],
        sadness: ['sad', 'depressed', 'lonely', 'hurt', 'pain', 'crying', 'miss', 'lost', 'grief', 'down'],
        anger: ['angry', 'furious', 'frustrated', 'hate', 'annoyed', 'mad', 'irritated', 'pissed'],
        fear: ['scared', 'afraid', 'anxious', 'worried', 'nervous', 'panic', 'terrified', 'stressed'],
        hope: ['hope', 'dream', 'wish', 'future', 'maybe', 'possible', 'believe', 'optimistic'],
        calm: ['peaceful', 'calm', 'relaxed', 'content', 'serene', 'quiet', 'chill'],
        curiosity: ['wonder', 'curious', 'what if', 'why', 'how', 'interesting', 'question']
    };

    let detected = 'neutral';
    let maxScore = 0;
    for (const [emotion, words] of Object.entries(emotions)) {
        const score = words.filter(w => lower.includes(w)).length;
        if (score > maxScore) { maxScore = score; detected = emotion; }
    }
    return detected;
};

const emotionAtmospheres = {
    joy: { primary: '#fbbf24', secondary: '#f97316', glow: 'rgba(251, 191, 36, 0.25)' },
    sadness: { primary: '#3b82f6', secondary: '#6366f1', glow: 'rgba(59, 130, 246, 0.25)' },
    anger: { primary: '#ef4444', secondary: '#f97316', glow: 'rgba(239, 68, 68, 0.25)' },
    fear: { primary: '#8b5cf6', secondary: '#6366f1', glow: 'rgba(139, 92, 246, 0.25)' },
    hope: { primary: '#10b981', secondary: '#06b6d4', glow: 'rgba(16, 185, 129, 0.25)' },
    calm: { primary: '#06b6d4', secondary: '#8b5cf6', glow: 'rgba(6, 182, 212, 0.25)' },
    curiosity: { primary: '#f59e0b', secondary: '#ec4899', glow: 'rgba(245, 158, 11, 0.25)' },
    neutral: { primary: '#8b5cf6', secondary: '#06b6d4', glow: 'rgba(139, 92, 246, 0.25)' }
};

const getTimeAtmosphere = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 8) return { phase: 'dawn' };
    if (hour >= 8 && hour < 12) return { phase: 'morning' };
    if (hour >= 12 && hour < 17) return { phase: 'afternoon' };
    if (hour >= 17 && hour < 20) return { phase: 'evening' };
    if (hour >= 20 && hour < 23) return { phase: 'night' };
    return { phase: 'midnight' };
};

// Haptic feedback
const haptic = (pattern = 'light') => {
    if (!navigator.vibrate) return;
    const patterns = { light: [10], medium: [20], success: [10, 50, 10, 50, 30], error: [100, 50, 100] };
    navigator.vibrate(patterns[pattern] || patterns.light);
};

// ============================================
// COMPONENTS
// ============================================

// Floating particle
const Particle = ({ delay, atmosphere }) => {
    const size = Math.random() * 3 + 1;
    const startX = Math.random() * 100;
    const duration = Math.random() * 25 + 20;

    return (
        <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
                width: size, height: size, left: `${startX}%`,
                background: atmosphere.primary,
                boxShadow: `0 0 ${size * 2}px ${atmosphere.primary}40`
            }}
            initial={{ y: '100vh', opacity: 0 }}
            animate={{ y: '-100vh', opacity: [0, 0.5, 0.5, 0], x: [0, Math.random() * 40 - 20, 0] }}
            transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
        />
    );
};

// Message bubble
const MessageBubble = ({ message, atmosphere, onSpeak, voiceEnabled }) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
        >
            <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                    isSystem
                        ? 'bg-amber-500/10 border border-amber-500/20'
                        : isUser
                            ? 'bg-white/10 border border-white/10'
                            : 'bg-white/5 border border-white/5'
                }`}
                style={isUser ? { borderColor: `${atmosphere.primary}30`, boxShadow: `0 0 20px ${atmosphere.primary}10` } : {}}
            >
                {!isUser && !isSystem && (
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <span style={{ color: atmosphere.primary }} className="text-sm">⟡</span>
                            <span className="text-white/40 text-xs">Mirror</span>
                        </div>
                        {voiceEnabled && message.content && !message.isStreaming && (
                            <button
                                onClick={() => onSpeak(message.content)}
                                className="p-1 rounded text-white/30 hover:text-white/60 transition-colors"
                            >
                                <Volume2 size={14} />
                            </button>
                        )}
                    </div>
                )}
                {isSystem && (
                    <div className="flex items-center gap-2 mb-1">
                        <Shield size={14} className="text-amber-400" />
                        <span className="text-amber-400 text-xs">Safety Notice</span>
                    </div>
                )}
                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                    isSystem ? 'text-amber-200/90' : isUser ? 'text-white' : 'text-white/85'
                }`}>
                    {message.content}
                    {message.isStreaming && (
                        <span className="inline-block w-2 h-4 ml-1 bg-white/50 animate-pulse" />
                    )}
                </p>
                {message.resources && (
                    <div className="mt-3 pt-3 border-t border-amber-500/20 space-y-2">
                        {message.resources.map((r, i) => (
                            <div key={i} className="text-xs">
                                <span className="text-amber-300">{r.name}:</span>
                                <span className="text-amber-200/70 ml-2">{r.contact}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// Quick action button
const QuickAction = ({ icon: Icon, label, onClick, atmosphere }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-xs"
        style={{ borderColor: `${atmosphere.primary}20` }}
    >
        <Icon size={14} />
        <span>{label}</span>
    </button>
);

// Settings modal
const SettingsModal = ({ isOpen, onClose, memory, setMemory, voiceEnabled, setVoiceEnabled, selectedModel, setSelectedModel }) => {
    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-2xl p-5 max-h-[85vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-medium">Settings</h3>
                    <button onClick={onClose} className="text-white/40 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Model selection */}
                    <div>
                        <label className="text-white/50 text-xs block mb-2">AI Model</label>
                        <div className="space-y-2">
                            {MODEL_OPTIONS.map(model => (
                                <button
                                    key={model.id}
                                    onClick={() => {
                                        setSelectedModel(model.id);
                                        const updated = { ...memory, preferences: { ...memory.preferences, model: model.id } };
                                        setMemory(updated);
                                        saveMemory(updated);
                                    }}
                                    className={`w-full p-3 rounded-xl text-left transition-all ${
                                        selectedModel === model.id
                                            ? 'bg-violet-500/20 border-violet-500/50'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    } border`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{model.icon}</span>
                                            <div>
                                                <div className="text-white text-sm font-medium">{model.name}</div>
                                                <div className="text-white/40 text-xs">{model.provider}</div>
                                            </div>
                                        </div>
                                        {model.badge && (
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                                model.badge === 'Recommended' ? 'bg-green-500/20 text-green-400' :
                                                model.badge === 'Smartest' ? 'bg-blue-500/20 text-blue-400' :
                                                model.badge === 'Premium' ? 'bg-amber-500/20 text-amber-400' :
                                                model.badge === 'Private' ? 'bg-violet-500/20 text-violet-400' :
                                                'bg-white/10 text-white/60'
                                            }`}>
                                                {model.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-white/30 text-xs mt-1 ml-7">{model.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Voice toggle */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <span className="text-white/70 text-sm">Voice Output</span>
                        <button
                            onClick={() => setVoiceEnabled(!voiceEnabled)}
                            className={`w-12 h-6 rounded-full transition-colors ${voiceEnabled ? 'bg-violet-500' : 'bg-white/20'}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${voiceEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="text-white/50 text-xs block mb-1">Your Name</label>
                        <input
                            type="text"
                            value={memory.userName || ''}
                            onChange={(e) => {
                                const updated = { ...memory, userName: e.target.value || null };
                                setMemory(updated);
                                saveMemory(updated);
                            }}
                            placeholder="Optional"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/20"
                        />
                    </div>

                    {/* Memory info */}
                    <div className="pt-3 border-t border-white/10">
                        <p className="text-white/40 text-xs mb-2">Memory</p>
                        <p className="text-white/60 text-xs">
                            Sessions: {memory.sessionCount} · Facts remembered: {memory.facts?.length || 0}
                        </p>
                        <button
                            onClick={() => {
                                const cleared = { userName: null, preferences: { model: 'groq' }, facts: [], sessionCount: 0 };
                                setMemory(cleared);
                                saveMemory(cleared);
                            }}
                            className="mt-2 text-red-400 text-xs hover:text-red-300"
                        >
                            Clear all memory
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================
const MirrorAmbient = () => {
    const [timeAtmosphere] = useState(getTimeAtmosphere);
    const [emotionAtmosphere, setEmotionAtmosphere] = useState(emotionAtmospheres.neutral);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [memory, setMemory] = useState(loadMemory);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [selectedModel, setSelectedModel] = useState(() => {
        const saved = loadMemory();
        return saved.preferences?.model || 'groq';
    });

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Get current model info
    const currentModel = MODEL_OPTIONS.find(m => m.id === selectedModel) || MODEL_OPTIONS[0];
    const recognitionRef = useRef(null);

    // Generate particles
    const particles = useMemo(() =>
        Array.from({ length: 15 }, (_, i) => ({ id: i, delay: i * 1.2 }))
    , []);

    // Blend atmospheres
    const atmosphere = useMemo(() => ({
        ...emotionAtmosphere,
        phase: timeAtmosphere.phase
    }), [emotionAtmosphere, timeAtmosphere]);

    // Initialize speech recognition
    useEffect(() => {
        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                setInput(transcript);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };
        }
    }, []);

    // Update session count on mount
    useEffect(() => {
        const updated = {
            ...memory,
            sessionCount: (memory.sessionCount || 0) + 1,
            lastVisit: new Date().toISOString()
        };
        setMemory(updated);
        saveMemory(updated);
    }, []);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Sentiment analysis on input
    useEffect(() => {
        if (input.length > 10) {
            const emotion = analyzeSentiment(input);
            setEmotionAtmosphere(emotionAtmospheres[emotion]);
        }
    }, [input]);

    // Voice input toggle
    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert('Speech recognition not supported in this browser');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
            haptic('medium');
        }
    };

    // Text-to-speech
    const speak = useCallback((text) => {
        if (!voiceEnabled || !('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = memory.preferences?.voiceSpeed || 1;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    }, [voiceEnabled, memory.preferences?.voiceSpeed]);

    // Build context from memory
    const buildContext = () => {
        let context = '';
        if (memory.userName) {
            context += `The user's name is ${memory.userName}. `;
        }
        if (memory.facts?.length > 0) {
            const recentFacts = memory.facts.slice(-5);
            context += `Known facts about the user: ${recentFacts.map(f => `${f.type}: ${f.value}`).join(', ')}. `;
        }
        return context;
    };

    // Submit message
    const handleSubmit = async () => {
        const text = input.trim();
        if (!text || isLoading) return;

        haptic('medium');
        setError(null);

        // CLIENT-SIDE SAFETY CHECK
        const safetyCheck = checkSafety(text);
        if (!safetyCheck.safe) {
            if (safetyCheck.type === 'crisis') {
                // Show compassionate response with resources
                setMessages(prev => [...prev,
                    { role: 'user', content: text },
                    {
                        role: 'system',
                        content: CRISIS_RESOURCES.message,
                        resources: CRISIS_RESOURCES.resources
                    }
                ]);
                setInput('');
                haptic('medium');
                return;
            } else {
                // Block harmful content
                setMessages(prev => [...prev,
                    { role: 'user', content: text },
                    { role: 'system', content: safetyCheck.message }
                ]);
                setInput('');
                haptic('error');
                return;
            }
        }

        // Detect emotion
        const emotion = analyzeSentiment(text);
        setEmotionAtmosphere(emotionAtmospheres[emotion]);

        // Add user message
        const userMessage = { role: 'user', content: text };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        // Add placeholder
        setMessages([...newMessages, { role: 'assistant', content: '', isStreaming: true }]);

        try {
            // Build message context with memory
            const contextPrefix = buildContext();
            const messagesForAPI = newMessages.slice(-10).map(m => ({
                role: m.role === 'system' ? 'user' : m.role, // Convert system to user for API
                content: m.content
            }));

            // Prepend context to first message if we have memory
            if (contextPrefix && messagesForAPI.length > 0) {
                messagesForAPI[0] = {
                    ...messagesForAPI[0],
                    content: `[Context: ${contextPrefix}]\n\n${messagesForAPI[0].content}`
                };
            }

            const response = await fetch(`${PROXY_URL}/mirror`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: messagesForAPI,
                    tier: currentModel.tier,
                    model: selectedModel
                }),
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim());

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (data.status === 'chunk' && data.content) {
                            fullContent += data.content;
                            setMessages(prev => {
                                const updated = [...prev];
                                updated[updated.length - 1] = {
                                    role: 'assistant',
                                    content: fullContent,
                                    isStreaming: true
                                };
                                return updated;
                            });
                        } else if (data.status === 'done') {
                            setMessages(prev => {
                                const updated = [...prev];
                                updated[updated.length - 1] = {
                                    role: 'assistant',
                                    content: fullContent || data.response || '',
                                    isStreaming: false
                                };
                                return updated;
                            });
                        }
                    } catch (e) {
                        if (line.trim() && !line.includes('{')) {
                            fullContent += line;
                        }
                    }
                }
            }

            // Finalize
            setMessages(prev => {
                const updated = [...prev];
                if (updated[updated.length - 1]?.isStreaming) {
                    updated[updated.length - 1] = {
                        role: 'assistant',
                        content: fullContent || 'I received your message.',
                        isStreaming: false
                    };
                }
                return updated;
            });

            // Extract and save facts from conversation
            const newFacts = extractFacts(text, fullContent);
            if (newFacts.length > 0) {
                const updatedMemory = {
                    ...memory,
                    facts: [...(memory.facts || []), ...newFacts].slice(-20) // Keep last 20 facts
                };
                // Check for name
                const nameFact = newFacts.find(f => f.type === 'name');
                if (nameFact) {
                    updatedMemory.userName = nameFact.value;
                }
                setMemory(updatedMemory);
                saveMemory(updatedMemory);
            }

            // Speak response if enabled
            if (voiceEnabled && fullContent) {
                speak(fullContent);
            }

            haptic('success');
        } catch (err) {
            console.error('API Error:', err);
            setError(err.message);
            setMessages(prev => prev.filter(m => !m.isStreaming));
            haptic('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const clearChat = () => {
        setMessages([]);
        setError(null);
        window.speechSynthesis?.cancel();
        haptic('light');
    };

    // Quick actions
    const quickActions = [
        { icon: Lightbulb, label: 'Brainstorm', prompt: 'Help me brainstorm ideas for ' },
        { icon: BookOpen, label: 'Explain', prompt: 'Explain this concept simply: ' },
        { icon: Languages, label: 'Translate', prompt: 'Translate this to Spanish: ' },
        { icon: Code, label: 'Code', prompt: 'Write code to ' },
        { icon: Zap, label: 'Summarize', prompt: 'Summarize this: ' },
    ];

    const handleQuickAction = (prompt) => {
        setInput(prompt);
        inputRef.current?.focus();
    };

    // Greeting based on memory
    const getGreeting = () => {
        const hour = new Date().getHours();
        const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
        if (memory.userName) {
            return `${timeGreeting}, ${memory.userName}!`;
        }
        return `${timeGreeting}!`;
    };

    return (
        <div className="fixed inset-0 bg-black flex flex-col" style={{ height: '100dvh' }}>
            {/* Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {particles.map(p => <Particle key={p.id} delay={p.delay} atmosphere={atmosphere} />)}
            </div>

            {/* Background gradient */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ background: `radial-gradient(circle at 50% 20%, ${atmosphere.primary}20, transparent 50%)` }}
                transition={{ duration: 1.5 }}
            />

            {/* Ambient glow */}
            <motion.div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none blur-[120px]"
                animate={{ backgroundColor: atmosphere.glow }}
                transition={{ duration: 1.5 }}
            />

            {/* Header */}
            <header className="relative z-20 flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <a href="/" className="p-2 rounded-full bg-white/10 text-white/60 active:scale-95 transition-transform">
                        <ArrowLeft size={18} />
                    </a>
                    <div className="flex items-center gap-2">
                        <motion.span
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            style={{ color: atmosphere.primary, textShadow: `0 0 20px ${atmosphere.primary}` }}
                            className="text-xl"
                        >
                            ⟡
                        </motion.span>
                        <div>
                            <span className="text-white/80 font-medium">Mirror</span>
                            <span className="text-white/30 text-xs ml-2">{currentModel.icon} {currentModel.name}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Sparkles size={12} style={{ color: atmosphere.primary }} className="animate-pulse" />
                    <span className="text-white/30 text-xs uppercase tracking-widest hidden sm:inline">{atmosphere.phase}</span>
                    <button
                        onClick={() => setShowSettings(true)}
                        className="ml-2 p-2 rounded-full bg-white/5 text-white/40 hover:text-white/60 transition-colors"
                    >
                        <Settings size={14} />
                    </button>
                    {messages.length > 0 && (
                        <button
                            onClick={clearChat}
                            className="p-2 rounded-full bg-white/5 text-white/40 hover:text-white/60 transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </header>

            {/* Messages area */}
            <main className="relative z-10 flex-1 overflow-y-auto px-4 py-4">
                {messages.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="h-full flex flex-col items-center justify-center text-center px-4"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="text-6xl mb-6"
                            style={{ color: atmosphere.primary, textShadow: `0 0 40px ${atmosphere.primary}` }}
                        >
                            ⟡
                        </motion.div>
                        <h2 className="text-white/70 text-xl font-light mb-2">{getGreeting()}</h2>
                        <p className="text-white/30 text-sm max-w-xs mb-6">
                            I'm here to chat, help think through ideas, answer questions, or just listen.
                        </p>

                        {/* Quick actions */}
                        <div className="flex flex-wrap justify-center gap-2 max-w-md">
                            {quickActions.map((action, i) => (
                                <QuickAction
                                    key={i}
                                    icon={action.icon}
                                    label={action.label}
                                    onClick={() => handleQuickAction(action.prompt)}
                                    atmosphere={atmosphere}
                                />
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <div className="max-w-2xl mx-auto">
                        <AnimatePresence>
                            {messages.map((message, index) => (
                                <MessageBubble
                                    key={index}
                                    message={message}
                                    atmosphere={atmosphere}
                                    onSpeak={speak}
                                    voiceEnabled={voiceEnabled}
                                />
                            ))}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                    </div>
                )}

                {/* Error */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl mx-auto mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
                    >
                        <p className="text-red-400 text-sm text-center">
                            {error}
                            <button onClick={() => setError(null)} className="ml-2 text-red-300 underline">Dismiss</button>
                        </p>
                    </motion.div>
                )}
            </main>

            {/* Input area */}
            <div
                className="relative z-20 p-4 border-t border-white/5"
                style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)', background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.7))' }}
            >
                <div className="max-w-2xl mx-auto relative flex gap-2">
                    {/* Voice input button */}
                    <button
                        onClick={toggleListening}
                        className={`p-3 rounded-xl transition-all ${
                            isListening
                                ? 'bg-red-500/30 text-red-400'
                                : 'bg-white/5 text-white/40 hover:text-white/60'
                        }`}
                    >
                        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>

                    {/* Input */}
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isListening ? "Listening..." : "Ask anything..."}
                            disabled={isLoading}
                            className="w-full px-4 py-3 pr-14 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 resize-none focus:outline-none focus:border-white/20 text-base transition-all disabled:opacity-50"
                            style={{
                                minHeight: '52px', maxHeight: '150px',
                                borderColor: input.length > 10 ? `${atmosphere.primary}40` : undefined
                            }}
                            rows={1}
                        />
                        <motion.button
                            onClick={handleSubmit}
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 bottom-2 p-2.5 rounded-xl text-white/60 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                            style={{ background: input.trim() && !isLoading ? `${atmosphere.primary}40` : 'rgba(255,255,255,0.1)' }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {isLoading ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                    <RotateCcw size={18} />
                                </motion.div>
                            ) : (
                                <Send size={18} />
                            )}
                        </motion.button>
                    </div>

                    {/* Voice output toggle */}
                    <button
                        onClick={() => setVoiceEnabled(!voiceEnabled)}
                        className={`p-3 rounded-xl transition-all ${
                            voiceEnabled
                                ? 'bg-violet-500/30 text-violet-400'
                                : 'bg-white/5 text-white/40 hover:text-white/60'
                        }`}
                        title={voiceEnabled ? "Voice on" : "Voice off"}
                    >
                        {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                </div>
                <div className="max-w-2xl mx-auto flex items-center justify-center gap-2 mt-2">
                    <Shield size={10} className="text-white/20" />
                    <p className="text-white/20 text-xs">Protected by MirrorGate</p>
                </div>
            </div>

            {/* Settings modal */}
            <AnimatePresence>
                {showSettings && (
                    <SettingsModal
                        isOpen={showSettings}
                        onClose={() => setShowSettings(false)}
                        memory={memory}
                        setMemory={setMemory}
                        voiceEnabled={voiceEnabled}
                        setVoiceEnabled={setVoiceEnabled}
                        selectedModel={selectedModel}
                        setSelectedModel={setSelectedModel}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default MirrorAmbient;
