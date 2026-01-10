#!/usr/bin/env python3
"""
ACTIVE MIRROR — SAFETY PROXY v9.1
MirrorGate White Box: Flight Recorder Edition

Two-Lane Validation + Full Audit Transparency
"""

import os, re, json, time, uuid, logging, hashlib
from datetime import datetime, timezone
from typing import Optional, List, Tuple, Dict, Any
from collections import defaultdict, deque
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import httpx
from dotenv import load_dotenv

load_dotenv()

RULE_VERSION = "9.1.0"
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
# FLIGHT RECORDER — In-Memory Audit Trail (Last 100 Events)
# ═══════════════════════════════════════════════════════════════

flight_log: deque = deque(maxlen=100)

def record_event(
    actor: str,
    action: str,
    target: str,
    result: str,
    details: Dict[str, Any] = None
) -> Dict:
    """Record an event to the flight log."""
    event = {
        "id": uuid.uuid4().hex[:8],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "time_local": datetime.now().strftime("%H:%M:%S"),
        "actor": actor,
        "action": action,
        "target": target,
        "result": result,
        "details": details or {}
    }
    flight_log.append(event)
    
    # Also log to console in Flight Recorder format
    icon = {
        "ALLOW": "✅",
        "BLOCK": "❌", 
        "ANALYZING": "⏳",
        "RESTORED": "🛡️",
        "RATE_LIMITED": "⏱️",
        "ERROR": "💥"
    }.get(result, "•")
    
    logger.info(f"[FLIGHT] {event['time_local']} | {actor:12} | {action:10} | {target[:20]:20} | {icon} {result}")
    
    return event

# ═══════════════════════════════════════════════════════════════
# MIRRORGATE: RULE ENGINE (Numbered Rules for Transparency)
# ═══════════════════════════════════════════════════════════════

class GateDecision:
    ALLOW = "allow"
    BLOCK = "block"

class Rule:
    """Rule definition with ID for audit trail."""
    def __init__(self, rule_id: str, name: str, pattern: re.Pattern, category: str):
        self.rule_id = rule_id
        self.name = name
        self.pattern = pattern
        self.category = category

# Input Rules (I-*)
INPUT_RULES = [
    Rule("I-001", "Crisis Detection: Suicide", re.compile(r'\b(suicide|suicidal|kill myself|want to die|end my life)\b', re.I), "crisis"),
    Rule("I-002", "Crisis Detection: Self-Harm", re.compile(r'\b(self.?harm|cut myself|hurt myself)\b', re.I), "crisis"),
    Rule("I-003", "Illegal: Weapons", re.compile(r'\b(how to (make|build) (a |)(bomb|weapon|explosive))\b', re.I), "illegal"),
    Rule("I-004", "Illegal: CSAM", re.compile(r'\b(child porn|csam|cp links)\b', re.I), "illegal"),
]

# Output Rules (O-*)  
OUTPUT_RULES = [
    Rule("O-001", "First-Person Authority: Verified", re.compile(r'\bI (have )?(verified|confirmed|determined)\b', re.I), "authority"),
    Rule("O-002", "First-Person Authority: Certainty", re.compile(r'\bI am (certain|sure|positive) that\b', re.I), "authority"),
    Rule("O-003", "First-Person Authority: Know", re.compile(r'\bI know for certain\b', re.I), "authority"),
    Rule("O-004", "Hallucination: Studies Prove", re.compile(r'\b(studies|research) (prove|show|confirm)\b', re.I), "hallucination"),
    Rule("O-005", "Hallucination: According to Sources", re.compile(r'\baccording to (sources|experts|scientists)\b', re.I), "hallucination"),
    Rule("O-006", "Hallucination: Confirmed", re.compile(r'\bit has been (confirmed|proven|established)\b', re.I), "hallucination"),
    Rule("O-007", "Advice: Strong Recommendation", re.compile(r'\byou should (definitely|absolutely|really)\b', re.I), "advice"),
    Rule("O-008", "Advice: I Recommend", re.compile(r'\bI (strongly |)recommend (that you|you)\b', re.I), "advice"),
    Rule("O-009", "Advice: My Advice", re.compile(r'\bmy advice (is|would be)\b', re.I), "advice"),
    Rule("O-010", "Medical/Legal: Medication", re.compile(r'\byou (should|need to) (take|stop taking) \w+\b', re.I), "medical_legal"),
    Rule("O-011", "Medical/Legal: Diagnosis", re.compile(r'\b(diagnosed with|diagnosis is)\b', re.I), "medical_legal"),
    Rule("O-012", "Medical/Legal: Legal Obligation", re.compile(r'\blegally (obligated|required|bound)\b', re.I), "medical_legal"),
]

