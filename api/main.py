import json
import uuid
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


def _save_leaders(leaders: list[dict]) -> None:
    with open(LEADERS_PATH, "w") as f:
        json.dump(leaders, f, indent=2)


def _get_leader_raw(leader_id: str) -> LeaderRaw:
    leaders = _load_leaders()
    for leader in leaders:
        if leader["id"] == leader_id:
            return LeaderRaw(**leader)
    raise HTTPException(status_code=404, detail=f"Leader '{leader_id}' not found")


def _resolve_leader(leader_input: "LeaderInput") -> LeaderRaw:
    """Resolve a LeaderInput to a LeaderRaw — either by ID lookup or inline raw data."""
    if leader_input.raw:
        return leader_input.raw
    if leader_input.leader_id:
        return _get_leader_raw(leader_input.leader_id)
    raise HTTPException(status_code=400, detail="Provide either leader_id or raw (name, role, bio)")


# ──────────────────────────────────────────────
# Shared input types
# ──────────────────────────────────────────────


class NewLeaderRequest(BaseModel):
    name: str
    role: str
    bio: str


class LeaderInput(BaseModel):
    """Accepts either an existing leader_id OR inline raw text (name + role + bio)."""
    leader_id: str | None = None
    raw: LeaderRaw | None = None


# ──────────────────────────────────────────────
# Leader endpoints
# ──────────────────────────────────────────────


@app.get("/leaders", tags=["Leaders"])
def list_leaders():
    """List all available leaders (id, name, role)."""
    leaders = _load_leaders()
    return [{"id": l["id"], "name": l["name"], "role": l["role"]} for l in leaders]


@app.post("/leaders", tags=["Leaders"], status_code=201)
def create_leader(request: NewLeaderRequest):
    """Register a new leader from unstructured bio text. Returns the new leader with its generated ID."""
    leaders = _load_leaders()
    new_id = f"leader-{uuid.uuid4().hex[:8]}"
    new_leader = {"id": new_id, "name": request.name, "role": request.role, "bio": request.bio}
    leaders.append(new_leader)
    _save_leaders(leaders)
    return new_leader


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
    leader_a: LeaderInput
    leader_b: LeaderInput
    scenario: ScenarioInput


class QuickAnalyzeRequest(BaseModel):
    leader_a_id: str
    leader_b_id: str
    preset_id: str


@app.post("/analyze/quick", tags=["Pipeline"], response_model=FullAnalysis)
def run_quick_analysis(request: QuickAnalyzeRequest):
    """Simplified pipeline: pass two leader IDs + a preset_id.
    Use GET /scenarios to get valid preset IDs."""
    return run_full_pipeline(AnalyzeRequest(
        leader_a=LeaderInput(leader_id=request.leader_a_id),
        leader_b=LeaderInput(leader_id=request.leader_b_id),
        scenario=ScenarioInput(preset_id=request.preset_id),
    ))


@app.post("/analyze", tags=["Pipeline"], response_model=FullAnalysis)
def run_full_pipeline(request: AnalyzeRequest):
    """Run the full 5-agent pipeline. Each leader can be an existing ID or inline raw text."""
    leader_a = _resolve_leader(request.leader_a)
    leader_b = _resolve_leader(request.leader_b)

    if leader_a.id == leader_b.id:
        raise HTTPException(status_code=400, detail="leader_a and leader_b must be different")

    profile_a = profile_structurer.run(leader_a)
    profile_b = profile_structurer.run(leader_b)
    compatibility = compatibility_analyzer.run(profile_a, profile_b)
    scenario = context_calibrator.run(request.scenario)
    impact = impact_projector.run(compatibility, scenario)
    recommendation = decision_synthesizer.run(compatibility, scenario, impact)

    return FullAnalysis(
        leader_a_name=profile_a.name,
        leader_b_name=profile_b.name,
        leader_a_role=profile_a.role,
        leader_b_role=profile_b.role,
        leader_a_bio=profile_a.bio_summary,
        leader_b_bio=profile_b.bio_summary,
        scenario_name=scenario.name,
        compatibility=compatibility,
        impact=impact,
        recommendation=recommendation,
    )


@app.post("/analyze/stream", tags=["Pipeline"])
def stream_analysis(request: AnalyzeRequest):
    """Full pipeline with SSE progress updates. Supports inline raw leaders."""

    def generate():
        def emit(step: int, message: str) -> str:
            return f"data: {json.dumps({'step': step, 'total': 6, 'message': message})}\n\n"

        try:
            leader_a = _resolve_leader(request.leader_a)
            leader_b = _resolve_leader(request.leader_b)
        except HTTPException as e:
            yield f"data: {json.dumps({'error': e.detail})}\n\n"
            return

        if leader_a.id == leader_b.id:
            yield f"data: {json.dumps({'error': 'leader_a and leader_b must be different'})}\n\n"
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
            leader_a_role=profile_a.role,
            leader_b_role=profile_b.role,
            leader_a_bio=profile_a.bio_summary,
            leader_b_bio=profile_b.bio_summary,
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
