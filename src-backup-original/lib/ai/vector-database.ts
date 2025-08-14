/**
 * @fileoverview Sistema de Vector Database para NeonPro
 * 
 * Sistema avançado de gerenciamento de embeddings vetoriais para busca semântica
 * em dados clínicos, prontuários e informações de pacientes.
 * 
 * Funcionalidades:
 * - Integração com Supabase Vector/Pinecone
 * - Embeddings contextuais para dados médicos
 * - Busca por similaridade semântica
 * - Cache inteligente de vetores
 * - Otimização para dados LGPD-sensitive
 * 
 * @author APEX Master Developer
 * @version 1.0.0
 * @since 2025-01-30
 */

import { createClient } from '@/utils/supabase/server';
import { Database } from '@/types/supabase';
import { 
  VectorSearchQuery, 
  VectorSearchResult, 
  SearchEmbedding, 
  VectorDocument,
  EmbeddingMetadata,
  VectorSearchConfig,
  SemanticSearchOptions 
} from '@/lib/types/search-types';
import { AuditLogger } from './audit-logger';
import { SearchErrorHandler } from './error-handler';
import { NLPService } from './nlp-service';
import { Redis } from 'ioredis';

// Tipos específicos para Vector Database
interface VectorDatabaseConfig {
  provider: 'supabase' | 'pinecone';
  supabase?: {
    embeddingTable: string;
    vectorColumn: string;
    metadataColumn: string;
    similarityFunction: 'cosine' | 'inner_product' | 'l2';
    threshold: number;
  };
  pinecone?: {
    apiKey: string;
    environment: string;
    indexName: string;
    dimensions: number;
    metric: 'cosine' | 'euclidean' | 'dotproduct';
  };
  cache: {
    enabled: boolean;
    ttl: number; // Time to live em segundos
    maxSize: number; // Máximo de embeddings em cache
  };
}

interface VectorIndex {
  id: string;
  name: string;
  description: string;
  documentType: 'patient' | 'consultation' | 'medical_record' | 'general';
  dimensions: number;
  totalVectors: number;
  lastUpdated: Date;
  metadata: Record<string, any>;
}

interface EmbeddingOperation {
  operation: 'insert' | 'update' | 'delete' | 'search';
  documentId: string;
  vector?: number[];
  metadata?: EmbeddingMetadata;
  timestamp: Date;
  userId?: string;
  success: boolean;
  error?: string;
}

/**
 * Sistema avançado de Vector Database para busca semântica
 * 
 * Gerencia embeddings vetoriais, busca por similaridade e cache
 * inteligente para otimização de performance em ambiente clínico.
 */
export class VectorDatabase {
  private supabase;
  private config: VectorDatabaseConfig;
  private redis?: Redis;
  private auditLogger: AuditLogger;
  private errorHandler: SearchErrorHandler;
  private nlpService: NLPService;
  private embeddingCache: Map<string, { vector: number[]; timestamp: Date }>;

  constructor(config: VectorDatabaseConfig) {
    this.supabase = createClient();
    this.config = config;
    this.auditLogger = new AuditLogger();
    this.errorHandler = new SearchErrorHandler();
    this.nlpService = new NLPService();
    this.embeddingCache = new Map();

    // Inicializar Redis se configurado
    if (this.config.cache.enabled && process.env.REDIS_URL) {
      this.redis = new Redis(process.env.REDIS_URL);
    }
  }

  /**
   * Gerar embedding para texto/documento
   */
  async generateEmbedding(
    text: string, 
    documentType: VectorDocument['type'],
    metadata?: EmbeddingMetadata
  ): Promise<SearchEmbedding> {
    try {
      // Verificar cache primeiro
      const cacheKey = `embedding:${documentType}:${this.hashText(text)}`;
      const cached = await this.getCachedEmbedding(cacheKey);
      
      if (cached) {
        await this.auditLogger.logSearchActivity('vector_embedding', {
          source: 'cache',
          documentType,
          textLength: text.length
        });
        
        return {
          id: cached.id || crypto.randomUUID(),
          vector: cached.vector,
          metadata: metadata || {},
          text: text,
          createdAt: cached.timestamp
        };
      }

      // Gerar novo embedding via NLP service
      const vector = await this.nlpService.generateEmbedding(text, {
        model: 'text-embedding-3-large', // OpenAI ou equivalente
        dimensions: 1536,
        contextType: documentType
      });

      const embedding: SearchEmbedding = {
        id: crypto.randomUUID(),
        vector,
        metadata: {
          ...metadata,
          documentType,
          textLength: text.length,
          generatedAt: new Date().toISOString(),
          version: '1.0'
        },
        text: text,
        createdAt: new Date()
      };

      // Salvar no cache
      await this.setCachedEmbedding(cacheKey, embedding);

      await this.auditLogger.logSearchActivity('vector_embedding', {
        source: 'generated',
        documentType,
        textLength: text.length,
        dimensions: vector.length
      });

      return embedding;

    } catch (error) {
      const handledError = await this.errorHandler.handleVectorError(error, {
        operation: 'generate_embedding',
        text: text.substring(0, 100),
        documentType
      });
      
      throw handledError;
    }
  }

