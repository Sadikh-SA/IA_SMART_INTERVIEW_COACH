from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PosteRequest(BaseModel):
    poste: str

@app.post("/generate-questions")
def generate_questions(data: PosteRequest):
    prompt = f"Génère 5 questions d'entretien pertinentes pour le poste de {data.poste}. Donne des questions précises et professionnelles."

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",  # ou gpt-4
        messages=[
            {"role": "system", "content": "Tu es un recruteur expert."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=500
    )

    questions = response.choices[0].message.content
    return {"questions": questions}

class AnalyseRequest(BaseModel):
    poste: str
    question: str
    reponse: str

@app.post("/analyze-answer")
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

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Tu es un recruteur expert qui donne du feedback clair et constructif."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=700
        )

        return { "feedback": response.choices[0].message.content }

    except Exception as e:
        print("Erreur OpenAI:", e)
        return {"error": str(e)}
