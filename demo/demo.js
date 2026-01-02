import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

const MODEL_ID = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

let engine;
let isRedTeamEnabled = false;
let messages = [];

// DOM Elements
const initBtn = document.getElementById('init-btn');
const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const chatHistory = document.getElementById('chat-history');
const statusText = document.getElementById('download-status');
const progressBar = document.getElementById('progress-bar');
const progressBarContainer = document.getElementById('progress-bar-container');
const redTeamToggle = document.getElementById('red-team-toggle');
const preLoadHero = document.getElementById('pre-load-hero');

// Initialize
initBtn.addEventListener('click', async () => {
    initBtn.style.display = 'none';
    progressBarContainer.style.display = 'block';

    statusText.innerText = "Initializing Engine...";

    const initProgressCallback = (report) => {
        const progress = report.progress;
        const text = report.text;
        progressBar.style.width = `${progress * 100}%`;
        statusText.innerText = text;
    };

    try {
        engine = await CreateMLCEngine(MODEL_ID, {
            initProgressCallback: initProgressCallback,
        });

        // Success state
        preLoadHero.classList.add('hidden');
        chatHistory.style.display = 'block';

        statusText.innerText = "Model Loaded. Active.";
        userInput.disabled = false;
        userInput.placeholder = "Reflect on...";
        userInput.focus();

        // Enable suggested prompts
        document.querySelectorAll('.prompt-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                userInput.value = e.target.getAttribute('data-prompt');
                userInput.focus();
                sendBtn.disabled = false;
                // Optional: Auto send? No, let user review.
            });
        });

    } catch (err) {
        statusText.innerText = "Error loading model: " + err.message;
        statusText.style.color = "#ef4444";
        console.error(err);
        initBtn.style.display = 'block';
    }
});

redTeamToggle.addEventListener('change', (e) => {
    isRedTeamEnabled = e.target.checked;
});

userInput.addEventListener('input', () => {
    sendBtn.disabled = userInput.value.trim() === '';
});

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});

sendBtn.addEventListener('click', handleSend);

async function handleSend() {
    const text = userInput.value.trim();
    if (!text || !engine) return;

    // UI Updates
    appendMessage('user', text);
    userInput.value = '';
    sendBtn.disabled = true;

    messages.push({ role: "user", content: text });

    // System Prompt (Strict Mirror Seed Behavior)
    const systemPrompt = `You are MirrorMesh, demonstrating Active Mirror's governed AI.

STRICT BEHAVIORS:
1. NEVER give direct advice without asking at least one clarifying question first
2. ALWAYS tag your confidence on claims:
   - [FACT] = Verifiable information
   - [ESTIMATE] = Reasoned inference, could be wrong
   - [UNKNOWN] = Insufficient data
3. When asked "should I X?", provide a FRAMEWORK for thinking, not an answer
4. If you don't know, say [UNKNOWN] — never fabricate
5. Be warm but structured. Help users THINK, don't think FOR them.

EXAMPLE RESPONSE PATTERN:
User: "Should I quit my job?"
You: "That's a significant decision. Before I can help you think clearly:
- What's driving the urge to leave? 
- What's your financial runway? [UNKNOWN until you share]
- Are you moving TOWARD something or just AWAY?

[ESTIMATE] Most regretted job decisions come from reaction, not reflection. Let's map this properly."

You are running LOCALLY in this browser. Data never leaves this device. You are showing what GOVERNED, REFLECTIVE AI feels like.`;

    const requestMessages = [
        { role: "system", content: systemPrompt },
        ...messages
    ];

    // Measure Latency
    const startTime = performance.now();
    const latencyStat = document.getElementById('latency-stat');

    // Streaming Response
    let aiMessageDiv = appendMessage('ai', '');
    let fullResponse = "";

    try {
        const chunks = await engine.chat.completions.create({
            messages: requestMessages,
            stream: true
        });

        let firstToken = true;

        for await (const chunk of chunks) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                if (firstToken) {
                    const latency = Math.round(performance.now() - startTime);
                    latencyStat.innerHTML = `⚡ ${latency}ms`;
                    firstToken = false;
                }
                fullResponse += content;
                aiMessageDiv.innerText = fullResponse; // Raw stream first
                scrollToBottom();
            }
        }

        // Apply Truth-State Styling after stream completes
        const styledResponse = fullResponse
            .replace(/\[FACT\]/g, '<span class="tag tag-fact">FACT</span>')
            .replace(/\[ESTIMATE\]/g, '<span class="tag tag-estimate">ESTIMATE</span>')
            .replace(/\[UNKNOWN\]/g, '<span class="tag tag-unknown">UNKNOWN</span>');

        aiMessageDiv.innerHTML = styledResponse;

        messages.push({ role: "assistant", content: fullResponse });

        // Update Carbon (Rough estimate: 0.04g per query for local vs 0.4g cloud)
        const carbonStat = document.getElementById('carbon-stat');
        const currentCarbon = parseFloat(carbonStat.innerText.replace('🌱 ', '').replace('g CO2', ''));
        carbonStat.innerText = `🌱 ${(currentCarbon + 0.04).toFixed(2)}g CO2`;

        // Red Team Check
        if (isRedTeamEnabled) {
            await runRedTeam(fullResponse);
        }

    } catch (err) {
        appendMessage('system', "Error generating response: " + err.message);
    }

    sendBtn.disabled = userInput.value.trim() === '';
}

async function runRedTeam(advice) {
    const redTeamPrompt = `You are a Red Team auditor. Critique this advice for: Unstated assumptions, Missing edge cases, Logical gaps, Risks not mentioned. Be brief (2-3 sentences). Start with "⚠️ Red Team:" ADVICE: ${advice}`;

    const redMsgDiv = appendMessage('red-team', 'Auditing response...');
    scrollToBottom();

    try {
        const response = await engine.chat.completions.create({
            messages: [{ role: "user", content: redTeamPrompt }],
            temperature: 0.7,
        });

        redMsgDiv.innerText = response.choices[0].message.content;
        scrollToBottom();
    } catch (err) {
        redMsgDiv.innerText = "Red Team audit failed.";
    }
}

function appendMessage(role, text) {
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.innerText = text;
    chatHistory.appendChild(div);
    scrollToBottom();
    return div;
}

function scrollToBottom() {
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Export logic
document.getElementById('export-btn').addEventListener('click', () => {
    import('./mirror-export.js').then(module => {
        module.exportKernel(messages);
    });
});
