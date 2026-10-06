import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend directory
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

class Settings:
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "127.0.0.1")
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    
    # Qdrant Settings
    QDRANT_URL: str = os.getenv("QDRANT_URL", "local")
    QDRANT_API_KEY: str = os.getenv("QDRANT_API_KEY", "")
    QDRANT_STORAGE_PATH: str = str(BASE_DIR / os.getenv("QDRANT_STORAGE_PATH", "qdrant_storage"))
    
    # Lyzr & LLM Keys
    LYZR_API_KEY: str = os.getenv("LYZR_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Omi Webhook
    OMI_WEBHOOK_SECRET: str = os.getenv("OMI_WEBHOOK_SECRET", "meetsight_omi_secret_2026")

settings = Settings()
