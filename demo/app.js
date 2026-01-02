import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";
import { MirrorOS } from "./mirror-os.js";
import { VoiceService } from "./voice.js";

// Models map
const MODELS = {
    'smollm': 'SmolLM2-360M-Instruct-q0f16-MLC',
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
        this.voice = new VoiceService();
        this.engine = null;
        this.currentSession = null;
        this.modelId = MODELS['llama3']; // Default
        this.redTeamEnabled = false;
        this.firstMessage = true;
    }

    async init() {
        try {
            const identity = await this.os.init();

            if (identity) {
                this.showView('view-hero');
                document.querySelector('#view-hero h1').innerText = "Welcome Back";
                document.querySelector('#view-hero > p').innerHTML = "Ready to resume reflection?<br>Select a model to continue.";
            } else {
                this.showView('view-hero');
            }

            this.checkWebGPU();
        } catch (err) {
            console.error("OS Init Failed:", err);
            document.querySelector('#view-hero > p').innerText = "Error initializing. Please disable Private Mode.";
            document.querySelector('#view-hero > p').style.color = "#ef4444";
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

        const input = document.getElementById('user-input');
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });

        input.addEventListener('input', () => {
            document.getElementById('send-btn').disabled = input.value.trim() === '';
            // Auto-resize
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 120) + 'px';
        });

        // Suggestions
        document.querySelectorAll('.suggestion').forEach(btn => {
            btn.addEventListener('click', () => {
                input.value = btn.dataset.prompt;
                input.focus();
                document.getElementById('send-btn').disabled = false;
            });
        });

        // Red Team toggle
        document.getElementById('red-team-toggle').addEventListener('change', (e) => {
            this.redTeamEnabled = e.target.checked;
        });

        // Export
        document.getElementById('export-btn').addEventListener('click', () => this.exportMirror());

        // Sidebar toggle
        document.getElementById('toggle-sidebar').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });

        // Voice
        this.setupVoice();
    }

    setupVoice() {
        const voiceBtn = document.getElementById('voice-btn');

        if (!this.voice.isSupported()) {
            voiceBtn.disabled = true;
            voiceBtn.title = 'Voice not supported in this browser';
            return;
        }

        this.voice.onResult = (transcript) => {
            document.getElementById('user-input').value = transcript;
            document.getElementById('send-btn').disabled = false;
            voiceBtn.classList.remove('recording');
        };

        this.voice.onError = () => {
            voiceBtn.classList.remove('recording');
        };

        voiceBtn.addEventListener('click', () => {
            const isRecording = this.voice.toggle();
            voiceBtn.classList.toggle('recording', isRecording);
        });
    }

    async checkWebGPU() {
        const el = document.getElementById('webgpu-check');
        if (navigator.gpu) {
            el.innerText = "✓ WebGPU Ready";
            el.style.color = "#10b981";
        } else {
            el.innerText = "⚠ WebGPU not detected. Performance may be limited.";
            el.style.color = "#fbbf24";
        }
    }

    async startLoading() {
        this.showView('view-loading');

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
            document.getElementById('dl-status').style.color = "#ef4444";
        }
    }

    startSession() {
        this.showView('view-chat');

        // Enable input
        document.getElementById('user-input').disabled = false;
        document.getElementById('user-input').focus();

        // New Session
        this.currentSession = {
            id: crypto.randomUUID(),
            started: new Date().toISOString(),
            messages: []
        };

        // Welcome
        this.appendMessage('ai', `Welcome. I'm MirrorMesh — a reflection partner, not an answer machine.

I'll ask before I advise. I'll tag what I know: [FACT], [ESTIMATE], [UNKNOWN].

What's on your mind?`);
    }

    showView(id) {
        document.querySelectorAll('.state-view').forEach(el => el.classList.add('hidden'));
        document.getElementById(id).classList.remove('hidden');
    }

    async handleSend() {
        const input = document.getElementById('user-input');
        const text = input.value.trim();
        if (!text || !this.engine) return;

        // Hide suggestions after first message
        if (this.firstMessage) {
            document.getElementById('suggestions').style.display = 'none';
            this.firstMessage = false;
        }

        // UI
        this.appendMessage('user', text);
        input.value = '';
        input.style.height = 'auto';
        document.getElementById('send-btn').disabled = true;

        this.currentSession.messages.push({ role: 'user', content: text });

        const requestMessages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...this.currentSession.messages
        ];

        const aiMsgDiv = this.appendMessage('ai', '...');
        const startTime = performance.now();
        let firstToken = true;

        try {
            const chunks = await this.engine.chat.completions.create({
                messages: requestMessages,
                stream: true
            });

            let full = "";
            for await (const chunk of chunks) {
                const content = chunk.choices[0]?.delta?.content || "";
                if (content) {
                    if (firstToken) {
                        document.getElementById('stat-latency').textContent = `⚡ ${Math.round(performance.now() - startTime)}ms`;
                        firstToken = false;
                    }
                    full += content;
                    aiMsgDiv.innerHTML = `<div class="sender">⟡ MirrorMesh</div>${this.formatThinking(full)}`;
                    this.scrollToBottom();
                }
            }

            this.currentSession.messages.push({ role: 'assistant', content: full });
            this.os.saveSession(this.currentSession);

            // Update carbon
            const carbonEl = document.getElementById('stat-carbon');
            const currentCarbon = parseFloat(carbonEl.textContent.match(/[\d.]+/)?.[0] || 0);
            carbonEl.textContent = `🌱 ${(currentCarbon + 0.04).toFixed(2)}g`;

            // Red Team
            if (this.redTeamEnabled) {
                await this.runRedTeam(full);
            }

        } catch (err) {
            aiMsgDiv.innerHTML = `<div class="sender">⟡ MirrorMesh</div>Error: ${err.message}`;
        }

        document.getElementById('send-btn').disabled = input.value.trim() === '';
    }

    async runRedTeam(advice) {
        const prompt = `You are a Red Team auditor. In 2-3 sentences, critique this for unstated assumptions, missing risks, or logical gaps. Start with "⚠️":

${advice}`;

        const redDiv = this.appendMessage('red-team', '<em>Analyzing...</em>');

        try {
            const response = await this.engine.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                max_tokens: 150,
            });
            redDiv.innerHTML = response.choices[0].message.content;
            this.scrollToBottom();
        } catch (err) {
            redDiv.innerHTML = "⚠️ Red Team analysis failed.";
        }
    }

    async exportMirror() {
        const data = await this.os.exportAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mirror-seed-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    appendMessage(role, content) {
        const div = document.createElement('div');
        div.className = `message ${role}`;

        if (role === 'ai') {
            div.innerHTML = `<div class="sender">⟡ MirrorMesh</div>${this.formatThinking(content)}`;
        } else if (role === 'red-team') {
            div.innerHTML = content;
        } else {
            div.textContent = content;
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
