from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from agent import agent
from config import config
import uvicorn

# Initialize FastAPI app
app = FastAPI(
    title="GitHub Issue AI Agent",
    description="AI-powered chatbot for GitHub issue analysis and resolution",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080", "http://localhost:8001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class ChatRequest(BaseModel):
    message: str
    user_token: Optional[str] = ""
    repo: Optional[str] = ""
    issue_context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    success: bool
    error: Optional[str] = None

# Health check endpoint
@app.get("/")
async def root():
    return {
        "status": "running",
        "service": "GitHub Issue AI Agent",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Chat endpoint
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Process a chat message and return AI response
    
    Args:
        request: ChatRequest containing message and optional context
        
    Returns:
        ChatResponse with AI-generated response
    """
    try:
        # Process message through agent
        response = await agent.chat(
            message=request.message,
            user_token=request.user_token,
            repo=request.repo,
            issue_context=request.issue_context
        )
        
        return ChatResponse(
            response=response,
            success=True
        )
        
    except Exception as e:
        return ChatResponse(
            response="",
            success=False,
            error=str(e)
        )

# Analyze issue endpoint
@app.post("/analyze-issue")
async def analyze_issue(request: ChatRequest):
    """
    Analyze a GitHub issue
    
    Args:
        request: ChatRequest with issue_context
        
    Returns:
        Analysis results
    """
    try:
        if not request.issue_context:
            raise HTTPException(status_code=400, detail="issue_context is required")
        
        # Force analysis
        response = await agent.chat(
            message="Analyze this issue",
            user_token=request.user_token,
            repo=request.repo,
            issue_context=request.issue_context
        )
        
        return ChatResponse(
            response=response,
            success=True
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Suggest solution endpoint
@app.post("/suggest-solution")
async def suggest_solution(request: ChatRequest):
    """
    Suggest solution for a GitHub issue
    
    Args:
        request: ChatRequest with issue_context
        
    Returns:
        Solution suggestions
    """
    try:
        if not request.issue_context:
            raise HTTPException(status_code=400, detail="issue_context is required")
        
        # Force solution suggestion
        response = await agent.chat(
            message="Suggest a solution for this issue",
            user_token=request.user_token,
            repo=request.repo,
            issue_context=request.issue_context
        )
        
        return ChatResponse(
            response=response,
            success=True
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print(f"Starting GitHub Issue AI Agent on {config.HOST}:{config.PORT}")
    print(f"API Documentation: http://{config.HOST}:{config.PORT}/docs")
    
    uvicorn.run(
        app,
        host=config.HOST,
        port=config.PORT,
        log_level="info"
    )
