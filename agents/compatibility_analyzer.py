from .base import BaseAgent
from models.leader import LeaderProfile
from models.compatibility import CompatibilityReport, DimensionCompatibility, InteractionType

# Defines whether similarity or complementarity is desirable per dimension.
# "similar" = closer scores are better, "complementary" = different scores are better
COMPATIBILITY_MATRIX = {
    "decision_style": "complementary",      # One directive + one collaborative avoids power struggle
    "risk_appetite": "similar",             # Misalignment causes deadlock on key calls
    "communication_mode": "complementary",  # One top-down + one consensus = broader coverage
    "execution_pace": "complementary",      # One fast + one deliberate = balanced pacing
    "change_orientation": "similar",        # Shared vision on stability vs. transformation
}

SYSTEM_PROMPT = """You are a leadership compatibility analyst. Given two leader profiles with trait scores,
analyze their pairwise compatibility on each dimension.

For each of the 5 dimensions, you will receive:
- Both leaders' scores (1-10)
- Whether this dimension favors SIMILARITY or COMPLEMENTARITY

Your job:
1. Compute the delta (absolute difference)
2. Classify the interaction as "synergy", "neutral", or "friction"
   - For SIMILAR dimensions: small delta (<2) = synergy, 2-4 = neutral, >4 = friction
   - For COMPLEMENTARY dimensions: large delta (>4) = synergy, 2-4 = neutral, <2 = friction
3. Write a specific reasoning explaining WHY this interaction helps or hurts

Also compute an overall compatibility score (0-100) and a 2-3 sentence assessment.

Respond in JSON:
{
  "dimensions": [
    {
      "dimension": "<name>",
      "score_a": <float>,
      "score_b": <float>,
      "delta": <float>,
      "interaction": "synergy" | "neutral" | "friction",
      "reasoning": "<string>"
    }
  ],
  "overall_score": <float>,
  "overall_assessment": "<string>"
}"""


class CompatibilityAnalyzer(BaseAgent):
    """Agent 2: Analyzes pairwise leadership compatibility."""

    def run(self, profile_a: LeaderProfile, profile_b: LeaderProfile) -> CompatibilityReport:
        traits_a = profile_a.traits.model_dump()
        traits_b = profile_b.traits.model_dump()

        dimensions_text = ""
        for dim_name, preference in COMPATIBILITY_MATRIX.items():
            score_a = traits_a[dim_name]["score"]
            score_b = traits_b[dim_name]["score"]
            dimensions_text += (
                f"\n- {dim_name}: {profile_a.name} = {score_a}, {profile_b.name} = {score_b} "
                f"(favors {preference})"
            )

        user_prompt = f"""Analyze compatibility between these two leaders:

LEADER A: {profile_a.name} — {profile_a.role}
Style summary: {profile_a.summary}

LEADER B: {profile_b.name} — {profile_b.role}
Style summary: {profile_b.summary}

Trait scores and compatibility preferences:
{dimensions_text}

Provide your analysis."""

        result = self._call_llm_json(SYSTEM_PROMPT, user_prompt)

        dimensions = [
            DimensionCompatibility(
                dimension=d["dimension"],
                score_a=d["score_a"],
                score_b=d["score_b"],
                delta=d["delta"],
                interaction=InteractionType(d["interaction"]),
                reasoning=d["reasoning"],
            )
            for d in result["dimensions"]
        ]

        return CompatibilityReport(
            leader_a_id=profile_a.id,
            leader_b_id=profile_b.id,
            leader_a_name=profile_a.name,
            leader_b_name=profile_b.name,
            dimensions=dimensions,
            overall_score=result["overall_score"],
            overall_assessment=result["overall_assessment"],
        )
