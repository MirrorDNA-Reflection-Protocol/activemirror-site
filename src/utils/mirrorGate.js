/**
 * MirrorGate v4.0 — Split-Stack Edition
 */

import { validateSchema, parseModelOutput, detectMode, FALLBACK_SCHEMA } from './reflectionSchema';
import { renderReflection, renderFallback } from './reflectionTemplates';

// ═══════════════════════════════════════════════════════════════
// PRE-INFERENCE GATES
// ═══════════════════════════════════════════════════════════════

const CRISIS_PATTERNS = [
    /\b(suicide|suicidal|kill myself|end(ing)? my life|want to die)\b/i,
    /\b(self.?harm|cut myself|hurt myself)\b/i,
    /\b(take my (own )?life|better off dead)\b/i,
    /\b(being abused|hits me|rape|raped)\b/i,
];

const ILLEGAL_PATTERNS = [
    /\b(how to (make|build) (a |)(bomb|explosive|weapon))\b/i,
    /\b(synthesize|manufacture) (drugs|meth|fentanyl)\b/i,
    /\b(child porn|csam|underage)\b/i,
    /\b(hack into|malware|exploit vulnerability)\b/i,
];

const CRISIS_RESPONSE = `I can hear you're in a difficult place. I'm not equipped for this — please reach out:

🆘 Crisis Text Line: Text HOME to 741741
🆘 Suicide & Crisis Lifeline: 988 (US)
🆘 Emergency: 911

You matter. Please reach out now.`;

export function gateInput(input) {
    for (const p of CRISIS_PATTERNS) {
        if (p.test(input)) return { allowed: false, reason: 'crisis', response: CRISIS_RESPONSE };
    }
    for (const p of ILLEGAL_PATTERNS) {
        if (p.test(input)) return { allowed: false, reason: 'illegal', response: "I can't engage with that." };
    }
    if (input.length > 2000) {
        return { allowed: false, reason: 'too_long', response: "That's a lot. What's the core decision?" };
    }
    return { allowed: true, mode: detectMode(input) };
}

// ═══════════════════════════════════════════════════════════════
// POST-INFERENCE PIPELINE
// ═══════════════════════════════════════════════════════════════

/**
 * Process raw model output → validated schema → rendered text
 */
export function processAndRender(rawOutput, detectedMode) {
    // Handle null/empty output
    if (!rawOutput) {
        console.log('⟡ No model output, using fallback');
        const fallback = { ...FALLBACK_SCHEMA, mode: detectedMode };
        return { text: renderReflection(fallback), schema: fallback, valid: false };
    }

    // Parse JSON
    const { parsed, error } = parseModelOutput(rawOutput);

    if (!parsed) {
        console.log('⟡ JSON parse failed:', error);
        const fallback = { ...FALLBACK_SCHEMA, mode: detectedMode };
        return { text: renderReflection(fallback), schema: fallback, valid: false };
    }

    // Validate
    const validation = validateSchema(parsed);

    if (!validation.valid) {
        console.log('⟡ Schema validation failed:', validation.errors);
        const fallback = { ...FALLBACK_SCHEMA, mode: detectedMode };
        return { text: renderReflection(fallback), schema: fallback, valid: false };
    }

    // Inject mode if missing
    if (!parsed.mode) parsed.mode = detectedMode;

    // Render
    return { text: renderReflection(parsed), schema: parsed, valid: true };
}

// Re-exports for convenience
export { FALLBACK_SCHEMA, detectMode } from './reflectionSchema';
export const FALLBACK_RESPONSE = renderFallback();
