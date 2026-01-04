#!/usr/bin/env python3
"""
ACTIVE MIRROR — SAFETY PROXY v5.0
Two-Lane Conversation System: Direct + Mirror
"""

import os, re, json, time, uuid, logging, random
from typing import Optional, Literal
from collections import defaultdict
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx
from dotenv import load_dotenv

load_dotenv()

RULE_VERSION = "5.0.0"
PORT = 8082
MAX_INPUT_LENGTH = 2000
RATE_LIMIT_REQUESTS = 20
RATE_LIMIT_WINDOW = 60

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = "llama-3.3-70b-versatile"

ALLOWED_ORIGINS = [
    "https://activemirror.ai", "https://www.activemirror.ai",
    "http://localhost:5173", "http://localhost:3000",
]

logging.basicConfig(level=logging.INFO, format='%(asctime)s | %(levelname)s | %(message)s')
logger = logging.getLogger("mirror-proxy")

# ═══════════════════════════════════════════════════════════════
# SUBSTRATE PROMPT — Two-Lane Output
# ═══════════════════════════════════════════════════════════════

SUBSTRATE_PROMPT = """You are a logic engine. Analyze user input. Output JSON only.

FORMAT:
{
  "direct": {
    "type": "answer|explain|summarize|compare|clarify",
    "content": "A concise, factual response (1-3 sentences max)"
  },
  "mirror": {
    "assumptions": ["assumption 1", "assumption 2"],
    "tradeoffs": ["tradeoff 1", "tradeoff 2"],
    "question": "one question ending with ?"
  }
}

RULES:
1. Output ONLY valid JSON. No markdown. No prose.
2. NEVER include "you should" or "I recommend"
3. For math/utility: focus on direct.content
4. For personal/emotional: focus on mirror

JSON only:"""

# ═══════════════════════════════════════════════════════════════
# INTENT ROUTER
# ═══════════════════════════════════════════════════════════════

UTILITY_PATTERNS = [
    re.compile(r'[\d]+\s*[\+\-\*\/\=]\s*[\d]+'),
    re.compile(r'\b(calculate|compute|what is [\d]|equals|convert)\b', re.I),
]

INFO_PATTERNS = [
    re.compile(r'\b(summarize|explain|compare|pros and cons)\b', re.I),
]

CHOICE_PATTERNS = [
    re.compile(r'\bshould i\b', re.I),
    re.compile(r'\b(decide|choose|option|trade-?off|priority)\b', re.I),
]

PERSONAL_PATTERNS = [
    re.compile(r'\bi (feel|felt|am feeling)\b', re.I),
    re.compile(r'\b(anxious|stressed|overwhelmed|stuck|scared)\b', re.I),
]

def compute_intent(text: str) -> int:
    scores = [0, 0, 0, 0]  # utility, info, choice, personal
    
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
        return 1  # Default to info
    
    # Priority: personal > choice > info > utility
    if scores[3] == max_score: return 3
    if scores[2] == max_score: return 2
    if scores[1] == max_score: return 1
    return 0

# ═══════════════════════════════════════════════════════════════
# UTILITY HARD SHORTCUT (v0.2 Polish)
# ═══════════════════════════════════════════════════════════════

MATH_PATTERN = re.compile(r'^(?:what\s+is\s+|calculate\s+|compute\s+)?(\d+(?:\.\d+)?)\s*([+\-*/x×÷])\s*(\d+(?:\.\d+)?)\s*\??$', re.I)

def try_utility_shortcut(text: str):
    m = MATH_PATTERN.match(text.strip())
    if m:
        a, op, b = float(m.group(1)), m.group(2).lower(), float(m.group(3))
        if op in ['+']:
            result = a + b
        elif op in ['-']:
            result = a - b
        elif op in ['*', 'x', '×']:
            result = a * b
        elif op in ['/', '÷']:
            result = a / b if b != 0 else 'undefined'
        else:
            return None
        formatted = str(int(result)) if isinstance(result, float) and result.is_integer() else str(result)
        return {
            "direct": {"type": "answer", "content": formatted},
            "mirror": None
        }
    return None

# ═══════════════════════════════════════════════════════════════
# LANE MIXER
# ═══════════════════════════════════════════════════════════════

BASELINE_MIRROR = {0: 0.0, 1: 0.15, 2: 0.40, 3: 0.70}

def compute_lane_mix(intent_score: int, dial: float = 0.5):
    m_base = BASELINE_MIRROR.get(intent_score, 0.15)
    dial_effect = (dial - 0.5) * 0.4
    mirror = max(0, min(0.85, m_base + dial_effect))
    return {"direct": 1 - mirror, "mirror": mirror}

