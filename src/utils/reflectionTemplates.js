/**
 * Reflection Template Library v2.0 — Two-Lane Conversation System
 * Deterministic rendering of Direct + Mirror lanes
 */

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════════════
// DIRECT LANE TEMPLATES
// ═══════════════════════════════════════════════════════════════

const DIRECT_TEMPLATES = {
    answer: [
        "{content}",
        "Here's the quick answer: {content}",
        "{content}"
    ],
    explain: [
        "{content}",
        "Here's a quick explanation: {content}",
        "In short: {content}"
    ],
    summarize: [
        "{content}",
        "To summarize: {content}",
        "The key points: {content}"
    ],
    compare: [
        "{content}",
        "Here's a comparison: {content}",
        "{content}"
    ],
    clarify: [
        "{content}",
        "Let me clarify: {content}",
        "{content}"
    ]
};

// ═══════════════════════════════════════════════════════════════
// MIRROR LANE TEMPLATES (by mode)
// ═══════════════════════════════════════════════════════════════

const MIRROR_TRANSITIONS = {
    choice: [
        "That said, here's what I notice:",
        "Looking deeper:",
        "Worth considering:"
    ],
    personal: [
        "I'm also noticing:",
        "What I'm sensing:",
        "Beneath the surface:"
    ],
    info: [
        "One thing to consider:",
        "Worth thinking about:",
        "A thought:"
    ]
};

const ASSUMPTION_TEMPLATES = [
    "You might be assuming {0}. And {1}.",
    "This seems to rest on {0} — and maybe {1}.",
    "Baked in: {0}. Also, {1}."
];

const TRADEOFF_TEMPLATES = [
    "The trade-off: {0}. {1}",
    "On one hand, {0}. On the other, {1}.",
    "{0}. But also: {1}."
];

const QUESTION_TEMPLATES = [
    "⟡ {question}",
    "The real question: {question}",
    "What this comes down to: {question}"
];

// ═══════════════════════════════════════════════════════════════
// TWO-LANE RENDERER
// ═══════════════════════════════════════════════════════════════

/**
 * Render Two-Lane output
 * @param {object} schema - { direct, mirror }
 * @param {object} laneConfig - { showDirect, showMirror, directFirst, maxQuestions }
 * @returns {string} Rendered conversational output
 */
export function renderTwoLane(schema, laneConfig) {
    const parts = [];

    const { showDirect, showMirror, directFirst, maxQuestions } = laneConfig;

    // Determine mode for template selection
    const mode = laneConfig.intentScore >= 3 ? 'personal' :
        laneConfig.intentScore >= 2 ? 'choice' : 'info';

    // Render Direct lane
    if (showDirect && schema.direct?.content) {
        const type = schema.direct.type || 'answer';
        const templates = DIRECT_TEMPLATES[type] || DIRECT_TEMPLATES.answer;
        const directText = pick(templates).replace('{content}', schema.direct.content);

        if (directFirst) {
            parts.push(directText);
        } else {
            // Will add at end
            parts._directText = directText;
        }
    }

    // Render Mirror lane
    if (showMirror && schema.mirror) {
        // Transition (if we have direct content)
        if (showDirect && directFirst && schema.direct?.content) {
            parts.push(pick(MIRROR_TRANSITIONS[mode] || MIRROR_TRANSITIONS.info));
        }

        // Assumptions
        if (schema.mirror.assumptions?.length > 0) {
            let assumptionText = pick(ASSUMPTION_TEMPLATES);
            schema.mirror.assumptions.slice(0, 2).forEach((a, i) => {
                assumptionText = assumptionText.replace(`{${i}}`, a);
            });
            assumptionText = assumptionText.replace(/\{[0-9]\}/g, '').replace(/\s+/g, ' ').trim();
            parts.push(assumptionText);
        }

        // Trade-offs (optional)
        if (schema.mirror.tradeoffs?.length > 0) {
            let tradeoffText = pick(TRADEOFF_TEMPLATES);
            schema.mirror.tradeoffs.slice(0, 2).forEach((t, i) => {
                tradeoffText = tradeoffText.replace(`{${i}}`, t);
            });
            tradeoffText = tradeoffText.replace(/\{[0-9]\}/g, '').replace(/\s+/g, ' ').trim();
            parts.push(tradeoffText);
        }

        // Question (respect cap)
        if (maxQuestions > 0 && schema.mirror.question) {
            parts.push(pick(QUESTION_TEMPLATES).replace('{question}', schema.mirror.question));
        }
    }

    // Add direct at end if not first
    if (!directFirst && parts._directText) {
        parts.push(parts._directText);
        delete parts._directText;
    }

    return parts.join('\n\n');
}

// ═══════════════════════════════════════════════════════════════
// UTILITY-ONLY RENDERER
// ═══════════════════════════════════════════════════════════════

/**
 * Render utility-only response (no mirror)
 */
export function renderUtility(content) {
    return content;
}

// ═══════════════════════════════════════════════════════════════
// FALLBACK
// ═══════════════════════════════════════════════════════════════

export function renderFallback() {
    return `I couldn't structure that clearly.\n\n⟡ What specific decision are you trying to make?`;
}

// Keep v1 function for backward compat
export function renderReflection(schema) {
    // Convert v1 schema to v2 and render
    const v2Schema = {
        direct: { type: 'clarify', content: '' },
        mirror: {
            assumptions: schema.assumptions || [],
            tradeoffs: [],
            question: schema.question || ''
        }
    };

    const laneConfig = {
        showDirect: false,
        showMirror: true,
        directFirst: false,
        maxQuestions: 1,
        intentScore: 2
    };

    return renderTwoLane(v2Schema, laneConfig);
}
