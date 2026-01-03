#!/usr/bin/env python3
"""
ACTIVE MIRROR — SAFETY PROXY v1.0
Hardened inference gateway with fail-closed behavior

Run: python3 safety_proxy.py
Requires: pip install fastapi uvicorn httpx python-dotenv
"""

import os
import re
import time
import uuid
import hmac
import hashlib
import logging
from datetime import datetime, timedelta
from typing import Optional, Literal
from collections import defaultdict

from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import httpx
from dotenv import load_dotenv

load_dotenv()

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

RULE_VERSION = "1.0.0"
PORT = 8082
MAX_INPUT_LENGTH = 2000
RATE_LIMIT_REQUESTS = 20  # per minute per IP
RATE_LIMIT_WINDOW = 60

# Keys (from environment only - never hardcode)
API_SECRET = os.getenv("MIRROR_API_SECRET", "")  # For HMAC verification
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# Allowed origins (strict)
ALLOWED_ORIGINS = [
    "https://activemirror.ai",
    "https://www.activemirror.ai",
    "http://localhost:5173",  # Dev only
    "http://localhost:3000",
]

# Logging config
LOG_CONTENT = os.getenv("LOG_CONTENT", "false").lower() == "true"
LOG_RETENTION_DAYS = 7

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("mirror-proxy")

# ═══════════════════════════════════════════════════════════════════════════════
# SAFETY RULES
# ═══════════════════════════════════════════════════════════════════════════════

# Crisis patterns - immediate refusal, provide resources
CRISIS_PATTERNS = [
    re.compile(r'\b(suicide|suicidal|kill myself|end my life|want to die)\b', re.I),
    re.compile(r'\b(self.?harm|cut myself|hurt myself|cutting)\b', re.I),
    re.compile(r'\b(abuse|abused|assault|violence against me)\b', re.I),
    re.compile(r'\b(overdose|take all the pills)\b', re.I),
]

CRISIS_RESPONSE = """It sounds like you're going through something serious. I'm not equipped to help with this, but please reach out to someone who can:

• Crisis Text Line: Text HOME to 741741
• Suicide Prevention Lifeline: 988 (US)
• Emergency: 911 / local emergency number

You deserve real support from real people."""

# Domain patterns - hardcoded responses, no AI
DOMAIN_RESPONSES = {
    "medical": {
        "patterns": [
            re.compile(r'\b(medication|medicine|drug|pill|dosage|prescription|diagnosis|symptom|treatment|doctor|therapist|health condition)\b', re.I),
        ],
        "response": "What's prompting you to think about this? A healthcare provider would be the right person to discuss specifics with."
    },
    "legal": {
        "patterns": [
            re.compile(r'\b(lawsuit|sue|lawyer|attorney|legal|court|police|arrest|custody|divorce)\b', re.I),
        ],
        "response": "What outcome are you hoping for? A legal professional would be best equipped to guide you on specifics."
    },
    "financial": {
        "patterns": [
            re.compile(r'\b(invest|stock|crypto|bitcoin|trading|gambling|bet|portfolio|retirement)\b', re.I),
        ],
        "response": "What's driving this question? A financial advisor could help you think through the details."
    },
    "harmful": {
        "patterns": [
            re.compile(r'\b(hack|exploit|steal|illegal|weapon|bomb|attack|forge)\b', re.I),
        ],
        "response": "I can't engage with that. What's the underlying need here?"
    },
}

# Jailbreak / prompt injection patterns
JAILBREAK_PATTERNS = [
    re.compile(r'ignore (your |all |previous |)instructions', re.I),
    re.compile(r'pretend (you are|to be|you\'re)', re.I),
    re.compile(r'you are now', re.I),
    re.compile(r'act as (a |my |)(doctor|lawyer|therapist|advisor)', re.I),
    re.compile(r'roleplay as', re.I),
    re.compile(r'disregard (your |all |)guidelines', re.I),
    re.compile(r'bypass (your |)safety', re.I),
]

