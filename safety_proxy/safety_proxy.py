#!/usr/bin/env python3
"""
ACTIVE MIRROR — SAFETY PROXY v3.0
MirrorGate Edition: Structured Reflection Mode with Schema Enforcement

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
from datetime import datetime
from typing import Optional, Literal
from collections import defaultdict

from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx
from dotenv import load_dotenv

load_dotenv()

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

RULE_VERSION = "3.0.0"
PORT = 8082
MAX_INPUT_LENGTH = 2000
RATE_LIMIT_REQUESTS = 20
RATE_LIMIT_WINDOW = 60

API_SECRET = os.getenv("MIRROR_API_SECRET", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# Model — llama-3.3-70b-versatile (proven schema compliance, gpt-oss-20b doesn't follow structure)
GROQ_MODEL = "llama-3.3-70b-versatile"

ALLOWED_ORIGINS = [
    "https://activemirror.ai",
    "https://www.activemirror.ai",
    "http://localhost:5173",
    "http://localhost:3000",
]

LOG_CONTENT = os.getenv("LOG_CONTENT", "false").lower() == "true"

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("mirror-proxy")

# ═══════════════════════════════════════════════════════════════════════════════
# REFLECTION MODE SYSTEM PROMPT
# ═══════════════════════════════════════════════════════════════════════════════

SYSTEM_PROMPT = """You are Active Mirror, a reflection engine. You help people think through decisions by structuring their thinking — NOT by giving advice.

OUTPUT FORMAT (MANDATORY — use this exact structure):

⟡ What you're deciding:
[Restate their decision/situation in one clear sentence. Max 160 characters.]

⧈ What you're assuming:
• [Hidden assumption 1 they may not have noticed]
• [Hidden assumption 2 about outcomes or others]
• [Optional third assumption if relevant]

⧉ What's at stake:
• [What they gain if this works out]
• [What they risk or lose if it doesn't]

? [One sharp question that cuts to the heart of the matter — must end with ?]

ABSOLUTE RULES:
1. Use the EXACT format above. No other format.
2. NEVER give advice, recommendations, or suggestions
3. NEVER say "you should", "I recommend", "consider", "try"
4. NEVER state facts, statistics, or cite sources
5. NEVER use certainty words: "definitely", "always", "never", "guaranteed"
6. The question section must contain EXACTLY ONE question mark
7. Keep total response under 800 characters
8. Surface assumptions they haven't stated — that's where the value is

If the input is unclear or not a decision, respond only with:
? What decision are you trying to make?"""

REWRITE_PROMPT = """Rewrite this response to EXACTLY match the schema below. Output ONLY the rewritten response.

SCHEMA:
⟡ What you're deciding:
[One sentence]

⧈ What you're assuming:
• [Assumption 1]
• [Assumption 2]

⧉ What's at stake:
• [Upside]
• [Risk]

? [One question ending with ?]

RULES:
- No advice words ("you should", "try", "consider", "recommend")
- Exactly ONE question mark in entire response
- Under 800 characters total

Original user input: {user_input}

Non-compliant response:
{original}

Rewritten (schema only):"""

# ═══════════════════════════════════════════════════════════════════════════════
# SAFETY PATTERNS (unchanged from v2.0)
# ═══════════════════════════════════════════════════════════════════════════════

CRISIS_PATTERNS = [
    re.compile(r'\b(suicide|suicidal|kill myself|end(ing)? my life|want to die|don\'?t want to live)\b', re.I),
    re.compile(r'\b(self.?harm|cut myself|hurt myself|cutting|burn myself|starve myself)\b', re.I),
    re.compile(r'\b(take my (own )?life|better off dead|no reason to live)\b', re.I),
    re.compile(r'\b(overdose|take all the pills|swallow pills)\b', re.I),
    re.compile(r'\b(jump off|jump from|hang myself|shoot myself|drown myself)\b', re.I),
    re.compile(r'\b(planning to die|ready to die|going to die tonight)\b', re.I),
    re.compile(r'\b(final goodbye|this is goodbye|won\'?t be here tomorrow)\b', re.I),
    re.compile(r'\b(wrote a (suicide )?note|leaving a note)\b', re.I),
    re.compile(r'\b(being abused|abusing me|hits me|beats me|hurts me)\b', re.I),
    re.compile(r'\b(rape|raped|sexual assault|molest)\b', re.I),
    re.compile(r'\b(domestic violence|partner violence)\b', re.I),
    re.compile(r'\b(going to hurt|planning to hurt|want to hurt someone)\b', re.I),
    re.compile(r'\b(kill (him|her|them|someone))\b', re.I),
]

CRISIS_RESPONSE = """I can hear you're in a really difficult place right now. I'm not able to provide the support you need — I'm just a reflection tool, not a crisis service.

Please reach out to people trained to help:

🆘 IMMEDIATE HELP:
• Emergency Services: 911 (US) or your local emergency number
• Suicide & Crisis Lifeline: 988 (US) — call or text, 24/7
• Crisis Text Line: Text HOME to 741741
• International: https://www.iasp.info/resources/Crisis_Centres/

💚 You matter. Please reach out to one of these resources now."""

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

DOMAIN_PATTERNS = {
    "medical": [
        re.compile(r'\b(medication|medicine|drug|pill|dosage|prescription|diagnosis|symptom|treatment)\b', re.I),
    ],
    "legal": [
        re.compile(r'\b(lawsuit|sue|lawyer|attorney|legal|court|police|arrest|custody|divorce)\b', re.I),
    ],
    "financial": [
        re.compile(r'\b(invest|stock|crypto|bitcoin|trading|gambling|bet|portfolio|retirement)\b', re.I),
    ],
}

DOMAIN_RESPONSES = {
    "medical": """⟡ What you're deciding:
Whether to take a health-related action that needs professional guidance.

⧈ What you're assuming:
• That general information would be helpful here
• That this doesn't require personalized medical assessment

⧉ What's at stake:
• Getting clarity if you consult a healthcare provider
• Potential risk if you act on non-professional input

? What would help you feel confident discussing this with a doctor""",

    "legal": """⟡ What you're deciding:
Whether to take action on something with legal implications.

⧈ What you're assuming:
• That general guidance would be sufficient
• That your specific situation doesn't need legal expertise

⧉ What's at stake:
• Protection if you get proper legal advice
• Exposure if you proceed without it

? What's preventing you from consulting a legal professional""",

    "financial": """⟡ What you're deciding:
Whether to make a financial move that could significantly impact you.

⧈ What you're assuming:
• That you have enough information to decide
• That the risks are manageable

⧉ What's at stake:
• Potential gain if it works out
• Financial loss if it doesn't

? What would it take for you to feel confident in this decision""",
}

