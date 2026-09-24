from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os

from app.db.database import get_db
from app.models.documento import Documento, DocumentoParagrafoEmbedding
from app.schemas.documento_schema import DocumentoResponse
from app.api.deps import obter_usuario_admin
from app.models.usuario import Usuario
from app.services.ia_service import chunk_text, gerar_embedding

router = APIRouter(prefix="/api/documentos", tags=["Documentos"])

# ROTA 1: Listar documentos (Apenas Admin)
@router.get("", response_model=List[DocumentoResponse])
def listar_documentos(db: Session = Depends(get_db), admin: Usuario = Depends(obter_usuario_admin)):
    return db.query(Documento).all()

# ROTA 2: Receber arquivo real via FormData (Apenas Admin)
@router.post("/upload", response_model=DocumentoResponse, status_code=status.HTTP_201_CREATED)
async def upload_documento(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    admin: Usuario = Depends(obter_usuario_admin)
):
    try:
        # Lê os bytes do arquivo em memória
        conteudo_bytes = await file.read()
        
        # Para fins práticos iniciais, vamos decodificar assumindo arquivo .txt
        texto_extraido = conteudo_bytes.decode("utf-8")
        
        # 1. Salva o registro pai do documento
        novo_documento = Documento(
            titulo=file.filename,
            tipo=file.content_type,
            arquivo=file.filename
        )
        db.add(novo_documento)
        db.commit()
        db.refresh(novo_documento)
        
        # 2. Divide o texto em blocos reais
        paragrafos = chunk_text(texto_extraido)
        
        if not paragrafos:
            db.delete(novo_documento)
            db.commit()
            raise HTTPException(status_code=400, detail="O documento de texto está vazio ou não possui texto válido.")
        
        # 3. Vetoriza com garantia de sucesso
        for paragrafo in paragrafos:
            try:
                vetor = gerar_embedding(paragrafo)
                novo_embedding = DocumentoParagrafoEmbedding(
                    id_documento=novo_documento.id_documento,
                    texto=paragrafo,
                    embedding=vetor
                )
                db.add(novo_embedding)
            except ValueError:
                # O Ollama falhou! Abortamos o processo e apagamos o documento.
                db.delete(novo_documento)
                db.commit()
                raise HTTPException(
                    status_code=500, 
                    detail="Falha no Motor IA: O Ollama não conseguiu gerar os vetores. O documento foi rejeitado."
                )
                
        db.commit()
        return novo_documento
        
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Formato de arquivo não suportado nativamente. Envie um arquivo .txt válido."
        )
    except HTTPException as he:
        # Permite que os nossos próprios erros (como o de vetor vazio) cheguem ao front
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ROTA 3: Excluir documento e limpar embeddings (Apenas Admin)
@router.delete("/{id_documento}")
def excluir_documento(id_documento: int, db: Session = Depends(get_db), admin: Usuario = Depends(obter_usuario_admin)):
    documento = db.query(Documento).filter(Documento.id_documento == id_documento).first()
    
    if not documento:
        raise HTTPException(status_code=404, detail="Documento não encontrado.")
        
    # O SQLAlchemy lida com o cascade delete configurado no seu model para apagar os embeddings vinculados
    db.delete(documento)
    db.commit()
    
    return {"message": "Documento e embeddings excluídos com sucesso."}