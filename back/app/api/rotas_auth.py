from fastapi import APIRouter, Depends, Response, HTTPException, Request
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel, EmailStr

from app.db.database import get_db
from app.schemas.auth_schema import LoginRequest, LoginResponse
from app.services.auth_service import autenticar_usuario
from app.models.atendimento import Sessao
from app.models.usuario import Usuario, Perfil
from app.core.security import get_password_hash

class RegistroRequest(BaseModel):
    nome: str
    email: EmailStr
    senha: str

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/login", response_model=LoginResponse)
def login(dados_login: LoginRequest, response: Response, db: Session = Depends(get_db)):
    try:
        resultado = autenticar_usuario(
            db=db, 
            email=dados_login.email, 
            senha=dados_login.senha, 
            forcar_login=dados_login.forcarLogin
        )
        
        response.set_cookie(
            key="access_token",
            value=resultado["token"],
            httponly=True,  
            secure=False,   
            samesite="lax",
            max_age=8 * 60 * 60  
        )
        
        if "token" in resultado:
            del resultado["token"]
            
        return resultado
        
    except HTTPException as e:
        raise e
    
@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    # 1. Captura o token atual do cookie
    token = request.cookies.get("access_token")
    
    if token:
        sessao_ativa = db.query(Sessao).filter(
            Sessao.token == token,
            Sessao.data_hora_logout == None
        ).first()
        
        if sessao_ativa:
            sessao_ativa.data_hora_logout = datetime.utcnow()
            db.commit()

    response.delete_cookie(
        key="access_token",
        secure=False, 
        httponly=True,
        samesite="lax",
        path="/" 
    )
    return {"message": "Sessão encerrada com sucesso e invalidada no banco."}

@router.post("/cadastro", status_code=201)
def cadastro_aberto(dados: RegistroRequest, db: Session = Depends(get_db)):
    if db.query(Usuario).filter(Usuario.email == dados.email).first():
        raise HTTPException(status_code=409, detail="E-mail já cadastrado.")
        
    perfil_operador = db.query(Perfil).filter(Perfil.id_perfil == 2).first()
    if not perfil_operador:
        perfil_operador = Perfil(id_perfil=2, nome="Operador", tipo="operador")
        db.add(perfil_operador)
        
    novo_usuario = Usuario(
        nome=dados.nome,
        email=dados.email,
        senha_hash=get_password_hash(dados.senha),
        status=True
    )
    
    novo_usuario.perfis.append(perfil_operador)
    db.add(novo_usuario)
    db.commit()
    
    return {"detail": "Conta criada com sucesso!"}