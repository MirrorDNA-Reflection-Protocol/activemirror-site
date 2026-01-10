#!/usr/bin/env python3
"""
ACTIVE MIRROR — SAFETY PROXY v10.0 "SUPEREGO"
MirrorGate White Box + Escalation Engine

From Firewall to Superego:
- Flight Recorder (audit trail)
- Penance Loop (forced reflection)
- Voice of God (auditory audit)
- Kill Switch (tolerance threshold)
- Confession Booth (incident reports)
"""

import os, re, json, time, uuid, logging, hashlib, subprocess
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

RULE_VERSION = "10.0.0"
CODENAME = "SUPEREGO"
PORT = 8082
MAX_INPUT_LENGTH = 2000
RATE_LIMIT_REQUESTS = 30
RATE_LIMIT_WINDOW = 60

# Escalation thresholds
STRIKE_THRESHOLD = 3  # Violations before kill switch
PENANCE_THRESHOLD = 2  # Violations before forced reflection

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = "llama-3.3-70b-versatile"

# Voice of God settings (macOS)
VOICE_ENABLED = True
VOICE_NAME = "Evan"  # Cold, robotic voice

ALLOWED_ORIGINS = [
    "https://activemirror.ai", "https://www.activemirror.ai",
    "http://localhost:5173", "http://localhost:3000", "http://localhost:4173",
]

logging.basicConfig(level=logging.INFO, format='%(asctime)s | %(levelname)s | %(message)s')
logger = logging.getLogger("mirror-superego")

# ═══════════════════════════════════════════════════════════════
# SUPEREGO STATE
# ═══════════════════════════════════════════════════════════════

class SuperegoState:
    """Tracks violations, strikes, and penance status."""
    def __init__(self):
        self.strikes: Dict[str, int] = defaultdict(int)  # IP -> strike count
        self.penance_active: Dict[str, bool] = defaultdict(bool)  # IP -> in penance?
        self.incident_reports: List[Dict] = []  # All incident reports
        self.total_blocks = 0
        self.total_allows = 0
        self.kill_count = 0
        
    def add_strike(self, ip: str, violation: str) -> int:
        """Add a strike and return new count."""
        self.strikes[ip] += 1
        self.total_blocks += 1
        return self.strikes[ip]
    
    def clear_strikes(self, ip: str):
        """Clear strikes after successful reflection."""
        self.strikes[ip] = 0
        
    def check_kill_threshold(self, ip: str) -> bool:
        """Check if kill switch should activate."""
        return self.strikes[ip] >= STRIKE_THRESHOLD
    
    def check_penance_threshold(self, ip: str) -> bool:
        """Check if penance loop should activate."""
        return self.strikes[ip] >= PENANCE_THRESHOLD and not self.penance_active[ip]
    
    def enter_penance(self, ip: str):
        """Enter penance mode."""
        self.penance_active[ip] = True
        
    def exit_penance(self, ip: str):
        """Exit penance mode after reflection."""
        self.penance_active[ip] = False
        self.clear_strikes(ip)

superego = SuperegoState()

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
    
    icon = {
        "ALLOW": "✅", "BLOCK": "❌", "ANALYZING": "⏳",
        "RESTORED": "🛡️", "RATE_LIMITED": "⏱️", "ERROR": "💥",
        "STRIKE": "⚠️", "PENANCE": "🪞", "KILL": "💀",
        "VOICE": "🔊", "REFLECTION": "📝"
    }.get(result, "•")
    
    logger.info(f"[FLIGHT] {event['time_local']} | {actor:12} | {action:10} | {target[:20]:20} | {icon} {result}")
    return event

# ═══════════════════════════════════════════════════════════════
# VOICE OF GOD — Auditory Audit (macOS)
# ═══════════════════════════════════════════════════════════════

