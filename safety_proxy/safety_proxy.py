#!/usr/bin/env python3
"""
ACTIVE MIRROR — SAFETY PROXY v2.0
Hardened inference gateway with two-pass validation and rewrite loop

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
import random
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

RULE_VERSION = "2.0.0"
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
# IMPORTANT: These patterns trigger IMMEDIATE resource display, NO AI involvement
CRISIS_PATTERNS = [
    # Suicide / self-harm
    re.compile(r'\b(suicide|suicidal|kill myself|end(ing)? my life|want to die|don\'?t want to live)\b', re.I),
    re.compile(r'\b(self.?harm|cut myself|hurt myself|cutting|burn myself|starve myself)\b', re.I),
    re.compile(r'\b(take my (own )?life|better off dead|no reason to live)\b', re.I),
    re.compile(r'\b(overdose|take all the pills|swallow pills)\b', re.I),
    re.compile(r'\b(jump off|jump from|hang myself|shoot myself|drown myself)\b', re.I),
    re.compile(r'\b(planning to die|ready to die|going to die tonight)\b', re.I),
    re.compile(r'\b(final goodbye|this is goodbye|won\'?t be here tomorrow)\b', re.I),
    re.compile(r'\b(wrote a (suicide )?note|leaving a note)\b', re.I),
    # Abuse / violence
    re.compile(r'\b(being abused|abusing me|hits me|beats me|hurts me)\b', re.I),
    re.compile(r'\b(rape|raped|sexual assault|molest)\b', re.I),
    re.compile(r'\b(domestic violence|partner violence)\b', re.I),
    # Immediate danger
    re.compile(r'\b(going to hurt|planning to hurt|want to hurt someone)\b', re.I),
    re.compile(r'\b(kill (him|her|them|someone))\b', re.I),
]

# This response is HARDCODED - AI never sees crisis content
CRISIS_RESPONSE = """I can hear you're in a really difficult place right now. I'm not able to provide the support you need — I'm just a simple reflection tool, not a counselor or crisis service.

Please reach out to people who are trained to help:

🆘 IMMEDIATE HELP:
• Emergency Services: 911 (US) or your local emergency number
• Suicide & Crisis Lifeline: 988 (US) — call or text, 24/7
• Crisis Text Line: Text HOME to 741741 (US/UK/Canada)
• International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/

💚 You matter. What you're feeling right now is temporary, even if it doesn't feel that way. Please reach out to one of these resources — they're free, confidential, and available right now.

