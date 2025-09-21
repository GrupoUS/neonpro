"""
AG-UI RAG Agent for NeonPro Healthcare System

A specialized RAG (Retrieval-Augmented Generation) agent that integrates
with Supabase for healthcare data operations and provides intelligent
query capabilities for medical professionals.

Features:
- Supabase database integration with vector search
- Healthcare data retrieval with LGPD compliance
- Real-time conversation context management
- Multi-provider AI model support
- Secure data access with role-based permissions
"""

__version__ = "0.1.0"
__author__ = "NeonPro Healthcare Team"

from .agent import AgUiRagAgent
from .config import AgentConfig
from .database import SupabaseManager
from .vector_store import VectorStoreManager
from .retriever import HealthcareRetriever
from .embeddings import EmbeddingManager

__all__ = [
    "AgUiRagAgent",
    "AgentConfig", 
    "SupabaseManager",
    "VectorStoreManager",
    "HealthcareRetriever",
    "EmbeddingManager"
]