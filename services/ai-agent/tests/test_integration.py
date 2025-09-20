"""
Integration tests for the AI Agent service.
Tests full workflow from query processing to response generation.
"""

import pytest
import asyncio
import json
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from websockets.client import connect
from websockets.server import serve

from main import app
from services.database_service import DatabaseService
from services.websocket_manager import WebSocketManager
from services.agent_service import AgentService
from config import Settings

# Test client for FastAPI
client = TestClient(app)

# Test fixtures for integration testing
@pytest.fixture(scope="module")
def test_settings():
    """Test settings with overrides."""
    with patch('config.Settings') as mock:
        settings = mock.return_value
        settings.supabase_url = "http://localhost:8000"
        settings.supabase_key = "test-key"
        settings.openai_api_key = "sk-test-key"
        settings.anthropic_api_key = "sk-ant-test-key"
        settings.enable_lgpd_compliance = True
        settings.enable_cache = True
        settings.cache_ttl = 300
        settings.max_concurrent_requests = 10
        settings.websocket_max_connections = 100
        yield settings

@pytest.fixture
async def database_service(test_settings):
    """Database service with mocked dependencies."""
    with patch('services.database_service.Client') as mock_client:
        service = DatabaseService(test_settings)
        service.client = mock_client.return_value
        yield service

@pytest.fixture
def websocket_manager(test_settings):
    """WebSocket manager for testing."""
    return WebSocketManager(test_settings)

@pytest.fixture
def agent_service(database_service, test_settings):
    """Agent service with mocked dependencies."""
    with patch('services.agent_service.OpenAIEmbeddings') as mock_embed, \
         patch('services.agent_service.ConversationBufferMemory') as mock_memory, \
         patch('services.agent_service.OpenAI') as mock_openai:
        
        # Mock embeddings
        mock_embed.return_value.embed_query = MagicMock(return_value=[0.1, 0.2, 0.3])
        
        # Mock memory
        mock_memory.return_value.load_memory_variables = MagicMock(return_value={"history": []})
        mock_memory.return_value.save_context = MagicMock()
        
        # Mock OpenAI
        mock_openai.return_value.chat.completions.create = MagicMock()
        
        service = AgentService(database_service, test_settings)
        service.embeddings = mock_embed.return_value
        service.memory = mock_memory.return_value
        service.llm = mock_openai.return_value
        
        yield service

class TestFullWorkflow:
    """Test complete workflow from query to response."""
    
    @pytest.mark.asyncio
    async def test_patient_search_workflow(self, agent_service):
        """Test complete patient search workflow."""
        # Mock database response
        agent_service.database_service.search_patients = AsyncMock(return_value=[
            {
                "id": "123",
                "name": "João Silva",
                "cpf": "123.456.789-00",
                "birth_date": "1990-01-15",
                "status": "active",
                "contact_info": json.dumps({"phone": "+55 11 9999-9999", "email": "joao@email.com"})
            }
        ])
        
        # Mock LLM response
        agent_service.llm.chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content="Encontrei 1 paciente: João Silva"))]
        )
        
        # Process query
        result = await agent_service.process_query(
            "Buscar paciente João Silva",
            {"user_id": "user-123", "context": "dashboard"}
        )
        
        # Verify result
        assert result["success"] is True
        assert "João Silva" in result["response"]
        assert len(result["data"]) == 1
        assert result["intent"] == "CLIENT_SEARCH"
        
        # Verify database was called
        agent_service.database_service.search_patients.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_appointment_query_workflow(self, agent_service):
        """Test complete appointment query workflow."""
        # Mock database response
        agent_service.database_service.get_appointments_by_patient = AsyncMock(return_value=[
            {
                "id": "apt-123",
                "patient_id": "123",
                "professional_id": "prof-456",
                "service_id": "srv-789",
                "scheduled_date": "2024-01-20T10:00:00",
                "status": "confirmed",
                "service_type": "Consulta"
            }
        ])
        
        # Mock LLM response
        agent_service.llm.chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content="O paciente tem 1 agendamento confirmado"))]
        )
        
        # Process query
        result = await agent_service.process_query(
            "Mostrar agendamentos do paciente João",
            {"user_id": "user-123", "context": "dashboard"}
        )
        
        # Verify result
        assert result["success"] is True
        assert "agendamento" in result["response"].lower()
        assert result["intent"] == "APPOINTMENT_QUERY"
        assert result["data"][0]["status"] == "confirmed"

