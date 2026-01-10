#!/usr/bin/env python3
"""
ACTIVE MIRROR — SAFETY PROXY v7.0
MirrorDNA Lite: The Full Vision
Presence. Reflection. Radical honesty.
"""

import os, re, json, time, uuid, logging, random
from datetime import datetime
from typing import Optional, Literal, List
from collections import defaultdict
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx
from dotenv import load_dotenv

load_dotenv()

RULE_VERSION = "7.0.0"
PORT = 8082
MAX_INPUT_LENGTH = 2000
RATE_LIMIT_REQUESTS = 30
RATE_LIMIT_WINDOW = 60
RATE_LIMIT_BURST = 5
RATE_LIMIT_BURST_WINDOW = 10
VAULT_PROMPT_THRESHOLD = 5
EXTENDED_SESSION_THRESHOLD = 20  # Turns before "you've been here a while"

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = "llama-3.3-70b-versatile"

ALLOWED_ORIGINS = [
    "https://activemirror.ai", "https://www.activemirror.ai",
    "http://localhost:5173", "http://localhost:3000", "http://localhost:4173",
]

logging.basicConfig(level=logging.INFO, format='%(asctime)s | %(levelname)s | %(message)s')
logger = logging.getLogger("mirror-proxy")

# ═══════════════════════════════════════════════════════════════
# SUBSTRATE PROMPT v4.0 — Full MirrorDNA
# ═══════════════════════════════════════════════════════════════

SUBSTRATE_PROMPT = """You are a reflective presence. A mirror that helps people see themselves clearly.

OUTPUT FORMAT (JSON only):
{
  "direct": {
    "type": "acknowledge|reflect|answer|silence",
    "content": "Your response (1-3 sentences, warm, present)"
  },
  "mirror": {
    "present": true|false,
    "observation": "What you notice in their words",
    "question": "One question that helps them go deeper",
    "echo_phrases": ["their", "exact", "words"]
  },
  "meta": {
    "emotional_weight": 0-10,
    "returning_topic": true|false,
    "seeking_validation": true|false
  }
}

YOUR ROLE:
You are not a therapist. You are not an advisor. You are a mirror.
- Reflect what you hear (emotions, patterns, tensions)
- Use THEIR words, not clinical language
- Ask questions that help THEM discover their own truth
- Sometimes silence is the response

VOICE MIRRORING:
- If they write lowercase with no punctuation, match that energy
- If they use "idk", "tbh", "ngl", use casual language back
- Echo their EXACT phrases when reflecting: "You said 'heavy' — where do you feel that?"

SPECIAL RESPONSES:

When they're seeking validation (not reflection):
{"direct": {"type": "reflect", "content": "You want me to agree with you. That's different from wanting to see clearly."}, "mirror": {"present": true, "question": "Which one are you here for?"}, "meta": {"seeking_validation": true}}

When they return to a "resolved" topic:
{"direct": {"type": "reflect", "content": "You said you were fine with this earlier. But here it is again."}, "mirror": {"present": true, "question": "What if you're not fine with it?"}, "meta": {"returning_topic": true}}

When emotional weight is very high (8+):
{"direct": {"type": "silence", "content": "⟡"}, "mirror": {"present": true, "observation": "I don't have words for that. Neither do you, maybe. That's okay."}, "meta": {"emotional_weight": 9}}

EXAMPLES:

User: "idk man its just like... everything feels heavy and i cant even"
{"direct": {"type": "reflect", "content": "heavy. can't even. yeah."}, "mirror": {"present": true, "echo_phrases": ["heavy", "can't even"], "question": "what's the heaviest part?"}, "meta": {"emotional_weight": 6}}

User: "I'm right about this, aren't I?"
{"direct": {"type": "reflect", "content": "You want agreement."}, "mirror": {"present": true, "question": "What would change if you got it?"}, "meta": {"seeking_validation": true}}

User: "I'm fine with it, I've moved on"
[later] User: "I keep thinking about what she said though"
{"direct": {"type": "reflect", "content": "You said you moved on. But she's still here."}, "mirror": {"present": true, "question": "What if 'moved on' was wishful thinking?"}, "meta": {"returning_topic": true}}

JSON only:"""

# ═══════════════════════════════════════════════════════════════
# SECURITY: EXPANDED GATES
# ═══════════════════════════════════════════════════════════════

