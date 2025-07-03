# 🧠 Smart Interview Coach

**Smart Interview Coach** est une application d'intelligence artificielle qui simule des entretiens d'embauche et fournit un feedback structuré et personnalisé à partir des réponses du candidat.

Développé dans le cadre d’un projet personnel avec un Master 2 en Bases de Données et Intelligence Artificielle, ce projet combine traitement du langage naturel (NLP), IA générative, React et FastAPI.

---

## 🚀 Fonctionnalités

- 💬 Simulation d’un entretien IA (LLM) selon un poste
- 📝 Analyse textuelle de la réponse (pertinence, ton, vocabulaire)
- 📊 Feedback personnalisé généré par IA
- 🔄 Communication React ↔ FastAPI
- 🎯 Prêt à accueillir des extensions audio (Whisper) ou vidéo (MediaPipe)

---

## 🧰 Stack Technique

| Composant   | Technologie |
|-------------|-------------|
| Frontend    | React + TypeScript |
| Backend     | FastAPI (Python) |
| IA/NLP      | OpenAI GPT-4 (ou GPT-3.5) |
| API REST    | JSON |
| Auth / CORS | Middleware FastAPI |
| Déploiement | Local (dev) puis Render / Vercel |
| Stockage    | Aucun pour le MVP |

---

## 📁 Structure du projet

smart-interview-coach/
├── frontend/ # Application React (UI)
├── backend/ # API FastAPI (NLP & IA)
├── .gitignore
├── README.md

---

## ⚙️ Installation & Lancement

### 1. Cloner le projet

```bash
git clone https://github.com/<ton-utilisateur>/smart-interview-coach.git
cd smart-interview-coach
```

### 2. Lancer le Frontend React

cd frontend
npm install
npm start

### 3. Lancer le Backend FastAPI

cd ../backend
python -m venv venv
source venv/bin/activate   # ou venv\Scripts\activate (Windows)
pip install fastapi uvicorn openai python-dotenv
uvicorn main:app --reload


# 👤 Auteur

**Ababacar Sadikh Gueye**
🎓 Ingénieur Bases de Données et Intelligence Artificielle
🔗 [LinkedIn](https://www.linkedin.com/in/ababacar-sadikh-gueye-239a66136/) | 📧 [abougueye96@yahoo.fr]