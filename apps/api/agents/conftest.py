"""
Pytest configuration and fixtures for AI Agent testing
"""

import pytest
import asyncio
import json
from unittest.mock import AsyncMock, MagicMock
from typing import Dict, Any, Generator

@pytest.fixture
def mock_openai_client():
    """Mock OpenAI client for testing"""
    mock_client = AsyncMock()
    mock_client.chat.completions.create = AsyncMock(
        return_value=MagicMock(
            choices=[MagicMock(
                message=MagicMock(
                    content="Test response from OpenAI",
                    tool_calls=None
                )
            )]
        )
    )
    return mock_client

@pytest.fixture
def mock_anthropic_client():
    """Mock Anthropic client for testing"""
    mock_client = AsyncMock()
    mock_client.messages.create = AsyncMock(
        return_value=MagicMock(
            content=[MagicMock(text="Test response from Anthropic")],
            id="test_msg_id"
        )
    )
    return mock_client

@pytest.fixture
def mock_google_client():
    """Mock Google AI client for testing"""
    mock_client = AsyncMock()
    mock_client.generate_content = AsyncMock(
        return_value=MagicMock(
            text="Test response from Google AI"
        )
    )
    return mock_client

@pytest.fixture
def mock_supabase_client():
    """Mock Supabase client for testing"""
    mock_client = MagicMock()
    mock_client.auth.get_user = MagicMock(return_value=MagicMock(user=MagicMock(id="test_user_id")))
    mock_client.table.return_value.select.return_value.execute.return_value.data = []
    mock_client.table.return_value.insert.return_value.execute.return_value.data = [{"id": "test_record"}]
    return mock_client

@pytest.fixture
def mock_vector_store():
    """Mock vector store for testing"""
    mock_store = AsyncMock()
    mock_store.create_embedding = AsyncMock(return_value="test_embedding")
    mock_store.similarity_search = AsyncMock(return_value=[
        {"content": "Test document 1", "score": 0.9},
        {"content": "Test document 2", "score": 0.8}
    ])
    return mock_store

@pytest.fixture
def mock_database_manager():
    """Mock database manager for testing"""
    mock_db = AsyncMock()
    mock_db.get_session = AsyncMock(return_value={
        "id": "test_session",
        "user_id": "test_user",
        "context": {},
        "messages": []
    })
    mock_db.save_session = AsyncMock(return_value=True)
    mock_db.get_conversation_history = AsyncMock(return_value=[
        {"role": "user", "content": "Test message", "timestamp": "2024-01-01T00:00:00Z"}
    ])
    return mock_db

@pytest.fixture
def test_user_data():
    """Test user data fixture"""
    return {
        "id": "test_user_123",
        "name": "Test User",
        "email": "test@example.com",
        "role": "patient",
        "preferences": {
            "language": "pt-BR",
            "timezone": "America/Sao_Paulo"
        }
    }

@pytest.fixture
def test_session_data():
    """Test session data fixture"""
    return {
        "id": "test_session_456",
        "user_id": "test_user_123",
        "created_at": "2024-01-01T00:00:00Z",
        "expires_at": "2024-01-01T02:00:00Z",
        "context": {
            "current_conversation": None,
            "active_tools": [],
            "user_preferences": {}
        },
        "messages": []
    }

@pytest.fixture
def test_agui_message():
    """Test AG-UI protocol message fixture"""
    return {
        "id": "test_msg_001",
        "type": "message",
        "timestamp": 1704067200,
        "data": {
            "message": {
                "id": "msg_001",
                "content": "Test message content",
                "type": "text"
            }
        }
    }

@pytest.fixture
def compliance_test_data():
    """Compliance testing data fixture"""
    return {
        "pii_data": {
            "name": "João Silva",
            "cpf": "123.456.789-00",
            "email": "joao.silva@email.com",
            "phone": "+55 11 98765-4321"
        },
        "consent_records": [
            {
                "id": "consent_001",
                "user_id": "test_user_123",
                "type": "data_processing",
                "granted_at": "2024-01-01T00:00:00Z",
                "expires_at": "2025-01-01T00:00:00Z",
                "status": "active"
            }
        ],
        "audit_logs": [
            {
                "id": "audit_001",
                "user_id": "test_user_123",
                "action": "data_access",
                "timestamp": "2024-01-01T00:00:00Z",
                "details": "Accessed patient records"
            }
        ]
    }