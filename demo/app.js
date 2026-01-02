import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";
import { MirrorOS } from "./mirror-os.js";
import { i18n, SUPPORTED_LANGUAGES } from "./i18n.js";
import { retrieve, enhancePrompt, gatherBrowserContext } from "./retrieval.js";

// ================================================================
// ACTIVE MIRROROS — Simplified Working Version
// ================================================================

const MODEL_CATALOG = [
    {
        id: 'smollm-135m',
        name: 'SmolLM 135M',
        displayName: 'Nano',
        icon: '⚡',
        size: '100MB',
        sizeBytes: 100000000,
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
        sizeBytes: 200000000,
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
        sizeBytes: 700000000,
        minMemory: 4,
        minCores: 4,
        description: 'Good balance of speed and quality',
        webllmId: 'Llama-3.2-1B-Instruct-q4f16_1-MLC'
    },
    {
        id: 'llama-3b',
        name: 'Llama 3.2 3B',
        displayName: 'Reflect',
        icon: '⟡',
        size: '1.8GB',
        sizeBytes: 1800000000,
        minMemory: 6,
        minCores: 4,
        description: 'Deep reflection, structured thinking',
        webllmId: 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
        recommended: true
    },
    {
        id: 'qwen-1.5b',
        name: 'Qwen 2.5 1.5B',
        displayName: 'Global',
        icon: '🌐',
        size: '1GB',
        sizeBytes: 1000000000,
        minMemory: 4,
        minCores: 4,
        description: 'Great multilingual support',
        webllmId: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC'
    },
    {
        id: 'phi-3-mini',
        name: 'Phi-3 Mini',
        displayName: 'Reason',
        icon: '◈',
        size: '2.2GB',
        sizeBytes: 2200000000,
        minMemory: 8,
        minCores: 6,
        description: 'Advanced reasoning, complex analysis',
        webllmId: 'Phi-3-mini-4k-instruct-q4f16_1-MLC'
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

class App {
    constructor() {
        this.os = new MirrorOS();
        this.engine = null;
        this.selectedModel = MODEL_CATALOG.find(function (m) { return m.recommended; }) || MODEL_CATALOG[1];
        this.currentSession = null;
        this.redTeamEnabled = false;
        this.firstMessage = true;
    }

    async init() {
        console.log('[MirrorOS] Initializing...');

        var self = this;

        try {
            await this.os.init();
            console.log('[MirrorOS] OS initialized');
        } catch (e) {
            console.error('[MirrorOS] OS init failed:', e);
        }

        // Initialize i18n if available
        if (typeof i18n !== 'undefined') {
            try {
                i18n.init();
                i18n.onChange(function () { self.onLanguageChange(); });
            } catch (e) {
                console.log('[MirrorOS] i18n not available');
            }
        }

        this.showView('view-welcome');
        this.renderModelGrid();
        this.bindEvents();
        this.checkWebGPU();

        console.log('[MirrorOS] App ready');
    }

    async checkWebGPU() {
        var status = document.getElementById('device-status');
        var statusText = status.querySelector('.status-text');

        if (!navigator.gpu) {
            status.classList.add('error');
            statusText.textContent = 'WebGPU not supported — try Chrome or Edge';
            return;
        }

        try {
            var adapter = await navigator.gpu.requestAdapter();
            if (adapter) {
                status.classList.add('ready');
                statusText.textContent = 'WebGPU ready — click a model to begin';
            } else {
                status.classList.add('error');
                statusText.textContent = 'WebGPU adapter not available';
            }
        } catch (e) {
            status.classList.add('error');
            statusText.textContent = 'Error checking WebGPU';
        }
    }

    showView(viewId) {
        var views = document.querySelectorAll('.view');
        for (var i = 0; i < views.length; i++) {
            views[i].classList.add('hidden');
        }
        var target = document.getElementById(viewId);
        if (target) target.classList.remove('hidden');
    }

    renderModelGrid() {
        var grid = document.getElementById('model-grid');
        if (!grid) return;

        var self = this;
        var html = '';

        for (var i = 0; i < MODEL_CATALOG.length; i++) {
            var model = MODEL_CATALOG[i];
            var isSelected = self.selectedModel && self.selectedModel.id === model.id;
            var isRecommended = model.recommended;

            html += '<button class="model-card ' + (isSelected ? 'selected' : '') + '" data-model-id="' + model.id + '">';
            if (isRecommended) {
                html += '<div class="model-badge">Recommended</div>';
            }
            html += '<div class="model-icon">' + model.icon + '</div>';
            html += '<div class="model-info">';
            html += '<div class="model-name">' + model.displayName + '</div>';
            html += '<div class="model-meta">' + model.name + ' · ' + model.size + '</div>';
            html += '<div class="model-desc">' + model.description + '</div>';
            html += '</div>';
            html += '</button>';
        }

        grid.innerHTML = html;

        var cards = grid.querySelectorAll('.model-card');
        for (var j = 0; j < cards.length; j++) {
            cards[j].addEventListener('click', function () {
                var modelId = this.getAttribute('data-model-id');
                for (var k = 0; k < MODEL_CATALOG.length; k++) {
                    if (MODEL_CATALOG[k].id === modelId) {
                        self.selectedModel = MODEL_CATALOG[k];
                        break;
                    }
                }
                self.renderModelGrid();
                self.startLoading();
            });
        }
    }

    bindEvents() {
        var self = this;

        // Chat input
        var input = document.getElementById('user-input');
        var sendBtn = document.getElementById('btn-send');

        if (input && sendBtn) {
            input.addEventListener('input', function () {
                sendBtn.disabled = input.value.trim() === '';
                input.style.height = 'auto';
                input.style.height = Math.min(input.scrollHeight, 150) + 'px';
            });

            input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    self.handleSend();
                }
            });

            sendBtn.addEventListener('click', function () {
                self.handleSend();
            });
        }

        // Suggestions
        var suggestions = document.querySelectorAll('.suggestion-chip');
        for (var i = 0; i < suggestions.length; i++) {
            suggestions[i].addEventListener('click', function () {
                if (input) {
                    input.value = this.getAttribute('data-prompt');
                    input.focus();
                    if (sendBtn) sendBtn.disabled = false;
                }
            });
        }

        // Red Team toggle
        var redTeam = document.getElementById('checkbox-redteam');
        if (redTeam) {
            redTeam.addEventListener('change', function () {
                self.redTeamEnabled = this.checked;
            });
        }

        // Sidebar
        var btnMenu = document.getElementById('btn-menu');
        var btnClose = document.getElementById('btn-close-sidebar');
        var overlay = document.getElementById('sidebar-overlay');

        if (btnMenu) {
            btnMenu.addEventListener('click', function () { self.openSidebar(); });
        }
        if (btnClose) {
            btnClose.addEventListener('click', function () { self.closeSidebar(); });
        }
        if (overlay) {
            overlay.addEventListener('click', function () { self.closeSidebar(); });
        }

        // Sidebar actions
        var btnSave = document.getElementById('btn-save');
        var btnExport = document.getElementById('btn-export');
        var btnCapture = document.getElementById('btn-capture');
        var btnSettings = document.getElementById('btn-settings');

        if (btnSave) btnSave.addEventListener('click', function () { self.saveMirror(); });
        if (btnExport) btnExport.addEventListener('click', function () { self.exportAll(); });
        if (btnCapture) btnCapture.addEventListener('click', function () { self.quickCapture(); });
        if (btnSettings) btnSettings.addEventListener('click', function () { self.openSettings(); });
    }

    async startLoading() {
        if (!this.selectedModel) return;

        this.showView('view-loading');

        var percentEl = document.getElementById('loading-percent');
        var statusEl = document.getElementById('loading-status');
        var ringEl = document.getElementById('progress-ring');
        var circumference = 2 * Math.PI * 45;

        var self = this;

        try {
            this.engine = await CreateMLCEngine(this.selectedModel.webllmId, {
                initProgressCallback: function (report) {
                    var pct = Math.round(report.progress * 100);
                    percentEl.textContent = pct + '%';
                    statusEl.textContent = report.text;
                    var offset = circumference - (pct / 100) * circumference;
                    ringEl.style.strokeDashoffset = offset;
                }
            });

            self.startSession();

        } catch (err) {
            statusEl.textContent = 'Error: ' + err.message;
            statusEl.style.color = 'var(--danger)';
        }
    }

    startSession() {
        this.showView('view-chat');

        var input = document.getElementById('user-input');
        if (input) {
            input.disabled = false;
            input.focus();
        }

        this.currentSession = {
            id: crypto.randomUUID(),
            started: new Date().toISOString(),
            title: 'New Session',
            model: this.selectedModel ? this.selectedModel.id : null,
            messages: []
        };

        this.appendMessage('ai', 'Welcome to Active MirrorOS. I\'m your reflection partner — I\'ll help you think, not think for you.\n\nI\'ll ask before I advise, and I\'ll tag what I know: [FACT], [ESTIMATE], or [UNKNOWN].\n\nWhat\'s on your mind?');
    }

    async handleSend() {
        var input = document.getElementById('user-input');
        var text = input.value.trim();
        if (!text || !this.engine) return;

        if (this.firstMessage) {
            var suggestions = document.getElementById('suggestions');
            if (suggestions) suggestions.style.display = 'none';
            this.firstMessage = false;
        }

        this.appendMessage('user', text);
        input.value = '';
        input.style.height = 'auto';

        var sendBtn = document.getElementById('btn-send');
        if (sendBtn) sendBtn.disabled = true;
        
        // === RETRIEVAL: Fetch live web context if needed ===
        var retrievalContext = '';
        var self = this;
        try {
            var retrieval = await retrieve(text);
            if (retrieval && retrieval.context) {
                console.log('[MirrorOS] Retrieved context for:', retrieval.intent.primary);
                retrievalContext = '\n\n[RETRIEVED INFORMATION]\n' + retrieval.context + '\n[END RETRIEVED]\n\nNow answer the user\'s question using this information when relevant. Cite sources.';
            }
        } catch (e) {
            console.warn('[MirrorOS] Retrieval skipped:', e.message);
        }
        
        // === BROWSER CONTEXT ===
        var browserCtx = await gatherBrowserContext();
        var timeContext = ' Current time: ' + new Date().toLocaleString() + ' (' + browserCtx.timezone + ').';

        this.currentSession.messages.push({ role: 'user', content: text });

        var systemPrompt = SYSTEM_PROMPT + timeContext + retrievalContext;
        
        var requestMessages = [
            { role: 'system', content: systemPrompt }
        ];
        for (var i = 0; i < this.currentSession.messages.length; i++) {
            requestMessages.push(this.currentSession.messages[i]);
        }

        var aiMsgEl = this.appendMessage('ai', '');
        var contentEl = aiMsgEl.querySelector('.message-text');
        var fullResponse = '';
        var startTime = performance.now();
        var self = this;

        try {
            var stream = await this.engine.chat.completions.create({
                messages: requestMessages,
                stream: true,
                max_tokens: 800
            });

            var firstToken = true;

            for await (var chunk of stream) {
                var content = chunk.choices[0] && chunk.choices[0].delta && chunk.choices[0].delta.content ? chunk.choices[0].delta.content : '';
                if (content) {
                    if (firstToken) {
                        var latency = Math.round(performance.now() - startTime);
                        var latencyEl = document.querySelector('#stat-latency span');
                        if (latencyEl) latencyEl.textContent = latency + 'ms';
                        firstToken = false;
                    }
                    fullResponse += content;
                    contentEl.innerHTML = self.formatText(fullResponse);
                    self.scrollToBottom();
                }
            }

            this.currentSession.messages.push({ role: 'assistant', content: fullResponse });

            if (this.currentSession.messages.length === 2) {
                this.currentSession.title = text.substring(0, 50) + (text.length > 50 ? '...' : '');
            }

            await this.os.saveSession(this.currentSession);

            if (this.redTeamEnabled) {
                await this.runRedTeam(fullResponse);
            }

        } catch (err) {
            contentEl.textContent = 'Error: ' + err.message;
        }
    }

    async runRedTeam(advice) {
        var prompt = 'You are a ruthless Red Team auditor. In 2-3 sentences, critique this for unstated assumptions, missing risks, or logical gaps. Start with "Devil\'s Advocate:"\n\n' + advice;

        var redMsgEl = this.appendMessage('red-team', 'Analyzing...');
        var contentEl = redMsgEl.querySelector('.message-text');
        var self = this;

        try {
            var response = await this.engine.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 200
            });
            contentEl.innerHTML = self.formatText(response.choices[0].message.content);
            self.scrollToBottom();
        } catch (err) {
            contentEl.textContent = 'Red Team analysis failed.';
        }
    }

    appendMessage(role, content) {
        var container = document.getElementById('chat-messages');
        var div = document.createElement('div');
        div.className = 'message ' + role;

        if (role === 'ai') {
            div.innerHTML = '<div class="message-content"><div class="message-sender"><span class="glyph">⟡</span> MirrorMesh</div><div class="message-text">' + this.formatText(content) + '</div></div>';
        } else if (role === 'red-team') {
            div.innerHTML = '<div class="message-content"><div class="message-text">' + content + '</div></div>';
        } else {
            div.innerHTML = '<div class="message-content">' + content + '</div>';
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
        var container = document.getElementById('chat-messages');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    openSidebar() {
        var sidebar = document.getElementById('sidebar');
        var overlay = document.getElementById('sidebar-overlay');
        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.classList.add('active');
    }

    closeSidebar() {
        var sidebar = document.getElementById('sidebar');
        var overlay = document.getElementById('sidebar-overlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
    }

    async saveMirror() {
        var data = {
            exported: new Date().toISOString(),
            type: 'mirror-seed',
            session: this.currentSession
        };

        var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'mirror-seed-' + new Date().toISOString().split('T')[0] + '.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    async exportAll() {
        var data = await this.os.exportAll();
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'active-mirroros-export-' + new Date().toISOString().split('T')[0] + '.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    quickCapture() {
        alert('Quick Capture: Feature coming soon!');
    }

    openSettings() {
        this.showView('view-settings');

        // Render language selector
        const langContainer = document.getElementById('language-selector');
        if (langContainer) {
            this.renderLanguageSelector(langContainer);
        }

        // Update storage info
        this.updateStorageInfo();

        // Bind settings events
        const btnClose = document.getElementById('btn-close-settings');
        const btnExportData = document.getElementById('btn-export-data');
        const btnClearData = document.getElementById('btn-clear-data');

        const self = this;

        if (btnClose) {
            btnClose.onclick = () => this.showView('view-chat');
        }

        if (btnExportData) {
            btnExportData.onclick = () => this.exportAll();
        }

        if (btnClearData) {
            btnClearData.onclick = async () => {
                if (confirm(i18n.t('clearConfirm'))) {
                    await this.os.clearAll();
                    location.reload();
                }
            };
        }
    }

    async updateStorageInfo() {
        var storageEl = document.getElementById('storage-used');
        var sessionsEl = document.getElementById('total-sessions');

        if (storageEl && navigator.storage && navigator.storage.estimate) {
            var estimate = await navigator.storage.estimate();
            var used = (estimate.usage / 1024 / 1024).toFixed(1);
            storageEl.textContent = used + ' MB';
        }

        if (sessionsEl) {
            var sessions = await this.os.getRecentSessions();
            sessionsEl.textContent = sessions.length;
        }
    }

    renderLanguageSelector(container) {
        var self = this;
        container.innerHTML = '';

        var grid = document.createElement('div');
        grid.className = 'language-selector';

        SUPPORTED_LANGUAGES.forEach(function (lang) {
            var btn = document.createElement('button');
            btn.className = 'language-option' + (lang.code === i18n.currentLang ? ' active' : '');
            btn.innerHTML = '<span class="native">' + lang.native + '</span><span class="name">' + lang.name + '</span>';
            btn.onclick = function () {
                i18n.setLanguage(lang.code);
                self.renderLanguageSelector(container);
            };
            grid.appendChild(btn);
        });

        container.appendChild(grid);
    }

    onLanguageChange() {
        // Re-render UI elements when language changes
        console.log('[MirrorOS] Language changed to:', i18n.currentLang);

        // Update all data-i18n elements
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            el.textContent = i18n.t(key);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = i18n.t(key);
        });

        // Re-render model grid
        this.renderModelGrid();
    }
}

// Initialize
var app = new App();
app.init();
