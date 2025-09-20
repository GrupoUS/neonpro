"""
NeonPro AG-UI RAG Agent
Healthcare database query agent with AG-UI protocol integration
"""

import asyncio
import json
import os
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Request, Response, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from agui import AGUIServer, AGUIMessage
from agent_config import AgentConfig
from tls_config import TLSConfig, get_tls_config
from agui_protocol import AGUIProtocol, AGUIEvent, AGUIEventType, AGUIMessage, create_agui_protocol

class NeonProDataAgent:
    """Healthcare data query agent using AG-UI protocol"""
    
    def __init__(self):
        self.config = AgentConfig()
        self.tls_config = TLSConfig()
        self.agui_protocol = create_agui_protocol(self.tls_config)
        self.app = FastAPI(
            title="NeonPro Data Agent",
            description="Healthcare conversational database agent",
            version="1.0.0"
        )
        self.setup_middleware()
        self.setup_routes()
        self.setup_agui_handlers()
        
    def setup_middleware(self):
        """Configure CORS and security middleware"""
        
        # Trusted hosts middleware
        self.app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=["localhost", "127.0.0.1", "neonpro.com", "api.neonpro.com"]
        )
        
        # CORS middleware with HTTPS enforcement
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=self.config.ALLOWED_ORIGINS,
            allow_credentials=True,
            allow_methods=["GET", "POST", "OPTIONS"],
            allow_headers=["Content-Type", "Authorization", "X-Request-ID"],
        )
        
        # Security headers middleware
        @self.app.middleware("http")
        async def add_security_headers(request: Request, call_next):
            response = await call_next(request)
            
            # Add security headers
            security_headers = self.tls_config.get_security_headers()
            for header, value in security_headers.items():
                response.headers[header] = value
            
            # Add AG-UI specific headers
            response.headers["X-AG-UI-Version"] = "1.0"
            response.headers["X-AG-UI-Security"] = "TLSv1.3"
            
            return response
    
    def setup_routes(self):
        """Setup API routes"""
        
        @self.app.get("/health")
        async def health_check():
            return {"status": "healthy", "agent": self.config.AGENT_NAME}
        
        @self.app.websocket("/ws/agui/{user_id}")
        async def websocket_endpoint(websocket: WebSocket, user_id: str):
            """AG-UI Protocol WebSocket endpoint"""
            await websocket.accept()
            
            # Validate user ID and authentication
            if not await self.validate_user(user_id, websocket):
                await websocket.close(code=4000, reason="Authentication failed")
                return
            
            # Handle AG-UI protocol connection
            await self.agui_protocol.handle_websocket(websocket, user_id)
        
        @self.app.post("/agui/http")
        async def agui_http_endpoint(message: Dict[str, Any]):
            """HTTP fallback for AG-UI protocol"""
            try:
                return await self.process_agui_message(message)
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.get("/agui/sessions/{user_id}")
        async def get_user_sessions(user_id: str):
            """Get active sessions for user"""
            if not await self.validate_user_id(user_id):
                raise HTTPException(status_code=403, detail="Invalid user")
            
            sessions = self.agui_protocol.get_user_sessions(user_id)
            return {
                "sessions": [
                    {
                        "session_id": session.session_id,
                        "user_id": session.user_id,
                        "state": session.state.value,
                        "created_at": session.created_at.isoformat(),
                        "last_activity": session.last_activity.isoformat(),
                        "message_count": session.message_count
                    }
                    for session in sessions
                ]
            }
        
        @self.app.post("/agui/broadcast")
        async def broadcast_message(request: Dict[str, Any]):
            """Broadcast message to all users (admin only)"""
            if not await self.validate_admin_access(request):
                raise HTTPException(status_code=403, detail="Admin access required")
            
            event = AGUIEvent(
                id=request.get("id", "broadcast"),
                type=AGUIEventType(request.get("type", "message")),
                data=request.get("data", {})
            )
            
            await self.agui_protocol.broadcast_to_all(event)
            return {"status": "broadcast_sent"}
        
        @self.app.post("/agui/send/{user_id}")
        async def send_to_user(user_id: str, request: Dict[str, Any]):
            """Send message to specific user"""
            if not await self.validate_user_id(user_id):
                raise HTTPException(status_code=403, detail="Invalid user")
            
            event = AGUIEvent(
                id=request.get("id", f"to_{user_id}"),
                type=AGUIEventType(request.get("type", "message")),
                data=request.get("data", {})
            )
            
            await self.agui_protocol.send_to_user(user_id, event)
            return {"status": "message_sent"}
        
        @self.app.post("/agui/cleanup")
        async def cleanup_sessions():
            """Clean up inactive sessions (admin only)"""
            # In production, add proper authentication
            await self.agui_protocol.cleanup_inactive_sessions()
            return {"status": "cleanup_completed"}
    
    def setup_agui_handlers(self):
        """Setup AG-UI protocol message handlers"""
        
        # Register custom message handler
        self.agui_protocol.register_message_handler(self.handle_agui_message)
        
        # Register session update handler
        self.agui_protocol.register_handler(AGUIEventType.SESSION_UPDATE, self.handle_session_update)
    
    async def validate_user(self, user_id: str, websocket: WebSocket) -> bool:
        """Validate user authentication"""
        # In production, implement proper JWT validation
        # For now, accept any non-empty user ID
        return bool(user_id and user_id.strip())
    
    async def validate_user_id(self, user_id: str) -> bool:
        """Validate user ID format"""
        return bool(user_id and len(user_id) > 0)
    
    async def validate_admin_access(self, request: Dict[str, Any]) -> bool:
        """Validate admin access"""
        # In production, implement proper admin role validation
        return request.get("admin_key") == os.getenv("ADMIN_API_KEY")
    
    async def handle_agui_message(self, session, event: AGUIEvent):
        """Handle incoming AG-UI message"""
        try:
            message_data = event.data.get("message", {})
            query = message_data.get("content", "")
            message_type = message_data.get("type", "text")
            
            if not query:
                await session.send_error("EMPTY_QUERY", "Query content cannot be empty")
                return
            
            # Process the query
            response = await self.process_healthcare_query(query, session.session_id, message_type)
            
            # Send response back
            await session.send_message(response)
            
        except Exception as e:
            logger.error(f"Error handling AG-UI message: {e}")
            await session.send_error("PROCESSING_ERROR", str(e))
    
    async def handle_session_update(self, session, event: AGUIEvent):
        """Handle session update events"""
        update_data = event.data
        session.context.update(update_data.get("context", {}))
        
        # Send acknowledgment
        response = AGUIMessage(
            id=str(uuid.uuid4()),
            content="Session updated",
            type="acknowledgment"
        )
        await session.send_message(response)
    
    async def process_healthcare_query(self, query: str, session_id: str, message_type: str) -> AGUIMessage:
        """Process healthcare-related queries"""
        # Placeholder for actual RAG processing
        # This will connect to Supabase and healthcare data in Phase 3
        
        # Simulate processing time
        await asyncio.sleep(0.5)
        
        # Create response message
        response = AGUIMessage(
            id=str(uuid.uuid4()),
            content=f"Recebido sua consulta: '{query}'. Estou processando sua solicitação...",
            type=message_type,
            metadata={
                "agent": self.config.AGENT_NAME,
                "session_id": session_id,
                "processing_time": 500,
                "timestamp": datetime.now().isoformat()
            }
        )
        
        # Add actions for common healthcare queries
        if "agendamento" in query.lower() or "consulta" in query.lower():
            response.actions = [
                {
                    "id": "schedule_appointment",
                    "label": "Agendar Consulta",
                    "icon": "Calendar",
                    "primary": True,
                    "action": {
                        "type": "navigate",
                        "destination": "/appointments/new"
                    }
                },
                {
                    "id": "view_appointments",
                    "label": "Ver Agendamentos",
                    "icon": "Calendar",
                    "primary": False,
                    "action": {
                        "type": "navigate",
                        "destination": "/appointments"
                    }
                }
            ]
        
        elif "paciente" in query.lower() or "cliente" in query.lower():
            response.actions = [
                {
                    "id": "search_patients",
                    "label": "Buscar Pacientes",
                    "icon": "Search",
                    "primary": True,
                    "action": {
                        "type": "navigate",
                        "destination": "/patients/search"
                    }
                },
                {
                    "id": "add_patient",
                    "label": "Adicionar Paciente",
                    "icon": "Plus",
                    "primary": False,
                    "action": {
                        "type": "navigate",
                        "destination": "/patients/new"
                    }
                }
            ]
        
        return response

def create_app() -> FastAPI:
    """Create and configure the FastAPI application"""
    agent = NeonProDataAgent()
    return agent.app

if __name__ == "__main__":
    # Validate configuration
    AgentConfig.validate_config()
    
    # Validate TLS configuration in production
    if os.getenv("NODE_ENV") == "production":
        try:
            TLSConfig.validate_configuration()
            print("✅ TLS 1.3 configuration validated")
        except Exception as e:
            print(f"❌ TLS configuration validation failed: {e}")
            raise
    
    # Create and run the agent
    app = create_app()
    
    # SSL configuration for production
    ssl_config = None
    if os.getenv("NODE_ENV") == "production":
        try:
            ssl_config = get_tls_config()
            print("🔒 TLS 1.3 enabled for secure AG-UI communication")
        except Exception as e:
            print(f"⚠️  TLS configuration failed, falling back to HTTP: {e}")
    
    uvicorn.run(
        app,
        host=AgentConfig.HOST,
        port=AgentConfig.PORT,
        ssl=ssl_config,
        log_level="info",
        # Additional security settings
        limit_concurrency=100,
        timeout_keep_alive=30,
        timeout_graceful_shutdown=10
    )