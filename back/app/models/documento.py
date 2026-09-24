from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from app.db.database import Base

class Documento(Base):
    __tablename__ = 'documento'
    __table_args__ = {'schema': 'tcc'}

    id_documento = Column(Integer, primary_key=True, index=True)
    # Removemos o id_subcategoria daqui
    titulo = Column(String(255), nullable=False)
    tipo = Column(String(50))
    arquivo = Column(Text)
    data_criacao = Column(DateTime, server_default=func.now())
    obsoleto = Column(Boolean, default=False)

    paragrafos = relationship("DocumentoParagrafoEmbedding", back_populates="documento", cascade="all, delete-orphan")


class DocumentoParagrafoEmbedding(Base):
    __tablename__ = 'documento_paragrafo_embedding'
    __table_args__ = {'schema': 'tcc'}

    id = Column(Integer, primary_key=True, index=True)
    id_documento = Column(Integer, ForeignKey('tcc.documento.id_documento', ondelete='CASCADE'), nullable=False)
    texto = Column(Text, nullable=False)

    embedding = Column(Vector(1024)) 

    documento = relationship("Documento", back_populates="paragrafos")