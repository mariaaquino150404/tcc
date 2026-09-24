from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    db_host: str
    db_port: str
    db_name: str
    db_user: str
    db_pass: str
    jwt_secret: str
    ollama_url: str = "http://localhost:11434"

    @property
    def database_url(self):
        # Montando a string de conexão do PostgreSQL
        return f"postgresql://{self.db_user}:{self.db_pass}@{self.db_host}:{self.db_port}/{self.db_name}"

    # Puxa as variáveis do nosso arquivo .env
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding='utf-8')

settings = Settings()