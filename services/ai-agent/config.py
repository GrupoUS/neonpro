"""
Configuration for the AI Agent Service
"""

import os
from typing import Optional, List
from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    """Application settings"""
    
    # Server configuration
    host: str = Field(default="0.0.0.0", env="HOST")
    port: int = Field(default=8001, env="PORT")
    debug: bool = Field(default=False, env="DEBUG")
    
    # Database configuration
    supabase_url: str = Field(..., env="SUPABASE_URL")
    supabase_service_key: str = Field(..., env="SUPABASE_SERVICE_ROLE_KEY")
    
    # AI Model configuration
    openai_api_key: str = Field(..., env="OPENAI_API_KEY")
    anthropic_api_key: str = Field(..., env="ANTHROPIC_API_KEY")
    
    # Agent configuration
    agent_name: str = Field(default="neonpro-healthcare-assistant", env="AGENT_NAME")
    agent_version: str = Field(default="1.0.0", env="AGENT_VERSION")
    
    # AG-UI Protocol configuration
    agui_endpoint: str = Field(default="ws://localhost:8000/ws/agent", env="AGUI_ENDPOINT")
    
    # WebSocket configuration
    ws_max_connections: int = Field(default=100, env="WS_MAX_CONNECTIONS")
    ws_ping_interval: int = Field(default=30, env="WS_PING_INTERVAL")
    
    # Security
    jwt_secret: str = Field(..., env="JWT_SECRET")
    allowed_origins: List[str] = Field(default=["http://localhost:3000"], env="ALLOWED_ORIGINS")
    
    # Logging
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    log_format: str = Field(default="json", env="LOG_FORMAT")
    
    # Brazilian healthcare compliance
    enable_lgpd_compliance: bool = Field(default=True, env="ENABLE_LGPD_COMPLIANCE")
    data_retention_days: int = Field(default=365, env="DATA_RETENTION_DAYS")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Global settings instance
settings = Settings()


# Database URLs for different environments
def get_database_url() -> str:
    """Get database URL based on environment"""
    if settings.debug:
        return os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/neonpro_dev")
    else:
        return os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/neonpro_prod")


# AI model configurations
OPENAI_MODEL = "gpt-4-turbo-preview"
ANTHROPIC_MODEL = "claude-3-sonnet-20240229"

# Agent capabilities
AGENT_CAPABILITIES = [
    "client_search",
    "appointment_query", 
    "financial_data_access",
    "schedule_management",
    "report_generation",
    "data_export"
]

# Supported languages
SUPPORTED_LANGUAGES = ["pt-BR", "en-US"]

# Brazilian healthcare specific configurations
HEALTHCARE_CONFIG = {
    "cfm_license_validation": True,
    "anvisa_compliance": True,
    "lgpd_consent_required": True,
    "audit_trail_enabled": True,
    "data_encryption_enabled": True
}