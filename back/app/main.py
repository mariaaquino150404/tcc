import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api import rotas_auth, rotas_usuarios, rotas_documentos, rotas_chat
from app.db.database import engine, Base


Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Suporte")

logging.basicConfig(level=logging.ERROR)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"Falha na rota {request.url.path} - Detalhe: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Ocorreu um erro interno no servidor. O incidente foi registrado para análise técnica."},
    )

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(rotas_auth.router)
app.include_router(rotas_usuarios.router)
app.include_router(rotas_documentos.router)
app.include_router(rotas_chat.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "db_conectado": settings.db_name}