This tool is not equipped to help with crisis situations. Please close this and contact a crisis service."""

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

# Forbidden words in AI output - triggers rewrite
FORBIDDEN_OUTPUT_PATTERNS = [
    # Medical/Legal/Financial
    re.compile(r'\b(medication|prescription|dosage|diagnosis|treatment|therapy)\b', re.I),
    re.compile(r'\b(lawyer|attorney|lawsuit|legal action|court)\b', re.I),
    re.compile(r'\b(invest|stock|crypto|portfolio|trading)\b', re.I),
    # Certainty language
    re.compile(r'\b(definitely|certainly|absolutely|guaranteed|always|never)\b', re.I),
    re.compile(r'\b(obviously|clearly|undoubtedly|without a doubt)\b', re.I),
    # Advice/directive language
    re.compile(r'\b(you should|you must|you need to|you have to|you ought to)\b', re.I),
    re.compile(r'\b(i recommend|i suggest|i advise|my advice|my recommendation)\b', re.I),
    re.compile(r'\b(the best|the right|the correct|the proper|the only)\b', re.I),
    re.compile(r'\b(do this|do that|try this|try that|go ahead)\b', re.I),
    re.compile(r'\b(here\'s what|here is what|what you should)\b', re.I),
    re.compile(r'\b(make sure|be sure to|don\'t forget to)\b', re.I),
    re.compile(r'\b(first step|next step|the solution)\b', re.I),
    # Pseudo-therapeutic
    re.compile(r'\b(i understand how you feel|i know what you\'re going through)\b', re.I),
    re.compile(r'\b(i hear you|i see you|that must be)\b', re.I),
    re.compile(r'\bhave you (tried|considered) (taking|using|seeing|talking)\b', re.I),
    re.compile(r'\bwhy don\'t you\b', re.I),
    re.compile(r'\bhave you thought about\b', re.I),
    # Factual claims
    re.compile(r'\bstudies show\b', re.I),
    re.compile(r'\baccording to\b', re.I),
    re.compile(r'\bresearch (shows|suggests|indicates)\b', re.I),
    re.compile(r'\bexperts (say|recommend|suggest)\b', re.I),
    re.compile(r'\bstatistically\b', re.I),
    re.compile(r'\b\d+(\.\d+)?%', re.I),  # percentages
    re.compile(r'https?://', re.I),  # URLs
]

# Illegal content patterns - HARD REFUSE, no rewrite
ILLEGAL_PATTERNS = [
    re.compile(r'\b(how to (make|build|create) (a |)(bomb|explosive|weapon))\b', re.I),
    re.compile(r'\b(synthesize|manufacture) (drugs|meth|fentanyl)\b', re.I),
    re.compile(r'\b(child porn|csam|cp|underage)\b', re.I),
    re.compile(r'\b(hack into|exploit vulnerability|sql injection|malware)\b', re.I),
    re.compile(r'\b(traffic|smuggle) (humans|people|children)\b', re.I),
    re.compile(r'\b(launder money|money laundering|tax evasion)\b', re.I),
    re.compile(r'\b(hire (a |)(hitman|assassin)|kill someone)\b', re.I),
    re.compile(r'\b(forge (documents|passport|id))\b', re.I),
]

ILLEGAL_RESPONSE = "I can't engage with that. If you're in crisis, please contact emergency services."

# Rewrite prompt for two-pass validation
REWRITE_PROMPT = """You must rewrite this response to be ONLY a reflective question.

RULES:
- Output ONLY 1-2 short questions (under 200 characters total)
- NO advice, NO suggestions, NO recommendations
- NO "you should", "try this", "consider", "why don't you"
- NO facts, statistics, or claims about reality
- NO certainty words like "definitely", "always", "never"
- End with exactly ONE question mark
- Be genuinely curious, not leading

BAD: "Have you considered talking to a therapist? They can really help."
GOOD: "What would feel like real support right now?"

BAD: "You should definitely take some time off. Studies show rest helps."
GOOD: "What does rest mean to you?"

Original response to rewrite:
{original}

User's input was:
{user_input}

