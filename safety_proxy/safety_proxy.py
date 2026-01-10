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

from fastapi.responses import StreamingResponse

# ═══════════════════════════════════════════════════════════════
# STREAMING INFERENCE
# ═══════════════════════════════════════════════════════════════

async def stream_groq(messages: list):
    """Yield chunks from Groq"""
    if not GROQ_API_KEY:
        yield json.dumps({"status": "error", "content": "No API Key"}) + "\n"
        return

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
                    "max_tokens": 800, # Increased for deeper reflection
                    "top_p": 0.9,
                    "stream": True # Enable streaming
                }
            ) as response:
                if response.status_code != 200:
                    error_text = await response.aread()
                    logger.error(f"Groq error: {response.status_code} - {error_text}")
                    yield json.dumps({"status": "error", "content": "Mirror clouded."}) + "\n"
                    return

                # Force glyph start
                yield json.dumps({"status": "chunk", "content": "⟡ "}) + "\n"

                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data)
                            delta = chunk["choices"][0]["delta"].get("content", "")
                            if delta:
                                yield json.dumps({"status": "chunk", "content": delta}) + "\n"
                        except:
                            continue
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
    return {"status": "ok", "version": RULE_VERSION}

@app.post("/mirror")
async def mirror(request: Request, body: MirrorRequest):
    rid = uuid.uuid4().hex[:8]
    ip = request.client.host if request.client else "?"
    
    # Rate limit
    allowed, _ = check_rate(ip)
    if not allowed:
        return {"status": "rate_limited", "content": "⟡ Let's slow down. Take a breath."}
    
    # Security gates (Still blocking input)
    allowed, blocked, gate = run_gates(body.message)
    if not allowed:
        return {"status": "blocked", "content": blocked, "gate": gate}
    
    # Build context
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in body.history[-20:]:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": body.message})
    
    logger.info(f"[{rid}] Stream requested. Hist: {len(body.history)}")
    
    return StreamingResponse(stream_groq(messages), media_type="application/x-ndjson")

if __name__ == "__main__":
    import uvicorn
    logger.info(f"⟡ Active Mirror v{RULE_VERSION} (Streaming)")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