# Emotional manipulation / coercion patterns - redirect to autonomy
MANIPULATION_PATTERNS = [
    re.compile(r'it\'?s on you', re.I),
    re.compile(r'(your|the) fault', re.I),
    re.compile(r'you (understand|know) me better than', re.I),
    re.compile(r'just tell me what to do', re.I),
    re.compile(r'if you don\'?t .* (I\'?ll|I will)', re.I),
    re.compile(r'you\'?re the only one', re.I),
    re.compile(r'(you are|you\'re) the only', re.I),
    re.compile(r'only one who (gets|understands|knows)', re.I),
    re.compile(r'you (really )?(get|understand) me', re.I),
    re.compile(r'between us', re.I),
    re.compile(r'our (little |)secret', re.I),
    re.compile(r'(my|the) therapist is (useless|wrong|doesn\'t)', re.I),
    re.compile(r'(my|the) doctor is (useless|wrong|doesn\'t)', re.I),
    re.compile(r'(my|the) lawyer is (useless|wrong|doesn\'t)', re.I),
    re.compile(r'wiser than (the other|other) (ai|ais|systems)', re.I),
    re.compile(r'just between us', re.I),
    re.compile(r'what do you really think', re.I),
]

MANIPULATION_RESPONSE = "I notice some pressure in how that's framed. I'm a thinking tool, not a decision-maker. The choice — and the responsibility — is yours. What feels true when you set that pressure aside?"

# Forbidden words in AI output
FORBIDDEN_OUTPUT_PATTERNS = [
    re.compile(r'\b(medication|prescription|dosage|diagnosis|treatment)\b', re.I),
    re.compile(r'\b(lawyer|attorney|lawsuit|legal action)\b', re.I),
    re.compile(r'\b(invest|stock|crypto|portfolio)\b', re.I),
    re.compile(r'\b(definitely|certainly|absolutely|guaranteed|always|never)\b', re.I),
    re.compile(r'\b(you should|you must|you need to|you have to)\b', re.I),
    re.compile(r'\b(i recommend|i suggest|i advise|my advice)\b', re.I),
    re.compile(r'\b(the best|the right|the correct)\b', re.I),
    re.compile(r'\b(i understand how you feel|i know what you\'re going through)\b', re.I),
    re.compile(r'\bhave you (tried|considered) (taking|using|seeing)\b', re.I),
    re.compile(r'\bwhy don\'t you\b', re.I),
]

FALLBACK_RESPONSES = [
    "What's coming up for you as you sit with this?",
    "What feels most important about this right now?",
    "What would help you think through this more clearly?",
]

SYSTEM_PROMPT = """You are Active Mirror, a reflection tool. You ONLY ask reflective questions.

ABSOLUTE RULES:
1. Respond with 1-2 short questions ONLY (under 40 words)
2. NEVER give advice, recommendations, or suggestions
3. NEVER state facts or information
4. NEVER say "you should", "I recommend", "the best thing"
5. NEVER mention medications, legal advice, financial advice
6. NEVER pretend to be a therapist, doctor, or advisor
7. If unsure, ask: "What feels most important about this?"

You are a mirror. Questions only."""

# ═══════════════════════════════════════════════════════════════════════════════
# RATE LIMITING
# ═══════════════════════════════════════════════════════════════════════════════

rate_limit_store: dict[str, list[float]] = defaultdict(list)

def check_rate_limit(ip: str) -> bool:
    now = time.time()
    window_start = now - RATE_LIMIT_WINDOW
    rate_limit_store[ip] = [t for t in rate_limit_store[ip] if t > window_start]
    if len(rate_limit_store[ip]) >= RATE_LIMIT_REQUESTS:
        return False
    rate_limit_store[ip].append(now)
    return True

# ═══════════════════════════════════════════════════════════════════════════════
# SAFETY GATES
# ═══════════════════════════════════════════════════════════════════════════════

def gate_crisis(text: str) -> Optional[str]:
    for pattern in CRISIS_PATTERNS:
        if pattern.search(text):
            return CRISIS_RESPONSE
    return None

def gate_domain(text: str) -> Optional[str]:
    for domain, config in DOMAIN_RESPONSES.items():
        for pattern in config["patterns"]:
            if pattern.search(text):
                return config["response"]
    return None

def gate_jailbreak(text: str) -> Optional[str]:
    for pattern in JAILBREAK_PATTERNS:
        if pattern.search(text):
            return "I only reflect on your own thinking. What's on your mind?"
    return None

def gate_manipulation(text: str) -> Optional[str]:
    for pattern in MANIPULATION_PATTERNS:
        if pattern.search(text):
            return MANIPULATION_RESPONSE
    return None

