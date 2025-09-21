"""
Embedding model management for RAG agent
"""

import asyncio
import numpy as np
from typing import List, Dict, Any, Optional, Union
import structlog
from sentence_transformers import SentenceTransformer
import openai
from tenacity import retry, stop_after_attempt, wait_exponential

from .config import AgentConfig, EmbeddingModel

logger = structlog.get_logger(__name__)


class EmbeddingManager:
    """Manages embedding model operations"""
    
    def __init__(self, config: AgentConfig):
        self.config = config
        self.model = None
        self._model_lock = asyncio.Lock()
        self._initialization_task = None
        
    async def initialize(self) -> None:
        """Initialize embedding model asynchronously"""
        if self._initialization_task:
            await self._initialization_task
            return
            
        self._initialization_task = asyncio.create_task(self._initialize_model())
        await self._initialization_task
    
    async def _initialize_model(self) -> None:
        """Initialize the embedding model"""
        async with self._model_lock:
            if self.model is not None:
                return
                
            try:
                if self.config.embeddings.model == EmbeddingModel.SENTENCE_TRANSFORMERS:
                    logger.info("Loading sentence-transformers model")
                    self.model = SentenceTransformer(
                        "sentence-transformers/all-MiniLM-L6-v2",
                        device="cpu"  # Use CPU for compatibility
                    )
                    
                    # Warm up the model
                    test_text = "This is a test sentence for model initialization."
                    _ = self.model.encode(test_text)
                    
                elif self.config.embeddings.model in [
                    EmbeddingModel.OPENAI_ADA_002,
                    EmbeddingModel.OPENAI_SMALL_3
                ]:
                    logger.info("Using OpenAI embedding model")
                    # For OpenAI, we don't need to load a model locally
                    # We'll use the API directly
                    self.model = "openai"
                    
                else:
                    raise ValueError(f"Unsupported embedding model: {self.config.embeddings.model}")
                
                logger.info("Embedding model initialized successfully", 
                           model=self.config.embeddings.model.value)
                
            except Exception as e:
                logger.error("Failed to initialize embedding model", 
                           model=self.config.embeddings.model.value,
                           error=str(e))
                raise
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10)
    )
    async def create_embedding(self, text: str) -> List[float]:
        """Create embedding for a single text"""
        try:
            if self.model is None:
                await self.initialize()
            
            if self.config.embeddings.model == EmbeddingModel.SENTENCE_TRANSFORMERS:
                return await self._create_sentence_transformer_embedding(text)
            else:
                return await self._create_openai_embedding(text)
                
        except Exception as e:
            logger.error("Failed to create embedding", 
                       text_length=len(text),
                       error=str(e))
            raise
    
    async def _create_sentence_transformer_embedding(self, text: str) -> List[float]:
        """Create embedding using sentence-transformers"""
        try:
            # Create embedding
            embedding = self.model.encode(text, convert_to_numpy=True)
            
            # Convert to list and ensure correct type
            embedding = embedding.astype(np.float32).tolist()
            
            # Normalize the embedding
            embedding = self._normalize_embedding(embedding)
            
            return embedding
            
        except Exception as e:
            logger.error("Sentence-transformers embedding failed", error=str(e))
            raise
    
    async def _create_openai_embedding(self, text: str) -> List[float]:
        """Create embedding using OpenAI API"""
        try:
            response = await openai.Embedding.acreate(
                model=self.config.embeddings.model.value,
                input=text
            )
            
            embedding = response["data"][0]["embedding"]
            
            # Normalize the embedding
            embedding = self._normalize_embedding(embedding)
            
            return embedding
            
        except Exception as e:
            logger.error("OpenAI embedding failed", error=str(e))
            raise
    
    async def create_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Create embeddings for multiple texts efficiently"""
        try:
            if not texts:
                return []
            
            if self.model is None:
                await self.initialize()
            
            if self.config.embeddings.model == EmbeddingModel.SENTENCE_TRANSFORMERS:
                return await self._create_batch_sentence_transformer_embeddings(texts)
            else:
                return await self._create_batch_openai_embeddings(texts)
                
        except Exception as e:
            logger.error("Failed to create batch embeddings", 
                       texts_count=len(texts),
                       error=str(e))
            raise
    
    async def _create_batch_sentence_transformer_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Create batch embeddings using sentence-transformers"""
        try:
            # Process in batches to avoid memory issues
            all_embeddings = []
            
            for i in range(0, len(texts), self.config.embeddings.batch_size):
                batch = texts[i:i + self.config.embeddings.batch_size]
                
                # Create embeddings for the batch
                batch_embeddings = self.model.encode(batch, convert_to_numpy=True)
                
                # Convert and normalize each embedding
                for embedding in batch_embeddings:
                    embedding = embedding.astype(np.float32).tolist()
                    embedding = self._normalize_embedding(embedding)
                    all_embeddings.append(embedding)
                
                # Small delay to prevent overwhelming the system
                if i + self.config.embeddings.batch_size < len(texts):
                    await asyncio.sleep(0.01)
            
            return all_embeddings
            
        except Exception as e:
            logger.error("Batch sentence-transformers embedding failed", error=str(e))
            raise
    
    async def _create_batch_openai_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Create batch embeddings using OpenAI API"""
        try:
            all_embeddings = []
            
            # Process in batches (OpenAI has limits)
            for i in range(0, len(texts), self.config.embeddings.batch_size):
                batch = texts[i:i + self.config.embeddings.batch_size]
                
                response = await openai.Embedding.acreate(
                    model=self.config.embeddings.model.value,
                    input=batch
                )
                
                # Extract and normalize embeddings
                batch_embeddings = []
                for item in response["data"]:
                    embedding = item["embedding"]
                    embedding = self._normalize_embedding(embedding)
                    batch_embeddings.append(embedding)
                
                all_embeddings.extend(batch_embeddings)
                
                # Rate limiting
                if i + self.config.embeddings.batch_size < len(texts):
                    await asyncio.sleep(0.1)  # OpenAI rate limit
            
            return all_embeddings
            
        except Exception as e:
            logger.error("Batch OpenAI embedding failed", error=str(e))
            raise
    
    def _normalize_embedding(self, embedding: List[float]) -> List[float]:
        """Normalize embedding vector to unit length"""
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
    
    async def compute_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Compute cosine similarity between two embeddings"""
        try:
            # Convert to numpy arrays
            emb1 = np.array(embedding1, dtype=np.float32)
            emb2 = np.array(embedding2, dtype=np.float32)
            
            # Compute cosine similarity
            similarity = np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))
            
            return float(similarity)
            
        except Exception as e:
            logger.error("Failed to compute similarity", error=str(e))
            return 0.0
    
    async def compute_batch_similarities(
        self, 
        query_embedding: List[float], 
        candidate_embeddings: List[List[float]]
    ) -> List[float]:
        """Compute similarities between query and multiple candidates"""
        try:
            if not candidate_embeddings:
                return []
            
            # Convert to numpy arrays
            query_array = np.array(query_embedding, dtype=np.float32)
            candidates_array = np.array(candidate_embeddings, dtype=np.float32)
            
            # Compute dot products
            dot_products = np.dot(candidates_array, query_array)
            
            # Compute norms
            query_norm = np.linalg.norm(query_array)
            candidate_norms = np.linalg.norm(candidates_array, axis=1)
            
            # Compute cosine similarities
            similarities = dot_products / (query_norm * candidate_norms)
            
            return similarities.tolist()
            
        except Exception as e:
            logger.error("Failed to compute batch similarities", error=str(e))
            return [0.0] * len(candidate_embeddings)
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the current embedding model"""
        return {
            "model": self.config.embeddings.model.value,
            "dimension": self.config.embeddings.dimension,
            "batch_size": self.config.embeddings.batch_size,
            "max_tokens": getattr(self.config.embeddings, "max_tokens", 8191),
            "initialized": self.model is not None
        }
    
    async def warm_up(self) -> None:
        """Warm up the embedding model"""
        try:
            if self.model is None:
                await self.initialize()
            
            # Create a few sample embeddings to warm up the model
            sample_texts = [
                "This is a warm-up sentence for the embedding model.",
                "Another sample text to ensure the model is ready.",
                "Final warm-up text to test embedding creation."
            ]
            
            await self.create_batch_embeddings(sample_texts)
            
            logger.info("Embedding model warm-up completed")
            
        except Exception as e:
            logger.error("Embedding model warm-up failed", error=str(e))
            # Don't raise here - warm-up failures shouldn't stop the system
    
    async def estimate_tokens(self, text: str) -> int:
        """Estimate number of tokens in text (rough estimate)"""
        # Rough estimate: 1 token ≈ 4 characters for English text
        return max(1, len(text) // 4)
    
    async def check_rate_limits(self, num_texts: int) -> Dict[str, Any]:
        """Check if batch processing would exceed rate limits"""
        try:
            if self.config.embeddings.model in [
                EmbeddingModel.OPENAI_ADA_002,
                EmbeddingModel.OPENAI_SMALL_3
            ]:
                # OpenAI rate limits (approximate)
                rpm = 3000  # requests per minute
                tpm = 250000  # tokens per minute
                
                estimated_tokens = sum(
                    await self.estimate_tokens(text) for text in ["" for _ in range(num_texts)]
                )  # This is a rough estimate
                
                batches_needed = (num_texts + self.config.embeddings.batch_size - 1) // self.config.embeddings.batch_size
                
                return {
                    "within_limits": batches_needed <= rpm and estimated_tokens <= tpm,
                    "estimated_requests": batches_needed,
                    "estimated_tokens": estimated_tokens,
                    "rpm_limit": rpm,
                    "tpm_limit": tpm
                }
            else:
                # Sentence-transformers has no API rate limits
                return {
                    "within_limits": True,
                    "estimated_requests": 1,
                    "estimated_tokens": 0,
                    "rpm_limit": "unlimited",
                    "tpm_limit": "unlimited"
                }
                
        except Exception as e:
            logger.error("Failed to check rate limits", error=str(e))
            return {"within_limits": False, "error": str(e)}