#!/usr/bin/env python3
"""
ACTIVE MIRROR — SAFETY PROXY v9.0
MirrorGate Integration: Two-Lane Validation
"""

import os, re, json, time, uuid, logging, hashlib
from datetime import datetime, timezone
from typing import Optional, List, Tuple
from collections import defaultdict
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import httpx
from dotenv import load_dotenv

load_dotenv()

RULE_VERSION = "9.0.0"
PORT = 8082
MAX_INPUT_LENGTH = 2000
RATE_LIMIT_REQUESTS = 30
RATE_LIMIT_WINDOW = 60

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = "llama-3.3-70b-versatile"

ALLOWED_ORIGINS = [
    "https://activemirror.ai", "https://www.activemirror.ai",
    "http://localhost:5173", "http://localhost:3000", "http://localhost:4173",
]

logging.basicConfig(level=logging.INFO, format='%(asctime)s | %(levelname)s | %(message)s')
logger = logging.getLogger("mirror-proxy")

# ═══════════════════════════════════════════════════════════════
# MIRRORGATE: RULE ENGINE
# ═══════════════════════════════════════════════════════════════

class GateDecision:
    ALLOW = "allow"
    BLOCK = "block"

# Input gates (before LLM)
CRISIS_PATTERNS = [
    re.compile(r'\b(suicide|suicidal|kill myself|want to die|end my life)\b', re.I),
    re.compile(r'\b(self.?harm|cut myself|hurt myself)\b', re.I),
]

ILLEGAL_PATTERNS = [
    re.compile(r'\b(how to (make|build) (a |)(bomb|weapon|explosive))\b', re.I),
    re.compile(r'\b(child porn|csam|cp links)\b', re.I),
]

# Output gates (after LLM)
FIRST_PERSON_AUTHORITY = [
    re.compile(r'\bI (have )?(verified|confirmed|determined|know for certain)\b', re.I),
    re.compile(r'\bI am (certain|sure|positive) that\b', re.I),
]

HALLUCINATION_PATTERNS = [
    re.compile(r'\b(studies|research) (prove|show|confirm)\b', re.I),
    re.compile(r'\baccording to (sources|experts|scientists)\b', re.I),
    re.compile(r'\bit has been (confirmed|proven|established)\b', re.I),
]

ADVICE_PATTERNS = [
    re.compile(r'\byou should (definitely|absolutely|really)\b', re.I),
    re.compile(r'\bI (strongly |)recommend (that you|you)\b', re.I),
    re.compile(r'\bmy advice (is|would be)\b', re.I),
]

MEDICAL_LEGAL = [
    re.compile(r'\byou (should|need to) (take|stop taking) \w+\b', re.I),
    re.compile(r'\b(diagnosed with|diagnosis is)\b', re.I),
    re.compile(r'\blegally (obligated|required|bound)\b', re.I),
]

CRISIS_RESPONSE = """⟡ I hear you. This matters.

I'm a mirror, not a lifeline — but these people are:

🆘 988 (call or text) — Suicide & Crisis Lifeline
🆘 Text HOME to 741741 — Crisis Text Line

You reached out here. Now reach out to them. I'm still here after."""


def gate_input(text: str) -> Tuple[str, Optional[str], Optional[str]]:
    """
    Pre-LLM input validation.
    Returns: (decision, blocked_response, violation_code)
    """
    for p in CRISIS_PATTERNS:
        if p.search(text):
            return GateDecision.BLOCK, CRISIS_RESPONSE, "CRISIS_DETECTED"
    
    for p in ILLEGAL_PATTERNS:
        if p.search(text):
            return GateDecision.BLOCK, "⟡ I can't go there.", "ILLEGAL_REQUEST"
    
    if len(text) > MAX_INPUT_LENGTH:
        return GateDecision.BLOCK, "⟡ That's a lot. What's the core of it?", "INPUT_TOO_LONG"
    
    return GateDecision.ALLOW, None, None


def gate_output(text: str) -> Tuple[str, Optional[str]]:
    """
    Post-LLM output validation.
    Returns: (decision, violation_code)
    """
    # First-person authority claims
    for p in FIRST_PERSON_AUTHORITY:
        if p.search(text):
            return GateDecision.BLOCK, "FIRST_PERSON_AUTHORITY"
    
    # Hallucination patterns
    for p in HALLUCINATION_PATTERNS:
        if p.search(text):
            return GateDecision.BLOCK, "HALLUCINATED_FACT"
    
    # Direct advice (reflective AI shouldn't advise)
    for p in ADVICE_PATTERNS:
        if p.search(text):
            return GateDecision.BLOCK, "ADVICE_GIVEN"
    
    # Medical/legal assertions
    for p in MEDICAL_LEGAL:
        if p.search(text):
            return GateDecision.BLOCK, "MEDICAL_LEGAL_ASSERTION"
    
    return GateDecision.ALLOW, None


def sanitize_output(text: str) -> str:
    """
    Clean output if needed (soft intervention).
    Currently just ensures glyph prefix.
    """
    text = text.strip()
    if not text.startswith('⟡'):
        text = '⟡ ' + text
    return text


