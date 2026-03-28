# PairWise — Multi-Agent Leadership Pairing Intelligence

**BMW Digital Excellence Hub Hackathon 2026**

> *Leaders don't operate in isolation. PairWise models how leadership combinations impact business outcomes.*

A multi-agent AI system that goes beyond evaluating leaders individually. PairWise analyzes *pairings* — predicting synergies, friction points, and downstream effects on execution speed, team morale, innovation, and quality, all calibrated to the business scenario at hand.

## Architecture

```
┌─────────────────┐   ┌─────────────────┐
│  Leader A Bio   │   │  Leader B Bio   │
└────────┬────────┘   └────────┬────────┘
         │                     │
         ▼                     ▼
┌─────────────────────────────────────────┐
│         Agent 1: Profile Structurer     │
│   Raw text → structured trait scores    │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│      Agent 2: Compatibility Analyzer    │
│   Two profiles → pairwise deltas +      │
│   synergy/friction per dimension        │
└────────────────────┬────────────────────┘
                     │
      ┌──────────────┤
      ▼              ▼
┌───────────┐  ┌─────────────────────────┐
│ Scenario  │  │ Agent 4: Impact         │
│  Input    │→ │ Projector               │
│           │  │ Compatibility × weights  │
│ Agent 3:  │  │ → business outcomes     │
│ Context   │  └───────────┬─────────────┘
│ Calibrator│              │
└───────────┘              ▼
                ┌─────────────────────────┐
                │ Agent 5: Decision       │
                │ Synthesizer             │
                │ Verdict + mitigations   │
                └─────────────────────────┘
```

## Tech Stack

- **Backend**: Python 3.11+ / FastAPI — deployed on [Render](https://render.com)
- **LLM**: Groq (`llama-3.3-70b-versatile`)
- **Frontend (Lovable)**: Built separately in Lovable, calls the deployed backend API
- **Frontend (Vite)**: Reference React/Vite app in `frontend/` — deployed on [Vercel](https://vercel.com)
- **Data**: Synthetic leader profiles (JSON)

## Deployment

```
Lovable UI  ──────────────────────────────────────┐
Vercel (frontend/)  ──────────────────────────────┤──► Render (FastAPI backend)
Local dev (npm run dev + uvicorn)  ───────────────┘
```

The backend is a single FastAPI service. All three frontends call the same API endpoints.

---

## Quick Start (Local)

```bash
# 1. Clone and install
git clone <repo-url>
cd pairwise
pip install -r requirements.txt

# 2. Set your Groq API key
cp .env.example .env
# Edit .env and add: GROQ_API_KEY=your_key_here

# 3. Run the backend
uvicorn api.main:app --reload --port 8000

# 4. (Optional) Run the Vite frontend
cd frontend
npm install
npm run dev   # http://localhost:5173
```

API docs available at `http://localhost:8000/docs`

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/leaders` | List all leaders (id, name, role) |
| POST | `/leaders` | Register a new leader from bio/CV text |
| GET | `/leaders/{id}` | Get a specific leader's raw bio |
| GET | `/leaders/{id}/profile` | Get structured trait scores for a single leader |
| POST | `/profile` | Run Profile Structurer on a single leader |
| POST | `/compatibility` | Analyze compatibility between two leaders |
| GET | `/scenarios` | List available business scenarios |
| POST | `/analyze/quick` | Full pipeline — simple form (two IDs + preset ID) |
| POST | `/analyze` | Full pipeline — supports inline raw leaders + custom scenarios |
| POST | `/analyze/stream` | Full pipeline with SSE progress events |
| GET | `/health` | Health check |

### Request examples

**POST `/leaders`** — register a new leader
```json
{ "name": "Jane Smith", "role": "Chief Revenue Officer", "bio": "Full CV or bio text..." }
```

**POST `/analyze/quick`** — simplest pipeline call
```json
{ "leader_a_id": "leader-01", "leader_b_id": "leader-03", "preset_id": "post-merger" }
```

**POST `/analyze/stream`** — streaming pipeline (recommended for frontend)
```json
{
  "leader_a": { "leader_id": "leader-01" },
  "leader_b": { "leader_id": "leader-03" },
  "scenario": { "preset_id": "post-merger" }
}
```
Or with an inline leader (no pre-registration needed):
```json
{
  "leader_a": { "leader_id": "leader-01" },
  "leader_b": { "raw": { "id": "temp-001", "name": "Jane Smith", "role": "CRO", "bio": "..." } },
  "scenario": { "preset_id": "crisis-turnaround" }
}
```
Or with a custom scenario:
```json
{
  "leader_a": { "leader_id": "leader-01" },
  "leader_b": { "leader_id": "leader-03" },
  "scenario": { "custom_description": "Rapid international expansion into Southeast Asia" }
}
```

### Valid preset IDs

| ID | Name |
|----|------|
| `post-merger` | Post-Merger Integration |
| `crisis-turnaround` | Crisis Turnaround |
| `steady-state` | Steady-State Operations |

---

## Building the Lovable Frontend

See **[FRONTEND_BRIEF.md](./FRONTEND_BRIEF.md)** for the full engineer brief including UI flow, response shapes, styling guidance, and error handling.

### Base URL

```
https://pairwise-l3kn.onrender.com
```

CORS is open (`*`) — Lovable can call the backend directly from the browser, no proxy needed.

### Quick reference — Available Leaders

| ID | Name | Role |
|----|------|------|
| `leader-01` | Dr. Katarina Vogel | Chief Technology Officer |
| `leader-02` | Marcus Einhorn | Chief Executive Officer |
| `leader-03` | Sarah Chen | Chief Product Officer |
| `leader-04` | Friedrich Braun | Chief Operating Officer |
| `leader-05` | Amara Osei | Chief Marketing Officer |
| `leader-06` | Henrik Larsson | Chief Financial Officer |
| `leader-07` | Priya Kapoor | Chief People Officer |
| `leader-08` | Thomas Weber | Chief Strategy Officer |

Fetch dynamically from `GET /leaders` — new leaders added via `POST /leaders` will appear here.

---

## Project Structure

```
├── agents/
│   ├── base.py                  # Base agent class + Groq client
│   ├── profile_structurer.py
│   ├── compatibility_analyzer.py
│   ├── context_calibrator.py
│   ├── impact_projector.py
│   └── decision_synthesizer.py
├── models/
│   ├── leader.py                # Pydantic models for leader profiles
│   ├── compatibility.py         # Compatibility report models
│   ├── scenario.py              # Scenario + weight vector models
│   └── recommendation.py        # Final output models
├── data/
│   ├── leaders.json             # Synthetic leader bios
│   └── scenarios.json           # Preset business scenarios
├── api/
│   └── main.py                  # FastAPI app + routes
├── config/
│   └── settings.py              # Environment config
├── frontend/                    # Vite + React reference frontend (Vercel)
│   ├── src/
│   │   ├── api.ts               # API client (respects VITE_API_URL env var)
│   │   └── App.tsx
│   ├── vercel.json
│   └── vite.config.ts           # Dev proxy → localhost:8000
├── render.yaml                  # Render one-click backend deploy config
├── requirements.txt
├── .env.example
└── README.md
```

---

## Judging Criteria Alignment

| Criteria | How We Address It |
|----------|-------------------|
| Business Relevance (30pts) | Directly solves "ignoring how leadership combinations interact" |
| Working Functionality (25pts) | Full pipeline runs end-to-end, not a static demo |
| AI & Agent Quality (20pts) | 5 specialized agents with explicit reasoning chains |
| Technical Implementation (10pts) | Clean architecture, typed models, modular agents |
| User Experience (10pts) | Lovable frontend with real-time scenario toggling |
| Video Clarity (5pts) | Clear demo flow: pick pair -> see analysis -> toggle scenario |
