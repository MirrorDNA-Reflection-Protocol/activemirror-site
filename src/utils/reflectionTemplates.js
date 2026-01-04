/**
 * Reflection Template Library v2.1 — Two-Lane + Polish
 * Deterministic rendering with meta-language strip
 */

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════════════
// META-LANGUAGE STRIP LIST (v0.2 Polish)
// ═══════════════════════════════════════════════════════════════

const META_STRIP_PATTERNS = [
    /\b(I am a logic engine)[^.]*\./gi,
    /\b(I am designed to)[^.]*\./gi,
    /\b(my role is)[^.]*\./gi,
    /\b(as an AI|as an assistant)[^.]*\./gi,
    /\b(the system|the model|the prompt)[^.]*\./gi,
    /\b(I can't access|I cannot access)[^.]*\./gi,
    /^(Here's the quick answer:|Let me clarify:|I'd like to understand this better\.)\s*/i,
    /^(Here's a quick explanation:|Here's a comparison:)\s*/i,
    /^(To summarize:|In short:|The key points:)\s*/i,
    /^(That said, here's what I notice:)\s*/i,
    /^(Worth considering:)\s*/i,
];

/**
 * Strip meta-language and filler from rendered output
 */
function stripMetaLanguage(text) {
    let clean = text;
    for (const pattern of META_STRIP_PATTERNS) {
        clean = clean.replace(pattern, '');
    }
    // Clean up any double spaces or leading/trailing whitespace
    return clean.replace(/\n{3,}/g, '\n\n').replace(/^\s+|\s+$/g, '').replace(/  +/g, ' ');
}

// ═══════════════════════════════════════════════════════════════
// DIRECT LANE TEMPLATES (Cleaned - no filler openers)
// ═══════════════════════════════════════════════════════════════

const DIRECT_TEMPLATES = {
    answer: ["{content}"],
    explain: ["{content}"],
    summarize: ["{content}"],
    compare: ["{content}"],
    clarify: ["{content}"]
};

// ═══════════════════════════════════════════════════════════════
// MIRROR LANE TEMPLATES (Cleaned - no meta-language)
// ═══════════════════════════════════════════════════════════════

const MIRROR_TRANSITIONS = {
    choice: ["", ""],  // No transition filler
    personal: ["", ""],
    info: ["", ""]
};

const ASSUMPTION_TEMPLATES = [
    "You may be assuming {0}, and {1}.",
    "This rests on {0} — and {1}.",
    "Underlying this: {0}. And {1}."
];

const TRADEOFF_TEMPLATES = [
    "On one hand, {0}. On the other, {1}.",
    "{0}. But also: {1}."
];

const QUESTION_TEMPLATES = [
    "⟡ {question}",
    "{question}"
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

    // Render Direct lane
    if (showDirect && schema.direct?.content) {
        const type = schema.direct.type || 'answer';
        const templates = DIRECT_TEMPLATES[type] || DIRECT_TEMPLATES.answer;
        const directText = pick(templates).replace('{content}', schema.direct.content);

        if (directFirst) {
            parts.push(directText);
        } else {
            parts._directText = directText;
        }
    }

    // Render Mirror lane
    if (showMirror && schema.mirror) {
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

    // Apply meta-language strip
    const output = parts.join('\n\n');
    return stripMetaLanguage(output);
}

// ═══════════════════════════════════════════════════════════════
// UTILITY-ONLY RENDERER
// ═══════════════════════════════════════════════════════════════

/**
 * Render utility-only response (no mirror, no filler)
 */
export function renderUtility(content) {
    return stripMetaLanguage(content);
}

// ═══════════════════════════════════════════════════════════════
// FALLBACK
// ═══════════════════════════════════════════════════════════════

export function renderFallback() {
    return `⟡ What specific decision are you trying to make?`;
}

// Keep v1 function for backward compat
export function renderReflection(schema) {
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

// Export strip function for use in proxy
export { stripMetaLanguage };
