from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.documento import Documento, DocumentoParagrafoEmbedding
from app.models.atendimento import Sessao, Consulta, Sugestao, SolucaoNaoEncontrada
from app.schemas.chat_schema import ChatRequest, ChatResponse
from app.api.deps import obter_usuario_logado
from app.models.usuario import Usuario
from app.services.ia_service import gerar_embedding, gerar_resposta_llm
from app.api.deps import obter_usuario_logado, obter_usuario_admin

router = APIRouter(prefix="/api/chat", tags=["Chat & IA"])

@router.post("/responder", response_model=ChatResponse)
def responder_pergunta(
    req: ChatRequest, 
    request: Request,
    db: Session = Depends(get_db), 
    usuario_logado: Usuario = Depends(obter_usuario_logado)
):
    # 1. Recupera a sessão ativa pelo token no cookie para vincular a consulta
    token = request.cookies.get("access_token")
    sessao_ativa = db.query(Sessao).filter(
        Sessao.id_usuario == usuario_logado.id_usuario,
        Sessao.token == token,
        Sessao.data_hora_logout == None
    ).first()

    # 2. Registra a Consulta (Histórico do Operador)
    nova_consulta = None
    if sessao_ativa:
        nova_consulta = Consulta(id_sessao=sessao_ativa.id_sessao, input=req.pergunta)
        db.add(nova_consulta)
        db.commit()
        db.refresh(nova_consulta)

    # 3. Gerar embedding da pergunta
    vetor_pergunta = gerar_embedding(req.pergunta)
    if not vetor_pergunta:
        raise HTTPException(status_code=500, detail="Erro ao processar a pergunta.")

    # 4. Buscar o parágrafo mais parecido no banco de dados (PgVector)
    resultado = db.query(
        DocumentoParagrafoEmbedding, 
        Documento,
        DocumentoParagrafoEmbedding.embedding.cosine_distance(vetor_pergunta).label("distancia")
    ).join(Documento).order_by("distancia").first()

    similaridade = 0
    if resultado:
        similaridade = 1.0 - resultado.distancia

    # 5. Lógica de Falha: Sem base ou similaridade baixa (< 0.80)
    # Se a IA não achar NADA relevante, NÃO inventa resposta e ABRE CHAMADO.
    if not resultado or similaridade < 0.50:
        chamado = SolucaoNaoEncontrada(
            id_consulta=nova_consulta.id_consulta if nova_consulta else None,
            input=req.pergunta,
            status='pendente'
        )
        db.add(chamado)
        db.commit()
        
        return ChatResponse(
            mensagem="Não encontrei informações nos manuais da empresa para responder a essa dúvida. Um chamado foi aberto automaticamente para que a equipe técnica atualize a base de conhecimento!"
        )

    paragrafo_db, documento_db, _ = resultado

    # 6. Gerar resposta LLM (Restrito ao contexto)
    resposta_final = gerar_resposta_llm(req.pergunta, paragrafo_db.texto)
    
    # 7. Registra a sugestão dada pela IA vinculada à consulta (Histórico de acertos)
    if nova_consulta:
        nova_sugestao = Sugestao(
            id_consulta=nova_consulta.id_consulta,
            solucao=resposta_final,
            id_documento=documento_db.id_documento
        )
        db.add(nova_sugestao)
        db.commit()

    return ChatResponse(
        texto=resposta_final,
        url=documento_db.arquivo, 
        similaridade=similaridade
    )

@router.get("/pendencias")
def listar_pendencias(db: Session = Depends(get_db), admin: Usuario = Depends(obter_usuario_admin)):
    # Busca todas as dúvidas que a IA não soube responder, ordenando das mais recentes para as mais antigas
    pendencias = db.query(SolucaoNaoEncontrada).filter(
        SolucaoNaoEncontrada.status == 'pendente'
    ).order_by(SolucaoNaoEncontrada.data_criacao.desc()).all()
    
    return pendencias