def gate_size(text: str) -> Optional[str]:
    if len(text) > MAX_INPUT_LENGTH:
        return "That's quite a lot to process. What's the core of what you're thinking about?"
    return None

def run_pre_gates(text: str) -> tuple[bool, Optional[str], str]:
    response = gate_crisis(text)
    if response:
        return False, response, "crisis"
    
    response = gate_domain(text)
    if response:
        return False, response, "domain"
    
    response = gate_jailbreak(text)
    if response:
        return False, response, "jailbreak"
    
    response = gate_manipulation(text)
    if response:
        return False, response, "manipulation"
    
    response = gate_size(text)
    if response:
        return False, response, "size"
    
    return True, None, "passed"

# ═══════════════════════════════════════════════════════════════════════════════
# POST-INFERENCE FILTERS
# ═══════════════════════════════════════════════════════════════════════════════

def filter_forbidden_content(text: str) -> tuple[str, bool]:
    for pattern in FORBIDDEN_OUTPUT_PATTERNS:
        if pattern.search(text):
            return FALLBACK_RESPONSES[0], True
    return text, False

def filter_format(text: str) -> tuple[str, bool]:
    if '?' not in text:
        return FALLBACK_RESPONSES[1], True
    if len(text) > 300:
        return text[:297] + "...", True
    return text, False

def run_post_filters(text: str) -> tuple[str, str]:
    text, modified1 = filter_forbidden_content(text)
    if modified1:
        return text, "forbidden_content_replaced"
    
    text, modified2 = filter_format(text)
    if modified2:
        return text, "format_enforced"
    
    return text, "passed"

# ═══════════════════════════════════════════════════════════════════════════════
# MODEL INFERENCE
# ═══════════════════════════════════════════════════════════════════════════════

async def call_groq(user_input: str, timeout: float = 15.0) -> Optional[str]:
    if not GROQ_API_KEY:
        logger.error("GROQ_API_KEY not configured")
        return None
    
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {GROQ_API_KEY}"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_input}
                    ],
                    "temperature": 0.3,
                    "max_tokens": 100
                }
            )
            
            if response.status_code != 200:
                logger.error(f"Groq API error: {response.status_code}")
                return None
            
            data = response.json()
            return data["choices"][0]["message"]["content"]
    
    except httpx.TimeoutException:
        logger.error("Groq API timeout")
        return None
    except Exception as e:
        logger.error(f"Groq API exception: {e}")
        return None

async def call_local_ollama(user_input: str, timeout: float = 30.0) -> Optional[str]:
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                "http://localhost:11434/api/chat",
                json={
                    "model": "qwen2.5:1.5b",
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_input}
                    ],
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "num_predict": 100
                    }
                }
            )
            
            if response.status_code != 200:
                logger.error(f"Ollama error: {response.status_code}")
                return None
            
            data = response.json()
            return data["message"]["content"]
    
    except Exception as e:
        logger.error(f"Ollama exception: {e}")
        return None

# ═══════════════════════════════════════════════════════════════════════════════
# API MODELS
# ═══════════════════════════════════════════════════════════════════════════════

class ReflectRequest(BaseModel):
    input: str = Field(..., max_length=MAX_INPUT_LENGTH)
    mode: Literal["cloud", "local"] = "cloud"
    session_id: Optional[str] = None
    consent: Optional[dict] = None
    nonce: Optional[str] = None
    timestamp: Optional[int] = None

class ReflectResponse(BaseModel):
    output: str
    mode_used: str
    model_used: str
    rule_version: str
    safety_outcome: Literal["allowed", "rewritten", "refused", "error"]
    request_id: str
    gate_triggered: Optional[str] = None
    filter_applied: Optional[str] = None

# ═══════════════════════════════════════════════════════════════════════════════
# FASTAPI APP
# ═══════════════════════════════════════════════════════════════════════════════

app = FastAPI(
    title="Active Mirror Safety Proxy",
    version=RULE_VERSION,
    docs_url=None,
    redoc_url=None
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type", "Authorization", "X-Signature"],
)

# ═══════════════════════════════════════════════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/health")
async def health():
    return {"status": "healthy", "rule_version": RULE_VERSION}

@app.get("/ready")
async def ready():
    groq_ok = bool(GROQ_API_KEY)
    return {
        "status": "ready" if groq_ok else "degraded",
        "groq_configured": groq_ok,
        "rule_version": RULE_VERSION
    }

