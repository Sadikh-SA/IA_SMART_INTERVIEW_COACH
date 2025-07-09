from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from api import questions, analyses, audio, text, video

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # adapte si besoin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(questions.router)
app.include_router(analyses.router)
app.include_router(audio.router)
app.include_router(text.router)
app.mount("/audio", StaticFiles(directory="audios"), name="audio")
app.include_router(video.router)
