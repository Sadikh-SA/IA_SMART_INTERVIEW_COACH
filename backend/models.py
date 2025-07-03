from pydantic import BaseModel

class PosteRequest(BaseModel):
    poste: str

class AnalyseRequest(BaseModel):
    poste: str
    question: str
    reponse: str
