from fastapi import APIRouter
from models import PosteRequest
from config import client

router = APIRouter()

@router.post("/generate-questions")
def generate_questions(data: PosteRequest):
    prompt = f"Génère 5 questions d'entretien pertinentes pour le poste de {data.poste}. Donne des questions précises et professionnelles."

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "Tu es un recruteur expert."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=500
    )

    questions = response.choices[0].message.content
    return {"questions": questions}
