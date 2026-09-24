from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# --- PERFIL ---
class PerfilBase(BaseModel):
    id_perfil: int
    nome: str
    tipo: Optional[str] = None

class PerfilResponse(PerfilBase):
    model_config = {'from_attributes': True}


# --- USUÁRIO ---
class UsuarioBase(BaseModel):
    nome: str
    email: EmailStr  # Já valida se tem @ e formato correto de e-mail
    status: bool = False

class UsuarioCreate(UsuarioBase):
    senha: str
    id_perfil: int  # Recebemos o ID do perfil na criação

class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    senha: Optional[str] = None
    status: Optional[bool] = None
    id_perfil: Optional[int] = None

class UsuarioResponse(UsuarioBase):
    id_usuario: int
    data_cadastro: datetime
    perfis: List[PerfilResponse] = []

    # O 'from_attributes=True' (antigo orm_mode) é a mágica que permite 
    # ao Pydantic ler direto do model SQLAlchemy e transformar em JSON
    model_config = {'from_attributes': True}