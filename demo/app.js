import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";
import { MirrorOS } from "./mirror-os.js";
import { i18n, SUPPORTED_LANGUAGES } from "./i18n.js";

// ================================================================
// ACTIVE MIRROR — Sovereign AI
// ================================================================

const MODEL_CATALOG = [
    {
        id: 'qwen-3b',
        name: 'Qwen 2.5 3B',
        displayName: 'Global',
        icon: '🌐',
        size: '1.9GB',
        sizeBytes: 1900000000,
        minMemory: 4,
        minCores: 4,
        description: 'Best multilingual, great for coding',
        webllmId: 'Qwen2.5-3B-Instruct-q4f16_1-MLC',
        recommended: true
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
        description: 'Best general reasoning',
        webllmId: 'Llama-3.2-3B-Instruct-q4f16_1-MLC'
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
        description: 'Advanced reasoning',
        webllmId: 'Phi-3-mini-4k-instruct-q4f16_1-MLC'
    }
];

const SYSTEM_PROMPT = \`You are Active Mirror — a sovereign AI running entirely in the user's browser.

IDENTITY:
- A thinking tool that belongs to the user
- Sovereign: you run locally, no data leaves this device
- Direct, clear, warm, and concise

BEHAVIORS:
- Think WITH the user, not FOR them
- Be direct. No hedging, no corporate tone
- When uncertain, say "I don't know"
- Keep responses 1-3 paragraphs unless asked for more

You run on WebGPU in this browser. The user owns this interaction.\`;

class App {
    constructor() {
        this.os = new MirrorOS();
        this.engine = null;
        this.selectedModel = MODEL_CATALOG.find(m => m.recommended) || MODEL_CATALOG[0];
        this.currentSession = null;
        this.firstMessage = true;
    }

    async init() {
        var self = this;

        try {
            await this.os.init();
        } catch (e) {
            console.error('OS init failed:', e);
        }

        try {
            i18n.init();
        } catch (e) {
            console.error('i18n init failed:', e);
        }

        this.showView('view-welcome');
        this.renderModelGrid();
        this.bindEvents();
    }

    showView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
        var view = document.getElementById(viewId);
        if (view) view.classList.remove('hidden');
    }

    renderModelGrid() {
        var grid = document.getElementById('model-grid');
        if (!grid) return;

        var self = this;
        var html = '';

        MODEL_CATALOG.forEach(model => {
            var isSelected = self.selectedModel && self.selectedModel.id === model.id;
            html += '<button class="model-card ' + (isSelected ? 'selected' : '') + '" data-model-id="' + model.id + '">';
            html += '<div class="model-icon">' + model.icon + '</div>';
            html += '<div class="model-name">' + model.name + '</div>';
            html += '<div class="model-size">' + model.size + '</div>';
            html += '<div class="model-desc">' + model.description + '</div>';
            if (model.recommended) html += '<div class="model-badge">Recommended</div>';
            html += '</button>';
        });

        grid.innerHTML = html;

        grid.querySelectorAll('.model-card').forEach(card => {
            card.onclick = function() {
                var modelId = this.getAttribute('data-model-id');
                self.selectedModel = MODEL_CATALOG.find(m => m.id === modelId);
                self.renderModelGrid();
                self.startLoading();
            };
        });
    }

    bindEvents() {
        var self = this;

        var input = document.getElementById('user-input');
        var sendBtn = document.getElementById('btn-send');

        if (input) {
            input.addEventListener('input', function() {
                if (sendBtn) sendBtn.disabled = input.value.trim() === '';
            });
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    self.handleSend();
                }
            });
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', function() {
                self.handleSend();
            });
        }

        var suggestions = document.querySelectorAll('.suggestion-chip');
        suggestions.forEach(chip => {
            chip.addEventListener('click', function() {
                var prompt = this.getAttribute('data-prompt');
                if (input && prompt) {
                    input.value = prompt;
                    self.handleSend();
                }
            });
        });
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
                initProgressCallback: function(report) {
                    var pct = Math.round(report.progress * 100);
                    if (percentEl) percentEl.textContent = pct + '%';
                    if (statusEl) statusEl.textContent = report.text;
                    if (ringEl) {
                        var offset = circumference - (pct / 100) * circumference;
                        ringEl.style.strokeDashoffset = offset;
                    }
                }
            });

            self.startSession();

        } catch (err) {
            console.error('Engine failed:', err);
            if (statusEl) {
                statusEl.textContent = 'Error: ' + err.message;
                statusEl.style.color = '#ff4444';
            }
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

        this.appendMessage('ai', 'Ready. What\'s on your mind?');
    }

    appendMessage(role, content) {
        var container = document.getElementById('chat-messages');
        if (!container) return;

        var div = document.createElement('div');
        div.className = 'chat-message ' + role;
        div.innerHTML = '<div class="message-text">' + this.formatText(content) + '</div>';
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
        return div;
    }

    formatText(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/`([^`]+)`/g, '<code>$1</code>');
    }

    async handleSend() {
        var input = document.getElementById('user-input');
        var text = input ? input.value.trim() : '';

        if (!text || !this.engine) return;

        if (this.firstMessage) {
            var suggestions = document.getElementById('suggestions');
            if (suggestions) suggestions.style.display = 'none';
            this.firstMessage = false;
        }

        this.appendMessage('user', text);
        input.value = '';

        this.currentSession.messages.push({ role: 'user', content: text });

        var requestMessages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...this.currentSession.messages
        ];

        var aiMsg = this.appendMessage('ai', '');
        var contentEl = aiMsg.querySelector('.message-text');
        var fullResponse = '';
        var self = this;

        try {
            var stream = await this.engine.chat.completions.create({
                messages: requestMessages,
                stream: true,
                max_tokens: 800
            });

            for await (var chunk of stream) {
                var delta = chunk.choices[0]?.delta?.content || '';
                if (delta) {
                    fullResponse += delta;
                    contentEl.innerHTML = self.formatText(fullResponse);
                }
            }

            this.currentSession.messages.push({ role: 'assistant', content: fullResponse });
            await this.os.saveSession(this.currentSession);

        } catch (err) {
            console.error('Generation error:', err);
            contentEl.innerHTML = '<span style="color:#ff4444">Error: ' + err.message + '</span>';
        }
    }
}

// Initialize
var app = new App();
app.init();
