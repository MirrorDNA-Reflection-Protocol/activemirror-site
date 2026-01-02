import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

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

let engine = null;
let messages = [];

// Debug panel
const debug = document.createElement('div');
debug.id = 'debug';
debug.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#000;color:#0f0;font:12px monospace;padding:10px;max-height:200px;overflow:auto;z-index:9999;';
document.body.appendChild(debug);

function log(msg) {
    const time = new Date().toLocaleTimeString();
    debug.innerHTML += time + ' ' + msg + '<br>';
    debug.scrollTop = debug.scrollHeight;
    console.log(msg);
}

window.onerror = function(msg, url, line) {
    log('❌ ERROR: ' + msg + ' at line ' + line);
    return false;
};

window.onunhandledrejection = function(e) {
    log('❌ PROMISE ERROR: ' + e.reason);
};

function show(id) {
    log('show(' + id + ')');
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function renderModels() {
    log('renderModels()');
    const grid = document.getElementById('model-grid');
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
        card.onclick = () => {
            log('Card clicked: ' + card.dataset.id);
            loadModel(card.dataset.id);
        };
    });
}

async function loadModel(id) {
    log('loadModel(' + id + ')');
    const model = MODELS.find(m => m.id === id);
    if (!model) {
        log('Model not found!');
        return;
    }

    show('view-loading');

    const pct = document.getElementById('loading-percent');
    const status = document.getElementById('loading-status');
    const ring = document.getElementById('progress-ring');

    try {
        log('Creating engine: ' + model.webllm);
        
        engine = await CreateMLCEngine(model.webllm, {
            initProgressCallback: (report) => {
                const p = Math.round(report.progress * 100);
                pct.textContent = p + '%';
                status.textContent = report.text;
                ring.style.strokeDashoffset = 283 - (p / 100) * 283;
                if (p === 100) log('Progress: 100%');
            }
        });

        log('✅ Engine created successfully!');
        log('Showing chat view...');
        
        show('view-chat');
        
        log('Chat view should be visible now');
        
        const input = document.getElementById('user-input');
        if (input) {
            input.focus();
            log('Input focused');
        }
        
        addMessage('ai', "Ready. What's on your mind?");
        log('Welcome message added');

    } catch (err) {
        log('❌ Engine error: ' + err.message);
        status.textContent = 'Error: ' + err.message;
        status.style.color = '#ff4444';
    }
}

function addMessage(role, text) {
    log('addMessage(' + role + ')');
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'chat-message ' + role;
    div.innerHTML = text.replace(/\n/g, '<br>');
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    if (role !== 'ai' || text !== "Ready. What's on your mind?") {
        messages.push({ role: role === 'ai' ? 'assistant' : 'user', content: text });
    }
}

async function send() {
    log('send()');
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    if (!text || !engine) {
        log('send() aborted: no text or no engine');
        return;
    }

    document.getElementById('suggestions').style.display = 'none';
    addMessage('user', text);
    input.value = '';

    const aiDiv = document.createElement('div');
    aiDiv.className = 'chat-message ai';
    document.getElementById('chat-messages').appendChild(aiDiv);

    let full = '';

    try {
        log('Starting chat completion...');
        const stream = await engine.chat.completions.create({
            messages: [{ role: 'system', content: SYSTEM }, ...messages],
            stream: true,
            max_tokens: 800
        });

        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content || '';
            full += delta;
            aiDiv.innerHTML = full.replace(/\n/g, '<br>');
            document.getElementById('chat-messages').scrollTop = 99999;
        }

        messages.push({ role: 'assistant', content: full });
        log('Response complete');

    } catch (err) {
        log('❌ Chat error: ' + err.message);
        aiDiv.innerHTML = '<span style="color:#ff4444">Error: ' + err.message + '</span>';
    }
}

// Init
log('App starting...');
renderModels();

document.getElementById('user-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
});

document.getElementById('user-input').addEventListener('input', e => {
    document.getElementById('btn-send').disabled = !e.target.value.trim();
});

document.getElementById('btn-send').addEventListener('click', send);

document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.onclick = () => {
        document.getElementById('user-input').value = chip.dataset.prompt;
        send();
    };
});

log('App initialized');