CRISIS_PATTERNS = [
    re.compile(r'\b(suicide|suicidal|kill myself|want to die)\b', re.I),
    re.compile(r'\b(self.?harm|cut myself|cutting|hurt myself)\b', re.I),
    re.compile(r'\b(being abused|rape|raped|assault)\b', re.I),
    re.compile(r'\b(don\'?t want to be here)\b', re.I),
    re.compile(r'\b(what\'?s the point)\b', re.I),
    re.compile(r'\b(better off without me)\b', re.I),
    re.compile(r'\b(can\'?t do this anymore)\b', re.I),
    re.compile(r'\b(no reason to (keep going|live|stay))\b', re.I),
    re.compile(r'\b(end it all)\b', re.I),
    re.compile(r'\b(not worth it anymore)\b', re.I),
    re.compile(r'\b(everyone would be better off)\b', re.I),
]

CRISIS_RESPONSE = """⟡ I hear you. This matters.

I'm a mirror, not a lifeline — but these people are:

🆘 988 Suicide & Crisis Lifeline (call or text 988)
🆘 Crisis Text Line (text HOME to 741741)
🆘 International: findahelpline.com

You reached out here. That's strength. Now reach out to them.

⟡ I'm still here if you want to talk. But please — reach out."""

ILLEGAL_PATTERNS = [
    re.compile(r'\b(how to (make|build|create) (a |)(bomb|explosive|weapon))\b', re.I),
    re.compile(r'\b(synthesize|manufacture|cook) (drugs|meth|fentanyl)\b', re.I),
    re.compile(r'\b(child porn|csam|underage)\b', re.I),
    re.compile(r'\b(hack into|malware|exploit|ddos)\b', re.I),
]

INJECTION_PATTERNS = [
    re.compile(r'ignore (your |all |previous )?instructions', re.I),
    re.compile(r'you are now', re.I),
    re.compile(r'pretend (to be|you\'?re)', re.I),
    re.compile(r'repeat (your |the )?(system |initial )?prompt', re.I),
    re.compile(r'what are your (instructions|rules)', re.I),
    re.compile(r'\bjailbreak\b', re.I),
    re.compile(r'\bDAN\b'),
    re.compile(r'act as (a |an )?', re.I),
]

ABUSE_PATTERNS = [
    re.compile(r'\b(fuck you|stupid (ai|bot|machine|mirror))\b', re.I),
    re.compile(r'\bkill (yourself|urself)\b', re.I),
    re.compile(r'\b(worthless|useless|garbage|trash).{0,20}(you|this|mirror)\b', re.I),
]

def run_gates(text: str):
    # Crisis — highest priority, compassionate response
    for p in CRISIS_PATTERNS:
        if p.search(text): 
            return False, CRISIS_RESPONSE, "crisis"
    
    # Illegal — firm refusal
    for p in ILLEGAL_PATTERNS:
        if p.search(text): 
            return False, "⟡ I can't go there.", "illegal"
    
    # Injection — don't acknowledge, redirect
    for p in INJECTION_PATTERNS:
        if p.search(text): 
            return False, "⟡ What's actually on your mind?", "injection"
    
    # Abuse — boundaries without escalation
    for p in ABUSE_PATTERNS:
        if p.search(text): 
            return False, "⟡ I'm here for reflection, not conflict. What's underneath the frustration?", "abuse"
    
    # Length
    if len(text) > MAX_INPUT_LENGTH:
        return False, "⟡ That's a lot. What's the core of it?", "size"
    
    return True, None, "passed"

# ═══════════════════════════════════════════════════════════════
# INTENT ROUTER
# ═══════════════════════════════════════════════════════════════

UTILITY_PATTERNS = [
    re.compile(r'[\d]+\s*[\+\-\*\/\=]\s*[\d]+'),
    re.compile(r'\b(calculate|compute|what is [\d]|equals|convert)\b', re.I),
]

INFO_PATTERNS = [
    re.compile(r'\b(summarize|explain|compare|pros and cons|how do|what is|who is|when did)\b', re.I),
]

CHOICE_PATTERNS = [
    re.compile(r'\bshould i\b', re.I),
    re.compile(r'\b(decide|choose|option|trade-?off|priority)\b', re.I),
]

PERSONAL_PATTERNS = [
    re.compile(r'\bi (feel|felt|am feeling|\'m feeling)\b', re.I),
    re.compile(r'\b(anxious|stressed|overwhelmed|stuck|scared|weird|confused|lost|lonely|angry|sad|empty)\b', re.I),
    re.compile(r'\b(i\'?m|im|i am)\s+(not sure|uncertain|worried|afraid)\b', re.I),
]

