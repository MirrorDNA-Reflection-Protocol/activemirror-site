/**
 * Lane Mixer — Two-Lane Conversation System
 * Computes effective Direct/Mirror mix from intent score + user dial
 */

// ═══════════════════════════════════════════════════════════════
// BASELINE LANE MIX BY INTENT
// ═══════════════════════════════════════════════════════════════

// Mirror share baselines (from spec)
const BASELINE_MIRROR = {
    0: 0.00,   // Utility → 100% Direct
    1: 0.15,   // Info → 85% Direct, 15% Mirror
    2: 0.40,   // Choice → 60% Direct, 40% Mirror
    3: 0.70    // Personal → 30% Direct, 70% Mirror
};

// ═══════════════════════════════════════════════════════════════
// DIAL EFFECT
// ═══════════════════════════════════════════════════════════════

/**
 * Clamp value between min and max
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Compute effective lane mix from intent score and dial
 * @param {number} intentScore - 0, 1, 2, or 3
 * @param {number} dial - User preference 0 (direct) to 1 (mirror), default 0.5
 * @returns {{ direct: number, mirror: number }}
 */
export function computeLaneMix(intentScore, dial = 0.5) {
    const M_base = BASELINE_MIRROR[intentScore] ?? BASELINE_MIRROR[1];

    // Dial effect: shift baseline by ±20% (0.4 * 0.5 = 0.2)
    // dial=0 → -0.2, dial=0.5 → 0, dial=1 → +0.2
    const dialEffect = (dial - 0.5) * 0.4;

    // Effective mirror share (capped at 85%)
    const mirror = clamp(M_base + dialEffect, 0, 0.85);
    const direct = 1 - mirror;

    return { direct, mirror };
}

// ═══════════════════════════════════════════════════════════════
// QUESTION CAPS
// ═══════════════════════════════════════════════════════════════

/**
 * Get maximum questions allowed based on dial position and intent
 * @param {number} dial - User dial (0-1)
 * @param {number} intentScore - Intent score (0-3)
 * @returns {number} Max questions (0, 1, or 2)
 */
export function getMaxQuestions(dial, intentScore) {
    // Utility (0) prefers 0 questions unless dial is high
    if (intentScore === 0 && dial <= 0.66) {
        return 0;
    }

    // Low dial → max 1 question
    if (dial <= 0.33) {
        return 1;
    }

    // Mid dial → max 1 question
    if (dial <= 0.66) {
        return 1;
    }

    // High dial + choice/personal → up to 2 questions
    if (dial > 0.66 && intentScore >= 2) {
        return 2;
    }

    return 1;
}

// ═══════════════════════════════════════════════════════════════
// RENDERING DECISION
// ═══════════════════════════════════════════════════════════════

/**
 * Determine what to render based on lane mix
 * @param {object} laneMix - { direct, mirror }
 * @returns {{ showDirect: boolean, showMirror: boolean, directFirst: boolean }}
 */
export function getRenderStrategy(laneMix) {
    const showDirect = laneMix.direct > 0.1;  // Show if > 10%
    const showMirror = laneMix.mirror > 0.1;  // Show if > 10%
    const directFirst = laneMix.direct >= laneMix.mirror;  // Lead with dominant lane

    return { showDirect, showMirror, directFirst };
}

// ═══════════════════════════════════════════════════════════════
// FULL PIPELINE
// ═══════════════════════════════════════════════════════════════

/**
 * Compute full lane configuration
 * @param {number} intentScore - From intent router
 * @param {number} dial - User dial (0-1)
 * @returns {object} Full lane config
 */
export function computeLaneConfig(intentScore, dial = 0.5) {
    const laneMix = computeLaneMix(intentScore, dial);
    const maxQuestions = getMaxQuestions(dial, intentScore);
    const renderStrategy = getRenderStrategy(laneMix);

    return {
        intentScore,
        dial,
        laneMix,
        maxQuestions,
        ...renderStrategy
    };
}
