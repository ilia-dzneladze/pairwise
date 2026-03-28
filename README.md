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
| GET | `/leaders` | List all synthetic leader profiles |
| GET | `/leaders/{id}` | Get a specific leader's raw bio |
| GET | `/leaders/{id}/profile` | Get structured trait scores for a single leader |
| POST | `/profile` | Run Profile Structurer on a single leader (POST alternative) |
| POST | `/compatibility` | Analyze compatibility between two leaders |
| GET | `/scenarios` | List available business scenarios |
| POST | `/analyze/quick` | **Recommended** — full pipeline with a simple preset ID |
| POST | `/analyze` | Full pipeline with full ScenarioInput (supports custom scenarios) |
| POST | `/analyze/stream` | Full pipeline with SSE progress events |
| GET | `/health` | Health check |

### Request / Response examples

**GET `/leaders/leader-01/profile`** — no body needed

**POST `/profile`**
```json
{ "leader_id": "leader-01" }
```

**POST `/compatibility`**
```json
{ "leader_a_id": "leader-01", "leader_b_id": "leader-03" }
```

**POST `/analyze/quick`** ← simplest way to run the full pipeline
```json
{
  "leader_a_id": "leader-01",
  "leader_b_id": "leader-03",
  "preset_id": "post-merger"
}
```

**POST `/analyze`** — use this for custom scenarios
```json
{
  "leader_a_id": "leader-01",
  "leader_b_id": "leader-03",
  "scenario": { "preset_id": "post-merger" }
}
```
Or with a custom scenario instead of a preset:
```json
{
  "leader_a_id": "leader-01",
  "leader_b_id": "leader-03",
  "scenario": { "custom_description": "Rapid international expansion into Southeast Asia" }
}
```

**POST `/analyze/stream`** — same body as `/analyze`, returns SSE events:
```
data: {"step": 1, "total": 6, "message": "Profiling Dr. Katarina Vogel..."}
data: {"step": 2, "total": 6, "message": "Profiling Sarah Chen..."}
...
data: {"step": 6, "total": 6, "message": "Complete", "result": { ...full FullAnalysis... }}
```

### Valid preset IDs

Fetch the full list from `GET /scenarios`. Current presets:

| ID | Name |
|----|------|
| `post-merger` | Post-Merger Integration |
| `crisis-turnaround` | Crisis Turnaround |
| `steady-state` | Steady-State Operations |

---

## Building the Lovable Frontend

The Lovable UI connects to the **deployed Render backend**. You do not need to run anything locally.

### Base URL

All API calls should use the deployed backend URL as the base:

```
API_BASE_URL = https://pairwise-l3kn.onrender.com
```

### Available Leaders

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

Alternatively, fetch them dynamically from `GET /leaders`.

### Suggested UI Flow

1. **Pick two leaders** — fetch from `GET /leaders` or use the hardcoded table above
2. **Pick a scenario** — fetch from `GET /scenarios` (IDs: `post-merger`, `crisis-turnaround`, `steady-state`)
3. **Run analysis** — `POST /analyze/quick` with the two leader IDs + preset ID
4. **Show the result** — compatibility score + per-dimension breakdown, impact scores for execution/morale/innovation/quality, verdict (`strong_pair` / `proceed_with_caution` / `high_risk`), headline, strengths, concerns, mitigations
5. **Optional: stream progress** — use `POST /analyze/stream` (SSE) to show a live step-by-step loading indicator as each of the 6 agent steps completes

### CORS

The backend allows all origins (`*`) so Lovable can call it directly from the browser without any proxy.

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
