from pydantic import BaseModel, EmailStr
from typing import List
from app.schemas.usuario_schema import PerfilResponse

class LoginRequest(BaseModel):
    email: EmailStr
    senha: str
    forcarLogin: bool = False

class LoginResponse(BaseModel):
    id_usuario: int
    nome: str
    email: str
    perfis: List[PerfilResponse] = []
    id_sessao: int
    # O token será enviado via Cookie HttpOnly por segurança, 
    # mas mantemos na resposta caso precise de uma transição suave do React
    token: str