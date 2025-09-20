#!/usr/bin/env python3
"""
AG-UI Protocol Implementation for NeonPro Healthcare Platform
Implements real-time communication layer between frontend and AI agent
"""

import asyncio
import json
import logging
import ssl
import time
from datetime import datetime
from enum import Enum
from typing import Dict, Any, List, Optional, Callable, Union
from dataclasses import dataclass, asdict
from fastapi import WebSocket, WebSocketDisconnect
import uuid
import jwt
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import base64

from tls_config import TLSConfig

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AGUIEventType(Enum):
    """AG-UI Protocol event types"""
    CONNECTION = "connection"
    MESSAGE = "message"
    RESPONSE = "response"
    ERROR = "error"
    HEARTBEAT = "heartbeat"
    ACTION = "action"
    SESSION_UPDATE = "session_update"
    FEEDBACK = "feedback"
    STREAM_START = "stream_start"
    STREAM_CHUNK = "stream_chunk"
    STREAM_END = "stream_end"

class AGUIConnectionState(Enum):
    """Connection states"""
    CONNECTING = "connecting"
    CONNECTED = "connected"
    AUTHENTICATED = "authenticated"
    DISCONNECTED = "disconnected"
    ERROR = "error"

@dataclass
class AGUIEvent:
    """AG-UI Protocol event structure"""
    id: str
    type: AGUIEventType
    timestamp: float
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    data: Dict[str, Any] = None
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.data is None:
            self.data = {}
        if self.metadata is None:
            self.metadata = {}
        if self.timestamp is None:
            self.timestamp = time.time()

@dataclass
class AGUIMessage:
    """AG-UI Protocol message structure"""
    id: str
    content: str
    type: str = "text"
    actions: List[Dict[str, Any]] = None
    metadata: Dict[str, Any] = None
    streaming: bool = False
    
    def __post_init__(self):
        if self.actions is None:
            self.actions = []
        if self.metadata is None:
            self.metadata = {}

class AGUIProtocolEncryption:
    """End-to-end encryption for AG-UI Protocol"""
    
    def __init__(self, key: bytes = None):
        self.key = key or self._generate_key()
        
    def _generate_key(self) -> bytes:
        """Generate encryption key"""
        return PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=b'neonpro_agui_salt',
            iterations=100000,
            backend=default_backend()
        ).derive(b'neonpro_agui_key_material')
    
    def encrypt(self, data: str) -> str:
        """Encrypt data"""
        iv = b'initializationve'  # In production, use proper IV generation
        cipher = Cipher(
            algorithms.AES(self.key),
            modes.CFB(iv),
            backend=default_backend()
        )
        encryptor = cipher.encryptor()
        encrypted = encryptor.update(data.encode()) + encryptor.finalize()
        return base64.b64encode(encrypted).decode()
    
    def decrypt(self, encrypted_data: str) -> str:
        """Decrypt data"""
        encrypted = base64.b64decode(encrypted_data)
        iv = b'initializationve'
        cipher = Cipher(
            algorithms.AES(self.key),
            modes.CFB(iv),
            backend=default_backend()
        )
        decryptor = cipher.decryptor()
        decrypted = decryptor.update(encrypted) + decryptor.finalize()
        return decrypted.decode()

class AGUISession:
    """AG-UI Protocol session management"""
    
    def __init__(self, session_id: str, user_id: str, websocket: WebSocket):
        self.session_id = session_id
        self.user_id = user_id
        self.websocket = websocket
        self.state = AGUIConnectionState.CONNECTED
        self.created_at = datetime.now()
        self.last_activity = datetime.now()
        self.message_count = 0
        self.encryption = AGUIProtocolEncryption()
        self.context = {}
        self.streaming = False
        
    async def send_event(self, event: AGUIEvent):
        """Send event to client"""
        try:
            event_dict = asdict(event)
            event_dict['type'] = event.type.value
            
            # Encrypt sensitive data
            if event.type in [AGUIEventType.MESSAGE, AGUIEventType.RESPONSE]:
                event_dict['data'] = self.encryption.encrypt(json.dumps(event.data))
                event_dict['encrypted'] = True
            
            await self.websocket.send_text(json.dumps(event_dict))
            self.last_activity = datetime.now()
            self.message_count += 1
            
        except Exception as e:
            logger.error(f"Error sending event to session {self.session_id}: {e}")
            raise
    
    async def send_message(self, message: AGUIMessage):
        """Send message to client"""
        event = AGUIEvent(
            id=str(uuid.uuid4()),
            type=AGUIEventType.RESPONSE,
            session_id=self.session_id,
            user_id=self.user_id,
            data={
                'message': asdict(message)
            }
        )
        await self.send_event(event)
    
    async def send_error(self, error_code: str, error_message: str):
        """Send error to client"""
        event = AGUIEvent(
            id=str(uuid.uuid4()),
            type=AGUIEventType.ERROR,
            session_id=self.session_id,
            user_id=self.user_id,
            data={
                'code': error_code,
                'message': error_message
            }
        )
        await self.send_event(event)
    
    async def heartbeat(self):
        """Send heartbeat to client"""
        event = AGUIEvent(
            id=str(uuid.uuid4()),
            type=AGUIEventType.HEARTBEAT,
            session_id=self.session_id,
            user_id=self.user_id,
            data={
                'timestamp': time.time(),
                'message_count': self.message_count
            }
        )
        await self.send_event(event)

