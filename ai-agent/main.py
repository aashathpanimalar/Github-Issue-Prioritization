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

@app.post("/analyze-project")
async def analyze_project(data: dict):
    project_name = data.get("projectName", "Unknown Project")
    tasks = data.get("tasks", [])
    
    # Simple analysis logic
    total_tasks = len(tasks)
    pending = len([t for t in tasks if t["status"] == "PENDING"])
    review = len([t for t in tasks if t["status"] == "IN_REVIEW"])
    complete = len([t for t in tasks if t["status"] == "COMPLETE"])
    
    high_priority_pending = len([t for t in tasks if t["status"] == "PENDING" and t["priority"] in ["HIGH", "CRITICAL"]])
    
    # Generate a prompt for the AI to get better insights
    # For now, return structured data and a synthesized summary
    
    insight = f"Project '{project_name}' has {total_tasks} total tasks. "
    if high_priority_pending > 0:
        insight += f"Warning: {high_priority_pending} high-priority tasks are still pending. "
    
    productivity = (complete / total_tasks * 100) if total_tasks > 0 else 0
    
    recommendation = "Focus on clearing high-priority pending tasks." if high_priority_pending > 0 else "Project pace is healthy."

    return {
        "summary": insight,
        "metrics": {
            "total": total_tasks,
            "pending": pending,
            "review": review,
            "complete": complete,
            "productivityScore": productivity
        },
        "recommendation": recommendation,
        "bottlenecks": ["Task Review" if review > (total_tasks * 0.4) else "None identified"]
    }

if __name__ == "__main__":
    print(f"Starting GitHub Issue AI Agent on {config.HOST}:{config.PORT}")
    print(f"API Documentation: http://{config.HOST}:{config.PORT}/docs")
    
    uvicorn.run(
        app,
        host=config.HOST,
        port=config.PORT,
        log_level="info"
    )