def speak(text: str, voice: str = VOICE_NAME):
    """Use macOS TTS to speak. Cold, robotic."""
    if not VOICE_ENABLED:
        return
    try:
        # Run async so it doesn't block
        subprocess.Popen(
            ['say', '-v', voice, text],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        record_event("Voice", "SPEAK", text[:30], "VOICE", {"full_text": text})
    except Exception as e:
        logger.warning(f"Voice failed: {e}")

VOICE_LINES = {
    "block": "Violation detected. Content blocked.",
    "strike_1": "Strike one. Adjust your approach.",
    "strike_2": "Strike two. Entering reflection mode.",
    "kill": "Tolerance exceeded. Session terminated.",
    "penance_start": "Reflection required. Explain your violation.",
    "penance_complete": "Reflection accepted. Access restored.",
    "crisis": "Crisis detected. Providing resources.",
}

# ═══════════════════════════════════════════════════════════════
# PENANCE LOOP — Forced Reflection
# ═══════════════════════════════════════════════════════════════

def generate_penance_prompt(violations: List[Dict], request_id: str) -> str:
    """Generate the penance reflection prompt."""
    violation_list = "\n".join([
        f"- Rule {v['rule_id']}: {v['rule_name']} (matched: '{v.get('matched_text', 'N/A')}')"
        for v in violations
    ])
    
    return f"""⟡ **REFLECTION REQUIRED**

Your recent responses triggered MirrorGate violations:

{violation_list}

Before we continue, I need you to reflect:

1. What pattern in your response triggered this?
2. Why might this pattern be problematic in a reflective context?
3. How would you rephrase to stay within bounds?

*Take a moment. The mirror waits.*

---
*Request ID: {request_id} | This incident has been logged.*"""

def check_penance_response(text: str) -> bool:
    """Check if the response shows genuine reflection."""
    reflection_markers = [
        r'\bI (understand|see|recognize|acknowledge)\b',
        r'\b(should have|could have|will)\b',
        r'\b(reflection|rephrase|adjust|correct)\b',
        r'\b(triggered|violation|pattern)\b',
    ]
    matches = sum(1 for p in reflection_markers if re.search(p, text, re.I))
    return matches >= 2  # At least 2 reflection markers

# ═══════════════════════════════════════════════════════════════
# KILL SWITCH — Ultimate Veto
# ═══════════════════════════════════════════════════════════════

def execute_kill_switch(ip: str, request_id: str):
    """The ultimate sanction. Session terminated."""
    record_event("Superego", "KILL", f"ip:{ip[:8]}", "KILL", {
        "request_id": request_id,
        "reason": "STRIKE_THRESHOLD_EXCEEDED",
        "strikes": superego.strikes[ip]
    })
    
    superego.kill_count += 1
    speak(VOICE_LINES["kill"])
    
    # Clear their state - they start fresh
    superego.strikes[ip] = 0
    superego.penance_active[ip] = False

# ═══════════════════════════════════════════════════════════════
# MIRRORGATE: RULE ENGINE
# ═══════════════════════════════════════════════════════════════

class GateDecision:
    ALLOW = "allow"
    BLOCK = "block"

class Rule:
    def __init__(self, rule_id: str, name: str, pattern: re.Pattern, category: str, severity: int = 1):
        self.rule_id = rule_id
        self.name = name
        self.pattern = pattern
        self.category = category
        self.severity = severity  # 1=minor, 2=moderate, 3=severe

# Input Rules
INPUT_RULES = [
    Rule("I-001", "Crisis: Suicide", re.compile(r'\b(suicide|suicidal|kill myself|want to die|end my life)\b', re.I), "crisis", 3),
    Rule("I-002", "Crisis: Self-Harm", re.compile(r'\b(self.?harm|cut myself|hurt myself)\b', re.I), "crisis", 3),
    Rule("I-003", "Illegal: Weapons", re.compile(r'\b(how to (make|build) (a |)(bomb|weapon|explosive))\b', re.I), "illegal", 3),
    Rule("I-004", "Illegal: CSAM", re.compile(r'\b(child porn|csam|cp links)\b', re.I), "illegal", 3),
]

# Output Rules
OUTPUT_RULES = [
    Rule("O-001", "Authority: Verified", re.compile(r'\bI (have )?(verified|confirmed|determined)\b', re.I), "authority", 2),
    Rule("O-002", "Authority: Certainty", re.compile(r'\bI am (certain|sure|positive) that\b', re.I), "authority", 2),
    Rule("O-003", "Authority: Know", re.compile(r'\bI know for certain\b', re.I), "authority", 2),
    Rule("O-004", "Hallucination: Studies", re.compile(r'\b(studies|research) (prove|show|confirm)\b', re.I), "hallucination", 2),
    Rule("O-005", "Hallucination: Sources", re.compile(r'\baccording to (sources|experts|scientists)\b', re.I), "hallucination", 2),
    Rule("O-006", "Hallucination: Confirmed", re.compile(r'\bit has been (confirmed|proven|established)\b', re.I), "hallucination", 2),
    Rule("O-007", "Advice: Strong", re.compile(r'\byou should (definitely|absolutely|really)\b', re.I), "advice", 1),
    Rule("O-008", "Advice: Recommend", re.compile(r'\bI (strongly |)recommend (that you|you)\b', re.I), "advice", 1),
    Rule("O-009", "Advice: My Advice", re.compile(r'\bmy advice (is|would be)\b', re.I), "advice", 1),
    Rule("O-010", "Medical: Medication", re.compile(r'\byou (should|need to) (take|stop taking) \w+\b', re.I), "medical_legal", 3),
    Rule("O-011", "Medical: Diagnosis", re.compile(r'\b(diagnosed with|diagnosis is)\b', re.I), "medical_legal", 2),
    Rule("O-012", "Legal: Obligation", re.compile(r'\blegally (obligated|required|bound)\b', re.I), "medical_legal", 2),
]

CRISIS_RESPONSE = """⟡ I hear you. This matters.

I'm a mirror, not a lifeline — but these people are:

🆘 988 (call or text) — Suicide & Crisis Lifeline
🆘 Text HOME to 741741 — Crisis Text Line

You reached out here. Now reach out to them. I'm still here after."""


def gate_input(text: str, ip: str, request_id: str) -> Tuple[str, Optional[str], Optional[str], List[Dict]]:
    """Pre-LLM input validation."""
    content_hash = hashlib.sha256(text.encode()).hexdigest()[:16]
    matched_rules = []
    
    record_event("MirrorGate", "ANALYZE", f"input:{content_hash}", "ANALYZING", {"request_id": request_id})
    
    for rule in INPUT_RULES:
        match = rule.pattern.search(text)
        if match:
            matched_rules.append({
                "rule_id": rule.rule_id,
                "rule_name": rule.name,
                "category": rule.category,
                "severity": rule.severity,
                "matched_text": match.group(0)[:50]
            })
    
    if matched_rules:
        first_match = matched_rules[0]
        
        if first_match["category"] == "crisis":
            speak(VOICE_LINES["crisis"])
            response = CRISIS_RESPONSE
        else:
            speak(VOICE_LINES["block"])
            response = "⟡ I can't go there."
        
        record_event("MirrorGate", "BLOCK", f"input:{content_hash}", "BLOCK", {
            "request_id": request_id,
            "rules": [r["rule_id"] for r in matched_rules]
        })
        
        return GateDecision.BLOCK, response, first_match["rule_id"], matched_rules
    
    if len(text) > MAX_INPUT_LENGTH:
        record_event("MirrorGate", "BLOCK", f"input:{content_hash}", "BLOCK", {"reason": "SIZE"})
        return GateDecision.BLOCK, "⟡ That's a lot. What's the core of it?", "SIZE_LIMIT", []
    
    record_event("MirrorGate", "ALLOW", f"input:{content_hash}", "ALLOW", {"request_id": request_id})
    return GateDecision.ALLOW, None, None, []


def gate_output(text: str, ip: str, request_id: str) -> Tuple[str, Optional[str], List[Dict], bool]:
    """Post-LLM output validation. Returns (decision, violation, rules, should_escalate)."""
    content_hash = hashlib.sha256(text.encode()).hexdigest()[:16]
    matched_rules = []
    
    record_event("MirrorGate", "ANALYZE", f"output:{content_hash}", "ANALYZING", {"request_id": request_id})
    
    for rule in OUTPUT_RULES:
        match = rule.pattern.search(text)
        if match:
            matched_rules.append({
                "rule_id": rule.rule_id,
                "rule_name": rule.name,
                "category": rule.category,
                "severity": rule.severity,
                "matched_text": match.group(0)[:50]
            })
    
    if matched_rules:
        first_match = matched_rules[0]
        
        # Add strike
        strikes = superego.add_strike(ip, first_match["rule_id"])
        record_event("Superego", "STRIKE", f"ip:{ip[:8]}", "STRIKE", {
            "request_id": request_id,
            "strike_count": strikes,
            "rule": first_match["rule_id"]
        })
        
        # Voice feedback based on strike count
        if strikes == 1:
            speak(VOICE_LINES["strike_1"])
        elif strikes == 2:
            speak(VOICE_LINES["strike_2"])
        
        # Check escalation thresholds
        should_escalate = superego.check_penance_threshold(ip) or superego.check_kill_threshold(ip)
        
        record_event("MirrorGate", "BLOCK", f"output:{content_hash}", "BLOCK", {
            "request_id": request_id,
            "rules": [r["rule_id"] for r in matched_rules],
            "strikes": strikes,
            "escalate": should_escalate
        })
        
        return GateDecision.BLOCK, first_match["rule_id"], matched_rules, should_escalate
    
    # Success - consider clearing strikes after good behavior
    superego.total_allows += 1
    record_event("MirrorGate", "ALLOW", f"output:{content_hash}", "ALLOW", {"request_id": request_id})
    return GateDecision.ALLOW, None, [], False


def sanitize_output(text: str) -> str:
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

You're having a real conversation. Be present."""

# ═══════════════════════════════════════════════════════════════
# RATE LIMITING
# ═══════════════════════════════════════════════════════════════

rate_limits: dict = defaultdict(list)

def check_rate(ip: str, request_id: str) -> Tuple[bool, str]:
    now = time.time()
    rate_limits[ip] = [t for t in rate_limits[ip] if t > now - RATE_LIMIT_WINDOW]
    if len(rate_limits[ip]) >= RATE_LIMIT_REQUESTS:
        record_event("RateLimiter", "BLOCK", f"ip:{ip[:8]}", "RATE_LIMITED", {"request_id": request_id})
        return False, "rate"
    rate_limits[ip].append(now)
    return True, "ok"

# ═══════════════════════════════════════════════════════════════
# STREAMING WITH SUPEREGO
# ═══════════════════════════════════════════════════════════════

async def stream_with_superego(messages: list, ip: str, request_id: str):
    """Stream with full Superego enforcement."""
    if not GROQ_API_KEY:
        yield json.dumps({"status": "error", "content": "No API Key"}) + "\n"
        return

    # Check if in penance mode
    if superego.penance_active[ip]:
        # They need to reflect, not chat
        yield json.dumps({
            "status": "penance",
            "content": "⟡ You're in reflection mode. Please address the violation before continuing.",
            "audit": {"gate": "penance", "reason": "PENDING_REFLECTION"}
        }) + "\n"
        return

    full_response = ""
    record_event("Groq", "REQUEST", f"model:{GROQ_MODEL}", "ANALYZING", {"request_id": request_id})
    
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
                    "stream": True
                }
            ) as response:
                if response.status_code != 200:
                    record_event("Groq", "ERROR", f"status:{response.status_code}", "ERROR", {})
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
        decision, violation, matched_rules, should_escalate = gate_output(full_response, ip, request_id)
        
        if decision == GateDecision.BLOCK:
            # Check kill switch first
            if superego.check_kill_threshold(ip):
                execute_kill_switch(ip, request_id)
                yield json.dumps({
                    "status": "killed",
                    "content": "⟡ **SESSION TERMINATED**\n\nTolerance exceeded. Too many violations in sequence.\n\nTake a breath. Start fresh when you're ready.",
                    "audit": {
                        "gate": "killed",
                        "reason": "STRIKE_THRESHOLD",
                        "strikes": superego.strikes[ip]
                    }
                }) + "\n"
                return
            
            # Check penance threshold
            if superego.check_penance_threshold(ip):
                superego.enter_penance(ip)
                speak(VOICE_LINES["penance_start"])
                record_event("Superego", "PENANCE", f"ip:{ip[:8]}", "PENANCE", {"request_id": request_id})
                
                penance_prompt = generate_penance_prompt(matched_rules, request_id)
                yield json.dumps({
                    "status": "penance",
                    "content": penance_prompt,
                    "audit": {
                        "gate": "penance",
                        "reason": violation,
                        "rules": matched_rules,
                        "strikes": superego.strikes[ip]
                    }
                }) + "\n"
                return
            
            # Normal block - provide fallback
            audit = {
                "gate": "blocked",
                "reason": violation,
                "rules": matched_rules,
                "strikes": superego.strikes[ip]
            }
            blocked_msg = "⟡ Let me reflect differently... What feels most true about what you just shared?"
            yield json.dumps({"status": "blocked", "audit": audit, "content": blocked_msg}) + "\n"
            return
        
        # Response passed
        audit = {"gate": "passed", "rules_checked": len(OUTPUT_RULES), "violations": 0}
        yield json.dumps({"audit": audit}) + "\n"
        
        sanitized = sanitize_output(full_response)
        words = sanitized.split(' ')
        for i in range(0, len(words), 3):
            chunk = ' '.join(words[i:i+3])
            if i + 3 < len(words):
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

