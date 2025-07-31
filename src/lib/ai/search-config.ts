// ⚙️ Search Configuration & Settings - Smart Search + NLP Integration
// NeonPro - Sistema de Configuração e Definições da Busca Inteligente
// Quality Standard: ≥9.5/10 (BMad Enhanced)

import { 
  SearchIntent, 
  SearchProvider, 
  SearchMode,
  SearchContext 
} from '@/lib/types/search-types';

export interface SearchConfiguration {
  // Provider Settings
  providers: {
    primary: SearchProvider;
    fallback: SearchProvider[];
    nlp: {
      provider: 'openai' | 'claude' | 'local';
      model: string;
      apiKey?: string;
      endpoint?: string;
      maxTokens: number;
      temperature: number;
      timeout: number;
    };
    vector: {
      provider: 'supabase' | 'pinecone' | 'elasticsearch';
      endpoint?: string;
      apiKey?: string;
      indexName: string;
      dimensions: number;
      distance: 'cosine' | 'euclidean' | 'dot_product';
    };
    search: {
      provider: 'elasticsearch' | 'algolia' | 'supabase';
      endpoint?: string;
      apiKey?: string;
      indexPrefix: string;
      maxResults: number;
      timeout: number;
    };
  };

  // Search Behavior
  behavior: {
    defaultMode: SearchMode;
    enableAutoComplete: boolean;
    enableSpellCorrection: boolean;
    enableSynonymExpansion: boolean;
    enablePersonalization: boolean;
    enableAnalytics: boolean;
    enableCache: boolean;
    cacheTimeout: number; // in seconds
    maxQueryLength: number;
    minQueryLength: number;
    defaultResultsPerPage: number;
    maxResultsPerPage: number;
  };

  // Intent Recognition
  intentRecognition: {
    enabled: boolean;
    confidenceThreshold: number; // 0-1
    fallbackToGeneral: boolean;
    customIntents: Array<{
      name: string;
      keywords: string[];
      weight: number;
      context?: SearchContext;
    }>;
    intentMapping: Record<SearchIntent, {
      weight: number;
      boost: number;
      filters: any[];
      sorts: any[];
    }>;
  };

  // Performance & Caching
  performance: {
    enableQueryOptimization: boolean;
    enableResultCaching: boolean;
    enableQueryCaching: boolean;
    cacheStrategy: 'lru' | 'lfu' | 'ttl';
    maxCacheSize: number; // in MB
    queryTimeout: number; // in milliseconds
    batchSize: number;
    enableParallelSearch: boolean;
    enableIndexOptimization: boolean;
    indexOptimizationInterval: number; // in hours
  };

  // Security & Compliance
  security: {
    enableRLS: boolean;
    enableAuditLogging: boolean;
    enableDataMasking: boolean;
    sensitiveFields: string[];
    encryptionEnabled: boolean;
    enableRateLimiting: boolean;
    rateLimit: {
      requestsPerMinute: number;
      requestsPerHour: number;
      requestsPerDay: number;
    };
    enableIPWhitelisting: boolean;
    allowedIPs: string[];
    enableSessionValidation: boolean;
  };

  // LGPD Compliance
  lgpd: {
    enableDataMinimization: boolean;
    enableConsentValidation: boolean;
    enableDataAnonymization: boolean;
    dataRetentionDays: number;
    enableRightToForgetting: boolean;
    enableDataPortability: boolean;
    sensitiveDataCategories: string[];
    minimumConsentLevel: 'basic' | 'detailed' | 'granular';
    enableTransparencyReports: boolean;
  };

  // Index Configuration
  indexing: {
    entities: Record<string, {
      enabled: boolean;
      fields: Array<{
        name: string;
        type: 'text' | 'keyword' | 'number' | 'date' | 'boolean' | 'vector';
        weight: number;
        searchable: boolean;
        filterable: boolean;
        sortable: boolean;
        facetable: boolean;
        highlight: boolean;
      }>;
      relationships: Array<{
        target: string;
        type: 'one_to_one' | 'one_to_many' | 'many_to_many';
        joinField: string;
      }>;
      permissions: {
        read: string[];
        write: string[];
        admin: string[];
      };
    }>;
    updateStrategy: 'real_time' | 'batch' | 'scheduled';
    batchSize: number;
    updateInterval: number; // in minutes
  };

