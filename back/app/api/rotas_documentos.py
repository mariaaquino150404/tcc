from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import os
import io
import PyPDF2  

from app.db.database import get_db
from app.models.documento import Documento, DocumentoParagrafoEmbedding
from app.models.atendimento import SolucaoNaoEncontrada
from app.schemas.documento_schema import DocumentoResponse
from app.api.deps import obter_usuario_admin
from app.models.usuario import Usuario
from app.services.ia_service import chunk_text, gerar_embedding

router = APIRouter(prefix="/api/documentos", tags=["Documentos"])


@router.get("", response_model=List[DocumentoResponse])
def listar_documentos(db: Session = Depends(get_db), admin: Usuario = Depends(obter_usuario_admin)):
    return db.query(Documento).all()


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_documento(
    file: UploadFile = File(...), 
    pendencia_id: int = Form(None), 
    db: Session = Depends(get_db), 
    admin: Usuario = Depends(obter_usuario_admin)
):
    try:
        conteudo_bytes = await file.read()
        texto_extraido = ""
        
        nome_arquivo = file.filename.lower()
        
        if nome_arquivo.endswith('.pdf'):
            try:
                pdf_reader = PyPDF2.PdfReader(io.BytesIO(conteudo_bytes))
                for page in pdf_reader.pages:
                    texto_pagina = page.extract_text()
                    if texto_pagina:
                        texto_extraido += texto_pagina + "\n"
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Erro ao ler a estrutura do PDF: {str(e)}")
                
        elif nome_arquivo.endswith('.txt'):
            try:
                texto_extraido = conteudo_bytes.decode("utf-8")
            except UnicodeDecodeError:
                raise HTTPException(status_code=400, detail="Formato TXT inválido. Use a codificação UTF-8.")
        else:
            raise HTTPException(status_code=400, detail="Formato não suportado. Envie apenas .pdf ou .txt")

        if not texto_extraido.strip():
            raise HTTPException(status_code=400, detail="Não foi possível extrair texto legível deste arquivo.")

        novo_documento = Documento(
            titulo=file.filename,
            tipo=file.content_type,
            arquivo=file.filename
        )
        db.add(novo_documento)
        db.commit()
        db.refresh(novo_documento)
        paragrafos = chunk_text(texto_extraido)
        
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
                db.delete(novo_documento)
                db.commit()
                raise HTTPException(
                    status_code=500, 
                    detail="Falha no Motor IA: O Ollama não conseguiu gerar os vetores. O documento foi rejeitado."
                )

        if pendencia_id:
            pendencia = db.query(SolucaoNaoEncontrada).filter(
                SolucaoNaoEncontrada.id_solucaonaoencontrada == pendencia_id
            ).first()
            
            if pendencia:
                pendencia.status = 'resolvido'
                
        db.commit()
        
        return {
            "id_documento": novo_documento.id_documento,
            "titulo": novo_documento.titulo,
            "mensagem": f"Arquivo {file.filename} processado com sucesso.",
            "pendencia_encerrada": bool(pendencia_id)
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id_documento}")
def excluir_documento(id_documento: int, db: Session = Depends(get_db), admin: Usuario = Depends(obter_usuario_admin)):
    documento = db.query(Documento).filter(Documento.id_documento == id_documento).first()
    
    if not documento:
        raise HTTPException(status_code=404, detail="Documento não encontrado.")
        
    db.delete(documento)
    db.commit()
    
    return {"message": "Documento e embeddings excluídos com sucesso."}