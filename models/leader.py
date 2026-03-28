from pydantic import BaseModel, Field


class TraitScore(BaseModel):
    """A single leadership trait score with justification."""
    score: float = Field(..., ge=1, le=10, description="Score from 1-10")
    justification: str = Field(..., description="One-sentence explanation from source material")


class LeaderTraits(BaseModel):
    """The five leadership trait dimensions."""
    decision_style: TraitScore = Field(
        ..., description="1=highly directive, 10=highly collaborative"
    )
    risk_appetite: TraitScore = Field(
        ..., description="1=very conservative, 10=very aggressive"
    )
    communication_mode: TraitScore = Field(
        ..., description="1=top-down command, 10=consensus-driven"
    )
    execution_pace: TraitScore = Field(
        ..., description="1=deliberate planner, 10=fast executor"
    )
    change_orientation: TraitScore = Field(
        ..., description="1=stability-focused, 10=transformation-driven"
    )


class LeaderProfile(BaseModel):
    """Structured leader profile — output of Profile Structurer agent."""
    id: str
    name: str
    role: str
    traits: LeaderTraits
    summary: str = Field(..., description="2-3 sentence leadership style summary")


class LeaderRaw(BaseModel):
    """Raw leader data — input to Profile Structurer agent."""
    id: str
    name: str
    role: str
    bio: str = Field(..., description="Unstructured text: bio, achievements, style")
