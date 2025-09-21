"""
Main entry point for AG-UI RAG Agent
"""

import asyncio
import logging
import signal
import sys
from contextlib import asynccontextmanager
from typing import Optional
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import structlog

from .agent import AgUiRagAgent
from .config import AgentConfig

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger(__name__)

# Global agent instance
agent_instance: Optional[AgUiRagAgent] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global agent_instance
    
    # Startup
    logger.info("Starting AG-UI RAG Agent application")
    
    try:
        # Load configuration
        config = AgentConfig.from_env()
        
        # Validate configuration
        config_errors = config.validate_config()
        if config_errors:
            logger.error("Configuration validation failed", errors=config_errors)
            raise ValueError(f"Configuration errors: {config_errors}")
        
        # Initialize agent
        agent_instance = AgUiRagAgent(config)
        await agent_instance.initialize()
        
        logger.info("AG-UI RAG Agent application started successfully")
        
        yield
        
    except Exception as e:
        logger.error("Failed to start AG-UI RAG Agent", error=str(e))
        raise
    
    # Shutdown
    logger.info("Shutting down AG-UI RAG Agent application")
    
    if agent_instance:
        await agent_instance.shutdown()
    
    logger.info("AG-UI RAG Agent application shutdown completed")


# Create FastAPI application
app = FastAPI(
    title="AG-UI RAG Agent API",
    description="Healthcare RAG agent with Supabase integration",
    version="0.1.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "AG-UI RAG Agent",
        "version": "0.1.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        if agent_instance is None:
            raise HTTPException(status_code=503, detail="Agent not initialized")
        
        status = await agent_instance.get_agent_status()
        
        if not status.get("agent", {}).get("initialized", False):
            raise HTTPException(status_code=503, detail="Agent not ready")
        
        return {
            "status": "healthy",
            "agent_status": status,
            "timestamp": status.get("timestamp")
        }
        
    except Exception as e:
        logger.error("Health check failed", error=str(e))
        raise HTTPException(status_code=503, detail=str(e))


@app.post("/api/ai/data-agent")
async def data_agent_endpoint(request: dict):
    """Data agent endpoint for processing queries"""
    try:
        if agent_instance is None:
            raise HTTPException(status_code=503, detail="Agent not available")
        
        # Extract required fields
        query = request.get("query")
        session_id = request.get("session_id")
        user_id = request.get("user_id")
        
        if not query or not session_id or not user_id:
            raise HTTPException(
                status_code=400, 
                detail="Missing required fields: query, session_id, user_id"
            )
        
        # Process the query
        result = await agent_instance.process_query(
            query=query,
            session_id=session_id,
            user_id=user_id,
            patient_id=request.get("patient_id"),
            context=request.get("context")
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Data agent endpoint error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/ai/sessions/{session_id}")
async def get_session_endpoint(session_id: str):
    """Get session information"""
    try:
        if agent_instance is None:
            raise HTTPException(status_code=503, detail="Agent not available")
        
        session = await agent_instance.db_manager.get_session(session_id)
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return session
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Get session endpoint error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/sessions/{session_id}/feedback")
async def session_feedback_endpoint(session_id: str, feedback: dict):
    """Handle session feedback"""
    try:
        if agent_instance is None:
            raise HTTPException(status_code=503, detail="Agent not available")
        
        # Store feedback (would implement feedback storage)
        feedback_data = {
            "session_id": session_id,
            "feedback": feedback,
            "timestamp": agent_instance.db_manager.supabase.table("session_feedback").insert(feedback_data).execute()
        }
        
        return {"status": "feedback_received", "feedback_id": feedback_data["data"][0]["id"]}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Session feedback endpoint error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/ai/status")
async def agent_status_endpoint():
    """Get agent status"""
    try:
        if agent_instance is None:
            raise HTTPException(status_code=503, detail="Agent not available")
        
        status = await agent_instance.get_agent_status()
        return status
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Agent status endpoint error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@app.websocket("/ws/agent/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time communication"""
    try:
        if agent_instance is None:
            await websocket.close(code=1013, reason="Agent not available")
            return
        
        await agent_instance.handle_websocket_connection(websocket, session_id)
        
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected", session_id=session_id)
    except Exception as e:
        logger.error("WebSocket endpoint error", 
                    session_id=session_id,
                    error=str(e))
        try:
            await websocket.close(code=1011, reason=str(e))
        except:
            pass


def setup_signal_handlers():
    """Setup signal handlers for graceful shutdown"""
    def signal_handler(signum, frame):
        logger.info("Received shutdown signal", signal=signum)
        if agent_instance:
            asyncio.create_task(agent_instance.shutdown())
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)


def main():
    """Main entry point"""
    setup_signal_handlers()
    
    # Load configuration
    try:
        config = AgentConfig.from_env()
        
        # Run the server
        uvicorn.run(
            "main:app",
            host=config.agui_host,
            port=config.agui_port,
            reload=config.environment == "development",
            log_level=config.logging.level.lower()
        )
        
    except Exception as e:
        logger.error("Failed to start application", error=str(e))
        sys.exit(1)


if __name__ == "__main__":
    main()