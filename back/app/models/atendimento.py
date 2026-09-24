from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Sessao(Base):
    __tablename__ = 'sessao'
    __table_args__ = {'schema': 'tcc'}

    id_sessao = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey('tcc.usuario.id_usuario'), nullable=False)
    data_hora_login = Column(DateTime, nullable=False)
    data_hora_logout = Column(DateTime)
    ultimo_acesso = Column(DateTime)
    token = Column(Text)
    
    consultas = relationship("Consulta", back_populates="sessao")

class Consulta(Base):
    __tablename__ = 'consulta'
    __table_args__ = {'schema': 'tcc'}

    id_consulta = Column(Integer, primary_key=True, index=True)
    id_sessao = Column(Integer, ForeignKey('tcc.sessao.id_sessao'), nullable=False)
    input = Column(Text, nullable=False)
    data_consulta = Column(DateTime, server_default=func.now())

    sessao = relationship("Sessao", back_populates="consultas")
    sugestao = relationship("Sugestao", back_populates="consulta", uselist=False)
    feedback = relationship("Feedback", back_populates="consulta", uselist=False)

class Sugestao(Base):
    __tablename__ = 'sugestao'
    __table_args__ = {'schema': 'tcc'}

    id_sugestao = Column(Integer, primary_key=True, index=True)
    id_consulta = Column(Integer, ForeignKey('tcc.consulta.id_consulta'))
    solucao = Column(Text, nullable=False)
    id_documento = Column(Integer, ForeignKey('tcc.documento.id_documento'))
    data_sugestao = Column(DateTime, server_default=func.now())

    consulta = relationship("Consulta", back_populates="sugestao")

class Feedback(Base):
    __tablename__ = 'feedback'
    __table_args__ = {'schema': 'tcc'}

    id_feedback = Column(Integer, primary_key=True, index=True)
    id_consulta = Column(Integer, ForeignKey('tcc.consulta.id_consulta'))
    util = Column(Boolean, nullable=False)
    data_feedback = Column(DateTime, server_default=func.now())

    consulta = relationship("Consulta", back_populates="feedback")

class SolucaoNaoEncontrada(Base):
    __tablename__ = 'solucaonaoencontrada'
    __table_args__ = {'schema': 'tcc'}

    id_solucaonaoencontrada = Column(Integer, primary_key=True, index=True)
    data_criacao = Column(DateTime, server_default=func.now())
    id_consulta = Column(Integer, ForeignKey('tcc.consulta.id_consulta'))
    input = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default='pendente')

class CodigoRecuperacao(Base):
    __tablename__ = 'codigo_recuperacao'
    __table_args__ = {'schema': 'tcc'}

    id = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey('tcc.usuario.id_usuario'), nullable=False)
    codigo = Column(String(10), nullable=False)
    expiracao = Column(DateTime, nullable=False)
    usado = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())