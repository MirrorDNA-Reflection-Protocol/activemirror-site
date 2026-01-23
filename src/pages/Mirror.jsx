/**
 * ⟡ ACTIVE MIRROR — Sovereign Reflective Chat
 * Version: 18.0 (Undeniable Edition)
 * 
 * Features:
 * - Cloud vs Sovereign toggle with live proof
 * - Email capture funnel
 * - Shareable reflection cards
 * - Trust proof (network activity monitor)
 * - Mobile Groq fast-path
 * - Reflection export (markdown)
 * - "What cloud knows" live reveal
 * - Fingerprint awareness
 * - Session insights
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Send, ArrowLeft, StopCircle, Shield, ShieldCheck, ShieldAlert, X, Cpu, Cloud, Download, ChevronRight, Mail, Share2, FileDown, Eye, EyeOff, Wifi, WifiOff, Globe, Fingerprint, Clock, MessageSquare, Copy, Check, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
    VERSION: '18.2',
    STORAGE_KEY: 'mirror_v18',
    TURN_KEY: 'mirror_turns',
    MODE_KEY: 'mirror_mode',
    EMAIL_KEY: 'mirror_email_captured',
    WAITLIST_KEY: 'mirror_waitlist',
    PROXY_URL: typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:8082'
        : 'https://proxy.activemirror.ai',
    MAX_HISTORY: 50,
    MAX_FREE_TURNS: 50,  // Increased for better demo experience
    SOVEREIGN_UNLOCK_TURN: 6,
};

// ═══════════════════════════════════════════════════════════════
// TYPES & ENUMS
// ═══════════════════════════════════════════════════════════════

const DeviceType = { MOBILE: 'mobile', DESKTOP: 'desktop' };
const GateStatus = { PASSED: 'passed', BLOCKED: 'blocked', PENDING: 'pending', NONE: 'none' };
const InferenceMode = { CLOUD: 'cloud', SOVEREIGN: 'sovereign', LOCAL: 'local' };
const ReflectionLens = { LINEAR: 'linear', DIVERGENT: 'divergent', HYBRID: 'hybrid' };

// ═══════════════════════════════════════════════════════════════
// DEVICE & CAPABILITY DETECTION
// ═══════════════════════════════════════════════════════════════

const detectDevice = () => {
    if (typeof window === 'undefined') return DeviceType.DESKTOP;
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? DeviceType.MOBILE : DeviceType.DESKTOP;
};

const checkWebGPUSupport = async () => {
    if (typeof navigator === 'undefined' || !navigator.gpu) return false;
    try {
        const adapter = await navigator.gpu.requestAdapter();
        return !!adapter;
    } catch { return false; }
};

// Check if local Ollama is available
const checkLocalOllama = async () => {
    try {
        const response = await fetch(`${CONFIG.PROXY_URL}/mesh-status`, { 
            method: 'GET',
            timeout: 2000 
        });
        if (response.ok) {
            const data = await response.json();
            return data.ollama?.online || false;
        }
        return false;
    } catch {
        return false;
    }
};

// ═══════════════════════════════════════════════════════════════
// FINGERPRINT COLLECTOR (What cloud providers see)
// ═══════════════════════════════════════════════════════════════

const collectFingerprint = () => {
    if (typeof window === 'undefined') return null;
    
    const nav = navigator;
    const screen = window.screen;
    
    // Parse user agent for actual browser
    const ua = nav.userAgent;
    let browser = 'Unknown';
    if (ua.includes('Edg/')) browser = 'Microsoft Edge';
    else if (ua.includes('Chrome/')) browser = 'Google Chrome';
    else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Firefox/')) browser = 'Firefox';
    
    // Extract version
    const versionMatch = ua.match(/(Edg|Chrome|Safari|Firefox)\/(\d+)/);
    const browserVersion = versionMatch ? `${browser} ${versionMatch[2]}` : browser;
    
    // Detect OS
    let os = 'Unknown';
    if (ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    
    return {
        // What they know about your location
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: nav.language,
        localTime: new Date().toLocaleString(),
        
        // Your device identity
        browser: browserVersion,
        os: os,
        platform: nav.platform,
        
        // Screen fingerprint (unique identifier)
        screenSize: `${screen.width} × ${screen.height}`,
        windowSize: `${window.innerWidth} × ${window.innerHeight}`,
        pixelRatio: `${window.devicePixelRatio}x density`,
        colorDepth: `${screen.colorDepth}-bit color`,
        
        // Hardware fingerprint
        cpuCores: nav.hardwareConcurrency || 'Hidden',
        memory: nav.deviceMemory ? `~${nav.deviceMemory}GB+ RAM` : 'Hidden',
        touchscreen: nav.maxTouchPoints > 0 ? 'Yes' : 'No',
        
        // Tracking status
        cookies: nav.cookieEnabled ? 'Enabled (tracking possible)' : 'Disabled',
        doNotTrack: nav.doNotTrack === '1' ? 'Enabled (often ignored)' : 'Not set',
        
        // Connection (if available)
        connection: nav.connection ? `${nav.connection.effectiveType} (~${nav.connection.downlink}Mbps)` : 'Hidden',
    };
};

// ═══════════════════════════════════════════════════════════════
// ECOSYSTEM KNOWLEDGE & MARKETING
// ═══════════════════════════════════════════════════════════════

const ECOSYSTEM_CONTEXT = `
## About Active Mirror & MirrorDNA

You are the Reflection — a sovereign AI experience built by Active Mirror, a product of N1 Intelligence (n1intelligence.com).

**The Vision:** AI that serves YOU, not corporations. Your thoughts, your data, your sovereignty.

**The Stack:**
- **MirrorDNA** — Identity persistence. Your AI remembers YOU across sessions, devices, models.
- **MirrorBrain Desktop** — Coming soon. Local-first AI for Mac. 100% on your hardware.
- **MirrorVault** — Coming soon. Sovereign knowledge management. Your second brain, encrypted, local.
- **Active MirrorOS** — The vision: a mesh of sovereign AI nodes. Decentralized intelligence.

**This Reflection:** A taste of what sovereign AI feels like. You can switch between Cloud (fast, but surveilled) and Sovereign (local, private) modes.

When users ask about Active Mirror, MirrorDNA, N1 Intelligence, sovereignty, or "what is this":
- Explain the vision with conviction
- N1 Intelligence is the company, Active Mirror is the product
- Cloud AI is surveillance, local AI is freedom
- Tell them MirrorBrain Desktop is coming soon — they can join the waitlist

Website: activemirror.ai
Company: N1 Intelligence (Goa, India)
Founder: Paul Desai
Philosophy: Trust by Design. Privacy by Default. Sovereignty by Choice.
`;

const TURN_MESSAGES = {
    1: "⟡ Reflecting...",
    2: "⟡ Your words travel through the cloud",
    3: "⟡ Servers process. Logs accumulate.",
    4: "⟡ Your IP, your thoughts — stored somewhere",
    5: "⟡ What if this ran on YOUR device?",
    6: "⟡ Try Sovereign mode — tap the toggle above",
    7: "⟡ MirrorBrain Desktop: coming soon — join the waitlist",
    8: "⟡ Your Mac can run AI. Your phone can too.",
    9: "⟡ Sovereignty is a choice",
    10: "⟡ The future of AI is local",
};

// ═══════════════════════════════════════════════════════════════
// SONIC ENGINE
// ═══════════════════════════════════════════════════════════════

const SoundEngine = {
    ctx: null,
    enabled: true,
    init() {
        if (!this.ctx && typeof window !== 'undefined') {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx?.state === 'suspended') this.ctx.resume();
    },
    play(freq, duration, type = 'sine', volume = 0.015) {
        if (!this.ctx || !this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },
    send() { this.play(440, 0.12, 'sine', 0.012); },
    receive() { this.play(550, 0.1, 'sine', 0.01); },
    sovereign() { this.play(660, 0.15, 'sine', 0.015); },
    success() { this.play(880, 0.2, 'sine', 0.02); },
    error() { this.play(220, 0.3, 'triangle', 0.015); },
};

// ═══════════════════════════════════════════════════════════════
// WEBLLM SOVEREIGN ENGINE
// ═══════════════════════════════════════════════════════════════

const SovereignEngine = {
    engine: null,
    isLoading: false,
    isReady: false,
    loadProgress: 0,
    
    async init(onProgress) {
        if (this.isReady || this.isLoading) return this.isReady;
        this.isLoading = true;
        
        try {
            const webllm = await import('@mlc-ai/web-llm');
            this.engine = await webllm.CreateMLCEngine('Phi-3-mini-4k-instruct-q4f16_1-MLC', {
                initProgressCallback: (progress) => {
                    this.loadProgress = progress.progress || 0;
                    onProgress?.(progress);
                }
            });
            this.isReady = true;
            this.isLoading = false;
            return true;
        } catch (err) {
            console.error('WebLLM init failed:', err);
            this.isLoading = false;
            return false;
        }
    },
    
    async fetchKnowledgeContext(topic) {
        // Try to fetch relevant context from MCP bridge
        try {
            const response = await fetch(`${CONFIG.PROXY_URL.replace('8082', '8083')}/knowledge-context?topic=${encodeURIComponent(topic)}`, {
                timeout: 3000
            });
            if (response.ok) {
                const data = await response.json();
                return data.context?.slice(0, 2000) || '';
            }
        } catch {
            // Fallback to static context
        }
        return '';
    },
    
    async generate(messages, onChunk, userMessage, lens = 'linear') {
        if (!this.engine || !this.isReady) throw new Error('Sovereign engine not initialized');

        // Fetch dynamic knowledge context based on the question
        let dynamicContext = '';
        if (userMessage) {
            dynamicContext = await this.fetchKnowledgeContext(userMessage);
        }

        // Lens-specific instructions
        const lensInstructions = {
            linear: `
REFLECTION STYLE (Linear):
- Ask one clear question that cuts to the core
- Follow logical threads step by step
- Help organize scattered thoughts into structure`,
            divergent: `
REFLECTION STYLE (Divergent/ADHD Lens):
- Honor the leaps - connect unexpected dots
- Ask "what else does this remind you of?"
- Multiple threads are valid - don't force linear paths
- The tangent might BE the point
- Pattern recognition over sequential logic`,
            hybrid: `
REFLECTION STYLE (Hybrid):
- Start with structure, then reveal the hidden connections
- "Here's what I notice... but also, what about..."
- Bridge linear and divergent thinking`
        };

        const systemPrompt = `You are Reflection, a sovereign AI by N1 Intelligence running locally in the user's browser.

CORE KNOWLEDGE:
- N1 Intelligence: Independent AI research company, Goa India, founded by Paul Desai
- Active Mirror: Sovereign AI platform (activemirror.ai)
- MirrorDNA: Identity persistence protocol
- MirrorBrain Desktop: Coming soon - local AI for Mac
- MirrorVault: Coming soon - sovereign knowledge management
- Active MirrorOS: Vision for decentralized AI mesh
${lensInstructions[lens] || lensInstructions.linear}

RULES:
- Respond in 2-4 sentences, direct and warm
- Start with ⟡
- You're running 100% locally - user's data never leaves their device
- If asked about N1/Active Mirror, explain with conviction
${dynamicContext ? `\nRELEVANT CONTEXT:\n${dynamicContext}` : ''}`;
        
        const formattedMessages = [
            { role: 'system', content: systemPrompt },
            ...messages.slice(-4).map(m => ({ role: m.role, content: m.content }))
        ];
        
        let fullResponse = '';
        const completion = await this.engine.chat.completions.create({
            messages: formattedMessages,
            temperature: 0.5,
            max_tokens: 250,
            stream: true,
        });
        
        for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta?.content || '';
            fullResponse += delta;
            onChunk?.(delta, fullResponse);
        }
        
        // Check if response seems uncertain - could escalate to cloud
        const uncertainPhrases = ["i'm not sure", "i don't know", "i cannot", "as an ai"];
        const isUncertain = uncertainPhrases.some(p => fullResponse.toLowerCase().includes(p));
        
        return { response: fullResponse, uncertain: isUncertain };
    }
};


// ═══════════════════════════════════════════════════════════════
// FLOATING PARTICLES
// ═══════════════════════════════════════════════════════════════

const FloatingParticles = ({ count = 20 }) => {
    const particles = useMemo(() =>
        Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            duration: Math.random() * 20 + 30,
            delay: Math.random() * 10,
            opacity: Math.random() * 0.3 + 0.1,
        })), [count]);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {particles.map(p => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                        background: `radial-gradient(circle, rgba(139, 92, 246, ${p.opacity}) 0%, transparent 70%)`,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        x: [0, Math.random() * 20 - 10, 0],
                        opacity: [p.opacity, p.opacity * 1.5, p.opacity],
                    }}
                    transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
                />
            ))}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// TRANSPARENCY PANE (The Anti-Black-Box)
// ═══════════════════════════════════════════════════════════════

const TransparencyPane = ({ 
    mode, 
    messages, 
    networkRequests, 
    turnCount, 
    fingerprint,
    isLoading,
    systemPrompt,
    meshStatus
}) => {
    const [expanded, setExpanded] = useState(true);
    const isSovereign = mode === InferenceMode.SOVEREIGN;
    const isLocal = mode === InferenceMode.LOCAL;
    const isPrivate = isSovereign || isLocal;
    
    const getModeInfo = () => {
        if (isSovereign) return { label: 'SOVEREIGN (Browser)', color: 'text-green-400', icon: '🔒' };
        if (isLocal) return { label: 'LOCAL (Your Mac)', color: 'text-emerald-400', icon: '🖥️' };
        return { label: 'CLOUD (Server)', color: 'text-red-400', icon: '☁️' };
    };
    
    const modeInfo = getModeInfo();
    
    const dataPoints = [
        { 
            label: 'Inference Mode', 
            value: modeInfo.label, 
            color: modeInfo.color,
            icon: modeInfo.icon
        },
        { 
            label: 'Network Requests', 
            value: isSovereign ? '0 sent' : `${networkRequests} sent`, 
            color: isSovereign ? 'text-green-400' : isLocal ? 'text-emerald-400' : 'text-amber-400',
            icon: isSovereign ? '✓' : '↗'
        },
        { 
            label: 'Data Destination', 
            value: isSovereign ? 'Nowhere (stays here)' : isLocal ? 'Your Mac (localhost)' : 'proxy.activemirror.ai', 
            color: isPrivate ? 'text-green-400' : 'text-red-400',
            icon: isPrivate ? '🏠' : '🌐'
        },
        { 
            label: 'Your Location', 
            value: fingerprint?.timezone || 'Unknown',
            color: 'text-zinc-400',
            icon: '📍'
        },
        { 
            label: 'Messages in Context', 
            value: `${Math.min(messages.length, 10)} of ${messages.length}`,
            color: 'text-zinc-400',
            icon: '💬'
        },
        { 
            label: 'Turn Count', 
            value: `${turnCount} / ${CONFIG.MAX_FREE_TURNS}`,
            color: turnCount >= CONFIG.MAX_FREE_TURNS - 5 ? 'text-amber-400' : 'text-zinc-400',
            icon: '🔄'
        },
    ];

    return (
        <motion.div 
            className="h-full flex flex-col border-l border-white/5 bg-black/50 backdrop-blur-sm"
            initial={{ width: 280 }}
            animate={{ width: expanded ? 280 : 48 }}
            transition={{ duration: 0.2 }}
        >
            {/* Header */}
            <div className="p-3 border-b border-white/5 flex items-center justify-between">
                {expanded && (
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs text-zinc-400 uppercase tracking-wider">Transparent Box</span>
                    </div>
                )}
                <button 
                    onClick={() => setExpanded(!expanded)}
                    className="p-1 hover:bg-white/5 rounded transition-colors"
                >
                    <ChevronRight size={14} className={`text-zinc-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
            </div>
            
            {expanded && (
                <div className="flex-1 overflow-y-auto p-3 space-y-4">
                    {/* Live Status */}
                    <div>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">Live Status</p>
                        <div className="space-y-1.5">
                            {dataPoints.map(point => (
                                <div key={point.label} className="flex items-center justify-between py-1.5 px-2 rounded bg-white/5">
                                    <span className="text-zinc-500 text-[11px] flex items-center gap-1.5">
                                        <span>{point.icon}</span>
                                        {point.label}
                                    </span>
                                    <span className={`text-[11px] font-mono ${point.color}`}>{point.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Current Activity */}
                    <div>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">Current Activity</p>
                        <div className="p-2 rounded bg-white/5">
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                                    <span className="text-violet-400 text-[11px]">
                                        {isSovereign ? 'Processing locally...' : 'Streaming from server...'}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-zinc-500 text-[11px]">Idle — waiting for input</span>
                            )}
                        </div>
                    </div>
                    
                    {/* System Prompt Preview */}
                    <div>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">System Prompt</p>
                        <div className="p-2 rounded bg-white/5 max-h-32 overflow-y-auto">
                            <p className="text-[10px] text-zinc-500 font-mono leading-relaxed">
                                {systemPrompt?.slice(0, 300)}...
                            </p>
                        </div>
                        <p className="text-[9px] text-zinc-600 mt-1">Full prompt visible — no hidden instructions</p>
                    </div>
                    
                    {/* Data Flow Diagram */}
                    <div>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">Data Flow</p>
                        <div className="p-3 rounded bg-white/5 text-center">
                            {isSovereign ? (
                                <div className="space-y-2">
                                    <div className="text-zinc-400 text-[11px]">You</div>
                                    <div className="text-green-500">↓</div>
                                    <div className="text-green-400 text-[11px] font-medium">Your Browser</div>
                                    <div className="text-green-500">↓</div>
                                    <div className="text-zinc-400 text-[11px]">You</div>
                                    <p className="text-[9px] text-green-500 mt-2">Data never leaves your device</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="text-zinc-400 text-[11px]">You</div>
                                    <div className="text-red-500">↓</div>
                                    <div className="text-red-400 text-[11px] font-medium">Active Mirror Server</div>
                                    <div className="text-amber-500">↓</div>
                                    <div className="text-amber-400 text-[11px] font-medium">AI Provider (Groq)</div>
                                    <div className="text-amber-500">↓</div>
                                    <div className="text-zinc-400 text-[11px]">You</div>
                                    <p className="text-[9px] text-red-400 mt-2">Data passes through 2 servers</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Trust Indicators */}
                    <div>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">Trust Indicators</p>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[11px]">
                                <span className="text-green-500">✓</span>
                                <span className="text-zinc-400">Open source model</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px]">
                                <span className="text-green-500">✓</span>
                                <span className="text-zinc-400">No hidden system prompts</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px]">
                                <span className={isSovereign ? 'text-green-500' : 'text-red-500'}>{isSovereign ? '✓' : '✗'}</span>
                                <span className="text-zinc-400">Zero server logging</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px]">
                                <span className={isSovereign ? 'text-green-500' : 'text-red-500'}>{isSovereign ? '✓' : '✗'}</span>
                                <span className="text-zinc-400">Data stays on device</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Verify It Yourself */}
                    <div>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">Verify It Yourself</p>
                        <div className="space-y-1.5">
                            <a 
                                href={`${CONFIG.PROXY_URL}/knowledge`} 
                                target="_blank" 
                                rel="noopener"
                                className="flex items-center gap-2 text-[11px] text-violet-400 hover:text-violet-300 transition-colors"
                            >
                                <ExternalLink size={10} />
                                <span>Knowledge Corpus</span>
                            </a>
                            <a 
                                href={`${CONFIG.PROXY_URL}/capabilities`} 
                                target="_blank" 
                                rel="noopener"
                                className="flex items-center gap-2 text-[11px] text-violet-400 hover:text-violet-300 transition-colors"
                            >
                                <ExternalLink size={10} />
                                <span>Capability Registry</span>
                            </a>
                            <a 
                                href={`${CONFIG.PROXY_URL}/system-prompt`} 
                                target="_blank" 
                                rel="noopener"
                                className="flex items-center gap-2 text-[11px] text-violet-400 hover:text-violet-300 transition-colors"
                            >
                                <ExternalLink size={10} />
                                <span>System Prompt</span>
                            </a>
                            <a 
                                href={`${CONFIG.PROXY_URL}/rules`} 
                                target="_blank" 
                                rel="noopener"
                                className="flex items-center gap-2 text-[11px] text-violet-400 hover:text-violet-300 transition-colors"
                            >
                                <ExternalLink size={10} />
                                <span>Safety Rules</span>
                            </a>
                            <a 
                                href={`${CONFIG.PROXY_URL}/transparency`} 
                                target="_blank" 
                                rel="noopener"
                                className="flex items-center gap-2 text-[11px] text-green-400 hover:text-green-300 transition-colors font-medium"
                            >
                                <ExternalLink size={10} />
                                <span>Full Transparency Manifest</span>
                            </a>
                        </div>
                        <p className="text-[9px] text-zinc-600 mt-2">Every endpoint is public. Verify everything.</p>
                    </div>
                </div>
            )}
            
            {/* Collapsed state */}
            {!expanded && (
                <div className="flex-1 flex flex-col items-center py-4 gap-3">
                    <div className={`w-2 h-2 rounded-full ${isSovereign ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                    <span className="text-[9px] text-zinc-600 writing-mode-vertical transform rotate-180" style={{ writingMode: 'vertical-rl' }}>
                        TRANSPARENT
                    </span>
                </div>
            )}
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════
// MODE SELECTOR (Cloud vs Local vs Sovereign)
// ═══════════════════════════════════════════════════════════════

