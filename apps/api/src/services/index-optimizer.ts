/**
 * Database Index Optimizer Service
 * T080 - Database Performance Tuning
 *
 * Features:
 * - Automated index analysis and recommendations
 * - Healthcare-specific index optimization
 * - Query pattern analysis for index suggestions
 * - Index creation and monitoring utilities
 * - LGPD compliance index optimization
 */

import { HEALTHCARE_RECOMMENDED_INDEXES, IndexRecommendation } from './database-performance';

// Index analysis result
export interface IndexAnalysis {
  table: string;
  existingIndexes: DatabaseIndex[];
  recommendedIndexes: IndexRecommendation[];
  unusedIndexes: DatabaseIndex[];
  missingIndexes: IndexRecommendation[];
  optimizationScore: number; // 0-100
}

// Database index information
export interface DatabaseIndex {
  name: string;
  table: string;
  columns: string[];
  type: string;
  size: number; // bytes
  usage: {
    scans: number;
    tuples: number;
    lastUsed?: Date;
  };
  isUnique: boolean;
  isPrimary: boolean;
}

// Index creation script
export interface IndexCreationScript {
  sql: string;
  table: string;
  indexName: string;
  estimatedTime: number; // seconds
  lockLevel: 'none' | 'share' | 'exclusive';
  healthcareImpact: 'low' | 'medium' | 'high';
}

// Healthcare query patterns for index optimization
export const HEALTHCARE_INDEX_PATTERNS = {
  // Patient search patterns
  patientSearch: {
    pattern: 'SELECT * FROM patients WHERE clinic_id = ? AND full_name ILIKE ?',
    frequency: 'high',
    indexes: ['patients(clinic_id, full_name)'],
  },
  patientByCPF: {
    pattern: 'SELECT * FROM patients WHERE clinic_id = ? AND cpf = ?',
    frequency: 'high',
    indexes: ['patients(clinic_id, cpf)'],
  },
  patientFullTextSearch: {
    pattern:
      'SELECT * FROM patients WHERE full_name ILIKE ? OR phone_primary ILIKE ? OR email ILIKE ?',
    frequency: 'medium',
    indexes: [
      'patients USING gin(to_tsvector(\'portuguese\', full_name || \' \' || phone_primary || \' \' || email))',
    ],
  },

  // Appointment patterns
  professionalSchedule: {
    pattern: 'SELECT * FROM appointments WHERE professional_id = ? AND start_time BETWEEN ? AND ?',
    frequency: 'very_high',
    indexes: ['appointments(professional_id, start_time)'],
  },
  patientAppointments: {
    pattern: 'SELECT * FROM appointments WHERE patient_id = ? ORDER BY start_time DESC',
    frequency: 'high',
    indexes: ['appointments(patient_id, start_time)'],
  },
  dailySchedule: {
    pattern:
      'SELECT * FROM appointments WHERE clinic_id = ? AND start_time::date = ? ORDER BY start_time',
    frequency: 'very_high',
    indexes: ['appointments(clinic_id, start_time)'],
  },

  // LGPD compliance patterns
  consentTracking: {
    pattern:
      'SELECT * FROM consent_records WHERE patient_id = ? AND consent_type = ? AND is_active = true',
    frequency: 'medium',
    indexes: ['consent_records(patient_id, consent_type, is_active)'],
  },
  auditTrail: {
    pattern:
      'SELECT * FROM audit_logs WHERE table_name = ? AND record_id = ? ORDER BY created_at DESC',
    frequency: 'medium',
    indexes: ['audit_logs(table_name, record_id, created_at)'],
  },
};

/**
 * Index Optimizer Service
 */
export class IndexOptimizerService {
  private analysisCache = new Map<string, IndexAnalysis>();
  private cacheExpiry = 30 * 60 * 1000; // 30 minutes

  /**
   * Analyze indexes for a specific table
   */
  async analyzeTableIndexes(tableName: string): Promise<IndexAnalysis> {
    const cacheKey = `table_${tableName}`;
    const cached = this.analysisCache.get(cacheKey);

    if (cached && this.isCacheValid(cacheKey)) {
      return cached;
    }

    const analysis = await this.performTableAnalysis(tableName);
    this.analysisCache.set(cacheKey, analysis);

    return analysis;
  }

