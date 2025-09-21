"""
Supabase database integration for RAG agent
"""

import json
import asyncio
from typing import Dict, Any, List, Optional, Union
from datetime import datetime, timezone
import structlog
from supabase import create_client, Client
from supabase.lib.client_options import ClientOptions
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from .config import AgentConfig, ComplianceStandard

logger = structlog.get_logger(__name__)


class SupabaseManager:
    """Manages Supabase database connections and operations"""
    
    def __init__(self, config: AgentConfig):
        self.config = config
        self.supabase: Client = None
        self.engine = None
        self.async_engine = None
        self.session_factory = None
        self.async_session_factory = None
        
    async def initialize(self) -> None:
        """Initialize database connections"""
        try:
            # Initialize Supabase client
            self.supabase = create_client(
                self.config.database.url,
                self.config.database.service_key,
                options=ClientOptions(
                    timeout=self.config.database.timeout,
                    pool=self.config.database.pool_size
                )
            )
            
            # Initialize SQLAlchemy engines
            db_url = self.config.database.url.replace(
                "postgresql://", 
                "postgresql+psycopg2://"
            )
            async_db_url = self.config.database.url.replace(
                "postgresql://",
                "postgresql+asyncpg://"
            )
            
            self.engine = create_engine(db_url)
            self.async_engine = create_async_engine(async_db_url)
            
            # Create session factories
            self.session_factory = sessionmaker(bind=self.engine)
            self.async_session_factory = sessionmaker(
                bind=self.async_engine, 
                class_=AsyncSession
            )
            
            await self._setup_database()
            logger.info("Database connections initialized successfully")
            
        except Exception as e:
            logger.error("Failed to initialize database connections", error=str(e))
            raise
    
    async def _setup_database(self) -> None:
        """Set up database tables and extensions"""
        try:
            # Enable pgvector extension
            async with self.async_session_factory() as session:
                await session.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
                await session.commit()
                
            # Create vector embeddings table if it doesn't exist
            await self._create_vector_table()
            
            # Create audit log table
            await self._create_audit_table()
            
            # Create conversation sessions table
            await self._create_sessions_table()
            
            logger.info("Database setup completed")
            
        except Exception as e:
            logger.error("Failed to setup database", error=str(e))
            raise
    
    async def _create_vector_table(self) -> None:
        """Create vector embeddings table"""
        create_table_sql = f"""
        CREATE TABLE IF NOT EXISTS {self.config.vector_store.table_name} (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            content TEXT NOT NULL,
            metadata JSONB,
            embedding VECTOR({self.config.embeddings.dimension}),
            source_type VARCHAR(50) NOT NULL,
            source_id VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            tenant_id VARCHAR(100),
            access_level VARCHAR(20) DEFAULT 'public'
        );
        """
        
        create_index_sql = f"""
        CREATE INDEX IF NOT EXISTS {self.config.vector_store.index_name}
        ON {self.config.vector_store.table_name}
        USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100);
        """
        
        async with self.async_session_factory() as session:
            await session.execute(text(create_table_sql))
            await session.execute(text(create_index_sql))
            await session.commit()
    
    async def _create_audit_table(self) -> None:
        """Create audit log table for compliance"""
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS rag_agent_audit_log (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            session_id VARCHAR(255),
            user_id VARCHAR(255),
            action VARCHAR(100) NOT NULL,
            resource_type VARCHAR(50),
            resource_id VARCHAR(255),
            details JSONB,
            ip_address INET,
            user_agent TEXT,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            compliance_standards TEXT[]
        );
        """
        
        async with self.async_session_factory() as session:
            await session.execute(text(create_table_sql))
            await session.commit()
    
    async def _create_sessions_table(self) -> None:
        """Create conversation sessions table"""
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS rag_agent_sessions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            session_id VARCHAR(255) UNIQUE NOT NULL,
            user_id VARCHAR(255) NOT NULL,
            title TEXT,
            context JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            expires_at TIMESTAMP WITH TIME ZONE,
            is_active BOOLEAN DEFAULT true
        );
        """
        
        async with self.async_session_factory() as session:
            await session.execute(text(create_table_sql))
            await session.commit()
    
    async def store_embedding(
        self, 
        content: str,
        embedding: List[float],
        metadata: Dict[str, Any],
        source_type: str,
        source_id: Optional[str] = None,
        tenant_id: Optional[str] = None,
        access_level: str = "public"
    ) -> str:
        """Store a vector embedding with metadata"""
        try:
            data = {
                "content": content,
                "embedding": embedding,
                "metadata": metadata,
                "source_type": source_type,
                "source_id": source_id,
                "tenant_id": tenant_id,
                "access_level": access_level,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            result = self.supabase.table(
                self.config.vector_store.table_name
            ).insert(data).execute()
            
            # Log for compliance
            if self.config.compliance.audit_logging:
                await self._log_audit_event(
                    action="store_embedding",
                    resource_type="vector_embedding",
                    details={"source_id": source_id, "source_type": source_type}
                )
            
            logger.info("Stored embedding successfully", source_id=source_id)
            return result.data[0]["id"]
            
        except Exception as e:
            logger.error("Failed to store embedding", error=str(e))
            raise
    
    async def search_similar(
        self,
        query_embedding: List[float],
        limit: int = 10,
        filters: Optional[Dict[str, Any]] = None,
        tenant_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Search for similar vectors using cosine similarity"""
        try:
            query = self.supabase.rpc(
                "match_documents",
                {
                    "query_embedding": query_embedding,
                    "match_count": limit,
                    "filter": filters or {}
                }
            ).execute()
            
            results = query.data
            
            # Filter by tenant_id if provided
            if tenant_id:
                results = [r for r in results if r.get("tenant_id") == tenant_id]
            
            logger.info("Vector search completed", results_count=len(results))
            return results
            
        except Exception as e:
            logger.error("Vector search failed", error=str(e))
            # Fallback to basic SQL search
            return await self._fallback_vector_search(query_embedding, limit, filters, tenant_id)
    
    async def _fallback_vector_search(
        self,
        query_embedding: List[float],
        limit: int,
        filters: Optional[Dict[str, Any]] = None,
        tenant_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Fallback vector search using direct SQL"""
        try:
            where_conditions = ["1=1"]
            params = {"embedding": query_embedding, "limit": limit}
            
            if tenant_id:
                where_conditions.append("tenant_id = :tenant_id")
                params["tenant_id"] = tenant_id
                
            if filters:
                for key, value in filters.items():
                    if isinstance(value, str):
                        where_conditions.append(f"metadata->>'{key}' = :{key}")
                        params[key] = value
            
            where_clause = " AND ".join(where_conditions)
            
            search_sql = f"""
            SELECT *, 1 - (embedding <=> :embedding) as similarity
            FROM {self.config.vector_store.table_name}
            WHERE {where_clause}
            ORDER BY similarity DESC
            LIMIT :limit
            """
            
            async with self.async_session_factory() as session:
                result = await session.execute(text(search_sql), params)
                return [dict(row._mapping) for row in result.fetchall()]
                
        except Exception as e:
            logger.error("Fallback vector search failed", error=str(e))
            return []
    
    async def create_session(
        self,
        session_id: str,
        user_id: str,
        title: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        expires_at: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Create a new conversation session"""
        try:
            session_data = {
                "session_id": session_id,
                "user_id": user_id,
                "title": title,
                "context": context or {},
                "expires_at": expires_at.isoformat() if expires_at else None,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            result = self.supabase.table("rag_agent_sessions").insert(session_data).execute()
            
            await self._log_audit_event(
                action="create_session",
                resource_type="session",
                resource_id=session_id,
                details={"user_id": user_id}
            )
            
            return result.data[0]
            
        except Exception as e:
            logger.error("Failed to create session", error=str(e))
            raise
    
    async def update_session(
        self,
        session_id: str,
        updates: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update conversation session"""
        try:
            updates["updated_at"] = datetime.now(timezone.utc).isoformat()
            
            result = self.supabase.table("rag_agent_sessions").update(updates).eq(
                "session_id", session_id
            ).execute()
            
            if not result.data:
                raise ValueError(f"Session {session_id} not found")
                
            return result.data[0]
            
        except Exception as e:
            logger.error("Failed to update session", error=str(e))
            raise
    
    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get conversation session by ID"""
        try:
            result = self.supabase.table("rag_agent_sessions").select("*").eq(
                "session_id", session_id
            ).execute()
            
            return result.data[0] if result.data else None
            
        except Exception as e:
            logger.error("Failed to get session", error=str(e))
            return None
    
    async def _log_audit_event(
        self,
        action: str,
        resource_type: str,
        resource_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ) -> None:
        """Log audit event for compliance"""
        if not self.config.compliance.audit_logging:
            return
            
        try:
            audit_data = {
                "action": action,
                "resource_type": resource_type,
                "resource_id": resource_id,
                "details": details or {},
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "compliance_standards": [std.value for std in self.config.compliance.enabled_standards]
            }
            
            self.supabase.table("rag_agent_audit_log").insert(audit_data).execute()
            
        except Exception as e:
            logger.error("Failed to log audit event", error=str(e))
    
    async def cleanup_expired_sessions(self) -> int:
        """Clean up expired sessions"""
        try:
            result = self.supabase.table("rag_agent_sessions").delete().lt(
                "expires_at", datetime.now(timezone.utc).isoformat()
            ).execute()
            
            cleaned_count = len(result.data) if result.data else 0
            logger.info("Cleaned up expired sessions", count=cleaned_count)
            return cleaned_count
            
        except Exception as e:
            logger.error("Failed to cleanup expired sessions", error=str(e))
            return 0
    
    async def close(self) -> None:
        """Close database connections"""
        if self.engine:
            self.engine.dispose()
        if self.async_engine:
            await self.async_engine.dispose()
        
        logger.info("Database connections closed")