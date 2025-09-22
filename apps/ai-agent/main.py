"""
Main entry point for the AI Agent Service
"""

import asyncio
import logging
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from services.agent_service import AgentService
from services.database_service import DatabaseService
from services.websocket_manager import WebSocketManager

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


# Global services
agent_service: AgentService = None
ws_manager: WebSocketManager = None
db_service: DatabaseService = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting AI Agent Service...")
    
    global agent_service, ws_manager, db_service
    
    # Initialize services
    db_service = DatabaseService(settings.supabase_url, settings.supabase_service_key)
    ws_manager = WebSocketManager(max_connections=settings.ws_max_connections)
    agent_service = AgentService(
        db_service=db_service,
        ws_manager=ws_manager,
        openai_api_key=settings.openai_api_key,
        anthropic_api_key=settings.anthropic_api_key
    )
    
    # Start background tasks
    asyncio.create_task(ws_manager.start_ping_task(settings.ws_ping_interval))
    
    logger.info("AI Agent Service started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down AI Agent Service...")
    await ws_manager.close_all_connections()
    logger.info("AI Agent Service shutdown complete")


# Create FastAPI app
app = FastAPI(
    title="NeonPro AI Agent Service",
    description="AI-powered healthcare data assistant with AG-UI protocol support",
    version=settings.agent_version,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check database connection
        await db_service.health_check()
        
        return {
            "status": "healthy",
            "service": "ai-agent",
            "version": settings.agent_version,
            "timestamp": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e)
            }
        )


# WebSocket endpoint for AG-UI protocol
@app.websocket("/ws/agent")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for AG-UI protocol communication"""
    await ws_manager.connect(websocket)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            
            # Process message
            response = await agent_service.process_message(data)
            
            # Send response back
            await ws_manager.send_personal_message(response, websocket)
            
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
        logger.info("Client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket)


# REST API endpoint for agent queries
@app.post("/api/agent/query")
async def agent_query(query: dict):
    """REST API endpoint for agent queries"""
    try:
        # Validate JWT token if present
        token = query.get("token")
        if token:
            # In a real implementation, validate the JWT
            pass
        
        # Process the query
        response = await agent_service.process_query(query)
        
        return {
            "success": True,
            "data": response,
            "timestamp": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        logger.error(f"Query processing error: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e)
            }
        )


# Agent capabilities endpoint
@app.get("/api/agent/capabilities")
async def get_capabilities():
    """Get agent capabilities"""
    return {
        "capabilities": AGENT_CAPABILITIES,
        "supported_languages": SUPPORTED_LANGUAGES,
        "version": settings.agent_version
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )