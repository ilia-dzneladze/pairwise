from .base import BaseAgent
from models.compatibility import CompatibilityReport
from models.scenario import Scenario
from models.recommendation import ImpactProjection, ImpactScore

SYSTEM_PROMPT = """You are a leadership impact analyst. Given a compatibility report between two leaders
and a business scenario with trait weights, predict the impact on four business dimensions.

For each business outcome, provide:
- score (0-100): predicted positive impact. 80+ = excellent, 60-80 = good, 40-60 = mixed, <40 = concerning
- confidence: "low", "medium", or "high"
- reasoning: 1-2 sentences explaining the causal chain from compatibility to outcome

The four business outcomes are:
1. execution_speed — Will this pair deliver on time? (driven by: execution pace compatibility, decision style alignment)
2. team_morale — Will their interaction style create a healthy environment? (driven by: communication mode compatibility, decision style)
3. innovation_rate — Will they enable or suppress new ideas? (driven by: change orientation, risk appetite)
4. quality_control — Will standards be maintained? (driven by: risk appetite, execution pace)

IMPORTANT: Factor in the scenario weights. If execution_pace has a weight of 2.5, its effect on
execution_speed and quality_control should be amplified. If change_orientation has a weight of 0.5,
its effect on innovation_rate should be dampened.

Respond in JSON:
{
  "execution_speed": {"dimension": "Execution speed", "score": <float>, "confidence": "<string>", "reasoning": "<string>"},
  "team_morale": {"dimension": "Team morale", "score": <float>, "confidence": "<string>", "reasoning": "<string>"},
  "innovation_rate": {"dimension": "Innovation rate", "score": <float>, "confidence": "<string>", "reasoning": "<string>"},
  "quality_control": {"dimension": "Quality control", "score": <float>, "confidence": "<string>", "reasoning": "<string>"}
}"""


class ImpactProjector(BaseAgent):
    """Agent 4: Projects compatibility into business outcome predictions."""

    def run(self, compatibility: CompatibilityReport, scenario: Scenario) -> ImpactProjection:
        dimensions_text = "\n".join(
            f"- {d.dimension}: delta={d.delta}, interaction={d.interaction.value}, reasoning={d.reasoning}"
            for d in compatibility.dimensions
        )

        weights = scenario.weights.model_dump()
        weights_text = "\n".join(f"- {k}: {v}x" for k, v in weights.items())

        user_prompt = f"""Predict business outcomes for this leadership pairing:

PAIRING: {compatibility.leader_a_name} + {compatibility.leader_b_name}
Overall compatibility: {compatibility.overall_score}/100
Assessment: {compatibility.overall_assessment}

Dimension-level compatibility:
{dimensions_text}

SCENARIO: {scenario.name}
{scenario.description}

Scenario trait weights (multipliers):
{weights_text}
Rationale: {scenario.rationale}

Predict the impact on all four business dimensions."""

        result = self._call_llm_json(SYSTEM_PROMPT, user_prompt, max_tokens=600)

        return ImpactProjection(
            execution_speed=ImpactScore(**result["execution_speed"]),
            team_morale=ImpactScore(**result["team_morale"]),
            innovation_rate=ImpactScore(**result["innovation_rate"]),
            quality_control=ImpactScore(**result["quality_control"]),
        )
