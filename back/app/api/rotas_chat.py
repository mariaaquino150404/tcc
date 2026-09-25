from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.chat_schema import ChatRequest, ChatResponse, FeedbackRequest
from app.models.usuario import Usuario
from app.api.deps import obter_usuario_logado, obter_usuario_admin
from app.services.ia_service import processar_consulta_rag, obter_pendencias_analiticas, registrar_feedback

router = APIRouter(prefix="/api/chat", tags=["Chat & IA"])

@router.post("/responder", response_model=ChatResponse)
def responder_pergunta(
    req: ChatRequest, 
    request: Request,
    db: Session = Depends(get_db), 
    usuario_logado: Usuario = Depends(obter_usuario_logado)
):
    token_sessao = request.cookies.get("access_token")
    if not token_sessao:
        raise HTTPException(status_code=401, detail="Credenciais de sessão ausentes.")

    try:
        resultado = processar_consulta_rag(
            db=db,
            pergunta=req.pergunta,
            id_usuario=usuario_logado.id_usuario,
            token_sessao=token_sessao
        )
        return resultado
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/feedback")
def enviar_feedback(
    req: FeedbackRequest,
    db: Session = Depends(get_db),
    usuario_logado: Usuario = Depends(obter_usuario_logado)
):
    try:
        registrar_feedback(db, req.id_consulta, req.util)
        return {"message": "Feedback gravado com sucesso!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao registrar a avaliação.")


@router.get("/pendencias")
def listar_pendencias(
    db: Session = Depends(get_db), 
    admin: Usuario = Depends(obter_usuario_admin)
):
    try:
        pendencias = obter_pendencias_analiticas(db)
        return pendencias
        
    except Exception as e:
        raise HTTPException(status_code=500, detail="Falha na recuperação de pendências operacionais.")