  /**
   * Perform comprehensive table index analysis
   */
  private async performTableAnalysis(
    tableName: string,
  ): Promise<IndexAnalysis> {
    const existingIndexes = await this.getExistingIndexes(tableName);
    const recommendedIndexes = this.getRecommendedIndexes(tableName);
    const unusedIndexes = this.identifyUnusedIndexes(existingIndexes);
    const missingIndexes = this.identifyMissingIndexes(
      tableName,
      existingIndexes,
      recommendedIndexes,
    );

    const optimizationScore = this.calculateOptimizationScore(
      existingIndexes,
      recommendedIndexes,
      unusedIndexes,
      missingIndexes,
    );

    return {
      table: tableName,
      existingIndexes,
      recommendedIndexes,
      unusedIndexes,
      missingIndexes,
      optimizationScore,
    };
  }

  /**
   * Get existing indexes for a table (simulated)
   */
  private async getExistingIndexes(
    tableName: string,
  ): Promise<DatabaseIndex[]> {
    // In a real implementation, this would query the database
    // Simulating existing indexes based on common patterns
    const commonIndexes: Record<string, DatabaseIndex[]> = {
      patients: [
        {
          name: 'patients_pkey',
          table: 'patients',
          columns: ['id'],
          type: 'btree',
          size: 8192,
          usage: { scans: 1000, tuples: 5000 },
          isUnique: true,
          isPrimary: true,
        },
        {
          name: 'patients_clinic_id_idx',
          table: 'patients',
          columns: ['clinic_id'],
          type: 'btree',
          size: 4096,
          usage: { scans: 500, tuples: 2500 },
          isUnique: false,
          isPrimary: false,
        },
      ],
      appointments: [
        {
          name: 'appointments_pkey',
          table: 'appointments',
          columns: ['id'],
          type: 'btree',
          size: 8192,
          usage: { scans: 800, tuples: 4000 },
          isUnique: true,
          isPrimary: true,
        },
        {
          name: 'appointments_professional_id_idx',
          table: 'appointments',
          columns: ['professional_id'],
          type: 'btree',
          size: 4096,
          usage: { scans: 1200, tuples: 6000 },
          isUnique: false,
          isPrimary: false,
        },
      ],
      professionals: [
        {
          name: 'professionals_pkey',
          table: 'professionals',
          columns: ['id'],
          type: 'btree',
          size: 4096,
          usage: { scans: 200, tuples: 1000 },
          isUnique: true,
          isPrimary: true,
        },
      ],
    };

    return commonIndexes[tableName] || [];
  }

  /**
   * Get recommended indexes for a table
   */
  private getRecommendedIndexes(tableName: string): IndexRecommendation[] {
    return HEALTHCARE_RECOMMENDED_INDEXES.filter(
      index => index.table === tableName,
    ).map(index => ({
      ...index,
      estimatedImprovement: this.calculateEstimatedImprovement(index),
      healthcareRelevant: true,
    }));
  }

  /**
   * Identify unused indexes
   */
  private identifyUnusedIndexes(
    existingIndexes: DatabaseIndex[],
  ): DatabaseIndex[] {
    return existingIndexes.filter(index => {
      // Don't consider primary keys as unused
      if (index.isPrimary) return false;

      // Consider index unused if very low usage
      return index.usage.scans < 10 || index.usage.tuples < 100;
    });
  }

  /**
   * Identify missing indexes
   */
  private identifyMissingIndexes(
    tableName: string,
    existingIndexes: DatabaseIndex[],
    recommendedIndexes: IndexRecommendation[],
  ): IndexRecommendation[] {
    return recommendedIndexes.filter(recommended => {
      // Check if a similar index already exists
      return !existingIndexes.some(existing =>
        this.indexesAreSimilar(existing.columns, recommended.columns)
      );
    });
  }

  /**
   * Check if two indexes are similar
   */
  private indexesAreSimilar(columns1: string[], columns2: string[]): boolean {
    if (columns1.length !== columns2.length) return false;
    return columns1.every((col, _index) => col === columns2[index]);
  }

