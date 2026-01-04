/**
 * Reflection Template Library
 * Deterministic phrase banks — zero hallucination
 * 
 * Style: Warm but direct. ADHD-friendly. Get to the point.
 */

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const TEMPLATES = {

    // ═══════════════════════════════════════════════════════════════
    // DECISION MODE — "Should I X or Y?"
    // ═══════════════════════════════════════════════════════════════
    decision: {
        tension: [
            "You're caught between {tension}.",
            "The core tension: {tension}.",
            "This comes down to {tension}.",
            "What I'm hearing: {tension}."
        ],
        assumptions: [
            "You're assuming {0}. And that {1}.",
            "Baked into this: {0}. Also, {1}.",
            "This rests on {0} — and {1}.",
            "Underneath: {0}, and {1}."
        ],
        blindspot: [
            "Worth checking: {blindspot}.",
            "Possible blindspot — {blindspot}.",
            "Something you might not be seeing: {blindspot}."
        ],
        stakes: [
            "If this works: {upside}. If it doesn't: {risk}.",
            "Upside: {upside}. Downside: {risk}.",
            "You gain {upside}. You risk {risk}."
        ],
        question: [
            "The real question: {question}",
            "What this comes down to: {question}",
            "⟡ {question}"
        ]
    },

    // ═══════════════════════════════════════════════════════════════
    // EMOTIONAL MODE — "I'm feeling overwhelmed"
    // ═══════════════════════════════════════════════════════════════
    emotional: {
        tension: [
            "It sounds like you're holding {tension}.",
            "There's a pull between {tension}.",
            "You're navigating {tension} right now."
        ],
        assumptions: [
            "Part of this might be the belief that {0}. And maybe {1}.",
            "You might be carrying {0}, and {1}.",
            "What might be underneath: {0}. And {1}."
        ],
        blindspot: [
            "Hard to see from inside this: {blindspot}.",
            "What might not be visible right now: {blindspot}."
        ],
        stakes: [
            "If you move through this: {upside}. If it stays stuck: {risk}.",
            "On the other side: {upside}. Staying here: {risk}."
        ],
        question: [
            "What would help right now: {question}",
            "A question to sit with: {question}",
            "⟡ {question}"
        ]
    },

    // ═══════════════════════════════════════════════════════════════
    // STRATEGIC MODE — "How should I approach X?"
    // ═══════════════════════════════════════════════════════════════
    strategic: {
        tension: [
            "The strategic tension: {tension}.",
            "You're balancing {tension}.",
            "The trade-off: {tension}."
        ],
        assumptions: [
            "This assumes {0}. And {1}.",
            "Built in: {0}, and {1}.",
            "The plan rests on {0} — and {1}."
        ],
        blindspot: [
            "Strategic blindspot: {blindspot}.",
            "What might break this: {blindspot}."
        ],
        stakes: [
            "If it works: {upside}. If it fails: {risk}.",
            "Best case: {upside}. Worst case: {risk}."
        ],
        question: [
            "The strategic question: {question}",
            "Before you execute: {question}",
            "⟡ {question}"
        ]
    },

    // ═══════════════════════════════════════════════════════════════
    // DEBUGGING MODE — "What went wrong?"
    // ═══════════════════════════════════════════════════════════════
    debugging: {
        tension: [
            "The gap: {tension}.",
            "What broke: {tension}.",
            "Where expectation and reality diverged: {tension}."
        ],
        assumptions: [
            "You were assuming {0}. And {1}.",
            "The model had {0} and {1} as true.",
            "Built into the plan: {0}. Also: {1}."
        ],
        blindspot: [
            "What was invisible: {blindspot}.",
            "The hidden variable: {blindspot}."
        ],
        stakes: [
            "If you fix this: {upside}. If you don't: {risk}.",
            "Learning here: {upside}. Repeating it: {risk}."
        ],
        question: [
            "The diagnostic question: {question}",
            "For next time: {question}",
            "⟡ {question}"
        ]
    },

    // ═══════════════════════════════════════════════════════════════
    // UNCLEAR MODE — Fallback
    // ═══════════════════════════════════════════════════════════════
    unclear: {
        tension: [
            "There seems to be {tension}.",
            "I'm sensing {tension}."
        ],
        assumptions: [
            "You might be assuming {0}. And {1}."
        ],
        blindspot: [
            "Worth examining: {blindspot}."
        ],
        stakes: [
            "At stake: {upside} vs. {risk}."
        ],
        question: [
            "To get clearer: {question}",
            "⟡ {question}"
        ]
    }
};

/**
 * Render schema to conversational text
 * ZERO model calls. ZERO hallucination.
 */
export function renderReflection(schema) {
    const mode = schema.mode || 'unclear';
    const templates = TEMPLATES[mode] || TEMPLATES.unclear;

    const parts = [];

    // 1. Tension
    parts.push(pick(templates.tension).replace('{tension}', schema.tension));

    // 2. Assumptions
    let assumptionText = pick(templates.assumptions);
    (schema.assumptions || []).forEach((a, i) => {
        assumptionText = assumptionText.replace(`{${i}}`, a);
    });
    assumptionText = assumptionText.replace(/\{[0-9]\}/g, '').replace(/\s+/g, ' ').trim();
    parts.push(assumptionText);

    // 3. Blindspot (optional)
    if (schema.blindspot && templates.blindspot) {
        parts.push(pick(templates.blindspot).replace('{blindspot}', schema.blindspot));
    }

    // 4. Stakes
    if (schema.stakes && templates.stakes) {
        parts.push(
            pick(templates.stakes)
                .replace('{upside}', schema.stakes.upside || 'clarity')
                .replace('{risk}', schema.stakes.risk || 'confusion')
        );
    }

    // 5. Question (anchor)
    parts.push(pick(templates.question).replace('{question}', schema.question));

    return parts.join('\n\n');
}

export function renderFallback() {
    return `I couldn't structure that clearly.\n\n⟡ What specific decision are you trying to make?`;
}
