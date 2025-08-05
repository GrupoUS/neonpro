// lib/search/unified-search.ts - Server-side search implementation
import { createClient } from "@/lib/supabase/server";
import { AIInsightsEngine } from "@/lib/ai/insights-engine";
import { MedicalTimelineManager } from "@/lib/medical/timeline-manager";
import { DuplicateDetectionSystem } from "@/lib/patients/duplicate-detection";
import { PhotoRecognitionSystem } from "@/lib/patients/photo-recognition";
import { ProfileManager } from "@/lib/patients/profile-manager";
import { nlpSearchEngine, type NLPSearchQuery, type SearchContext } from "./nlp-engine";

// Re-export types from the shared types file
export type {
  SearchQuery,
  SearchType,
  SearchResult,
  SearchResponse,
  GlobalSearchStats,
  NLPSearchQuery,
  SearchContext,
  NLPInsights,
  SearchFacets,
  SearchStats,
  SavedSearch,
  SearchHistory
} from "./types";

export interface SearchAction {
  id: string;
  label: string;
  icon?: string;
  url?: string;
  handler?: string;
}

export class createunifiedSearchSystem {
  private supabase = createClient();
  private profileManager = new ProfileManager();
  private timelineManager = new MedicalTimelineManager();
  private duplicateDetection = new DuplicateDetectionSystem();
  private photoRecognition = new PhotoRecognitionSystem();
  private insightsEngine = new AIInsightsEngine();

  /**
   * Executa busca unificada em todo o sistema com análise NLP
   */
  async search(query: SearchQuery): Promise<SearchResponse> {
    const startTime = performance.now();
    
    try {
      // Process query with NLP if enabled
      let nlpAnalysis: NLPSearchQuery | undefined;
      if (query.options?.useNLP !== false) {
        nlpAnalysis = await nlpSearchEngine.processQuery(query.term, query.context);
        query.nlpAnalysis = nlpAnalysis;
      }

      let allResults: SearchResult[] = [];
      const searchPromises: Promise<SearchResult[]>[] = [];

      // Determinar tipos de busca baseado nos filtros ou análise NLP
      let searchTypes = query.filters?.types || [
        'patients', 'appointments', 'medical_records', 'insights', 'timeline_events'
      ];

      // Refine search types based on NLP intent
      if (nlpAnalysis) {
        searchTypes = this.refineSearchTypesFromNLP(searchTypes, nlpAnalysis);
      }

      // Executar buscas em paralelo para cada tipo
      if (searchTypes.includes('patients')) {
        searchPromises.push(this.searchPatients(query));
      }

      if (searchTypes.includes('timeline_events')) {
        searchPromises.push(this.searchTimelineEvents(query));
      }

      if (searchTypes.includes('insights')) {
        searchPromises.push(this.searchInsights(query));
      }

      if (searchTypes.includes('duplicates')) {
        searchPromises.push(this.searchDuplicates(query));
      }

      if (searchTypes.includes('photos')) {
        searchPromises.push(this.searchPhotos(query));
      }

      if (searchTypes.includes('medical_records')) {
        searchPromises.push(this.searchMedicalRecords(query));
      }

      if (searchTypes.includes('appointments')) {
        searchPromises.push(this.searchAppointments(query));
      }

      if (searchTypes.includes('documents')) {
        searchPromises.push(this.searchDocuments(query));
      }

      // Aguardar resultados de todas as buscas
      const searchResults = await Promise.all(searchPromises);
      allResults = searchResults.flat();

      // Ordenar por relevância (considerando scores NLP se disponível)
      allResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

      // Aplicar paginação
      const offset = query.options?.offset || 0;
      const limit = query.options?.limit || 50;
      const paginatedResults = allResults.slice(offset, offset + limit);

      const executionTime = performance.now() - startTime;

      // Use NLP suggestions if available, otherwise fall back to original logic
      const suggestions = nlpAnalysis?.suggestions || this.generateSearchSuggestions(query.term);

      return {
        query,
        nlpAnalysis,
        results: paginatedResults,
        totalCount: allResults.length,
        executionTime,
        suggestions,
        facets: this.generateSearchFacets(allResults)
      };
    } catch (error) {
      console.error('Erro na busca unificada:', error);
      throw new Error('Falha na execução da busca');
    }
  }

