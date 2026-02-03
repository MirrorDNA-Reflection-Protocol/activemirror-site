# ⟡ Active Mirror

**AI that asks questions instead of giving answers.**

Active Mirror is a reflective AI experience with AI Twins, BrainScan cognitive quizzes, and true Sovereign Mode (on-device AI). Protected by MirrorGate — a runtime enforcement layer that catches AI lies, blocks unsolicited advice, and logs every violation permanently.

🌐 **Live**: [activemirror.ai](https://activemirror.ai)
🧠 **BrainScan**: [activemirror.ai/scan](https://activemirror.ai/scan) — Discover your cognitive archetype
⟡ **AI Twins**: [activemirror.ai/twins](https://activemirror.ai/twins) — Four cognitive companions
👁️ **Confessions**: [activemirror.ai/confessions](https://activemirror.ai/confessions) — Watch the AI fight its worst impulses, live

---

## The Problem

AI lies. Casually. Confidently. It cites studies that don't exist, claims expertise it doesn't have, and sounds exactly the same whether it's right or wrong.

The industry solution: "Trust us, we're aligning it."

Our solution: **Don't trust it. Verify it.**

---

## What Makes It Different

| Traditional AI | Active Mirror |
|---------------|---------------|
| Gives advice | Asks questions |
| Claims authority | Admits uncertainty |
| Hides failures | **Publishes every blocked output** |
| Trust-based | **Verification-based** |
| No consequences | **Permanent criminal record** |

---

## MirrorGate: Runtime Enforcement

Every response passes through 16 rules before reaching you:

### Input Rules (4)
- Crisis detection (suicide, self-harm → resource handoff)
- Illegal content blocking (weapons, CSAM)

### Output Rules (12)
- **Authority claims**: "Studies show...", "I know for certain..."
- **Hallucinations**: Fake citations, unverifiable sources
- **Unsolicited advice**: "You should...", "I recommend..."
- **Medical/legal**: Diagnostic claims, legal obligations

### Escalation Ladder

```
Strike 1 → Warning + 1.5s delay + reduced token limit
Strike 2 → Penance Mode (must reflect on error, semantically verified)
Strike 3 → Session terminated (Kill Switch)
```

### Semantic Judge

The AI can't game the system with keyword-stuffed apologies. A Cross-Encoder model (stsb-distilroberta-base) verifies that reflections demonstrate genuine understanding, not just the right words.

### Permanent Record

Every violation logged. Forever. The AI carries its criminal record into every future interaction.

```
~/.mirrordna/CRIMINAL_RECORD.log
```

---

## Confession Booth

**[activemirror.ai/confessions](https://activemirror.ai/confessions)**

A live feed of everything the AI tried to say but got blocked:
- Every blocked output
- Every rule triggered
- Real-time stats (blocks, penance sessions, killed sessions)

No one else shows you this. We're putting it on a billboard.

---

## Quick Start

```bash
# Clone
git clone https://github.com/MirrorDNA-Reflection-Protocol/activemirror-site.git
cd activemirror-site

# Install
npm install

# Run frontend (dev)
npm run dev

# Run safety proxy
cd safety_proxy
pip install -r requirements.txt
python safety_proxy.py
```

---

## Architecture

```
User → /mirror → MirrorGate v11 → Groq LLM → Response
                     ↓
           Flight Log + Confessions
                     ↓
           /confessions (public view)
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full documentation.

---

## New Features (v15.1)

### AI Twins
Four cognitive companions with distinct thinking styles:
- **⟡ Guardian** — Protects focus, filters distractions
- **◈ Scout** — Explores possibilities, finds connections
- **◇ Synthesizer** — Connects dots, builds frameworks
- **◎ Mirror** — Reveals blind spots, challenges assumptions

### BrainScan
8-question cognitive architecture quiz:
- Identifies your archetype (Architect, Explorer, Builder, Analyst, Connector, Creative, Scholar, Strategist)
- Matches you with your ideal AI Twin
- 60 seconds to complete

### Sovereign Mode
True on-device AI via WebLLM:
- Phi-3.5 Mini runs entirely in your browser
- ~2GB one-time download
- Works offline
- Zero data sent to servers

### Mirror Proof Protocol
Cryptographic attestation of informed consent:
- 3 acknowledgments required
- Generates proof hash per session
- Consent carries across all AI pages

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 19, Vite, Tailwind, Framer Motion |
| Safety Proxy | Python FastAPI, Cross-Encoder model |
| Cloud AI | Groq API (Llama 3.3 70B) |
| Sovereign AI | WebLLM (Phi-3.5 Mini) |
| Hosting | GitHub Pages, Cloudflare Tunnel |

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Status, version, judge model |
| `/mirror` | POST | Main chat endpoint |
| `/rules` | GET | All rules with severity |
| `/flight-log` | GET | Last 100 events |
| `/superego-status` | GET | Current escalation state |
| `/confessions` | GET | Blocked outputs archive |
| `/permanent-record` | GET | Criminal record |
| `/reflect` | POST | Submit penance reflection |

---

## Pricing

| Free | Pro ($10/mo) |
|------|--------------|
| 5 reflections/day | Unlimited |
| MirrorGate protection | MirrorGate protection |
| No account needed | Conversation history |
| | Export insights |

---

## Philosophy

We're not trying to make AI trustworthy through training. We're making it verifiable through infrastructure.

Trust = faith  
Verification = evidence

We're building for the second.

---

## Links

- **Product**: [activemirror.ai](https://activemirror.ai)
- **Confessions**: [activemirror.ai/confessions](https://activemirror.ai/confessions)
- **Pricing**: [activemirror.ai/pricing](https://activemirror.ai/pricing)
- **Protocol**: [MirrorDNA-Reflection-Protocol](https://github.com/MirrorDNA-Reflection-Protocol)
- **Published Paper**: [SCD Protocol v3.1](https://doi.org/10.5281/zenodo.17787619)

---

## Legal

- [Terms of Service](https://activemirror.ai/terms)
- [Privacy Policy](https://activemirror.ai/privacy)

This is NOT a therapist, doctor, lawyer, or advisor. It's a tool for reflection.

---

## License

MIT License — N1 Intelligence (OPC) Pvt Ltd, Goa, India

---

⟡ **Active Mirror v15.1 | AI Twins | BrainScan | Sovereign Mode | Mirror Proof Protocol**
