from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from app.db.database import get_db
from app.models.usuario import Usuario, Perfil
from app.models.atendimento import Sessao
from app.schemas.usuario_schema import UsuarioCreate, UsuarioUpdate, UsuarioResponse
# Certifique-se de que verify_password está implementado no seu app.core.security
from app.core.security import get_password_hash, verify_password 
from app.api.deps import obter_usuario_admin

router = APIRouter(prefix="/api/users", tags=["Usuários"])


class AdminConfirmDelete(BaseModel):
    email_admin: str
    senha_admin: str

@router.post("", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def criar_usuario(usuario_in: UsuarioCreate, db: Session = Depends(get_db), admin: Usuario = Depends(obter_usuario_admin)):
    if db.query(Usuario).filter(Usuario.email == usuario_in.email).first():
        raise HTTPException(status_code=409, detail="E-mail já cadastrado.")
        
    perfil = db.query(Perfil).filter(Perfil.id_perfil == usuario_in.id_perfil).first()
    if not perfil:
        raise HTTPException(status_code=400, detail="Perfil informado é inválido.")

    novo_usuario = Usuario(
        nome=usuario_in.nome,
        email=usuario_in.email,
        senha_hash=get_password_hash(usuario_in.senha),
        status=True
    )
    novo_usuario.perfis.append(perfil)
    
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return novo_usuario

@router.get("", response_model=List[UsuarioResponse])
def listar_usuarios(db: Session = Depends(get_db), admin: Usuario = Depends(obter_usuario_admin)):
    return db.query(Usuario).all()

@router.put("/{id_usuario}", response_model=UsuarioResponse)
def atualizar_usuario(id_usuario: int, dados_atualizacao: UsuarioUpdate, db: Session = Depends(get_db), admin: Usuario = Depends(obter_usuario_admin)):
    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    if dados_atualizacao.nome:
        usuario.nome = dados_atualizacao.nome
    if dados_atualizacao.email:
        # Verifica se o novo email já existe em outro usuário
        email_existente = db.query(Usuario).filter(Usuario.email == dados_atualizacao.email, Usuario.id_usuario != id_usuario).first()
        if email_existente:
            raise HTTPException(status_code=409, detail="E-mail já cadastrado em outra conta.")
        usuario.email = dados_atualizacao.email
        
    if dados_atualizacao.status is not None:
        usuario.status = dados_atualizacao.status
        
    if dados_atualizacao.senha:
        usuario.senha_hash = get_password_hash(dados_atualizacao.senha)
        
    if dados_atualizacao.id_perfil:
        perfil_novo = db.query(Perfil).filter(Perfil.id_perfil == dados_atualizacao.id_perfil).first()
        if perfil_novo:
            usuario.perfis.clear()
            usuario.perfis.append(perfil_novo)

    db.commit()
    db.refresh(usuario)
    return usuario

@router.patch("/{id_usuario}/status")
def toggle_status(id_usuario: int, status_in: bool, db: Session = Depends(get_db), admin: Usuario = Depends(obter_usuario_admin)):
    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
        
    usuario.status = status_in
    db.commit()
    return {"message": f"Status atualizado para {'Ativo' if status_in else 'Inativo'}."}


@router.post("/{id_usuario}/reset-password")
def resetar_senha(id_usuario: int, db: Session = Depends(get_db), admin: Usuario = Depends(obter_usuario_admin)):
    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    
    nova_senha_padrao = "Mudar@123"
    usuario.senha_hash = get_password_hash(nova_senha_padrao)
    db.commit()
    return {"message": f"Senha resetada com sucesso. A nova senha provisória é: {nova_senha_padrao}"}


@router.delete("/{id_usuario}")
def excluir_usuario(id_usuario: int, auth_data: AdminConfirmDelete, db: Session = Depends(get_db), admin: Usuario = Depends(obter_usuario_admin)):
    admin_db = db.query(Usuario).filter(Usuario.email == auth_data.email_admin).first()
    if not admin_db or not verify_password(auth_data.senha_admin, admin_db.senha_hash):
        raise HTTPException(status_code=401, detail="Credenciais de administrador inválidas para autorizar a exclusão.")

    if admin_db.id_usuario == id_usuario:
        raise HTTPException(status_code=403, detail="Você não pode excluir sua própria conta.")

    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
        
    db.query(Sessao).filter(Sessao.id_usuario == id_usuario).delete()
    db.delete(usuario)
    db.commit()
    return {"message": "Usuário excluído com sucesso."}