  /**
   * Refina tipos de busca baseado na análise NLP
   */
  private refineSearchTypesFromNLP(defaultTypes: SearchType[], nlpAnalysis: NLPSearchQuery): SearchType[] {
    const refinedTypes = [...defaultTypes];

    // Based on intent target, prioritize certain search types
    switch (nlpAnalysis.intent.target) {
      case 'patient':
        if (!refinedTypes.includes('patients')) refinedTypes.unshift('patients');
        if (!refinedTypes.includes('photos')) refinedTypes.push('photos');
        if (!refinedTypes.includes('duplicates')) refinedTypes.push('duplicates');
        break;
      
      case 'appointment':
        if (!refinedTypes.includes('appointments')) refinedTypes.unshift('appointments');
        break;
      
      case 'treatment':
        if (!refinedTypes.includes('medical_records')) refinedTypes.unshift('medical_records');
        if (!refinedTypes.includes('timeline_events')) refinedTypes.push('timeline_events');
        break;
      
      case 'procedure':
        if (!refinedTypes.includes('timeline_events')) refinedTypes.unshift('timeline_events');
        if (!refinedTypes.includes('medical_records')) refinedTypes.push('medical_records');
        break;
      
      case 'record':
        if (!refinedTypes.includes('medical_records')) refinedTypes.unshift('medical_records');
        if (!refinedTypes.includes('documents')) refinedTypes.push('documents');
        break;
    }

    // Based on entities found, add relevant search types
    const hasPersonEntity = nlpAnalysis.entities.some(e => e.type === 'person');
    const hasProcedureEntity = nlpAnalysis.entities.some(e => e.type === 'procedure');
    const hasConditionEntity = nlpAnalysis.entities.some(e => e.type === 'condition');

    if (hasPersonEntity && !refinedTypes.includes('patients')) {
      refinedTypes.unshift('patients');
    }

    if (hasProcedureEntity && !refinedTypes.includes('timeline_events')) {
      refinedTypes.push('timeline_events');
    }

    if (hasConditionEntity && !refinedTypes.includes('medical_records')) {
      refinedTypes.push('medical_records');
    }

    return refinedTypes;
  }

  /**
   * Busca pacientes com melhorias NLP
   */
  private async searchPatients(query: SearchQuery): Promise<SearchResult[]> {
    try {
      const results: SearchResult[] = [];
      const nlpAnalysis = query.nlpAnalysis;
      
      // Enhanced search logic using NLP analysis
      const searchTerm = query.term;
      let nameFilter: string | undefined;
      let ageFilter: { min?: number; max?: number } | undefined;
      let specialtyFilter: string | undefined;
      
      // Extract filters from NLP analysis if available
      if (nlpAnalysis) {
        // Use person entities as name filters
        const personEntities = nlpAnalysis.entities.filter(e => e.type === 'person');
        if (personEntities.length > 0) {
          nameFilter = personEntities[0].value;
        }
        
        // Use age entities for age filtering
        const ageEntities = nlpAnalysis.entities.filter(e => e.type === 'age');
        if (ageEntities.length > 0) {
          const age = parseInt(ageEntities[0].value);
          ageFilter = { min: age - 2, max: age + 2 }; // Allow some variance
        }
        
        // Use specialty entities
        const specialtyEntities = nlpAnalysis.entities.filter(e => e.type === 'specialty');
        if (specialtyEntities.length > 0) {
          specialtyFilter = specialtyEntities[0].value;
        }
      }
      
      // Simular busca de pacientes com filtros NLP
      const mockPatients = [
        {
          id: 'pat_123',
          name: 'João Silva Santos',
          email: 'joao.silva@email.com',
          phone: '(11) 99999-9999',
          birthDate: '1985-03-15',
          age: 39,
          specialty: 'dermatologia'
        },
        {
          id: 'pat_456',
          name: 'Maria Santos Silva',
          email: 'maria.santos@email.com',
          phone: '(11) 88888-8888',
          birthDate: '1990-07-22',
          age: 34,
          specialty: 'estética'
        },
        {
          id: 'pat_789',
          name: 'Ana Botox Cliente',
          email: 'ana.cliente@email.com',
          phone: '(11) 77777-7777',
          birthDate: '1988-11-10',
          age: 36,
          specialty: 'estética'
        }
      ];

      for (const patient of mockPatients) {
        let matches = false;
        let matchScore = 0.5;
        const matchReasons: string[] = [];

        // Check name match
        if (nameFilter) {
          if (patient.name.toLowerCase().includes(nameFilter.toLowerCase())) {
            matches = true;
            matchScore += 0.3;
            matchReasons.push(`Nome corresponde: ${nameFilter}`);
          }
        } else if (this.matchesSearchTerm(searchTerm, patient.name, patient.email, patient.phone)) {
          matches = true;
          matchScore += 0.2;
          matchReasons.push('Corresponde ao termo de busca');
        }

        // Check age match
        if (ageFilter) {
          if (patient.age >= (ageFilter.min || 0) && patient.age <= (ageFilter.max || 120)) {
            matches = true;
            matchScore += 0.2;
            matchReasons.push(`Idade corresponde: ${patient.age} anos`);
          }
        }

        // Check specialty match
        if (specialtyFilter) {
          if (patient.specialty.toLowerCase().includes(specialtyFilter.toLowerCase())) {
            matches = true;
            matchScore += 0.2;
            matchReasons.push(`Especialidade: ${patient.specialty}`);
          }
        }

        // Check for procedure entities (enhanced matching)
        if (nlpAnalysis) {
          const procedureEntities = nlpAnalysis.entities.filter(e => e.type === 'procedure');
          for (const proc of procedureEntities) {
            if (proc.value.toLowerCase() === 'botox' && patient.name.toLowerCase().includes('botox')) {
              matches = true;
              matchScore += 0.3;
              matchReasons.push(`Procedimento relacionado: ${proc.value}`);
            }
          }
        }

        if (matches) {
          results.push({
            id: patient.id,
            type: 'patients',
            title: patient.name,
            description: `${patient.email} • ${patient.phone} • ${patient.age} anos • ${patient.specialty}`,
            relevanceScore: Math.min(matchScore, 1.0),
            metadata: { 
              ...patient, 
              matchReasons,
              nlpEnhanced: !!nlpAnalysis 
            },
            highlights: matchReasons,
            url: `/patients/${patient.id}`,
            actions: [
              { id: 'view', label: 'Ver Perfil', url: `/patients/${patient.id}` },
              { id: 'edit', label: 'Editar', url: `/patients/${patient.id}/edit` },
              { id: 'timeline', label: 'Timeline', url: `/patients/${patient.id}/timeline` }
            ]
          });
        }
      }

      return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } catch (error) {
      console.error('Erro na busca de pacientes:', error);
      return [];
    }
  }

