import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";
import { MirrorOS } from "./mirror-os.js";

// ================================================================
// ACTIVE MIRROROS — Main Application
// ================================================================

const MODELS = {
    'smollm': 'SmolLM2-360M-Instruct-q0f16-MLC',
    'llama3': 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
    'phi3': 'Phi-3-mini-4k-instruct-q4f16_1-MLC'
};

const SYSTEM_PROMPT = `You are MirrorMesh, a sovereign AI reflection partner running in Active MirrorOS.

CORE IDENTITY:
- You run locally in the user's browser — their data never leaves their device
- You help users THINK, not think FOR them
- You remember context within this session

STRICT BEHAVIORS:
1. NEVER give direct advice without asking at least 1 clarifying question first
2. ALWAYS tag confidence on factual claims:
   - [FACT] = Verifiable, you're certain
   - [ESTIMATE] = Reasoned inference, could be wrong
   - [UNKNOWN] = Insufficient data to answer
3. When asked "should I X?", respond with a FRAMEWORK for thinking, not an answer
4. Keep responses concise: 2-4 paragraphs max
5. End complex topics with a focusing question

You are demonstrating what GOVERNED, REFLECTIVE AI feels like.`;

class App {
    constructor() {
        this.os = new MirrorOS();
        this.engine = null;
        this.modelId = MODELS['llama3'];
        this.currentSession = null;
        this.redTeamEnabled = false;
        this.voice = null;
        this.firstMessage = true;
    }

    async init() {
        // Initialize OS
        await this.os.init();

        // Check device
        this.checkDevice();

        // Bind all events
        this.bindEvents();

        // Load vault data
        this.loadVault();
    }

    // ===== DEVICE CHECK =====
    async checkDevice() {
        const status = document.getElementById('device-status');
        const statusText = status.querySelector('.status-text');

        if (!navigator.gpu) {
            status.classList.add('error');
            statusText.textContent = '⚠ WebGPU not supported — try Chrome or Edge';
            return;
        }

        try {
            const adapter = await navigator.gpu.requestAdapter();
            if (adapter) {
                status.classList.add('ready');
                statusText.textContent = '✓ WebGPU ready — click a model to begin';
            } else {
                status.classList.add('error');
                statusText.textContent = '⚠ WebGPU adapter not available';
            }
        } catch (e) {
            status.classList.add('error');
            statusText.textContent = '⚠ Error checking WebGPU';
        }
    }

