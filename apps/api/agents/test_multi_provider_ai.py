"""
Test suite for multi-provider AI support
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import asyncio
from typing import Dict, Any

pytestmark = pytest.mark.unit

class TestMultiProviderAI:
    """Test cases for multi-provider AI support"""

    @pytest.mark.asyncio
    async def test_openai_provider_configuration(self, mock_openai_client):
        """Test OpenAI provider configuration and response generation"""
        with patch('src.agent.OpenAI', return_value=mock_openai_client):
            from src.agent import AIAgent
            
            config = {
                "provider": "openai",
                "model": "gpt-4",
                "temperature": 0.7,
                "max_tokens": 1000
            }
            
            agent = AIAgent(config)
            
            # Test response generation
            response = await agent.generate_response("Test prompt")
            
            assert response == "Test response from OpenAI"
            mock_openai_client.chat.completions.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_anthropic_provider_configuration(self, mock_anthropic_client):
        """Test Anthropic provider configuration and response generation"""
        with patch('src.agent.Anthropic', return_value=mock_anthropic_client):
            from src.agent import AIAgent
            
            config = {
                "provider": "anthropic",
                "model": "claude-3-sonnet-20240229",
                "temperature": 0.7,
                "max_tokens": 1000
            }
            
            agent = AIAgent(config)
            
            # Test response generation
            response = await agent.generate_response("Test prompt")
            
            assert response == "Test response from Anthropic"
            mock_anthropic_client.messages.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_google_provider_configuration(self, mock_google_client):
        """Test Google AI provider configuration and response generation"""
        with patch('src.agent.genai', return_value=mock_google_client):
            from src.agent import AIAgent
            
            config = {
                "provider": "google",
                "model": "gemini-pro",
                "temperature": 0.7,
                "max_tokens": 1000
            }
            
            agent = AIAgent(config)
            
            # Test response generation
            response = await agent.generate_response("Test prompt")
            
            assert response == "Test response from Google AI"
            mock_google_client.generate_content.assert_called_once()

    @pytest.mark.asyncio
    async def test_provider_fallback_mechanism(self):
        """Test fallback mechanism when primary provider fails"""
        # Mock clients where primary fails
        failing_client = AsyncMock()
        failing_client.chat.completions.create.side_effect = Exception("Primary provider failed")
        
        backup_client = AsyncMock()
        backup_client.chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(
                message=MagicMock(
                    content="Fallback response",
                    tool_calls=None
                )
            )]
        )
        
        with patch('src.agent.OpenAI') as mock_openai_class:
            mock_openai_class.side_effect = [failing_client, backup_client]
            
            from src.agent import AIAgent
            
            config = {
                "provider": "openai",
                "model": "gpt-4",
                "fallback_providers": ["openai"],
                "temperature": 0.7
            }
            
            agent = AIAgent(config)
            
            # Test fallback response
            response = await agent.generate_response_with_fallback("Test prompt")
            
            assert response == "Fallback response"
            assert mock_openai_class.call_count == 2

    @pytest.mark.asyncio
    async def test_provider_timeout_handling(self):
        """Test timeout handling for AI providers"""
        slow_client = AsyncMock()
        slow_client.chat.completions.create = AsyncMock(
            side_effect=asyncio.TimeoutError("Provider timeout")
        )
        
        with patch('src.agent.OpenAI', return_value=slow_client):
            from src.agent import AIAgent
            
            config = {
                "provider": "openai",
                "model": "gpt-4",
                "timeout": 1,  # Very short timeout
                "temperature": 0.7
            }
            
            agent = AIAgent(config)
            
            with pytest.raises(asyncio.TimeoutError):
                await agent.generate_response("Test prompt")

    @pytest.mark.asyncio
    async def test_provider_rate_limiting(self):
        """Test rate limiting handling for AI providers"""
        rate_limited_client = AsyncMock()
        rate_limited_client.chat.completions.create.side_effect = Exception("Rate limit exceeded")
        
        with patch('src.agent.OpenAI', return_value=rate_limited_client):
            from src.agent import AIAgent
            
            config = {
                "provider": "openai",
                "model": "gpt-4",
                "rate_limit_retries": 3,
                "temperature": 0.7
            }
            
            agent = AIAgent(config)
            
            with pytest.raises(Exception, match="Rate limit exceeded"):
                await agent.generate_response("Test prompt")
            
            # Should have attempted retry
            assert rate_limited_client.chat.completions.create.call_count == 3

    @pytest.mark.asyncio
    async def test_provider_performance_tracking(self):
        """Test performance tracking for different providers"""
        import time
        
        mock_client = AsyncMock()
        mock_client.chat.completions.create = AsyncMock(
            return_value=MagicMock(
                choices=[MagicMock(
                    message=MagicMock(
                        content="Performance test response",
                        tool_calls=None
                    )
                )]
            )
        )
        
        with patch('src.agent.OpenAI', return_value=mock_client), \
             patch('time.time', side_effect=[1000, 1002]):  # 2 second response time
            
            from src.agent import AIAgent
            
            config = {
                "provider": "openai",
                "model": "gpt-4",
                "track_performance": True,
                "temperature": 0.7
            }
            
            agent = AIAgent(config)
            
            response = await agent.generate_response("Test prompt")
            
            assert response == "Performance test response"
            
            # Check performance metrics
            assert hasattr(agent, 'performance_metrics')
            assert 'openai' in agent.performance_metrics
            assert agent.performance_metrics['openai']['response_time'] == 2.0

    @pytest.mark.asyncio
    async def test_provider_cost_calculation(self):
        """Test cost calculation for different providers"""
        mock_client = AsyncMock()
        mock_client.chat.completions.create = AsyncMock(
            return_value=MagicMock(
                usage=MagicMock(
                    prompt_tokens=100,
                    completion_tokens=50,
                    total_tokens=150
                ),
                choices=[MagicMock(
                    message=MagicMock(
                        content="Cost test response",
                        tool_calls=None
                    )
                )]
            )
        )
        
        with patch('src.agent.OpenAI', return_value=mock_client):
            from src.agent import AIAgent
            
            config = {
                "provider": "openai",
                "model": "gpt-4",
                "track_costs": True,
                "temperature": 0.7
            }
            
            agent = AIAgent(config)
            
            response = await agent.generate_response("Test prompt")
            
            assert response == "Cost test response"
            
            # Check cost calculation
            assert hasattr(agent, 'cost_metrics')
            assert 'openai' in agent.cost_metrics
            assert agent.cost_metrics['openai']['total_tokens'] == 150

    @pytest.mark.asyncio
    async def test_provider_model_validation(self):
        """Test model validation for different providers"""
        from src.agent import AIAgent
        
        test_cases = [
            ("openai", "invalid-model", False),
            ("openai", "gpt-4", True),
            ("anthropic", "invalid-model", False),
            ("anthropic", "claude-3-sonnet-20240229", True),
            ("google", "invalid-model", False),
            ("google", "gemini-pro", True),
        ]
        
        for provider, model, should_succeed in test_cases:
            config = {
                "provider": provider,
                "model": model,
                "temperature": 0.7
            }
            
            if should_succeed:
                with patch('src.agent.OpenAI'), patch('src.agent.SupabaseClient'), patch('src.agent.VectorStore'):
                    agent = AIAgent(config)
                    assert agent.config["model"] == model
            else:
                with pytest.raises(ValueError, match="Invalid model"):
                    AIAgent(config)

    @pytest.mark.asyncio
    async def test_provider_configuration_validation(self):
        """Test configuration validation for different providers"""
        from src.agent import AIAgent
        
        # Test missing provider
        with pytest.raises(ValueError, match="Provider is required"):
            AIAgent({"model": "gpt-4", "temperature": 0.7})
        
        # Test unsupported provider
        with pytest.raises(ValueError, match="Unsupported provider"):
            AIAgent({"provider": "unsupported", "model": "test", "temperature": 0.7})

    @pytest.mark.asyncio
    async def test_concurrent_provider_usage(self):
        """Test concurrent usage of multiple providers"""
        import concurrent.futures
        
        mock_client = AsyncMock()
        mock_client.chat.completions.create = AsyncMock(
            return_value=MagicMock(
                choices=[MagicMock(
                    message=MagicMock(
                        content=f"Concurrent response {i}",
                        tool_calls=None
                    )
                )]
            )
        )
        
        with patch('src.agent.OpenAI', return_value=mock_client):
            from src.agent import AIAgent
            
            config = {
                "provider": "openai",
                "model": "gpt-4",
                "temperature": 0.7
            }
            
            agent = AIAgent(config)
            
            # Test concurrent requests
            async def make_request(i):
                return await agent.generate_response(f"Test prompt {i}")
            
            tasks = [make_request(i) for i in range(5)]
            responses = await asyncio.gather(*tasks, return_exceptions=True)
            
            # All responses should succeed
            for i, response in enumerate(responses):
                assert not isinstance(response, Exception)
                assert response == f"Concurrent response {i}"