  /**
   * Calculate optimization score for a table
   */
  private calculateOptimizationScore(
    existingIndexes: DatabaseIndex[],
    recommendedIndexes: IndexRecommendation[],
    unusedIndexes: DatabaseIndex[],
    missingIndexes: IndexRecommendation[],
  ): number {
    let score = 100;

    // Penalize for missing critical indexes
    const criticalMissing = missingIndexes.filter(
      idx => idx.priority === 'critical',
    ).length;
    score -= criticalMissing * 30;

    // Penalize for missing high priority indexes
    const highMissing = missingIndexes.filter(
      idx => idx.priority === 'high',
    ).length;
    score -= highMissing * 15;

    // Penalize for unused indexes (maintenance overhead)
    score -= unusedIndexes.length * 5;

    // Bonus for having recommended indexes
    const hasRecommended = recommendedIndexes.length - missingIndexes.length;
    score += hasRecommended * 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate estimated improvement for an index
   */
  private calculateEstimatedImprovement(index: any): number {
    const baseImprovement = {
      critical: 50,
      high: 35,
      medium: 20,
      low: 10,
    };

    return baseImprovement[index.priority] || 10;
  }

  /**
   * Generate index creation scripts
   */
  generateIndexCreationScripts(
    missingIndexes: IndexRecommendation[],
  ): IndexCreationScript[] {
    return missingIndexes.map(index => {
      const indexName = `idx_${index.table}_${index.columns.join('')}`;
      const columnsStr = index.columns.join(', ');

      let sql: string;
      if (index.type === 'gin') {
        // Special handling for GIN indexes (full-text search)
        sql =
          `CREATE INDEX CONCURRENTLY ${indexName} ON ${index.table} USING gin(to_tsvector('portuguese', ${columnsStr}));`;
      } else {
        sql = `CREATE INDEX CONCURRENTLY ${indexName} ON ${index.table} (${columnsStr});`;
      }

      return {
        sql,
        table: index.table,
        indexName,
        estimatedTime: this.estimateIndexCreationTime(index),
        lockLevel: 'none', // CONCURRENTLY avoids locks
        healthcareImpact: this.assessHealthcareImpact(index),
      };
    });
  }

  /**
   * Estimate index creation time
   */
  private estimateIndexCreationTime(index: IndexRecommendation): number {
    // Estimate based on table size and index complexity
    const baseTime = {
      patients: 30, // Large table
      appointments: 45, // Very large table
      professionals: 10, // Small table
      consent_records: 15, // Medium table
      audit_logs: 60, // Very large table
    };

    const tableTime = baseTime[index.table as keyof typeof baseTime] || 20;
    const complexityMultiplier = index.type === 'gin' ? 2 : 1;

    return tableTime * complexityMultiplier;
  }

  /**
   * Assess healthcare impact of index creation
   */
  private assessHealthcareImpact(
    index: IndexRecommendation,
  ): 'low' | 'medium' | 'high' {
    const criticalTables = ['patients', 'appointments', 'consent_records'];

    if (criticalTables.includes(index.table) && index.priority === 'critical') {
      return 'high';
    } else if (criticalTables.includes(index.table)) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Analyze all healthcare tables
   */
  async analyzeAllHealthcareTables(): Promise<Map<string, IndexAnalysis>> {
    const healthcareTables = [
      'patients',
      'appointments',
      'professionals',
      'clinics',
      'consent_records',
      'audit_logs',
      'medical_records',
      'services',
    ];

    const analyses = new Map<string, IndexAnalysis>();

    for (const table of healthcareTables) {
      const analysis = await this.analyzeTableIndexes(table);
      analyses.set(table, analysis);
    }

    return analyses;
  }

  /**
   * Get comprehensive optimization report
   */
  async getOptimizationReport(): Promise<{
    overallScore: number;
    tableAnalyses: Map<string, IndexAnalysis>;
    prioritizedRecommendations: IndexRecommendation[];
    creationScripts: IndexCreationScript[];
  }> {
    const tableAnalyses = await this.analyzeAllHealthcareTables();

    // Calculate overall score
    const scores = Array.from(tableAnalyses.values()).map(
      analysis => analysis.optimizationScore,
    );
    const overallScore = scores.reduce((sum, _score) => sum + score, 0) / scores.length;

    // Get all missing indexes and prioritize them
    const allMissingIndexes: IndexRecommendation[] = [];
    tableAnalyses.forEach(analysis => {
      allMissingIndexes.push(...analysis.missingIndexes);
    });

    // Sort by priority and healthcare relevance
    const prioritizedRecommendations = allMissingIndexes.sort((a, _b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];

      if (aPriority !== bPriority) return bPriority - aPriority;
      return b.estimatedImprovement - a.estimatedImprovement;
    });

    const creationScripts = this.generateIndexCreationScripts(
      prioritizedRecommendations,
    );

    return {
      overallScore,
      tableAnalyses,
      prioritizedRecommendations,
      creationScripts,
    };
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(_cacheKey: string): boolean {
    // Simple cache validation - in production, you'd want more sophisticated cache management
    return true; // For now, assume cache is always valid within the expiry period
  }

  /**
   * Clear analysis cache
   */
  clearCache(): void {
    this.analysisCache.clear();
  }
}

export default IndexOptimizerService;
