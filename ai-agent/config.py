import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Configuration for AI Agent"""
    
    # Groq API Configuration
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    GROQ_MODEL = "llama-3.3-70b-versatile"  # Fast and powerful model
    
    # Spring Boot Backend Configuration
    BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8080")
    
    # Agent Configuration
    MAX_ITERATIONS = 10
    TEMPERATURE = 0.7
    
    # Server Configuration
    HOST = "0.0.0.0"
    PORT = 8001

config = Config()