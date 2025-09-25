"""
Test suite for AI Agent initialization and configuration
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import asyncio
from typing import Dict, Any

pytestmark = pytest.mark.unit

class TestAgentInitialization:
    """Test cases for AI Agent initialization and component setup"""

    @pytest.mark.asyncio
    async def test_agent_initialization_success(self, mock_openai_client, mock_supabase_client, mock_vector_store):
        """Test successful agent initialization with all components"""
        with patch('src.agent.OpenAI', return_value=mock_openai_client), \
             patch('src.agent.SupabaseClient', return_value=mock_supabase_client), \
             patch('src.agent.VectorStore', return_value=mock_vector_store):
            
            from src.agent import AIAgent
            
            config = {
                "model": "gpt-4",
                "temperature": 0.7,
                "max_tokens": 1000,
                "system_prompt": "You are a healthcare assistant"
            }
            
            agent = AIAgent(config)
            
            assert agent.config == config
            assert agent.llm_client == mock_openai_client
            assert agent.database_client == mock_supabase_client
            assert agent.vector_store == mock_vector_store
            assert agent.initialized is True

    @pytest.mark.asyncio
    async def test_agent_initialization_missing_config(self):
        """Test agent initialization with missing configuration"""
        from src.agent import AIAgent
        
        with pytest.raises(ValueError, match="Configuration is required"):
            AIAgent({})

    @pytest.mark.asyncio
    async def test_agent_initialization_invalid_model(self):
        """Test agent initialization with invalid model"""
        from src.agent import AIAgent
        
        config = {
            "model": "invalid-model",
            "temperature": 0.7,
            "max_tokens": 1000
        }
        
        with pytest.raises(ValueError, match="Invalid model specified"):
            AIAgent(config)

    @pytest.mark.asyncio
    async def test_database_manager_initialization(self, mock_supabase_client):
        """Test database manager initialization"""
        with patch('src.database.SupabaseClient', return_value=mock_supabase_client):
            from src.database import DatabaseManager
            
            db_config = {
                "url": "test://localhost:5432/testdb",
                "key": "test_key"
            }
            
            db_manager = DatabaseManager(db_config)
            
            assert db_manager.config == db_config
            assert db_manager.client == mock_supabase_client
            assert db_manager.initialized is True

    @pytest.mark.asyncio
    async def test_embedding_manager_initialization(self):
        """Test embedding manager initialization"""
        with patch('src.embeddings.SentenceTransformer') as mock_transformer:
            mock_model = MagicMock()
            mock_transformer.return_value = mock_model
            
            from src.embeddings import EmbeddingManager
            
            embed_manager = EmbeddingManager({
                "model_name": "all-MiniLM-L6-v2",
                "device": "cpu"
            })
            
            assert embed_manager.model_name == "all-MiniLM-L6-v2"
            assert embed_manager.model == mock_model
            assert embed_manager.initialized is True

    @pytest.mark.asyncio
    async def test_vector_store_initialization(self, mock_supabase_client):
        """Test vector store initialization"""
        with patch('src.vector_store.SupabaseClient', return_value=mock_supabase_client):
            from src.vector_store import VectorStore
            
            vs_config = {
                "table_name": "embeddings",
                "dimension": 384
            }
            
            vector_store = VectorStore(vs_config)
            
            assert vector_store.config == vs_config
            assert vector_store.client == mock_supabase_client
            assert vector_store.dimension == 384

    @pytest.mark.asyncio
    async def test_healthcare_retriever_initialization(self, mock_supabase_client, mock_vector_store):
        """Test healthcare retriever initialization"""
        with patch('src.retriever.SupabaseClient', return_value=mock_supabase_client), \
             patch('src.retriever.VectorStore', return_value=mock_vector_store):
            
            from src.retriever import HealthcareRetriever
            
            config = {
                "max_results": 10,
                "similarity_threshold": 0.7
            }
            
            retriever = HealthcareRetriever(config)
            
            assert retriever.config == config
            assert retriever.database_client == mock_supabase_client
            assert retriever.vector_store == mock_vector_store

    @pytest.mark.asyncio
    async def test_background_task_initialization(self):
        """Test background task manager initialization"""
        from src.utils.background_tasks import BackgroundTaskManager
        
        task_manager = BackgroundTaskManager()
        
        assert task_manager.max_workers == 4
        assert task_manager.running_tasks == {}
        assert task_manager.task_queue is not None

    @pytest.mark.asyncio
    async def test_component_initialization_order(self):
        """Test that components initialize in the correct order"""
        initialization_order = []
        
        class MockComponent:
            def __init__(self, name):
                self.name = name
                initialization_order.append(name)
        
        with patch('src.agent.DatabaseManager', lambda x: MockComponent('database')), \
             patch('src.agent.EmbeddingManager', lambda x: MockComponent('embeddings')), \
             patch('src.agent.VectorStore', lambda x: MockComponent('vector_store')), \
             patch('src.agent.HealthcareRetriever', lambda x: MockComponent('retriever')):
            
            from src.agent import AIAgent
            
            agent = AIAgent({"model": "gpt-4", "temperature": 0.7})
            
            expected_order = ['database', 'embeddings', 'vector_store', 'retriever']
            assert initialization_order == expected_order

    @pytest.mark.asyncio
    async def test_initialization_failure_handling(self):
        """Test handling of component initialization failures"""
        with patch('src.agent.DatabaseManager', side_effect=Exception("Database connection failed")):
            from src.agent import AIAgent
            
            with pytest.raises(Exception, match="Database connection failed"):
                AIAgent({"model": "gpt-4", "temperature": 0.7})

    @pytest.mark.asyncio
    async def test_configuration_validation(self):
        """Test configuration validation during initialization"""
        from src.agent import AIAgent
        
        # Test missing required fields
        invalid_configs = [
            {},  # Empty config
            {"temperature": 0.7},  # Missing model
            {"model": "gpt-4", "temperature": 2.0},  # Invalid temperature
            {"model": "gpt-4", "max_tokens": -1},  # Invalid max_tokens
        ]
        
        for config in invalid_configs:
            with pytest.raises(ValueError):
                AIAgent(config)

    @pytest.mark.asyncio
    async def test_agent_configuration_customization(self):
        """Test agent configuration customization options"""
        from src.agent import AIAgent
        
        config = {
            "model": "gpt-4",
            "temperature": 0.3,
            "max_tokens": 2000,
            "system_prompt": "Custom healthcare assistant",
            "timeout": 30,
            "retry_attempts": 3,
            "compliance_level": "strict"
        }
        
        with patch('src.agent.OpenAI'), patch('src.agent.SupabaseClient'), patch('src.agent.VectorStore'):
            agent = AIAgent(config)
            
            assert agent.config["compliance_level"] == "strict"
            assert agent.config["timeout"] == 30
            assert agent.config["retry_attempts"] == 3