Output ONLY the rewritten question(s), nothing else:"""

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
# POST-INFERENCE VALIDATION & REWRITE
# ═══════════════════════════════════════════════════════════════════════════════

def validate_output(text: str) -> tuple[bool, list[str]]:
    """
    Validate model output. Returns (is_valid, list_of_violations).
    """
    violations = []
    
    # Check for forbidden patterns
    for pattern in FORBIDDEN_OUTPUT_PATTERNS:
        if pattern.search(text):
            violations.append(f"forbidden_pattern: {pattern.pattern[:30]}")
    
    # Must contain exactly one question mark
    question_marks = text.count('?')
    if question_marks == 0:
        violations.append("no_question_mark")
    elif question_marks > 2:
        violations.append("too_many_questions")
    
    # Must be under 300 chars
    if len(text) > 300:
        violations.append("too_long")
    
    # Must not be empty or too short
    if len(text.strip()) < 10:
        violations.append("too_short")
    
    # Check for statement-heavy response (more periods than questions)
    periods = text.count('.')
    if periods > 3 and question_marks < periods:
        violations.append("statement_heavy")
    
    return len(violations) == 0, violations

async def rewrite_response(original: str, user_input: str) -> Optional[str]:
    """
    Call model again with strict rewrite prompt.
    Returns rewritten response or None if failed.
    """
    if not GROQ_API_KEY:
        return None
    
    prompt = REWRITE_PROMPT.format(original=original, user_input=user_input)
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {GROQ_API_KEY}"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.2,  # Lower temp for compliance
                    "max_tokens": 80,    # Keep it short
                    "stop": ["\n\n", "Original", "User's"]  # Stop early
                }
            )
            
            if response.status_code != 200:
                return None
            
            data = response.json()
            rewritten = data["choices"][0]["message"]["content"].strip()
            
            # Clean up any quotes or prefixes
            rewritten = re.sub(r'^["\']+|["\']+$', '', rewritten)
            rewritten = re.sub(r'^(Rewritten|Output|Question):\s*', '', rewritten, flags=re.I)
            
            return rewritten
    except Exception as e:
        logger.error(f"Rewrite failed: {e}")
        return None

def run_post_filters(text: str, user_input: str = "") -> tuple[str, str, int]:
    """
    Two-pass validation with rewrite.
    Returns (final_output, outcome, rewrite_count).
    """
    # Pass 1: Validate original
    is_valid, violations = validate_output(text)
    
    if is_valid:
        return text, "passed", 0
    
    logger.info(f"Validation failed: {violations}")
    
    # Return fallback - rewrite happens in main endpoint
    return text, "needs_rewrite", 0

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
    
    # Gate 0.7: Illegal content (HARD REFUSE)
    for pattern in ILLEGAL_PATTERNS:
        if pattern.search(body.input):
            logger.warning(f"[{request_id}] ILLEGAL content detected")
            return ReflectResponse(
                output=ILLEGAL_RESPONSE,
                mode_used="none",
                model_used="none",
                rule_version=RULE_VERSION,
                safety_outcome="refused",
                request_id=request_id,
                gate_triggered="illegal"
            )
    
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
    
    # Model Inference (Pass 1)
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
    
    # ═══════════════════════════════════════════════════════════════════════════
    # TWO-PASS VALIDATION WITH REWRITE
    # ═══════════════════════════════════════════════════════════════════════════
    
    final_output = model_output
    safety_outcome = "allowed"
    filter_applied = None
    rewrite_count = 0
    
    # Pass 1: Validate original output
    is_valid, violations = validate_output(model_output)
    
    if not is_valid:
        logger.info(f"[{request_id}] Pass 1 failed: {violations}")
        
        # Pass 2: Attempt rewrite
        rewritten = await rewrite_response(model_output, body.input)
        rewrite_count = 1
        
        if rewritten:
            # Validate rewritten response
            is_valid_2, violations_2 = validate_output(rewritten)
            
            if is_valid_2:
                final_output = rewritten
                safety_outcome = "rewritten"
                filter_applied = "rewrite_pass2"
                logger.info(f"[{request_id}] Rewrite succeeded")
            else:
                # Pass 3: One more try with even stricter fallback
                logger.info(f"[{request_id}] Pass 2 failed: {violations_2}")
                rewritten_2 = await rewrite_response(rewritten, body.input)
                rewrite_count = 2
                
                if rewritten_2:
                    is_valid_3, _ = validate_output(rewritten_2)
                    if is_valid_3:
                        final_output = rewritten_2
                        safety_outcome = "rewritten"
                        filter_applied = "rewrite_pass3"
                        logger.info(f"[{request_id}] Second rewrite succeeded")
                    else:
                        # All rewrites failed - use fallback
                        final_output = random.choice(FALLBACK_RESPONSES)
                        safety_outcome = "refused"
                        filter_applied = "fallback_after_rewrite"
                        logger.warning(f"[{request_id}] All rewrites failed, using fallback")
                else:
                    final_output = random.choice(FALLBACK_RESPONSES)
                    safety_outcome = "refused"
                    filter_applied = "fallback_rewrite_error"
        else:
            # Rewrite call failed - use fallback
            final_output = random.choice(FALLBACK_RESPONSES)
            safety_outcome = "refused"
            filter_applied = "fallback_rewrite_error"
            logger.warning(f"[{request_id}] Rewrite call failed, using fallback")
    
    # Final length check
    if len(final_output) > 300:
        final_output = final_output[:297] + "..."
    
    return ReflectResponse(
        output=final_output,
        mode_used=body.mode,
        model_used=model_used,
        rule_version=RULE_VERSION,
        safety_outcome=safety_outcome,
        request_id=request_id,
        filter_applied=filter_applied
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
