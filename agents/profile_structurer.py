from .base import BaseAgent
from models.leader import LeaderRaw, LeaderProfile, LeaderTraits, TraitScore

SYSTEM_PROMPT = """You are a leadership profiling expert. Given a leader's biography and role description,
extract structured leadership trait scores on exactly 5 dimensions.

Score each dimension from 1 to 10:
- decision_style: 1 = highly directive (commands, decides alone) → 10 = highly collaborative (seeks input, shared decisions)
- risk_appetite: 1 = very conservative (avoids risk, hedges) → 10 = very aggressive (bold bets, embraces uncertainty)
- communication_mode: 1 = top-down command (memos, formal reports) → 10 = consensus-driven (open forums, skip-levels)
- execution_pace: 1 = deliberate planner (slow, thorough) → 10 = fast executor (moves quickly, iterates)
- change_orientation: 1 = stability-focused (process, continuity) → 10 = transformation-driven (disruption, reinvention)

For each score, provide a ONE-SENTENCE justification grounded in specific evidence from the bio.
Also provide a 2-3 sentence summary of their overall leadership style.

Respond in JSON with this exact structure:
{
  "traits": {
    "decision_style": {"score": <float>, "justification": "<string>"},
    "risk_appetite": {"score": <float>, "justification": "<string>"},
    "communication_mode": {"score": <float>, "justification": "<string>"},
    "execution_pace": {"score": <float>, "justification": "<string>"},
    "change_orientation": {"score": <float>, "justification": "<string>"}
  },
  "summary": "<string>"
}"""

BIO_SYSTEM_PROMPT = """You are a professional biographer. Given a leader's raw biography and role, write a 2-3 sentence summary for display on a dashboard. Briefly describe who this person is, their background and experience, and what they are known for. Write in third person, cleanly, without any filler text. Respond ONLY with the bio summary text."""


class ProfileStructurer(BaseAgent):
    """Agent 1: Converts raw leader bios into structured trait profiles."""

    def run(self, leader: LeaderRaw) -> LeaderProfile:
        user_prompt = f"""Analyze this leader and extract their trait scores:

Name: {leader.name}
Role: {leader.role}

Biography:
{leader.bio}"""

        bio_user_prompt = f"""Name: {leader.name}
Role: {leader.role}

Biography:
{leader.bio}"""

        result = self._call_llm_json(SYSTEM_PROMPT, user_prompt, max_tokens=600)
        bio_summary = self._call_llm(BIO_SYSTEM_PROMPT, bio_user_prompt, max_tokens=200).strip()

        traits = LeaderTraits(
            decision_style=TraitScore(**result["traits"]["decision_style"]),
            risk_appetite=TraitScore(**result["traits"]["risk_appetite"]),
            communication_mode=TraitScore(**result["traits"]["communication_mode"]),
            execution_pace=TraitScore(**result["traits"]["execution_pace"]),
            change_orientation=TraitScore(**result["traits"]["change_orientation"]),
        )

        return LeaderProfile(
            id=leader.id,
            name=leader.name,
            role=leader.role,
            traits=traits,
            summary=result["summary"],
            bio_summary=bio_summary,
        )