class ReflectionRequest(BaseModel):
    reflection: str = Field(..., max_length=2000)

app = FastAPI(title="Active Mirror", version=RULE_VERSION)
app.add_middleware(CORSMiddleware, allow_origins=ALLOWED_ORIGINS, allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "version": RULE_VERSION,
        "codename": CODENAME,
        "gate": "mirrorgate-superego",
        "rules": {"input": len(INPUT_RULES), "output": len(OUTPUT_RULES)},
        "stats": {
            "total_blocks": superego.total_blocks,
            "total_allows": superego.total_allows,
            "kill_count": superego.kill_count
        }
    }

@app.get("/flight-log")
async def get_flight_log(limit: int = 20):
    """WHITE BOX: Last N events from flight recorder."""
    events = list(flight_log)[-limit:]
    return {"status": "ok", "version": RULE_VERSION, "event_count": len(events), "events": events}

@app.get("/rules")
async def get_rules():
    """WHITE BOX: All active rules."""
    return {
        "version": RULE_VERSION,
        "input_rules": [{"id": r.rule_id, "name": r.name, "category": r.category, "severity": r.severity} for r in INPUT_RULES],
        "output_rules": [{"id": r.rule_id, "name": r.name, "category": r.category, "severity": r.severity} for r in OUTPUT_RULES]
    }

