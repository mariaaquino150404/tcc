from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime
from app.models.usuario import Usuario
from app.models.atendimento import Sessao
from app.core.security import verify_password, create_access_token

def autenticar_usuario(db: Session, email: str, senha: str, forcar_login: bool = False):
    # 1. Busca o usuário pelo e-mail
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    
    if not usuario:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas.")
        
    # 2. Verifica se o usuário não foi desativado pelo adm[cite: 2]
    if not usuario.status:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Usuário suspenso por um administrador.")
        
    # 3. Compara a senha em texto plano com o hash do banco[cite: 2]
    if not verify_password(senha, usuario.senha_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas.")
        
    # 4. Verifica se já existe uma sessão ativa (data_hora_logout nula)[cite: 2]
    sessao_ativa = db.query(Sessao).filter(
        Sessao.id_usuario == usuario.id_usuario,
        Sessao.data_hora_logout == None
    ).first()
    
    if sessao_ativa:
        if not forcar_login:
            # Mantém a compatibilidade com o front que espera o requerConfirmacao para abrir o modal[cite: 1, 2]
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, 
                detail={"message": "Já existe uma sessão ativa para este usuário. Deseja encerrar a sessão anterior?", "requerConfirmacao": True}
            )
        else:
            # Encerra sessão anterior[cite: 2]
            sessao_ativa.data_hora_logout = datetime.utcnow()
            db.commit()
            
    # 5. Gera o token JWT com id, email e perfis[cite: 2]
    perfis_ids = [p.id_perfil for p in usuario.perfis]
    token = create_access_token(data={"id_usuario": usuario.id_usuario, "email": usuario.email, "perfis": perfis_ids})
    
    # 6. Registra a nova sessão no banco[cite: 2]
    nova_sessao = Sessao(
        id_usuario=usuario.id_usuario,
        data_hora_login=datetime.utcnow(),
        ultimo_acesso=datetime.utcnow(),
        token=token
    )
    db.add(nova_sessao)
    db.commit()
    db.refresh(nova_sessao)
    
    # 7. Retorna os dados formatados para o Pydantic validar
    return {
        "id_usuario": usuario.id_usuario,
        "nome": usuario.nome,
        "email": usuario.email,
        "perfis": [{"id_perfil": p.id_perfil, "nome": p.nome} for p in usuario.perfis],
        "id_sessao": nova_sessao.id_sessao,
        "token": token
    }