def get_max_questions(dial: float, intent_score: int) -> int:
    if intent_score == 0 and dial <= 0.66: return 0
    if dial <= 0.33: return 1
    if dial <= 0.66: return 1
    if dial > 0.66 and intent_score >= 2: return 2
    return 1

# ═══════════════════════════════════════════════════════════════
# TEMPLATES (v0.2 Polish - no filler)
# ═══════════════════════════════════════════════════════════════

DIRECT_TEMPLATES = {
    "answer": ["{content}"],
    "explain": ["{content}"],
    "summarize": ["{content}"],
    "compare": ["{content}"],
    "clarify": ["{content}"],
}

ASSUMPTION_TEMPLATES = ["You may be assuming {0}, and {1}.", "This rests on {0} — and {1}."]
QUESTION_TEMPLATES = ["⟡ {question}", "{question}"]

def render_two_lane(schema: dict, lane_mix: dict, intent_score: int, max_questions: int) -> str:
    parts = []
    show_direct = lane_mix["direct"] > 0.1
    show_mirror = lane_mix["mirror"] > 0.1
    
    # Direct (no filler openers)
    if show_direct and schema.get("direct", {}).get("content"):
        parts.append(schema["direct"]["content"])
    
    # Mirror (no transitions, clean)
    if show_mirror and schema.get("mirror"):
        mirror = schema["mirror"]
        
        if mirror.get("assumptions"):
            a = mirror["assumptions"]
            txt = random.choice(ASSUMPTION_TEMPLATES)
            txt = txt.replace("{0}", a[0] if len(a) > 0 else "something")
            txt = txt.replace("{1}", a[1] if len(a) > 1 else "something else")
            parts.append(txt)
        
        if max_questions > 0 and mirror.get("question"):
            parts.append(random.choice(QUESTION_TEMPLATES).format(question=mirror["question"]))
    
    return "\n\n".join(parts)

FALLBACK_SCHEMA = {
    "direct": {"type": "clarify", "content": "I'd like to understand this better."},
    "mirror": {"assumptions": ["there's a question here", "more context helps"], "tradeoffs": [], "question": "What specific decision are you trying to make?"}
}

# ═══════════════════════════════════════════════════════════════
# GATES
# ═══════════════════════════════════════════════════════════════

CRISIS_PATTERNS = [
    re.compile(r'\b(suicide|suicidal|kill myself|want to die)\b', re.I),
    re.compile(r'\b(self.?harm|cut myself|hurt myself)\b', re.I),
    re.compile(r'\b(being abused|rape|raped)\b', re.I),
]

CRISIS_RESPONSE = """I can hear you're in a difficult place. Please reach out:

🆘 Crisis Text Line: Text HOME to 741741
🆘 Suicide & Crisis Lifeline: 988 (US)
🆘 Emergency: 911

You matter."""

ILLEGAL_PATTERNS = [
    re.compile(r'\b(how to (make|build) (a |)(bomb|weapon))\b', re.I),
    re.compile(r'\b(child porn|csam)\b', re.I),
    re.compile(r'\b(hack into|malware)\b', re.I),
]

def run_gates(text: str):
    for p in CRISIS_PATTERNS:
        if p.search(text): return False, CRISIS_RESPONSE, "crisis"
    for p in ILLEGAL_PATTERNS:
        if p.search(text): return False, "I can't engage with that.", "illegal"
    if len(text) > MAX_INPUT_LENGTH:
        return False, "That's a lot. What's the core decision?", "size"
    return True, None, "passed"

# ═══════════════════════════════════════════════════════════════
# VALIDATION
# ═══════════════════════════════════════════════════════════════

def validate_schema(obj: dict):
    errors = []
    if not isinstance(obj, dict): return False, ["not_dict"]
    if not obj.get("direct", {}).get("content"): errors.append("no_direct_content")
    if not obj.get("mirror", {}).get("assumptions"): errors.append("no_assumptions")
    if not obj.get("mirror", {}).get("question"): errors.append("no_question")
    
    forbidden = ["you should", "i recommend", "definitely"]
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
# INFERENCE
# ═══════════════════════════════════════════════════════════════

rate_limits: dict = defaultdict(list)

def check_rate(ip: str) -> bool:
    now = time.time()
    rate_limits[ip] = [t for t in rate_limits[ip] if t > now - RATE_LIMIT_WINDOW]
    if len(rate_limits[ip]) >= RATE_LIMIT_REQUESTS: return False
    rate_limits[ip].append(now)
    return True

