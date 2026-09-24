from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import rotas_auth, rotas_usuarios, rotas_documentos, rotas_chat
from app.db.database import engine, Base


Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Suporte")

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