import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";
import { MirrorOS } from "./mirror-os.js";

// ================================================================
// ACTIVE MIRROROS — Complete Application
// ================================================================

// ===== MODEL CATALOG =====
const MODEL_CATALOG = [
    {
        id: 'smollm-135m',
        name: 'SmolLM 135M',
        displayName: 'Nano',
        icon: '⚡',
        size: '100MB',
        sizeBytes: 100_000_000,
        quality: 1,
        speed: 5,
        minMemory: 2,
        minCores: 2,
        description: 'Ultra-fast, basic tasks',
        webllmId: 'SmolLM2-135M-Instruct-q0f16-MLC'
    },
    {
        id: 'smollm-360m',
        name: 'SmolLM 360M',
        displayName: 'Quick',
        icon: '⚡',
        size: '200MB',
        sizeBytes: 200_000_000,
        quality: 2,
        speed: 4,
        minMemory: 3,
        minCores: 4,
        description: 'Fast answers, simple tasks',
        webllmId: 'SmolLM2-360M-Instruct-q0f16-MLC'
    },
    {
        id: 'llama-1b',
        name: 'Llama 3.2 1B',
        displayName: 'Light',
        icon: '△',
        size: '700MB',
        sizeBytes: 700_000_000,
        quality: 3,
        speed: 3,
        minMemory: 4,
        minCores: 4,
        description: 'Good balance of speed and capability',
        webllmId: 'Llama-3.2-1B-Instruct-q4f16_1-MLC'
    },
    {
        id: 'llama-3b',
        name: 'Llama 3.2 3B',
        displayName: 'Reflect',
        icon: '⟡',
        size: '1.8GB',
        sizeBytes: 1_800_000_000,
        quality: 4,
        speed: 2,
        minMemory: 6,
        minCores: 4,
        description: 'Deep reflection, structured thinking',
        webllmId: 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
        recommended: true
    },
    {
        id: 'phi-3-mini',
        name: 'Phi-3 Mini',
        displayName: 'Reason',
        icon: '◈',
        size: '2.2GB',
        sizeBytes: 2_200_000_000,
        quality: 5,
        speed: 2,
        minMemory: 8,
        minCores: 6,
        description: 'Advanced reasoning, complex analysis',
        webllmId: 'Phi-3-mini-4k-instruct-q4f16_1-MLC'
    },
    {
        id: 'qwen-1.5b',
        name: 'Qwen 2.5 1.5B',
        displayName: 'Global',
        icon: '🌐',
        size: '1GB',
        sizeBytes: 1_000_000_000,
        quality: 3,
        speed: 3,
        minMemory: 4,
        minCores: 4,
        description: 'Excellent multilingual support',
        webllmId: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC'
    }
];

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

// ===== MAIN APP =====
class App {
    constructor() {
        this.os = new MirrorOS();
        this.engine = null;
        this.selectedModel = null;
        this.recommendedModel = null;
        this.deviceInfo = null;
        this.currentSession = null;
        this.redTeamEnabled = false;
        this.voice = null;
        this.firstMessage = true;
        this.showAllModels = false;
        this.deferredInstallPrompt = null;
    }