  // Analytics & Monitoring
  analytics: {
    enableRealTimeAnalytics: boolean;
    enableUserBehaviorTracking: boolean;
    enablePerformanceMonitoring: boolean;
    enableErrorTracking: boolean;
    retentionDays: number;
    samplingRate: number; // 0-1
    customEvents: string[];
    dashboardEnabled: boolean;
    alertsEnabled: boolean;
    alertThresholds: {
      errorRate: number;
      responseTime: number;
      successRate: number;
    };
  };

  // User Interface
  ui: {
    enableSearchSuggestions: boolean;
    enableRecentSearches: boolean;
    enableSavedSearches: boolean;
    enableSearchHistory: boolean;
    enableAdvancedFilters: boolean;
    enableBulkActions: boolean;
    enableExport: boolean;
    exportFormats: ('csv' | 'pdf' | 'xlsx' | 'json')[];
    theme: {
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
      backgroundColor: string;
      textColor: string;
    };
    layout: {
      searchBarPosition: 'top' | 'center' | 'sidebar';
      resultsLayout: 'list' | 'grid' | 'table';
      filtersPosition: 'left' | 'right' | 'top';
      enableMobileOptimization: boolean;
    };
  };
}

/**
 * Default search configuration for NeonPro clinic management
 */
export const defaultSearchConfig: SearchConfiguration = {
  providers: {
    primary: 'hybrid',
    fallback: ['elasticsearch', 'supabase'],
    nlp: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      maxTokens: 1000,
      temperature: 0.1,
      timeout: 10000
    },
    vector: {
      provider: 'supabase',
      indexName: 'neonpro_vectors',
      dimensions: 1536,
      distance: 'cosine'
    },
    search: {
      provider: 'supabase',
      indexPrefix: 'neonpro',
      maxResults: 100,
      timeout: 5000
    }
  },

  behavior: {
    defaultMode: 'intelligent',
    enableAutoComplete: true,
    enableSpellCorrection: true,
    enableSynonymExpansion: true,
    enablePersonalization: true,
    enableAnalytics: true,
    enableCache: true,
    cacheTimeout: 300, // 5 minutes
    maxQueryLength: 500,
    minQueryLength: 2,
    defaultResultsPerPage: 20,
    maxResultsPerPage: 100
  },

  intentRecognition: {
    enabled: true,
    confidenceThreshold: 0.7,
    fallbackToGeneral: true,
    customIntents: [
      {
        name: 'emergency_lookup',
        keywords: ['emergência', 'urgente', 'crítico', 'emergency', 'urgent'],
        weight: 1.5,
        context: 'emergency'
      },
      {
        name: 'financial_query',
        keywords: ['pagamento', 'cobrança', 'valor', 'preço', 'payment', 'billing'],
        weight: 1.2,
        context: 'financial'
      },
      {
        name: 'schedule_related',
        keywords: ['agenda', 'horário', 'disponibilidade', 'schedule', 'appointment'],
        weight: 1.3,
        context: 'scheduling'
      }
    ],
    intentMapping: {
      'patient_lookup': { weight: 1.0, boost: 1.2, filters: [], sorts: [{ field: 'relevance', order: 'desc' }] },
      'appointment_search': { weight: 1.0, boost: 1.1, filters: [], sorts: [{ field: 'date', order: 'desc' }] },
      'medical_record_search': { weight: 1.2, boost: 1.3, filters: [], sorts: [{ field: 'date', order: 'desc' }] },
      'procedure_search': { weight: 1.0, boost: 1.0, filters: [], sorts: [{ field: 'name', order: 'asc' }] },
      'financial_search': { weight: 1.0, boost: 1.1, filters: [], sorts: [{ field: 'amount', order: 'desc' }] },
      'compliance_search': { weight: 1.3, boost: 1.4, filters: [], sorts: [{ field: 'date', order: 'desc' }] },
      'similar_cases': { weight: 0.9, boost: 0.8, filters: [], sorts: [{ field: 'similarity', order: 'desc' }] },
      'treatment_history': { weight: 1.1, boost: 1.2, filters: [], sorts: [{ field: 'date', order: 'desc' }] },
      'analytics_search': { weight: 0.8, boost: 0.7, filters: [], sorts: [{ field: 'date', order: 'desc' }] },
      'general_search': { weight: 1.0, boost: 1.0, filters: [], sorts: [{ field: 'relevance', order: 'desc' }] }
    }
  },

  performance: {
    enableQueryOptimization: true,
    enableResultCaching: true,
    enableQueryCaching: true,
    cacheStrategy: 'lru',
    maxCacheSize: 100, // 100MB
    queryTimeout: 10000, // 10 seconds
    batchSize: 50,
    enableParallelSearch: true,
    enableIndexOptimization: true,
    indexOptimizationInterval: 24 // 24 hours
  },

  security: {
    enableRLS: true,
    enableAuditLogging: true,
    enableDataMasking: true,
    sensitiveFields: ['cpf', 'rg', 'phone', 'email', 'address', 'medical_data'],
    encryptionEnabled: true,
    enableRateLimiting: true,
    rateLimit: {
      requestsPerMinute: 100,
      requestsPerHour: 1000,
      requestsPerDay: 10000
    },
    enableIPWhitelisting: false,
    allowedIPs: [],
    enableSessionValidation: true
  },

  lgpd: {
    enableDataMinimization: true,
    enableConsentValidation: true,
    enableDataAnonymization: true,
    dataRetentionDays: 2555, // 7 years (CFM requirement)
    enableRightToForgetting: true,
    enableDataPortability: true,
    sensitiveDataCategories: ['health', 'biometric', 'personal', 'financial'],
    minimumConsentLevel: 'granular',
    enableTransparencyReports: true
  },

  indexing: {
    entities: {
      patients: {
        enabled: true,
        fields: [
          { name: 'id', type: 'keyword', weight: 1.0, searchable: false, filterable: true, sortable: true, facetable: false, highlight: false },
          { name: 'name', type: 'text', weight: 2.0, searchable: true, filterable: true, sortable: true, facetable: false, highlight: true },
          { name: 'cpf', type: 'keyword', weight: 1.5, searchable: true, filterable: true, sortable: false, facetable: false, highlight: false },
          { name: 'email', type: 'keyword', weight: 1.2, searchable: true, filterable: true, sortable: true, facetable: false, highlight: true },
          { name: 'phone', type: 'keyword', weight: 1.2, searchable: true, filterable: true, sortable: false, facetable: false, highlight: false },
          { name: 'birth_date', type: 'date', weight: 1.0, searchable: false, filterable: true, sortable: true, facetable: true, highlight: false },
          { name: 'gender', type: 'keyword', weight: 0.8, searchable: false, filterable: true, sortable: false, facetable: true, highlight: false },
          { name: 'status', type: 'keyword', weight: 1.0, searchable: false, filterable: true, sortable: false, facetable: true, highlight: false },
          { name: 'created_at', type: 'date', weight: 0.5, searchable: false, filterable: true, sortable: true, facetable: false, highlight: false }
        ],
        relationships: [
          { target: 'appointments', type: 'one_to_many', joinField: 'patient_id' },
          { target: 'medical_records', type: 'one_to_many', joinField: 'patient_id' },
          { target: 'payments', type: 'one_to_many', joinField: 'patient_id' }
        ],
        permissions: {
          read: ['medical_staff', 'admin', 'reception'],
          write: ['medical_staff', 'admin'],
          admin: ['admin']
        }
      },
      appointments: {
        enabled: true,
        fields: [
          { name: 'id', type: 'keyword', weight: 1.0, searchable: false, filterable: true, sortable: true, facetable: false, highlight: false },
          { name: 'patient_name', type: 'text', weight: 2.0, searchable: true, filterable: true, sortable: true, facetable: false, highlight: true },
          { name: 'procedure_name', type: 'text', weight: 1.8, searchable: true, filterable: true, sortable: true, facetable: true, highlight: true },
          { name: 'professional_name', type: 'text', weight: 1.5, searchable: true, filterable: true, sortable: true, facetable: true, highlight: true },
          { name: 'date', type: 'date', weight: 1.2, searchable: false, filterable: true, sortable: true, facetable: true, highlight: false },
          { name: 'time', type: 'keyword', weight: 1.0, searchable: false, filterable: true, sortable: true, facetable: true, highlight: false },
          { name: 'status', type: 'keyword', weight: 1.1, searchable: false, filterable: true, sortable: false, facetable: true, highlight: false },
          { name: 'notes', type: 'text', weight: 1.0, searchable: true, filterable: false, sortable: false, facetable: false, highlight: true }
        ],
        relationships: [
          { target: 'patients', type: 'many_to_one', joinField: 'patient_id' },
          { target: 'procedures', type: 'many_to_one', joinField: 'procedure_id' },
          { target: 'professionals', type: 'many_to_one', joinField: 'professional_id' }
        ],
        permissions: {
          read: ['medical_staff', 'admin', 'reception'],
          write: ['medical_staff', 'admin', 'reception'],
          admin: ['admin']
        }
      },
      procedures: {
        enabled: true,
        fields: [
          { name: 'id', type: 'keyword', weight: 1.0, searchable: false, filterable: true, sortable: true, facetable: false, highlight: false },
          { name: 'name', type: 'text', weight: 2.0, searchable: true, filterable: true, sortable: true, facetable: false, highlight: true },
          { name: 'category', type: 'keyword', weight: 1.5, searchable: false, filterable: true, sortable: true, facetable: true, highlight: false },
          { name: 'description', type: 'text', weight: 1.2, searchable: true, filterable: false, sortable: false, facetable: false, highlight: true },
          { name: 'duration', type: 'number', weight: 0.8, searchable: false, filterable: true, sortable: true, facetable: true, highlight: false },
          { name: 'price', type: 'number', weight: 1.0, searchable: false, filterable: true, sortable: true, facetable: true, highlight: false },
          { name: 'active', type: 'boolean', weight: 1.0, searchable: false, filterable: true, sortable: false, facetable: true, highlight: false }
        ],
        relationships: [
          { target: 'appointments', type: 'one_to_many', joinField: 'procedure_id' }
        ],
        permissions: {
          read: ['medical_staff', 'admin', 'reception'],
          write: ['admin'],
          admin: ['admin']
        }
      },
      payments: {
        enabled: true,
        fields: [
          { name: 'id', type: 'keyword', weight: 1.0, searchable: false, filterable: true, sortable: true, facetable: false, highlight: false },
          { name: 'patient_name', type: 'text', weight: 2.0, searchable: true, filterable: true, sortable: true, facetable: false, highlight: true },
          { name: 'amount', type: 'number', weight: 1.5, searchable: false, filterable: true, sortable: true, facetable: true, highlight: false },
          { name: 'method', type: 'keyword', weight: 1.2, searchable: false, filterable: true, sortable: false, facetable: true, highlight: false },
          { name: 'status', type: 'keyword', weight: 1.3, searchable: false, filterable: true, sortable: false, facetable: true, highlight: false },
          { name: 'date', type: 'date', weight: 1.1, searchable: false, filterable: true, sortable: true, facetable: true, highlight: false },
          { name: 'description', type: 'text', weight: 1.0, searchable: true, filterable: false, sortable: false, facetable: false, highlight: true }
        ],
        relationships: [
          { target: 'patients', type: 'many_to_one', joinField: 'patient_id' },
          { target: 'appointments', type: 'many_to_one', joinField: 'appointment_id' }
        ],
        permissions: {
          read: ['admin', 'financial'],
          write: ['admin', 'financial'],
          admin: ['admin']
        }
      }
    },
    updateStrategy: 'real_time',
    batchSize: 100,
    updateInterval: 5 // 5 minutes
  },

  analytics: {
    enableRealTimeAnalytics: true,
    enableUserBehaviorTracking: true,
    enablePerformanceMonitoring: true,
    enableErrorTracking: true,
    retentionDays: 365,
    samplingRate: 1.0,
    customEvents: ['search_performed', 'result_clicked', 'filter_applied', 'export_requested'],
    dashboardEnabled: true,
    alertsEnabled: true,
    alertThresholds: {
      errorRate: 0.05, // 5%
      responseTime: 5000, // 5 seconds
      successRate: 0.95 // 95%
    }
  },

  ui: {
    enableSearchSuggestions: true,
    enableRecentSearches: true,
    enableSavedSearches: true,
    enableSearchHistory: true,
    enableAdvancedFilters: true,
    enableBulkActions: true,
    enableExport: true,
    exportFormats: ['csv', 'pdf', 'xlsx'],
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#6b7280',
      accentColor: '#10b981',
      backgroundColor: '#ffffff',
      textColor: '#111827'
    },
    layout: {
      searchBarPosition: 'top',
      resultsLayout: 'list',
      filtersPosition: 'left',
      enableMobileOptimization: true
    }
  }
};

