from fastapi import APIRouter, Form
from config import client
import json

router = APIRouter()

@router.post("/analyze-text")
async def analyze_text(reponse: str = Form(...), poste: str = Form(...), question: str = Form(...)):
    prompt = f"""
Tu es un expert en recrutement.

Voici la question posée au candidat : "{question}"
Voici la réponse écrite du candidat : "{reponse}"
Le poste visé est : "{poste}"

Évalue cette réponse selon les critères suivants :
- Communication (aisance, vocabulaire)
- Clarté (structure, compréhension)
- Pertinence (adéquation avec la question)

Donne uniquement ce JSON (pas de texte autour) :

{{
  "score_total": (note globale sur 10),
  "details": {{
    "communication": (note sur 10),
    "clarte": (note sur 10),
    "pertinence": (note sur 10)
  }},
  "feedback": "Un feedback clair et structuré (forces, faiblesses, conseils)"
}}
    """

    gpt_response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "Tu es un recruteur expert. Réponds uniquement avec le JSON demandé."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=700
    )

    raw_content = gpt_response.choices[0].message.content

    try:
        parsed = json.loads(raw_content)

        return {
            "reponse": reponse,
            "feedback": parsed["feedback"],
            "score_total": parsed["score_total"],
            "details": parsed["details"]
        }
    except json.JSONDecodeError:
        return {
            "reponse": reponse,
            "feedback": raw_content,
            "score_total": None,
            "details": None
        }
