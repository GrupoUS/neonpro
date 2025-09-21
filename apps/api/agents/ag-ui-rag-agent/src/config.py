"""
Configuration management for AG-UI RAG Agent
"""

import os
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from enum import Enum


class AIProvider(str, Enum):
    """Supported AI providers"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    LOCAL = "local"


class EmbeddingModel(str, Enum):
    """Supported embedding models"""
    OPENAI_ADA_002 = "text-embedding-ada-002"
    OPENAI_SMALL_3 = "text-embedding-3-small"
    SENTENCE_TRANSFORMERS = "sentence-transformers/all-MiniLM-L6-v2"


class ComplianceStandard(str, Enum):
    """Healthcare compliance standards"""
    LGPD = "lgpd"
    HIPAA = "hipaa"
    GDPR = "gdpr"


class DatabaseConfig(BaseModel):
    """Database configuration"""
    url: str
    service_key: str
    project_ref: str
    timeout: int = Field(default=30)
    pool_size: int = Field(default=20)


class AIConfig(BaseModel):
    """AI provider configuration"""
    provider: AIProvider = Field(default=AIProvider.OPENAI)
    model: str = Field(default="gpt-4")
    api_key: str
    max_tokens: int = Field(default=4000)
    temperature: float = Field(default=0.1)


class EmbeddingConfig(BaseModel):
    """Embedding model configuration"""
    model: EmbeddingModel = Field(default=EmbeddingModel.OPENAI_SMALL_3)
    api_key: Optional[str] = None
    dimension: int = Field(default=1536)
    batch_size: int = Field(default=100)


class VectorStoreConfig(BaseModel):
    """Vector store configuration"""
    table_name: str = Field(default="vector_embeddings")
    index_name: str = Field(default="vector_index")
    distance_metric: str = Field(default="cosine")


class SecurityConfig(BaseModel):
    """Security configuration"""
    encryption_key: str
    jwt_secret: str
    allowed_origins: List[str] = Field(default_factory=list)
    rate_limit_requests: int = Field(default=100)
    rate_limit_window: int = Field(default=3600)


class ComplianceConfig(BaseModel):
    """Compliance configuration"""
    enabled_standards: List[ComplianceStandard] = Field(
        default=[ComplianceStandard.LGPD]
    )
    data_retention_days: int = Field(default=365)
    audit_logging: bool = Field(default=True)
    pii_detection: bool = Field(default=True)


class LoggingConfig(BaseModel):
    """Logging configuration"""
    level: str = Field(default="INFO")
    format: str = Field(default="json")
    file_path: Optional[str] = None
    max_size_mb: int = Field(default=100)
    backup_count: int = Field(default=5)


class AgentConfig(BaseModel):
    """Main agent configuration"""
    
    # Basic settings
    name: str = Field(default="neonpro-rag-agent")
    version: str = Field(default="0.1.0")
    environment: str = Field(default="development")
    debug: bool = Field(default=False)
    
    # Core components
    database: DatabaseConfig
    ai: AIConfig
    embeddings: EmbeddingConfig
    vector_store: VectorStoreConfig
    security: SecurityConfig
    compliance: ComplianceConfig
    logging: LoggingConfig
    
    # AG-UI Protocol settings
    agui_host: str = Field(default="localhost")
    agui_port: int = Field(default=8080)
    agui_path: str = Field(default="/ws")
    
    # Performance settings
    max_concurrent_requests: int = Field(default=50)
    request_timeout: int = Field(default=30)
    cache_ttl: int = Field(default=300)
    
    @classmethod
    def from_env(cls) -> "AgentConfig":
        """Create configuration from environment variables"""
        return cls(
            database=DatabaseConfig(
                url=os.getenv("SUPABASE_URL", ""),
                service_key=os.getenv("SUPABASE_SERVICE_KEY", ""),
                project_ref=os.getenv("SUPABASE_PROJECT_REF", "")
            ),
            ai=AIConfig(
                provider=AIProvider(os.getenv("AI_PROVIDER", "openai")),
                model=os.getenv("AI_MODEL", "gpt-4"),
                api_key=os.getenv("OPENAI_API_KEY", ""),
                max_tokens=int(os.getenv("AI_MAX_TOKENS", "4000")),
                temperature=float(os.getenv("AI_TEMPERATURE", "0.1"))
            ),
            embeddings=EmbeddingConfig(
                model=EmbeddingModel(os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")),
                api_key=os.getenv("OPENAI_API_KEY"),
                dimension=int(os.getenv("EMBEDDING_DIMENSION", "1536")),
                batch_size=int(os.getenv("EMBEDDING_BATCH_SIZE", "100"))
            ),
            vector_store=VectorStoreConfig(
                table_name=os.getenv("VECTOR_TABLE_NAME", "vector_embeddings"),
                index_name=os.getenv("VECTOR_INDEX_NAME", "vector_index"),
                distance_metric=os.getenv("VECTOR_DISTANCE_METRIC", "cosine")
            ),
            security=SecurityConfig(
                encryption_key=os.getenv("ENCRYPTION_KEY", ""),
                jwt_secret=os.getenv("JWT_SECRET", ""),
                allowed_origins=os.getenv("ALLOWED_ORIGINS", "").split(","),
                rate_limit_requests=int(os.getenv("RATE_LIMIT_REQUESTS", "100")),
                rate_limit_window=int(os.getenv("RATE_LIMIT_WINDOW", "3600"))
            ),
            compliance=ComplianceConfig(
                data_retention_days=int(os.getenv("DATA_RETENTION_DAYS", "365")),
                audit_logging=os.getenv("AUDIT_LOGGING", "true").lower() == "true",
                pii_detection=os.getenv("PII_DETECTION", "true").lower() == "true"
            ),
            logging=LoggingConfig(
                level=os.getenv("LOG_LEVEL", "INFO"),
                format=os.getenv("LOG_FORMAT", "json"),
                file_path=os.getenv("LOG_FILE_PATH"),
                max_size_mb=int(os.getenv("LOG_MAX_SIZE_MB", "100")),
                backup_count=int(os.getenv("LOG_BACKUP_COUNT", "5"))
            ),
            agui_host=os.getenv("AGUI_HOST", "localhost"),
            agui_port=int(os.getenv("AGUI_PORT", "8080")),
            agui_path=os.getenv("AGUI_PATH", "/ws"),
            max_concurrent_requests=int(os.getenv("MAX_CONCURRENT_REQUESTS", "50")),
            request_timeout=int(os.getenv("REQUEST_TIMEOUT", "30")),
            cache_ttl=int(os.getenv("CACHE_TTL", "300"))
        )
    
    def validate_config(self) -> List[str]:
        """Validate configuration and return list of errors"""
        errors = []
        
        if not self.database.url:
            errors.append("SUPABASE_URL is required")
        if not self.database.service_key:
            errors.append("SUPABASE_SERVICE_KEY is required")
        if not self.ai.api_key:
            errors.append("AI API key is required")
        if not self.security.encryption_key:
            errors.append("ENCRYPTION_KEY is required")
        if not self.security.jwt_secret:
            errors.append("JWT_SECRET is required")
            
        return errors