  /**
   * Busca eventos da timeline
   */
  private async searchTimelineEvents(query: SearchQuery): Promise<SearchResult[]> {
    try {
      const results: SearchResult[] = [];

      // Simular busca de eventos da timeline
      const mockEvents = [
        {
          id: 'evt_001',
          title: 'Consulta de Rotina',
          description: 'Consulta anual preventiva',
          date: new Date('2024-01-15'),
          provider: 'Dr. Maria Silva',
          type: 'appointment'
        },
        {
          id: 'evt_002',
          title: 'Exames Laboratoriais',
          description: 'Hemograma completo, perfil lipídico',
          date: new Date('2024-01-20'),
          provider: 'Lab Central',
          type: 'lab'
        }
      ];

      for (const event of mockEvents) {
        if (this.matchesSearchTerm(query.term, event.title, event.description, event.provider)) {
          results.push({
            id: event.id,
            type: 'timeline_events',
            title: event.title,
            description: `${event.description} • ${event.provider}`,
            relevanceScore: this.calculateRelevance(query.term, event.title),
            metadata: event,
            actions: [
              { id: 'view', label: 'Ver Detalhes', handler: 'viewTimelineEvent' }
            ]
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Erro na busca de eventos da timeline:', error);
      return [];
    }
  }

  /**
   * Busca insights de IA
   */
  private async searchInsights(query: SearchQuery): Promise<SearchResult[]> {
    try {
      const results: SearchResult[] = [];

      // Simular busca de insights
      const mockInsights = [
        {
          id: 'insight_001',
          title: 'Risco Cardiovascular Elevado',
          description: 'Análise dos dados clínicos indica risco aumentado',
          confidence: 0.87,
          type: 'clinical'
        },
        {
          id: 'insight_002',
          title: 'Padrão de Não Aderência',
          description: 'IA detectou padrões de baixa aderência medicamentosa',
          confidence: 0.73,
          type: 'behavioral'
        }
      ];

      for (const insight of mockInsights) {
        if (this.matchesSearchTerm(query.term, insight.title, insight.description)) {
          results.push({
            id: insight.id,
            type: 'insights',
            title: insight.title,
            description: insight.description,
            relevanceScore: this.calculateRelevance(query.term, insight.title),
            metadata: insight,
            actions: [
              { id: 'view', label: 'Ver Insight', handler: 'viewInsight' }
            ]
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Erro na busca de insights:', error);
      return [];
    }
  }

  /**
   * Busca duplicatas
   */
  private async searchDuplicates(query: SearchQuery): Promise<SearchResult[]> {
    try {
      const results: SearchResult[] = [];

      // Simular busca de duplicatas
      const duplicates = await this.duplicateDetection.detectDuplicates();

      for (const duplicate of duplicates) {
        if (this.matchesSearchTerm(query.term, duplicate.id, duplicate.status)) {
          results.push({
            id: duplicate.id,
            type: 'duplicates',
            title: `Duplicata: ${duplicate.primaryPatientId} ↔ ${duplicate.duplicatePatientId}`,
            description: `Score: ${duplicate.confidenceScore} • Status: ${duplicate.status}`,
            relevanceScore: duplicate.confidenceScore,
            metadata: duplicate,
            actions: [
              { id: 'review', label: 'Revisar', handler: 'reviewDuplicate' },
              { id: 'merge', label: 'Merge', handler: 'mergeDuplicate' }
            ]
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Erro na busca de duplicatas:', error);
      return [];
    }
  }

  /**
   * Busca fotos
   */
  private async searchPhotos(query: SearchQuery): Promise<SearchResult[]> {
    try {
      const results: SearchResult[] = [];

      // Simular busca de fotos
      const mockPhotos = [
        {
          id: 'photo_001',
          patientId: 'pat_123',
          fileName: 'profile_photo.jpg',
          status: 'verified',
          verificationScore: 0.92
        }
      ];

      for (const photo of mockPhotos) {
        if (this.matchesSearchTerm(query.term, photo.fileName, photo.patientId, photo.status)) {
          results.push({
            id: photo.id,
            type: 'photos',
            title: photo.fileName,
            description: `Paciente: ${photo.patientId} • Status: ${photo.status}`,
            relevanceScore: photo.verificationScore || 0.5,
            metadata: photo,
            actions: [
              { id: 'view', label: 'Ver Foto', handler: 'viewPhoto' }
            ]
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Erro na busca de fotos:', error);
      return [];
    }
  }

  /**
   * Busca registros médicos
   */
  private async searchMedicalRecords(query: SearchQuery): Promise<SearchResult[]> {
    try {
      // Simular busca de registros médicos
      return [];
    } catch (error) {
      console.error('Erro na busca de registros médicos:', error);
      return [];
    }
  }

  /**
   * Busca consultas
   */
  private async searchAppointments(query: SearchQuery): Promise<SearchResult[]> {
    try {
      // Simular busca de consultas
      return [];
    } catch (error) {
      console.error('Erro na busca de consultas:', error);
      return [];
    }
  }

  /**
   * Busca documentos
   */
  private async searchDocuments(query: SearchQuery): Promise<SearchResult[]> {
    try {
      // Simular busca de documentos
      return [];
    } catch (error) {
      console.error('Erro na busca de documentos:', error);
      return [];
    }
  }

  /**
   * Verifica se o termo de busca corresponde aos campos
   */
  private matchesSearchTerm(searchTerm: string, ...fields: string[]): boolean {
    const term = searchTerm.toLowerCase();
    return fields.some(field => 
      field && field.toLowerCase().includes(term)
    );
  }

  /**
   * Calcula relevância do resultado
   */
  private calculateRelevance(searchTerm: string, text: string): number {
    const term = searchTerm.toLowerCase();
    const content = text.toLowerCase();
    
    if (content === term) return 1.0;
    if (content.startsWith(term)) return 0.9;
    if (content.includes(term)) return 0.7;
    
    // Calcular similaridade por palavras
    const termWords = term.split(' ');
    const contentWords = content.split(' ');
    const matches = termWords.filter(word => 
      contentWords.some(contentWord => contentWord.includes(word))
    ).length;
    
    return matches / termWords.length * 0.6;
  }

  /**
   * Gera sugestões de busca
   */
  private generateSearchSuggestions(term: string): string[] {
    const suggestions = [
      `${term} consultas`,
      `${term} exames`,
      `${term} medicamentos`,
      `histórico ${term}`,
      `timeline ${term}`
    ];

    return suggestions.slice(0, 3);
  }

  /**
   * Gera facetas para filtros
   */
  private generateSearchFacets(results: SearchResult[]): Record<string, Array<{ value: string; count: number }>> {
    const facets: Record<string, Array<{ value: string; count: number }>> = {};

    // Faceta por tipo
    const typeCount: Record<string, number> = {};
    results.forEach(result => {
      typeCount[result.type] = (typeCount[result.type] || 0) + 1;
    });

    facets.type = Object.entries(typeCount).map(([value, count]) => ({ value, count }));

    return facets;
  }

  /**
   * Busca inteligente com NLP automático
   */
  async smartSearch(
    term: string, 
    context?: SearchContext,
    options?: {
      limit?: number;
      types?: SearchType[];
      includeInactive?: boolean;
    }
  ): Promise<SearchResponse> {
    const query: SearchQuery = {
      term,
      context,
      filters: {
        types: options?.types || ['patients', 'appointments', 'timeline_events', 'insights']
      },
      options: {
        useNLP: true, // Force NLP processing
        limit: options?.limit || 20,
        sortBy: 'relevance'
      }
    };

    return await this.search(query);
  }

  /**
   * Busca conversacional - interface amigável para usuários
   */
  async conversationalSearch(
    naturalLanguageQuery: string,
    userId: string,
    userRole: string = 'user'
  ): Promise<SearchResponse> {
    const context: SearchContext = {
      userId,
      userRole,
      recentSearches: [] // Could be loaded from database
    };

    // Enable NLP for natural language processing
    const query: SearchQuery = {
      term: naturalLanguageQuery,
      context,
      options: {
        useNLP: true,
        limit: 15,
        sortBy: 'relevance',
        highlight: true
      }
    };

    const response = await this.search(query);

    // Add conversational context to response
    if (response.nlpAnalysis) {
      // Log the search for future context
      console.log(`Conversational search by ${userId}: "${naturalLanguageQuery}"`);
      console.log(`Intent: ${response.nlpAnalysis.intent.action} ${response.nlpAnalysis.intent.target}`);
      console.log(`Entities: ${response.nlpAnalysis.entities.map(e => `${e.type}:${e.value}`).join(', ')}`);
    }

    return response;
  }

  /**
   * Busca avançada com múltiplos critérios e NLP
   */
  async advancedSearch(criteria: {
    patientName?: string;
    dateRange?: { start: Date; end: Date };
    eventTypes?: string[];
    providers?: string[];
    keywords?: string[];
    useNLP?: boolean;
    context?: SearchContext;
  }): Promise<SearchResponse> {
    try {
      // Construir query baseada nos critérios
      const searchTerms = [
        criteria.patientName,
        ...(criteria.keywords || []),
        ...(criteria.eventTypes || []),
        ...(criteria.providers || [])
      ].filter(Boolean).join(' ');

      const query: SearchQuery = {
        term: searchTerms,
        context: criteria.context,
        filters: {
          dateRange: criteria.dateRange,
          types: ['patients', 'timeline_events', 'appointments'] as SearchType[]
        },
        options: {
          useNLP: criteria.useNLP !== false, // Default to true for advanced search
          limit: 50,
          sortBy: 'relevance'
        }
      };

      return await this.search(query);
    } catch (error) {
      console.error('Erro na busca avançada:', error);
      throw new Error('Falha na busca avançada');
    }
  }

  /**
   * Salva busca para uso futuro
   */
  async saveSearch(name: string, query: SearchQuery, userId: string): Promise<string> {
    try {
      const savedSearchId = `search_${Date.now()}`;
      
      // Simular salvamento da busca
      console.log(`Busca salva: ${name} por ${userId}`);
      
      return savedSearchId;
    } catch (error) {
      console.error('Erro ao salvar busca:', error);
      throw new Error('Falha ao salvar busca');
    }
  }

  /**
   * Gera estatísticas do sistema de busca
   */
  async getSearchStatistics(timeframe: string = '30days'): Promise<GlobalSearchStats> {
    try {
      const stats: GlobalSearchStats = {
        totalSearches: 1847,
        averageResultsPerSearch: 12.3,
        mostSearchedTerms: [
          { term: 'joão', count: 145 },
          { term: 'consulta', count: 98 },
          { term: 'exame', count: 87 }
        ],
        searchesByType: {
          patients: 654,
          appointments: 432,
          medical_records: 287,
          timeline_events: 234,
          insights: 156,
          lab_results: 84,
          medications: 67,
          documents: 45,
          duplicates: 23,
          photos: 12
        },
        averageExecutionTime: 145.6,
        userSearchPatterns: {
          peakHours: ['09:00-11:00', '14:00-16:00'],
          commonSequences: [
            ['paciente', 'timeline', 'consultas'],
            ['exame', 'resultado', 'histórico']
          ]
        }
      };

      return stats;
    } catch (error) {
      console.error('Erro ao gerar estatísticas de busca:', error);
      throw new Error('Falha na geração de estatísticas');
    }
  }
}

