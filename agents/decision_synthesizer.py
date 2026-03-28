from .base import BaseAgent
from models.compatibility import CompatibilityReport
from models.scenario import Scenario
from models.recommendation import (
    Recommendation,
    ImpactProjection,
    Verdict,
    Mitigation,
)

SYSTEM_PROMPT = """You are a senior leadership decision advisor. Given all upstream analysis
(compatibility report, scenario context, and impact projections), synthesize a final recommendation.

Your output must include:
1. verdict: "strong_pair", "proceed_with_caution", or "high_risk"
2. headline: One punchy sentence summarizing the pairing (e.g., "Complementary operators with a communication blind spot")
3. strengths: Top 2-3 strengths of this pairing (short strings)
4. concerns: Top 2-3 concerns (short strings)
5. mitigations: For each concern, a specific actionable suggestion with expected effect
6. alternative_suggestion: If verdict is "high_risk", suggest what kind of leader would pair better with one of them. Null if verdict is not high_risk.

Be specific and actionable. Reference the actual trait scores and scenario context.
Avoid generic advice — every recommendation should be traceable to the data.

Respond in JSON:
{
  "verdict": "strong_pair" | "proceed_with_caution" | "high_risk",
  "headline": "<string>",
  "strengths": ["<string>", ...],
  "concerns": ["<string>", ...],
  "mitigations": [
    {"friction_area": "<string>", "suggestion": "<string>", "expected_effect": "<string>"}
  ],
  "alternative_suggestion": "<string>" | null
}"""


class DecisionSynthesizer(BaseAgent):
    """Agent 5: Synthesizes all upstream data into a final recommendation."""

    def run(
        self,
        compatibility: CompatibilityReport,
        scenario: Scenario,
        impact: ImpactProjection,
    ) -> Recommendation:
        dimensions_text = "\n".join(
            f"- {d.dimension}: {d.interaction.value} (delta={d.delta}) — {d.reasoning}"
            for d in compatibility.dimensions
        )

        impact_text = (
            f"- Execution speed: {impact.execution_speed.score}/100 ({impact.execution_speed.confidence}) — {impact.execution_speed.reasoning}\n"
            f"- Team morale: {impact.team_morale.score}/100 ({impact.team_morale.confidence}) — {impact.team_morale.reasoning}\n"
            f"- Innovation rate: {impact.innovation_rate.score}/100 ({impact.innovation_rate.confidence}) — {impact.innovation_rate.reasoning}\n"
            f"- Quality control: {impact.quality_control.score}/100 ({impact.quality_control.confidence}) — {impact.quality_control.reasoning}"
        )

        user_prompt = f"""Synthesize a final recommendation for this leadership pairing:

PAIRING: {compatibility.leader_a_name} + {compatibility.leader_b_name}
Overall compatibility: {compatibility.overall_score}/100
Assessment: {compatibility.overall_assessment}

COMPATIBILITY DETAILS:
{dimensions_text}

SCENARIO: {scenario.name}
{scenario.description}

PROJECTED BUSINESS IMPACT:
{impact_text}

Provide your final recommendation."""

        result = self._call_llm_json(SYSTEM_PROMPT, user_prompt, max_tokens=800)

        mitigations = [Mitigation(**m) for m in result.get("mitigations", [])]

        return Recommendation(
            verdict=Verdict(result["verdict"]),
            headline=result["headline"],
            strengths=result["strengths"],
            concerns=result["concerns"],
            mitigations=mitigations,
            alternative_suggestion=result.get("alternative_suggestion"),
        )
