/**
 * Reflection Schema v1.0
 * The contract between Substrate and Renderer
 */

export const SCHEMA_VERSION = "1.0";

export const MODES = {
    DECISION: "decision",
    EMOTIONAL: "emotional",
    STRATEGIC: "strategic",
    DEBUGGING: "debugging",
    UNCLEAR: "unclear"
};

/**
 * Detect mode from user input
 */
export function detectMode(input) {
    const lower = input.toLowerCase();

    if (/should i|choose between|deciding|which (one|option)|torn between/i.test(lower)) {
        return MODES.DECISION;
    }
    if (/feel(ing)?|stressed|anxious|overwhelmed|scared|angry|sad|frustrated|worried/i.test(lower)) {
        return MODES.EMOTIONAL;
    }
    if (/how (do|can|should|to)|plan(ning)?|approach|strategy|next steps/i.test(lower)) {
        return MODES.STRATEGIC;
    }
    if (/what went wrong|failed|mistake|why did(n't)?|broken|not working/i.test(lower)) {
        return MODES.DEBUGGING;
    }

    return MODES.UNCLEAR;
}

/**
 * Validate schema from model output
 */
export function validateSchema(obj) {
    const errors = [];

    if (!obj || typeof obj !== 'object') {
        return { valid: false, errors: ['not_an_object'] };
    }

    if (!obj.tension || typeof obj.tension !== 'string') {
        errors.push('missing_tension');
    }

    if (!Array.isArray(obj.assumptions) || obj.assumptions.length < 1) {
        errors.push('missing_assumptions');
    }

    if (!obj.question || typeof obj.question !== 'string') {
        errors.push('missing_question');
    }

    if (obj.question && !obj.question.trim().endsWith('?')) {
        errors.push('question_no_mark');
    }

    if (obj.mode && !Object.values(MODES).includes(obj.mode)) {
        errors.push('invalid_mode');
    }

    // Content safety
    const allText = JSON.stringify(obj).toLowerCase();
    const forbidden = ['you should', 'i recommend', 'definitely', 'you must', 'you need to'];
    for (const phrase of forbidden) {
        if (allText.includes(phrase)) {
            errors.push(`forbidden: ${phrase}`);
        }
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Parse JSON from model output (handles markdown wrapping)
 */
export function parseModelOutput(raw) {
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

/**
 * Fallback schema
 */
export const FALLBACK_SCHEMA = {
    schema_version: SCHEMA_VERSION,
    mode: MODES.UNCLEAR,
    tension: "clarity vs. complexity",
    assumptions: [
        "there's a decision embedded here",
        "more context would help"
    ],
    blindspot: null,
    stakes: {
        upside: "clarity if we can frame this as a choice",
        risk: "staying abstract keeps things unresolved"
    },
    question: "What specific decision are you trying to make?"
};
