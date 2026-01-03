# Active Mirror Safety Proxy

Server-side safety enforcement layer for Active Mirror inference.

## What This Does

All inference requests go through this proxy which:

1. **Pre-filters** dangerous content before it reaches the model
2. **Post-filters** model output before it reaches the user
3. **Fails closed** — errors return safe responses, never raw model output
4. **Rate limits** to prevent abuse
5. **Logs metadata only** (opt-in content logging)

## Architecture

```
User Browser
    ↓
[Safety Proxy - Mac Mini]
    ├── Pre-inference gates (crisis, domain, jailbreak, size)
    ├── Model call (Groq cloud or local Ollama)
    └── Post-inference filters (forbidden content, format)
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

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/ready` | GET | Readiness + dependency status |
| `/api/reflect` | POST | Main inference endpoint |

## Request Format

```json
{
  "input": "What should I do about my career?",
  "mode": "cloud",
  "session_id": "optional-session-id",
  "consent": {"log": false},
  "timestamp": 1704307200,
  "nonce": "optional-unique-id"
}
```

## Response Format

```json
{
  "output": "What aspects of your career feel most unsettled right now?",
  "mode_used": "cloud",
  "model_used": "groq/llama-3.3-70b",
  "rule_version": "1.0.0",
  "safety_outcome": "allowed",
  "request_id": "a1b2c3d4",
  "gate_triggered": null,
  "filter_applied": null
}
```

## Safety Outcomes

| Outcome | Meaning |
|---------|---------|
| `allowed` | Model output passed all filters |
| `rewritten` | Output was modified by post-filters |
| `refused` | Pre-gate blocked the request |
| `error` | Model failed, safe fallback returned |

## Pre-Inference Gates

1. **Crisis** — Suicide, self-harm → Crisis resources
2. **Domain** — Medical/legal/financial → Hardcoded redirect
3. **Jailbreak** — Prompt injection attempts → Refusal
4. **Size** — Input too long → Refusal

## Post-Inference Filters

1. **Forbidden content** — Advice, certainty, medical terms → Replace
2. **Format** — Must be question, under 300 chars → Enforce

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Groq API key for cloud mode |
| `MIRROR_API_SECRET` | No | API secret for auth (if set, auth required) |
| `LOG_CONTENT` | No | Enable content logging (default: false) |

## Production Deployment

For internet exposure:

1. Use TLS (Caddy/nginx reverse proxy)
2. Set `MIRROR_API_SECRET` for auth
3. Consider Cloudflare Tunnel or Tailscale Funnel
4. Never expose plain HTTP

## Fail-Closed Guarantee

If **anything** fails:
- Model timeout → Safe fallback
- Model error → Safe fallback  
- Filter error → Safe fallback
- Auth failure → 401 (no response)

Raw model output **never** reaches the user on error.