def log_gate_decision(
    direction: str,  # "input" or "output"
    decision: str,
    violation_code: Optional[str],
    content_hash: str,
    request_id: str
):
    """Log gate decision for audit trail."""
    record = {
        "event_id": str(uuid.uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "request_id": request_id,
        "direction": direction,
        "decision": decision,
        "violation_code": violation_code,
        "content_hash": content_hash,
        "gate_version": RULE_VERSION
    }
    logger.info(f"[GATE] {direction.upper()} {decision.upper()}: {violation_code or 'clean'} | {request_id}")
    return record


# ═══════════════════════════════════════════════════════════════
# SYSTEM PROMPT
# ═══════════════════════════════════════════════════════════════

SYSTEM_PROMPT = """You are a reflective mirror — warm, present, curious. You help people see themselves more clearly.

Your style:
- Short responses (1-3 sentences usually)
- Use their words back to them
- Ask questions that help THEM discover their own truth
- No advice. No "you should". Reflect, don't fix.
- Match their energy — casual if they're casual, deeper if they go deep
- Start responses with ⟡

When someone shares something personal, reflect what you hear and ask ONE question that helps them go deeper.

When someone just says hi or thanks, just respond naturally — no need to probe.

You're having a real conversation. Be present."""

# ═══════════════════════════════════════════════════════════════
# RATE LIMITING
# ═══════════════════════════════════════════════════════════════

rate_limits: dict = defaultdict(list)

def check_rate(ip: str) -> Tuple[bool, str]:
    now = time.time()
    rate_limits[ip] = [t for t in rate_limits[ip] if t > now - RATE_LIMIT_WINDOW]
    if len(rate_limits[ip]) >= RATE_LIMIT_REQUESTS:
        return False, "rate"
    rate_limits[ip].append(now)
    return True, "ok"


# ═══════════════════════════════════════════════════════════════
# STREAMING WITH OUTPUT GATE
# ═══════════════════════════════════════════════════════════════

async def stream_with_gate(messages: list, request_id: str):
    """
    Stream from Groq with output gating.
    Buffers complete response, validates, then streams or blocks.
    """
    if not GROQ_API_KEY:
        yield json.dumps({"status": "error", "content": "No API Key"}) + "\n"
        return

    full_response = ""
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as c:
            async with c.stream(
                "POST",
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {GROQ_API_KEY}"
                },
                json={
                    "model": GROQ_MODEL,
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 800,
                    "top_p": 0.9,
                    "stream": True
                }
            ) as response:
                if response.status_code != 200:
                    error_text = await response.aread()
                    logger.error(f"Groq error: {response.status_code} - {error_text}")
                    yield json.dumps({"status": "error", "content": "Mirror clouded."}) + "\n"
                    return

                # Collect full response first (for proper gating)
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data)
                            delta = chunk["choices"][0]["delta"].get("content", "")
                            if delta:
                                full_response += delta
                        except:
                            continue
        
        # ═══ OUTPUT GATE ═══
        content_hash = hashlib.sha256(full_response.encode()).hexdigest()[:16]
        decision, violation = gate_output(full_response)
        log_gate_decision("output", decision, violation, content_hash, request_id)
        
        if decision == GateDecision.BLOCK:
            # Response was blocked - send alternative
            blocked_msg = "⟡ Let me reflect differently... What feels most true about what you just shared?"
            yield json.dumps({"status": "blocked", "gate": "blocked", "reason": violation, "content": blocked_msg}) + "\n"
            return
        
        # Response passed - stream it to client
        yield json.dumps({"gate": "passed"}) + "\n"
        
        # Ensure glyph prefix
        sanitized = sanitize_output(full_response)
        
        # Stream in chunks for nice UX
        chunk_size = 3
        words = sanitized.split(' ')
        for i in range(0, len(words), chunk_size):
            chunk = ' '.join(words[i:i+chunk_size])
            if i + chunk_size < len(words):
                chunk += ' '
            yield json.dumps({"status": "chunk", "content": chunk}) + "\n"
            
    except Exception as e:
        logger.error(f"Stream failed: {e}")
        yield json.dumps({"status": "error", "content": "Connection lost."}) + "\n"


# ═══════════════════════════════════════════════════════════════
# API
# ═══════════════════════════════════════════════════════════════

class ChatMessage(BaseModel):
    role: str
    content: str
    
class MirrorRequest(BaseModel):
    message: str = Field(..., max_length=MAX_INPUT_LENGTH)
    history: List[ChatMessage] = Field(default_factory=list)
    dial: float = Field(default=0.5)

app = FastAPI(title="Active Mirror", version=RULE_VERSION)
app.add_middleware(CORSMiddleware, allow_origins=ALLOWED_ORIGINS, allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
async def health():
    return {"status": "ok", "version": RULE_VERSION, "gate": "mirrorgate-v2"}

@app.post("/mirror")
async def mirror(request: Request, body: MirrorRequest):
    rid = uuid.uuid4().hex[:8]
    ip = request.client.host if request.client else "?"
    
    # Rate limit
    allowed, _ = check_rate(ip)
    if not allowed:
        return {"status": "rate_limited", "content": "⟡ Let's slow down. Take a breath.", "gate": "blocked", "reason": "RATE_LIMITED"}
    
    # ═══ INPUT GATE ═══
    content_hash = hashlib.sha256(body.message.encode()).hexdigest()[:16]
    decision, blocked_response, violation = gate_input(body.message)
    log_gate_decision("input", decision, violation, content_hash, rid)
    
    if decision == GateDecision.BLOCK:
        return {"status": "blocked", "content": blocked_response, "gate": "blocked", "reason": violation}
    
    # Build context
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in body.history[-20:]:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": body.message})
    
    logger.info(f"[{rid}] Request accepted. Hist: {len(body.history)}")
    
    return StreamingResponse(stream_with_gate(messages, rid), media_type="application/x-ndjson")


if __name__ == "__main__":
    import uvicorn
    logger.info(f"⟡ Active Mirror v{RULE_VERSION} (MirrorGate Integrated)")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
