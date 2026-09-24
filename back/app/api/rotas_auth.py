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

# Modelo para receber os dados do frontend
class RegistroRequest(BaseModel):
    nome: str
    email: EmailStr
    senha: str

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/login", response_model=LoginResponse)
def login(dados_login: LoginRequest, response: Response, db: Session = Depends(get_db)):
    try:
        # Repassa os dados validados pelo Pydantic para o nosso Service
        resultado = autenticar_usuario(
            db=db, 
            email=dados_login.email, 
            senha=dados_login.senha, 
            forcar_login=dados_login.forcarLogin
        )
        
        # Injeta o token no cookie com segurança máxima
        response.set_cookie(
            key="access_token",
            value=resultado["token"],
            httponly=True,  # Impede leitura via document.cookie no JS (Evita XSS)
            secure=False,   # Em produção com HTTPS, mude para True
            samesite="lax",
            max_age=8 * 60 * 60  # 8 horas de duração (mesmo tempo do token)
        )
        
        return resultado
        
    except HTTPException as e:
        # Se for o Erro 409 de sessão dupla ou credencial inválida, o FastAPI propaga para o front
        raise e
    
@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    # 1. Captura o token atual do cookie
    token = request.cookies.get("access_token")
    
    if token:
        # 2. Busca a sessão aberta no banco vinculada a esse token
        sessao_ativa = db.query(Sessao).filter(
            Sessao.token == token,
            Sessao.data_hora_logout == None
        ).first()
        
        # 3. Se achar, preenche a data de logout para encerrar de verdade
        if sessao_ativa:
            sessao_ativa.data_hora_logout = datetime.utcnow()
            db.commit()

    # 4. Apaga o cookie do navegador
    response.delete_cookie(
        key="access_token",
        secure=False, # Mantenha False em localhost
        httponly=True,
        samesite="lax"
    )
    return {"message": "Sessão encerrada com sucesso e invalidada no banco."}

@router.post("/cadastro", status_code=201)
def cadastro_aberto(dados: RegistroRequest, db: Session = Depends(get_db)):
    # 1. Verifica se o e-mail já existe
    if db.query(Usuario).filter(Usuario.email == dados.email).first():
        raise HTTPException(status_code=409, detail="E-mail já cadastrado.")
        
    # 2. Busca ou cria o perfil de Operador (ID 2) para cadastros públicos
    perfil_operador = db.query(Perfil).filter(Perfil.id_perfil == 2).first()
    if not perfil_operador:
        perfil_operador = Perfil(id_perfil=2, nome="Operador", tipo="operador")
        db.add(perfil_operador)
        
    # 3. Cria o usuário com a senha criptografada
    novo_usuario = Usuario(
        nome=dados.nome,
        email=dados.email,
        senha_hash=get_password_hash(dados.senha),
        status=True
    )
    
    # 4. Vincula o perfil e salva no banco
    novo_usuario.perfis.append(perfil_operador)
    db.add(novo_usuario)
    db.commit()
    
    return {"detail": "Conta criada com sucesso!"}