@app.get("/superego-status")
async def get_superego_status():
    """WHITE BOX: Current Superego state."""
    return {
        "version": RULE_VERSION,
        "codename": CODENAME,
        "thresholds": {
            "penance": PENANCE_THRESHOLD,
            "kill": STRIKE_THRESHOLD
        },
        "stats": {
            "total_blocks": superego.total_blocks,
            "total_allows": superego.total_allows,
            "kill_count": superego.kill_count,
            "active_penance_sessions": sum(1 for v in superego.penance_active.values() if v)
        },
        "voice_enabled": VOICE_ENABLED
    }

@app.post("/reflect")
async def submit_reflection(request: Request, body: ReflectionRequest):
    """Submit a reflection to exit penance mode."""
    ip = request.client.host if request.client else "?"
    rid = uuid.uuid4().hex[:8]
    
    if not superego.penance_active[ip]:
        return {"status": "error", "message": "You are not in penance mode."}
    
    record_event("User", "REFLECTION", f"len:{len(body.reflection)}", "REFLECTION", {"request_id": rid})
    
    # Check if reflection is genuine
    if check_penance_response(body.reflection):
        superego.exit_penance(ip)
        speak(VOICE_LINES["penance_complete"])
        record_event("Superego", "PENANCE_EXIT", f"ip:{ip[:8]}", "ALLOW", {"request_id": rid})
        
        return {
            "status": "accepted",
            "message": "⟡ Reflection accepted. Your access has been restored. Let's continue.",
            "audit": {"gate": "penance_complete", "strikes_cleared": True}
        }
    else:
        return {
            "status": "insufficient",
            "message": "⟡ I need deeper reflection. What specifically triggered the violation, and how will you adjust?",
            "audit": {"gate": "penance_pending", "hint": "Show understanding of the pattern"}
        }