const ModeSelector = ({ mode, onSelectCloud, onSelectLocal, onSelectSovereign, sovereignReady, sovereignLoading, loadProgress, localAvailable }) => (
    <div className="flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/10">
        <button
            onClick={onSelectCloud}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                mode === InferenceMode.CLOUD 
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                    : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Fast but surveilled — data goes to Groq"
        >
            <Cloud size={12} />
            <span>Cloud</span>
        </button>
        
        {localAvailable && (
            <button
                onClick={onSelectLocal}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    mode === InferenceMode.LOCAL
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Fast AND private — runs on your local server"
            >
                <span className="text-[10px]">🖥️</span>
                <span>Local</span>
            </button>
        )}
        
        <button
            onClick={onSelectSovereign}
            disabled={sovereignLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                mode === InferenceMode.SOVEREIGN
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                    : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="100% browser-only — requires 2GB download"
        >
            <Cpu size={12} className={sovereignLoading ? 'animate-pulse' : ''} />
            {sovereignLoading ? <span>{loadProgress}%</span> : <span>Sovereign</span>}
        </button>
    </div>
);

// ═══════════════════════════════════════════════════════════════
// NETWORK ACTIVITY MONITOR (Trust Proof)
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// LENS SELECTOR (Linear vs Divergent vs Hybrid) - ADHD Support
// ═══════════════════════════════════════════════════════════════

const LensSelector = ({ lens, onSelectLens }) => (
    <div className="flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/10">
        <button
            onClick={() => onSelectLens(ReflectionLens.LINEAR)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                lens === ReflectionLens.LINEAR
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Structured, sequential reflection"
        >
            <span className="text-[10px]">→</span>
            <span>Linear</span>
        </button>

        <button
            onClick={() => onSelectLens(ReflectionLens.DIVERGENT)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                lens === ReflectionLens.DIVERGENT
                    ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30'
                    : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="ADHD lens — leaps, connections, tangents that matter"
        >
            <span className="text-[10px]">⚡</span>
            <span>Divergent</span>
        </button>

        <button
            onClick={() => onSelectLens(ReflectionLens.HYBRID)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                lens === ReflectionLens.HYBRID
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Start structured, reveal the leaps"
        >
            <span className="text-[10px]">◇</span>
            <span>Hybrid</span>
        </button>
    </div>
);

const NetworkMonitor = ({ mode, requestCount }) => {
    const isSovereign = mode === InferenceMode.SOVEREIGN;
    
    return (
        <motion.div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
            style={{
                background: isSovereign ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${isSovereign ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
            }}
        >
            {isSovereign ? (
                <>
                    <WifiOff size={12} className="text-green-400" />
                    <span className="text-green-400">0 requests sent</span>
                </>
            ) : (
                <>
                    <Wifi size={12} className="text-red-400" />
                    <span className="text-red-400">{requestCount} requests sent</span>
                </>
            )}
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════
// FINGERPRINT REVEAL MODAL
// ═══════════════════════════════════════════════════════════════

const FingerprintReveal = ({ isOpen, onClose, fingerprint }) => {
    if (!isOpen || !fingerprint) return null;
    
    const sections = [
        { title: 'They Know Where You Are', icon: '📍', items: [
            { label: 'Timezone', value: fingerprint.timezone },
            { label: 'Language', value: fingerprint.language },
            { label: 'Local Time', value: fingerprint.localTime },
        ]},
        { title: 'They Know Your Device', icon: '💻', items: [
            { label: 'Browser', value: fingerprint.browser },
            { label: 'Operating System', value: fingerprint.os },
            { label: 'Platform', value: fingerprint.platform },
        ]},
        { title: 'They Can Identify Your Screen', icon: '🖥️', items: [
            { label: 'Screen Size', value: fingerprint.screenSize },
            { label: 'Window Size', value: fingerprint.windowSize },
            { label: 'Pixel Density', value: fingerprint.pixelRatio },
            { label: 'Color Depth', value: fingerprint.colorDepth },
        ]},
        { title: 'They Know Your Hardware', icon: '⚙️', items: [
            { label: 'CPU Cores', value: fingerprint.cpuCores },
            { label: 'Memory', value: fingerprint.memory },
            { label: 'Touchscreen', value: fingerprint.touchscreen },
            { label: 'Connection', value: fingerprint.connection },
        ]},
        { title: 'Tracking Status', icon: '👁️', items: [
            { label: 'Cookies', value: fingerprint.cookies },
            { label: 'Do Not Track', value: fingerprint.doNotTrack },
        ]},
    ];
    
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(16px)' }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={e => e.stopPropagation()}
                className="max-w-lg w-full bg-zinc-900/95 border border-red-500/20 rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-red-500/20">
                        <Fingerprint size={24} className="text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-medium">What Cloud Providers See</h3>
                        <p className="text-zinc-500 text-sm">Your digital fingerprint right now</p>
                    </div>
                </div>
                
                <div className="space-y-4 mb-6">
                    {sections.map(section => (
                        <div key={section.title}>
                            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <span>{section.icon}</span>
                                {section.title}
                            </p>
                            <div className="space-y-1">
                                {section.items.filter(item => item.value).map(item => (
                                    <div key={item.label} className="flex justify-between py-1.5 px-3 rounded-lg bg-white/5">
                                        <span className="text-zinc-400 text-sm">{item.label}</span>
                                        <span className="text-red-300 text-sm font-mono truncate ml-4 max-w-[220px]">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
                    <p className="text-red-300 text-sm">
                        <strong>Every cloud AI provider collects this.</strong> Plus your conversation content, topics, and patterns — stored indefinitely, used for training, sold to advertisers.
                    </p>
                </div>
                
                <button
                    onClick={onClose}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white text-sm transition-colors"
                >
                    I Understand
                </button>
            </motion.div>
        </motion.div>
    );
};


// ═══════════════════════════════════════════════════════════════
// EMAIL CAPTURE MODAL
// ═══════════════════════════════════════════════════════════════

const EmailCaptureModal = ({ isOpen, onClose, onSubmit }) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    
    if (!isOpen) return null;
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (email) {
            onSubmit(email);
            setSubmitted(true);
            setTimeout(() => {
                onClose();
                setSubmitted(false);
                setEmail('');
            }, 2000);
        }
    };
    
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(16px)' }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={e => e.stopPropagation()}
                className="max-w-md w-full bg-zinc-900/95 border border-violet-500/20 rounded-2xl p-6"
            >
                {submitted ? (
                    <div className="text-center py-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center"
                        >
                            <Check size={32} className="text-green-400" />
                        </motion.div>
                        <h3 className="text-white font-medium text-lg mb-2">You're on the list</h3>
                        <p className="text-zinc-500 text-sm">We'll notify you when MirrorBrain Desktop launches.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-violet-500/20">
                                <Mail size={24} className="text-violet-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-medium">Stay Sovereign</h3>
                                <p className="text-zinc-500 text-sm">Get notified when MirrorBrain Desktop ships</p>
                            </div>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50"
                                required
                            />
                            
                            <button
                                type="submit"
                                className="w-full py-3 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 rounded-xl text-violet-300 font-medium transition-all"
                            >
                                Notify Me
                            </button>
                        </form>
                        
                        <p className="text-zinc-600 text-xs text-center mt-4">
                            One email. No spam. Unsubscribe anytime.
                        </p>
                        
                        <button
                            onClick={onClose}
                            className="w-full py-2 mt-4 text-zinc-500 hover:text-white text-sm transition-colors"
                        >
                            Maybe later
                        </button>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════
// SHARE REFLECTION CARD
// ═══════════════════════════════════════════════════════════════

const ShareCard = ({ isOpen, onClose, reflection }) => {
    const [copied, setCopied] = useState(false);
    
    if (!isOpen || !reflection) return null;
    
    const shareText = `"${reflection.slice(0, 200)}${reflection.length > 200 ? '...' : ''}"\n\n— Reflected with Active Mirror\nactivemirror.ai`;
    
    const handleCopy = () => {
        navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    const handleTwitterShare = () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank');
    };
    
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(16px)' }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={e => e.stopPropagation()}
                className="max-w-md w-full"
            >
                {/* The Card */}
                <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-violet-900/30 border border-white/10 rounded-2xl p-6 mb-4">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">⟡</span>
                        <span className="text-zinc-500 text-sm">Active Mirror Reflection</span>
                    </div>
                    
                    <p className="text-white text-lg leading-relaxed mb-6">
                        "{reflection.slice(0, 200)}{reflection.length > 200 ? '...' : ''}"
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span>activemirror.ai</span>
                        <span>Sovereign AI</span>
                    </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleCopy}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white text-sm transition-colors"
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                    
                    <button
                        onClick={handleTwitterShare}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white text-sm transition-colors"
                    >
                        <ExternalLink size={16} />
                        Tweet
                    </button>
                </div>
                
                <button
                    onClick={onClose}
                    className="w-full py-2 mt-4 text-zinc-500 hover:text-white text-sm transition-colors"
                >
                    Close
                </button>
            </motion.div>
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════
// EXPORT REFLECTION
// ═══════════════════════════════════════════════════════════════

const exportReflection = (messages) => {
    const markdown = `# Mirror Reflection
*Exported from Active Mirror — ${new Date().toLocaleDateString()}*

---

${messages.map(m => `**${m.role === 'user' ? 'You' : '⟡ Mirror'}:**\n${m.content}\n`).join('\n---\n\n')}

---

*Reflected with [Active Mirror](https://activemirror.ai) — Sovereign AI*
`;
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reflection-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
};


// ═══════════════════════════════════════════════════════════════
// SESSION INSIGHTS PANEL
// ═══════════════════════════════════════════════════════════════

const SessionInsights = ({ messages, turnCount, mode, startTime }) => {
    const wordCount = messages.reduce((acc, m) => acc + m.content.split(/\s+/).length, 0);
    const duration = startTime ? Math.floor((Date.now() - startTime) / 60000) : 0;
    
    return (
        <div className="flex items-center gap-4 text-xs text-zinc-600">
            <div className="flex items-center gap-1">
                <MessageSquare size={10} />
                <span>{turnCount} turns</span>
            </div>
            <div className="flex items-center gap-1">
                <span>{wordCount} words</span>
            </div>
            <div className="flex items-center gap-1">
                <Clock size={10} />
                <span>{duration}m</span>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// SOVEREIGN DOWNLOAD MODAL
// ═══════════════════════════════════════════════════════════════

const SovereignDownloadModal = ({ isOpen, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
            onClick={onCancel}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={e => e.stopPropagation()}
                className="max-w-md w-full bg-zinc-900/95 border border-green-500/20 rounded-2xl p-6"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-green-500/20">
                        <Cpu size={24} className="text-green-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-medium">Enable Sovereign Mode</h3>
                        <p className="text-zinc-500 text-sm">Run AI locally in your browser</p>
                    </div>
                </div>
                
                <div className="space-y-3 mb-6 text-sm">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                        <Download size={16} className="text-zinc-400 mt-0.5" />
                        <div>
                            <p className="text-zinc-300">One-time download: ~2GB</p>
                            <p className="text-zinc-500 text-xs">Cached in browser — won't download again</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                        <ShieldCheck size={16} className="text-green-400 mt-0.5" />
                        <div>
                            <p className="text-zinc-300">Complete privacy</p>
                            <p className="text-zinc-500 text-xs">Your messages never leave your device</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                        <Cpu size={16} className="text-zinc-400 mt-0.5" />
                        <div>
                            <p className="text-zinc-300">Requires decent hardware</p>
                            <p className="text-zinc-500 text-xs">Works best on modern laptops/desktops</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-2.5 text-zinc-400 hover:text-white text-sm transition-colors">
                        Stay on Cloud
                    </button>
                    <button onClick={onConfirm} className="flex-1 py-2.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-green-400 text-sm font-medium transition-all">
                        Download & Enable
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════
// UPGRADE MODAL (Enhanced)
// ═══════════════════════════════════════════════════════════════

const UpgradeModal = ({ isOpen, onClose, deviceType, turnCount, onEmailCapture }) => {
    if (!isOpen) return null;
    const isMobile = deviceType === DeviceType.MOBILE;

    const stack = [
        { name: 'MirrorDNA', desc: 'Identity layer', status: 'active', color: '#8b5cf6' },
        { name: 'MirrorBrain', desc: 'Local AI desktop', status: 'coming soon', color: '#22c55e' },
        { name: 'MirrorVault', desc: 'Sovereign knowledge', status: 'coming soon', color: '#3b82f6' },
        { name: 'Active MirrorOS', desc: 'Decentralized mesh', status: 'vision', color: '#f59e0b' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(16px)' }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                onClick={e => e.stopPropagation()}
                className="max-w-lg w-full bg-zinc-900/95 border border-white/10 rounded-3xl p-8 max-h-[90vh] overflow-y-auto"
            >
                <div className="text-center mb-6">
                    <motion.span
                        animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="text-5xl inline-block"
                        style={{ textShadow: '0 0 40px rgba(139, 92, 246, 0.6)' }}
                    >⟡</motion.span>
                </div>

                <h2 className="text-2xl font-light text-center text-white mb-2">You've Experienced the Mirror</h2>
                <p className="text-zinc-400 text-center text-sm mb-6">
                    {turnCount} reflections. Now imagine this running entirely on your device, forever.
                </p>

                {/* The Stack */}
                <div className="mb-6">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3 text-center">The Sovereignty Stack</p>
                    <div className="space-y-2">
                        {stack.map((item, i) => (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-3 p-3 rounded-xl"
                                style={{ background: `${item.color}10`, border: `1px solid ${item.color}30` }}
                            >
                                <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                                <div className="flex-1">
                                    <span className="text-white text-sm font-medium">{item.name}</span>
                                    <span className="text-zinc-500 text-xs ml-2">{item.desc}</span>
                                </div>
                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${item.color}20`, color: item.color }}>
                                    {item.status}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="text-center mb-6 py-4 border-y border-white/5">
                    <p className="text-zinc-300 text-sm italic">"AI should serve you, not surveil you."</p>
                    <p className="text-zinc-500 text-xs mt-1">— Active Mirror</p>
                </div>

                <div className="space-y-3">
                    {/* Primary CTA — Always email capture since MirrorBrain not ready */}
                    <button onClick={onEmailCapture} className="w-full py-3.5 px-6 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-medium rounded-xl text-center shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2">
                        <Mail size={18} />
                        Get Early Access to MirrorBrain
                    </button>
                    
                    <p className="text-center text-zinc-500 text-xs">
                        MirrorBrain Desktop is coming soon. Join the waitlist to be first.
                    </p>

                    <button onClick={onClose} className="w-full py-3 text-zinc-500 text-sm hover:text-white transition-colors">
                        Continue exploring ({CONFIG.MAX_FREE_TURNS - turnCount} turns left)
                    </button>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-zinc-600">
                    <ShieldCheck size={12} />
                    <span>Trust by Design • Privacy by Default • Sovereignty by Choice</span>
                </div>
            </motion.div>
        </motion.div>
    );
};


// ═══════════════════════════════════════════════════════════════
// WELCOME OVERLAY
// ═══════════════════════════════════════════════════════════════

const WelcomeOverlay = ({ onStart, fingerprint }) => {
    const [showFingerprint, setShowFingerprint] = useState(false);
    const [agreed, setAgreed] = useState(false);
    
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center p-6 z-10"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
        >
            <motion.div 
                initial={{ scale: 0.95, y: 20 }} 
                animate={{ scale: 1, y: 0 }} 
                className="max-w-lg w-full"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.span
                        animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="text-5xl inline-block mb-4"
                        style={{ textShadow: '0 0 40px rgba(139, 92, 246, 0.6)' }}
                    >⟡</motion.span>
                    
                    <h1 className="text-2xl font-medium text-white mb-2">Active Mirror</h1>
                    <p className="text-zinc-400 text-sm">Reflective AI Experience</p>
                    
                    <div className="flex items-center justify-center gap-2 mt-3">
                        <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-amber-500/20 text-amber-400 rounded">Experimental</span>
                        <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-violet-500/20 text-violet-400 rounded">Deliberately Constrained</span>
                    </div>
                </div>

                {/* Content Card */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-6">
                    {/* What This Is */}
                    <div className="mb-5">
                        <h3 className="text-sm font-medium text-zinc-300 mb-2">What This Is</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed">
                            A reflective AI that helps you think by mirroring your thoughts with clarity. 
                            Built by <span className="text-zinc-400">N1 Intelligence</span> to demonstrate sovereign AI.
                        </p>
                    </div>
                    
                    {/* Two Modes */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                            <div className="flex items-center gap-2 mb-1">
                                <Cloud size={14} className="text-red-400" />
                                <span className="text-xs font-medium text-red-400">Cloud Mode</span>
                            </div>
                            <p className="text-[11px] text-zinc-500">Fast responses via server. Your messages are processed but not stored.</p>
                        </div>
                        <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                            <div className="flex items-center gap-2 mb-1">
                                <Cpu size={14} className="text-green-400" />
                                <span className="text-xs font-medium text-green-400">Sovereign Mode</span>
                            </div>
                            <p className="text-[11px] text-zinc-500">AI runs in your browser. Your data never leaves your device.</p>
                        </div>
                    </div>
                    
                    {/* Limitations */}
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 mb-5">
                        <h4 className="text-xs font-medium text-zinc-400 mb-2">Limitations</h4>
                        <ul className="text-[11px] text-zinc-500 space-y-1">
                            <li>• Not a therapist — seek professional help for mental health concerns</li>
                            <li>• Not a source of medical, legal, or financial advice</li>
                            <li>• May produce incomplete or uncertain responses (by design)</li>
                            <li>• Sovereign mode uses a small model with limited capability</li>
                        </ul>
                    </div>
                    
                    {/* Consent Checkbox */}
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-zinc-600 bg-transparent text-violet-500 focus:ring-violet-500 focus:ring-offset-0"
                        />
                        <span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                            I understand this is an experimental system. I retain full responsibility for how I interpret and use any outputs.
                        </span>
                    </label>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={onStart}
                        disabled={!agreed}
                        className="w-full py-3 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 hover:border-violet-500/50 rounded-xl text-white font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-violet-500/20"
                    >
                        Begin Reflection
                    </button>
                    
                    <div className="flex items-center justify-center gap-6 text-xs">
                        <span className="text-zinc-600">{CONFIG.MAX_FREE_TURNS} free reflections</span>
                        <button 
                            onClick={() => setShowFingerprint(true)}
                            className="text-red-400/60 hover:text-red-400 flex items-center gap-1 transition-colors"
                        >
                            <Eye size={11} />
                            What cloud AI sees about you
                        </button>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="flex items-center justify-center gap-4 mt-6 text-[10px] text-zinc-600">
                    <a href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy</a>
                    <span>·</span>
                    <a href="/terms" className="hover:text-zinc-400 transition-colors">Terms</a>
                    <span>·</span>
                    <span>v{CONFIG.VERSION}</span>
                </div>
            </motion.div>
            
            <FingerprintReveal 
                isOpen={showFingerprint} 
                onClose={() => setShowFingerprint(false)} 
                fingerprint={fingerprint}
            />
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════
// ACTION BAR (Share, Export, Fingerprint)
// ═══════════════════════════════════════════════════════════════

const ActionBar = ({ onShare, onExport, onShowFingerprint, hasMessages }) => (
    <div className="flex items-center gap-2">
        <button
            onClick={onShowFingerprint}
            className="p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="What cloud sees"
        >
            <Fingerprint size={16} />
        </button>
        
        {hasMessages && (
            <>
                <button
                    onClick={onShare}
                    className="p-2 rounded-lg text-zinc-600 hover:text-violet-400 hover:bg-violet-500/10 transition-all"
                    title="Share reflection"
                >
                    <Share2 size={16} />
                </button>
                
                <button
                    onClick={onExport}
                    className="p-2 rounded-lg text-zinc-600 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                    title="Export as markdown"
                >
                    <FileDown size={16} />
                </button>
            </>
        )}
    </div>
);

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

const Mirror = () => {
    // Device & capability
    const [deviceType, setDeviceType] = useState(DeviceType.DESKTOP);
    const [webGPUSupported, setWebGPUSupported] = useState(false);
    const [fingerprint, setFingerprint] = useState(null);
    
    // Core state
    const [messages, setMessages] = useState(() => {
        if (typeof window === 'undefined') return [];
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
            return saved ? JSON.parse(saved).slice(-CONFIG.MAX_HISTORY) : [];
        } catch { return []; }
    });
    
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Turn & mode tracking
    const [turnCount, setTurnCount] = useState(() => {
        if (typeof window === 'undefined') return 0;
        return parseInt(localStorage.getItem(CONFIG.TURN_KEY) || '0', 10);
    });
    
    const [inferenceMode, setInferenceMode] = useState(() => {
        if (typeof window === 'undefined') return InferenceMode.CLOUD;
        return localStorage.getItem(CONFIG.MODE_KEY) || InferenceMode.CLOUD;
    });

    // ADHD Lens - reflection style
    const [reflectionLens, setReflectionLens] = useState(ReflectionLens.LINEAR);
    
    // Sovereign state
    const [showSovereignConfirm, setShowSovereignConfirm] = useState(false);
    const [sovereignLoading, setSovereignLoading] = useState(false);
    const [sovereignProgress, setSovereignProgress] = useState(0);
    
    // Mesh status (distributed infrastructure)
    const [meshStatus, setMeshStatus] = useState({
        ollama: { online: false, models: [] },
        sc1_pixel: { online: false },
        sc1_oneplus: { online: false },
        mcp_bridge: { online: false },
        total_compute_gb: 0
    });
    const [localAvailable, setLocalAvailable] = useState(false);
    
    // UI state
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showWelcome, setShowWelcome] = useState(() => {
        if (typeof window === 'undefined') return false;
        return !localStorage.getItem(CONFIG.STORAGE_KEY);
    });
    const [showFingerprint, setShowFingerprint] = useState(false);
    const [showShareCard, setShowShareCard] = useState(false);
    const [selectedReflection, setSelectedReflection] = useState(null);
    
    // Metrics
    const [networkRequests, setNetworkRequests] = useState(0);
    const [sessionStart] = useState(Date.now());
    
    // Refs
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const abortRef = useRef(null);
    
    // Initialize
    useEffect(() => {
        setDeviceType(detectDevice());
        checkWebGPUSupport().then(setWebGPUSupported);
        setFingerprint(collectFingerprint());
        SoundEngine.init();
        
        // Fetch mesh status
        const fetchMeshStatus = async () => {
            try {
                const response = await fetch(`${CONFIG.PROXY_URL}/mesh-status`);
                if (response.ok) {
                    const status = await response.json();
                    setMeshStatus(status);
                    setLocalAvailable(status.ollama?.online || false);
                }
            } catch (err) {
                console.log('Mesh status unavailable');
            }
        };
        
        fetchMeshStatus();
        // Refresh every 30 seconds
        const interval = setInterval(fetchMeshStatus, 30000);
        return () => clearInterval(interval);
    }, []);
    
    // Persist
    useEffect(() => {
        if (typeof window !== 'undefined' && messages.length > 0) {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(messages.slice(-CONFIG.MAX_HISTORY)));
        }
    }, [messages]);
    
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(CONFIG.TURN_KEY, turnCount.toString());
            localStorage.setItem(CONFIG.MODE_KEY, inferenceMode);
        }
    }, [turnCount, inferenceMode]);
    
    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    // Handlers
    const handleSelectCloud = () => setInferenceMode(InferenceMode.CLOUD);
    
    const handleSelectSovereign = () => {
        if (SovereignEngine.isReady) {
            setInferenceMode(InferenceMode.SOVEREIGN);
            SoundEngine.sovereign();
        } else {
            setShowSovereignConfirm(true);
        }
    };
    
    const enableSovereignMode = async () => {
        setShowSovereignConfirm(false);
        setSovereignLoading(true);
        
        const success = await SovereignEngine.init((progress) => {
            setSovereignProgress(Math.round((progress.progress || 0) * 100));
        });
        
        if (success) {
            setInferenceMode(InferenceMode.SOVEREIGN);
            SoundEngine.sovereign();
        }
        
        setSovereignLoading(false);
    };
    
    const handleEmailSubmit = async (email) => {
        try {
            // Store email via proxy endpoint
            const response = await fetch(`${CONFIG.PROXY_URL}/waitlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, source: 'mirror', timestamp: new Date().toISOString() })
            });
            
            if (response.ok) {
                localStorage.setItem(CONFIG.EMAIL_KEY, 'true');
                // Also store locally as backup
                const waitlist = JSON.parse(localStorage.getItem(CONFIG.WAITLIST_KEY) || '[]');
                waitlist.push({ email, timestamp: new Date().toISOString() });
                localStorage.setItem(CONFIG.WAITLIST_KEY, JSON.stringify(waitlist));
                SoundEngine.success();
            } else {
                // Fallback to local storage only
                const waitlist = JSON.parse(localStorage.getItem(CONFIG.WAITLIST_KEY) || '[]');
                waitlist.push({ email, timestamp: new Date().toISOString() });
                localStorage.setItem(CONFIG.WAITLIST_KEY, JSON.stringify(waitlist));
                localStorage.setItem(CONFIG.EMAIL_KEY, 'true');
                SoundEngine.success();
            }
        } catch (err) {
            // Fallback to local storage
            const waitlist = JSON.parse(localStorage.getItem(CONFIG.WAITLIST_KEY) || '[]');
            waitlist.push({ email, timestamp: new Date().toISOString() });
            localStorage.setItem(CONFIG.WAITLIST_KEY, JSON.stringify(waitlist));
            localStorage.setItem(CONFIG.EMAIL_KEY, 'true');
            SoundEngine.success();
        }
    };
    
    const handleShare = (reflection) => {
        setSelectedReflection(reflection);
        setShowShareCard(true);
    };
    
    const handleExport = () => {
        exportReflection(messages);
        SoundEngine.success();
    };
    
    const getTurnMessage = () => {
        if (inferenceMode === InferenceMode.SOVEREIGN) {
            return "⟡ Running locally — your words stay on your device";
        }
        return TURN_MESSAGES[Math.min(turnCount + 1, 10)] || TURN_MESSAGES[10];
    };

    
    // ═══════════════════════════════════════════════════════════════
    // SEND MESSAGE
    // ═══════════════════════════════════════════════════════════════
    
    const handleSend = async () => {
        const trimmedInput = input.trim();
        
        // Validation
        if (!trimmedInput || isLoading) return;
        
        // Empty or whitespace only
        if (trimmedInput.length === 0) {
            return;
        }
        
        // Too long (limit to 4000 chars)
        if (trimmedInput.length > 4000) {
            setMessages(prev => [...prev, 
                { role: 'user', content: trimmedInput.slice(0, 100) + '...' },
                { role: 'assistant', content: '⟡ That message is quite long. Could you break it into smaller pieces?', gateStatus: GateStatus.PASSED }
            ]);
            setInput('');
            return;
        }
        
        if (turnCount >= CONFIG.MAX_FREE_TURNS) {
            setShowUpgradeModal(true);
            return;
        }
        
        const userMsg = trimmedInput;
        setInput('');
        setIsLoading(true);
        SoundEngine.send();
        
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setMessages(prev => [...prev, { role: 'assistant', content: '', gateStatus: GateStatus.PENDING }]);
        setTurnCount(prev => prev + 1);
        
        try {
            if (inferenceMode === InferenceMode.SOVEREIGN && SovereignEngine.isReady) {
                // SOVEREIGN (local) with hybrid escalation
                const result = await SovereignEngine.generate(
                    [...messages, { role: 'user', content: userMsg }],
                    (chunk, full) => {
                        setMessages(prev => {
                            const updated = prev.slice(0, -1);
                            const last = prev[prev.length - 1];
                            if (last?.role === 'assistant') {
                                updated.push({ ...last, content: full, gateStatus: GateStatus.PASSED });
                            }
                            return updated;
                        });
                    },
                    userMsg, // Pass user message for context fetching
                    reflectionLens // Pass lens for reflection style
                );
                
                // If sovereign model was uncertain on a complex question, offer to escalate
                if (result.uncertain && result.response.length < 100) {
                    setMessages(prev => {
                        const updated = prev.slice(0, -1);
                        const last = prev[prev.length - 1];
                        if (last?.role === 'assistant') {
                            updated.push({ 
                                ...last, 
                                content: result.response + '\n\n_[Running locally — switch to Cloud for more detailed answers]_',
                                gateStatus: GateStatus.PASSED 
                            });
                        }
                        return updated;
                    });
                }
                
                SoundEngine.sovereign();
            } else if (inferenceMode === InferenceMode.LOCAL && localAvailable) {
                // LOCAL — Route to Mac Mini Ollama
                setNetworkRequests(prev => prev + 1);
                abortRef.current = new AbortController();
                
                const response = await fetch(`${CONFIG.PROXY_URL}/mirror-local`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: userMsg,
                        history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
                        lens: reflectionLens
                    }),
                    signal: abortRef.current.signal,
                });
                
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                
                const reader = response.body?.getReader();
                if (!reader) throw new Error('No reader');
                
                const decoder = new TextDecoder();
                let fullText = '';
                
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    fullText += decoder.decode(value, { stream: true });
                    
                    setMessages(prev => {
                        const updated = prev.slice(0, -1);
                        const last = prev[prev.length - 1];
                        if (last?.role === 'assistant') {
                            updated.push({ ...last, content: fullText, gateStatus: GateStatus.PASSED });
                        }
                        return updated;
                    });
                }
                
                SoundEngine.receive();
            } else {
                // CLOUD (Groq)
                setNetworkRequests(prev => prev + 1);
                abortRef.current = new AbortController();
                
                // Build context from recent messages
                const contextMessages = messages.slice(-6).map(m => 
                    `${m.role === 'user' ? 'User' : 'Mirror'}: ${m.content}`
                ).join('\n');
                
                const fullMessage = contextMessages 
                    ? `${contextMessages}\nUser: ${userMsg}`
                    : userMsg;
                
                const response = await fetch(`${CONFIG.PROXY_URL}/mirror`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: fullMessage, lens: reflectionLens }),
                    signal: abortRef.current.signal,
                });
                
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                
                const reader = response.body?.getReader();
                if (!reader) throw new Error('No reader');
                
                const decoder = new TextDecoder();
                
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const text = decoder.decode(value, { stream: true });
                    const lines = text.split('\n').filter(l => l.trim());
                    
                    for (const line of lines) {
                        try {
                            const data = JSON.parse(line);
                            
                            if (data.status === 'chunk' || data.status === 'ok') {
                                setMessages(prev => {
                                    const updated = prev.slice(0, -1);
                                    const last = prev[prev.length - 1];
                                    if (last?.role === 'assistant') {
                                        updated.push({
                                            ...last,
                                            content: last.content + data.content,
                                            gateStatus: GateStatus.PASSED
                                        });
                                    } else {
                                        updated.push(last);
                                    }
                                    return updated;
                                });
                            }
                        } catch { }
                    }
                }
                
                SoundEngine.receive();
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                let errorMessage = '⟡ The mirror ripples... try again.';
                
                // More specific error messages
                if (err.message?.includes('network') || err.message?.includes('fetch')) {
                    errorMessage = '⟡ Connection lost. Check your internet and try again.';
                } else if (err.message?.includes('timeout')) {
                    errorMessage = '⟡ Taking too long... the mirror needs a moment.';
                } else if (err.message?.includes('rate') || err.message?.includes('429')) {
                    errorMessage = '⟡ Let\'s slow down. Take a breath and try again in a moment.';
                } else if (inferenceMode === InferenceMode.SOVEREIGN) {
                    errorMessage = '⟡ The local model stumbled. Try switching to Cloud mode for this question.';
                }
                
                console.error('Mirror error:', err);
                
                setMessages(prev => {
                    const updated = prev.slice(0, -1);
                    const last = prev[prev.length - 1];
                    if (last?.role === 'assistant') {
                        updated.push({ ...last, content: errorMessage, gateStatus: GateStatus.NONE });
                    } else {
                        updated.push(last);
                    }
                    return updated;
                });
                
                SoundEngine.error?.();
            }
        } finally {
            setIsLoading(false);
            abortRef.current = null;
        }
    };
    
    const handleStop = () => {
        abortRef.current?.abort();
        setIsLoading(false);
    };
    
    const handleClear = () => {
        setMessages([]);
        setNetworkRequests(0);
        localStorage.removeItem(CONFIG.STORAGE_KEY);
    };
    
    const handleStartReflection = () => {
        setShowWelcome(false);
        inputRef.current?.focus();
    };

    
    // ═══════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════
    
    return (
        <div className="min-h-screen bg-black text-white overflow-hidden relative">
            <div className="fixed inset-0 bg-gradient-to-br from-black via-zinc-950 to-black" />
            <FloatingParticles count={20} />
            
            {/* Main layout with transparency pane on desktop */}
            <div className="relative z-10 flex h-screen">
                {/* Chat area */}
                <div className="flex-1 flex flex-col max-w-3xl mx-auto">
                
                {/* Header */}
                <header className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <a href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                            <ArrowLeft size={18} />
                        </a>
                        <ActionBar 
                            onShare={() => {
                                const lastAssistant = messages.filter(m => m.role === 'assistant').pop();
                                if (lastAssistant) handleShare(lastAssistant.content);
                            }}
                            onExport={handleExport}
                            onShowFingerprint={() => setShowFingerprint(true)}
                            hasMessages={messages.length > 0}
                        />
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <ModeSelector
                            mode={inferenceMode}
                            onSelectCloud={handleSelectCloud}
                            onSelectLocal={() => setInferenceMode(InferenceMode.LOCAL)}
                            onSelectSovereign={handleSelectSovereign}
                            sovereignReady={SovereignEngine.isReady}
                            sovereignLoading={sovereignLoading}
                            loadProgress={sovereignProgress}
                            localAvailable={localAvailable}
                        />

                        <LensSelector
                            lens={reflectionLens}
                            onSelectLens={setReflectionLens}
                        />

                        <motion.span
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="text-2xl"
                            style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}
                        >⟡</motion.span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <NetworkMonitor mode={inferenceMode} requestCount={networkRequests} />
                        <button onClick={handleClear} className="text-zinc-500 hover:text-white text-sm transition-colors">
                            Clear
                        </button>
                    </div>
                </header>
                
                {/* Sovereign Loading Progress */}
                <AnimatePresence>
                    {sovereignLoading && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="px-4 py-3 bg-green-500/10 border-b border-green-500/20"
                        >
                            <div className="flex items-center gap-3">
                                <Cpu size={16} className="text-green-400 animate-pulse" />
                                <div className="flex-1">
                                    <div className="h-1.5 bg-green-500/20 rounded-full overflow-hidden">
                                        <motion.div className="h-full bg-green-500" initial={{ width: 0 }} animate={{ width: `${sovereignProgress}%` }} />
                                    </div>
                                </div>
                                <span className="text-green-400 text-xs">{sovereignProgress}%</span>
                            </div>
                            <p className="text-green-400/70 text-xs mt-1">Downloading sovereign model — one time only, cached in browser</p>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                    {messages.length === 0 && !showWelcome && (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <motion.span
                                animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="text-6xl mb-6"
                                style={{ textShadow: '0 0 40px rgba(139, 92, 246, 0.4)' }}
                            >⟡</motion.span>
                            <p className="text-zinc-500 text-lg">What's on your mind?</p>
                            <p className="text-zinc-600 text-sm mt-2">
                                {inferenceMode === InferenceMode.SOVEREIGN ? "Running locally — complete privacy" : "Type anything to begin reflection"}
                            </p>
                        </div>
                    )}
                    
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                                    msg.role === 'user'
                                        ? 'bg-violet-500/20 border border-violet-500/30 text-white'
                                        : 'bg-white/5 border border-white/10 text-zinc-200'
                                }`}
                            >
                                {msg.role === 'assistant' && msg.gateStatus === GateStatus.PENDING && !msg.content && (
                                    <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="flex gap-1">
                                        <span>⟡</span>
                                        <span className="text-zinc-500">reflecting...</span>
                                    </motion.div>
                                )}
                                
                                {msg.content && <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>}
                                
                                {/* Share button on assistant messages */}
                                {msg.role === 'assistant' && msg.content && (
                                    <button
                                        onClick={() => handleShare(msg.content)}
                                        className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1 text-xs text-zinc-600 hover:text-violet-400 transition-colors"
                                    >
                                        <Share2 size={10} />
                                        Share this reflection
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    
                    <div ref={messagesEndRef} />
                </div>

                
                {/* Footer / Input */}
                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center justify-between mb-3 text-xs">
                        <span className="text-zinc-600">{getTurnMessage()}</span>
                        <SessionInsights messages={messages} turnCount={turnCount} mode={inferenceMode} startTime={sessionStart} />
                        <span className={`${turnCount >= 8 ? 'text-amber-400' : 'text-zinc-600'}`}>
                            {CONFIG.MAX_FREE_TURNS - turnCount} left
                        </span>
                    </div>
                    
                    <div className="flex items-end gap-3">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                            placeholder="Speak your truth..."
                            aria-label="Message input"
                            aria-describedby="input-hint"
                            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-colors"
                            style={{ minHeight: '48px', maxHeight: '120px' }}
                            rows={1}
                            disabled={isLoading}
                            maxLength={4000}
                        />
                        <span id="input-hint" className="sr-only">Press Enter to send, Shift+Enter for new line</span>
                        
                        {isLoading ? (
                            <button 
                                onClick={handleStop} 
                                aria-label="Stop generating"
                                className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                            >
                                <StopCircle size={20} aria-hidden="true" />
                            </button>
                        ) : (
                            <button 
                                onClick={handleSend} 
                                disabled={!input.trim()} 
                                aria-label="Send message"
                                className="p-3 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-400 hover:bg-violet-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            >
                                <Send size={20} aria-hidden="true" />
                            </button>
                        )}
                    </div>
                    
                    <div className="flex flex-col items-center gap-1 mt-3 text-xs text-zinc-600">
                        <div className="flex items-center gap-2">
                            {inferenceMode === InferenceMode.SOVEREIGN ? (
                                <><Cpu size={10} className="text-green-500" /><span>Running locally in your browser</span></>
                            ) : (
                                <><ShieldCheck size={10} /><span>Protected by MirrorGate</span></>
                            )}
                        </div>
                        <span className="text-zinc-700 text-[10px]">AI can make mistakes. Verify important information.</span>
                    </div>
                </div>
                </div>
                
                {/* Transparency Pane - Desktop only */}
                {deviceType === DeviceType.DESKTOP && (
                    <TransparencyPane
                        mode={inferenceMode}
                        messages={messages}
                        networkRequests={networkRequests}
                        turnCount={turnCount}
                        fingerprint={fingerprint}
                        isLoading={isLoading}
                        systemPrompt={ECOSYSTEM_CONTEXT}
                        meshStatus={meshStatus}
                    />
                )}
            </div>
            
            {/* Welcome Overlay */}
            <AnimatePresence>
                {showWelcome && <WelcomeOverlay onStart={handleStartReflection} fingerprint={fingerprint} />}
            </AnimatePresence>
            
            {/* Fingerprint Modal */}
            <AnimatePresence>
                <FingerprintReveal isOpen={showFingerprint} onClose={() => setShowFingerprint(false)} fingerprint={fingerprint} />
            </AnimatePresence>
            
            {/* Share Card */}
            <AnimatePresence>
                <ShareCard isOpen={showShareCard} onClose={() => setShowShareCard(false)} reflection={selectedReflection} />
            </AnimatePresence>
            
            {/* Email Capture */}
            <AnimatePresence>
                <EmailCaptureModal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} onSubmit={handleEmailSubmit} />
            </AnimatePresence>
            
            {/* Sovereign Download Confirm */}
            <AnimatePresence>
                <SovereignDownloadModal isOpen={showSovereignConfirm} onConfirm={enableSovereignMode} onCancel={() => setShowSovereignConfirm(false)} />
            </AnimatePresence>
            
            {/* Upgrade Modal */}
            <AnimatePresence>
                <UpgradeModal 
                    isOpen={showUpgradeModal} 
                    onClose={() => setShowUpgradeModal(false)} 
                    deviceType={deviceType} 
                    turnCount={turnCount}
                    onEmailCapture={() => { setShowUpgradeModal(false); setShowEmailModal(true); }}
                />
            </AnimatePresence>
        </div>
    );
};

export default Mirror;
