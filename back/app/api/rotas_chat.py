from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.chat_schema import ChatRequest, ChatResponse
from app.models.usuario import Usuario
from app.api.deps import obter_usuario_logado, obter_usuario_admin

# Importação dos serviços que agora concentram toda a regra de negócio
from app.services.ia_service import processar_consulta_rag, obter_pendencias_analiticas

router = APIRouter(prefix="/api/chat", tags=["Chat & IA"])


@router.post("/responder", response_model=ChatResponse)
def responder_pergunta(
    req: ChatRequest, 
    request: Request,
    db: Session = Depends(get_db), 
    usuario_logado: Usuario = Depends(obter_usuario_logado)
):
    # 1. Extração de credenciais de trânsito (Cookie HttpOnly)
    token_sessao = request.cookies.get("access_token")
    if not token_sessao:
        raise HTTPException(status_code=401, detail="Credenciais de sessão ausentes.")

    try:
        # 2. Delegação integral da orquestração (RAG, PgVector e Persistência) para a camada de Serviço
        resultado = processar_consulta_rag(
            db=db,
            pergunta=req.pergunta,
            id_usuario=usuario_logado.id_usuario,
            token_sessao=token_sessao
        )
        return resultado
        
    except ValueError as e:
        # Captura violações de regra de negócio disparadas pelo serviço
        raise HTTPException(status_code=400, detail=str(e))
    # Exceções críticas (500) serão interceptadas silenciosamente pelo global_exception_handler no main.py


@router.get("/pendencias")
def listar_pendencias(
    db: Session = Depends(get_db), 
    admin: Usuario = Depends(obter_usuario_admin)
):
    try:
        # Delegação da query de extração de anomalias de contexto
        pendencias = obter_pendencias_analiticas(db)
        return pendencias
        
    except Exception as e:
        raise HTTPException(status_code=500, detail="Falha na recuperação de pendências operacionais.")