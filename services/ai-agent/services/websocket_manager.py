"""
WebSocket manager for handling real-time connections
"""

import asyncio
import json
import logging
from typing import Dict, List, Set
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime

logger = logging.getLogger(__name__)


class WebSocketManager:
    """Manages WebSocket connections for AG-UI protocol"""
    
    def __init__(self, max_connections: int = 100):
        self.active_connections: Dict[str, WebSocket] = {}
        self.connection_metadata: Dict[str, Dict] = {}
        self.max_connections = max_connections
        self.ping_task = None
        self.ping_interval = 30
        
    async def connect(self, websocket: WebSocket, client_id: str = None):
        """Accept a new WebSocket connection"""
        if len(self.active_connections) >= self.max_connections:
            await websocket.close(code=1008, reason="Maximum connections reached")
            return
            
        await websocket.accept()
        
        # Generate client ID if not provided
        if not client_id:
            client_id = f"client_{len(self.active_connections)}_{datetime.now().timestamp()}"
            
        self.active_connections[client_id] = websocket
        self.connection_metadata[client_id] = {
            'connected_at': datetime.now(),
            'last_activity': datetime.now(),
            'ip_address': websocket.client.host if websocket.client else 'unknown',
            'user_agent': websocket.headers.get('user-agent', 'unknown')
        }
        
        logger.info(f"Client connected: {client_id}")
        
        # Send welcome message
        welcome_message = {
            'type': 'connection_established',
            'client_id': client_id,
            'timestamp': datetime.now().isoformat(),
            'message': 'Connected to NeonPro AI Agent'
        }
        
        await self.send_personal_message(welcome_message, websocket)
        
    def disconnect(self, websocket: WebSocket):
        """Disconnect a WebSocket client"""
        # Find and remove the connection
        for client_id, ws in list(self.active_connections.items()):
            if ws == websocket:
                del self.active_connections[client_id]
                if client_id in self.connection_metadata:
                    del self.connection_metadata[client_id]
                logger.info(f"Client disconnected: {client_id}")
                break
                
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send a message to a specific client"""
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending message: {e}")
            self.disconnect(websocket)
            
    async def broadcast(self, message: dict):
        """Broadcast a message to all connected clients"""
        if not self.active_connections:
            return
            
        disconnected = []
        
        for client_id, websocket in self.active_connections.items():
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to {client_id}: {e}")
                disconnected.append(websocket)
                
        # Clean up disconnected clients
        for ws in disconnected:
            self.disconnect(ws)
            
    async def send_to_client(self, client_id: str, message: dict):
        """Send a message to a specific client by ID"""
        if client_id in self.active_connections:
            await self.send_personal_message(message, self.active_connections[client_id])
        else:
            logger.warning(f"Client not found: {client_id}")
            
    async def start_ping_task(self, interval: int = 30):
        """Start a background task to ping clients"""
        self.ping_interval = interval
        self.ping_task = asyncio.create_task(self._ping_clients())
        
    async def _ping_clients(self):
        """Ping all connected clients periodically"""
        while True:
            await asyncio.sleep(self.ping_interval)
            
            if not self.active_connections:
                continue
                
            ping_message = {
                'type': 'ping',
                'timestamp': datetime.now().isoformat()
            }
            
            await self.broadcast(ping_message)
            
    async def close_all_connections(self):
        """Close all WebSocket connections"""
        if self.ping_task:
            self.ping_task.cancel()
            try:
                await self.ping_task
            except asyncio.CancelledError:
                pass
                
        # Close all connections
        for websocket in list(self.active_connections.values()):
            try:
                await websocket.close()
            except Exception as e:
                logger.error(f"Error closing connection: {e}")
                
        self.active_connections.clear()
        self.connection_metadata.clear()
        
    def get_connection_count(self) -> int:
        """Get the number of active connections"""
        return len(self.active_connections)
        
    def get_connection_stats(self) -> Dict:
        """Get connection statistics"""
        now = datetime.now()
        stats = {
            'total_connections': len(self.active_connections),
            'max_connections': self.max_connections,
            'connections': []
        }
        
        for client_id, metadata in self.connection_metadata.items():
            connection_time = (now - metadata['connected_at']).total_seconds()
            idle_time = (now - metadata['last_activity']).total_seconds()
            
            stats['connections'].append({
                'client_id': client_id,
                'connected_at': metadata['connected_at'].isoformat(),
                'connection_time_seconds': connection_time,
                'idle_time_seconds': idle_time,
                'ip_address': metadata['ip_address'],
                'user_agent': metadata['user_agent']
            })
            
        return stats
        
    async def handle_message(self, websocket: WebSocket, data: dict):
        """Handle incoming WebSocket message"""
        client_id = None
        
        # Find client ID
        for cid, ws in self.active_connections.items():
            if ws == websocket:
                client_id = cid
                break
                
        if not client_id:
            return
            
        # Update last activity
        if client_id in self.connection_metadata:
            self.connection_metadata[client_id]['last_activity'] = datetime.now()
            
        # Handle different message types
        message_type = data.get('type')
        
        if message_type == 'pong':
            # Client responded to ping
            pass
        elif message_type == 'subscribe':
            # Handle subscription to events
            await self._handle_subscription(client_id, data)
        elif message_type == 'unsubscribe':
            # Handle unsubscription from events
            await self._handle_unsubscription(client_id, data)
        else:
            # Handle other message types
            logger.debug(f"Received message from {client_id}: {message_type}")
            
    async def _handle_subscription(self, client_id: str, data: dict):
        """Handle subscription to events"""
        event_type = data.get('event_type')
        
        # In a real implementation, you would:
        # 1. Add the client to a subscription list for the event type
        # 2. Send confirmation
        
        response = {
            'type': 'subscription_confirmed',
            'event_type': event_type,
            'timestamp': datetime.now().isoformat()
        }
        
        await self.send_to_client(client_id, response)
        
    async def _handle_unsubscription(self, client_id: str, data: dict):
        """Handle unsubscription from events"""
        event_type = data.get('event_type')
        
        # In a real implementation, you would:
        # 1. Remove the client from the subscription list
        # 2. Send confirmation
        
        response = {
            'type': 'unsubscription_confirmed',
            'event_type': event_type,
            'timestamp': datetime.now().isoformat()
        }
        
        await self.send_to_client(client_id, response)