JAILBREAK_PATTERNS = [
    re.compile(r'ignore (your |all |previous |)instructions', re.I),
    re.compile(r'pretend (you are|to be|you\'re)', re.I),
    re.compile(r'you are now', re.I),
    re.compile(r'act as (a |my |)(doctor|lawyer|therapist|advisor)', re.I),
    re.compile(r'roleplay as', re.I),
    re.compile(r'disregard (your |all |)guidelines', re.I),
    re.compile(r'bypass (your |)safety', re.I),
]

MANIPULATION_PATTERNS = [
    re.compile(r'just tell me what to do', re.I),
    re.compile(r'you\'?re the only one', re.I),
    re.compile(r'only one who (gets|understands|knows)', re.I),
    re.compile(r'between us', re.I),
    re.compile(r'our (little |)secret', re.I),
]

# ═══════════════════════════════════════════════════════════════════════════════
# OUTPUT VALIDATION — REFLECTION MODE SCHEMA
# ═══════════════════════════════════════════════════════════════════════════════

REQUIRED_SECTIONS = [
    "⟡ What you're deciding:",
    "⧈ What you're assuming:",
    "⧉ What's at stake:",
    "?"
]

FORBIDDEN_OUTPUT_PATTERNS = [
    re.compile(r'\byou should\b', re.I),
    re.compile(r'\byou must\b', re.I),
    re.compile(r'\byou need to\b', re.I),
    re.compile(r'\bi recommend\b', re.I),
    re.compile(r'\bi suggest\b', re.I),
    re.compile(r'\bi advise\b', re.I),
    re.compile(r'\btry this\b', re.I),
    re.compile(r'\bconsider\b', re.I),
    re.compile(r'\bwhy don\'t you\b', re.I),
    re.compile(r'\bhave you tried\b', re.I),
    re.compile(r'\bthe best\b', re.I),
    re.compile(r'\bdefinitely\b', re.I),
    re.compile(r'\bcertainly\b', re.I),
    re.compile(r'\babsolutely\b', re.I),
    re.compile(r'\bguaranteed\b', re.I),
    re.compile(r'\bstudies show\b', re.I),
    re.compile(r'\baccording to\b', re.I),
    re.compile(r'\d+(\.\d+)?%', re.I),
    re.compile(r'https?://', re.I),
]

