from fastapi import APIRouter, File, UploadFile, Form
from config import client
import tempfile

router = APIRouter()

@router.post("/transcribe-audio")
async def transcribe_audio(audio: UploadFile = File(...), poste: str = Form(...), question: str = Form(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        tmp.write(await audio.read())
        tmp_path = tmp.name

    # Transcription avec Whisper
    transcription_response = client.audio.transcriptions.create(
        model="whisper-1",
        file=open(tmp_path, "rb"),
        response_format="text",
        language="fr"
    )

    reponse = transcription_response

    # Analyse via GPT
    prompt = f"""
Tu es un expert RH. Voici une question : "{question}"
Et la réponse vocale transcrite pour le poste de {poste} : "{reponse}"

Analyse :
1. Pertinence
2. Clarté, fluidité
3. Points positifs ✅
4. Améliorations ⚠️
5. Conseil 🧠
    """

    gpt_response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "Tu es un expert recruteur."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=700
    )

    feedback = gpt_response.choices[0].message.content
    return {"transcription": reponse, "feedback": feedback}
