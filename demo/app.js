// Active Mirror — Undeniable Demo
// Adaptive Hybrid Engine: Full power on desktop, ultra-light on mobile

import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

// ═══════════════════════════════════════════════════════════════
// THE STRATEGY: Device-Adaptive Model Selection
// ═══════════════════════════════════════════════════════════════

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const MODELS = {
    desktop: [
        {
            id: 'qwen-3b',
            name: 'Qwen 2.5 3B',
            icon: '🌐',
            size: '1.9GB',
            desc: 'Best multilingual',
            modelId: 'Qwen2.5-3B-Instruct-q4f16_1-MLC',
            recommended: true
        },
        {
            id: 'llama-3b',
            name: 'Llama 3.2 3B',
            icon: '⟡',
            size: '1.8GB',
            desc: 'Best reasoning',
            modelId: 'Llama-3.2-3B-Instruct-q4f16_1-MLC'
        },
        {
            id: 'phi',
            name: 'Phi-3 Mini',
            icon: '◈',
            size: '2.2GB',
            desc: 'Complex tasks',
            modelId: 'Phi-3-mini-4k-instruct-q4f16_1-MLC'
        }
    ],
    mobile: [
        {
            id: 'qwen-tiny',
            name: 'Qwen 0.5B',
            icon: '📱',
            size: '500MB',
            desc: 'Optimized for mobile',
            modelId: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
            recommended: true
        },
        {
            id: 'smollm',
            name: 'SmolLM 135M',
            icon: '⚡',
            size: '135MB',
            desc: 'Ultra-fast',
            modelId: 'SmolLM-135M-Instruct-q0f16-MLC'
        }
    ]
};

const SYSTEM = `You are Active Mirror — sovereign AI running locally on this device.
Be direct, clear, concise. You run locally, no data leaves this device.
Keep responses short (1-2 paragraphs).`;

let engine = null;
let messages = [];

// ═══════════════════════════════════════════════════════════════
// UI FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function show(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('visible');
        setTimeout(() => toast.classList.remove('visible'), 3000);
    }
}

function renderModels() {
    const grid = document.getElementById('model-grid');
    const hint = document.querySelector('.model-hint');
    const modelList = isMobile ? MODELS.mobile : MODELS.desktop;

    if (isMobile) {
        hint.innerHTML = '📱 <strong>Mobile Mode Active</strong><br>Optimized models for your device';
        showToast('⟡ Mobile Detected: Activating Lightweight Neural Core...');
    } else {
        hint.textContent = 'Click to download and start';
    }

    grid.innerHTML = modelList.map(m => `
        <button class="model-card" data-id="${m.id}">
            <div class="model-icon">${m.icon}</div>
            <div class="model-name">${m.name}</div>
            <div class="model-size">${m.size}</div>
            <div class="model-desc">${m.desc}</div>
            ${m.recommended ? `<div class="model-badge">${isMobile ? 'Best for Mobile' : 'Recommended'}</div>` : ''}
        </button>
    `).join('');

    grid.querySelectorAll('.model-card').forEach(card => {
        card.onclick = () => loadModel(card.dataset.id);
    });
}

// ═══════════════════════════════════════════════════════════════
// ENGINE LOADING
// ═══════════════════════════════════════════════════════════════

async function loadModel(id) {
    const modelList = isMobile ? MODELS.mobile : MODELS.desktop;
    const model = modelList.find(m => m.id === id);
    if (!model) return;

    show('view-loading');

    const pct = document.getElementById('loading-percent');
    const status = document.getElementById('loading-status');
    const ring = document.getElementById('progress-ring');

    try {
        console.log('[ActiveMirror] Loading:', model.name, isMobile ? '(Mobile Mode)' : '(Desktop Mode)');

        if (isMobile) {
            status.textContent = 'Optimizing for Mobile...';
        }

        engine = await CreateMLCEngine(model.modelId, {
            initProgressCallback: (report) => {
                const p = Math.round(report.progress * 100);
                if (pct) pct.textContent = p + '%';
                if (status) status.textContent = report.text;
                if (ring) ring.style.strokeDashoffset = 283 - (p / 100) * 283;
            },
            appConfig: {
                useIndexedDBCache: true  // Critical for iOS memory safety
            }
        });

        console.log('[ActiveMirror] Engine ready');

        messages = [];
        show('view-chat');
        document.getElementById('user-input').focus();
        addMessage('ai', "Ready. What's on your mind?");

    } catch (err) {
        console.error('[ActiveMirror] Engine error:', err);

        // If mobile fails, show helpful message
        if (isMobile && err.message.includes('memory')) {
            status.innerHTML = '⚠️ <strong>Low Memory</strong><br>Try closing other tabs and refreshing.';
        } else {
            status.textContent = 'Error: ' + err.message;
        }
        status.style.color = '#ff4444';
    }
}

// ═══════════════════════════════════════════════════════════════
// CHAT FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function addMessage(role, text) {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'chat-message ' + role;
    div.innerHTML = text.replace(/\n/g, '<br>');
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;

    if (!(role === 'ai' && text === "Ready. What's on your mind?")) {
        messages.push({ role: role === 'ai' ? 'assistant' : 'user', content: text });
    }
}

async function send() {
    const input = document.getElementById('user-input');
    const sendBtn = document.getElementById('btn-send');
    const text = input ? input.value.trim() : '';

    if (!text || !engine) return;

    const suggestions = document.getElementById('suggestions');
    if (suggestions) suggestions.style.display = 'none';

    addMessage('user', text);
    if (input) input.value = '';
    if (sendBtn) sendBtn.disabled = true;

    const aiDiv = document.createElement('div');
    aiDiv.className = 'chat-message ai';
    aiDiv.innerHTML = '<span class="thinking">⟡</span>';
    document.getElementById('chat-messages').appendChild(aiDiv);
    document.getElementById('chat-messages').scrollTop = 99999;

    let full = '';

    try {
        const stream = await engine.chat.completions.create({
            messages: [{ role: 'system', content: SYSTEM }, ...messages],
            stream: true,
            max_tokens: isMobile ? 256 : 500  // Shorter responses on mobile
        });

        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content || '';
            full += delta;
            aiDiv.innerHTML = full.replace(/\n/g, '<br>');
            document.getElementById('chat-messages').scrollTop = 99999;
        }

        messages.push({ role: 'assistant', content: full });

    } catch (err) {
        console.error('[ActiveMirror] Generation error:', err);
        aiDiv.innerHTML = '<span style="color:#ff4444">Error: ' + err.message + '</span>';
    }

    if (sendBtn) sendBtn.disabled = false;
    if (input) input.focus();
}

// ═══════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════

function init() {
    console.log('[ActiveMirror] Initializing...');
    console.log('[ActiveMirror] Device:', isMobile ? 'Mobile' : 'Desktop');

    renderModels();

    const input = document.getElementById('user-input');
    const sendBtn = document.getElementById('btn-send');

    if (input) {
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
        });
        input.addEventListener('input', e => {
            if (sendBtn) sendBtn.disabled = !e.target.value.trim();
        });
    }

    if (sendBtn) sendBtn.addEventListener('click', send);

    document.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.onclick = () => {
            if (input) {
                input.value = chip.dataset.prompt;
                if (sendBtn) sendBtn.disabled = false;
            }
        };
    });

    console.log('[ActiveMirror] Ready');
}

init();
