import requests
from typing import List
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.documento import Documento, DocumentoParagrafoEmbedding
from app.models.atendimento import Sessao, Consulta, Sugestao, SolucaoNaoEncontrada, Feedback
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

def gerar_resposta_llm(pergunta: str, contexto: str, historico: str = "") -> str:
    """Envia o histórico, contexto e a pergunta para o LLM com System Prompt blindado contra alucinação."""
    
    prompt = f"""Você é a "LUMORA", o assistente de suporte técnico corporativo oficial da Lojas Quero-Quero.
Seu objetivo é fornecer respostas precisas, educadas e estruturadas para os operadores do sistema.

REGRAS DE OURO (ESTRITAMENTE OBRIGATÓRIAS):
1. ZERO ALUCINAÇÃO: A sua única fonte de verdade é a seção "CONTEXTO DO MANUAL" abaixo. Nunca invente comandos, senhas, IPs ou procedimentos que não estejam explicitamente descritos ali.
2. LIMITE DE CONHECIMENTO: Se o contexto não contiver a resposta exata para a pergunta do operador, você está PROIBIDO de tentar adivinhar ou usar conhecimentos externos. Responda EXATAMENTE: "Não possuo informações suficientes no manual para responder a esta pergunta."
3. HISTÓRICO COMO APOIO: Use o "HISTÓRICO RECENTE" apenas para entender o contexto de pronomes da conversa (ex: "como reinicio ele?"). A fonte de dados técnicos e procedimentais continua sendo EXCLUSIVAMENTE o CONTEXTO DO MANUAL.
4. ESTRUTURA VISUAL: Sempre que explicar um procedimento, use formatação Markdown com bullet points (-) ou listas numeradas (1. 2. 3.). Destaque termos técnicos, botões e nomes de menus em **negrito**.

--- HISTÓRICO RECENTE ---
{historico if historico else "Nenhum histórico nesta sessão."}

--- CONTEXTO DO MANUAL ---
{contexto}

--- PERGUNTA DO OPERADOR ---
{pergunta}

Resposta do Suporte Técnico:"""
    
    payload = {
        "model": "phi3",
        "prompt": prompt,
        "max_tokens": 500,
        "temperature": 0.0, 
        "stream": False
    }
    
    try:
        resp = requests.post(f"{settings.ollama_url}/api/generate", json=payload)
        resp.raise_for_status()
        return resp.json().get("response", "").strip()
    except Exception as e:
        print(f"Erro ao chamar LLM (phi3): {e}")
        return "Desculpe, o motor de geração de respostas não está disponível no momento."

def processar_consulta_rag(db: Session, pergunta: str, id_usuario: int, token_sessao: str) -> ChatResponse:
    """Orquestra todo o fluxo do RAG com Memória Contextual e ID para Feedback."""
    
    # 1. Recupera a sessão ativa
    sessao_ativa = db.query(Sessao).filter(
        Sessao.id_usuario == id_usuario,
        Sessao.token == token_sessao,
        Sessao.data_hora_logout == None
    ).first()

    historico_str = ""
    if sessao_ativa:
        ultimas_consultas = db.query(Consulta).filter(
            Consulta.id_sessao == sessao_ativa.id_sessao
        ).order_by(Consulta.data_consulta.desc()).limit(3).all()
        
        if ultimas_consultas:
            historico_str = "--- HISTÓRICO RECENTE DA CONVERSA ---\n"
            for c in reversed(ultimas_consultas):
                historico_str += f"Operador: {c.input}\n"
                if c.sugestao:
                    historico_str += f"Assistente: {c.sugestao.solucao}\n\n"
            historico_str += "--------------------------------------\n"

    nova_consulta = None
    if sessao_ativa:
        nova_consulta = Consulta(id_sessao=sessao_ativa.id_sessao, input=pergunta)
        db.add(nova_consulta)
        db.commit()
        db.refresh(nova_consulta)

    vetor_pergunta = gerar_embedding(pergunta)
    if not vetor_pergunta:
        raise ValueError("Falha na conversão da pergunta para processamento vetorial.")

    resultado = db.query(
        DocumentoParagrafoEmbedding, 
        Documento,
        DocumentoParagrafoEmbedding.embedding.cosine_distance(vetor_pergunta).label("distancia")
    ).join(Documento).order_by("distancia").first()

    similaridade = 0.0
    if resultado:
        similaridade = 1.0 - resultado.distancia

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
            similaridade=similaridade,
            id_consulta=nova_consulta.id_consulta if nova_consulta else None 
        )

    paragrafo_db, documento_db, _ = resultado

    resposta_final = gerar_resposta_llm(pergunta, paragrafo_db.texto, historico_str)
    
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
        similaridade=similaridade,
        id_consulta=nova_consulta.id_consulta if nova_consulta else None 
    )

def registrar_feedback(db: Session, id_consulta: int, util: bool):
    """Registra a avaliação do operador sobre a resposta da IA no banco de dados."""
    novo_feedback = Feedback(id_consulta=id_consulta, util=util)
    db.add(novo_feedback)
    db.commit()
    return True

def obter_pendencias_analiticas(db: Session):
    return db.query(SolucaoNaoEncontrada).filter(
        SolucaoNaoEncontrada.status == 'pendente'
    ).order_by(SolucaoNaoEncontrada.data_criacao.desc()).all()