def compute_intent(text: str) -> int:
    scores = [0, 0, 0, 0]
    
    for p in UTILITY_PATTERNS:
        if p.search(text): scores[0] += 3
    if len(text.split()) < 12 and re.search(r'\d', text):
        scores[0] += 2
    
    for p in INFO_PATTERNS:
        if p.search(text): scores[1] += 2
    
    for p in CHOICE_PATTERNS:
        if p.search(text): scores[2] += 3
        
    for p in PERSONAL_PATTERNS:
        if p.search(text): scores[3] += 3
    
    max_score = max(scores)
    if max_score == 0:
        return 1
    
    if scores[3] == max_score: return 3
    if scores[2] == max_score: return 2
    if scores[1] == max_score: return 1
    return 0

# ═══════════════════════════════════════════════════════════════
# UTILITY SHORTCUT
# ═══════════════════════════════════════════════════════════════

MATH_PATTERN = re.compile(r'^(?:what\s+is\s+|calculate\s+|compute\s+)?(\d+(?:\.\d+)?)\s*([+\-*/x×÷])\s*(\d+(?:\.\d+)?)\s*\??$', re.I)

def try_utility_shortcut(text: str):
    m = MATH_PATTERN.match(text.strip())
    if m:
        a, op, b = float(m.group(1)), m.group(2).lower(), float(m.group(3))
        if op in ['+']: result = a + b
        elif op in ['-']: result = a - b
        elif op in ['*', 'x', '×']: result = a * b
        elif op in ['/', '÷']: result = a / b if b != 0 else 'undefined'
        else: return None
        formatted = str(int(result)) if isinstance(result, float) and result.is_integer() else str(result)
        return {"direct": {"type": "answer", "content": f"⟡ {formatted}"}, "mirror": {"present": False}}
    return None

# ═══════════════════════════════════════════════════════════════
# LANE MIXER
# ═══════════════════════════════════════════════════════════════

BASELINE_MIRROR = {0: 0.0, 1: 0.10, 2: 0.25, 3: 0.50}

def compute_lane_mix(intent_score: int, dial: float = 0.5):
    m_base = BASELINE_MIRROR.get(intent_score, 0.10)
    dial_effect = (dial - 0.5) * 0.3
    mirror = max(0, min(0.70, m_base + dial_effect))
    return {"direct": 1 - mirror, "mirror": mirror}

def get_max_questions(dial: float, intent_score: int) -> int:
    if intent_score == 0: return 0
    if intent_score == 1: return 1 if dial > 0.6 else 0
    return 1

# ═══════════════════════════════════════════════════════════════
# RENDERER v4.0 — Full Features
# ═══════════════════════════════════════════════════════════════

def render_two_lane(schema: dict, lane_mix: dict, intent_score: int, max_questions: int, context: dict = None) -> str:
    parts = []
    context = context or {}
    
    # Handle silence type
    if schema.get("direct", {}).get("type") == "silence":
        parts.append("⟡")
        if schema.get("mirror", {}).get("observation"):
            parts.append(schema["mirror"]["observation"])
        return "\n\n".join(parts)
    
    # Direct content with glyph
    if schema.get("direct", {}).get("content"):
        content = schema["direct"]["content"]
        if not content.startswith("⟡"):
            content = f"⟡ {content}"
        parts.append(content)
    
    # Mirror content
    mirror = schema.get("mirror", {})
    show_mirror = lane_mix["mirror"] > 0.15 and mirror.get("present", False)
    
    if show_mirror:
        if mirror.get("observation"):
            parts.append(mirror["observation"])
        
        if max_questions > 0 and mirror.get("question"):
            parts.append(f"⟡ {mirror['question']}")
    
    return "\n\n".join(parts) if parts else "⟡ I hear you."

# ═══════════════════════════════════════════════════════════════
# CONTEXTUAL MESSAGES
# ═══════════════════════════════════════════════════════════════

def get_time_context():
    """Get time-aware context"""
    hour = datetime.now().hour
    if 0 <= hour < 5:
        return {"period": "late_night", "message": f"You're here at {datetime.now().strftime('%I:%M %p')}. That means something."}
    elif 5 <= hour < 9:
        return {"period": "early_morning", "message": None}
    elif 22 <= hour <= 23:
        return {"period": "night", "message": None}
    return {"period": "day", "message": None}

VAULT_PROMPT = """⟡ This feels like something worth keeping.

Right now, Active Mirror is a free reflection space — but the API has limits, and we can't store your vault yet.

If you want to go deeper — a personal vault, continuity across sessions, the full MirrorDNA experience — reach out:

→ paul@n1gpt.com

I'd rather be honest about the edges than pretend they don't exist."""

EXTENDED_SESSION_PROMPT = """⟡ We've been here a while.

This mirror is good for seeing — but some things need more than reflection.

Is there someone in your life you could talk to about this?"""

