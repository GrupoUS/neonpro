"""
Tests for WebSocket Manager
"""

import pytest
import asyncio
import json
from unittest.mock import MagicMock, AsyncMock
from fastapi import WebSocket
from services.websocket_manager import WebSocketManager


class TestWebSocketManager:
    """Test cases for WebSocketManager"""

    @pytest.mark.asyncio
    async def test_connect_success(self):
        """Test successful WebSocket connection"""
        manager = WebSocketManager(max_connections=10)
        
        # Mock WebSocket
        mock_websocket = MagicMock()
        mock_websocket.accept = AsyncMock()
        mock_websocket.send_json = AsyncMock()
        mock_websocket.client = MagicMock()
        mock_websocket.client.host = "127.0.0.1"
        mock_websocket.headers = {"user-agent": "test-agent"}
        
        await manager.connect(mock_websocket)
        
        assert len(manager.active_connections) == 1
        assert manager.get_connection_count() == 1
        mock_websocket.accept.assert_called_once()
        
        # Verify welcome message was sent
        mock_websocket.send_json.assert_called_once()
        sent_message = mock_websocket.send_json.call_args[0][0]
        assert sent_message["type"] == "connection_established"

    @pytest.mark.asyncio
    async def test_connect_max_connections(self):
        """Test connection limit"""
        manager = WebSocketManager(max_connections=1)
        
        # First connection
        mock_websocket1 = MagicMock()
        mock_websocket1.accept = AsyncMock()
        await manager.connect(mock_websocket1)
        
        # Second connection should be rejected
        mock_websocket2 = MagicMock()
        mock_websocket2.accept = AsyncMock()
        mock_websocket2.close = AsyncMock()
        await manager.connect(mock_websocket2)
        
        assert manager.get_connection_count() == 1
        mock_websocket2.close.assert_called_once_with(code=1008, reason="Maximum connections reached")

    @pytest.mark.asyncio
    async def test_disconnect(self):
        """Test WebSocket disconnection"""
        manager = WebSocketManager(max_connections=10)
        
        mock_websocket = MagicMock()
        mock_websocket.accept = AsyncMock()
        await manager.connect(mock_websocket)
        
        assert manager.get_connection_count() == 1
        
        manager.disconnect(mock_websocket)
        
        assert manager.get_connection_count() == 0

    @pytest.mark.asyncio
    async def test_send_personal_message(self):
        """Test sending message to specific client"""
        manager = WebSocketManager(max_connections=10)
        
        mock_websocket = MagicMock()
        mock_websocket.accept = AsyncMock()
        mock_websocket.send_json = AsyncMock()
        
        await manager.connect(mock_websocket)
        
        message = {"type": "test", "content": "Hello"}
        await manager.send_personal_message(message, mock_websocket)
        
        mock_websocket.send_json.assert_called_once_with(message)

    @pytest.mark.asyncio
    async def test_send_personal_message_error(self):
        """Test sending message with error"""
        manager = WebSocketManager(max_connections=10)
        
        mock_websocket = MagicMock()
        mock_websocket.accept = AsyncMock()
        mock_websocket.send_json = AsyncMock(side_effect=Exception("Connection lost"))
        
        await manager.connect(mock_websocket)
        
        message = {"type": "test", "content": "Hello"}
        await manager.send_personal_message(message, mock_websocket)
        
        # WebSocket should be disconnected
        assert manager.get_connection_count() == 0

    @pytest.mark.asyncio
    async def test_broadcast(self):
        """Test broadcasting message to all clients"""
        manager = WebSocketManager(max_connections=10)
        
        # Create multiple mock websockets
        mock_websockets = []
        for i in range(3):
            ws = MagicMock()
            ws.accept = AsyncMock()
            ws.send_json = AsyncMock()
            await manager.connect(ws)
            mock_websockets.append(ws)
        
        message = {"type": "broadcast", "content": "Hello all"}
        await manager.broadcast(message)
        
        # All websockets should receive the message
        for ws in mock_websockets:
            ws.send_json.assert_called_once_with(message)

    @pytest.mark.asyncio
    async def test_broadcast_with_disconnected(self):
        """Test broadcasting with some disconnected clients"""
        manager = WebSocketManager(max_connections=10)
        
        # Create mock websockets
        ws1 = MagicMock()
        ws1.accept = AsyncMock()
        ws1.send_json = AsyncMock()
        
        ws2 = MagicMock()
        ws2.accept = AsyncMock()
        ws2.send_json = AsyncMock(side_effect=Exception("Disconnected"))
        
        await manager.connect(ws1)
        await manager.connect(ws2)
        
        message = {"type": "broadcast", "content": "Hello"}
        await manager.broadcast(message)
        
        # Only ws1 should receive message
        ws1.send_json.assert_called_once()
        # ws2 should be disconnected
        assert manager.get_connection_count() == 1

    @pytest.mark.asyncio
    async def test_send_to_client(self):
        """Test sending message to client by ID"""
        manager = WebSocketManager(max_connections=10)
        
        mock_websocket = MagicMock()
        mock_websocket.accept = AsyncMock()
        mock_websocket.send_json = AsyncMock()
        
        await manager.connect(mock_websocket, client_id="test_client")
        
        message = {"type": "private", "content": "Hello"}
        await manager.send_to_client("test_client", message)
        
        mock_websocket.send_json.assert_called_once_with(message)

    @pytest.mark.asyncio
    async def test_send_to_nonexistent_client(self):
        """Test sending message to non-existent client"""
        manager = WebSocketManager(max_connections=10)
        
        # Should not raise error
        await manager.send_to_client("nonexistent", {"type": "test"})

    @pytest.mark.asyncio
    async def test_start_ping_task(self):
        """Test starting ping task"""
        manager = WebSocketManager(max_connections=10)
        
        mock_websocket = MagicMock()
        mock_websocket.accept = AsyncMock()
        mock_websocket.send_json = AsyncMock()
        
        await manager.connect(mock_websocket)
        
        # Start ping task
        await manager.start_ping_task(interval=0.1)  # Short interval for testing
        
        # Wait for a few pings
        await asyncio.sleep(0.25)
        
        # Should have received pings
        assert mock_websocket.send_json.call_count >= 2
        
        # Stop ping task
        if manager.ping_task:
            manager.ping_task.cancel()

    @pytest.mark.asyncio
    async def test_close_all_connections(self):
        """Test closing all connections"""
        manager = WebSocketManager(max_connections=10)
        
        # Create multiple mock websockets
        mock_websockets = []
        for i in range(3):
            ws = MagicMock()
            ws.accept = AsyncMock()
            ws.close = AsyncMock()
            await manager.connect(ws)
            mock_websockets.append(ws)
        
        # Start ping task
        await manager.start_ping_task(interval=1)
        
        await manager.close_all_connections()
        
        assert manager.get_connection_count() == 0
        
        # All websockets should be closed
        for ws in mock_websockets:
            ws.close.assert_called_once()

    def test_get_connection_stats(self):
        """Test getting connection statistics"""
        manager = WebSocketManager(max_connections=10)
        
        # No connections
        stats = manager.get_connection_stats()
        assert stats["total_connections"] == 0
        assert stats["max_connections"] == 10
        assert len(stats["connections"]) == 0

    @pytest.mark.asyncio
    async def test_handle_message_pong(self):
        """Test handling pong message"""
        manager = WebSocketManager(max_connections=10)
        
        mock_websocket = MagicMock()
        mock_websocket.accept = AsyncMock()
        
        await manager.connect(mock_websocket)
        
        message = {"type": "pong"}
        await manager.handle_message(mock_websocket, message)
        
        # Should not raise error

    @pytest.mark.asyncio
    async def test_handle_message_subscribe(self):
        """Test handling subscription message"""
        manager = WebSocketManager(max_connections=10)
        
        mock_websocket = MagicMock()
        mock_websocket.accept = AsyncMock()
        mock_websocket.send_json = AsyncMock()
        
        await manager.connect(mock_websocket)
        
        message = {"type": "subscribe", "event_type": "appointments"}
        await manager.handle_message(mock_websocket, message)
        
        # Should send confirmation
        mock_websocket.send_json.assert_called()
        sent_message = mock_websocket.send_json.call_args[0][0]
        assert sent_message["type"] == "subscription_confirmed"

    @pytest.mark.asyncio
    async def test_handle_message_unsubscribe(self):
        """Test handling unsubscription message"""
        manager = WebSocketManager(max_connections=10)
        
        mock_websocket = MagicMock()
        mock_websocket.accept = AsyncMock()
        mock_websocket.send_json = AsyncMock()
        
        await manager.connect(mock_websocket)
        
        message = {"type": "unsubscribe", "event_type": "appointments"}
        await manager.handle_message(mock_websocket, message)
        
        # Should send confirmation
        mock_websocket.send_json.assert_called()
        sent_message = mock_websocket.send_json.call_args[0][0]
        assert sent_message["type"] == "unsubscription_confirmed"