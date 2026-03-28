import json
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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


@app.get("/leaders/{leader_id}/profile", tags=["Leaders"], response_model=LeaderProfile)
def get_leader_profile(leader_id: str):
    """Run Profile Structurer on a single leader and return structured trait scores."""
    leader = _get_leader_raw(leader_id)
    return profile_structurer.run(leader)


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
    if request.leader_a_id == request.leader_b_id:
        raise HTTPException(status_code=400, detail="leader_a_id and leader_b_id must be different")
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
# Full pipeline endpoints
# ──────────────────────────────────────────────


class AnalyzeRequest(BaseModel):
    leader_a_id: str
    leader_b_id: str
    scenario: ScenarioInput


class QuickAnalyzeRequest(BaseModel):
    leader_a_id: str
    leader_b_id: str
    preset_id: str


@app.post("/analyze/quick", tags=["Pipeline"], response_model=FullAnalysis)
def run_quick_analysis(request: QuickAnalyzeRequest):
    """Simplified pipeline: pass two leader IDs + a preset_id instead of a full ScenarioInput.
    Use GET /scenarios to get valid preset IDs."""
    return run_full_pipeline(AnalyzeRequest(
        leader_a_id=request.leader_a_id,
        leader_b_id=request.leader_b_id,
        scenario=ScenarioInput(preset_id=request.preset_id),
    ))


@app.post("/analyze", tags=["Pipeline"], response_model=FullAnalysis)
def run_full_pipeline(request: AnalyzeRequest):
    """Run the full 5-agent pipeline: profile → compatibility → context → impact → recommendation."""
    if request.leader_a_id == request.leader_b_id:
        raise HTTPException(status_code=400, detail="leader_a_id and leader_b_id must be different")

    leader_a = _get_leader_raw(request.leader_a_id)
    leader_b = _get_leader_raw(request.leader_b_id)
    profile_a = profile_structurer.run(leader_a)
    profile_b = profile_structurer.run(leader_b)
    compatibility = compatibility_analyzer.run(profile_a, profile_b)
    scenario = context_calibrator.run(request.scenario)
    impact = impact_projector.run(compatibility, scenario)
    recommendation = decision_synthesizer.run(compatibility, scenario, impact)

    return FullAnalysis(
        leader_a_name=profile_a.name,
        leader_b_name=profile_b.name,
        scenario_name=scenario.name,
        compatibility=compatibility,
        impact=impact,
        recommendation=recommendation,
    )


@app.post("/analyze/stream", tags=["Pipeline"])
def stream_analysis(request: AnalyzeRequest):
    """Full pipeline with Server-Sent Events progress updates.
    Emits one event per agent step, then a final 'complete' event with the full result."""

    def generate():
        def emit(step: int, message: str) -> str:
            return f"data: {json.dumps({'step': step, 'total': 6, 'message': message})}\n\n"

        if request.leader_a_id == request.leader_b_id:
            yield f"data: {json.dumps({'error': 'leader_a_id and leader_b_id must be different'})}\n\n"
            return

        try:
            leader_a = _get_leader_raw(request.leader_a_id)
        except HTTPException as e:
            yield f"data: {json.dumps({'error': e.detail})}\n\n"
            return

        try:
            leader_b = _get_leader_raw(request.leader_b_id)
        except HTTPException as e:
            yield f"data: {json.dumps({'error': e.detail})}\n\n"
            return

        yield emit(1, f"Profiling {leader_a.name}...")
        profile_a = profile_structurer.run(leader_a)

        yield emit(2, f"Profiling {leader_b.name}...")
        profile_b = profile_structurer.run(leader_b)

        yield emit(3, "Analyzing compatibility...")
        compatibility = compatibility_analyzer.run(profile_a, profile_b)

        yield emit(4, "Calibrating scenario...")
        scenario = context_calibrator.run(request.scenario)

        yield emit(5, "Projecting business impact...")
        impact = impact_projector.run(compatibility, scenario)

        yield emit(6, "Synthesizing recommendation...")
        recommendation = decision_synthesizer.run(compatibility, scenario, impact)

        result = FullAnalysis(
            leader_a_name=profile_a.name,
            leader_b_name=profile_b.name,
            scenario_name=scenario.name,
            compatibility=compatibility,
            impact=impact,
            recommendation=recommendation,
        )
        yield f"data: {json.dumps({'step': 6, 'total': 6, 'message': 'Complete', 'result': result.model_dump()})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


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
