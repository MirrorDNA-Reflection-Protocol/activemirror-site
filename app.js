import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";
import { MirrorOS } from "./mirror-os.js";

// Models map
const MODELS = {
    'smollm': 'SmolLM2-360M-Instruct-q0f16-MLC', // Placeholder ID, usually from MLC config
    'llama3': 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
    'phi3': 'Phi-3-mini-4k-instruct-q4f16_1-MLC'
};

// System Prompt
const SYSTEM_PROMPT = `You are MirrorMesh, a sovereign AI reflection partner.

CORE IDENTITY:
- You run locally in the user's browser
- You have persistent memory across sessions
- You help users THINK, not think FOR them

STRICT BEHAVIORS:
1. NEVER give direct advice without asking at least 1 clarifying question first
2. ALWAYS tag confidence on factual claims:
   - [FACT] = Verifiable, you're certain
   - [ESTIMATE] = Reasoned inference
   - [UNKNOWN] = Insufficient data
3. When asked "should I X?", respond with a FRAMEWORK, not an answer
4. Keep responses concise: 2-4 paragraphs max

You are demonstrating what GOVERNED, REFLECTIVE AI feels like.`;

class App {
    constructor() {
        this.os = new MirrorOS();
        this.engine = null;
        this.currentSession = null;
        this.modelId = MODELS['llama3']; // Default
    }

    async init() {
        // Init OS / DB
        const identity = await this.os.init();

        // Router
        if (identity) {
            // Returning user
            this.showView('view-hero'); // For now, show hero but customize text
            document.querySelector('#view-hero h1').innerText = "Welcome Back";
            document.querySelector('#view-hero p').innerText = "Ready to resume reflection?";
            // Auto-select their pref model?
        } else {
            // New user
            this.showView('view-hero');
            this.checkWebGPU();
        }

        this.bindEvents();
    }

    bindEvents() {
        // Model Cards
        document.querySelectorAll('.model-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.model-card').forEach(c => c.classList.remove('recommended'));
                card.classList.add('recommended');
                const key = card.dataset.model;
                this.modelId = MODELS[key] || MODELS['llama3'];
                this.startLoading();
            });
        });

        // Chat
        document.getElementById('send-btn').addEventListener('click', () => this.handleSend());
        document.getElementById('user-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });

        // Sidebar
        document.getElementById('toggle-sidebar').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });
    }

    async checkWebGPU() {
        const el = document.getElementById('webgpu-check');
        if (navigator.gpu) {
            el.innerText = "✓ Device Capabilities Verified: WebGPU Ready";
            el.style.color = "#10b981";
        } else {
            el.innerText = "⚠ WebGPU not detected. Performance may be limited.";
            el.style.color = "#fbbf24";
        }
    }

    async startLoading() {
        this.showView('view-loading');

        // Save preference implicitly for now
        if (!this.os.identity) {
            await this.os.createIdentity({ model: this.modelId });
        }

        try {
            this.engine = await CreateMLCEngine(this.modelId, {
                initProgressCallback: (report) => {
                    const pct = Math.round(report.progress * 100);
                    document.getElementById('dl-progress').style.width = pct + "%";
                    document.getElementById('dl-status').innerText = report.text;
                }
            });

            this.startSession();

        } catch (err) {
            document.getElementById('dl-status').innerText = "Error: " + err.message;
            document.getElementById('dl-status').style.color = "red";
        }
    }

    async startSession() {
        this.showView('view-chat');

        // New Session
        this.currentSession = {
            id: crypto.randomUUID(),
            started: new Date().toISOString(),
            messages: []
        };

        // Welcome
        this.appendMessage('ai', `Welcome. I'm MirrorMesh. I will ask before I advise, and I'll tag what I know vs what I estimate.\n\nWhat's on your mind?`);
    }

    showView(id) {
        document.querySelectorAll('.state-view').forEach(el => el.classList.add('hidden'));
        document.getElementById(id).classList.remove('hidden');
    }

    async handleSend() {
        const input = document.getElementById('user-input');
        const text = input.value.trim();
        if (!text || !this.engine) return;

        // UI
        this.appendMessage('user', text);
        input.value = '';

        // Logic
        this.currentSession.messages.push({ role: 'user', content: text });
        // (Async save to DB here)

        const requestMessages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...this.currentSession.messages
        ];

        // Placeholder for stream logic
        const aiMsgDiv = this.appendMessage('ai', '...');

        try {
            const chunks = await this.engine.chat.completions.create({
                messages: requestMessages,
                stream: true
            });

            let full = "";
            for await (const chunk of chunks) {
                const content = chunk.choices[0]?.delta?.content || "";
                full += content;
                // Live format tags?
                aiMsgDiv.innerHTML = this.formatThinking(full);
                this.scrollToBottom();
            }

            this.currentSession.messages.push({ role: 'assistant', content: full });
            this.os.saveSession(this.currentSession);

        } catch (err) {
            aiMsgDiv.innerText = "Error: " + err.message;
        }
    }

    appendMessage(role, content) {
        const div = document.createElement('div');
        div.className = `message ${role}`;
        if (role === 'ai') {
            div.innerHTML = `<div class="sender">⟡ MirrorMesh</div>${this.formatThinking(content)}`;
        } else {
            div.innerText = content;
        }
        document.getElementById('chat-history').appendChild(div);
        this.scrollToBottom();
        return div;
    }

    formatThinking(text) {
        return text
            .replace(/\[FACT\]/g, '<span class="tag tag-fact">FACT</span>')
            .replace(/\[ESTIMATE\]/g, '<span class="tag tag-estimate">ESTIMATE</span>')
            .replace(/\[UNKNOWN\]/g, '<span class="tag tag-unknown">UNKNOWN</span>');
    }

    scrollToBottom() {
        const el = document.getElementById('chat-history');
        el.scrollTop = el.scrollHeight;
    }
}

// Start
const app = new App();
app.init();