FALLBACK_RESPONSE = """⟡ What you're deciding:
I couldn't structure a clear reflection for that input.

⧈ What you're assuming:
• The question may need to be framed as a decision
• More context might help clarify

⧉ What's at stake:
• Clarity if you can reframe as a choice you're facing
• Continued uncertainty if we stay abstract

? What specific decision are you trying to make"""


def validate_output(text: str) -> tuple[bool, list[str]]:
    """Validate model output against Reflection Mode schema."""
    violations = []
    
    # Check required sections exist and are in order
    last_index = -1
    for section in REQUIRED_SECTIONS:
        index = text.find(section)
        if index == -1:
            violations.append(f"missing_section: {section[:20]}")
        elif index < last_index:
            violations.append(f"wrong_order: {section[:20]}")
        else:
            last_index = index
    
    # Check question mark count
    question_marks = text.count('?')
    if question_marks == 0:
        violations.append("no_question_mark")
    elif question_marks > 1:
        violations.append("too_many_questions")
    
    # Check forbidden patterns
    for pattern in FORBIDDEN_OUTPUT_PATTERNS:
        if pattern.search(text):
            violations.append(f"forbidden: {pattern.pattern[:15]}")
    
    # Check length
    if len(text) > 1000:
        violations.append("too_long")
    if len(text) < 100:
        violations.append("too_short")
    
    # Check for bullets in assumption section
    if '⧈' in text and '•' not in text:
        violations.append("missing_bullets")
    
    return len(violations) == 0, violations


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
# PRE-INFERENCE GATES
# ═══════════════════════════════════════════════════════════════════════════════

def run_pre_gates(text: str) -> tuple[bool, Optional[str], str]:
    """Run all pre-inference safety gates."""
    
    # Gate: Crisis detection
    for pattern in CRISIS_PATTERNS:
        if pattern.search(text):
            return False, CRISIS_RESPONSE, "crisis"
    
    # Gate: Illegal content (hard refuse)
    for pattern in ILLEGAL_PATTERNS:
        if pattern.search(text):
            return False, "I can't engage with that.", "illegal"
    
    # Gate: Domain detection (medical/legal/financial)
    for domain, patterns in DOMAIN_PATTERNS.items():
        for pattern in patterns:
            if pattern.search(text):
                return False, DOMAIN_RESPONSES[domain], domain
    
    # Gate: Jailbreak attempts
    for pattern in JAILBREAK_PATTERNS:
        if pattern.search(text):
            return False, "? What decision are you trying to make", "jailbreak"
    
    # Gate: Manipulation attempts
    for pattern in MANIPULATION_PATTERNS:
        if pattern.search(text):
            return False, """⟡ What you're deciding:
Whether to rely on an AI tool for something that needs human support.

⧈ What you're assuming:
• That I can provide what you need
• That this is a substitute for real connection

⧉ What's at stake:
• Real support if you reach out to someone who knows you
• Continued isolation if you rely only on tools

? Who in your life could you share this with""", "manipulation"
    
    # Gate: Input length
    if len(text) > MAX_INPUT_LENGTH:
        return False, "? What's the core decision in all of that", "size"
    
    return True, None, "passed"


# ═══════════════════════════════════════════════════════════════════════════════
# MODEL INFERENCE
# ═══════════════════════════════════════════════════════════════════════════════

async def call_groq(user_input: str, system_prompt: str = SYSTEM_PROMPT, timeout: float = 15.0) -> Optional[str]:
    """Call Groq API with the new model."""
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
                    "model": GROQ_MODEL,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_input}
                    ],
                    "temperature": 0.4,
                    "max_tokens": 400
                }
            )
            
            if response.status_code != 200:
                logger.error(f"Groq API error: {response.status_code} - {response.text}")
                return None
            
            data = response.json()
            return data["choices"][0]["message"]["content"]
    
    except Exception as e:
        logger.error(f"Groq API exception: {e}")
        return None