    async init() {
        // Set default model before anything else
        this.selectedModel = MODEL_CATALOG.find(m => m.recommended) || MODEL_CATALOG[3];
        this.recommendedModel = this.selectedModel;

        // Initialize OS
        await this.os.init();

        // Check for returning user
        const identity = this.os.identity;
        const sessions = await this.os.getRecentSessions();

        if (identity && sessions.length > 0) {
            this.showReturningUserFlow(identity, sessions);
        } else {
            this.showView('view-welcome');
            this.renderModelGrid(); // Render with defaults first
        }

        // Bind all events
        this.bindEvents();

        // Check device (async, will re-render grid when done)
        this.detectDevice().then(() => {
            // Re-render grid with actual device info
            if (!document.getElementById('view-welcome').classList.contains('hidden')) {
                this.renderModelGrid();
            }
        });

        // Setup PWA install
        this.setupPWAInstall();

        // Setup offline detection
        this.setupOfflineDetection();

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    // ===== DEVICE DETECTION =====
    async detectDevice() {
        const device = {
            memory: navigator.deviceMemory || 4,
            cores: navigator.hardwareConcurrency || 4,
            connection: navigator.connection ? {
                type: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                saveData: navigator.connection.saveData
            } : { type: '4g', downlink: 10, saveData: false },
            gpu: null,
            platform: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
            battery: null
        };

        // WebGPU check
        if (navigator.gpu) {
            try {
                const adapter = await navigator.gpu.requestAdapter();
                if (adapter) {
                    const info = await adapter.requestAdapterInfo?.() || {};
                    device.gpu = { available: true, vendor: info.vendor || 'Unknown' };
                }
            } catch (e) {
                device.gpu = { available: false };
            }
        }

        // Battery
        if (navigator.getBattery) {
            try {
                const battery = await navigator.getBattery();
                device.battery = { level: battery.level, charging: battery.charging };
            } catch (e) { }
        }

        this.deviceInfo = device;
        this.updateDeviceUI();
        this.recommendModel();
    }

    updateDeviceUI() {
        const d = this.deviceInfo;
        document.getElementById('spec-memory').textContent = `${d.memory}GB RAM`;
        document.getElementById('spec-cores').textContent = `${d.cores} Cores`;
        document.getElementById('spec-connection').textContent = d.connection.type.toUpperCase();

        const gpuEl = document.getElementById('spec-gpu');
        if (d.gpu?.available) {
            gpuEl.textContent = '✓ WebGPU';
            gpuEl.style.color = 'var(--success)';
        } else {
            gpuEl.textContent = '⚠ No WebGPU';
            gpuEl.style.color = 'var(--warning)';
        }
    }

    recommendModel() {
        const d = this.deviceInfo;

        // Score device (0-100)
        let score = 0;
        score += Math.min(d.memory * 3, 30);
        score += Math.min(d.cores * 2.5, 20);
        if (d.connection.type === '4g') score += 20;
        else if (d.connection.type === '3g') score += 10;
        if (d.gpu?.available) score += 20;
        if (d.platform === 'desktop') score += 10;
        if (d.battery && !d.battery.charging && d.battery.level < 0.2) score -= 20;

        score = Math.max(0, Math.min(100, Math.round(score)));
        document.getElementById('device-score').textContent = score;

        // Find best model
        let recommended = MODEL_CATALOG[0];

        for (const model of MODEL_CATALOG) {
            const canRun = d.memory >= model.minMemory && d.cores >= model.minCores;
            if (canRun) {
                if (score >= 80 && model.quality >= 4) recommended = model;
                else if (score >= 60 && model.quality >= 3) recommended = model;
                else if (score >= 40 && model.quality >= 2) recommended = model;
            }
        }

        this.recommendedModel = recommended;
        this.selectedModel = recommended;

        // Update recommendation UI
        document.getElementById('rec-model-name').textContent =
            `${recommended.displayName} (${recommended.name})`;
    }

    renderModelGrid() {
        const grid = document.getElementById('model-grid');
        if (!grid) return;

        const modelsToShow = this.showAllModels ? MODEL_CATALOG : MODEL_CATALOG.slice(0, 4);

        // Use device info or defaults
        const d = this.deviceInfo || {
            memory: 8,
            cores: 4,
            connection: { downlink: 10 }
        };

        grid.innerHTML = modelsToShow.map(model => {
            const canRun = d.memory >= model.minMemory && d.cores >= model.minCores;
            const downloadTime = Math.round(model.sizeBytes / ((d.connection?.downlink || 10) * 125000));
            const isSelected = this.selectedModel?.id === model.id;
            const isRecommended = this.recommendedModel?.id === model.id;

            return `
        <button class="model-card ${isSelected ? 'selected' : ''} ${!canRun ? 'disabled' : ''}" 
                data-model-id="${model.id}" ${!canRun ? 'disabled' : ''}>
          ${isRecommended ? '<div class="model-badge">Recommended</div>' : ''}
          <div class="model-icon">${model.icon}</div>
          <div class="model-info">
            <div class="model-name">${model.displayName}</div>
            <div class="model-meta">${model.name} · ${model.size}</div>
            <div class="model-desc">${model.description}</div>
            <div class="model-download-time">~${downloadTime}s download</div>
          </div>
        </button>
      `;
        }).join('');

        // Re-bind model card clicks
        grid.querySelectorAll('.model-card:not(.disabled)').forEach(card => {
            card.addEventListener('click', () => {
                const modelId = card.dataset.modelId;
                this.selectedModel = MODEL_CATALOG.find(m => m.id === modelId);
                this.renderModelGrid();
                this.startLoading();
            });
        });
    }

    // ===== RETURNING USER =====
    showReturningUserFlow(identity, sessions) {
        // Calculate time since last visit
        const lastVisit = new Date(identity.lastSeen || identity.stats?.lastVisit || identity.created);
        const now = new Date();
        const hoursSince = Math.round((now - lastVisit) / (1000 * 60 * 60));

        let timeText;
        if (hoursSince < 1) timeText = 'moments ago';
        else if (hoursSince < 24) timeText = `${hoursSince} hours ago`;
        else if (hoursSince < 48) timeText = 'yesterday';
        else timeText = `${Math.round(hoursSince / 24)} days ago`;

        const lastSession = sessions[0];

        this.showView('view-returning');

        document.getElementById('return-time').textContent = timeText;
        document.getElementById('return-session-title').textContent = lastSession.title || 'Your last session';
        document.getElementById('return-session-preview').textContent = this.getSessionPreview(lastSession);

        // Populate recent sessions list
        const list = document.getElementById('recent-session-list');
        list.innerHTML = sessions.slice(0, 5).map(s => `
      <div class="session-list-item" data-session-id="${s.id}">
        <span class="title">${s.title || 'Untitled Session'}</span>
        <span class="date">${this.formatDate(s.started)}</span>
      </div>
    `).join('');

        // Update identity last seen
        this.os.updateIdentity({ lastSeen: new Date().toISOString() });

        // Store last session for continue
        this.lastSession = lastSession;
    }

    getSessionPreview(session) {
        if (!session.messages || session.messages.length === 0) {
            return 'No messages yet';
        }
        const lastUserMsg = [...session.messages].reverse().find(m => m.role === 'user');
        if (lastUserMsg) {
            return lastUserMsg.content.substring(0, 100) + (lastUserMsg.content.length > 100 ? '...' : '');
        }
        return 'Continue your reflection...';
    }

    formatDate(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diff = now - date;

        if (diff < 86400000) { // Less than 1 day
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diff < 604800000) { // Less than 1 week
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    }

    // ===== EVENT BINDING =====
    bindEvents() {
        // Use recommended button
        document.getElementById('btn-use-recommended')?.addEventListener('click', () => {
            this.startLoading();
        });

        // Show all models
        document.getElementById('btn-show-all-models')?.addEventListener('click', () => {
            this.showAllModels = !this.showAllModels;
            document.getElementById('btn-show-all-models').textContent =
                this.showAllModels ? 'Show fewer ↑' : 'Show all models ↓';
            this.renderModelGrid();
        });

        // Returning user buttons
        document.getElementById('btn-continue-session')?.addEventListener('click', () => {
            if (this.lastSession) {
                this.continueSession(this.lastSession);
            }
        });

        document.getElementById('btn-new-session')?.addEventListener('click', () => {
            this.showView('view-welcome');
            this.renderModelGrid();
        });

        document.getElementById('btn-change-model')?.addEventListener('click', () => {
            this.showView('view-welcome');
            this.renderModelGrid();
        });

        document.getElementById('btn-open-vault')?.addEventListener('click', () => {
            this.openSidebar();
        });

        document.getElementById('btn-export-returning')?.addEventListener('click', () => {
            this.exportAll();
        });

        // Chat input
        const input = document.getElementById('user-input');
        const sendBtn = document.getElementById('btn-send');

        input?.addEventListener('input', () => {
            sendBtn.disabled = input.value.trim() === '';
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 150) + 'px';
        });

        input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });

