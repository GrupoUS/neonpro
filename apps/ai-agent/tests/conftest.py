"""
Pytest configuration and fixtures
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock
from services.database_service import DatabaseService
from services.websocket_manager import WebSocketManager
from services.agent_service import AgentService


@pytest.fixture
def mock_supabase_client():
    """Mock Supabase client"""
    mock_client = MagicMock()
    mock_client.from_.return_value.select.return_value.ilike.return_value.limit.return_value.execute.return_value.data = []
    return mock_client


@pytest.fixture
def database_service(mock_supabase_client):
    """Database service fixture"""
    return DatabaseService("http://test-url", "test-key")


@pytest.fixture
def websocket_manager():
    """WebSocket manager fixture"""
    return WebSocketManager(max_connections=10)


@pytest.fixture
def agent_service(database_service, websocket_manager):
    """Agent service fixture"""
    return AgentService(
        db_service=database_service,
        ws_manager=websocket_manager,
        openai_api_key="test-key",
        anthropic_api_key="test-key"
    )


@pytest.fixture
def sample_patients():
    """Sample patient data for testing"""
    return [
        {
            "id": "pat_1",
            "full_name": "João Silva",
            "email": "joao@example.com",
            "phone": "(11) 99999-9999",
            "cpf": "123.456.789-00",
            "birth_date": "1990-01-01",
            "clinic_id": "clinic_1",
            "lgpd_consent_given": True,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        },
        {
            "id": "pat_2",
            "full_name": "Maria Santos",
            "email": "maria@example.com",
            "phone": "(11) 98888-8888",
            "cpf": "987.654.321-00",
            "birth_date": "1985-05-15",
            "clinic_id": "clinic_1",
            "lgpd_consent_given": True,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }
    ]


@pytest.fixture
def sample_appointments():
    """Sample appointment data for testing"""
    return [
        {
            "id": "apt_1",
            "patient_id": "pat_1",
            "professional_id": "prof_1",
            "service_id": "serv_1",
            "clinic_id": "clinic_1",
            "scheduled_at": "2024-01-15T10:00:00Z",
            "duration_minutes": 60,
            "status": "scheduled",
            "notes": "Consulta de retorno",
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        },
        {
            "id": "apt_2",
            "patient_id": "pat_2",
            "professional_id": "prof_2",
            "service_id": "serv_2",
            "clinic_id": "clinic_1",
            "scheduled_at": "2024-01-20T14:00:00Z",
            "duration_minutes": 30,
            "status": "completed",
            "notes": "Avaliação inicial",
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }
    ]


@pytest.fixture
def sample_transactions():
    """Sample financial transaction data for testing"""
    return [
        {
            "id": "txn_1",
            "clinic_id": "clinic_1",
            "patient_id": "pat_1",
            "amount": 150.00,
            "currency": "BRL",
            "description": "Consulta",
            "transaction_type": "payment",
            "status": "completed",
            "payment_method": "credit_card",
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        },
        {
            "id": "txn_2",
            "clinic_id": "clinic_1",
            "patient_id": "pat_2",
            "amount": 200.00,
            "currency": "BRL",
            "description": "Tratamento",
            "transaction_type": "payment",
            "status": "pending",
            "payment_method": "boleto",
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }
    ]


@pytest.fixture
def event_loop():
    """Create an instance of the default event loop for the test session"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()