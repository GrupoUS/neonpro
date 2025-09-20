"""
AG-UI RAG Agent Configuration for NeonPro Healthcare Application

This module configures the RAG agent for conversational database queries
with Supabase integration and HTTPS security compliance.
"""

import os
from typing import Dict, Any

class AgentConfig:
    """Configuration class for the AG-UI RAG Agent"""
    
    # Agent identification
    AGENT_NAME = "neonpro-data-agent"
    AGENT_VERSION = "1.0.0"
    AGENT_DESCRIPTION = "Healthcare data query agent with secure Supabase integration"
    
    # Server configuration
    HOST = os.getenv("AGENT_HOST", "127.0.0.1")
    PORT = int(os.getenv("AGENT_PORT", "8000"))
    
    # Database configuration
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
    
    # AI/LLM configuration
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "gpt-4-turbo-preview")
    
    # Security configuration
    ALLOWED_ORIGINS = [
        "https://localhost:3000",
        "https://127.0.0.1:3000",
        "https://neonpro.com",
        "https://api.neonpro.com"
    ]
    
    # Performance settings
    MAX_RESPONSE_TIME = 2000  # milliseconds
    MAX_QUERY_LENGTH = 1000
    
    # Healthcare compliance
    LGPD_COMPLIANCE = True
    AUDIT_LOGGING = True
    
    @classmethod
    def get_config(cls) -> Dict[str, Any]:
        """Get configuration as dictionary"""
        return {
            "agent_name": cls.AGENT_NAME,
            "agent_version": cls.AGENT_VERSION,
            "agent_description": cls.AGENT_DESCRIPTION,
            "host": cls.HOST,
            "port": cls.PORT,
            "supabase_url": cls.SUPABASE_URL,
            "allowed_origins": cls.ALLOWED_ORIGINS,
            "max_response_time": cls.MAX_RESPONSE_TIME,
            "max_query_length": cls.MAX_QUERY_LENGTH,
            "lgpd_compliance": cls.LGPD_COMPLIANCE,
            "audit_logging": cls.AUDIT_LOGGING
        }
    
    @classmethod
    def validate_config(cls) -> bool:
        """Validate required configuration"""
        required_vars = [
            "SUPABASE_URL",
            "SUPABASE_SERVICE_KEY", 
            "OPENAI_API_KEY"
        ]
        
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {missing_vars}")
        
        return True