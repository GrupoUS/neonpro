"""
NeonPro AG-UI RAG Agent
Healthcare database query agent with AG-UI protocol integration
"""

import asyncio
import json
import os
import uuid
from datetime import datetime
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
from healthcare_data_service import HealthcareDataService
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NeonProDataAgent:
    """Healthcare data query agent using AG-UI protocol"""

    def __init__(self):
        self.config = AgentConfig()
        self.tls_config = TLSConfig()
        self.agui_protocol = create_agui_protocol(self.tls_config)
        self.healthcare_service = HealthcareDataService(self.config)
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
        """Handle incoming AG-UI message with enhanced context"""
        try:
            message_data = event.data.get("message", {})
            query = message_data.get("content", "")
            message_type = message_data.get("type", "text")

            if not query:
                await session.send_error("EMPTY_QUERY", "Query content cannot be empty")
                return

            # Extract user context from session
            user_context = {
                'userId': session.user_id,
                'domain': session.context.get('domain', 'default'),
                'role': session.context.get('role', 'receptionist'),
                'permissions': session.context.get('permissions', [])
            }

            # Process the query with user context
            response = await self.process_healthcare_query(query, session.session_id, message_type, user_context)

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
    
    async def process_healthcare_query(self, query: str, session_id: str, message_type: str, user_context: Dict[str, Any] = None) -> AGUIMessage:
        """Process healthcare-related queries with actual data retrieval"""
        start_time = datetime.now()

        try:
            # Default user context if not provided
            if not user_context:
                user_context = {
                    'domain': 'default',
                    'role': 'receptionist',
                    'userId': 'unknown'
                }

            # Parse intent from query
            intent, entities = await self._parse_healthcare_intent(query)

            logger.info(f"Processing query: '{query}' with intent: {intent}")

            # Process based on intent
            if intent == 'upcoming_appointments':
                data = await self.healthcare_service.query_upcoming_appointments(user_context)
                content = self._format_appointments_response(data)

            elif intent == 'search_clients':
                name_query = entities.get('client_name', '')
                if not name_query:
                    # Ask for clarification
                    return self._create_clarification_response(
                        "Qual o nome do cliente que você gostaria de buscar?",
                        ["Digite o nome completo ou parte dele"],
                        "search_clients_input"
                    )

                data = await self.healthcare_service.query_clients_by_name(name_query, user_context)
                content = self._format_clients_response(data, name_query)

            elif intent == 'financial_summary':
                period = entities.get('period_days', 30)
                data = await self.healthcare_service.query_financial_summary(user_context, period)
                content = self._format_financial_response(data)

            elif intent == 'client_search_by_name':
                name_query = entities.get('client_name', '')
                data = await self.healthcare_service.query_clients_by_name(name_query, user_context)
                content = self._format_clients_response(data, name_query)

            else:
                # Default response with suggestions
                content = self._create_help_response(query)

            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds() * 1000

            # Create response message with structured data
            response = AGUIMessage(
                id=str(uuid.uuid4()),
                content=content.get('text', 'Resposta processada com sucesso'),
                type='structured_response',
                metadata={
                    "agent": self.config.AGENT_NAME,
                    "session_id": session_id,
                    "processing_time": int(processing_time),
                    "timestamp": datetime.now().isoformat(),
                    "intent": intent,
                    "entities": entities,
                    "user_role": user_context.get('role'),
                    "response_type": content.get('type')
                }
            )

            # Add structured data for frontend rendering
            if 'data' in content:
                response.data = content['data']

            # Add actions if available
            if 'actions' in content:
                response.actions = content['actions']

            # Add accessibility information
            if 'accessibility' in content:
                response.accessibility = content['accessibility']

            return response

        except Exception as e:
            logger.error(f"Error processing healthcare query: {e}")
            processing_time = (datetime.now() - start_time).total_seconds() * 1000

            return AGUIMessage(
                id=str(uuid.uuid4()),
                content="Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente em alguns momentos.",
                type='error',
                metadata={
                    "agent": self.config.AGENT_NAME,
                    "session_id": session_id,
                    "processing_time": int(processing_time),
                    "timestamp": datetime.now().isoformat(),
                    "error": str(e)
                },
                actions=[
                    {
                        "id": "retry_query",
                        "label": "Tentar Novamente",
                        "icon": "RefreshCw",
                        "variant": "default",
                        "action": {
                            "type": "retry_query"
                        }
                    }
                ]
            )

    async def _parse_healthcare_intent(self, query: str) -> Tuple[str, Dict[str, Any]]:
        """Parse intent and entities from healthcare query"""
        query_lower = query.lower()
        entities = {}

        # Appointment-related intents
        if any(keyword in query_lower for keyword in ['próximos agendamentos', 'agendamentos', 'consultas marcadas', 'agenda']):
            return 'upcoming_appointments', entities

        # Client search intents
        if any(keyword in query_lower for keyword in ['buscar cliente', 'procurar paciente', 'encontrar']):
            # Extract client name if present
            import re
            name_patterns = [
                r'buscar cliente (.+)',
                r'procurar paciente (.+)',
                r'encontrar (.+)',
                r'cliente (.+)',
                r'paciente (.+)'
            ]

            for pattern in name_patterns:
                match = re.search(pattern, query_lower)
                if match:
                    entities['client_name'] = match.group(1).strip()
                    return 'client_search_by_name', entities

            return 'search_clients', entities

        # Financial intents
        if any(keyword in query_lower for keyword in ['faturamento', 'financeiro', 'receita', 'pagamentos']):
            # Extract period if mentioned
            if 'semana' in query_lower:
                entities['period_days'] = 7
            elif 'mês' in query_lower or 'mensal' in query_lower:
                entities['period_days'] = 30
            elif 'trimestre' in query_lower:
                entities['period_days'] = 90
            else:
                entities['period_days'] = 30  # Default to 30 days

            return 'financial_summary', entities

        # Client information by name
        if 'informações' in query_lower and any(keyword in query_lower for keyword in ['cliente', 'paciente']):
            import re
            name_match = re.search(r'(?:cliente|paciente)\s+(.+)', query_lower)
            if name_match:
                entities['client_name'] = name_match.group(1).strip()
                return 'client_search_by_name', entities

        # Default intent
        return 'general_help', entities

    def _format_appointments_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Format appointments data for chat response"""
        if data['type'] == 'error':
            return {
                'text': f"❌ {data['title']}: {data['message']}",
                'type': 'error',
                'actions': data.get('actions', [])
            }

        appointments = data['data']
        count = data['count']

        if count == 0:
            return {
                'text': "📅 Não há agendamentos nos próximos 30 dias.",
                'type': 'empty_state',
                'actions': [
                    {
                        'id': 'schedule_new',
                        'label': 'Agendar Consulta',
                        'icon': 'Plus',
                        'variant': 'default',
                        'action': {
                            'type': 'navigate',
                            'destination': '/appointments/new'
                        }
                    }
                ]
            }

        # Create summary text
        summary_text = f"📅 **{data['title']}**\n\n{data['summary']}"

        return {
            'text': summary_text,
            'type': 'appointments_list',
            'data': data,
            'actions': [
                {
                    'id': 'view_calendar',
                    'label': 'Ver Calendário Completo',
                    'icon': 'Calendar',
                    'variant': 'default',
                    'action': {
                        'type': 'navigate',
                        'destination': '/appointments/calendar'
                    }
                }
            ],
            'accessibility': data.get('accessibility')
        }

    def _format_clients_response(self, data: Dict[str, Any], search_query: str = '') -> Dict[str, Any]:
        """Format clients data for chat response"""
        if data['type'] == 'error':
            return {
                'text': f"❌ {data['title']}: {data['message']}",
                'type': 'error',
                'actions': data.get('actions', [])
            }

        if data['type'] == 'access_denied':
            return {
                'text': f"🔒 {data['title']}: {data['message']}",
                'type': 'access_denied',
                'actions': data.get('actions', [])
            }

        count = data['count']

        if count == 0:
            return {
                'text': f"👤 Nenhum cliente encontrado para '{search_query}'.",
                'type': 'empty_state',
                'actions': [
                    {
                        'id': 'add_client',
                        'label': 'Cadastrar Novo Cliente',
                        'icon': 'UserPlus',
                        'variant': 'default',
                        'action': {
                            'type': 'navigate',
                            'destination': '/clients/new'
                        }
                    }
                ]
            }

        # Create summary text
        summary_text = f"👥 **{data['title']}**\n\n{data['summary']}"

        return {
            'text': summary_text,
            'type': 'clients_list',
            'data': data,
            'actions': [
                {
                    'id': 'view_all_clients',
                    'label': 'Ver Todos os Clientes',
                    'icon': 'Users',
                    'variant': 'outline',
                    'action': {
                        'type': 'navigate',
                        'destination': '/clients'
                    }
                }
            ],
            'accessibility': data.get('accessibility')
        }

    def _format_financial_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Format financial data for chat response"""
        if data['type'] == 'error':
            return {
                'text': f"❌ {data['title']}: {data['message']}",
                'type': 'error',
                'actions': data.get('actions', [])
            }

        if data['type'] == 'access_denied':
            return {
                'text': f"🔒 {data['title']}: {data['message']}",
                'type': 'access_denied',
                'actions': data.get('actions', [])
            }

        financial_data = data['data']
        revenue = financial_data['totalRevenue']['formatted']
        pending = financial_data['pendingPayments']['formatted']
        transactions = financial_data['completedTransactions']['formatted']

        summary_text = f"💰 **{data['title']}**\n\n" + \
                      f"📈 Receita Total: **{revenue}**\n" + \
                      f"⏱️ Pagamentos Pendentes: {pending}\n" + \
                      f"✅ Transações Completadas: {transactions}"

        return {
            'text': summary_text,
            'type': 'financial_summary',
            'data': data,
            'actions': [
                {
                    'id': 'detailed_report',
                    'label': 'Relatório Detalhado',
                    'icon': 'BarChart3',
                    'variant': 'default',
                    'action': {
                        'type': 'navigate',
                        'destination': '/reports/financial'
                    }
                }
            ],
            'accessibility': data.get('accessibility')
        }

    def _create_clarification_response(self, question: str, suggestions: List[str], input_type: str) -> AGUIMessage:
        """Create a clarification request response"""
        return AGUIMessage(
            id=str(uuid.uuid4()),
            content=f"❓ {question}",
            type='clarification',
            metadata={
                "agent": self.config.AGENT_NAME,
                "timestamp": datetime.now().isoformat(),
                "requires_input": True,
                "input_type": input_type
            },
            suggestions=suggestions
        )

    def _create_help_response(self, original_query: str) -> Dict[str, Any]:
        """Create helpful response with suggestions"""
        return {
            'text': f"🤖 Olá! Não consegui entender exatamente o que você precisa com '{original_query}'.\n\n" + \
                   "Aqui estão algumas coisas que posso ajudar:",
            'type': 'help',
            'actions': [
                {
                    'id': 'check_appointments',
                    'label': 'Ver Próximos Agendamentos',
                    'icon': 'Calendar',
                    'variant': 'default',
                    'action': {
                        'type': 'send_message',
                        'message': 'Quais são os próximos agendamentos?'
                    }
                },
                {
                    'id': 'search_client',
                    'label': 'Buscar Cliente',
                    'icon': 'Search',
                    'variant': 'outline',
                    'action': {
                        'type': 'send_message',
                        'message': 'Buscar cliente'
                    }
                },
                {
                    'id': 'financial_summary',
                    'label': 'Resumo Financeiro',
                    'icon': 'DollarSign',
                    'variant': 'outline',
                    'action': {
                        'type': 'send_message',
                        'message': 'Como está o faturamento?'
                    }
                }
            ]
        }

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