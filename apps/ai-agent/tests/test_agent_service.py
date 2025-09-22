"""
Tests for Agent Service
"""

import pytest
import json
from unittest.mock import AsyncMock, MagicMock, patch
from services.agent_service import AgentService, QueryIntent


class TestAgentService:
    """Test cases for AgentService"""

    @pytest.mark.asyncio
    async def test_process_message_query(self, agent_service):
        """Test processing query message"""
        message = {
            "type": "query",
            "query": "Buscar paciente João Silva",
            "context": {"userId": "user_1"}
        }
        
        # Mock the response
        with patch.object(agent_service, '_handle_client_search') as mock_handle:
            mock_handle.return_value = {
                "type": "data_response",
                "data_type": "clients",
                "data": [],
                "count": 0
            }
            
            result = await agent_service.process_message(message)
            
            mock_handle.assert_called_once()
            assert result["type"] == "data_response"

    @pytest.mark.asyncio
    async def test_process_message_action(self, agent_service):
        """Test processing action message"""
        message = {
            "type": "action",
            "action_type": "export_data",
            "data": {"type": "appointments"}
        }
        
        result = await agent_service.process_message(message)
        
        assert result["type"] == "action_response"
        assert result["action_type"] == "export_data"

    @pytest.mark.asyncio
    async def test_process_message_feedback(self, agent_service):
        """Test processing feedback message"""
        message = {
            "type": "feedback",
            "feedback_type": "helpful",
            "data": {"rating": 5}
        }
        
        result = await agent_service.process_message(message)
        
        assert result["type"] == "feedback_received"
        assert result["feedback_type"] == "helpful"

    @pytest.mark.asyncio
    async def test_process_message_unknown(self, agent_service):
        """Test processing unknown message type"""
        message = {
            "type": "unknown",
            "data": "test"
        }
        
        result = await agent_service.process_message(message)
        
        assert result["type"] == "error"
        assert "Unknown message type" in result["message"]

    @pytest.mark.asyncio
    async def test_process_query_success(self, agent_service):
        """Test successful query processing"""
        query = {
            "query": "Buscar paciente João",
            "context": {"userId": "user_1"}
        }
        
        # Mock intent detection
        with patch.object(agent_service, '_detect_intent') as mock_detect, \
             patch.object(agent_service, '_extract_entities') as mock_extract, \
             patch.object(agent_service, '_handle_client_search') as mock_handle:
            
            mock_detect.return_value = QueryIntent.CLIENT_SEARCH
            mock_extract.return_value = {"names": ["João"]}
            mock_handle.return_value = {
                "type": "data_response",
                "data": [],
                "count": 0
            }
            
            result = await agent_service.process_query(query)
            
            mock_detect.assert_called_once_with("Buscar paciente João")
            mock_extract.assert_called_once()
            mock_handle.assert_called_once_with({"names": ["João"]}, {"userId": "user_1"})

    @pytest.mark.asyncio
    async def test_process_query_error(self, agent_service):
        """Test query processing with error"""
        query = {
            "query": "Test query",
            "context": {}
        }
        
        # Mock intent detection
        with patch.object(agent_service, '_detect_intent') as mock_detect, \
             patch.object(agent_service, '_extract_entities') as mock_extract:
            
            mock_detect.return_value = QueryIntent.CLIENT_SEARCH
            mock_extract.side_effect = Exception("Test error")
            
            result = await agent_service.process_query(query)
            
            assert result["type"] == "error"
            assert "error occurred" in result["message"]

    def test_detect_intent_client_search(self, agent_service):
        """Test detecting client search intent"""
        text = "Por favor, busque o paciente Maria Santos"
        
        intent = agent_service._detect_intent(text)
        
        assert intent == QueryIntent.CLIENT_SEARCH

    def test_detect_intent_appointment_query(self, agent_service):
        """Test detecting appointment query intent"""
        text = "Quais são meus agendamentos para hoje?"
        
        intent = agent_service._detect_intent(text)
        
        assert intent == QueryIntent.APPOINTMENT_QUERY

    def test_detect_intent_financial_query(self, agent_service):
        """Test detecting financial query intent"""
        text = "Mostrar resumo financeiro desta semana"
        
        intent = agent_service._detect_intent(text)
        
        assert intent == QueryIntent.FINANCIAL_QUERY

    def test_detect_intent_unknown(self, agent_service):
        """Test detecting unknown intent"""
        text = "Como está o tempo hoje?"
        
        intent = agent_service._detect_intent(text)
        
        assert intent == QueryIntent.UNKNOWN

    @pytest.mark.asyncio
    async def test_extract_entities_names(self, agent_service):
        """Test extracting names from text"""
        text = "Buscar pacientes João Silva e Maria Santos"
        
        entities = await agent_service._extract_entities(text, QueryIntent.CLIENT_SEARCH)
        
        assert "names" in entities
        assert "João Silva" in entities["names"]
        assert "Maria Santos" in entities["names"]

    @pytest.mark.asyncio
    async def test_extract_entities_cpf(self, agent_service):
        """Test extracting CPF from text"""
        text = "Paciente com CPF 123.456.789-00"
        
        entities = await agent_service._extract_entities(text, QueryIntent.CLIENT_SEARCH)
        
        assert "cpf" in entities
        assert entities["cpf"] == "123.456.789-00"

    @pytest.mark.asyncio
    async def test_extract_entities_dates(self, agent_service):
        """Test extracting dates from text"""
        text = "Agendamentos para 15/01/2024"
        
        entities = await agent_service._extract_entities(text, QueryIntent.APPOINTMENT_QUERY)
        
        assert "dates" in entities
        assert "15/01/2024" in entities["dates"]

    @pytest.mark.asyncio
    async def test_handle_client_search_no_names(self, agent_service):
        """Test handling client search without names"""
        entities = {}
        
        result = await agent_service._handle_client_search(entities, {})
        
        assert result["type"] == "response"
        assert "forneça o nome" in result["content"]

    @pytest.mark.asyncio
    async def test_handle_client_search_success(self, agent_service, sample_patients):
        """Test successful client search"""
        entities = {"names": ["João"]}
        
        # Mock database search
        agent_service.db_service.search_patients = AsyncMock(return_value=sample_patients)
        
        result = await agent_service._handle_client_search(entities, {})
        
        assert result["type"] == "data_response"
        assert result["data_type"] == "clients"
        assert result["count"] == 2
        assert len(result["data"]) == 2

    @pytest.mark.asyncio
    async def test_handle_client_search_no_results(self, agent_service):
        """Test client search with no results"""
        entities = {"names": ["Nonexistent"]}
        
        # Mock database search
        agent_service.db_service.search_patients = AsyncMock(return_value=[])
        
        result = await agent_service._handle_client_search(entities, {})
        
        assert result["type"] == "response"
        assert "Nenhum paciente encontrado" in result["content"]

    @pytest.mark.asyncio
    async def test_handle_appointment_query_success(self, agent_service, sample_patients, sample_appointments):
        """Test successful appointment query"""
        entities = {"names": ["João"]}
        
        # Mock database operations
        agent_service.db_service.search_patients = AsyncMock(return_value=[sample_patients[0]])
        agent_service.db_service.get_patient_appointments = AsyncMock(return_value=sample_appointments)
        agent_service.db_service.get_professional_info = AsyncMock(return_value={"full_name": "Dr. Silva"})
        agent_service.db_service.get_service_info = AsyncMock(return_value={"name": "Consulta"})
        
        result = await agent_service._handle_appointment_query(entities, {})
        
        assert result["type"] == "data_response"
        assert result["data_type"] == "appointments"
        assert result["patient_name"] == "João Silva"
        assert len(result["data"]) == 2

    @pytest.mark.asyncio
    async def test_handle_financial_query_success(self, agent_service, sample_patients, sample_transactions):
        """Test successful financial query"""
        entities = {"names": ["João"]}
        
        # Mock database operations
        agent_service.db_service.search_patients = AsyncMock(return_value=[sample_patients[0]])
        agent_service.db_service.get_financial_transactions = AsyncMock(return_value=sample_transactions)
        agent_service.db_service.get_patient_statistics = AsyncMock(return_value={
            "total_spent": 150.00,
            "pending_payments": 200.00
        })
        
        result = await agent_service._handle_financial_query(entities, {})
        
        assert result["type"] == "data_response"
        assert result["data_type"] == "financial"
        assert result["patient_name"] == "João Silva"
        assert result["statistics"]["total_spent"] == 150.00

    @pytest.mark.asyncio
    async def test_handle_schedule_management(self, agent_service):
        """Test schedule management response"""
        entities = {"names": ["João"]}
        
        result = await agent_service._handle_schedule_management(entities, {})
        
        assert result["type"] == "response"
        assert "implementada em breve" in result["content"]

    @pytest.mark.asyncio
    async def test_handle_report_generation(self, agent_service):
        """Test report generation response"""
        entities = {}
        
        result = await agent_service._handle_report_generation(entities, {})
        
        assert result["type"] == "response"
        assert "implementada em breve" in result["content"]

    @pytest.mark.asyncio
    async def test_handle_unknown_query(self, agent_service):
        """Test handling unknown query with conversation chain"""
        # Mock conversation chain
        agent_service.conversation.arun = AsyncMock(return_value="I'm not sure how to help with that.")
        
        result = await agent_service._handle_unknown_query("What's the weather like?")
        
        assert result["type"] == "response"
        assert result["content"] == "I'm not sure how to help with that."

    @pytest.mark.asyncio
    async def test_handle_unknown_query_error(self, agent_service):
        """Test handling unknown query with error"""
        # Mock conversation chain error
        agent_service.conversation.arun = AsyncMock(side_effect=Exception("AI error"))
        
        result = await agent_service._handle_unknown_query("Test query")
        
        assert result["type"] == "response"
        assert "Desculpe, não entendi" in result["content"]

    @pytest.mark.asyncio
    async def test_process_action_export_data(self, agent_service):
        """Test processing export data action"""
        message = {
            "action_type": "export_data",
            "data": {"type": "appointments", "format": "xlsx"}
        }
        
        result = await agent_service._process_action(message)
        
        assert result["type"] == "action_response"
        assert result["action_type"] == "export_data"
        assert result["status"] == "success"

    @pytest.mark.asyncio
    async def test_process_action_navigate(self, agent_service):
        """Test processing navigate action"""
        message = {
            "action_type": "navigate_to",
            "target": "/patients/123"
        }
        
        result = await agent_service._process_action(message)
        
        assert result["type"] == "action_response"
        assert result["action_type"] == "navigate_to"
        assert result["target"] == "/patients/123"

    @pytest.mark.asyncio
    async def test_process_action_unknown(self, agent_service):
        """Test processing unknown action"""
        message = {
            "action_type": "unknown_action",
            "data": {}
        }
        
        result = await agent_service._process_action(message)
        
        assert result["type"] == "error"
        assert "Unknown action type" in result["message"]

    @pytest.mark.asyncio
    async def test_process_feedback(self, agent_service):
        """Test processing feedback"""
        message = {
            "feedback_type": "helpful",
            "data": {"rating": 5, "comment": "Great response!"}
        }
        
        result = await agent_service._process_feedback(message)
        
        assert result["type"] == "feedback_received"
        assert result["feedback_type"] == "helpful"