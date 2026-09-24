from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Motor de conexão
engine = create_engine(settings.database_url)

# Fábrica de sessões pro banco
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe base que os nossos models vão herdar
Base = declarative_base()

# Função injetável pra usar nas nossas rotas depois
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()