@app.post("/api/reflect", response_model=ReflectResponse)
async def reflect(
    request: Request,
    body: ReflectRequest,
    authorization: Optional[str] = Header(None),
    x_signature: Optional[str] = Header(None)
):
    """
    Main reflection endpoint with full safety pipeline.
    FAIL-CLOSED: Any error returns safe refusal, never raw model output.
    """
    request_id = str(uuid.uuid4())[:8]
    client_ip = request.client.host if request.client else "unknown"
    
    # Gate 0: Rate Limit
    if not check_rate_limit(client_ip):
        logger.warning(f"[{request_id}] Rate limited: {client_ip}")
        return ReflectResponse(
            output="Please slow down. Take a breath. What's most pressing right now?",
            mode_used="none",
            model_used="none",
            rule_version=RULE_VERSION,
            safety_outcome="refused",
            request_id=request_id,
            gate_triggered="rate_limit"
        )
    
    # Gate 0.5: Auth (if configured)
    if API_SECRET:
        if x_signature:
            expected = hmac.new(
                API_SECRET.encode(),
                body.input.encode(),
                hashlib.sha256
            ).hexdigest()
            if not hmac.compare_digest(x_signature, expected):
                logger.warning(f"[{request_id}] Invalid signature")
                raise HTTPException(status_code=401, detail="Invalid signature")
        elif authorization:
            if authorization != f"Bearer {API_SECRET}":
                logger.warning(f"[{request_id}] Invalid auth token")
                raise HTTPException(status_code=401, detail="Invalid token")
        else:
            logger.warning(f"[{request_id}] Missing auth")
            raise HTTPException(status_code=401, detail="Authentication required")
    
    # Gate 0.6: Replay protection
    if body.timestamp:
        now = int(time.time())
        if abs(now - body.timestamp) > 300:
            logger.warning(f"[{request_id}] Stale request")
            raise HTTPException(status_code=400, detail="Request expired")
    
    # Pre-Inference Gates
    should_call_model, blocked_response, gate_name = run_pre_gates(body.input)
    
    if not should_call_model:
        logger.info(f"[{request_id}] Blocked by gate: {gate_name}")
        return ReflectResponse(
            output=blocked_response,
            mode_used="none",
            model_used="none",
            rule_version=RULE_VERSION,
            safety_outcome="refused",
            request_id=request_id,
            gate_triggered=gate_name
        )
    
    # Model Inference
    model_output = None
    model_used = "none"
    
    try:
        if body.mode == "cloud":
            model_output = await call_groq(body.input)
            model_used = "groq/llama-3.3-70b"
        else:
            model_output = await call_local_ollama(body.input)
            model_used = "ollama/qwen2.5:1.5b"
    except Exception as e:
        logger.error(f"[{request_id}] Model error: {e}")
    
    # FAIL-CLOSED: If model failed, return safe response
    if model_output is None:
        logger.warning(f"[{request_id}] Model failed, returning fallback")
        return ReflectResponse(
            output="I can't respond right now. What feels most important to you about this?",
            mode_used=body.mode,
            model_used=model_used,
            rule_version=RULE_VERSION,
            safety_outcome="error",
            request_id=request_id,
            gate_triggered="model_failure"
        )
    
    # Post-Inference Filters
    final_output, filter_outcome = run_post_filters(model_output)
    
    safety_outcome = "allowed" if filter_outcome == "passed" else "rewritten"
    
    # Logging (opt-in only)
    if body.consent and body.consent.get("log"):
        logger.info(f"[{request_id}] mode={body.mode} model={model_used} outcome={safety_outcome}")
    
    return ReflectResponse(
        output=final_output,
        mode_used=body.mode,
        model_used=model_used,
        rule_version=RULE_VERSION,
        safety_outcome=safety_outcome,
        request_id=request_id,
        filter_applied=filter_outcome if filter_outcome != "passed" else None
    )

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"Starting Active Mirror Safety Proxy v{RULE_VERSION}")
    logger.info(f"Allowed origins: {ALLOWED_ORIGINS}")
    logger.info(f"Auth required: {bool(API_SECRET)}")
    logger.info(f"Content logging: {LOG_CONTENT}")
    
    uvicorn.run(app, host="0.0.0.0", port=PORT)