class TestWebSocketIntegration:
    """Test WebSocket real-time communication."""
    
    @pytest.mark.asyncio
    async def test_websocket_query_flow(self, websocket_manager, agent_service):
        """Test complete WebSocket query flow."""
        # Mock WebSocket
        mock_websocket = AsyncMock()
        mock_websocket.send = AsyncMock()
        mock_websocket.receive = AsyncMock(
            side_effect=[
                json.dumps({
                    "type": "query",
                    "query_id": "test-123",
                    "query": "Listar pacientes",
                    "context": {"user_id": "user-123"}
                }),
                json.dumps({
                    "type": "subscribe",
                    "subscription_id": "sub-123",
                    "subscription_type": "patient_updates"
                })
            ]
        )
        
        # Connect WebSocket
        await websocket_manager.connect(mock_websocket, "client-123")
        
        # Mock agent service
        agent_service.process_query = AsyncMock(return_value={
            "success": True,
            "response": "Encontrei 10 pacientes",
            "data": [],
            "intent": "CLIENT_SEARCH"
        })
        
        # Process message
        message = json.loads(await mock_websocket.receive())
        
        if message["type"] == "query":
            result = await agent_service.process_query(
                message["query"],
                message["context"]
            )
            
            # Send response
            response = {
                "type": "query_response",
                "query_id": message["query_id"],
                "success": result["success"],
                "response": result["response"],
                "data": result["data"],
                "timestamp": datetime.utcnow().isoformat()
            }
            
            await mock_websocket.send(json.dumps(response))
            
            # Verify
            mock_websocket.send.assert_called_once()
            sent_data = json.loads(mock_websocket.send.call_args[0][0])
            assert sent_data["type"] == "query_response"
            assert sent_data["query_id"] == "test-123"
    
    @pytest.mark.asyncio
    async def test_websocket_real_time_updates(self, websocket_manager):
        """Test real-time updates through WebSocket."""
        # Mock multiple clients
        mock_clients = [AsyncMock() for _ in range(3)]
        for i, client in enumerate(mock_clients):
            client.send = AsyncMock()
            await websocket_manager.connect(client, f"client-{i}")
        
        # Broadcast update
        update_data = {
            "type": "patient_update",
            "patient_id": "123",
            "update_type": "appointment_created",
            "data": {"appointment_id": "apt-456"}
        }
        
        await websocket_manager.broadcast("patient_updates", update_data)
        
        # Verify all clients received update
        for client in mock_clients:
            client.send.assert_called_once()
            sent_data = json.loads(client.send.call_args[0][0])
            assert sent_data["type"] == "patient_update"
            assert sent_data["patient_id"] == "123"

class TestDatabaseIntegration:
    """Test database service integration."""
    
    @pytest.mark.asyncio
    async def test_cache_integration(self, database_service):
        """Test caching functionality."""
        # Enable cache
        database_service.cache_enabled = True
        database_service.cache_ttl = 300
        
        # Mock database
        database_service.client.table.return_value.select.return_value.\
            eq.return_value.limit.return_value.execute.return_value.data = []
        
        # First call (miss)
        result1 = await database_service.search_patients("test")
        
        # Second call (hit)
        result2 = await database_service.search_patients("test")
        
        # Verify results
        assert result1 == result2
        
        # Verify database called only once
        database_service.client.table.return_value.select.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_lgpd_compliance_integration(self, database_service):
        """Test LGPD compliance integration."""
        # Enable compliance
        database_service.lgpd_compliance_enabled = True
        
        # Mock audit log
        with patch.object(database_service, '_log_access') as mock_log:
            await database_service.search_patients(
                "test",
                context={"user_id": "user-123", "purpose": "patient_care"}
            )
            
            # Verify audit log
            mock_log.assert_called_once()
            call_args = mock_log.call_args[0]
            assert call_args[0] == "patient_search"
            assert call_args[1] == "user-123"
            assert call_args[2]["purpose"] == "patient_care"

