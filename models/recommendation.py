from __future__ import annotations

from pydantic import BaseModel, Field
from enum import Enum

from models.compatibility import CompatibilityReport


class Verdict(str, Enum):
    STRONG_PAIR = "strong_pair"
    PROCEED_WITH_CAUTION = "proceed_with_caution"
    HIGH_RISK = "high_risk"


class ImpactScore(BaseModel):
    """Predicted impact on a single business dimension."""
    dimension: str
    score: float = Field(..., ge=0, le=100)
    confidence: str = Field(..., description="low / medium / high")
    reasoning: str


class ImpactProjection(BaseModel):
    """Business outcome predictions — output of Impact Projector."""
    execution_speed: ImpactScore
    team_morale: ImpactScore
    innovation_rate: ImpactScore
    quality_control: ImpactScore


class Mitigation(BaseModel):
    """A specific suggestion to address a friction point."""
    friction_area: str
    suggestion: str
    expected_effect: str
    score_increase: int = Field(0, description="Potential synergy points gained by enacting this mitigation (e.g. 5)")


class Recommendation(BaseModel):
    """Final synthesized recommendation — output of Decision Synthesizer."""
    verdict: Verdict
    headline: str = Field(..., description="One-line summary of the pairing")
    strengths: list[str] = Field(..., max_length=3)
    concerns: list[str] = Field(..., max_length=3)
    mitigations: list[Mitigation]
    alternative_suggestion: str | None = Field(
        None, description="Suggested alternative pairing if score is low"
    )


class FullAnalysis(BaseModel):
    """Complete pipeline output — everything the frontend needs."""
    leader_a_name: str
    leader_b_name: str
    leader_a_role: str = ""
    leader_b_role: str = ""
    leader_a_bio: str = ""
    leader_b_bio: str = ""
    scenario_name: str
    compatibility: CompatibilityReport
    impact: ImpactProjection
    recommendation: Recommendation