  /**
   * Armazenar embedding no vector database
   */
  async storeEmbedding(
    embedding: SearchEmbedding,
    documentId: string,
    documentType: VectorDocument['type']
  ): Promise<boolean> {
    try {
      const operation: EmbeddingOperation = {
        operation: 'insert',
        documentId,
        vector: embedding.vector,
        metadata: embedding.metadata,
        timestamp: new Date(),
        success: false
      };

      if (this.config.provider === 'supabase') {
        const { error } = await this.supabase
          .from(this.config.supabase!.embeddingTable)
          .insert({
            id: embedding.id,
            document_id: documentId,
            document_type: documentType,
            embedding: embedding.vector,
            metadata: embedding.metadata,
            text_content: embedding.text,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          operation.error = error.message;
          await this.logOperation(operation);
          throw error;
        }
      }

      operation.success = true;
      await this.logOperation(operation);

      await this.auditLogger.logSearchActivity('vector_store', {
        documentId,
        documentType,
        embeddingId: embedding.id,
        vectorDimensions: embedding.vector.length
      });

      return true;

    } catch (error) {
      const handledError = await this.errorHandler.handleVectorError(error, {
        operation: 'store_embedding',
        documentId,
        documentType
      });
      
      throw handledError;
    }
  }

  /**
   * Busca por similaridade semântica
   */
  async searchSimilar(
    query: VectorSearchQuery,
    options: SemanticSearchOptions = {}
  ): Promise<VectorSearchResult[]> {
    try {
      const startTime = Date.now();

      // Gerar embedding para query
      const queryEmbedding = await this.generateEmbedding(
        query.text,
        'general' // Tipo genérico para queries
      );

      const searchOptions = {
        limit: options.limit || 10,
        threshold: options.threshold || this.config.supabase?.threshold || 0.7,
        documentTypes: options.documentTypes || ['patient', 'consultation', 'medical_record'],
        includeMetadata: options.includeMetadata !== false,
        ...options
      };

      let results: VectorSearchResult[] = [];

      if (this.config.provider === 'supabase') {
        const { data, error } = await this.supabase
          .rpc('search_embeddings', {
            query_embedding: queryEmbedding.vector,
            similarity_threshold: searchOptions.threshold,
            match_count: searchOptions.limit,
            document_types: searchOptions.documentTypes
          });

        if (error) throw error;

        results = data.map((item: any) => ({
          id: item.id,
          documentId: item.document_id,
          score: item.similarity,
          content: item.text_content,
          metadata: item.metadata,
          documentType: item.document_type,
          embedding: searchOptions.includeEmbeddings ? item.embedding : undefined
        }));
      }

      const executionTime = Date.now() - startTime;

      await this.auditLogger.logSearchActivity('vector_search', {
        queryText: query.text,
        queryType: query.type,
        resultsCount: results.length,
        executionTime,
        threshold: searchOptions.threshold,
        documentTypes: searchOptions.documentTypes
      });

      // Aplicar filtros adicionais se especificados
      if (query.filters) {
        results = this.applySemanticFilters(results, query.filters);
      }

      // Ordenar por relevância se especificado
      if (query.sortBy === 'relevance') {
        results.sort((a, b) => b.score - a.score);
      }

      return results;

    } catch (error) {
      const handledError = await this.errorHandler.handleVectorError(error, {
        operation: 'vector_search',
        queryText: query.text,
        queryType: query.type
      });
      
      throw handledError;
    }
  }

  /**
   * Buscar embeddings similares por documento
   */
  async findSimilarDocuments(
    documentId: string,
    documentType: VectorDocument['type'],
    limit: number = 5
  ): Promise<VectorSearchResult[]> {
    try {
      // Buscar embedding do documento original
      const { data: originalDoc, error } = await this.supabase
        .from(this.config.supabase!.embeddingTable)
        .select('embedding, text_content')
        .eq('document_id', documentId)
        .eq('document_type', documentType)
        .single();

      if (error || !originalDoc) {
        throw new Error(`Documento não encontrado: ${documentId}`);
      }

      // Buscar documentos similares
      const query: VectorSearchQuery = {
        text: originalDoc.text_content,
        type: 'similarity',
        documentTypes: [documentType]
      };

      const similarResults = await this.searchSimilar(query, {
        limit: limit + 1, // +1 para excluir o próprio documento
        threshold: 0.6,
        documentTypes: [documentType]
      });

      // Remover o documento original dos resultados
      const filteredResults = similarResults.filter(
        result => result.documentId !== documentId
      );

      await this.auditLogger.logSearchActivity('similar_documents', {
        originalDocumentId: documentId,
        documentType,
        foundSimilar: filteredResults.length,
        limit
      });

      return filteredResults.slice(0, limit);

    } catch (error) {
      const handledError = await this.errorHandler.handleVectorError(error, {
        operation: 'find_similar_documents',
        documentId,
        documentType
      });
      
      throw handledError;
    }
  }

  /**
   * Atualizar embedding existente
   */
  async updateEmbedding(
    documentId: string,
    newText: string,
    documentType: VectorDocument['type'],
    metadata?: EmbeddingMetadata
  ): Promise<boolean> {
    try {
      // Gerar novo embedding
      const newEmbedding = await this.generateEmbedding(newText, documentType, metadata);

      const operation: EmbeddingOperation = {
        operation: 'update',
        documentId,
        vector: newEmbedding.vector,
        metadata: newEmbedding.metadata,
        timestamp: new Date(),
        success: false
      };

      if (this.config.provider === 'supabase') {
        const { error } = await this.supabase
          .from(this.config.supabase!.embeddingTable)
          .update({
            embedding: newEmbedding.vector,
            metadata: newEmbedding.metadata,
            text_content: newText,
            updated_at: new Date().toISOString()
          })
          .eq('document_id', documentId)
          .eq('document_type', documentType);

        if (error) {
          operation.error = error.message;
          await this.logOperation(operation);
          throw error;
        }
      }

      operation.success = true;
      await this.logOperation(operation);

      // Limpar cache relacionado
      await this.clearDocumentCache(documentId);

      await this.auditLogger.logSearchActivity('vector_update', {
        documentId,
        documentType,
        textLength: newText.length
      });

      return true;

    } catch (error) {
      const handledError = await this.errorHandler.handleVectorError(error, {
        operation: 'update_embedding',
        documentId,
        documentType
      });
      
      throw handledError;
    }
  }

  /**
   * Remover embedding
   */
  async deleteEmbedding(
    documentId: string,
    documentType: VectorDocument['type']
  ): Promise<boolean> {
    try {
      const operation: EmbeddingOperation = {
        operation: 'delete',
        documentId,
        timestamp: new Date(),
        success: false
      };

      if (this.config.provider === 'supabase') {
        const { error } = await this.supabase
          .from(this.config.supabase!.embeddingTable)
          .delete()
          .eq('document_id', documentId)
          .eq('document_type', documentType);

        if (error) {
          operation.error = error.message;
          await this.logOperation(operation);
          throw error;
        }
      }

      operation.success = true;
      await this.logOperation(operation);

      // Limpar cache relacionado
      await this.clearDocumentCache(documentId);

      await this.auditLogger.logSearchActivity('vector_delete', {
        documentId,
        documentType
      });

      return true;

    } catch (error) {
      const handledError = await this.errorHandler.handleVectorError(error, {
        operation: 'delete_embedding',
        documentId,
        documentType
      });
      
      throw handledError;
    }
  }

  /**
   * Recriar índices de embeddings
   */
  async rebuildIndex(documentType?: VectorDocument['type']): Promise<void> {
    try {
      await this.auditLogger.logSearchActivity('index_rebuild_start', {
        documentType: documentType || 'all',
        timestamp: new Date().toISOString()
      });

      // Implementar reconstrução baseada no provider
      if (this.config.provider === 'supabase') {
        // Executar procedimento de reindexação no Supabase
        const { error } = await this.supabase
          .rpc('rebuild_vector_index', {
            target_document_type: documentType
          });

        if (error) throw error;
      }

      // Limpar todo o cache
      await this.clearAllCache();

      await this.auditLogger.logSearchActivity('index_rebuild_complete', {
        documentType: documentType || 'all',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      const handledError = await this.errorHandler.handleVectorError(error, {
        operation: 'rebuild_index',
        documentType
      });
      
      throw handledError;
    }
  }

  /**
   * Obter estatísticas do vector database
   */
  async getIndexStats(): Promise<VectorIndex[]> {
    try {
      if (this.config.provider === 'supabase') {
        const { data, error } = await this.supabase
          .rpc('get_vector_index_stats');

        if (error) throw error;

        return data.map((stat: any) => ({
          id: stat.document_type,
          name: `${stat.document_type}_index`,
          description: `Vector index for ${stat.document_type} documents`,
          documentType: stat.document_type,
          dimensions: stat.avg_dimensions || 1536,
          totalVectors: stat.total_vectors,
          lastUpdated: new Date(stat.last_updated),
          metadata: {
            avgSimilarityScore: stat.avg_similarity,
            searchesPerDay: stat.daily_searches,
            cacheHitRate: stat.cache_hit_rate
          }
        }));
      }

      return [];

    } catch (error) {
      const handledError = await this.errorHandler.handleVectorError(error, {
        operation: 'get_index_stats'
      });
      
      throw handledError;
    }
  }

  // Métodos privados auxiliares

  private hashText(text: string): string {
    // Hash simples para cache keys
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  private async getCachedEmbedding(key: string): Promise<SearchEmbedding | null> {
    try {
      if (this.redis) {
        const cached = await this.redis.get(key);
        return cached ? JSON.parse(cached) : null;
      }

      // Fallback para cache em memória
      const memCached = this.embeddingCache.get(key);
      if (memCached && (Date.now() - memCached.timestamp.getTime()) < (this.config.cache.ttl * 1000)) {
        return {
          id: key,
          vector: memCached.vector,
          metadata: {},
          text: '',
          createdAt: memCached.timestamp
        };
      }

      return null;
    } catch (error) {
      console.warn('Erro ao acessar cache de embedding:', error);
      return null;
    }
  }

  private async setCachedEmbedding(key: string, embedding: SearchEmbedding): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.setex(key, this.config.cache.ttl, JSON.stringify(embedding));
      }

      // Cache em memória como fallback
      this.embeddingCache.set(key, {
        vector: embedding.vector,
        timestamp: new Date()
      });

      // Limitar tamanho do cache em memória
      if (this.embeddingCache.size > this.config.cache.maxSize) {
        const firstKey = this.embeddingCache.keys().next().value;
        this.embeddingCache.delete(firstKey);
      }
    } catch (error) {
      console.warn('Erro ao salvar cache de embedding:', error);
    }
  }

  private async clearDocumentCache(documentId: string): Promise<void> {
    try {
      if (this.redis) {
        const pattern = `embedding:*:*${documentId}*`;
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }
    } catch (error) {
      console.warn('Erro ao limpar cache do documento:', error);
    }
  }

  private async clearAllCache(): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.flushdb();
      }
      this.embeddingCache.clear();
    } catch (error) {
      console.warn('Erro ao limpar todo o cache:', error);
    }
  }

  private applySemanticFilters(
    results: VectorSearchResult[],
    filters: Record<string, any>
  ): VectorSearchResult[] {
    return results.filter(result => {
      return Object.entries(filters).every(([key, value]) => {
        if (result.metadata && result.metadata[key]) {
          return result.metadata[key] === value;
        }
        return false;
      });
    });
  }

  private async logOperation(operation: EmbeddingOperation): Promise<void> {
    try {
      await this.auditLogger.logSearchActivity('vector_operation', {
        operation: operation.operation,
        documentId: operation.documentId,
        success: operation.success,
        error: operation.error,
        timestamp: operation.timestamp.toISOString()
      });
    } catch (error) {
      console.warn('Erro ao registrar operação de vector:', error);
    }
  }
}