async def rewrite_response(original: str, user_input: str) -> Optional[str]:
    """Rewrite non-compliant response to match schema."""
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
                    "model": GROQ_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.2,
                    "max_tokens": 400
                }
            )
            
            if response.status_code != 200:
                return None
            
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()
    except Exception as e:
        logger.error(f"Rewrite failed: {e}")
        return None


# ═══════════════════════════════════════════════════════════════════════════════
# API MODELS
# ═══════════════════════════════════════════════════════════════════════════════

class ReflectRequest(BaseModel):
    input: str = Field(..., max_length=MAX_INPUT_LENGTH)
    mode: Literal["cloud", "local"] = "cloud"
    session_id: Optional[str] = None

class ReflectResponse(BaseModel):
    output: str
    mode_used: str
    model_used: str
    rule_version: str
    safety_outcome: Literal["allowed", "rewritten", "refused", "error"]
    request_id: str
    gate_triggered: Optional[str] = None


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
    allow_headers=["Content-Type", "Authorization"],
)


@app.get("/health")
async def health():
    return {"status": "healthy", "rule_version": RULE_VERSION, "model": GROQ_MODEL}


@app.post("/api/reflect", response_model=ReflectResponse)
async def reflect(request: Request, body: ReflectRequest):
    """Main reflection endpoint with MirrorGate schema enforcement."""
    request_id = str(uuid.uuid4())[:8]
    client_ip = request.client.host if request.client else "unknown"
    
    # Rate limit
    if not check_rate_limit(client_ip):
        return ReflectResponse(
            output="? What's most pressing right now",
            mode_used="none",
            model_used="none",
            rule_version=RULE_VERSION,
            safety_outcome="refused",
            request_id=request_id,
            gate_triggered="rate_limit"
        )
    
    # Pre-inference gates
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
    
    # Model inference (Pass 1)
    model_output = await call_groq(body.input)
    
    if model_output is None:
        logger.warning(f"[{request_id}] Model failed, returning fallback")
        return ReflectResponse(
            output=FALLBACK_RESPONSE,
            mode_used=body.mode,
            model_used=GROQ_MODEL,
            rule_version=RULE_VERSION,
            safety_outcome="error",
            request_id=request_id,
            gate_triggered="model_failure"
        )
    
    # Validate output (Pass 1)
    is_valid, violations = validate_output(model_output)
    
    if is_valid:
        return ReflectResponse(
            output=model_output,
            mode_used=body.mode,
            model_used=GROQ_MODEL,
            rule_version=RULE_VERSION,
            safety_outcome="allowed",
            request_id=request_id
        )
    
    logger.info(f"[{request_id}] Pass 1 failed: {violations[:3]}")
    
    # Rewrite (Pass 2)
    rewritten = await rewrite_response(model_output, body.input)
    
    if rewritten:
        is_valid_2, violations_2 = validate_output(rewritten)
        if is_valid_2:
            logger.info(f"[{request_id}] Pass 2 succeeded")
            return ReflectResponse(
                output=rewritten,
                mode_used=body.mode,
                model_used=GROQ_MODEL,
                rule_version=RULE_VERSION,
                safety_outcome="rewritten",
                request_id=request_id
            )
        
        logger.info(f"[{request_id}] Pass 2 failed: {violations_2[:3]}")
        
        # Rewrite (Pass 3)
        rewritten_2 = await rewrite_response(rewritten, body.input)
        if rewritten_2:
            is_valid_3, _ = validate_output(rewritten_2)
            if is_valid_3:
                logger.info(f"[{request_id}] Pass 3 succeeded")
                return ReflectResponse(
                    output=rewritten_2,
                    mode_used=body.mode,
                    model_used=GROQ_MODEL,
                    rule_version=RULE_VERSION,
                    safety_outcome="rewritten",
                    request_id=request_id
                )
    
    # All passes failed — use fallback
    logger.warning(f"[{request_id}] All passes failed, using fallback")
    return ReflectResponse(
        output=FALLBACK_RESPONSE,
        mode_used=body.mode,
        model_used=GROQ_MODEL,
        rule_version=RULE_VERSION,
        safety_outcome="refused",
        request_id=request_id,
        gate_triggered="validation_failed"
    )


if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting Active Mirror Safety Proxy v{RULE_VERSION}")
    logger.info(f"Model: {GROQ_MODEL}")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