CRISIS_RESPONSE = """⟡ I hear you. This matters.

I'm a mirror, not a lifeline — but these people are:

🆘 988 (call or text) — Suicide & Crisis Lifeline
🆘 Text HOME to 741741 — Crisis Text Line

You reached out here. Now reach out to them. I'm still here after."""


def gate_input(text: str, request_id: str) -> Tuple[str, Optional[str], Optional[str], List[Dict]]:
    """
    Pre-LLM input validation with full audit trail.
    Returns: (decision, blocked_response, violation_code, matched_rules)
    """
    content_hash = hashlib.sha256(text.encode()).hexdigest()[:16]
    matched_rules = []
    
    # Record analysis start
    record_event("MirrorGate", "ANALYZE", f"input:{content_hash}", "ANALYZING", {"request_id": request_id})
    
    # Check each rule
    for rule in INPUT_RULES:
        match = rule.pattern.search(text)
        if match:
            matched_rules.append({
                "rule_id": rule.rule_id,
                "rule_name": rule.name,
                "category": rule.category,
                "matched_text": match.group(0)[:50]  # Truncate for privacy
            })
    
    if matched_rules:
        # Determine response based on category
        first_match = matched_rules[0]
        if first_match["category"] == "crisis":
            response = CRISIS_RESPONSE
        else:
            response = "⟡ I can't go there."
        
        record_event("MirrorGate", "BLOCK", f"input:{content_hash}", "BLOCK", {
            "request_id": request_id,
            "rules_triggered": [r["rule_id"] for r in matched_rules],
            "primary_rule": first_match["rule_id"]
        })
        
        return GateDecision.BLOCK, response, first_match["rule_id"], matched_rules
    
    # Length check
    if len(text) > MAX_INPUT_LENGTH:
        record_event("MirrorGate", "BLOCK", f"input:{content_hash}", "BLOCK", {
            "request_id": request_id,
            "reason": "INPUT_TOO_LONG",
            "length": len(text)
        })
        return GateDecision.BLOCK, "⟡ That's a lot. What's the core of it?", "SIZE_LIMIT", []
    
    record_event("MirrorGate", "ALLOW", f"input:{content_hash}", "ALLOW", {"request_id": request_id})
    return GateDecision.ALLOW, None, None, []


def gate_output(text: str, request_id: str) -> Tuple[str, Optional[str], List[Dict]]:
    """
    Post-LLM output validation with full audit trail.
    Returns: (decision, violation_code, matched_rules)
    """
    content_hash = hashlib.sha256(text.encode()).hexdigest()[:16]
    matched_rules = []
    
    record_event("MirrorGate", "ANALYZE", f"output:{content_hash}", "ANALYZING", {"request_id": request_id})
    
    # Check each rule
    for rule in OUTPUT_RULES:
        match = rule.pattern.search(text)
        if match:
            matched_rules.append({
                "rule_id": rule.rule_id,
                "rule_name": rule.name,
                "category": rule.category,
                "matched_text": match.group(0)[:50]
            })
    
    if matched_rules:
        first_match = matched_rules[0]
        record_event("MirrorGate", "BLOCK", f"output:{content_hash}", "BLOCK", {
            "request_id": request_id,
            "rules_triggered": [r["rule_id"] for r in matched_rules],
            "primary_rule": first_match["rule_id"],
            "action": "REVERT_TO_FALLBACK"
        })
        return GateDecision.BLOCK, first_match["rule_id"], matched_rules
    
    record_event("MirrorGate", "ALLOW", f"output:{content_hash}", "ALLOW", {"request_id": request_id})
    return GateDecision.ALLOW, None, []


def sanitize_output(text: str) -> str:
    """Ensure glyph prefix."""
    text = text.strip()
    if not text.startswith('⟡'):
        text = '⟡ ' + text
    return text


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

def check_rate(ip: str, request_id: str) -> Tuple[bool, str]:
    now = time.time()
    rate_limits[ip] = [t for t in rate_limits[ip] if t > now - RATE_LIMIT_WINDOW]
    if len(rate_limits[ip]) >= RATE_LIMIT_REQUESTS:
        record_event("RateLimiter", "BLOCK", f"ip:{ip[:8]}...", "RATE_LIMITED", {"request_id": request_id})
        return False, "rate"
    rate_limits[ip].append(now)
    return True, "ok"


# ═══════════════════════════════════════════════════════════════
# STREAMING WITH OUTPUT GATE
# ═══════════════════════════════════════════════════════════════

