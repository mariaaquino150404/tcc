from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime # Import adicionado aqui
from app.db.database import Base

# Tabela associativa PerfilUsuario
perfil_usuario = Table(
    'perfil_usuario',
    Base.metadata,
    Column('id_usuario', Integer, ForeignKey('tcc.usuario.id_usuario'), primary_key=True),
    Column('id_perfil', Integer, ForeignKey('tcc.perfil.id_perfil'), primary_key=True),
    schema='tcc'
)

class Usuario(Base):
    __tablename__ = 'usuario'
    __table_args__ = {'schema': 'tcc'}

    id_usuario = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    senha_hash = Column(String(255), nullable=False)
    
    # Correção raiz aplicada: default=datetime.utcnow força o preenchimento pelo backend
    data_cadastro = Column(DateTime, default=datetime.utcnow, server_default=func.now())
    
    status = Column(Boolean, default=False)

    perfis = relationship("Perfil", secondary=perfil_usuario, back_populates="usuarios")


class Perfil(Base):
    __tablename__ = 'perfil'
    __table_args__ = {'schema': 'tcc'}

    id_perfil = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    tipo = Column(Text)

    usuarios = relationship("Usuario", secondary=perfil_usuario, back_populates="perfis")