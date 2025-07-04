from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import questions, analyses, audio

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
