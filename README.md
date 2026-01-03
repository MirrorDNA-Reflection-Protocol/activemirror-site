# Active Mirror

**Sovereign AI that reflects, not directs.**

Active Mirror is a reflective thinking tool — an AI that helps you think more clearly by asking questions, never by giving answers.

🌐 **Live Demo**: [activemirror.ai/mirror](https://activemirror.ai/mirror/)

## What Makes It Different

| Traditional AI | Active Mirror |
|---------------|---------------|
| Gives advice | Asks questions |
| States facts | Prompts reflection |
| Makes decisions | Clarifies thinking |
| Stores data | Ephemeral sessions |
| Cloud-only | Sovereign Mode available |

## Two Modes

### ☁️ Cloud Reflection
- Powered by Llama 3.3-70B via Groq
- Instant responses
- Routed through safety proxy

### 🧠 Sovereign Mode
- 100% local using WebLLM (Qwen 2.5 1.5B)
- Runs entirely in your browser
- No data leaves your device
- ~900MB one-time download

## Safety Architecture

Active Mirror implements defense-in-depth:

1. **Consent Gate** — Must accept terms every visit
2. **Pre-Inference Gates** — Crisis, illegal, domain detection before AI runs
3. **Model Constraints** — System prompt enforces question-only responses
4. **Post-Inference Validation** — 35+ forbidden patterns caught
5. **Two-Pass Rewrite** — Non-compliant output automatically rewritten
6. **Fail-Closed** — Any failure returns safe fallback, never raw output

See [Safety Proxy README](./safety_proxy/README.md) for full architecture.

## Repository Structure

```
activemirror-site/
├── src/                    # React app (Home, Terms, Privacy pages)
├── public/
│   └── mirror/             # Standalone mirror demo (WebLLM + Groq)
├── safety_proxy/           # Python proxy server (Cloud Mode safety)
├── dist/                   # Production build (deployed to GitHub Pages)
└── _legacy_backup/         # Archived old static site
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run safety proxy locally
npm run proxy
```

## Production Deployment

- **Frontend**: GitHub Pages (auto-deploys from `main` branch)
- **Safety Proxy**: Mac Mini via Cloudflare Tunnel (`proxy.activemirror.ai`)
- **Domain**: activemirror.ai (Cloudflare DNS)

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion
- **Local AI**: WebLLM (Qwen 2.5 1.5B, ~900MB)
- **Cloud AI**: Groq API (Llama 3.3 70B)
- **Safety Proxy**: Python FastAPI
- **Infrastructure**: GitHub Pages, Cloudflare Tunnel

## Legal

- **Terms of Service**: [activemirror.ai/terms](https://activemirror.ai/terms)
- **Privacy Policy**: [activemirror.ai/privacy](https://activemirror.ai/privacy)

This is NOT a therapist, doctor, lawyer, or advisor. It's an experimental tool for structured thinking.

## License

MIT License — N1 Intelligence (OPC) Pvt Ltd

---

⟡ Built with the [MirrorDNA Protocol](https://github.com/MirrorDNA-Reflection-Protocol)
