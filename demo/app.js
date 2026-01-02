// Active Mirror - Sovereign AI Demo
// Hybrid approach: Uses WebWorker if available, falls back to main thread

// Try to use WebWorker first (more reliable), fallback to main thread
let CreateEngine;
let useWorker = false;

async function initWebLLM() {
    const webllm = await import("https://esm.run/@mlc-ai/web-llm");

    // Test if module workers are supported
    try {
        // Create test worker with module type
        const testWorkerBlob = new Blob([
            'self.postMessage("ok");'
        ], { type: 'text/javascript' });
        const testWorker = new Worker(URL.createObjectURL(testWorkerBlob), { type: 'module' });

        await new Promise((resolve, reject) => {
            testWorker.onmessage = () => resolve(true);
            testWorker.onerror = () => reject(false);
            setTimeout(() => reject(false), 1000);
        });

        testWorker.terminate();

        // Worker supported - use WebWorker engine
        CreateEngine = async (modelId, config) => {
            const worker = new Worker(
                new URL('./worker.js', import.meta.url),
                { type: 'module' }
            );
            return await webllm.CreateWebWorkerMLCEngine(worker, modelId, config);
        };
        useWorker = true;
        console.log('[ActiveMirror] Using WebWorker engine');

    } catch (e) {
        // Worker not supported - use main thread engine
        CreateEngine = webllm.CreateMLCEngine;
        useWorker = false;
        console.log('[ActiveMirror] Using main thread engine (worker not available)');
    }
}

const MODELS = [
    {
        id: 'qwen',
        name: 'Qwen 2.5 3B',
        icon: '🌐',
        size: '1.9GB',
        desc: 'Best multilingual',
        webllm: 'Qwen2.5-3B-Instruct-q4f16_1-MLC',
        recommended: true
    },
    {
        id: 'llama',
        name: 'Llama 3.2 3B',
        icon: '⟡',
        size: '1.8GB',
        desc: 'Best reasoning',
        webllm: 'Llama-3.2-3B-Instruct-q4f16_1-MLC'
    },
    {
        id: 'phi',
        name: 'Phi-3 Mini',
        icon: '◈',
        size: '2.2GB',
        desc: 'Complex tasks',
        webllm: 'Phi-3-mini-4k-instruct-q4f16_1-MLC'
    }
];

const SYSTEM = `You are Active Mirror — sovereign AI running in the user's browser.
Be direct, clear, concise. You run locally, no data leaves this device.
Keep responses 1-3 paragraphs unless asked for more.`;

// Global state - on window to prevent GC
window.activeMirror = {
    engine: null,
    messages: [],
    ready: false,
    loading: false
};

function show(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
}

function renderModels() {
    const grid = document.getElementById('model-grid');
    if (!grid) return;

    grid.innerHTML = MODELS.map(m => `
        <button class="model-card" data-id="${m.id}">
            <div class="model-icon">${m.icon}</div>
            <div class="model-name">${m.name}</div>
            <div class="model-size">${m.size}</div>
            <div class="model-desc">${m.desc}</div>
            ${m.recommended ? '<div class="model-badge">Recommended</div>' : ''}
        </button>
    `).join('');

    grid.querySelectorAll('.model-card').forEach(card => {
        card.onclick = () => loadModel(card.dataset.id);
    });
}