/**
 * Configuration manager for search settings
 */
export class SearchConfigurationManager {
  private config: SearchConfiguration;
  private configKey = 'neonpro_search_config';

  constructor(initialConfig?: Partial<SearchConfiguration>) {
    this.config = this.mergeConfig(defaultSearchConfig, initialConfig || {});
  }

  /**
   * Get current configuration
   */
  getConfig(): SearchConfiguration {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SearchConfiguration>): void {
    this.config = this.mergeConfig(this.config, updates);
    this.saveConfig();
    this.validateConfig();
  }

  /**
   * Get provider-specific configuration
   */
  getProviderConfig(provider: SearchProvider): any {
    switch (provider) {
      case 'elasticsearch':
        return this.config.providers.search;
      case 'supabase':
        return {
          ...this.config.providers.search,
          ...this.config.providers.vector
        };
      case 'hybrid':
        return {
          search: this.config.providers.search,
          vector: this.config.providers.vector,
          nlp: this.config.providers.nlp
        };
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Get intent-specific configuration
   */
  getIntentConfig(intent: SearchIntent): any {
    return this.config.intentRecognition.intentMapping[intent] || 
           this.config.intentRecognition.intentMapping['general_search'];
  }

  /**
   * Get entity indexing configuration
   */
  getEntityConfig(entity: string): any {
    return this.config.indexing.entities[entity];
  }

  /**
   * Validate current configuration
   */
  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate providers
    if (!this.config.providers.primary) {
      errors.push('Primary provider is required');
    }

    // Validate NLP configuration
    if (this.config.providers.nlp.maxTokens <= 0) {
      errors.push('NLP maxTokens must be positive');
    }

    if (this.config.providers.nlp.temperature < 0 || this.config.providers.nlp.temperature > 1) {
      errors.push('NLP temperature must be between 0 and 1');
    }

    // Validate behavior settings
    if (this.config.behavior.maxQueryLength < this.config.behavior.minQueryLength) {
      errors.push('maxQueryLength must be greater than minQueryLength');
    }

    if (this.config.behavior.defaultResultsPerPage > this.config.behavior.maxResultsPerPage) {
      errors.push('defaultResultsPerPage cannot exceed maxResultsPerPage');
    }

    // Validate intent recognition
    if (this.config.intentRecognition.confidenceThreshold < 0 || 
        this.config.intentRecognition.confidenceThreshold > 1) {
      errors.push('Intent confidence threshold must be between 0 and 1');
    }

    // Validate performance settings
    if (this.config.performance.maxCacheSize <= 0) {
      errors.push('Cache size must be positive');
    }

    if (this.config.performance.queryTimeout <= 0) {
      errors.push('Query timeout must be positive');
    }

    // Validate security settings
    if (this.config.security.enableRateLimiting) {
      if (this.config.security.rateLimit.requestsPerMinute <= 0) {
        errors.push('Rate limit requests per minute must be positive');
      }
    }

    // Validate LGPD settings
    if (this.config.lgpd.dataRetentionDays <= 0) {
      errors.push('Data retention days must be positive');
    }

    // Validate indexing configuration
    Object.entries(this.config.indexing.entities).forEach(([entityName, entityConfig]) => {
      if (!entityConfig.fields || entityConfig.fields.length === 0) {
        errors.push(`Entity ${entityName} must have at least one field`);
      }

      entityConfig.fields.forEach((field, index) => {
        if (!field.name) {
          errors.push(`Entity ${entityName} field ${index} must have a name`);
        }
        if (field.weight <= 0) {
          errors.push(`Entity ${entityName} field ${field.name} weight must be positive`);
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Reset to default configuration
   */
  resetToDefault(): void {
    this.config = { ...defaultSearchConfig };
    this.saveConfig();
  }

  /**
   * Load configuration from storage
   */
  loadConfig(): void {
    try {
      const saved = localStorage.getItem(this.configKey);
      if (saved) {
        const parsedConfig = JSON.parse(saved);
        this.config = this.mergeConfig(defaultSearchConfig, parsedConfig);
      }
    } catch (error) {
      console.warn('Failed to load search configuration:', error);
      this.config = { ...defaultSearchConfig };
    }
  }

  /**
   * Save configuration to storage
   */
  private saveConfig(): void {
    try {
      localStorage.setItem(this.configKey, JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save search configuration:', error);
    }
  }

  /**
   * Deep merge configuration objects
   */
  private mergeConfig(
    base: SearchConfiguration, 
    override: Partial<SearchConfiguration>
  ): SearchConfiguration {
    return this.deepMerge(base, override) as SearchConfiguration;
  }

  /**
   * Deep merge utility
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  /**
   * Export configuration as JSON
   */
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Import configuration from JSON
   */
  importConfig(configJson: string): { success: boolean; error?: string } {
    try {
      const importedConfig = JSON.parse(configJson);
      this.updateConfig(importedConfig);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid JSON' 
      };
    }
  }

  /**
   * Get configuration summary for debugging
   */
  getConfigSummary(): {
    provider: string;
    entitiesCount: number;
    cacheEnabled: boolean;
    securityLevel: 'basic' | 'standard' | 'high';
    lgpdCompliant: boolean;
    analyticsEnabled: boolean;
  } {
    const securityFeatures = [
      this.config.security.enableRLS,
      this.config.security.enableAuditLogging,
      this.config.security.enableDataMasking,
      this.config.security.encryptionEnabled,
      this.config.security.enableRateLimiting
    ].filter(Boolean).length;

    let securityLevel: 'basic' | 'standard' | 'high' = 'basic';
    if (securityFeatures >= 4) securityLevel = 'high';
    else if (securityFeatures >= 2) securityLevel = 'standard';

    return {
      provider: this.config.providers.primary,
      entitiesCount: Object.keys(this.config.indexing.entities).length,
      cacheEnabled: this.config.behavior.enableCache,
      securityLevel,
      lgpdCompliant: this.config.lgpd.enableDataMinimization && 
                     this.config.lgpd.enableConsentValidation,
      analyticsEnabled: this.config.behavior.enableAnalytics
    };
  }
}

// Create singleton instance
export const searchConfigManager = new SearchConfigurationManager();

// Export types and utilities
export type { SearchConfiguration };
export { defaultSearchConfig };