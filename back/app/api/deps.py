from fastapi import Depends, HTTPException, status, Request
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.db.database import get_db
from app.core.config import settings
from app.core.security import ALGORITHM
from app.models.usuario import Usuario
from app.models.atendimento import Sessao

TEMPO_INATIVIDADE_MINUTOS = 15

def obter_usuario_logado(request: Request, db: Session = Depends(get_db)):
    # 1. Tenta pegar o token do cookie (nosso novo padrão seguro)
    token = request.cookies.get("access_token")
    
    # Fallback para o header Authorization caso o front ainda envie via Bearer
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token não fornecido.")

    try:
        # 2. Decodifica o JWT
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
        id_usuario: int = payload.get("id_usuario")
        if id_usuario is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido.")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido ou expirado.")

    # 3. Valida a sessão no banco de dados
    sessao = db.query(Sessao).filter(
        Sessao.id_usuario == id_usuario,
        Sessao.token == token,
        Sessao.data_hora_logout == None
    ).first()

    if not sessao:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sessão expirada, encerrada ou inválida.")

    agora = datetime.utcnow()
    ultimo_acesso = sessao.ultimo_acesso if sessao.ultimo_acesso else sessao.data_hora_login

    # 4. Verifica a inatividade de 15 minutos
    if (agora - ultimo_acesso).total_seconds() > (TEMPO_INATIVIDADE_MINUTOS * 60):
        sessao.data_hora_logout = agora
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sessão expirada por inatividade.")

    # 5. Atualiza o último acesso na tabela de sessão
    sessao.ultimo_acesso = agora
    db.commit()

    # 6. Verifica se a conta do usuário ainda está ativa
    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Usuário não encontrado.")
    if not usuario.status:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sua conta está desativada. Acesso negado.")

    return usuario

def obter_usuario_admin(usuario: Usuario = Depends(obter_usuario_logado)):
    """Verifica se o usuário logado possui o perfil de Administrador (ID 1)."""
    is_admin = any(perfil.id_perfil == 1 for perfil in usuario.perfis)
    
    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Acesso negado. Ação restrita a Administradores."
        )
    return usuario