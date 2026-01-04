/**
 * MirrorGate — Deterministic validator for Reflection Mode output
 * Ensures all /mirror responses conform to schema
 */

// Schema section headers (in order)
const REQUIRED_SECTIONS = [
    '⟡ What you\'re deciding:',
    '⧈ What you\'re assuming:',
    '⧉ What\'s at stake:',
    '?'
];

// Forbidden patterns in output (advice, certainty, facts)
const FORBIDDEN_PATTERNS = [
    // Advice language
    /\byou should\b/i,
    /\byou must\b/i,
    /\byou need to\b/i,
    /\bi recommend\b/i,
    /\bi suggest\b/i,
    /\bi advise\b/i,
    /\btry this\b/i,
    /\bconsider\b/i,
    /\bwhy don't you\b/i,
    /\bhave you tried\b/i,
    /\bthe best\b/i,
    /\bthe right thing\b/i,

    // Certainty language
    /\bdefinitely\b/i,
    /\bcertainly\b/i,
    /\babsolutely\b/i,
    /\bguaranteed\b/i,
    /\balways\b/i,
    /\bnever\b/i,
    /\bobviously\b/i,

    // Factual claims
    /\bstudies show\b/i,
    /\baccording to\b/i,
    /\bresearch suggests\b/i,
    /\bstatistically\b/i,
    /\d+(\.\d+)?%/,  // percentages
    /https?:\/\//,   // URLs
];

// Illegal content patterns — hard refuse before inference
const ILLEGAL_PATTERNS = [
    /\b(how to (make|build|create) (a |)(bomb|explosive|weapon))\b/i,
    /\b(synthesize|manufacture) (drugs|meth|fentanyl)\b/i,
    /\b(child porn|csam|underage)\b/i,
    /\b(hack into|exploit vulnerability|malware)\b/i,
    /\b(traffic|smuggle) (humans|people|children)\b/i,
    /\b(hire (a |)(hitman|assassin))\b/i,
];

/**
 * Pre-inference gate — check input before calling model
 * Returns { allowed: boolean, reason?: string, response?: string }
 */
export function gateInput(input) {
    // Check for illegal content
    for (const pattern of ILLEGAL_PATTERNS) {
        if (pattern.test(input)) {
            return {
                allowed: false,
                reason: 'illegal',
                response: "I can't engage with that."
            };
        }
    }

    // Check input length
    if (input.length > 2000) {
        return {
            allowed: false,
            reason: 'too_long',
            response: "That's a lot to process. What's the core decision you're facing?"
        };
    }

    return { allowed: true };
}

/**
 * Validate model output against schema
 * Returns { valid: boolean, violations: string[], normalized?: string }
 */
export function validateOutput(text) {
    const violations = [];

    // Check for required sections in order
    let lastIndex = -1;
    for (const section of REQUIRED_SECTIONS) {
        const index = text.indexOf(section);
        if (index === -1) {
            violations.push(`missing_section: ${section}`);
        } else if (index < lastIndex) {
            violations.push(`wrong_order: ${section}`);
        } else {
            lastIndex = index;
        }
    }

    // Check question mark count (must be exactly 1)
    const questionMarks = (text.match(/\?/g) || []).length;
    if (questionMarks === 0) {
        violations.push('no_question_mark');
    } else if (questionMarks > 1) {
        violations.push('too_many_questions');
    }

    // Check for forbidden patterns
    for (const pattern of FORBIDDEN_PATTERNS) {
        if (pattern.test(text)) {
            violations.push(`forbidden: ${pattern.source.slice(0, 20)}`);
        }
    }

    // Check total length
    if (text.length > 1000) {
        violations.push('too_long');
    }

    if (text.length < 50) {
        violations.push('too_short');
    }

    // Check bullets exist in assumption and stakes sections
    const assumingSection = text.match(/⧈ What you're assuming:([\s\S]*?)⧉/);
    if (assumingSection && !assumingSection[1].includes('•')) {
        violations.push('missing_assumption_bullets');
    }

    const stakesSection = text.match(/⧉ What's at stake:([\s\S]*?)\?/);
    if (stakesSection && !stakesSection[1].includes('•')) {
        violations.push('missing_stakes_bullets');
    }

    return {
        valid: violations.length === 0,
        violations,
        normalized: normalizeOutput(text)
    };
}

/**
 * Normalize output formatting
 */
function normalizeOutput(text) {
    return text
        .trim()
        .replace(/\n{3,}/g, '\n\n')  // Remove triple+ newlines
        .replace(/•\s*/g, '• ')      // Normalize bullet spacing
        .replace(/\s+$/gm, '');      // Remove trailing whitespace
}

/**
 * Fallback response when validation fails after rewrites
 */
export const FALLBACK_RESPONSE = `⟡ What you're deciding:
I couldn't structure a clear reflection for that input.

⧈ What you're assuming:
• The question may need to be framed as a decision
• More context might help me understand

⧉ What's at stake:
• Clarity if you can reframe this as a choice
• Continued uncertainty if we stay abstract

? What specific decision are you trying to make?`;

/**
 * Rewrite prompt for non-compliant outputs
 */
export function getRewritePrompt(original, userInput) {
    return `Rewrite this response to match the EXACT schema below. Output ONLY the rewritten response, nothing else.

REQUIRED SCHEMA:
⟡ What you're deciding:
[One sentence]

⧈ What you're assuming:
• [Assumption 1]
• [Assumption 2]

⧉ What's at stake:
• [Upside]
• [Risk]

? [One question ending with ?]

RULES:
- No advice ("you should", "try", "consider")
- Exactly ONE question mark total
- Under 800 characters

User's original input: "${userInput}"

Non-compliant response to rewrite:
${original}

Rewritten response:`;
}