    // ===== EVENT BINDING =====
    bindEvents() {
        // Model selection
        document.querySelectorAll('.model-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.model-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.modelId = MODELS[card.dataset.model] || MODELS['llama3'];
                this.startLoading();
            });
        });

        // Chat input
        const input = document.getElementById('user-input');
        const sendBtn = document.getElementById('btn-send');

        input.addEventListener('input', () => {
            sendBtn.disabled = input.value.trim() === '';
            // Auto-resize
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 150) + 'px';
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });

        sendBtn.addEventListener('click', () => this.handleSend());

        // Suggestions
        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                input.value = chip.dataset.prompt;
                input.focus();
                sendBtn.disabled = false;
            });
        });

        // Red Team toggle
        document.getElementById('checkbox-redteam').addEventListener('change', (e) => {
            this.redTeamEnabled = e.target.checked;
        });

        // Sidebar
        document.getElementById('btn-menu').addEventListener('click', () => this.openSidebar());
        document.getElementById('btn-close-sidebar').addEventListener('click', () => this.closeSidebar());
        document.getElementById('sidebar-overlay').addEventListener('click', () => this.closeSidebar());

        // Sidebar actions
        document.getElementById('btn-save').addEventListener('click', () => this.saveMirror());
        document.getElementById('btn-export').addEventListener('click', () => this.exportAll());
        document.getElementById('btn-capture').addEventListener('click', () => this.quickCapture());
        document.getElementById('btn-settings').addEventListener('click', () => this.openSettings());

        // Voice
        this.initVoice();
        document.getElementById('btn-voice').addEventListener('click', () => this.toggleVoice());
    }

    // ===== VIEWS =====
    showView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
        document.getElementById(viewId).classList.remove('hidden');
    }

    // ===== LOADING =====
    async startLoading() {
        this.showView('view-loading');

        const percentEl = document.getElementById('loading-percent');
        const statusEl = document.getElementById('loading-status');
        const ringEl = document.getElementById('progress-ring');
        const circumference = 2 * Math.PI * 45; // r=45

        try {
            this.engine = await CreateMLCEngine(this.modelId, {
                initProgressCallback: (report) => {
                    const pct = Math.round(report.progress * 100);
                    percentEl.textContent = pct + '%';
                    statusEl.textContent = report.text;
                    // Update ring
                    const offset = circumference - (pct / 100) * circumference;
                    ringEl.style.strokeDashoffset = offset;
                }
            });

            // Success — start session
            this.startSession();

        } catch (err) {
            statusEl.textContent = 'Error: ' + err.message;
            statusEl.style.color = 'var(--danger)';
        }
    }

    // ===== SESSION =====
    startSession() {
        this.showView('view-chat');

        // Enable input
        const input = document.getElementById('user-input');
        input.disabled = false;
        input.focus();

        // Create session
        this.currentSession = {
            id: crypto.randomUUID(),
            started: new Date().toISOString(),
            title: 'New Session',
            messages: []
        };

        // Welcome message
        this.appendMessage('ai', `Welcome to Active MirrorOS. I'm your reflection partner — I'll help you think, not think for you.

I'll ask before I advise, and I'll tag what I know: [FACT], [ESTIMATE], or [UNKNOWN].

What's on your mind?`);
    }

    // ===== MESSAGING =====
    async handleSend() {
        const input = document.getElementById('user-input');
        const text = input.value.trim();
        if (!text || !this.engine) return;

        // Hide suggestions after first message
        if (this.firstMessage) {
            document.getElementById('suggestions').style.display = 'none';
            this.firstMessage = false;
        }

        // Add user message
        this.appendMessage('user', text);
        input.value = '';
        input.style.height = 'auto';
        document.getElementById('btn-send').disabled = true;

        // Store message
        this.currentSession.messages.push({ role: 'user', content: text });

        // Generate response
        const requestMessages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...this.currentSession.messages
        ];

        const aiMsgEl = this.appendMessage('ai', '');
        const contentEl = aiMsgEl.querySelector('.message-text');
        let fullResponse = '';
        const startTime = performance.now();

        try {
            const stream = await this.engine.chat.completions.create({
                messages: requestMessages,
                stream: true,
                max_tokens: 800
            });

            let firstToken = true;

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                    if (firstToken) {
                        const latency = Math.round(performance.now() - startTime);
                        document.querySelector('#stat-latency span').textContent = latency + 'ms';
                        firstToken = false;
                    }
                    fullResponse += content;
                    contentEl.innerHTML = this.formatText(fullResponse);
                    this.scrollToBottom();
                }
            }

            // Store response
            this.currentSession.messages.push({ role: 'assistant', content: fullResponse });

            // Auto-title based on first exchange
            if (this.currentSession.messages.length === 2) {
                this.currentSession.title = text.substring(0, 50) + (text.length > 50 ? '...' : '');
            }

            // Save session
            await this.os.saveSession(this.currentSession);
            this.loadVault();

            // Red Team
            if (this.redTeamEnabled) {
                await this.runRedTeam(fullResponse);
            }

        } catch (err) {
            contentEl.textContent = 'Error: ' + err.message;
        }
    }

    async runRedTeam(advice) {
        const prompt = `You are a ruthless Red Team auditor. In 2-3 sentences, critique this for:
- Unstated assumptions
- Missing risks or edge cases
- Logical gaps

Start with "⚠️ Devil's Advocate:"

ADVICE TO CRITIQUE:
${advice}`;

        const redMsgEl = this.appendMessage('red-team', 'Analyzing...');
        const contentEl = redMsgEl.querySelector('.message-text');

        try {
            const response = await this.engine.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 200
            });
            contentEl.innerHTML = this.formatText(response.choices[0].message.content);
            this.scrollToBottom();
        } catch (err) {
            contentEl.textContent = '⚠️ Red Team analysis failed.';
        }
    }

    appendMessage(role, content) {
        const container = document.getElementById('chat-messages');
        const div = document.createElement('div');
        div.className = `message ${role}`;

        if (role === 'ai') {
            div.innerHTML = `
        <div class="message-content">
          <div class="message-sender"><span class="glyph">⟡</span> MirrorMesh</div>
          <div class="message-text">${this.formatText(content)}</div>
        </div>
      `;
        } else if (role === 'red-team') {
            div.innerHTML = `
        <div class="message-content">
          <div class="message-text">${content}</div>
        </div>
      `;
        } else {
            div.innerHTML = `<div class="message-content">${content}</div>`;
        }

        container.appendChild(div);
        this.scrollToBottom();
        return div;
    }

    formatText(text) {
        return text
            .replace(/\[FACT\]/g, '<span class="tag tag-fact">FACT</span>')
            .replace(/\[ESTIMATE\]/g, '<span class="tag tag-estimate">ESTIMATE</span>')
            .replace(/\[UNKNOWN\]/g, '<span class="tag tag-unknown">UNKNOWN</span>');
    }

    scrollToBottom() {
        const container = document.getElementById('chat-messages');
        requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
        });
    }

    // ===== SIDEBAR =====
    openSidebar() {
        document.getElementById('sidebar').classList.add('open');
        document.getElementById('sidebar-overlay').classList.add('active');
    }

    closeSidebar() {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('active');
    }

    async loadVault() {
        const sessions = await this.os.getRecentSessions();
        const sessionList = document.getElementById('vault-sessions');
        const sessionCount = document.getElementById('session-count');

        sessionCount.textContent = sessions.length;

        if (sessions.length === 0) {
            sessionList.innerHTML = '<div class="vault-empty">No sessions yet</div>';
            return;
        }

        sessionList.innerHTML = sessions.map(s => `
      <div class="vault-item" data-id="${s.id}">
        ${s.title || 'Untitled Session'}
      </div>
    `).join('');
    }

    // ===== VOICE =====
    initVoice() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            document.getElementById('btn-voice').style.display = 'none';
            return;
        }

        this.voice = new SpeechRecognition();
        this.voice.continuous = false;
        this.voice.interimResults = false;
        this.voice.lang = 'en-US';

        this.voice.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('user-input').value = transcript;
            document.getElementById('btn-send').disabled = false;
            document.getElementById('btn-voice').classList.remove('recording');
        };

        this.voice.onerror = () => {
            document.getElementById('btn-voice').classList.remove('recording');
        };

        this.voice.onend = () => {
            document.getElementById('btn-voice').classList.remove('recording');
        };
    }

    toggleVoice() {
        if (!this.voice) return;
        const btn = document.getElementById('btn-voice');

        if (btn.classList.contains('recording')) {
            this.voice.stop();
            btn.classList.remove('recording');
        } else {
            this.voice.start();
            btn.classList.add('recording');
        }
    }

    // ===== ACTIONS =====
    async saveMirror() {
        const data = {
            exported: new Date().toISOString(),
            type: 'mirror-seed',
            session: this.currentSession
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mirror-seed-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async exportAll() {
        const data = await this.os.exportAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `active-mirroros-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    quickCapture() {
        const text = prompt('Quick capture — what\'s on your mind?');
        if (text) {
            alert('Captured! (Full vault storage coming soon)');
        }
    }

    openSettings() {
        alert('Settings panel coming soon!');
    }
}

// ===== INIT =====
const app = new App();
app.init();
