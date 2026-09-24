import requests
from typing import List
from app.core.config import settings

def chunk_text(texto: str) -> List[str]:
    """Divide o texto completo em parágrafos válidos."""
    return [p.strip() for p in texto.split('\n') if len(p.strip()) > 10] # Ignora quebras de linha inúteis

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
        # Lançar exceção para forçar a paragem do upload em vez de falhar silenciosamente
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
        "temperature": 0.1,
        "stream": False
    }
    
    try:
        resp = requests.post(f"{settings.ollama_url}/api/generate", json=payload)
        resp.raise_for_status()
        return resp.json().get("response", "").strip()
    except Exception as e:
        print(f"Erro ao chamar LLM (phi3): {e}")
        return "Desculpe, a IA de geração não está disponível no momento."