#!/usr/bin/env python3
"""
ACTIVE MIRROR — SAFETY PROXY v4.0
Split-Stack: Substrate → MirrorGate → Renderer
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

RULE_VERSION = "4.0.0"
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
# SUBSTRATE PROMPT
# ═══════════════════════════════════════════════════════════════

SUBSTRATE_PROMPT = """You are a logic engine. Analyze user input. Output JSON only.

FORMAT:
{
  "mode": "decision|emotional|strategic|debugging|unclear",
  "tension": "the core conflict",
  "assumptions": ["assumption 1", "assumption 2"],
  "blindspot": "something they might not see, or null",
  "stakes": {"upside": "what they gain", "risk": "what they lose"},
  "question": "one question ending with ?"
}

RULES:
1. Output ONLY valid JSON. No markdown. No prose.
2. NEVER include "you should" or "I recommend"
3. If unclear: mode="unclear", question="What decision are you trying to make?"

JSON only:"""

# ═══════════════════════════════════════════════════════════════
# TEMPLATES
# ═══════════════════════════════════════════════════════════════

TEMPLATES = {
    "decision": {
        "tension": ["You're caught between {tension}.", "The core tension: {tension}.", "This comes down to {tension}."],
        "assumptions": ["You're assuming {0}. And that {1}.", "Baked into this: {0}. Also, {1}."],
        "blindspot": ["Worth checking: {blindspot}.", "Possible blindspot — {blindspot}."],
        "stakes": ["If this works: {upside}. If it doesn't: {risk}.", "Upside: {upside}. Downside: {risk}."],
        "question": ["The real question: {question}", "⟡ {question}"]
    },
    "emotional": {
        "tension": ["It sounds like you're holding {tension}.", "There's a pull between {tension}."],
        "assumptions": ["Part of this might be {0}. And maybe {1}.", "You might be carrying {0}, and {1}."],
        "blindspot": ["Hard to see from inside: {blindspot}."],
        "stakes": ["If you move through: {upside}. If stuck: {risk}."],
        "question": ["What would help: {question}", "⟡ {question}"]
    },
    "strategic": {
        "tension": ["Strategic tension: {tension}.", "You're balancing {tension}."],
        "assumptions": ["This assumes {0}. And {1}.", "Built in: {0}, and {1}."],
        "blindspot": ["Strategic blindspot: {blindspot}."],
        "stakes": ["If it works: {upside}. If it fails: {risk}."],
        "question": ["Before you execute: {question}", "⟡ {question}"]
    },
    "debugging": {
        "tension": ["The gap: {tension}.", "What broke: {tension}."],
        "assumptions": ["You were assuming {0}. And {1}."],
        "blindspot": ["What was invisible: {blindspot}."],
        "stakes": ["If you fix this: {upside}. If not: {risk}."],
        "question": ["For next time: {question}", "⟡ {question}"]
    },
    "unclear": {
        "tension": ["There seems to be {tension}."],
        "assumptions": ["You might be assuming {0}. And {1}."],
        "blindspot": ["Worth examining: {blindspot}."],
        "stakes": ["At stake: {upside} vs. {risk}."],
        "question": ["To get clearer: {question}", "⟡ {question}"]
    }
}

def render_reflection(schema: dict) -> str:
    mode = schema.get("mode", "unclear")
    t = TEMPLATES.get(mode, TEMPLATES["unclear"])
    parts = []
    
    parts.append(random.choice(t["tension"]).format(tension=schema.get("tension", "something")))
    
    assumptions = schema.get("assumptions", ["something", "something else"])
    atxt = random.choice(t["assumptions"])
    for i, a in enumerate(assumptions[:2]):
        atxt = atxt.replace(f"{{{i}}}", a)
    parts.append(atxt)
    
    if schema.get("blindspot") and t.get("blindspot"):
        parts.append(random.choice(t["blindspot"]).format(blindspot=schema["blindspot"]))
    
    stakes = schema.get("stakes", {})
    if stakes and t.get("stakes"):
        parts.append(random.choice(t["stakes"]).format(
            upside=stakes.get("upside", "clarity"),
            risk=stakes.get("risk", "confusion")
        ))
    
    parts.append(random.choice(t["question"]).format(question=schema.get("question", "What matters?")))
    
    return "\n\n".join(parts)

FALLBACK_SCHEMA = {
    "mode": "unclear", "tension": "clarity vs. complexity",
    "assumptions": ["there's a decision here", "more context helps"],
    "blindspot": None, "stakes": {"upside": "clarity", "risk": "staying stuck"},
    "question": "What specific decision are you trying to make?"
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

def detect_mode(text: str) -> str:
    t = text.lower()
    if re.search(r'should i|choose|deciding|torn between', t): return "decision"
    if re.search(r'feel|stressed|anxious|overwhelmed|worried', t): return "emotional"
    if re.search(r'how (do|can|to)|plan|strategy', t): return "strategic"
    if re.search(r'went wrong|failed|mistake|broken', t): return "debugging"
    return "unclear"

# ═══════════════════════════════════════════════════════════════
# VALIDATION
# ═══════════════════════════════════════════════════════════════

def validate_schema(obj: dict):
    errors = []
    if not isinstance(obj, dict): return False, ["not_dict"]
    if not obj.get("tension"): errors.append("no_tension")
    if not obj.get("assumptions"): errors.append("no_assumptions")
    if not obj.get("question"): errors.append("no_question")
    elif not obj["question"].strip().endswith("?"): errors.append("no_question_mark")
    
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

class ReflectResponse(BaseModel):
    output: str
    schema_raw: Optional[dict] = None
    mode: str
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
        return ReflectResponse(output="⟡ What's most pressing?", schema_raw=None, mode="rate_limited", rule_version=RULE_VERSION, outcome="refused", request_id=rid)
    
    allowed, blocked, gate = run_gates(body.input)
    if not allowed:
        return ReflectResponse(output=blocked, schema_raw=None, mode=gate, rule_version=RULE_VERSION, outcome="refused", request_id=rid)
    
    detected = detect_mode(body.input)
    raw = await call_substrate(body.input)
    
    if not raw:
        fb = {**FALLBACK_SCHEMA, "mode": detected}
        return ReflectResponse(output=render_reflection(fb), schema_raw=fb, mode=detected, rule_version=RULE_VERSION, outcome="error", request_id=rid)
    
    parsed, err = parse_json(raw)
    if not parsed:
        fb = {**FALLBACK_SCHEMA, "mode": detected}
        return ReflectResponse(output=render_reflection(fb), schema_raw=fb, mode=detected, rule_version=RULE_VERSION, outcome="fallback", request_id=rid)
    
    valid, errs = validate_schema(parsed)
    if not valid:
        logger.info(f"[{rid}] validation failed: {errs}")
        fb = {**FALLBACK_SCHEMA, "mode": detected}
        return ReflectResponse(output=render_reflection(fb), schema_raw=fb, mode=detected, rule_version=RULE_VERSION, outcome="fallback", request_id=rid)
    
    if not parsed.get("mode"): parsed["mode"] = detected
    
    return ReflectResponse(
        output=render_reflection(parsed),
        schema_raw=parsed,
        mode=parsed["mode"],
        rule_version=RULE_VERSION,
        outcome="allowed",
        request_id=rid
    )

if __name__ == "__main__":
    import uvicorn
    logger.info(f"⟡ Safety Proxy v{RULE_VERSION} — Split-Stack Architecture")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
