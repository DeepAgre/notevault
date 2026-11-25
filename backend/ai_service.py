import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()


def analyze_reflection_with_ai(title: str, content: str):
    api_key = os.getenv("OPENROUTER_API_KEY")
    full_text = f"Title: {title}\nContent: {content}"

    if not api_key:
        return {
            "sentiment_band": "Reflecting & Processing",
            "sentiment_score": 0.5,
            "crisis_detected": False,
            "empathetic_insight": "Take a gentle breath and honor your pace today.",
        }

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "https://notevaultspace.vercel.app",
        "X-Title": "NoteVault Sanctuary",
        "Content-Type": "application/json",
    }

    payload = {
        "model": os.getenv("OPENROUTER_MODEL", "inclusionai/ling-3.2-flash:free"),
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are an empathetic psychological and sentiment analysis engine for a mental wellness journaling app. "
                    "Analyze the user's reflection text and output STRICTLY a valid JSON object with these exact keys:\n"
                    '1. "sentiment_band": Choose ONE from exactly these four: '
                    '["Carrying Heavy Weight", "Grounded & Light", "Reflecting & Processing", "Critical Distress"].\n'
                    '2. "sentiment_score": A float between 0.0 (very negative) and 1.0 (very positive).\n'
                    '3. "crisis_detected": Boolean (true if the user expresses explicit self-harm, suicidal ideation, or extreme severe depression; false otherwise).\n'
                    '4. "empathetic_insight": A short, 1-sentence comforting micro-insight or wellness encouragement for the user.'
                ),
            },
            {
                "role": "user",
                "content": full_text,
            },
        ],
        "response_format": {"type": "json_object"},
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=15)
        if response.status_code == 200:
            res_data = response.json()
            content_string = res_data["choices"][0]["message"]["content"].strip()
            if content_string.startswith("```"):
                content_string = content_string.strip("`")
                if content_string.startswith("json"):
                    content_string = content_string[4:].strip()
            parsed_json = json.loads(content_string)
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
            print("OpenRouter Error:", response.status_code, response.text)
    except Exception as e:
        print("AI Service Exception:", e)

    return {
        "sentiment_band": "Reflecting & Processing",
        "sentiment_score": 0.5,
        "crisis_detected": False,
        "empathetic_insight": "Your thoughts are safe here. Keep going one step at a time.",
    }