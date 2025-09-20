"""
NeonPro AG-UI RAG Agent
Healthcare database query agent with AG-UI protocol integration
"""

import asyncio
import json
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from agui import AGUIServer, AGUIMessage
from agent_config import AgentConfig

class NeonProDataAgent:
    """Healthcare data query agent using AG-UI protocol"""
    
    def __init__(self):
        self.config = AgentConfig()
        self.app = FastAPI(
            title="NeonPro Data Agent",
            description="Healthcare conversational database agent",
            version="1.0.0"
        )
        self.setup_middleware()
        self.setup_routes()
        
    def setup_middleware(self):
        """Configure CORS and security middleware"""
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=self.config.ALLOWED_ORIGINS,
            allow_credentials=True,
            allow_methods=["GET", "POST", "OPTIONS"],
            allow_headers=["*"],
        )
    
    def setup_routes(self):
        """Setup API routes"""
        
        @self.app.get("/health")
        async def health_check():
            return {"status": "healthy", "agent": self.config.AGENT_NAME}
        
        @self.app.post("/agui")
        async def agui_endpoint(message: Dict[str, Any]):
            """AG-UI protocol endpoint"""
            try:
                return await self.process_agui_message(message)
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))
    
    async def process_agui_message(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Process AG-UI protocol message"""
        
        # Extract query from message
        query = message.get("content", "")
        session_id = message.get("session_id", "default")
        
        if not query:
            return {
                "type": "error",
                "content": "Query cannot be empty",
                "session_id": session_id
            }
        
        # Placeholder for actual RAG processing
        # This will be implemented in Phase 3
        response = {
            "type": "text",
            "content": f"Received query: {query}",
            "session_id": session_id,
            "metadata": {
                "agent": self.config.AGENT_NAME,
                "processing_time": 100
            }
        }
        
        return response

def create_app() -> FastAPI:
    """Create and configure the FastAPI application"""
    agent = NeonProDataAgent()
    return agent.app

if __name__ == "__main__":
    # Validate configuration
    AgentConfig.validate_config()
    
    # Create and run the agent
    app = create_app()
    uvicorn.run(
        app,
        host=AgentConfig.HOST,
        port=AgentConfig.PORT,
        log_level="info"
    )