from fastapi import APIRouter, File, UploadFile, Form
from config import client
import tempfile
import json
import os
from gtts import gTTS

router = APIRouter()

@router.post("/transcribe-audio")
async def transcribe_audio(audio: UploadFile = File(...), poste: str = Form(...), question: str = Form(...)):
    # Enregistrer l'audio temporairement
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        tmp.write(await audio.read())
        tmp_path = tmp.name

    # Étape 1 : Transcription Whisper
    transcription_response = client.audio.transcriptions.create(
        model="whisper-1",
        file=open(tmp_path, "rb"),
        response_format="text",
        language="fr"
    )
    reponse = transcription_response.strip()

    # Étape 2 : Générer l’analyse IA (feedback + scores)
    prompt = f"""
Tu es un expert en recrutement.

Voici la question posée au candidat : "{question}"
Voici la réponse transcrite (venant d'un enregistrement vocal) : "{reponse}"
Le poste visé est : "{poste}"

Évalue la réponse en retournant exactement ce JSON :

{{
  "score_total": (un nombre entre 0 et 10),
  "details": {{
    "communication": (note sur 10),
    "clarte": (note sur 10),
    "pertinence": (note sur 10)
  }},
  "feedback": "un retour structuré et concis à donner au candidat (points forts, faiblesses, conseils)"
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
        feedback_text = parsed["feedback"]

        # Étape 3 : Générer l'audio du feedback
        audio_filename = f"feedback_{os.path.basename(tmp_path)}.mp3"
        audio_path = os.path.join("audios", audio_filename)

        os.makedirs("audios", exist_ok=True)

        tts = gTTS(text=feedback_text, lang="fr")
        tts.save(audio_path)

        return {
            "transcription": reponse,
            "feedback": feedback_text,
            "score_total": parsed["score_total"],
            "details": parsed["details"],
            "audio_feedback_url": f"/audio/{audio_filename}"
        }

    except json.JSONDecodeError:
        return {
            "transcription": reponse,
            "feedback": raw_content,
            "score_total": None,
            "details": None,
            "audio_feedback_url": None
        }
