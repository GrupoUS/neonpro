"""
Test suite for session management and context persistence
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any

pytestmark = pytest.mark.unit

class TestSessionManagement:
    """Test cases for session management and context persistence"""

    @pytest.mark.asyncio
    async def test_session_creation(self, mock_database_manager, test_user_data):
        """Test session creation with user data"""
        with patch('src.session.DatabaseManager', return_value=mock_database_manager):
            from src.session import SessionManager
            
            session_manager = SessionManager()
            
            session_id = await session_manager.create_session(
                user_id=test_user_data["id"],
                user_data=test_user_data
            )
            
            assert session_id is not None
            assert isinstance(session_id, str)
            mock_database_manager.create_session.assert_called_once()

    @pytest.mark.asyncio
    async def test_session_retrieval(self, mock_database_manager, test_session_data):
        """Test session retrieval by session ID"""
        mock_database_manager.get_session.return_value = test_session_data
        
        with patch('src.session.DatabaseManager', return_value=mock_database_manager):
            from src.session import SessionManager
            
            session_manager = SessionManager()
            
            session = await session_manager.get_session(test_session_data["id"])
            
            assert session == test_session_data
            assert session["user_id"] == "test_user_123"
            mock_database_manager.get_session.assert_called_once_with(test_session_data["id"])

    @pytest.mark.asyncio
    async def test_session_update(self, mock_database_manager, test_session_data):
        """Test session context update"""
        mock_database_manager.update_session.return_value = True
        
        with patch('src.session.DatabaseManager', return_value=mock_database_manager):
            from src.session import SessionManager
            
            session_manager = SessionManager()
            
            update_data = {
                "current_conversation": "test_conversation_123",
                "active_tools": ["calendar", "messaging"],
                "user_preferences": {"language": "en-US"}
            }
            
            success = await session_manager.update_session(
                test_session_data["id"],
                update_data
            )
            
            assert success is True
            mock_database_manager.update_session.assert_called_once()

    @pytest.mark.asyncio
    async def test_session_deletion(self, mock_database_manager, test_session_data):
        """Test session deletion"""
        mock_database_manager.delete_session.return_value = True
        
        with patch('src.session.DatabaseManager', return_value=mock_database_manager):
            from src.session import SessionManager
            
            session_manager = SessionManager()
            
            success = await session_manager.delete_session(test_session_data["id"])
            
            assert success is True
            mock_database_manager.delete_session.assert_called_once_with(test_session_data["id"])

    @pytest.mark.asyncio
    async def test_session_expiry_handling(self, mock_database_manager, test_session_data):
        """Test session expiry detection and handling"""
        expired_session = test_session_data.copy()
        expired_session["expires_at"] = (datetime.now() - timedelta(hours=1)).isoformat()
        
        mock_database_manager.get_session.return_value = expired_session
        mock_database_manager.delete_session.return_value = True
        
        with patch('src.session.DatabaseManager', return_value=mock_database_manager):
            from src.session import SessionManager
            
            session_manager = SessionManager()
            
            # Should detect expired session
            is_expired = await session_manager.is_session_expired(expired_session["id"])
            
            assert is_expired is True
            mock_database_manager.delete_session.assert_called_once()

    @pytest.mark.asyncio
    async def test_session_timeout_extension(self, mock_database_manager, test_session_data):
        """Test session timeout extension"""
        mock_database_manager.extend_session.return_value = True
        
        with patch('src.session.DatabaseManager', return_value=mock_database_manager):
            from src.session import SessionManager
            
            session_manager = SessionManager()
            
            success = await session_manager.extend_session(
                test_session_data["id"],
                timedelta(hours=1)
            )
            
            assert success is True
            mock_database_manager.extend_session.assert_called_once()

    @pytest.mark.asyncio
    async def test_conversation_history_management(self, mock_database_manager):
        """Test conversation history storage and retrieval"""
        test_messages = [
            {
                "id": "msg_001",
                "role": "user",
                "content": "Hello, I need help with my appointment",
                "timestamp": "2024-01-01T10:00:00Z"
            },
            {
                "id": "msg_002",
                "role": "assistant",
                "content": "I'd be happy to help you with your appointment",
                "timestamp": "2024-01-01T10:00:30Z"
            }
        ]
        
        mock_database_manager.save_conversation_message.return_value = True
        mock_database_manager.get_conversation_history.return_value = test_messages
        
        with patch('src.session.DatabaseManager', return_value=mock_database_manager):
            from src.session import SessionManager
            
            session_manager = SessionManager()
            
            # Save message
            success = await session_manager.save_message(
                session_id="test_session",
                message=test_messages[0]
            )
            assert success is True
            
            # Retrieve history
            history = await session_manager.get_conversation_history("test_session")
            assert history == test_messages
            assert len(history) == 2

    @pytest.mark.asyncio
    async def test_session_context_persistence(self, mock_database_manager, test_session_data):
        """Test session context persistence across requests"""
        context_data = {
            "current_conversation": "conv_123",
            "active_tools": ["calendar", "patient_records"],
            "user_preferences": {
                "language": "pt-BR",
                "timezone": "America/Sao_Paulo"
            },
            "conversation_state": {
                "step": "collecting_information",
                "data_collected": ["name", "contact"]
            }
        }
        
        mock_database_manager.update_session_context.return_value = True
        mock_database_manager.get_session_context.return_value = context_data
        
        with patch('src.session.DatabaseManager', return_value=mock_database_manager):
            from src.session import SessionManager
            
            session_manager = SessionManager()
            
            # Save context
            success = await session_manager.save_context(
                session_id=test_session_data["id"],
                context=context_data
            )
            assert success is True
            
            # Retrieve context
            retrieved_context = await session_manager.get_context(test_session_data["id"])
            assert retrieved_context == context_data
            assert retrieved_context["active_tools"] == ["calendar", "patient_records"]

    @pytest.mark.asyncio
    async def test_session_cleanup_operations(self, mock_database_manager):
        """Test session cleanup and maintenance operations"""
        expired_sessions = ["session_001", "session_002", "session_003"]
        mock_database_manager.get_expired_sessions.return_value = expired_sessions
        mock_database_manager.delete_session.return_value = True
        
        with patch('src.session.DatabaseManager', return_value=mock_database_manager):
            from src.session import SessionManager
            
            session_manager = SessionManager()
            
            # Clean up expired sessions
            cleaned_count = await session_manager.cleanup_expired_sessions()
            
            assert cleaned_count == 3
            assert mock_database_manager.delete_session.call_count == 3

    @pytest.mark.asyncio
    async def test_session_concurrent_access(self, mock_database_manager, test_session_data):
        """Test concurrent access to session data"""
        mock_database_manager.get_session.return_value = test_session_data
        mock_database_manager.update_session.return_value = True
        
        with patch('src.session.DatabaseManager', return_value=mock_database_manager):
            from src.session import SessionManager
            
            session_manager = SessionManager()
            
            # Simulate concurrent updates
            async def update_session_async(session_id, update_data):
                return await session_manager.update_session(session_id, update_data)
            
            tasks = [
                update_session_async(test_session_data["id"], {"step": i})
                for i in range(5)
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # All updates should succeed
            for result in results:
                assert not isinstance(result, Exception)
                assert result is True

    @pytest.mark.asyncio
    async def test_session_error_handling(self, mock_database_manager):
        """Test error handling in session operations"""
        mock_database_manager.get_session.side_effect = Exception("Database error")
        
        with patch('src.session.DatabaseManager', return_value=mock_database_manager):
            from src.session import SessionManager
            
            session_manager = SessionManager()
            
            # Should handle database errors gracefully
            with pytest.raises(Exception, match="Database error"):
                await session_manager.get_session("invalid_session_id")

    @pytest.mark.asyncio
    async def test_session_validation(self, mock_database_manager):
        """Test session data validation"""
        invalid_session_data = {
            "id": "invalid_session",
            "user_id": "",  # Invalid empty user_id
            "created_at": "invalid_date",  # Invalid date format
            "expires_at": "invalid_date"
        }
        
        with patch('src.session.DatabaseManager', return_value=mock_database_manager):
            from src.session import SessionManager
            
            session_manager = SessionManager()
            
            # Should validate session data
            is_valid = await session_manager.validate_session_data(invalid_session_data)
            assert is_valid is False

    @pytest.mark.asyncio
    async def test_session_analytics(self, mock_database_manager):
        """Test session analytics and metrics collection"""
        analytics_data = {
            "total_sessions": 100,
            "active_sessions": 25,
            "average_session_duration": 1800,  # 30 minutes
            "peak_usage_hours": [14, 15, 16],  # 2-4 PM
            "session_distribution": {
                "web": 60,
                "mobile": 30,
                "api": 10
            }
        }
        
        mock_database_manager.get_session_analytics.return_value = analytics_data
        
        with patch('src.session.DatabaseManager', return_value=mock_database_manager):
            from src.session import SessionManager
            
            session_manager = SessionManager()
            
            # Get analytics
            analytics = await session_manager.get_session_analytics()
            
            assert analytics == analytics_data
            assert analytics["total_sessions"] == 100
            assert analytics["active_sessions"] == 25

    @pytest.mark.asyncio
    async def test_session_backup_and_restore(self, mock_database_manager):
        """Test session backup and restore functionality"""
        backup_data = {
            "sessions": [
                {
                    "id": "session_001",
                    "user_id": "user_001",
                    "context": {},
                    "messages": []
                }
            ],
            "backup_timestamp": "2024-01-01T00:00:00Z"
        }
        
        mock_database_manager.backup_sessions.return_value = True
        mock_database_manager.restore_sessions.return_value = True
        
        with patch('src.session.DatabaseManager', return_value=mock_database_manager):
            from src.session import SessionManager
            
            session_manager = SessionManager()
            
            # Backup sessions
            backup_success = await session_manager.backup_sessions()
            assert backup_success is True
            
            # Restore sessions
            restore_success = await session_manager.restore_sessions(backup_data)
            assert restore_success is True