import requests
from typing import List
from sqlalchemy.orm import Session

from app.core.config import settings
# Importações de Modelos e Schemas que antes sujavam o Controlador
from app.models.documento import Documento, DocumentoParagrafoEmbedding
from app.models.atendimento import Sessao, Consulta, Sugestao, SolucaoNaoEncontrada
from app.schemas.chat_schema import ChatResponse


def chunk_text(texto: str) -> List[str]:
    """Divide o texto completo em parágrafos válidos."""
    return [p.strip() for p in texto.split('\n') if len(p.strip()) > 10]


def gerar_embedding(texto: str) -> List[float]:
    """Chama o Ollama localmente para gerar o vetor do texto."""
    try:
        resposta = requests.post(
            f"{settings.ollama_url}/api/embeddings",
            json={"model": "bge-m3", "prompt": texto}
        )
        resposta.raise_for_status()
        return resposta.json().get("embedding")
    except Exception as e:
        print(f"Erro CRÍTICO ao gerar embedding no Ollama: {e}")
        raise ValueError("O motor de IA (bge-m3) não respondeu.")


def gerar_resposta_llm(pergunta: str, contexto: str) -> str:
    """Envia o contexto e a pergunta para o LLM gerar a resposta final."""
    prompt = f"""Você é um assistente de suporte técnico interno.
Sua regra MAIS IMPORTANTE: Responda à pergunta EXCLUSIVAMENTE com base no contexto fornecido abaixo.
Se a resposta não estiver clara no contexto, não invente informações, apenas diga: "Não possuo informações suficientes no manual para responder a esta pergunta."

Contexto extraído do manual:
{contexto}

Pergunta do operador: {pergunta}"""
    
    payload = {
        "model": "phi3",
        "prompt": prompt,
        "max_tokens": 300,
        "temperature": 0.1, # Temperatura baixa garante respostas factuais (sem alucinações)
        "stream": False
    }
    
    try:
        resp = requests.post(f"{settings.ollama_url}/api/generate", json=payload)
        resp.raise_for_status()
        return resp.json().get("response", "").strip()
    except Exception as e:
        print(f"Erro ao chamar LLM (phi3): {e}")
        return "Desculpe, o motor de geração de respostas não está disponível no momento."


# =====================================================================
# Orquestração de Regras de Negócio (Transferidas do Controlador)
# =====================================================================

def processar_consulta_rag(db: Session, pergunta: str, id_usuario: int, token_sessao: str) -> ChatResponse:
    """Orquestra todo o fluxo do RAG: Autenticação, Vetorização, Busca, Inferência e Auditoria."""
    
    # 1. Recupera a sessão ativa para auditoria e histórico
    sessao_ativa = db.query(Sessao).filter(
        Sessao.id_usuario == id_usuario,
        Sessao.token == token_sessao,
        Sessao.data_hora_logout == None
    ).first()

    # 2. Regista a Consulta (Histórico do Operador)
    nova_consulta = None
    if sessao_ativa:
        nova_consulta = Consulta(id_sessao=sessao_ativa.id_sessao, input=pergunta)
        db.add(nova_consulta)
        db.commit()
        db.refresh(nova_consulta)

    # 3. Gerar embedding da pergunta do operador
    vetor_pergunta = gerar_embedding(pergunta)
    if not vetor_pergunta:
        raise ValueError("Falha na conversão da pergunta para processamento vetorial.")

    # 4. Busca Vetorial via PgVector (cosine_distance)
    resultado = db.query(
        DocumentoParagrafoEmbedding, 
        Documento,
        DocumentoParagrafoEmbedding.embedding.cosine_distance(vetor_pergunta).label("distancia")
    ).join(Documento).order_by("distancia").first()

    similaridade = 0.0
    if resultado:
        similaridade = 1.0 - resultado.distancia

    # 5. Heurística Anti-Alucinação: Transbordo para análise administrativa
    # Threshold rigoroso de 50% de similaridade mínima
    if not resultado or similaridade < 0.50:
        chamado = SolucaoNaoEncontrada(
            id_consulta=nova_consulta.id_consulta if nova_consulta else None,
            input=pergunta,
            status='pendente'
        )
        db.add(chamado)
        db.commit()
        
        return ChatResponse(
            mensagem="Não encontrei informações nos manuais da empresa para responder a essa dúvida. Um chamado foi aberto automaticamente para que a equipe técnica atualize a base de conhecimento!",
            similaridade=similaridade
        )

    paragrafo_db, documento_db, _ = resultado

    # 6. Síntese de Linguagem Natural baseada em fatos
    resposta_final = gerar_resposta_llm(pergunta, paragrafo_db.texto)
    
    # 7. Regista a sugestão dada pela IA (Auditoria de Eficiência)
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


def obter_pendencias_analiticas(db: Session):
    """Busca todas as dúvidas que a IA não soube responder (Anomalias de Contexto)."""
    return db.query(SolucaoNaoEncontrada).filter(
        SolucaoNaoEncontrada.status == 'pendente'
    ).order_by(SolucaoNaoEncontrada.data_criacao.desc()).all()