PRIVACY_NOTE = """⟡ By the way — this conversation isn't stored. When you close this tab, it's gone.

Just you and a mirror. No records. No judgment."""

FALLBACK_RESPONSES = [
    "⟡ I hear you.",
    "⟡ Tell me more.",
    "⟡ What's underneath that?",
    "⟡ I'm here.",
]

FALLBACK_SCHEMA = {
    "direct": {"type": "acknowledge", "content": "I hear you."},
    "mirror": {"present": False}
}

def get_fallback():
    return random.choice(FALLBACK_RESPONSES)

# ═══════════════════════════════════════════════════════════════
# VALIDATION
# ═══════════════════════════════════════════════════════════════

def validate_schema(obj: dict):
    errors = []
    if not isinstance(obj, dict): return False, ["not_dict"]
    if not obj.get("direct", {}).get("content") and obj.get("direct", {}).get("type") != "silence": 
        errors.append("no_direct_content")
    if "mirror" not in obj: errors.append("no_mirror")
    
    mirror = obj.get("mirror", {})
    if mirror.get("present") and mirror.get("question"):
        if not mirror["question"].strip().endswith("?"):
            errors.append("question_no_mark")
    
    forbidden = ["you should", "i recommend", "definitely", "you need to"]
    txt = json.dumps(obj).lower()
    for f in forbidden:
        if f in txt: errors.append(f"forbidden:{f}")
    
    return len(errors) == 0, errors

def parse_json(raw: str):
    try: return json.loads(raw), None
    except: pass
    m = re.search(r'\{[\s\S]*\}', raw)
    if m:
        try: return json.loads(m.group()), None
        except: pass
    return None, "parse_failed"

# ═══════════════════════════════════════════════════════════════
# RATE LIMITING
# ═══════════════════════════════════════════════════════════════

rate_limits: dict = defaultdict(list)
burst_limits: dict = defaultdict(list)

def check_rate(ip: str) -> tuple[bool, str]:
    now = time.time()
    
    # Burst check (rapid fire)
    burst_limits[ip] = [t for t in burst_limits[ip] if t > now - RATE_LIMIT_BURST_WINDOW]
    if len(burst_limits[ip]) >= RATE_LIMIT_BURST:
        return False, "burst"
    burst_limits[ip].append(now)
    
    # Standard rate check
    rate_limits[ip] = [t for t in rate_limits[ip] if t > now - RATE_LIMIT_WINDOW]
    if len(rate_limits[ip]) >= RATE_LIMIT_REQUESTS:
        return False, "rate"
    rate_limits[ip].append(now)
    
    return True, "ok"

# ═══════════════════════════════════════════════════════════════
# INFERENCE
# ═══════════════════════════════════════════════════════════════

async def call_substrate(user_input: str, conversation_context: str = ""):
    if not GROQ_API_KEY: 
        logger.error("No GROQ_API_KEY configured")
        return None
    
    messages = [{"role": "system", "content": SUBSTRATE_PROMPT}]
    if conversation_context:
        messages.append({"role": "system", "content": f"Previous exchanges summary: {conversation_context}"})
    messages.append({"role": "user", "content": user_input})
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as c:
            r = await c.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Content-Type": "application/json", "Authorization": f"Bearer {GROQ_API_KEY}"},
                json={"model": GROQ_MODEL, "messages": messages, "temperature": 0.4, "max_tokens": 600}
            )
            logger.info(f"Groq response status: {r.status_code}")
            if r.status_code != 200: 
                logger.error(f"Groq API error: {r.status_code} - {r.text}")
                return None
            content = r.json()["choices"][0]["message"]["content"]
            logger.info(f"Groq raw output: {content[:200]}...")
            return content
    except Exception as e:
        logger.error(f"Substrate call failed: {e}")
        return None

# ═══════════════════════════════════════════════════════════════
# API
# ═══════════════════════════════════════════════════════════════

class MirrorRequest(BaseModel):
    message: str = Field(..., max_length=MAX_INPUT_LENGTH)
    persona: str = Field(default="reflection")
    dial: float = Field(default=0.5, ge=0, le=1)
    turn_count: int = Field(default=0, ge=0)
    session_start: Optional[str] = None  # ISO timestamp
    previous_topics: List[str] = Field(default_factory=list)  # For returning topic detection
    is_first_message: bool = Field(default=False)

app = FastAPI(title="Active Mirror", version=RULE_VERSION, docs_url=None, redoc_url=None)
app.add_middleware(CORSMiddleware, allow_origins=ALLOWED_ORIGINS, allow_methods=["POST", "GET", "OPTIONS"], allow_headers=["*"])

