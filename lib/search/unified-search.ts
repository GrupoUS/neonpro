// lib/search/unified-search.ts
import { createClient } from "@/app/utils/supabase/server";
import { profileManager } from "@/lib/patients/profile-manager";
import { medicalTimelineManager } from "@/lib/medical/timeline-manager";
import { duplicateDetectionSystem } from "@/lib/patients/duplicate-detection";
import { photoRecognitionSystem } from "@/lib/patients/photo-recognition";
import { aiInsightsEngine } from "@/lib/ai/insights-engine";

export interface SearchQuery {
  term: string;
  filters?: {
    types?: SearchType[];
    dateRange?: {
      start: Date;
      end: Date;
    };
    patientId?: string;
    status?: string[];
    priority?: string[];
  };
  options?: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    fuzzy?: boolean;
    highlight?: boolean;
  };
}

export type SearchType = 
  | 'patients' 
  | 'appointments' 
  | 'medical_records' 
  | 'lab_results' 
  | 'medications' 
  | 'documents' 
  | 'insights' 
  | 'timeline_events'
  | 'duplicates'
  | 'photos';

export interface SearchResult {
  id: string;
  type: SearchType;
  title: string;
  description: string;
  relevanceScore: number;
  metadata: Record<string, any>;
  highlights?: string[];
  url?: string;
  actions?: SearchAction[];
}

export interface SearchAction {
  id: string;
  label: string;
  icon?: string;
  url?: string;
  handler?: string;
}

export interface SearchResponse {
  query: SearchQuery;
  results: SearchResult[];
  totalCount: number;
  executionTime: number;
  suggestions?: string[];
  facets?: Record<string, Array<{ value: string; count: number }>>;
}

export interface GlobalSearchStats {
  totalSearches: number;
  averageResultsPerSearch: number;
  mostSearchedTerms: Array<{ term: string; count: number }>;
  searchesByType: Record<SearchType, number>;
  averageExecutionTime: number;
  userSearchPatterns: any;
}

export class UnifiedSearchSystem {
  private supabase = createClient();

  /**
   * Executa busca unificada em todo o sistema
   */
  async search(query: SearchQuery): Promise<SearchResponse> {
    const startTime = performance.now();
    
    try {
      let allResults: SearchResult[] = [];
      const searchPromises: Promise<SearchResult[]>[] = [];

      // Determinar tipos de busca baseado nos filtros
      const searchTypes = query.filters?.types || [
        'patients', 'appointments', 'medical_records', 'insights', 'timeline_events'
      ];

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

      // Ordenar por relevância
      allResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

      // Aplicar paginação
      const offset = query.options?.offset || 0;
      const limit = query.options?.limit || 50;
      const paginatedResults = allResults.slice(offset, offset + limit);

      const executionTime = performance.now() - startTime;

      return {
        query,
        results: paginatedResults,
        totalCount: allResults.length,
        executionTime,
        suggestions: this.generateSearchSuggestions(query.term),
        facets: this.generateSearchFacets(allResults)
      };
    } catch (error) {
      console.error('Erro na busca unificada:', error);
      throw new Error('Falha na execução da busca');
    }
  }

  /**
   * Busca pacientes
   */
  private async searchPatients(query: SearchQuery): Promise<SearchResult[]> {
    try {
      const results: SearchResult[] = [];
      
      // Simular busca de pacientes
      const mockPatients = [
        {
          id: 'pat_123',
          name: 'João Silva Santos',
          email: 'joao.silva@email.com',
          phone: '(11) 99999-9999',
          birthDate: '1985-03-15'
        },
        {
          id: 'pat_456',
          name: 'Maria Santos Silva',
          email: 'maria.santos@email.com',
          phone: '(11) 88888-8888',
          birthDate: '1990-07-22'
        }
      ];

      for (const patient of mockPatients) {
        if (this.matchesSearchTerm(query.term, patient.name, patient.email, patient.phone)) {
          results.push({
            id: patient.id,
            type: 'patients',
            title: patient.name,
            description: `${patient.email} • ${patient.phone}`,
            relevanceScore: this.calculateRelevance(query.term, patient.name),
            metadata: patient,
            url: `/patients/${patient.id}`,
            actions: [
              { id: 'view', label: 'Ver Perfil', url: `/patients/${patient.id}` },
              { id: 'edit', label: 'Editar', url: `/patients/${patient.id}/edit` },
              { id: 'timeline', label: 'Timeline', url: `/patients/${patient.id}/timeline` }
            ]
          });
        }
      }

      return results;
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
      const duplicates = await duplicateDetectionSystem.detectDuplicates();

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
   * Busca avançada com múltiplos critérios
   */
  async advancedSearch(criteria: {
    patientName?: string;
    dateRange?: { start: Date; end: Date };
    eventTypes?: string[];
    providers?: string[];
    keywords?: string[];
  }): Promise<SearchResponse> {
    try {
      // Construir query baseada nos critérios
      const query: SearchQuery = {
        term: criteria.keywords?.join(' ') || '',
        filters: {
          dateRange: criteria.dateRange,
          types: ['patients', 'timeline_events', 'appointments'] as SearchType[]
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

export const unifiedSearchSystem = new UnifiedSearchSystem();
