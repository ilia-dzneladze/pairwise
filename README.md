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
│   Two profiles → pairwise deltas +     │
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

- **Backend**: Python 3.11+ / FastAPI
- **LLM**: Groq (llama-3.3-70b-versatile)
- **Frontend**: Lovable (separate repo)
- **Data**: Synthetic leader profiles (JSON)

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd pairwise
pip install -r requirements.txt

# 2. Set your Groq API key
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# 3. Run the server
uvicorn api.main:app --reload --port 8000

# 4. Open API docs
# http://localhost:8000/docs
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/leaders` | List all synthetic leader profiles |
| GET | `/leaders/{id}` | Get a specific leader's raw bio |
| POST | `/profile` | Run Profile Structurer on a leader |
| POST | `/compatibility` | Analyze compatibility between two leaders |
| GET | `/scenarios` | List available business scenarios |
| POST | `/analyze` | Full pipeline: two leaders + scenario → recommendation |

## Project Structure

```
├── agents/
│   ├── base.py              # Base agent class + Groq client
│   ├── profile_structurer.py
│   ├── compatibility_analyzer.py
│   ├── context_calibrator.py
│   ├── impact_projector.py
│   └── decision_synthesizer.py
├── models/
│   ├── leader.py            # Pydantic models for leader profiles
│   ├── compatibility.py     # Compatibility report models
│   ├── scenario.py          # Scenario + weight vector models
│   └── recommendation.py    # Final output models
├── data/
│   ├── leaders.json         # Synthetic leader bios
│   └── scenarios.json       # Preset business scenarios
├── api/
│   └── main.py              # FastAPI app + routes
├── config/
│   └── settings.py          # Environment config
├── tests/
├── requirements.txt
├── .env.example
└── README.md
```

## Judging Criteria Alignment

| Criteria | How We Address It |
|----------|-------------------|
| Business Relevance (30pts) | Directly solves "ignoring how leadership combinations interact" |
| Working Functionality (25pts) | Full pipeline runs end-to-end, not a static demo |
| AI & Agent Quality (20pts) | 5 specialized agents with explicit reasoning chains |
| Technical Implementation (10pts) | Clean architecture, typed models, modular agents |
| User Experience (10pts) | Lovable frontend with real-time scenario toggling |
| Video Clarity (5pts) | Clear demo flow: pick pair → see analysis → toggle scenario |
