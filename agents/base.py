import json
import time
from groq import Groq, BadRequestError
from config.settings import settings

MAX_RETRIES = 3


class BaseAgent:
    """Base class for all agents in the pipeline."""

    def __init__(self):
        self.client = Groq(api_key=settings.groq_api_key)
        self.model = settings.groq_model

    def _call_llm(self, system_prompt: str, user_prompt: str, temperature: float = 0.3, max_tokens: int = 800) -> str:
        """Make a Groq API call and return the response text."""
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content # type: ignore

    def _call_llm_json(self, system_prompt: str, user_prompt: str, temperature: float = 0.3, max_tokens: int = 800) -> dict:
        """Make a Groq API call expecting JSON output. Retries on malformed JSON."""
        last_error: Exception | None = None
        for attempt in range(MAX_RETRIES):
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    temperature=temperature,
                    max_tokens=max_tokens,
                    response_format={"type": "json_object"},
                )
                return json.loads(response.choices[0].message.content) # type: ignore
            except (BadRequestError, json.JSONDecodeError) as e:
                last_error = e
                if attempt < MAX_RETRIES - 1:
                    time.sleep(1)
        raise RuntimeError(f"LLM JSON generation failed after {MAX_RETRIES} attempts") from last_error
