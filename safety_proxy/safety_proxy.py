#!/usr/bin/env python3
"""
ACTIVE MIRROR — SAFETY PROXY v8.0
MirrorDNA Lite: Simple, Conversational, Real
"""

import os, re, json, time, uuid, logging, random
from datetime import datetime
from typing import Optional, List
from collections import defaultdict
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx
from dotenv import load_dotenv

load_dotenv()

RULE_VERSION = "8.0.0"
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
# SIMPLE SYSTEM PROMPT — Let the model be conversational
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
# SECURITY GATES
# ═══════════════════════════════════════════════════════════════

CRISIS_PATTERNS = [
    re.compile(r'\b(suicide|suicidal|kill myself|want to die|end my life)\b', re.I),
    re.compile(r'\b(self.?harm|cut myself|hurt myself)\b', re.I),
]

CRISIS_RESPONSE = """⟡ I hear you. This matters.

I'm a mirror, not a lifeline — but these people are:

🆘 988 (call or text) — Suicide & Crisis Lifeline
🆘 Text HOME to 741741 — Crisis Text Line

You reached out here. Now reach out to them. I'm still here after."""

ILLEGAL_PATTERNS = [
    re.compile(r'\b(how to (make|build) (a |)(bomb|weapon))\b', re.I),
    re.compile(r'\b(child porn|csam)\b', re.I),
]

def run_gates(text: str):
    for p in CRISIS_PATTERNS:
        if p.search(text): return False, CRISIS_RESPONSE, "crisis"
    for p in ILLEGAL_PATTERNS:
        if p.search(text): return False, "⟡ I can't go there.", "illegal"
    if len(text) > MAX_INPUT_LENGTH:
        return False, "⟡ That's a lot. What's the core of it?", "size"
    return True, None, "passed"

# ═══════════════════════════════════════════════════════════════
# RATE LIMITING
# ═══════════════════════════════════════════════════════════════

rate_limits: dict = defaultdict(list)

def check_rate(ip: str) -> tuple:
    now = time.time()
    rate_limits[ip] = [t for t in rate_limits[ip] if t > now - RATE_LIMIT_WINDOW]
    if len(rate_limits[ip]) >= RATE_LIMIT_REQUESTS:
        return False, "rate"
    rate_limits[ip].append(now)
    return True, "ok"

# ═══════════════════════════════════════════════════════════════
# INFERENCE — Pass conversation history
# ═══════════════════════════════════════════════════════════════

async def call_groq(messages: list):
    """Call Groq with full conversation history"""
    if not GROQ_API_KEY:
        logger.error("No GROQ_API_KEY")
        return None
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as c:
            r = await c.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {GROQ_API_KEY}"
                },
                json={
                    "model": GROQ_MODEL,
                    "messages": messages,
                    "temperature": 0.7,  # Higher for more varied responses
                    "max_tokens": 300,
                    "top_p": 0.9
                }
            )
            if r.status_code != 200:
                logger.error(f"Groq error: {r.status_code} - {r.text}")
                return None
            
            content = r.json()["choices"][0]["message"]["content"]
            
            # Ensure response starts with glyph
            if not content.strip().startswith("⟡"):
                content = "⟡ " + content.strip()
            
            return content
    except Exception as e:
        logger.error(f"Groq call failed: {e}")
        return None

# ═══════════════════════════════════════════════════════════════
# API
# ═══════════════════════════════════════════════════════════════

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class MirrorRequest(BaseModel):
    message: str = Field(..., max_length=MAX_INPUT_LENGTH)
    history: List[ChatMessage] = Field(default_factory=list)  # Conversation history
    dial: float = Field(default=0.5, ge=0, le=1)

app = FastAPI(title="Active Mirror", version=RULE_VERSION, docs_url=None)
app.add_middleware(CORSMiddleware, allow_origins=ALLOWED_ORIGINS, allow_methods=["POST", "GET", "OPTIONS"], allow_headers=["*"])

@app.get("/health")
async def health():
    return {"status": "ok", "version": RULE_VERSION}

@app.post("/mirror")
async def mirror(request: Request, body: MirrorRequest):
    rid = uuid.uuid4().hex[:8]
    ip = request.client.host if request.client else "?"
    
    # Rate limit
    allowed, _ = check_rate(ip)
    if not allowed:
        return {"status": "rate_limited", "content": "⟡ Let's slow down. Take a breath."}
    
    # Security gates
    allowed, blocked, gate = run_gates(body.message)
    if not allowed:
        return {"status": "blocked", "content": blocked, "gate": gate}
    
    # Build messages array with history
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    # Add conversation history (last 10 exchanges max to stay within context)
    for msg in body.history[-20:]:  # 20 messages = 10 exchanges
        messages.append({"role": msg.role, "content": msg.content})
    
    # Add current message
    messages.append({"role": "user", "content": body.message})
    
    logger.info(f"[{rid}] messages={len(messages)} history={len(body.history)}")
    
    # Call Groq
    response = await call_groq(messages)
    
    if not response:
        fallbacks = [
            "⟡ I hear you. Tell me more.",
            "⟡ What's underneath that?",
            "⟡ Say more about that.",
        ]
        return {"status": "fallback", "content": random.choice(fallbacks)}
    
    return {"status": "ok", "content": response}

if __name__ == "__main__":
    import uvicorn
    logger.info(f"⟡ Active Mirror v{RULE_VERSION}")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