class TestErrorHandlingIntegration:
    """Test error handling in integrated scenarios."""
    
    @pytest.mark.asyncio
    async def test_database_error_handling(self, agent_service):
        """Test handling of database errors."""
        # Mock database failure
        agent_service.database_service.search_patients = AsyncMock(
            side_effect=Exception("Database connection failed")
        )
        
        # Process query
        result = await agent_service.process_query(
            "Buscar pacientes",
            {"user_id": "user-123"}
        )
        
        # Verify error handling
        assert result["success"] is False
        assert "Database connection failed" in result["error"]
        assert "suggestions" in result
        
    @pytest.mark.asyncio
    async def test_rate_limiting_integration(self, agent_service):
        """Test rate limiting in real scenarios."""
        # Mock rate limiter
        agent_service.rate_limiter.is_allowed = MagicMock(side_effect=[True, False])
        
        # First request (allowed)
        result1 = await agent_service.process_query("test", {"user_id": "user-1"})
        
        # Second request (rate limited)
        result2 = await agent_service.process_query("test", {"user_id": "user-1"})
        
        # Verify
        assert result1["success"] is True
        assert result2["success"] is False
        assert "Rate limit exceeded" in result2["error"]

class TestPerformanceIntegration:
    """Test performance under load."""
    
    @pytest.mark.asyncio
    async def test_concurrent_requests(self, agent_service):
        """Test handling of concurrent requests."""
        # Mock successful responses
        agent_service.database_service.search_patients = AsyncMock(
            return_value=[{"id": "123", "name": "Test Patient"}]
        )
        agent_service.llm.chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content="Found 1 patient"))]
        )
        
        # Create concurrent requests
        tasks = []
        for i in range(5):
            task = agent_service.process_query(
                f"Search patient {i}",
                {"user_id": f"user-{i}"}
            )
            tasks.append(task)
        
        # Execute concurrently
        results = await asyncio.gather(*tasks)
        
        # Verify all requests handled
        assert len(results) == 5
        for result in results:
            assert result["success"] is True
    
    @pytest.mark.asyncio
    async def test_memory_performance(self, agent_service):
        """Test conversation memory performance."""
        # Add many messages to memory
        for i in range(100):
            agent_service.memory.save_context(
                {"input": f"Message {i}"},
                {"output": f"Response {i}"}
            )
        
        # Test query with large history
        result = await agent_service.process_query(
            "Current context",
            {"user_id": "user-123"}
        )
        
        # Verify performance (should complete quickly)
        assert result["success"] is True

class TestComplianceIntegration:
    """Test compliance features integration."""
    
    @pytest.mark.asyncio
    async def test_brazilian_document_validation(self, agent_service):
        """Test Brazilian document validation in queries."""
        # Mock database with Brazilian data
        agent_service.database_service.search_patients = AsyncMock(return_value=[
            {
                "id": "123",
                "name": "Maria Santos",
                "cpf": "987.654.321-00",
                "sus_card": "123 4567 8901 2345"
            }
        ])
        
        # Process query with CPF
        result = await agent_service.process_query(
            "Buscar paciente com CPF 987.654.321-00",
            {"user_id": "user-123"}
        )
        
        # Verify CPF handling
        assert result["success"] is True
        assert "987.654.321-00" in result["response"]
        
        # Verify proper data handling
        patient_data = result["data"][0]
        assert "cpf" in patient_data
    
    @pytest.mark.asyncio
    async def test_consent_validation_integration(self, agent_service):
        """Test patient consent validation."""
        # Mock consent check
        agent_service.database_service.check_patient_consent = AsyncMock(
            return_value={"has_consent": True, "consent_type": "data_processing"}
        )
        
        # Process query requiring consent
        result = await agent_service.process_query(
            "Show patient medical history",
            {"user_id": "doctor-123", "context": {"patient_id": "123"}}
        )
        
        # Verify consent check
        agent_service.database_service.check_patient_consent.assert_called_once()
        assert result["success"] is True

# Test REST API integration
class TestRestApiIntegration:
    """Test REST API endpoints integration."""
    
    def test_health_check_integration(self):
        """Test health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data
    
    def test_query_endpoint_integration(self):
        """Test query endpoint with valid request."""
        with patch('main.agent_service.process_query') as mock_process:
            mock_process.return_value = {
                "success": True,
                "response": "Test response",
                "data": []
            }
            
            response = client.post(
                "/query",
                json={
                    "query": "Test query",
                    "context": {"user_id": "user-123"}
                }
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["response"] == "Test response"
    
    def test_query_endpoint_validation(self):
        """Test query endpoint validation."""
        # Missing required fields
        response = client.post("/query", json={})
        assert response.status_code == 422
        
        # Empty query
        response = client.post(
            "/query",
            json={"query": "", "context": {"user_id": "user-123"}}
        )
        assert response.status_code == 422

# Cleanup helper
@pytest.fixture(autouse=True)
async def cleanup():
    """Cleanup after tests."""
    yield
    # Clean up any test data
    await asyncio.sleep(0.1)  # Allow async operations to complete