/**
 * Factory para criar instância configurada do VectorDatabase
 */
export function createVectorDatabase(): VectorDatabase {
  const config: VectorDatabaseConfig = {
    provider: (process.env.VECTOR_DB_PROVIDER as 'supabase' | 'pinecone') || 'supabase',
    supabase: {
      embeddingTable: 'vector_embeddings',
      vectorColumn: 'embedding',
      metadataColumn: 'metadata',
      similarityFunction: 'cosine',
      threshold: 0.7
    },
    pinecone: {
      apiKey: process.env.PINECONE_API_KEY || '',
      environment: process.env.PINECONE_ENVIRONMENT || 'us-west1-gcp',
      indexName: process.env.PINECONE_INDEX_NAME || 'neonpro-vectors',
      dimensions: 1536,
      metric: 'cosine'
    },
    cache: {
      enabled: process.env.VECTOR_CACHE_ENABLED === 'true',
      ttl: parseInt(process.env.VECTOR_CACHE_TTL || '3600'), // 1 hora
      maxSize: parseInt(process.env.VECTOR_CACHE_MAX_SIZE || '1000')
    }
  };

  return new VectorDatabase(config);
}

/**
 * Instância global do VectorDatabase (singleton)
 */
export const vectorDatabase = createVectorDatabase();

/**
 * Hook para acessar VectorDatabase em componentes React
 */
export function useVectorDatabase() {
  return vectorDatabase;
}