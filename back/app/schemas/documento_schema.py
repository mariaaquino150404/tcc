from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DocumentoCreate(BaseModel):
    titulo: str
    tipo: str
    conteudo: str  # O texto completo que será vetorizado

class DocumentoResponse(BaseModel):
    id_documento: int
    titulo: str
    tipo: Optional[str] = None
    arquivo: Optional[str] = None
    data_criacao: datetime

    model_config = {'from_attributes': True}