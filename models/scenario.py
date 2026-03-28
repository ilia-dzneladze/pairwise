from pydantic import BaseModel, Field


class TraitWeights(BaseModel):
    """Weight multipliers for each trait dimension in a given context."""
    decision_style: float = Field(1.0, ge=0.1, le=3.0)
    risk_appetite: float = Field(1.0, ge=0.1, le=3.0)
    communication_mode: float = Field(1.0, ge=0.1, le=3.0)
    execution_pace: float = Field(1.0, ge=0.1, le=3.0)
    change_orientation: float = Field(1.0, ge=0.1, le=3.0)


class Scenario(BaseModel):
    """A business scenario that shifts trait importance."""
    id: str
    name: str
    description: str
    weights: TraitWeights
    rationale: str = Field(..., description="Why these weights matter for this scenario")


class ScenarioInput(BaseModel):
    """User-provided scenario — can be a preset ID or free text."""
    preset_id: str | None = None
    custom_description: str | None = None
