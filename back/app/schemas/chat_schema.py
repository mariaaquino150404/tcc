from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    pergunta: str

class ChatResponse(BaseModel):
    texto: Optional[str] = None
    url: Optional[str] = None
    similaridade: Optional[float] = None
    mensagem: Optional[str] = None