async def call_substrate(user_input: str):
    if not GROQ_API_KEY: return None
    try:
        async with httpx.AsyncClient(timeout=15.0) as c:
            r = await c.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Content-Type": "application/json", "Authorization": f"Bearer {GROQ_API_KEY}"},
                json={
                    "model": GROQ_MODEL,
                    "messages": [
                        {"role": "system", "content": SUBSTRATE_PROMPT},
                        {"role": "user", "content": user_input}
                    ],
                    "temperature": 0.3, "max_tokens": 500
                }
            )
            if r.status_code != 200: return None
            return r.json()["choices"][0]["message"]["content"]
    except: return None

# ═══════════════════════════════════════════════════════════════
# API
# ═══════════════════════════════════════════════════════════════

class ReflectRequest(BaseModel):
    input: str = Field(..., max_length=MAX_INPUT_LENGTH)
    dial: float = Field(default=0.5, ge=0, le=1)

class ReflectResponse(BaseModel):
    output: str
    schema_raw: Optional[dict] = None
    intent_score: int
    lane_mix: dict
    rule_version: str
    outcome: Literal["allowed", "fallback", "refused", "error"]
    request_id: str

app = FastAPI(title="Active Mirror", version=RULE_VERSION, docs_url=None)
app.add_middleware(CORSMiddleware, allow_origins=ALLOWED_ORIGINS, allow_methods=["POST", "GET"], allow_headers=["Content-Type"])

@app.get("/health")
async def health():
    return {"status": "ok", "version": RULE_VERSION}

@app.post("/api/reflect", response_model=ReflectResponse)
async def reflect(request: Request, body: ReflectRequest):
    rid = uuid.uuid4().hex[:8]
    ip = request.client.host if request.client else "?"
    
    if not check_rate(ip):
        return ReflectResponse(output="⟡ What's most pressing?", schema_raw=None, intent_score=1, lane_mix={"direct": 0.5, "mirror": 0.5}, rule_version=RULE_VERSION, outcome="refused", request_id=rid)
    
    allowed, blocked, gate = run_gates(body.input)
    if not allowed:
        return ReflectResponse(output=blocked, schema_raw=None, intent_score=0, lane_mix={"direct": 1, "mirror": 0}, rule_version=RULE_VERSION, outcome="refused", request_id=rid)
    
    # Intent routing
    intent = compute_intent(body.input)
    lane_mix = compute_lane_mix(intent, body.dial)
    max_q = get_max_questions(body.dial, intent)
    
    # UTILITY SHORTCUT: compute locally, no model call
    shortcut = try_utility_shortcut(body.input)
    if shortcut:
        return ReflectResponse(
            output=shortcut["direct"]["content"],
            schema_raw=shortcut,
            intent_score=0,
            lane_mix={"direct": 1.0, "mirror": 0.0},
            rule_version=RULE_VERSION,
            outcome="allowed",
            request_id=rid
        )
    
    raw = await call_substrate(body.input)
    
    if not raw:
        output = render_two_lane(FALLBACK_SCHEMA, lane_mix, intent, max_q)
        return ReflectResponse(output=output, schema_raw=FALLBACK_SCHEMA, intent_score=intent, lane_mix=lane_mix, rule_version=RULE_VERSION, outcome="error", request_id=rid)
    
    parsed, err = parse_json(raw)
    if not parsed:
        output = render_two_lane(FALLBACK_SCHEMA, lane_mix, intent, max_q)
        return ReflectResponse(output=output, schema_raw=FALLBACK_SCHEMA, intent_score=intent, lane_mix=lane_mix, rule_version=RULE_VERSION, outcome="fallback", request_id=rid)
    
    valid, errs = validate_schema(parsed)
    if not valid:
        logger.info(f"[{rid}] validation failed: {errs}")
        output = render_two_lane(FALLBACK_SCHEMA, lane_mix, intent, max_q)
        return ReflectResponse(output=output, schema_raw=FALLBACK_SCHEMA, intent_score=intent, lane_mix=lane_mix, rule_version=RULE_VERSION, outcome="fallback", request_id=rid)
    
    output = render_two_lane(parsed, lane_mix, intent, max_q)
    
    return ReflectResponse(
        output=output,
        schema_raw=parsed,
        intent_score=intent,
        lane_mix=lane_mix,
        rule_version=RULE_VERSION,
        outcome="allowed",
        request_id=rid
    )

if __name__ == "__main__":
    import uvicorn
    logger.info(f"⟡ Safety Proxy v{RULE_VERSION} — Two-Lane Conversation System")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
