"""
Vector store management for RAG agent
"""

import asyncio
import numpy as np
from typing import Dict, Any, List, Optional, Tuple
import structlog
from sentence_transformers import SentenceTransformer
import openai

from .config import AgentConfig, EmbeddingModel
from .database import SupabaseManager

logger = structlog.get_logger(__name__)


class VectorStoreManager:
    """Manages vector storage and retrieval operations"""
    
    def __init__(self, config: AgentConfig, db_manager: SupabaseManager):
        self.config = config
        self.db_manager = db_manager
        self.embedding_model = None
        self._model_lock = asyncio.Lock()
        
    async def initialize(self) -> None:
        """Initialize embedding model"""
        async with self._model_lock:
            if self.embedding_model is None:
                try:
                    if self.config.embeddings.model == EmbeddingModel.SENTENCE_TRANSFORMERS:
                        self.embedding_model = SentenceTransformer(
                            "sentence-transformers/all-MiniLM-L6-v2"
                        )
                    else:
                        # OpenAI embedding models
                        openai.api_key = self.config.embeddings.api_key
                        
                    logger.info("Embedding model initialized", model=self.config.embeddings.model)
                    
                except Exception as e:
                    logger.error("Failed to initialize embedding model", error=str(e))
                    raise
    
    async def create_embedding(self, text: str) -> List[float]:
        """Create embedding for text"""
        try:
            if self.config.embeddings.model == EmbeddingModel.SENTENCE_TRANSFORMERS:
                # Use sentence-transformers
                if self.embedding_model is None:
                    await self.initialize()
                    
                embedding = self.embedding_model.encode(text).tolist()
                
            else:
                # Use OpenAI embeddings
                response = await openai.Embedding.acreate(
                    model=self.config.embeddings.model.value,
                    input=text
                )
                embedding = response["data"][0]["embedding"]
            
            # Normalize embedding
            embedding = self._normalize_embedding(embedding)
            
            logger.debug("Created embedding", 
                        text_length=len(text), 
                        embedding_dim=len(embedding))
            
            return embedding
            
        except Exception as e:
            logger.error("Failed to create embedding", error=str(e))
            raise
    
    async def create_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Create embeddings for multiple texts"""
        try:
            all_embeddings = []
            
            # Process in batches
            for i in range(0, len(texts), self.config.embeddings.batch_size):
                batch = texts[i:i + self.config.embeddings.batch_size]
                
                if self.config.embeddings.model == EmbeddingModel.SENTENCE_TRANSFORMERS:
                    if self.embedding_model is None:
                        await self.initialize()
                    
                    batch_embeddings = self.embedding_model.encode(batch).tolist()
                    all_embeddings.extend(batch_embeddings)
                    
                else:
                    # OpenAI API supports batch embedding
                    response = await openai.Embedding.acreate(
                        model=self.config.embeddings.model.value,
                        input=batch
                    )
                    batch_embeddings = [item["embedding"] for item in response["data"]]
                    all_embeddings.extend(batch_embeddings)
            
            # Normalize all embeddings
            all_embeddings = [self._normalize_embedding(emb) for emb in all_embeddings]
            
            logger.info("Created batch embeddings", 
                       count=len(texts), 
                       batch_count=len(all_embeddings))
            
            return all_embeddings
            
        except Exception as e:
            logger.error("Failed to create batch embeddings", error=str(e))
            raise
    
    def _normalize_embedding(self, embedding: List[float]) -> List[float]:
        """Normalize embedding vector"""
        try:
            # Convert to numpy array
            embedding_array = np.array(embedding, dtype=np.float32)
            
            # Calculate L2 norm
            norm = np.linalg.norm(embedding_array)
            
            # Normalize
            if norm > 0:
                normalized = embedding_array / norm
            else:
                normalized = embedding_array
            
            return normalized.tolist()
            
        except Exception as e:
            logger.error("Failed to normalize embedding", error=str(e))
            return embedding
    
    async def store_text(
        self,
        text: str,
        metadata: Dict[str, Any],
        source_type: str,
        source_id: Optional[str] = None,
        tenant_id: Optional[str] = None,
        access_level: str = "public"
    ) -> str:
        """Store text with its embedding"""
        try:
            # Create embedding
            embedding = await self.create_embedding(text)
            
            # Store in database
            embedding_id = await self.db_manager.store_embedding(
                content=text,
                embedding=embedding,
                metadata=metadata,
                source_type=source_type,
                source_id=source_id,
                tenant_id=tenant_id,
                access_level=access_level
            )
            
            logger.info("Stored text with embedding", 
                       embedding_id=embedding_id,
                       source_id=source_id)
            
            return embedding_id
            
        except Exception as e:
            logger.error("Failed to store text with embedding", error=str(e))
            raise
    
    async def store_documents(
        self,
        documents: List[Dict[str, Any]],
        source_type: str,
        tenant_id: Optional[str] = None
    ) -> List[str]:
        """Store multiple documents with embeddings"""
        try:
            texts = [doc["content"] for doc in documents]
            metadatas = [doc.get("metadata", {}) for doc in documents]
            source_ids = [doc.get("source_id") for doc in documents]
            access_levels = [doc.get("access_level", "public") for doc in documents]
            
            # Create batch embeddings
            embeddings = await self.create_batch_embeddings(texts)
            
            # Store all embeddings
            embedding_ids = []
            for i, (text, embedding, metadata, source_id, access_level) in enumerate(
                zip(texts, embeddings, metadatas, source_ids, access_levels)
            ):
                embedding_id = await self.db_manager.store_embedding(
                    content=text,
                    embedding=embedding,
                    metadata=metadata,
                    source_type=source_type,
                    source_id=source_id,
                    tenant_id=tenant_id,
                    access_level=access_level
                )
                embedding_ids.append(embedding_id)
            
            logger.info("Stored documents with embeddings", 
                       count=len(documents),
                       embedding_ids_count=len(embedding_ids))
            
            return embedding_ids
            
        except Exception as e:
            logger.error("Failed to store documents with embeddings", error=str(e))
            raise
    
    async def similarity_search(
        self,
        query: str,
        limit: int = 10,
        filters: Optional[Dict[str, Any]] = None,
        tenant_id: Optional[str] = None,
        score_threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """Perform similarity search"""
        try:
            # Create query embedding
            query_embedding = await self.create_embedding(query)
            
            # Search similar vectors
            results = await self.db_manager.search_similar(
                query_embedding=query_embedding,
                limit=limit,
                filters=filters,
                tenant_id=tenant_id
            )
            
            # Add similarity scores and filter by threshold
            processed_results = []
            for result in results:
                similarity = result.get("similarity", 0)
                if similarity >= score_threshold:
                    result["similarity_score"] = similarity
                    processed_results.append(result)
            
            logger.info("Similarity search completed", 
                       query_length=len(query),
                       results_count=len(processed_results))
            
            return processed_results
            
        except Exception as e:
            logger.error("Similarity search failed", error=str(e))
            return []
    
    async def hybrid_search(
        self,
        query: str,
        limit: int = 10,
        semantic_weight: float = 0.7,
        keyword_weight: float = 0.3,
        filters: Optional[Dict[str, Any]] = None,
        tenant_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Perform hybrid search combining semantic and keyword search"""
        try:
            # Semantic search
            semantic_results = await self.similarity_search(
                query=query,
                limit=limit * 2,  # Get more results for re-ranking
                filters=filters,
                tenant_id=tenant_id
            )
            
            # Keyword search (simple text matching)
            keyword_results = await self._keyword_search(
                query=query,
                limit=limit * 2,
                filters=filters,
                tenant_id=tenant_id
            )
            
            # Combine and re-rank results
            combined_results = await self._combine_results(
                semantic_results=semantic_results,
                keyword_results=keyword_results,
                semantic_weight=semantic_weight,
                keyword_weight=keyword_weight,
                limit=limit
            )
            
            logger.info("Hybrid search completed", 
                       query_length=len(query),
                       results_count=len(combined_results))
            
            return combined_results
            
        except Exception as e:
            logger.error("Hybrid search failed", error=str(e))
            # Fallback to semantic search
            return await self.similarity_search(query, limit, filters, tenant_id)
    
    async def _keyword_search(
        self,
        query: str,
        limit: int,
        filters: Optional[Dict[str, Any]] = None,
        tenant_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Simple keyword-based search"""
        try:
            # This is a simplified keyword search
            # In a production system, you might use full-text search
            query_lower = query.lower()
            
            # Get all documents that match filters
            all_results = await self.db_manager.search_similar(
                query_embedding=[0] * self.config.embeddings.dimension,  # Dummy embedding
                limit=1000,  # Get more for filtering
                filters=filters,
                tenant_id=tenant_id
            )
            
            # Filter by keyword matching
            keyword_results = []
            for result in all_results:
                content = result.get("content", "").lower()
                metadata = result.get("metadata", {})
                
                # Check if query terms appear in content or metadata
                query_terms = query_lower.split()
                match_score = 0
                
                for term in query_terms:
                    if term in content:
                        match_score += 1
                    
                    # Check metadata fields
                    for value in metadata.values():
                        if isinstance(value, str) and term in value.lower():
                            match_score += 0.5
                
                if match_score > 0:
                    result["keyword_score"] = match_score / len(query_terms)
                    keyword_results.append(result)
            
            # Sort by keyword score and limit results
            keyword_results.sort(key=lambda x: x["keyword_score"], reverse=True)
            return keyword_results[:limit]
            
        except Exception as e:
            logger.error("Keyword search failed", error=str(e))
            return []
    
    async def _combine_results(
        self,
        semantic_results: List[Dict[str, Any]],
        keyword_results: List[Dict[str, Any]],
        semantic_weight: float,
        keyword_weight: float,
        limit: int
    ) -> List[Dict[str, Any]]:
        """Combine and re-rank semantic and keyword results"""
        try:
            # Create a map of document ID to combined score
            combined_scores = {}
            
            # Add semantic scores
            for result in semantic_results:
                doc_id = result.get("id")
                semantic_score = result.get("similarity_score", 0)
                combined_scores[doc_id] = {
                    "result": result,
                    "semantic_score": semantic_score,
                    "keyword_score": 0,
                    "combined_score": semantic_score * semantic_weight
                }
            
            # Add keyword scores
            for result in keyword_results:
                doc_id = result.get("id")
                keyword_score = result.get("keyword_score", 0)
                
                if doc_id in combined_scores:
                    combined_scores[doc_id]["keyword_score"] = keyword_score
                    combined_scores[doc_id]["combined_score"] += keyword_score * keyword_weight
                else:
                    combined_scores[doc_id] = {
                        "result": result,
                        "semantic_score": 0,
                        "keyword_score": keyword_score,
                        "combined_score": keyword_score * keyword_weight
                    }
            
            # Sort by combined score
            sorted_results = sorted(
                combined_scores.values(),
                key=lambda x: x["combined_score"],
                reverse=True
            )
            
            # Return top results with scores
            final_results = []
            for item in sorted_results[:limit]:
                result = item["result"].copy()
                result["semantic_score"] = item["semantic_score"]
                result["keyword_score"] = item["keyword_score"]
                result["combined_score"] = item["combined_score"]
                final_results.append(result)
            
            return final_results
            
        except Exception as e:
            logger.error("Failed to combine results", error=str(e))
            return semantic_results[:limit]  # Fallback to semantic results
    
    async def delete_by_source(self, source_type: str, source_id: str) -> int:
        """Delete embeddings by source"""
        try:
            # This would be implemented with a proper DELETE operation
            # For now, it's a placeholder
            logger.info("Deleted embeddings by source", 
                       source_type=source_type, 
                       source_id=source_id)
            return 0
            
        except Exception as e:
            logger.error("Failed to delete embeddings by source", error=str(e))
            return 0
    
    async def get_statistics(self) -> Dict[str, Any]:
        """Get vector store statistics"""
        try:
            # This would query the database for statistics
            # For now, return placeholder data
            stats = {
                "total_embeddings": 0,
                "embeddings_by_type": {},
                "average_embedding_dimension": self.config.embeddings.dimension,
                "index_type": "ivfflat",
                "distance_metric": self.config.vector_store.distance_metric
            }
            
            logger.info("Retrieved vector store statistics", stats=stats)
            return stats
            
        except Exception as e:
            logger.error("Failed to get statistics", error=str(e))
            return {}