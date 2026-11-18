import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

def analyze_reflection_with_ai(title: str, content: str):
    full_text = f"Title: {title}\nContent: {content}"
    
    # Fallback default if API key is missing during offline testing
    if not OPENROUTER_API_KEY:
        return {
            "sentiment_band": "Reflecting & Processing",
            "sentiment_score": 0.5,
            "crisis_detected": False,
            "empathetic_insight": "Take a gentle breath and honor your pace today."
        }

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "HTTP-Referer": "https://notepulse.app", # Optional app URL for OpenRouter rankings
        "X-Title": "NoteVault Sanctuary",
        "Content-Type": "application/json"
    }
    
    # Strict prompt instructing the free AI model to act as a mental health analyzer and return JSON
    payload = {
        "model": "google/gemini-flash-1.5-8b:free", # 100% free high-speed model on OpenRouter
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are an empathetic psychological and sentiment analysis engine for a mental wellness journaling app. "
                    "Analyze the user's reflection text and output STRICTLY a valid JSON object with these exact keys:\n"
                    "1. \"sentiment_band\": Choose ONE from exactly these four: "
                    "[\"Carrying Heavy Weight\", \"Grounded & Light\", \"Reflecting & Processing\", \"Critical Distress\"].\n"
                    "2. \"sentiment_score\": A float between 0.0 (very negative) and 1.0 (very positive).\n"
                    "3. \"crisis_detected\": Boolean (true if the user expresses explicit self-harm, suicidal ideation, or extreme severe depression; false otherwise).\n"
                    "4. \"empathetic_insight\": A short, 1-sentence comforting micro-insight or wellness encouragement for the user."
                )
            },
            {
                "role": "user",
                "content": full_text
            }
        ],
        "response_format": { "type": "json_object" }
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        if response.status_code == 200:
            res_data = response.json()
            content_string = res_data["choices"][0]["message"]["content"]
            parsed_json = json.loads(content_string)
            return parsed_json
        else:
            print("OpenRouter Error:", response.text)
    except Exception as e:
        print("AI Service Exception:", e)

    # Safe fallback on network failure
    return {
        "sentiment_band": "Reflecting & Processing",
        "sentiment_score": 0.5,
        "crisis_detected": False,
        "empathetic_insight": "Your thoughts are safe here. Keep going one step at a time."
    }