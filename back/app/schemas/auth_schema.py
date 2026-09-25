from pydantic import BaseModel, EmailStr
from typing import List, Optional
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
    token: Optional[str] = None