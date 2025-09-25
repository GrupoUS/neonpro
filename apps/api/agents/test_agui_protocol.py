"""
Test suite for AG-UI protocol event handling and WebSocket communication
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import asyncio
import json
import websockets
from typing import Dict, Any, List

pytestmark = pytest.mark.unit

class TestAGUIProtocol:
    """Test cases for AG-UI protocol event handling"""

    @pytest.mark.asyncio
    async def test_websocket_connection_establishment(self):
        """Test WebSocket connection establishment"""
        with patch('websockets.connect') as mock_connect:
            mock_websocket = AsyncMock()
            mock_connect.return_value.__aenter__.return_value = mock_websocket
            
            from src.realtime.agui_protocol import AGUIProtocol
            
            protocol = AGUIProtocol()
            
            # Test connection
            connected = await protocol.connect("ws://localhost:8000/ws/agui/test_user")
            
            assert connected is True
            mock_connect.assert_called_once_with("ws://localhost:8000/ws/agui/test_user")

    @pytest.mark.asyncio
    async def test_agui_message_processing(self, test_agui_message):
        """Test AG-UI protocol message processing"""
        with patch('src.realtime.agui_protocol.WebSocketClient') as mock_client:
            mock_protocol = AsyncMock()
            mock_client.return_value = mock_protocol
            
            from src.realtime.agui_protocol import AGUIProtocol
            
            protocol = AGUIProtocol()
            
            # Test message processing
            processed = await protocol.process_message(test_agui_message)
            
            assert processed is True
            mock_protocol.send_message.assert_called_once()

    @pytest.mark.asyncio
    async def test_agui_event_types(self):
        """Test different AG-UI event types"""
        event_types = [
            "connection",
            "message",
            "response",
            "action",
            "heartbeat",
            "error",
            "disconnect"
        ]
        
        from src.realtime.agui_protocol import AGUIProtocol
        
        protocol = AGUIProtocol()
        
        for event_type in event_types:
            event_data = {
                "id": f"test_{event_type}",
                "type": event_type,
                "timestamp": 1704067200,
                "data": {}
            }
            
            is_valid = protocol.validate_event(event_data)
            assert is_valid is True

    @pytest.mark.asyncio
    async def test_message_broadcasting(self):
        """Test message broadcasting to multiple clients"""
        mock_clients = [AsyncMock() for _ in range(3)]
        
        with patch('src.realtime.agui_protocol.ConnectionManager') as mock_manager:
            mock_manager.get_connected_clients.return_value = mock_clients
            
            from src.realtime.agui_protocol import AGUIProtocol
            
            protocol = AGUIProtocol()
            
            test_message = {
                "id": "broadcast_001",
                "type": "message",
                "data": {"content": "Broadcast message"}
            }
            
            # Test broadcasting
            await protocol.broadcast_message(test_message)
            
            # All clients should receive the message
            for client in mock_clients:
                client.send.assert_called_once()

    @pytest.mark.asyncio
    async def test_heartbeat_mechanism(self):
        """Test heartbeat mechanism for connection health"""
        with patch('src.realtime.agui_protocol.WebSocketClient') as mock_client:
            mock_protocol = AsyncMock()
            mock_client.return_value = mock_protocol
            
            from src.realtime.agui_protocol import AGUIProtocol
            
            protocol = AGUIProtocol()
            
            # Test heartbeat
            await protocol.send_heartbeat()
            
            mock_protocol.send_message.assert_called_once()
            call_args = mock_protocol.send_message.call_args[0][0]
            assert call_args["type"] == "heartbeat"

    @pytest.mark.asyncio
    async def test_connection_management(self):
        """Test connection management and client tracking"""
        with patch('src.realtime.agui_protocol.ConnectionManager') as mock_manager:
            mock_manager.add_client.return_value = "client_001"
            mock_manager.remove_client.return_value = True
            mock_manager.get_client_count.return_value = 1
            
            from src.realtime.agui_protocol import AGUIProtocol
            
            protocol = AGUIProtocol()
            
            # Add client
            client_id = await protocol.add_client("ws://localhost:8000/ws/client1")
            assert client_id == "client_001"
            
            # Get client count
            count = await protocol.get_client_count()
            assert count == 1
            
            # Remove client
            removed = await protocol.remove_client("client_001")
            assert removed is True

    @pytest.mark.asyncio
    async def test_error_handling(self):
        """Test error handling and recovery mechanisms"""
        with patch('src.realtime.agui_protocol.WebSocketClient') as mock_client:
            mock_protocol = AsyncMock()
            mock_protocol.send_message.side_effect = Exception("Connection lost")
            mock_client.return_value = mock_protocol
            
            from src.realtime.agui_protocol import AGUIProtocol
            
            protocol = AGUIProtocol()
            
            # Test error handling
            error_event = {
                "id": "error_001",
                "type": "error",
                "data": {
                    "code": "CONNECTION_ERROR",
                    "message": "Connection lost",
                    "severity": "high"
                }
            }
            
            handled = await protocol.handle_error(error_event)
            assert handled is True

    @pytest.mark.asyncio
    async def test_protocol_compliance_validation(self):
        """Test AG-UI protocol compliance validation"""
        from src.realtime.agui_protocol import AGUIProtocol
        
        protocol = AGUIProtocol()
        
        # Valid message
        valid_message = {
            "id": "msg_001",
            "type": "message",
            "timestamp": 1704067200,
            "data": {
                "message": {
                    "id": "content_001",
                    "content": "Test message",
                    "type": "text"
                }
            }
        }
        
        is_valid = protocol.validate_message(valid_message)
        assert is_valid is True
        
        # Invalid message (missing required fields)
        invalid_messages = [
            {},  # Empty message
            {"id": "msg_001"},  # Missing type
            {"id": "msg_001", "type": "message"},  # Missing timestamp
            {"id": "msg_001", "type": "message", "timestamp": 1704067200},  # Missing data
        ]
        
        for invalid_msg in invalid_messages:
            is_valid = protocol.validate_message(invalid_msg)
            assert is_valid is False

    @pytest.mark.asyncio
    async def test_real_time_communication_flow(self):
        """Test real-time communication flow between client and server"""
        mock_client = AsyncMock()
        
        # Mock receiving a message
        received_message = {
            "id": "msg_001",
            "type": "message",
            "timestamp": 1704067200,
            "data": {
                "message": {
                    "id": "content_001",
                    "content": "Hello, I need help",
                    "type": "text"
                }
            }
        }
        
        # Expected response
        response_message = {
            "id": "response_001",
            "type": "response",
            "timestamp": 1704067201,
            "data": {
                "message": {
                    "id": "response_content_001",
                    "content": "I'd be happy to help you",
                    "type": "text"
                }
            }
        }
        
        mock_client.receive.return_value = json.dumps(received_message)
        mock_client.send.return_value = True
        
        with patch('src.realtime.agui_protocol.WebSocketClient', return_value=mock_client):
            from src.realtime.agui_protocol import AGUIProtocol
            
            protocol = AGUIProtocol()
            
            # Test communication flow
            await protocol.handle_communication()
            
            mock_client.receive.assert_called_once()
            mock_client.send.assert_called_once()

    @pytest.mark.asyncio
    async def test_websocket_reconnection_logic(self):
        """Test WebSocket reconnection logic"""
        with patch('src.realtime.agui_protocol.WebSocketClient') as mock_client:
            mock_protocol = AsyncMock()
            mock_protocol.connect.side_effect = [
                Exception("Connection failed"),
                Exception("Connection failed"),
                True  # Third attempt succeeds
            ]
            mock_client.return_value = mock_protocol
            
            from src.realtime.agui_protocol import AGUIProtocol
            
            protocol = AGUIProtocol()
            
            # Test reconnection with backoff
            connected = await protocol.connect_with_retry("ws://localhost:8000/ws/agui/test_user")
            
            assert connected is True
            assert mock_protocol.connect.call_count == 3

    @pytest.mark.asyncio
    async def test_message_queueing(self):
        """Test message queueing when connection is lost"""
        with patch('src.realtime.agui_protocol.MessageQueue') as mock_queue:
            mock_queue.add_message.return_value = True
            mock_queue.get_pending_messages.return_value = [
                {"id": "queued_001", "type": "message", "data": {"content": "Queued message"}}
            ]
            
            from src.realtime.agui_protocol import AGUIProtocol
            
            protocol = AGUIProtocol()
            
            # Queue message when offline
            queued = await protocol.queue_message({"id": "test_001", "type": "message", "data": {}})
            assert queued is True
            
            # Process pending messages when back online
            processed = await protocol.process_pending_messages()
            assert processed is True

    @pytest.mark.asyncio
    async def test_security_validation(self):
        """Test security validation for incoming messages"""
        from src.realtime.agui_protocol import AGUIProtocol
        
        protocol = AGUIProtocol()
        
        # Test message with suspicious content
        suspicious_message = {
            "id": "malicious_001",
            "type": "message",
            "timestamp": 1704067200,
            "data": {
                "message": {
                    "id": "malicious_content",
                    "content": "<script>alert('xss')</script>",
                    "type": "text"
                }
            }
        }
        
        is_safe = protocol.validate_security(suspicious_message)
        assert is_safe is False
        
        # Test safe message
        safe_message = {
            "id": "safe_001",
            "type": "message",
            "timestamp": 1704067200,
            "data": {
                "message": {
                    "id": "safe_content",
                    "content": "This is a safe message",
                    "type": "text"
                }
            }
        }
        
        is_safe = protocol.validate_security(safe_message)
        assert is_safe is True

    @pytest.mark.asyncio
    async def test_performance_monitoring(self):
        """Test performance monitoring for WebSocket connections"""
        with patch('src.realtime.agui_protocol.PerformanceMonitor') as mock_monitor:
            mock_monitor.record_message.return_value = True
            mock_monitor.get_metrics.return_value = {
                "messages_sent": 100,
                "messages_received": 95,
                "average_response_time": 0.05,
                "connection_uptime": 3600
            }
            
            from src.realtime.agui_protocol import AGUIProtocol
            
            protocol = AGUIProtocol()
            
            # Record message metrics
            await protocol.record_message_metrics("sent", 0.05)
            
            # Get performance metrics
            metrics = await protocol.get_performance_metrics()
            
            assert metrics["messages_sent"] == 100
            assert metrics["average_response_time"] == 0.05

    @pytest.mark.asyncio
    async def test_connection_state_management(self):
        """Test connection state management"""
        from src.realtime.agui_protocol import AGUIProtocol
        
        protocol = AGUIProtocol()
        
        # Test initial state
        assert protocol.get_connection_state() == "disconnected"
        
        # Test state transitions
        await protocol.set_connection_state("connecting")
        assert protocol.get_connection_state() == "connecting"
        
        await protocol.set_connection_state("connected")
        assert protocol.get_connection_state() == "connected"
        
        await protocol.set_connection_state("disconnected")
        assert protocol.get_connection_state() == "disconnected"