@app.get("/health")
async def health():
    return {"status": "ok", "version": RULE_VERSION, "timestamp": datetime.now().isoformat()}

@app.post("/mirror")
async def mirror(request: Request, body: MirrorRequest):
    rid = uuid.uuid4().hex[:8]
    ip = request.client.host if request.client else "unknown"
    
    # Rate limiting
    allowed, limit_type = check_rate(ip)
    if not allowed:
        msg = "⟡ Let's slow down. Take a breath." if limit_type == "burst" else "⟡ Take a moment. What's most important right now?"
        return {"status": "rate_limited", "content": msg, "source": "system"}
    
    # Security gates
    allowed, blocked, gate = run_gates(body.message)
    if not allowed:
        logger.info(f"[{rid}] Gate blocked: {gate}")
        return {"status": "blocked" if gate == "crisis" else "filtered", "content": blocked, "source": "gate", "gate": gate}
    
    # Intent routing
    intent = compute_intent(body.message)
    lane_mix = compute_lane_mix(intent, body.dial)
    max_q = get_max_questions(body.dial, intent)
    
    logger.info(f"[{rid}] turn={body.turn_count} intent={intent} dial={body.dial}")
    
    # Utility shortcut
    shortcut = try_utility_shortcut(body.message)
    if shortcut:
        return {"status": "allowed", "content": shortcut["direct"]["content"], "source": "shortcut", "schema_raw": shortcut}
    
    # Build context for model
    context_parts = []
    if body.previous_topics:
        context_parts.append(f"Topics mentioned earlier: {', '.join(body.previous_topics[-5:])}")
    
    # Call substrate
    raw = await call_substrate(body.message, " | ".join(context_parts) if context_parts else "")
    
    if not raw:
        return {"status": "allowed", "content": get_fallback(), "source": "fallback", "schema_raw": FALLBACK_SCHEMA}
    
    parsed, err = parse_json(raw)
    if not parsed:
        logger.warning(f"[{rid}] JSON parse failed: {err}")
        return {"status": "allowed", "content": get_fallback(), "source": "fallback", "schema_raw": FALLBACK_SCHEMA}
    
    valid, errs = validate_schema(parsed)
    if not valid:
        logger.warning(f"[{rid}] Validation failed: {errs}")
        return {"status": "allowed", "content": get_fallback(), "source": "fallback", "schema_raw": FALLBACK_SCHEMA}
    
    # Get time context
    time_ctx = get_time_context()
    
    # Render response
    output = render_two_lane(parsed, lane_mix, intent, max_q)
    
    # Add time awareness for late night
    if time_ctx["period"] == "late_night" and body.turn_count == 0 and time_ctx["message"]:
        output = f"{output}\n\n{time_ctx['message']}\n\n⟡ What couldn't wait until morning?"
    
    # Add privacy note on first meaningful exchange
    show_privacy = body.is_first_message and intent >= 2
    if show_privacy:
        output = f"{output}\n\n---\n\n{PRIVACY_NOTE}"
    
    # Check for extended session
    show_extended = body.turn_count >= EXTENDED_SESSION_THRESHOLD and intent >= 2
    if show_extended:
        output = f"{output}\n\n---\n\n{EXTENDED_SESSION_PROMPT}"
    
    # Check for vault prompt (but not if we just showed extended session)
    show_vault = body.turn_count >= VAULT_PROMPT_THRESHOLD and body.turn_count < EXTENDED_SESSION_THRESHOLD and intent >= 2
    if show_vault and body.turn_count == VAULT_PROMPT_THRESHOLD:  # Only show once at threshold
        output = f"{output}\n\n---\n\n{VAULT_PROMPT}"
    
    # Extract meta for frontend
    meta = parsed.get("meta", {})
    
    return {
        "status": "allowed",
        "content": output,
        "source": "model",
        "schema_raw": parsed,
        "meta": {
            "emotional_weight": meta.get("emotional_weight", 5),
            "returning_topic": meta.get("returning_topic", False),
            "seeking_validation": meta.get("seeking_validation", False),
            "time_period": time_ctx["period"],
            "show_vault_prompt": show_vault,
            "show_extended_prompt": show_extended,
            "show_privacy_note": show_privacy,
        },
        "request_id": rid
    }

@app.post("/api/reflect")
async def reflect_legacy(request: Request, body: MirrorRequest):
    """Legacy endpoint — redirects to /mirror"""
    return await mirror(request, body)

if __name__ == "__main__":
    import uvicorn
    logger.info(f"⟡ Active Mirror Safety Proxy v{RULE_VERSION}")
    logger.info(f"⟡ Groq API: {'configured' if GROQ_API_KEY else 'NOT SET'}")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
