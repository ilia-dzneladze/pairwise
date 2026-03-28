import json
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from agents import (
    ProfileStructurer,
    CompatibilityAnalyzer,
    ContextCalibrator,
    ImpactProjector,
    DecisionSynthesizer,
)
from models.leader import LeaderRaw, LeaderProfile
from models.scenario import ScenarioInput, Scenario
from models.compatibility import CompatibilityReport
from models.recommendation import FullAnalysis

LEADERS_PATH = Path(__file__).parent.parent / "data" / "leaders.json"

app = FastAPI(
    title="PairWise",
    description="Multi-agent decision intelligence for leadership pairing analysis — BMW Digital Excellence Hub Hackathon 2026",
    version="0.1.0",
)

# Allow Lovable frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agents once at startup
profile_structurer = ProfileStructurer()
compatibility_analyzer = CompatibilityAnalyzer()
context_calibrator = ContextCalibrator()
impact_projector = ImpactProjector()
decision_synthesizer = DecisionSynthesizer()


def _load_leaders() -> list[dict]:
    with open(LEADERS_PATH) as f:
        return json.load(f)


def _get_leader_raw(leader_id: str) -> LeaderRaw:
    leaders = _load_leaders()
    for leader in leaders:
        if leader["id"] == leader_id:
            return LeaderRaw(**leader)
    raise HTTPException(status_code=404, detail=f"Leader '{leader_id}' not found")


# ──────────────────────────────────────────────
# Leader endpoints
# ──────────────────────────────────────────────


@app.get("/leaders", tags=["Leaders"])
def list_leaders():
    """List all available synthetic leaders (id, name, role)."""
    leaders = _load_leaders()
    return [{"id": l["id"], "name": l["name"], "role": l["role"]} for l in leaders]


@app.get("/leaders/{leader_id}", tags=["Leaders"])
def get_leader(leader_id: str):
    """Get a specific leader's full raw bio."""
    leader = _get_leader_raw(leader_id)
    return leader.model_dump()


# ──────────────────────────────────────────────
# Agent endpoints (individual)
# ──────────────────────────────────────────────


class ProfileRequest(BaseModel):
    leader_id: str


@app.post("/profile", tags=["Agents"], response_model=LeaderProfile)
def run_profile_structurer(request: ProfileRequest):
    """Run Agent 1: Profile Structurer on a single leader."""
    leader = _get_leader_raw(request.leader_id)
    return profile_structurer.run(leader)


class CompatibilityRequest(BaseModel):
    leader_a_id: str
    leader_b_id: str


@app.post("/compatibility", tags=["Agents"], response_model=CompatibilityReport)
def run_compatibility_analyzer(request: CompatibilityRequest):
    """Run Agents 1+2: Profile both leaders, then analyze compatibility."""
    leader_a = _get_leader_raw(request.leader_a_id)
    leader_b = _get_leader_raw(request.leader_b_id)

    profile_a = profile_structurer.run(leader_a)
    profile_b = profile_structurer.run(leader_b)

    return compatibility_analyzer.run(profile_a, profile_b)


# ──────────────────────────────────────────────
# Scenario endpoints
# ──────────────────────────────────────────────


@app.get("/scenarios", tags=["Scenarios"])
def list_scenarios():
    """List all preset business scenarios."""
    presets = context_calibrator.get_presets()
    return [
        {"id": s.id, "name": s.name, "description": s.description}
        for s in presets
    ]


# ──────────────────────────────────────────────
# Full pipeline endpoint
# ──────────────────────────────────────────────


class AnalyzeRequest(BaseModel):
    leader_a_id: str
    leader_b_id: str
    scenario: ScenarioInput


@app.post("/analyze", tags=["Pipeline"], response_model=FullAnalysis)
def run_full_pipeline(request: AnalyzeRequest):
    """Run the full 5-agent pipeline: profile → compatibility → context → impact → recommendation."""

    # Agent 1: Profile both leaders
    leader_a = _get_leader_raw(request.leader_a_id)
    leader_b = _get_leader_raw(request.leader_b_id)
    profile_a = profile_structurer.run(leader_a)
    profile_b = profile_structurer.run(leader_b)

    # Agent 2: Compatibility analysis
    compatibility = compatibility_analyzer.run(profile_a, profile_b)

    # Agent 3: Context calibration
    scenario = context_calibrator.run(request.scenario)

    # Agent 4: Impact projection
    impact = impact_projector.run(compatibility, scenario)

    # Agent 5: Decision synthesis
    recommendation = decision_synthesizer.run(compatibility, scenario, impact)

    return FullAnalysis(
        leader_a_name=profile_a.name,
        leader_b_name=profile_b.name,
        scenario_name=scenario.name,
        compatibility=compatibility.model_dump(),
        impact=impact.model_dump(),
        recommendation=recommendation.model_dump(),
    )


# ──────────────────────────────────────────────
# Health check
# ──────────────────────────────────────────────


@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok", "agents": 5, "leaders": len(_load_leaders())}


# ──────────────────────────────────────────────
# Serve frontend (production build)
# ──────────────────────────────────────────────

FRONTEND_DIST = Path(__file__).parent.parent / "frontend" / "dist"

if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_frontend(full_path: str):
        return FileResponse(FRONTEND_DIST / "index.html")
