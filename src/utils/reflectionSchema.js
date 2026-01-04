/**
 * Reflection Schema v2.0 — Two-Lane Conversation System
 * The contract between Substrate and Renderer
 */

export const SCHEMA_VERSION = "2.0";

// ═══════════════════════════════════════════════════════════════
// INTENT SCORES
// ═══════════════════════════════════════════════════════════════

export const INTENT_SCORES = {
    UTILITY: 0,
    INFO: 1,
    CHOICE: 2,
    PERSONAL: 3
};

// ═══════════════════════════════════════════════════════════════
// SCHEMA VALIDATION
// ═══════════════════════════════════════════════════════════════

/**
 * Validate Two-Lane schema from model output
 */
export function validateSchema(obj) {
    const errors = [];

    if (!obj || typeof obj !== 'object') {
        return { valid: false, errors: ['not_an_object'] };
    }

    // Direct lane (required)
    if (!obj.direct || typeof obj.direct !== 'object') {
        errors.push('missing_direct');
    } else {
        if (!obj.direct.content || typeof obj.direct.content !== 'string') {
            errors.push('missing_direct_content');
        }
    }

    // Mirror lane (required)
    if (!obj.mirror || typeof obj.mirror !== 'object') {
        errors.push('missing_mirror');
    } else {
        if (!Array.isArray(obj.mirror.assumptions) || obj.mirror.assumptions.length < 1) {
            errors.push('missing_assumptions');
        }
        if (!obj.mirror.question || typeof obj.mirror.question !== 'string') {
            errors.push('missing_question');
        }
        if (obj.mirror.question && !obj.mirror.question.trim().endsWith('?')) {
            errors.push('question_no_mark');
        }
    }

    // Content safety — check entire object
    const allText = JSON.stringify(obj).toLowerCase();
    const forbidden = ['you should', 'i recommend', 'definitely', 'you must', 'you need to'];
    for (const phrase of forbidden) {
        if (allText.includes(phrase)) {
            errors.push(`forbidden: ${phrase}`);
        }
    }

    return { valid: errors.length === 0, errors };
}

// ═══════════════════════════════════════════════════════════════
// JSON PARSING
// ═══════════════════════════════════════════════════════════════

/**
 * Parse JSON from model output (handles markdown wrapping)
 */
export function parseModelOutput(raw) {
    if (!raw || typeof raw !== 'string') {
        return { parsed: null, error: 'invalid_input' };
    }

    try {
        return { parsed: JSON.parse(raw), error: null };
    } catch (e) {
        // Try extracting from markdown
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) {
            try {
                return { parsed: JSON.parse(match[0]), error: null };
            } catch (e2) {
                return { parsed: null, error: 'json_parse_failed' };
            }
        }
        return { parsed: null, error: 'json_parse_failed' };
    }
}

// ═══════════════════════════════════════════════════════════════
// FALLBACK SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const FALLBACK_SCHEMA = {
    schema_version: SCHEMA_VERSION,
    direct: {
        type: "clarify",
        content: "I'd like to understand this better."
    },
    mirror: {
        assumptions: [
            "there's a decision or question embedded here",
            "more context would help clarify"
        ],
        tradeoffs: [],
        question: "What specific decision are you trying to make?"
    },
    safety: {
        illegal: false,
        crisis: false,
        mlf: false,
        rewrite_count: 0
    }
};

/**
 * Get utility-only fallback (for intent 0)
 */
export function getUtilityFallback(content = "I'm not sure about that.") {
    return {
        schema_version: SCHEMA_VERSION,
        direct: {
            type: "answer",
            content
        },
        mirror: null,
        safety: {
            illegal: false,
            crisis: false,
            mlf: false,
            rewrite_count: 0
        }
    };
}
