import json
from pathlib import Path

from .base import BaseAgent
from models.scenario import Scenario, ScenarioInput, TraitWeights

SCENARIOS_PATH = Path(__file__).parent.parent / "data" / "scenarios.json"

SYSTEM_PROMPT = """You are a business context analyst. Given a business scenario description,
determine how much each leadership trait dimension matters in that specific context.

Output weight multipliers for each dimension (0.1 to 3.0):
- 1.0 = normal importance
- >1.0 = this dimension matters MORE in this scenario
- <1.0 = this dimension matters LESS in this scenario

Also provide a rationale explaining your weight choices.

Respond in JSON:
{
  "weights": {
    "decision_style": <float>,
    "risk_appetite": <float>,
    "communication_mode": <float>,
    "execution_pace": <float>,
    "change_orientation": <float>
  },
  "rationale": "<string>"
}"""


class ContextCalibrator(BaseAgent):
    """Agent 3: Maps business scenarios to trait weight vectors."""

    def __init__(self):
        super().__init__()
        self._presets = self._load_presets()

    def _load_presets(self) -> dict[str, Scenario]:
        with open(SCENARIOS_PATH) as f:
            data = json.load(f)
        return {
            s["id"]: Scenario(
                id=s["id"],
                name=s["name"],
                description=s["description"],
                weights=TraitWeights(**s["weights"]),
                rationale=s["rationale"],
            )
            for s in data
        }

    def get_presets(self) -> list[Scenario]:
        return list(self._presets.values())

    def save_scenario(self, scenario: Scenario) -> None:
        self._presets[scenario.id] = scenario
        out_data = []
        for s in self._presets.values():
            out_data.append({
                "id": s.id,
                "name": s.name,
                "description": s.description,
                "weights": s.weights.model_dump(),
                "rationale": s.rationale,
            })
        with open(SCENARIOS_PATH, "w") as f:
            json.dump(out_data, f, indent=2)

    def run(self, scenario_input: ScenarioInput) -> Scenario:
        # If a preset is selected, return it directly (no LLM call needed)
        if scenario_input.preset_id and scenario_input.preset_id in self._presets:
            return self._presets[scenario_input.preset_id]

        # For custom scenarios, use the LLM to generate weights
        if not scenario_input.custom_description:
            raise ValueError("Either preset_id or custom_description must be provided")

        user_prompt = f"""Analyze this business scenario and determine trait weight multipliers:

Scenario: {scenario_input.custom_description}

What leadership traits matter most in this context?"""

        result = self._call_llm_json(SYSTEM_PROMPT, user_prompt, max_tokens=400)

        return Scenario(
            id="custom",
            name="Custom Scenario",
            description=scenario_input.custom_description,
            weights=TraitWeights(**result["weights"]),
            rationale=result["rationale"],
        )
