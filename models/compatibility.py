from pydantic import BaseModel, Field
from enum import Enum


class InteractionType(str, Enum):
    SYNERGY = "synergy"
    NEUTRAL = "neutral"
    FRICTION = "friction"


class DimensionCompatibility(BaseModel):
    """Compatibility analysis for a single trait dimension."""
    dimension: str
    score_a: float
    score_b: float
    delta: float = Field(..., description="Absolute difference between scores")
    interaction: InteractionType
    reasoning: str = Field(..., description="Why this pairing is synergistic or problematic")


class CompatibilityReport(BaseModel):
    """Full pairwise compatibility analysis — output of Compatibility Analyzer."""
    leader_a_id: str
    leader_b_id: str
    leader_a_name: str
    leader_b_name: str
    dimensions: list[DimensionCompatibility]
    overall_score: float = Field(..., ge=0, le=100, description="Weighted compatibility 0-100")
    overall_assessment: str = Field(..., description="2-3 sentence summary of the pairing")
