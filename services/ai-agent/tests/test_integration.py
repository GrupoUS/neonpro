"""
Integration tests for AI Agent Service
"""

import pytest
import asyncio
import json
from httpx import AsyncClient
from websockets.client import connect
from services.database_service import DatabaseService
from services.websocket_manager import WebSocketManager
from services.agent_service import AgentService


class TestIntegration:
    """Integration test cases"""

    @pytest.mark.asyncio
    async def test_full_query_flow(self, agent_service, sample_patients, sample_appointments):
        """Test complete query flow from message to response"""
        # Setup mocks
        agent_service.db_service.search_patients = AsyncMock(return_value=[sample_patients[0]])
        agent_service.db_service.get_patient_appointments = AsyncMock(return_value=sample_appointments)
        agent_service.db_service.get_professional_info = AsyncMock(return_value={"full_name": "Dr. Silva"})
        agent_service.db_service.get_service_info = AsyncMock(return_value={"name": "Consulta"})

        # Test query processing
        query = {
            "query": "Buscar agendamentos do paciente João Silva",
            "context": {"userId": "user_1"}
        }
        
        response = await agent_service.process_query(query)
        
        assert response["type"] == "data_response"
        assert response["data_type"] == "appointments"
        assert response["patient_name"] == "João Silva"
        assert len(response["data"]) == 2

    @pytest.mark.asyncio
    async def test_websocket_real_time_communication(self):
        """Test real-time WebSocket communication"""
        # This would require a running server
        # For now, we'll test the WebSocket manager in isolation
        
        manager = WebSocketManager(max_connections=5)
        
        # Mock WebSocket
        mock_client = MagicMock()
        mock_client.accept = AsyncMock()
        mock_client.send_json = AsyncMock()
        
        # Connect
        await manager.connect(mock_client, client_id="test_client")
        
        # Send message
        await manager.send_to_client("test_client", {"type": "test", "content": "Hello"})
        
        # Verify
        mock_client.send_json.assert_called_once()
        assert manager.get_connection_count() == 1

    @pytest.mark.asyncio
    async def test_database_caching_integration(self, database_service, sample_patients):
        """Test that database caching works correctly"""
        # Mock database response
        database_service.client.from_.return_value.select.return_value.ilike.return_value.limit.return_value.execute.return_value.data = sample_patients
        
        # First call
        result1 = await database_service.search_patients("João")
        
        # Second call should use cache
        result2 = await database_service.search_patients("João")
        
        assert result1 == result2
        assert len(database_service._cache) == 1

    @pytest.mark.asyncio
    async def test_error_handling_flow(self, agent_service):
        """Test error handling throughout the flow"""
        # Mock database error
        agent_service.db_service.search_patients = AsyncMock(side_effect=Exception("Database error"))
        
        query = {
            "query": "Buscar paciente João",
            "context": {"userId": "user_1"}
        }
        
        response = await agent_service.process_query(query)
        
        assert response["type"] == "error"
        assert "error occurred" in response["message"]

    @pytest.mark.asyncio
    async def test_lgpd_compliance_check(self, agent_service, sample_patients):
        """Test LGPD compliance checks"""
        # Mock patient without consent
        patient_no_consent = sample_patients[0].copy()
        patient_no_consent["lgpd_consent_given"] = False
        
        agent_service.db_service.search_patients = AsyncMock(return_value=[patient_no_consent])
        agent_service.db_service.check_lgpd_consent = AsyncMock(return_value=False)
        
        entities = {"names": ["João"]}
        result = await agent_service._handle_client_search(entities, {})
        
        # Should still return data but with compliance info
        assert result["type"] == "data_response"
        assert result["data"][0]["lgpd_consent"] == False

    @pytest.mark.asyncio
    async def test_concurrent_requests(self, agent_service):
        """Test handling concurrent requests"""
        # Mock database
        agent_service.db_service.search_patients = AsyncMock(return_value=[])
        
        # Create multiple concurrent requests
        tasks = []
        for i in range(5):
            query = {
                "query": f"Buscar paciente {i}",
                "context": {"userId": f"user_{i}"}
            }
            tasks.append(agent_service.process_query(query))
        
        # Wait for all to complete
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # All should succeed
        assert len([r for r in results if not isinstance(r, Exception)]) == 5

    @pytest.mark.asyncio
    async def test_conversation_memory(self, agent_service):
        """Test conversation memory functionality"""
        # Mock successful response
        with patch.object(agent_service, '_handle_client_search') as mock_handle:
            mock_handle.return_value = {
                "type": "response",
                "content": "Found 2 patients"
            }
            
            # Send first query
            query1 = {"query": "Buscar pacientes", "context": {}}
            await agent_service.process_query(query1)
            
            # Check memory
            assert len(agent_service.memory.chat_memory.messages) == 2  # input + output
            
            # Send second query
            query2 = {"query": "E mais?", "context": {}}
            await agent_service.process_query(query2)
            
            # Memory should have 4 messages
            assert len(agent_service.memory.chat_memory.messages) == 4

    @pytest.mark.asyncio
    async def test_audit_log_creation(self, database_service):
        """Test audit log creation for LGPD compliance"""
        # Mock successful insert
        database_service.client.from_.return_value.insert.return_value.execute.return_value.data = {"id": "log_1"}
        
        result = await database_service.create_audit_log(
            user_id="user_1",
            action="view_patient",
            resource_type="patient",
            resource_id="pat_1",
            details={"query": "patient search"}
        )
        
        assert result is True

    @pytest.mark.asyncio
    async def test_financial_statistics_calculation(self, database_service, sample_transactions):
        """Test financial statistics calculation"""
        # Mock data
        database_service.client.from_.return_value.select.return_value.eq.return_value.gte.return_value.lte.return_value.execute.return_value.data = sample_transactions
        
        stats = await database_service.get_patient_statistics("pat_1")
        
        assert "total_appointments" in stats
        assert "total_spent" in stats
        assert "pending_payments" in stats

    @pytest.mark.asyncio
    async def test_websocket_reconnection(self):
        """Test WebSocket reconnection logic"""
        manager = WebSocketManager(max_connections=5, reconnect_interval=0.1)
        
        # Mock WebSocket that fails on send
        mock_websocket = MagicMock()
        mock_websocket.accept = AsyncMock()
        mock_websocket.send_json = AsyncMock(side_effect=Exception("Disconnected"))
        
        # Connect
        await manager.connect(mock_websocket)
        
        # Try to send message (should disconnect)
        await manager.send_personal_message({"type": "test"}, mock_websocket)
        
        # Should be disconnected
        assert manager.get_connection_count() == 0

    @pytest.mark.asyncio
    async def test_agent_initialization(self):
        """Test agent service initialization"""
        db_service = MagicMock(spec=DatabaseService)
        ws_manager = MagicMock(spec=WebSocketManager)
        
        agent = AgentService(
            db_service=db_service,
            ws_manager=ws_manager,
            openai_api_key="test-key",
            anthropic_api_key="test-key"
        )
        
        assert agent.db_service == db_service
        assert agent.ws_manager == ws_manager
        assert agent.memory is not None
        assert agent.conversation is not None

    @pytest.mark.asyncio
    async def test_portuguese_intent_detection(self, agent_service):
        """Test Portuguese language intent detection"""
        test_cases = [
            ("procure o cliente Maria", QueryIntent.CLIENT_SEARCH),
            ("quero ver minhas consultas", QueryIntent.APPOINTMENT_QUERY),
            ("mostre os pagamentos", QueryIntent.FINANCIAL_QUERY),
            ("agende uma nova consulta", QueryIntent.SCHEDULE_MANAGEMENT),
            ("gere um relatório", QueryIntent.REPORT_GENERATION),
            ("qual o preço do café?", QueryIntent.UNKNOWN)
        ]
        
        for text, expected_intent in test_cases:
            detected = agent_service._detect_intent(text)
            assert detected == expected_intent, f"Failed for text: {text}"

    @pytest.mark.asyncio
    async def test_brazilian_document_validation(self, agent_service):
        """Test Brazilian document (CPF) validation"""
        # Test CPF extraction
        text = "Paciente com CPF 123.456.789-00"
        entities = await agent_service._extract_entities(text, QueryIntent.CLIENT_SEARCH)
        
        assert "cpf" in entities
        assert entities["cpf"] == "123.456.789-00"

    @pytest.mark.asyncio
    async def test_response_format_consistency(self, agent_service, sample_patients):
        """Test that all responses follow consistent format"""
        agent_service.db_service.search_patients = AsyncMock(return_value=sample_patients)
        
        response = await agent_service._handle_client_search(
            {"names": ["João"]}, 
            {}
        )
        
        # Required fields
        assert "type" in response
        assert "timestamp" in response
        assert isinstance(response["timestamp"], str)
        
        # For data responses
        if response["type"] == "data_response":
            assert "data_type" in response
            assert "data" in response
            assert "count" in response