class AGUIProtocol:
    """AG-UI Protocol implementation"""
    
    def __init__(self, tls_config: TLSConfig = None):
        self.tls_config = tls_config or TLSConfig()
        self.sessions: Dict[str, AGUISession] = {}
        self.event_handlers: Dict[AGUIEventType, List[Callable]] = {}
        self.message_handlers: List[Callable] = []
        self.encryption = AGUIProtocolEncryption()
        
        # Register default handlers
        self._register_default_handlers()
    
    def _register_default_handlers(self):
        """Register default event handlers"""
        self.register_handler(AGUIEventType.CONNECTION, self._handle_connection)
        self.register_handler(AGUIEventType.HEARTBEAT, self._handle_heartbeat)
        self.register_handler(AGUIEventType.MESSAGE, self._handle_message)
        self.register_handler(AGUIEventType.FEEDBACK, self._handle_feedback)
    
    def register_handler(self, event_type: AGUIEventType, handler: Callable):
        """Register event handler"""
        if event_type not in self.event_handlers:
            self.event_handlers[event_type] = []
        self.event_handlers[event_type].append(handler)
    
    def register_message_handler(self, handler: Callable):
        """Register message handler"""
        self.message_handlers.append(handler)
    
    async def create_session(self, websocket: WebSocket, user_id: str) -> AGUISession:
        """Create new AG-UI session"""
        session_id = str(uuid.uuid4())
        session = AGUISession(session_id, user_id, websocket)
        
        # Send connection established event
        connection_event = AGUIEvent(
            id=str(uuid.uuid4()),
            type=AGUIEventType.CONNECTION,
            session_id=session_id,
            user_id=user_id,
            data={
                'status': 'connected',
                'session_id': session_id,
                'protocol_version': '1.0',
                'encryption': 'aes-256-cfb',
                'tls_version': '1.3'
            }
        )
        
        await session.send_event(connection_event)
        self.sessions[session_id] = session
        
        logger.info(f"Created AG-UI session {session_id} for user {user_id}")
        return session
    
    async def handle_websocket(self, websocket: WebSocket, user_id: str):
        """Handle WebSocket connection"""
        try:
            # Create session
            session = await self.create_session(websocket, user_id)
            
            # Start heartbeat task
            heartbeat_task = asyncio.create_task(self._heartbeat_loop(session))
            
            try:
                while True:
                    # Receive message
                    data = await websocket.receive_text()
                    
                    try:
                        # Parse message
                        message_data = json.loads(data)
                        event = AGUIEvent(
                            id=message_data.get('id', str(uuid.uuid4())),
                            type=AGUIEventType(message_data.get('type', 'message')),
                            timestamp=message_data.get('timestamp', time.time()),
                            session_id=session.session_id,
                            user_id=session.user_id,
                            data=message_data.get('data', {}),
                            metadata=message_data.get('metadata', {})
                        )
                        
                        # Decrypt if encrypted
                        if message_data.get('encrypted') and event.data:
                            try:
                                event.data = json.loads(session.encryption.decrypt(event.data))
                            except Exception as e:
                                logger.warning(f"Failed to decrypt message: {e}")
                        
                        # Handle event
                        await self._handle_event(session, event)
                        
                    except json.JSONDecodeError:
                        await session.send_error("INVALID_FORMAT", "Invalid JSON format")
                    except ValueError as e:
                        await session.send_error("INVALID_EVENT_TYPE", str(e))
                    
            except WebSocketDisconnect:
                logger.info(f"WebSocket disconnected for session {session.session_id}")
            finally:
                # Clean up
                heartbeat_task.cancel()
                if session.session_id in self.sessions:
                    del self.sessions[session.session_id]
                
        except Exception as e:
            logger.error(f"Error handling WebSocket: {e}")
    
    async def _handle_event(self, session: AGUISession, event: AGUIEvent):
        """Handle incoming event"""
        try:
            # Update session activity
            session.last_activity = datetime.now()
            
            # Call registered handlers
            if event.type in self.event_handlers:
                for handler in self.event_handlers[event.type]:
                    try:
                        await handler(session, event)
                    except Exception as e:
                        logger.error(f"Error in event handler for {event.type}: {e}")
            
            # Special handling for message events
            if event.type == AGUIEventType.MESSAGE:
                for handler in self.message_handlers:
                    try:
                        await handler(session, event)
                    except Exception as e:
                        logger.error(f"Error in message handler: {e}")
        
        except Exception as e:
            logger.error(f"Error handling event {event.type}: {e}")
            await session.send_error("EVENT_HANDLER_ERROR", str(e))
    
    async def _handle_connection(self, session: AGUISession, event: AGUIEvent):
        """Handle connection event"""
        session.state = AGUIConnectionState.AUTHENTICATED
        logger.info(f"Session {session.session_id} authenticated")
    
    async def _handle_heartbeat(self, session: AGUISession, event: AGUIEvent):
        """Handle heartbeat event"""
        # Echo heartbeat back
        await session.heartbeat()
    
    async def _handle_message(self, session: AGUISession, event: AGUIEvent):
        """Handle message event (default implementation)"""
        # Default message handler - can be overridden
        response = AGUIMessage(
            id=str(uuid.uuid4()),
            content="Message received",
            type="acknowledgment"
        )
        await session.send_message(response)
    
    async def _handle_feedback(self, session: AGUISession, event: AGUIEvent):
        """Handle feedback event"""
        feedback_data = event.data
        logger.info(f"Received feedback from session {session.session_id}: {feedback_data}")
        
        # Send acknowledgment
        response = AGUIMessage(
            id=str(uuid.uuid4()),
            content="Feedback received",
            type="acknowledgment"
        )
        await session.send_message(response)
    
    async def _heartbeat_loop(self, session: AGUISession):
        """Send periodic heartbeats"""
        while True:
            try:
                await asyncio.sleep(30)  # Send heartbeat every 30 seconds
                await session.heartbeat()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error sending heartbeat: {e}")
                break
    
    async def broadcast_to_all(self, event: AGUIEvent):
        """Broadcast event to all active sessions"""
        for session in self.sessions.values():
            try:
                await session.send_event(event)
            except Exception as e:
                logger.error(f"Error broadcasting to session {session.session_id}: {e}")
    
    async def send_to_user(self, user_id: str, event: AGUIEvent):
        """Send event to specific user"""
        for session in self.sessions.values():
            if session.user_id == user_id:
                try:
                    await session.send_event(event)
                except Exception as e:
                    logger.error(f"Error sending to user {user_id}: {e}")
    
    def get_session(self, session_id: str) -> Optional[AGUISession]:
        """Get session by ID"""
        return self.sessions.get(session_id)
    
    def get_user_sessions(self, user_id: str) -> List[AGUISession]:
        """Get all sessions for a user"""
        return [session for session in self.sessions.values() if session.user_id == user_id]
    
    async def cleanup_inactive_sessions(self, max_inactive_minutes: int = 30):
        """Clean up inactive sessions"""
        current_time = datetime.now()
        inactive_sessions = []
        
        for session_id, session in self.sessions.items():
            inactive_time = (current_time - session.last_activity).total_seconds() / 60
            if inactive_time > max_inactive_minutes:
                inactive_sessions.append(session_id)
        
        for session_id in inactive_sessions:
            try:
                await self.sessions[session_id].websocket.close()
                del self.sessions[session_id]
                logger.info(f"Cleaned up inactive session {session_id}")
            except Exception as e:
                logger.error(f"Error cleaning up session {session_id}: {e}")

# Factory function for creating AG-UI Protocol instances
def create_agui_protocol(tls_config: TLSConfig = None) -> AGUIProtocol:
    """Create AG-UI Protocol instance with configuration"""
    return AGUIProtocol(tls_config)