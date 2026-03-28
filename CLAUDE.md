# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

PairWise is a multi-agent AI system that analyzes leadership pairings — predicting synergies, friction, and business impact. Built for the BMW Digital Excellence Hub Hackathon 2026.

## Commands

```bash
# Backend
pip install -r requirements.txt
uvicorn api.main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend && npm install && npm run dev   # http://localhost:5173, proxies API to :8000

# Health check
curl http://localhost:8000/health

# API docs
open http://localhost:8000/docs
```

There is no test suite yet (`tests/` is empty). If adding tests, use pytest.

## Architecture

**5-agent sequential pipeline**, all powered by Groq (`llama-3.3-70b-versatile`):

```
Leader A Bio ─┐                              Scenario Input
Leader B Bio ─┤                                    │
              ▼                                    ▼
     1. ProfileStructurer              3. ContextCalibrator
        (bio → trait scores)              (scenario → trait weights)
              │                                    │
              ▼                                    │
     2. CompatibilityAnalyzer                      │
        (two profiles → pairwise                   │
         synergy/friction report)                  │
              │                                    │
              └──────────────┬─────────────────────┘
                             ▼
                    4. ImpactProjector
                       (compatibility × weights → business outcome scores)
                             │
                             ▼
                    5. DecisionSynthesizer
                       (verdict + mitigations + alternative suggestion)
```

**Key design decisions:**
- All agents inherit from `BaseAgent` (`agents/base.py`) which initializes the Groq client and provides `_call_llm()` (text) and `_call_llm_json()` (structured JSON with retry) methods.
- Agent 2 uses a `COMPATIBILITY_MATRIX` dict that defines whether each trait dimension favors similarity or complementarity between leaders.
- Agent 3 loads preset scenarios from `data/scenarios.json` or uses LLM to generate weights for custom scenario descriptions.
- Agent 4 applies scenario `TraitWeights` (0.1–3.0 multipliers) to modulate compatibility scores into four business impact dimensions: execution_speed, team_morale, innovation_rate, quality_control.
- All agents are instantiated once at FastAPI startup in `api/main.py`.

**5 trait dimensions** scored 1–10 per leader: `decision_style`, `risk_appetite`, `communication_mode`, `execution_pace`, `change_orientation`.

**3 preset scenarios:** `post-merger`, `crisis-turnaround`, `steady-state` (stored in `data/scenarios.json`).

## Data Layer

No database. Leaders stored in `data/leaders.json` (8 synthetic BMW leader profiles). New leaders added via `POST /leaders` are appended at runtime (not persisted to disk). Scenarios in `data/scenarios.json`.

## Frontend

React 19 + Vite + TypeScript in `frontend/`. The API client (`frontend/src/api.ts`) respects `VITE_API_URL` env var. The dev server proxies `/` requests to `localhost:8000` via `vite.config.ts`. PDF/DOCX parsing uses `pdfjs-dist` and `mammoth` in `frontend/src/parseFile.ts`.

## Deployment

- **Backend**: Render.com — config in `render.yaml`, start command: `uvicorn api.main:app --host 0.0.0.0 --port $PORT`
- **Frontend**: Vercel — config in `frontend/vercel.json`, production API URL in `frontend/.env.production`
- CORS is open (`*`)

## Environment Variables

- `GROQ_API_KEY` (required) — Groq API key, loaded from `.env` by `config/settings.py`
- `GROQ_MODEL` — defaults to `llama-3.3-70b-versatile`
- `VITE_API_URL` — frontend only, base URL for API calls (empty in dev = relative URLs via proxy)