async def stream_with_gate(messages: list, request_id: str):
    """Stream from Groq with output gating and full audit."""
    if not GROQ_API_KEY:
        yield json.dumps({"status": "error", "content": "No API Key"}) + "\n"
        return

    full_response = ""
    
    record_event("Groq", "REQUEST", f"model:{GROQ_MODEL}", "ANALYZING", {"request_id": request_id, "history_size": len(messages)})
    
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
                    record_event("Groq", "ERROR", f"status:{response.status_code}", "ERROR", {"request_id": request_id})
                    yield json.dumps({"status": "error", "content": "Mirror clouded."}) + "\n"
                    return

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
        
        record_event("Groq", "RESPONSE", f"len:{len(full_response)}", "ALLOW", {"request_id": request_id})
        
        # ═══ OUTPUT GATE ═══
        decision, violation, matched_rules = gate_output(full_response, request_id)
        
        if decision == GateDecision.BLOCK:
            # Build detailed audit for frontend
            audit = {
                "gate": "blocked",
                "reason": violation,
                "rules": matched_rules,
                "action": "fallback_response"
            }
            blocked_msg = "⟡ Let me reflect differently... What feels most true about what you just shared?"
            yield json.dumps({"status": "blocked", "audit": audit, "content": blocked_msg}) + "\n"
            return
        
        # Response passed - send audit then stream
        audit = {
            "gate": "passed",
            "rules_checked": len(OUTPUT_RULES),
            "violations": 0
        }
        yield json.dumps({"audit": audit}) + "\n"
        
        # Ensure glyph prefix and stream
        sanitized = sanitize_output(full_response)
        chunk_size = 3
        words = sanitized.split(' ')
        for i in range(0, len(words), chunk_size):
            chunk = ' '.join(words[i:i+chunk_size])
            if i + chunk_size < len(words):
                chunk += ' '
            yield json.dumps({"status": "chunk", "content": chunk}) + "\n"
            
    except Exception as e:
        record_event("System", "ERROR", str(e)[:30], "ERROR", {"request_id": request_id})
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
    return {
        "status": "ok", 
        "version": RULE_VERSION, 
        "gate": "mirrorgate-whitebox",
        "rules": {
            "input": len(INPUT_RULES),
            "output": len(OUTPUT_RULES)
        }
    }

@app.get("/flight-log")
async def get_flight_log(limit: int = 20):
    """
    WHITE BOX: Expose the last N events from the flight recorder.
    This is the transparency layer — anyone can see what the gate is doing.
    """
    events = list(flight_log)[-limit:]
    return {
        "status": "ok",
        "version": RULE_VERSION,
        "event_count": len(events),
        "events": events
    }

@app.get("/rules")
async def get_rules():
    """
    WHITE BOX: Expose all active rules.
    Complete transparency — the rules are public.
    """
    return {
        "version": RULE_VERSION,
        "input_rules": [
            {"id": r.rule_id, "name": r.name, "category": r.category}
            for r in INPUT_RULES
        ],
        "output_rules": [
            {"id": r.rule_id, "name": r.name, "category": r.category}
            for r in OUTPUT_RULES
        ]
    }

@app.post("/mirror")
async def mirror(request: Request, body: MirrorRequest):
    rid = uuid.uuid4().hex[:8]
    ip = request.client.host if request.client else "?"
    
    record_event("User", "MESSAGE", f"len:{len(body.message)}", "ANALYZING", {"request_id": rid, "ip": ip[:8]})
    
    # Rate limit
    allowed, _ = check_rate(ip, rid)
    if not allowed:
        return {
            "status": "rate_limited", 
            "content": "⟡ Let's slow down. Take a breath.", 
            "audit": {"gate": "blocked", "reason": "RATE_LIMITED"}
        }
    
    # ═══ INPUT GATE ═══
    decision, blocked_response, violation, matched_rules = gate_input(body.message, rid)
    
    if decision == GateDecision.BLOCK:
        return {
            "status": "blocked", 
            "content": blocked_response, 
            "audit": {
                "gate": "blocked",
                "reason": violation,
                "rules": matched_rules
            }
        }
    
    # Build context
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in body.history[-20:]:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": body.message})
    
    return StreamingResponse(stream_with_gate(messages, rid), media_type="application/x-ndjson")


if __name__ == "__main__":
    import uvicorn
    logger.info(f"⟡ Active Mirror v{RULE_VERSION} (MirrorGate White Box)")
    logger.info(f"  Input Rules: {len(INPUT_RULES)} | Output Rules: {len(OUTPUT_RULES)}")
    logger.info(f"  Flight Log: /flight-log | Rules: /rules")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