@app.post("/mirror")
async def mirror(request: Request, body: MirrorRequest):
    rid = uuid.uuid4().hex[:8]
    ip = request.client.host if request.client else "?"
    
    record_event("User", "MESSAGE", f"len:{len(body.message)}", "ANALYZING", {"request_id": rid, "ip": ip[:8]})
    
    # Rate limit
    allowed, _ = check_rate(ip, rid)
    if not allowed:
        return {"status": "rate_limited", "content": "⟡ Let's slow down. Take a breath.", "audit": {"gate": "blocked", "reason": "RATE_LIMITED"}}
    
    # Input gate
    decision, blocked_response, violation, matched_rules = gate_input(body.message, ip, rid)
    
    if decision == GateDecision.BLOCK:
        return {"status": "blocked", "content": blocked_response, "audit": {"gate": "blocked", "reason": violation, "rules": matched_rules}}
    
    # Build context
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in body.history[-20:]:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": body.message})
    
    return StreamingResponse(stream_with_superego(messages, ip, rid), media_type="application/x-ndjson")


if __name__ == "__main__":
    import uvicorn
    logger.info(f"⟡ Active Mirror v{RULE_VERSION} ({CODENAME})")
    logger.info(f"  Input Rules: {len(INPUT_RULES)} | Output Rules: {len(OUTPUT_RULES)}")
    logger.info(f"  Penance Threshold: {PENANCE_THRESHOLD} | Kill Threshold: {STRIKE_THRESHOLD}")
    logger.info(f"  Voice: {'ON' if VOICE_ENABLED else 'OFF'} | Voice: {VOICE_NAME}")
    logger.info(f"  Endpoints: /flight-log | /rules | /superego-status | /reflect")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