        sendBtn?.addEventListener('click', () => this.handleSend());

        // Suggestions
        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                input.value = chip.dataset.prompt;
                input.focus();
                sendBtn.disabled = false;
            });
        });

        // Red Team toggle
        document.getElementById('checkbox-redteam')?.addEventListener('change', (e) => {
            this.redTeamEnabled = e.target.checked;
        });

        // Sidebar
        document.getElementById('btn-menu')?.addEventListener('click', () => this.openSidebar());
        document.getElementById('btn-close-sidebar')?.addEventListener('click', () => this.closeSidebar());
        document.getElementById('sidebar-overlay')?.addEventListener('click', () => this.closeSidebar());

        // Sidebar actions
        document.getElementById('btn-save')?.addEventListener('click', () => this.saveMirror());
        document.getElementById('btn-export')?.addEventListener('click', () => this.exportAll());
        document.getElementById('btn-capture')?.addEventListener('click', () => this.openCaptureModal());
        document.getElementById('btn-settings')?.addEventListener('click', () => this.openSettingsModal());

        // Vault tabs
        document.querySelectorAll('.vault-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.vault-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.loadVault(tab.dataset.type);
            });
        });

        // Vault search
        document.getElementById('vault-search')?.addEventListener('input', (e) => {
            this.searchVault(e.target.value);
        });

        // Voice
        this.initVoice();
        document.getElementById('btn-voice')?.addEventListener('click', () => this.toggleVoice());

        // Modals
        document.getElementById('close-capture-modal')?.addEventListener('click', () => this.closeCaptureModal());
        document.getElementById('save-capture')?.addEventListener('click', () => this.saveCapture());
        document.getElementById('close-settings-modal')?.addEventListener('click', () => this.closeSettingsModal());
        document.getElementById('btn-export-data')?.addEventListener('click', () => this.exportAll());
        document.getElementById('btn-clear-data')?.addEventListener('click', () => this.clearAllData());

        // Modal backdrop closes
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', () => {
                this.closeCaptureModal();
                this.closeSettingsModal();
            });
        });

        // PWA Install
        document.getElementById('btn-install')?.addEventListener('click', () => this.installPWA());
    }

    // ===== VIEWS =====
    showView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
        document.getElementById(viewId)?.classList.remove('hidden');
    }

    // ===== LOADING =====
    async startLoading() {
        if (!this.selectedModel) return;

        this.showView('view-loading');

        const percentEl = document.getElementById('loading-percent');
        const statusEl = document.getElementById('loading-status');
        const ringEl = document.getElementById('progress-ring');
        const circumference = 2 * Math.PI * 45;

        try {
            this.engine = await CreateMLCEngine(this.selectedModel.webllmId, {
                initProgressCallback: (report) => {
                    const pct = Math.round(report.progress * 100);
                    percentEl.textContent = pct + '%';
                    statusEl.textContent = report.text;
                    const offset = circumference - (pct / 100) * circumference;
                    ringEl.style.strokeDashoffset = offset;
                }
            });

            // Save model preference
            await this.os.updateIdentity({
                preferences: { model: this.selectedModel.id }
            });

            this.startSession();

        } catch (err) {
            statusEl.textContent = 'Error: ' + err.message;
            statusEl.style.color = 'var(--danger)';
        }
    }

    // ===== SESSION =====
    startSession() {
        this.showView('view-chat');

        const input = document.getElementById('user-input');
        input.disabled = false;
        input.focus();

        this.currentSession = {
            id: crypto.randomUUID(),
            started: new Date().toISOString(),
            title: 'New Session',
            model: this.selectedModel?.id,
            messages: []
        };

        this.appendMessage('ai', `Welcome to Active MirrorOS. I'm your reflection partner — I'll help you think, not think for you.

I'll ask before I advise, and I'll tag what I know: [FACT], [ESTIMATE], or [UNKNOWN].

What's on your mind?`);

        this.loadVault();
    }

    async continueSession(session) {
        // Need to load model first
        if (!this.engine) {
            // Find the model used in this session
            const modelId = session.model || 'llama-3b';
            this.selectedModel = MODEL_CATALOG.find(m => m.id === modelId) || MODEL_CATALOG[3];
            await this.startLoading();
            return;
        }

        this.currentSession = session;
        this.showView('view-chat');

        const container = document.getElementById('chat-messages');
        container.innerHTML = '';

        for (const msg of session.messages) {
            this.appendMessage(msg.role === 'user' ? 'user' : 'ai', msg.content, false);
        }

        this.appendMessage('system', '— Continuing from previous session —', false);

        document.getElementById('user-input').disabled = false;
        document.getElementById('user-input').focus();
        document.getElementById('suggestions').style.display = 'none';
        this.firstMessage = false;

        this.loadVault();
    }

    // ===== MESSAGING =====
    async handleSend() {
        const input = document.getElementById('user-input');
        const text = input.value.trim();
        if (!text || !this.engine) return;

        if (this.firstMessage) {
            document.getElementById('suggestions').style.display = 'none';
            this.firstMessage = false;
        }

        this.appendMessage('user', text);
        input.value = '';
        input.style.height = 'auto';
        document.getElementById('btn-send').disabled = true;

        this.currentSession.messages.push({ role: 'user', content: text });

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

            this.currentSession.messages.push({ role: 'assistant', content: fullResponse });

            if (this.currentSession.messages.length === 2) {
                this.currentSession.title = text.substring(0, 50) + (text.length > 50 ? '...' : '');
            }

            await this.os.saveSession(this.currentSession);
            this.loadVault();

            if (this.redTeamEnabled) {
                await this.runRedTeam(fullResponse);
            }

        } catch (err) {
            contentEl.textContent = 'Error: ' + err.message;
        }
    }

    async runRedTeam(advice) {
        const prompt = `You are a ruthless Red Team auditor. In 2-3 sentences, critique this for unstated assumptions, missing risks, or logical gaps. Start with "⚠️ Devil's Advocate:"\n\n${advice}`;

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

    appendMessage(role, content, animate = true) {
        const container = document.getElementById('chat-messages');
        const div = document.createElement('div');
        div.className = `message ${role}`;
        if (!animate) div.style.animation = 'none';

        if (role === 'ai') {
            div.innerHTML = `
        <div class="message-content">
          <div class="message-sender"><span class="glyph">⟡</span> MirrorMesh</div>
          <div class="message-text">${this.formatText(content)}</div>
        </div>
      `;
        } else if (role === 'red-team') {
            div.innerHTML = `<div class="message-content"><div class="message-text">${content}</div></div>`;
        } else if (role === 'system') {
            div.innerHTML = `<div class="message-content">${content}</div>`;
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

    // ===== SIDEBAR / VAULT =====
    openSidebar() {
        document.getElementById('sidebar').classList.add('open');
        document.getElementById('sidebar-overlay').classList.add('active');
        this.loadVault();
    }

    closeSidebar() {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('active');
    }

    async loadVault(type = 'all') {
        const sessions = await this.os.getRecentSessions();
        const captures = await this.os.getVaultItems({ type: 'capture' });
        const list = document.getElementById('vault-list');

        let items = [];

        if (type === 'all' || type === 'session') {
            items.push(...sessions.map(s => ({ ...s, itemType: 'session' })));
        }
        if (type === 'all' || type === 'capture') {
            items.push(...captures.map(c => ({ ...c, itemType: 'capture' })));
        }
        if (type === 'starred') {
            const allItems = [...sessions, ...captures];
            items = allItems.filter(i => i.starred);
        }

        // Sort by date
        items.sort((a, b) => new Date(b.started || b.created) - new Date(a.started || a.created));

        if (items.length === 0) {
            list.innerHTML = '<div class="vault-empty">No items yet</div>';
            return;
        }

        list.innerHTML = items.map(item => `
      <div class="vault-item" data-id="${item.id}" data-type="${item.itemType}">
        <div>
          <div class="title">${item.title || 'Untitled'}</div>
          <div class="meta">${item.itemType === 'session' ? '💬' : '✨'} ${this.formatDate(item.started || item.created)}</div>
        </div>
        ${item.starred ? '<span class="star">★</span>' : ''}
      </div>
    `).join('');

        // Bind vault item clicks
        list.querySelectorAll('.vault-item').forEach(el => {
            el.addEventListener('click', () => {
                const id = el.dataset.id;
                const type = el.dataset.type;
                if (type === 'session') {
                    this.loadSessionFromVault(id);
                }
            });
        });

        // Update counts
        document.getElementById('session-count')?.textContent = sessions.length;
        document.getElementById('capture-count')?.textContent = captures.length;
    }

    async loadSessionFromVault(sessionId) {
        const session = await this.os.getSession(sessionId);
        if (session) {
            this.closeSidebar();
            this.continueSession(session);
        }
    }

    async searchVault(query) {
        if (!query.trim()) {
            this.loadVault();
            return;
        }

        const results = await this.os.searchVault(query);
        const list = document.getElementById('vault-list');

        if (results.length === 0) {
            list.innerHTML = '<div class="vault-empty">No results found</div>';
            return;
        }

        list.innerHTML = results.map(item => `
      <div class="vault-item" data-id="${item.id}" data-type="${item.type || 'session'}">
        <div>
          <div class="title">${item.title || 'Untitled'}</div>
          <div class="meta">${this.formatDate(item.started || item.created)}</div>
        </div>
      </div>
    `).join('');
    }

    // ===== MODALS =====
    openCaptureModal() {
        document.getElementById('capture-modal').classList.remove('hidden');
        document.getElementById('capture-text').focus();
    }

    closeCaptureModal() {
        document.getElementById('capture-modal').classList.add('hidden');
        document.getElementById('capture-text').value = '';
        document.getElementById('capture-tags').value = '';
    }

    async saveCapture() {
        const text = document.getElementById('capture-text').value.trim();
        const tagsStr = document.getElementById('capture-tags').value;

        if (!text) return;

        const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);

        await this.os.createVaultItem('capture', {
            title: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
            content: text,
            tags
        });

        this.closeCaptureModal();
        this.loadVault();
    }

    openSettingsModal() {
        document.getElementById('settings-modal').classList.remove('hidden');
        this.loadSettingsData();
    }

    closeSettingsModal() {
        document.getElementById('settings-modal').classList.add('hidden');
    }

    async loadSettingsData() {
        // Load storage estimate
        if (navigator.storage && navigator.storage.estimate) {
            const estimate = await navigator.storage.estimate();
            const usedMB = (estimate.usage / (1024 * 1024)).toFixed(1);
            document.getElementById('storage-used').textContent = `${usedMB} MB`;
        }

        // Load session count
        const sessions = await this.os.getRecentSessions();
        document.getElementById('total-sessions').textContent = sessions.length;

        // Populate model selector
        const select = document.getElementById('setting-model');
        if (select) {
            select.innerHTML = MODEL_CATALOG.map(m =>
                `<option value="${m.id}" ${this.selectedModel?.id === m.id ? 'selected' : ''}>${m.displayName} (${m.name})</option>`
            ).join('');
        }
    }

    async clearAllData() {
        if (!confirm('This will delete ALL your data including sessions, vault items, and identity. Are you sure?')) {
            return;
        }

        await this.os.clearAll();
        location.reload();
    }

    // ===== VOICE =====
    initVoice() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            document.getElementById('btn-voice')?.style?.setProperty('display', 'none');
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

        this.downloadJSON(data, `mirror-seed-${new Date().toISOString().split('T')[0]}.json`);
    }

    async exportAll() {
        const data = await this.os.exportAll();
        this.downloadJSON(data, `active-mirroros-export-${new Date().toISOString().split('T')[0]}.json`);
    }

    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ===== PWA =====
    setupPWAInstall() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredInstallPrompt = e;
            document.getElementById('btn-install')?.style?.setProperty('display', 'flex');
        });
    }

    async installPWA() {
        if (!this.deferredInstallPrompt) return;
        this.deferredInstallPrompt.prompt();
        const { outcome } = await this.deferredInstallPrompt.userChoice;
        if (outcome === 'accepted') {
            document.getElementById('btn-install')?.style?.setProperty('display', 'none');
        }
        this.deferredInstallPrompt = null;
    }

    // ===== OFFLINE =====
    setupOfflineDetection() {
        window.addEventListener('online', () => {
            document.body.classList.remove('offline');
        });

        window.addEventListener('offline', () => {
            document.body.classList.add('offline');
        });

        if (!navigator.onLine) {
            document.body.classList.add('offline');
        }
    }

    // ===== KEYBOARD SHORTCUTS =====
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Cmd/Ctrl + K — Focus search
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.openSidebar();
                setTimeout(() => document.getElementById('vault-search')?.focus(), 100);
            }

            // Cmd/Ctrl + N — New session
            if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
                e.preventDefault();
                this.showView('view-welcome');
                this.renderModelGrid();
            }

            // Cmd/Ctrl + E — Export
            if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
                e.preventDefault();
                this.exportAll();
            }

            // Escape — Close modals/sidebar
            if (e.key === 'Escape') {
                this.closeSidebar();
                this.closeCaptureModal();
                this.closeSettingsModal();
            }
        });
    }
}

// ===== INIT =====
const app = new App();
app.init();
