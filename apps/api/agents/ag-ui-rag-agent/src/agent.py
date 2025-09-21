"""
Main AG-UI RAG Agent class
"""

import asyncio
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Union
import structlog
import websockets
from fastapi import WebSocket, WebSocketDisconnect
import openai
import anthropic

from .config import AgentConfig, AIProvider
from .database import SupabaseManager
from .vector_store import VectorStoreManager
from .embeddings import EmbeddingManager
from .retriever import HealthcareRetriever

logger = structlog.get_logger(__name__)


class AgUiRagAgent:
    """Main AG-UI RAG Agent for healthcare data operations"""
    
    def __init__(self, config: AgentConfig):
        self.config = config
        self.db_manager = None
        self.vector_store = None
        self.embedding_manager = None
        self.healthcare_retriever = None
        self.active_connections: Dict[str, WebSocket] = {}
        self.agent_sessions: Dict[str, Dict[str, Any]] = {}
        self._initialized = False
        self._initialization_lock = asyncio.Lock()
        
    async def initialize(self) -> None:
        """Initialize the agent and all components"""
        async with self._initialization_lock:
            if self._initialized:
                return
            
            try:
                logger.info("Initializing AG-UI RAG Agent", 
                           version=self.config.version,
                           environment=self.config.environment)
                
                # Initialize database manager
                self.db_manager = SupabaseManager(self.config)
                await self.db_manager.initialize()
                
                # Initialize embedding manager
                self.embedding_manager = EmbeddingManager(self.config)
                await self.embedding_manager.initialize()
                
                # Initialize vector store
                self.vector_store = VectorStoreManager(self.config, self.db_manager)
                await self.vector_store.initialize()
                
                # Initialize healthcare retriever
                self.healthcare_retriever = HealthcareRetriever(
                    self.config, self.db_manager, self.vector_store
                )
                
                # Initialize AI clients
                await self._initialize_ai_clients()
                
                # Warm up components
                await self._warm_up_components()
                
                # Start background tasks
                await self._start_background_tasks()
                
                self._initialized = True
                
                logger.info("AG-UI RAG Agent initialized successfully")
                
            except Exception as e:
                logger.error("Failed to initialize AG-UI RAG Agent", error=str(e))
                raise
    
    async def _initialize_ai_clients(self) -> None:
        """Initialize AI provider clients"""
        try:
            if self.config.ai.provider == AIProvider.OPENAI:
                openai.api_key = self.config.ai.api_key
                
            elif self.config.ai.provider == AIProvider.ANTHROPIC:
                self.anthropic_client = anthropic.Anthropic(
                    api_key=self.config.ai.api_key
                )
                
            elif self.config.ai.provider == AIProvider.LOCAL:
                # Initialize local AI client if needed
                pass
                
            logger.info("AI clients initialized", provider=self.config.ai.provider)
            
        except Exception as e:
            logger.error("Failed to initialize AI clients", error=str(e))
            raise
    
    async def _warm_up_components(self) -> None:
        """Warm up components to ensure they're ready"""
        try:
            # Warm up embedding manager
            await self.embedding_manager.warm_up()
            
            # Create sample embedding to test vector store
            test_text = "Warm-up test for vector store"
            await self.vector_store.create_embedding(test_text)
            
            logger.info("Component warm-up completed")
            
        except Exception as e:
            logger.error("Component warm-up failed", error=str(e))
            # Don't raise - warm-up failures shouldn't stop initialization
    
    async def _start_background_tasks(self) -> None:
        """Start background maintenance tasks"""
        try:
            # Start session cleanup task
            asyncio.create_task(self._session_cleanup_loop())
            
            # Start expired sessions cleanup
            asyncio.create_task(self._expired_sessions_cleanup())
            
            logger.info("Background tasks started")
            
        except Exception as e:
            logger.error("Failed to start background tasks", error=str(e))
    
    async def _session_cleanup_loop(self) -> None:
        """Background task to clean up inactive sessions"""
        while True:
            try:
                await asyncio.sleep(3600)  # Run every hour
                await self.cleanup_inactive_sessions()
            except Exception as e:
                logger.error("Session cleanup failed", error=str(e))
    
    async def _expired_sessions_cleanup(self) -> None:
        """Background task to clean up expired sessions"""
        while True:
            try:
                await asyncio.sleep(1800)  # Run every 30 minutes
                cleaned_count = await self.db_manager.cleanup_expired_sessions()
                if cleaned_count > 0:
                    logger.info("Cleaned up expired sessions", count=cleaned_count)
            except Exception as e:
                logger.error("Expired sessions cleanup failed", error=str(e))
    
    async def process_query(
        self,
        query: str,
        session_id: str,
        user_id: str,
        patient_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Process a user query and return response"""
        try:
            if not self._initialized:
                await self.initialize()
            
            # Create query log
            query_id = str(uuid.uuid4())
            logger.info("Processing query", 
                       query_id=query_id,
                       session_id=session_id,
                       user_id=user_id,
                       query_length=len(query))
            
            # Get or create session
            session = await self._get_or_create_session(session_id, user_id, context)
            
            # Get relevant context for the query
            relevant_context = await self.healthcare_retriever.get_relevant_context(
                query=query,
                user_id=user_id,
                patient_id=patient_id,
                limit=10
            )
            
            # Generate response using AI
            response = await self._generate_ai_response(
                query=query,
                context=relevant_context,
                session_context=session.get("context", {}),
                user_id=user_id,
                patient_id=patient_id
            )
            
            # Update session context
            await self._update_session_context(session_id, query, response)
            
            # Log for compliance
            if self.config.compliance.audit_logging:
                await self._log_query(
                    query_id=query_id,
                    session_id=session_id,
                    user_id=user_id,
                    patient_id=patient_id,
                    query=query,
                    response=response
                )
            
            result = {
                "query_id": query_id,
                "response": response,
                "context_used": relevant_context,
                "session_updated": True,
                "timestamp": datetime.now().isoformat()
            }
            
            logger.info("Query processed successfully", 
                       query_id=query_id,
                       response_length=len(response.get("content", "")))
            
            return result
            
        except Exception as e:
            logger.error("Failed to process query", 
                        session_id=session_id,
                        user_id=user_id,
                        error=str(e))
            
            return {
                "error": str(e),
                "query_id": str(uuid.uuid4()),
                "timestamp": datetime.now().isoformat()
            }
    
    async def _get_or_create_session(
        self,
        session_id: str,
        user_id: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Get existing session or create new one"""
        try:
            # Try to get existing session
            session = await self.db_manager.get_session(session_id)
            
            if session:
                # Update session activity
                await self.db_manager.update_session(session_id, {
                    "updated_at": datetime.now(timezone.utc).isoformat()
                })
                return session
            
            # Create new session
            expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
            
            session = await self.db_manager.create_session(
                session_id=session_id,
                user_id=user_id,
                title="Healthcare Assistant Session",
                context=context or {},
                expires_at=expires_at
            )
            
            # Store in active sessions
            self.agent_sessions[session_id] = {
                "user_id": user_id,
                "created_at": datetime.now(timezone.utc),
                "expires_at": expires_at,
                "context": context or {}
            }
            
            return session
            
        except Exception as e:
            logger.error("Failed to get or create session", error=str(e))
            raise
    
    async def _generate_ai_response(
        self,
        query: str,
        context: Dict[str, Any],
        session_context: Dict[str, Any],
        user_id: str,
        patient_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate AI response based on query and context"""
        try:
            # Construct prompt with context
            system_prompt = self._build_system_prompt(context, session_context)
            
            # Add compliance and security context
            compliance_context = self._build_compliance_context(user_id, patient_id)
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "system", "content": compliance_context},
                {"role": "user", "content": query}
            ]
            
            # Generate response based on AI provider
            if self.config.ai.provider == AIProvider.OPENAI:
                response = await self._generate_openai_response(messages)
            elif self.config.ai.provider == AIProvider.ANTHROPIC:
                response = await self._generate_anthropic_response(messages)
            else:
                response = await self._generate_local_response(messages)
            
            # Post-process response
            processed_response = self._post_process_response(response, context)
            
            return processed_response
            
        except Exception as e:
            logger.error("Failed to generate AI response", error=str(e))
            return {
                "content": "I apologize, but I encountered an error processing your request. Please try again.",
                "type": "error",
                "timestamp": datetime.now().isoformat()
            }
    
    def _build_system_prompt(self, context: Dict[str, Any], session_context: Dict[str, Any]) -> str:
        """Build system prompt with relevant context"""
        prompt_parts = [
            "You are a helpful healthcare assistant for the NeonPro healthcare system.",
            "Your role is to assist healthcare professionals with patient data, medical knowledge, and administrative tasks.",
            "",
            "Guidelines:",
            "- Be helpful and concise in your responses",
            "- Prioritize patient privacy and data security",
            "- Provide accurate medical information based on the available context",
            "- If you don't have enough information, ask for clarification",
            "- Always maintain professional tone",
            "",
        ]
        
        # Add context from search results
        if context.get("results"):
            prompt_parts.append("Relevant Context:")
            for result in context["results"]:
                result_type = result.get("type", "unknown")
                result_data = result.get("data", {})
                
                if result_type == "patient_data":
                    prompt_parts.append("- Patient information available")
                elif result_type == "medical_knowledge":
                    prompt_parts.append("- Medical knowledge base accessible")
                elif result_type == "appointments":
                    prompt_parts.append("- Appointment scheduling data available")
                elif result_type == "financial":
                    prompt_parts.append("- Financial summary data available")
        
        # Add session context
        if session_context:
            prompt_parts.append("")
            prompt_parts.append("Session Context:")
            prompt_parts.append(f"- User preferences: {session_context.get('preferences', {})}")
            prompt_parts.append(f"- Previous topics: {session_context.get('previous_topics', [])}")
        
        return "\n".join(prompt_parts)
    
    def _build_compliance_context(self, user_id: str, patient_id: Optional[str] = None) -> str:
        """Build compliance context for AI"""
        compliance_parts = [
            "Compliance and Security Requirements:",
            "- All patient data must be handled in compliance with LGPD regulations",
            "- Never share sensitive patient information without proper authorization",
            "- Maintain data confidentiality and integrity",
            "- Follow healthcare data protection best practices",
        ]
        
        if patient_id:
            compliance_parts.append(f"- Accessing data for patient ID: {patient_id}")
        
        compliance_parts.append(f"- User ID: {user_id}")
        compliance_parts.append(f"- Timestamp: {datetime.now().isoformat()}")
        
        return "\n".join(compliance_parts)
    
    async def _generate_openai_response(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate response using OpenAI"""
        try:
            response = await openai.ChatCompletion.acreate(
                model=self.config.ai.model,
                messages=messages,
                max_tokens=self.config.ai.max_tokens,
                temperature=self.config.ai.temperature,
                stream=False
            )
            
            return {
                "content": response.choices[0].message.content,
                "model": self.config.ai.model,
                "provider": "openai",
                "usage": response.usage,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error("OpenAI response generation failed", error=str(e))
            raise
    
    async def _generate_anthropic_response(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate response using Anthropic"""
        try:
            # Convert messages to Anthropic format
            system_message = ""
            user_message = ""
            
            for msg in messages:
                if msg["role"] == "system":
                    system_message += msg["content"] + "\n\n"
                elif msg["role"] == "user":
                    user_message = msg["content"]
            
            response = await self.anthropic_client.messages.create(
                model=self.config.ai.model,
                max_tokens=self.config.ai.max_tokens,
                temperature=self.config.ai.temperature,
                system=system_message,
                messages=[{"role": "user", "content": user_message}]
            )
            
            return {
                "content": response.content[0].text,
                "model": self.config.ai.model,
                "provider": "anthropic",
                "usage": {
                    "input_tokens": response.usage.input_tokens,
                    "output_tokens": response.usage.output_tokens
                },
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error("Anthropic response generation failed", error=str(e))
            raise
    
    async def _generate_local_response(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate response using local AI (placeholder)"""
        # This would integrate with local AI models
        return {
            "content": "Local AI response generation not yet implemented.",
            "model": "local",
            "provider": "local",
            "timestamp": datetime.now().isoformat()
        }
    
    def _post_process_response(self, response: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Post-process AI response"""
        # Add metadata and ensure compliance
        processed_response = response.copy()
        
        # Add response metadata
        processed_response["metadata"] = {
            "compliance_standards": [std.value for std in self.config.compliance.enabled_standards],
            "data_sources_used": len(context.get("results", [])),
            "agent_version": self.config.version
        }
        
        # Ensure no PII in response (basic check)
        content = processed_response.get("content", "")
        if self._contains_pii(content):
            processed_response["content"] = self._sanitize_pii(content)
            processed_response["pii_sanitized"] = True
        
        return processed_response
    
    def _contains_pii(self, text: str) -> bool:
        """Basic PII detection (simplified)"""
        # Check for common PII patterns
        pii_patterns = [
            r'\b\d{3}\.\d{3}\.\d{3}-\d{2}\b',  # CPF
            r'\b\d{11}\b',  # Phone numbers
            r'\b[\w\.-]+@[\w\.-]+\.\w+\b',  # Email
            r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b',  # Credit card
        ]
        
        for pattern in pii_patterns:
            if re.search(pattern, text):
                return True
        
        return False
    
    def _sanitize_pii(self, text: str) -> str:
        """Basic PII sanitization"""
        # Replace PII patterns with placeholders
        sanitized = text
        
        pii_patterns = {
            r'\b\d{3}\.\d{3}\.\d{3}-\d{2}\b': '[CPF REMOVIDO]',
            r'\b\d{11}\b': '[TELEFONE REMOVIDO]',
            r'\b[\w\.-]+@[\w\.-]+\.\w+\b': '[EMAIL REMOVIDO]',
            r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b': '[CARTÃO REMOVIDO]',
        }
        
        for pattern, replacement in pii_patterns.items():
            sanitized = re.sub(pattern, replacement, sanitized)
        
        return sanitized
    
    async def _update_session_context(
        self,
        session_id: str,
        query: str,
        response: Dict[str, Any]
    ) -> None:
        """Update session context with new interaction"""
        try:
            session = self.agent_sessions.get(session_id)
            if not session:
                return
            
            # Update context
            context = session.get("context", {})
            
            # Add to conversation history
            if "conversation_history" not in context:
                context["conversation_history"] = []
            
            context["conversation_history"].append({
                "query": query,
                "response": response.get("content", ""),
                "timestamp": datetime.now().isoformat()
            })
            
            # Keep only last 10 conversations
            if len(context["conversation_history"]) > 10:
                context["conversation_history"] = context["conversation_history"][-10:]
            
            # Update session
            await self.db_manager.update_session(session_id, {
                "context": context,
                "updated_at": datetime.now(timezone.utc).isoformat()
            })
            
            # Update local cache
            session["context"] = context
            
        except Exception as e:
            logger.error("Failed to update session context", error=str(e))
    
    async def _log_query(
        self,
        query_id: str,
        session_id: str,
        user_id: str,
        patient_id: Optional[str],
        query: str,
        response: Dict[str, Any]
    ) -> None:
        """Log query for compliance and analytics"""
        try:
            log_data = {
                "query_id": query_id,
                "session_id": session_id,
                "user_id": user_id,
                "patient_id": patient_id,
                "query": query,
                "response_type": response.get("type", "normal"),
                "timestamp": datetime.now().isoformat(),
                "compliance_standards": [std.value for std in self.config.compliance.enabled_standards]
            }
            
            self.db_manager.supabase.table("rag_agent_query_log").insert(log_data).execute()
            
        except Exception as e:
            logger.error("Failed to log query", error=str(e))
    
    async def cleanup_inactive_sessions(self) -> int:
        """Clean up inactive sessions"""
        try:
            current_time = datetime.now(timezone.utc)
            inactive_sessions = []
            
            # Find inactive sessions (no activity for 1 hour)
            for session_id, session in self.agent_sessions.items():
                last_activity = session.get("last_activity", session.get("created_at"))
                if isinstance(last_activity, str):
                    last_activity = datetime.fromisoformat(last_activity.replace('Z', '+00:00'))
                
                if current_time - last_activity > timedelta(hours=1):
                    inactive_sessions.append(session_id)
            
            # Clean up inactive sessions
            for session_id in inactive_sessions:
                del self.agent_sessions[session_id]
            
            logger.info("Cleaned up inactive sessions", count=len(inactive_sessions))
            return len(inactive_sessions)
            
        except Exception as e:
            logger.error("Failed to cleanup inactive sessions", error=str(e))
            return 0
    
    async def handle_websocket_connection(self, websocket: WebSocket, session_id: str) -> None:
        """Handle WebSocket connection for real-time communication"""
        try:
            await websocket.accept()
            self.active_connections[session_id] = websocket
            
            logger.info("WebSocket connection established", session_id=session_id)
            
            try:
                while True:
                    # Receive message from client
                    data = await websocket.receive_json()
                    
                    # Process the message
                    response = await self.process_websocket_message(data, session_id)
                    
                    # Send response back
                    await websocket.send_json(response)
                    
            except WebSocketDisconnect:
                logger.info("WebSocket disconnected", session_id=session_id)
                
        except Exception as e:
            logger.error("WebSocket connection error", 
                        session_id=session_id,
                        error=str(e))
        finally:
            # Clean up connection
            if session_id in self.active_connections:
                del self.active_connections[session_id]
    
    async def process_websocket_message(
        self,
        data: Dict[str, Any],
        session_id: str
    ) -> Dict[str, Any]:
        """Process WebSocket message"""
        try:
            message_type = data.get("type")
            
            if message_type == "query":
                return await self.process_query(
                    query=data.get("query", ""),
                    session_id=session_id,
                    user_id=data.get("user_id", ""),
                    patient_id=data.get("patient_id"),
                    context=data.get("context")
                )
            
            elif message_type == "ping":
                return {"type": "pong", "timestamp": datetime.now().isoformat()}
            
            elif message_type == "session_update":
                # Handle session updates
                await self._update_session_context(
                    session_id,
                    data.get("query", ""),
                    data.get("response", {})
                )
                return {"type": "session_updated", "timestamp": datetime.now().isoformat()}
            
            else:
                return {
                    "type": "error",
                    "message": f"Unknown message type: {message_type}",
                    "timestamp": datetime.now().isoformat()
                }
                
        except Exception as e:
            logger.error("Failed to process WebSocket message", error=str(e))
            return {
                "type": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def get_agent_status(self) -> Dict[str, Any]:
        """Get agent status and statistics"""
        try:
            vector_stats = await self.vector_store.get_statistics()
            
            status = {
                "agent": {
                    "name": self.config.name,
                    "version": self.config.version,
                    "environment": self.config.environment,
                    "initialized": self._initialized,
                    "uptime": "N/A"  # Would track actual uptime
                },
                "components": {
                    "database": "connected" if self.db_manager else "disconnected",
                    "embedding_manager": self.embedding_manager.get_model_info() if self.embedding_manager else None,
                    "vector_store": vector_stats,
                    "healthcare_retriever": "active" if self.healthcare_retriever else "inactive"
                },
                "connections": {
                    "active_sessions": len(self.agent_sessions),
                    "websocket_connections": len(self.active_connections)
                },
                "compliance": {
                    "enabled_standards": [std.value for std in self.config.compliance.enabled_standards],
                    "audit_logging": self.config.compliance.audit_logging,
                    "pii_detection": self.config.compliance.pii_detection
                },
                "timestamp": datetime.now().isoformat()
            }
            
            return status
            
        except Exception as e:
            logger.error("Failed to get agent status", error=str(e))
            return {"error": str(e), "timestamp": datetime.now().isoformat()}
    
    async def shutdown(self) -> None:
        """Shutdown the agent gracefully"""
        try:
            logger.info("Shutting down AG-UI RAG Agent")
            
            # Close database connections
            if self.db_manager:
                await self.db_manager.close()
            
            # Close WebSocket connections
            for websocket in self.active_connections.values():
                await websocket.close()
            
            self.active_connections.clear()
            self.agent_sessions.clear()
            
            logger.info("AG-UI RAG Agent shutdown completed")
            
        except Exception as e:
            logger.error("Agent shutdown failed", error=str(e))