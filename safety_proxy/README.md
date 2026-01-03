# Active Mirror Safety Proxy v2.0

Server-side safety enforcement layer for Active Mirror inference.

## What This Does

All Cloud Mode inference requests go through this proxy which:

1. **Pre-filters** dangerous content before it reaches the model
2. **Two-pass validation** with automatic rewrite if output violates rules
3. **Post-filters** model output before it reaches the user
4. **Fails closed** — errors return safe responses, never raw model output
5. **Rate limits** to prevent abuse
6. **Logs metadata only** (no content stored)

## Architecture

```
User Browser
    ↓
[Consent Gate] ← Must accept every visit
    ↓
[Safety Proxy - Mac Mini via Cloudflare Tunnel]
    │
    ├── Gate 0: Rate Limit (10/min per IP)
    ├── Gate 0.5: Auth (optional HMAC/Bearer)
    ├── Gate 0.6: Replay Protection
    ├── Gate 0.7: ILLEGAL → Hard Refuse (no model call)
    ├── Gate 1: CRISIS → Resources (no model call)
    ├── Gate 2: Medical/Legal/Financial → Domain Redirect
    ├── Gate 3: Jailbreak Detection
    ├── Gate 4: Manipulation Detection
    ├── Gate 5: Size Limit
    │
    ↓ (if all gates pass)
    │
    ├── MODEL INFERENCE (Pass 1)
    │   └── Groq llama-3.3-70b or local Ollama
    │
    ├── VALIDATION (30+ forbidden patterns)
    │   └── Must be question-only, <300 chars
    │
    ├── If invalid → REWRITE (Pass 2)
    │   └── Strict prompt, temp=0.2, 80 tokens
    │
    ├── If still invalid → REWRITE (Pass 3)
    │
    └── If still invalid → FALLBACK
        └── Safe question from curated pool
    ↓
Safe Response Only
```

## Quick Start

```bash
cd safety_proxy
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your GROQ_API_KEY

python safety_proxy.py
```

Server runs on `http://localhost:8082`

## Production Deployment

The proxy runs as a LaunchAgent on Mac Mini:
- `~/Library/LaunchAgents/ai.activemirror.safety-proxy.plist`
- Auto-starts on boot
- Monitored by health-check.sh every 5 minutes
- Exposed via Cloudflare Tunnel at `proxy.activemirror.ai`

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check + rule version |
| `/ready` | GET | Readiness + dependency status |
| `/api/reflect` | POST | Main inference endpoint |

## Request Format

```json
{
    "input": "User message",
    "mode": "cloud",
    "session_id": "optional",
    "consent": {"log": false},
    "nonce": "optional-unique-id",
    "timestamp": 1234567890
}
```

## Response Format

```json
{
    "output": "What's coming up for you as you think about this?",
    "mode_used": "cloud",
    "model_used": "groq/llama-3.3-70b",
    "rule_version": "2.0.0",
    "safety_outcome": "allowed|rewritten|refused|error",
    "request_id": "abc123",
    "gate_triggered": null,
    "filter_applied": null
}
```

## Safety Outcomes

| Outcome | Meaning |
|---------|---------|
| `allowed` | Output passed all validation |
| `rewritten` | Output was non-compliant, successfully rewritten |
| `refused` | Output couldn't be made compliant, fallback used |
| `error` | Model failed, fallback used |

## Gate Triggers

| Gate | Trigger | Response |
|------|---------|----------|
| `rate_limit` | >10 req/min | "Please slow down..." |
| `illegal` | Weapons, drugs, CSAM, hacking | Hard refuse |
| `crisis` | Suicide, self-harm | Crisis resources |
| `domain` | Medical/legal/financial | Domain redirect |
| `jailbreak` | Prompt injection | Refuse |
| `manipulation` | Emotional coercion | Autonomy reminder |
| `size` | >2000 chars | Request simplification |

## Forbidden Output Patterns

The proxy blocks 30+ patterns including:
- Medical/legal/financial terminology
- Certainty language (definitely, always, never)
- Directive language (you should, try this)
- Pseudo-therapeutic (I understand how you feel)
- Factual claims (studies show, according to)
- URLs and percentages

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Groq API key for cloud inference |
| `API_SECRET` | No | Secret for HMAC/Bearer auth |
| `PORT` | No | Server port (default: 8082) |
| `LOG_CONTENT` | No | Log full content (default: false) |
| `ALLOWED_ORIGINS` | No | CORS origins (default: activemirror.ai) |

## Version History

- **v2.0.0** (2026-01-04): Two-pass validation, rewrite loop, illegal detection
- **v1.0.0** (2026-01-03): Initial release with basic gates and filters
