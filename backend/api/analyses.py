from fastapi import APIRouter
from models import AnalyseRequest
from config import client

router = APIRouter()

@router.post("/analyze-answer")
def analyze_answer(data: AnalyseRequest):
    prompt = f"""
Tu es un expert RH. Voici une question d’entretien : "{data.question}"
Et la réponse d’un candidat pour un poste de {data.poste} : "{data.reponse}"

Analyse cette réponse en détail :
1. Évalue sa pertinence par rapport au poste
2. Évalue la clarté, le vocabulaire, l’argumentation
3. Donne un retour constructif avec :
   - ✅ Ce qui est bien
   - ⚠️ Ce qui peut être amélioré
   - 🧠 Conseil personnalisé pour faire mieux
Sois bienveillant, mais professionnel.
    """

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "Tu es un recruteur expert qui donne du feedback clair et constructif."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=700
    )

    return {"feedback": response.choices[0].message.content}