async function loadModel(id) {
    if (window.activeMirror.loading) return;

    const model = MODELS.find(m => m.id === id);
    if (!model) return;

    window.activeMirror.loading = true;
    show('view-loading');

    const pct = document.getElementById('loading-percent');
    const status = document.getElementById('loading-status');
    const ring = document.getElementById('progress-ring');

    try {
        console.log('[ActiveMirror] Loading model:', model.name);

        // Initialize WebLLM if not done yet
        if (!CreateEngine) {
            status.textContent = 'Initializing...';
            await initWebLLM();
        }

        // Create engine (worker or main thread)
        window.activeMirror.engine = await CreateEngine(model.webllm, {
            initProgressCallback: (report) => {
                const p = Math.round(report.progress * 100);
                if (pct) pct.textContent = p + '%';
                if (status) status.textContent = report.text;
                if (ring) ring.style.strokeDashoffset = 283 - (p / 100) * 283;
            }
        });

        console.log('[ActiveMirror] Engine created');

        // Warmup - do a tiny inference to ensure engine is ready
        if (status) status.textContent = 'Warming up...';
        try {
            await window.activeMirror.engine.chat.completions.create({
                messages: [{ role: 'user', content: 'Hi' }],
                max_tokens: 1
            });
            console.log('[ActiveMirror] Warmup complete');
        } catch (warmupErr) {
            console.warn('[ActiveMirror] Warmup skipped:', warmupErr.message);
        }

        window.activeMirror.messages = [];
        window.activeMirror.ready = true;
        window.activeMirror.loading = false;

        show('view-chat');

        const input = document.getElementById('user-input');
        if (input) input.focus();

        addMessage('ai', "Ready. What's on your mind?");

    } catch (err) {
        console.error('[ActiveMirror] Engine error:', err);
        if (status) {
            status.textContent = 'Error: ' + err.message;
            status.style.color = '#ff4444';
        }
        window.activeMirror.loading = false;
    }
}

function addMessage(role, text) {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'chat-message ' + role;
    div.innerHTML = text.replace(/\n/g, '<br>');
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;

    // Don't add welcome message to history
    if (!(role === 'ai' && text === "Ready. What's on your mind?")) {
        window.activeMirror.messages.push({
            role: role === 'ai' ? 'assistant' : 'user',
            content: text
        });
    }

    return div;
}

async function send() {
    const input = document.getElementById('user-input');
    const sendBtn = document.getElementById('btn-send');
    const text = input ? input.value.trim() : '';

    if (!text) return;

    if (!window.activeMirror.engine || !window.activeMirror.ready) {
        alert('Model not ready. Please wait for it to load.');
        return;
    }

    const suggestions = document.getElementById('suggestions');
    if (suggestions) suggestions.style.display = 'none';

    addMessage('user', text);
    if (input) input.value = '';
    if (sendBtn) sendBtn.disabled = true;

    const aiDiv = document.createElement('div');
    aiDiv.className = 'chat-message ai';
    aiDiv.innerHTML = '<span class="thinking">Thinking...</span>';

    const container = document.getElementById('chat-messages');
    if (container) {
        container.appendChild(aiDiv);
        container.scrollTop = container.scrollHeight;
    }

    let full = '';

    try {
        console.log('[ActiveMirror] Generating response...');

        const stream = await window.activeMirror.engine.chat.completions.create({
            messages: [
                { role: 'system', content: SYSTEM },
                ...window.activeMirror.messages
            ],
            stream: true,
            max_tokens: 800
        });

        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content || '';
            full += delta;
            aiDiv.innerHTML = full.replace(/\n/g, '<br>');
            if (container) container.scrollTop = container.scrollHeight;
        }

        window.activeMirror.messages.push({ role: 'assistant', content: full });
        console.log('[ActiveMirror] Response complete');

    } catch (err) {
        console.error('[ActiveMirror] Generation error:', err);
        aiDiv.innerHTML = '<span style="color:#ff4444">Error: ' + err.message + '</span>';
    }

    if (sendBtn) sendBtn.disabled = false;
    if (input) input.focus();
}

// Initialize
async function init() {
    console.log('[ActiveMirror] Starting...');

    // Check WebGPU
    if (!navigator.gpu) {
        const status = document.getElementById('loading-status');
        if (status) {
            status.textContent = 'WebGPU not supported. Please use Chrome or Edge.';
            status.style.color = '#ff4444';
        }
        return;
    }

    renderModels();

    const input = document.getElementById('user-input');
    const sendBtn = document.getElementById('btn-send');

    if (input) {
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
            }
        });

        input.addEventListener('input', e => {
            if (sendBtn) sendBtn.disabled = !e.target.value.trim();
        });
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', send);
    }

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
