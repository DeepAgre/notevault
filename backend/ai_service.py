import os
import re
import json
import requests
from dotenv import load_dotenv

load_dotenv()


def _extract_json(text: str) -> dict:
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError(f"No JSON object found in response: {text[:200]}")
    return json.loads(match.group(0))


def _fallback_sentiment(title: str, content: str) -> dict:
    text = f"{title} {content}".lower()

    crisis_terms = [
        "hopeless",
        "trapped",
        "can't go on",
        "cant go on",
        "end it",
        "give up on life",
        "self harm",
        "suicid",
        "no way forward",
    ]
    heavy_terms = [
        "exhausted",
        "burned out",
        "burnt out",
        "overwhelmed",
        "stressed",
        "falling behind",
        "heavy",
        "anxious",
        "anxiety",
        "drained",
        "defeated",
        "pointless",
    ]
    positive_terms = [
        "grateful",
        "calm",
        "peaceful",
        "happy",
        "relieved",
        "energized",
        "grounded",
        "progress",
        "accomplished",
        "thankful",
    ]

    if any(term in text for term in crisis_terms):
        return {
            "sentiment_band": "Critical Distress",
            "sentiment_score": 0.1,
            "crisis_detected": True,
            "empathetic_insight": "You do not have to carry this alone—please reach out to someone you trust or a local support line right away.",
        }

    if any(term in text for term in heavy_terms):
        return {
            "sentiment_band": "Carrying Heavy Weight",
            "sentiment_score": 0.25,
            "crisis_detected": False,
            "empathetic_insight": "It makes sense you feel worn down under heavy pressure—take one small step at a time and give yourself room to breathe.",
        }

    if any(term in text for term in positive_terms):
        return {
            "sentiment_band": "Grounded & Light",
            "sentiment_score": 0.8,
            "crisis_detected": False,
            "empathetic_insight": "Hold onto this steadier moment and let that calm carry into the rest of your day.",
        }

    return {
        "sentiment_band": "Reflecting & Processing",
        "sentiment_score": 0.5,
        "crisis_detected": False,
        "empathetic_insight": "Your thoughts are safe here. Keep going one step at a time.",
    }


def analyze_reflection_with_ai(title: str, content: str):
    api_key = os.getenv("OPENROUTER_API_KEY")
    full_text = f"Title: {title}\nContent: {content}"

    if not api_key:
        return _fallback_sentiment(title, content)

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "https://notevaultspace.vercel.app",
        "X-Title": "NoteVault Sanctuary",
        "Content-Type": "application/json",
    }

    configured_model = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct:free")
    models_to_try = list(
        dict.fromkeys([
            configured_model,
            "meta-llama/llama-3.3-70b-instruct:free",
            "inclusionai/ling-3.2-flash:free",
            "openrouter/free",
        ])
    )

    system_prompt = (
        "You are an empathetic psychological and sentiment analysis engine for a mental wellness journaling app. "
        "Analyze the user's reflection text and output ONLY a raw JSON object with no markdown or extra text, using these exact keys:\n"
        '1. "sentiment_band": Choose ONE from exactly these four: '
        '["Carrying Heavy Weight", "Grounded & Light", "Reflecting & Processing", "Critical Distress"].\n'
        '2. "sentiment_score": A float between 0.0 (very negative) and 1.0 (very positive).\n'
        '3. "crisis_detected": Boolean (true if the user expresses explicit self-harm, suicidal ideation, or extreme severe depression; false otherwise).\n'
        '4. "empathetic_insight": A short, 1-sentence comforting micro-insight or wellness encouragement for the user.'
    )

    for model_name in models_to_try:
        payload = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": full_text},
            ],
            "temperature": 0.2,
        }

        try:
            response = requests.post(url, headers=headers, json=payload, timeout=15)
            if response.status_code == 200:
                res_data = response.json()
                content_string = res_data["choices"][0]["message"]["content"].strip()
                parsed_json = _extract_json(content_string)
                return {
                    "sentiment_band": parsed_json.get("sentiment_band", "Reflecting & Processing"),
                    "sentiment_score": float(parsed_json.get("sentiment_score", 0.5)),
                    "crisis_detected": bool(parsed_json.get("crisis_detected", False)),
                    "empathetic_insight": parsed_json.get(
                        "empathetic_insight",
                        "Your thoughts are safe here. Keep going one step at a time.",
                    ),
                }
            else:
                print(f"OpenRouter Error ({model_name}):", response.status_code, response.text)
        except Exception as e:
            print(f"AI Service Exception ({model_name}):", e)

    return _fallback_sentiment(title, content)