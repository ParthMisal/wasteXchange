"""AI integration for deal-quality analysis and matchmaking insights.

Two providers are supported (configurable via AI_PROVIDER):
- "gemini": Google Gemini flash models (google-genai SDK / REST fallback)
- "openai": OpenAI chat completions (openai SDK / REST fallback)

When no provider/key is configured, every function degrades gracefully to
heuristic logic so the platform keeps working offline.
"""
import json
import logging
from typing import Any, Optional

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
OPENAI_URL = "https://api.openai.com/v1/chat/completions"


def ai_enabled() -> bool:
    return bool(settings.AI_API_KEY) and settings.AI_PROVIDER in ("gemini", "openai")


async def _call_gemini(prompt: str) -> Optional[str]:
    try:
        async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT_SECONDS) as client:
            resp = await client.post(
                GEMINI_URL.format(model=settings.AI_MODEL),
                params={"key": settings.AI_API_KEY},
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "temperature": 0.4,
                        "responseMimeType": "application/json",
                    },
                },
            )
            resp.raise_for_status()
            data = resp.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        return _strip_json_fence(text)
    except Exception as exc:  # pragma: no cover - network/provider errors
        logger.warning("Gemini call failed: %s", exc)
        return None


async def _call_openai(prompt: str) -> Optional[str]:
    try:
        async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT_SECONDS) as client:
            resp = await client.post(
                OPENAI_URL,
                headers={"Authorization": f"Bearer {settings.AI_API_KEY}"},
                json={
                    "model": settings.AI_MODEL,
                    "temperature": 0.4,
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "You are a B2B industrial waste/surplus matchmaking "
                                "analyst. Reply with valid JSON only."
                            ),
                        },
                        {"role": "user", "content": prompt},
                    ],
                    "response_format": {"type": "json_object"},
                },
            )
            resp.raise_for_status()
            data = resp.json()
        return data["choices"][0]["message"]["content"]
    except Exception as exc:  # pragma: no cover
        logger.warning("OpenAI call failed: %s", exc)
        return None


def _strip_json_fence(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.startswith("json"):
            text = text[4:]
    return text.strip()


async def analyze_deals(payload: dict[str, Any]) -> dict[str, Any]:
    """Ask the LLM to refine match scores for the top candidate deals.

    Payload: {"requirement": {...}, "deals": [ {material_id, name, ...}, ... ]}
    Returns: {"refinements": {material_id: {"score_delta", "reason"}}, "insight"}
    or an empty structure when AI is unavailable.
    """
    empty = {"refinements": {}, "insight": ""}
    if not ai_enabled():
        return empty

    prompt = (
        "You are an expert in industrial surplus and waste trading. A buyer has "
        "a requirement and sellers have listed materials. Assess deal quality: "
        "how well the listing matches the requirement (category, quantity, price "
        "fairness vs typical market rates, quality/purity). Return JSON only:\n"
        f"Requirement: {json.dumps(payload.get('requirement', {}), ensure_ascii=False)}\n"
        f"Deals: {json.dumps(payload.get('deals', []), ensure_ascii=False)}\n"
        'Respond: {"refinements": {"<material_id>": {"score_delta": -5..5, '
        '"reason": "one short sentence"}}, '
        '"insight": "one sentence of market insight for the buyer"}'
    )

    if settings.AI_PROVIDER == "gemini":
        raw = await _call_gemini(prompt)
    elif settings.AI_PROVIDER == "openai":
        raw = await _call_openai(prompt)
    else:
        return empty

    if not raw:
        return empty
    try:
        parsed = json.loads(raw)
        refinements = parsed.get("refinements", {}) or {}
        return {
            "refinements": {
                str(k): v for k, v in refinements.items() if isinstance(v, dict)
            },
            "insight": str(parsed.get("insight", "")),
        }
    except Exception:
        logger.warning("AI returned unparseable JSON: %s", raw[:200])
        return empty


async def generate_market_insight(stats: dict[str, Any]) -> str:
    """Short AI-generated insight for dashboards (empty string when offline)."""
    if not ai_enabled():
        return ""
    prompt = (
        "You are an analyst for a B2B waste exchange. Summarise this trader's "
        "impact in ONE concise sentence (max 20 words), motivating and specific:\n"
        f"{json.dumps(stats, ensure_ascii=False)}\n"
        'Reply: {"insight": "..."}'
    )
    raw = await _call_gemini(prompt) if settings.AI_PROVIDER == "gemini" else await _call_openai(prompt)
    if not raw:
        return ""
    try:
        return str(json.loads(raw).get("insight", ""))
    except Exception:
        return ""
