// lib/patients/duplicate-detection.ts
import { createClient } from "@/app/utils/supabase/server";

export interface DuplicateMatch {
  id: string;
  primaryPatientId: string;
  duplicatePatientId: string;
  confidenceScore: number;
  matchingFields: string[];
  potentialIssues: string[];
  status: 'pending' | 'confirmed' | 'rejected' | 'merged';
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

export interface FieldComparison {
  field: string;
  primaryValue: any;
  duplicateValue: any;
  similarity: number;
  action: 'keep_primary' | 'keep_duplicate' | 'merge' | 'manual_review';
}

export interface MergeStrategy {
  patientData: 'keep_primary' | 'keep_duplicate' | 'merge_intelligent';
  medicalHistory: 'combine' | 'keep_primary' | 'keep_duplicate';
  appointments: 'combine' | 'transfer_to_primary';
  documents: 'combine' | 'keep_primary' | 'keep_duplicate';
  financialData: 'combine' | 'keep_primary' | 'manual_review';
}

export interface MergeResult {
  success: boolean;
  mergedPatientId: string;
  archivedPatientId: string;
  conflictsResolved: number;
  dataTransferred: {
    appointments: number;
    documents: number;
    medicalRecords: number;
    financialRecords: number;
  };
  issues?: string[];
}

export class DuplicateDetectionSystem {
  private supabase = createClient();

  /**
   * Detecta possíveis duplicatas usando múltiplos algoritmos
   */
  async detectDuplicates(patientId?: string): Promise<DuplicateMatch[]> {
    try {
      // Simular detecção de duplicatas usando algoritmos avançados
      const mockDuplicates: DuplicateMatch[] = [
        {
          id: 'dup_001',
          primaryPatientId: 'pat_123',
          duplicatePatientId: 'pat_456',
          confidenceScore: 0.92,
          matchingFields: ['name', 'birthDate', 'phone'],
          potentialIssues: ['different_email', 'different_address'],
          status: 'pending',
          createdAt: new Date()
        },
        {
          id: 'dup_002',
          primaryPatientId: 'pat_789',
          duplicatePatientId: 'pat_321',
          confidenceScore: 0.78,
          matchingFields: ['name', 'email'],
          potentialIssues: ['different_phone', 'different_birthDate'],
          status: 'pending',
          createdAt: new Date()
        }
      ];

      if (patientId) {
        return mockDuplicates.filter(dup => 
          dup.primaryPatientId === patientId || dup.duplicatePatientId === patientId
        );
      }

      return mockDuplicates;
    } catch (error) {
      console.error('Erro na detecção de duplicatas:', error);
      throw new Error('Falha na detecção de duplicatas');
    }
  }

  /**
   * Compara dois pacientes em detalhes
   */
  async comparePatients(patientId1: string, patientId2: string): Promise<FieldComparison[]> {
    try {
      // Simular comparação detalhada entre pacientes
      const comparisons: FieldComparison[] = [
        {
          field: 'name',
          primaryValue: 'João Silva Santos',
          duplicateValue: 'João S. Santos',
          similarity: 0.95,
          action: 'keep_primary'
        },
        {
          field: 'birthDate',
          primaryValue: '1985-03-15',
          duplicateValue: '1985-03-15',
          similarity: 1.0,
          action: 'keep_primary'
        },
        {
          field: 'phone',
          primaryValue: '(11) 99999-9999',
          duplicateValue: '11999999999',
          similarity: 0.90,
          action: 'keep_primary'
        },
        {
          field: 'email',
          primaryValue: 'joao.silva@email.com',
          duplicateValue: 'j.santos@email.com',
          similarity: 0.65,
          action: 'manual_review'
        },
        {
          field: 'address',
          primaryValue: 'Rua das Flores, 123',
          duplicateValue: 'Rua das Flores, 123 - Ap 45',
          similarity: 0.85,
          action: 'merge'
        },
        {
          field: 'emergencyContact',
          primaryValue: 'Maria Silva - (11) 88888-8888',
          duplicateValue: '',
          similarity: 0.0,
          action: 'keep_primary'
        }
      ];

      return comparisons;
    } catch (error) {
      console.error('Erro na comparação de pacientes:', error);
      throw new Error('Falha na comparação de pacientes');
    }
  }

  /**
   * Calcula score de similaridade entre dois registros
   */
  private calculateSimilarityScore(patient1: any, patient2: any): number {
    const weights = {
      name: 0.3,
      birthDate: 0.25,
      phone: 0.2,
      email: 0.15,
      ssn: 0.1
    };

    let totalScore = 0;
    let totalWeight = 0;

    for (const [field, weight] of Object.entries(weights)) {
      if (patient1[field] && patient2[field]) {
        const similarity = this.calculateFieldSimilarity(patient1[field], patient2[field], field);
        totalScore += similarity * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Calcula similaridade entre campos específicos
   */
  private calculateFieldSimilarity(value1: string, value2: string, fieldType: string): number {
    if (value1 === value2) return 1.0;

    // Normalizar valores
    const norm1 = value1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const norm2 = value2.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (norm1 === norm2) return 0.95;

    // Algoritmo de distância de Levenshtein simplificado
    const maxLength = Math.max(norm1.length, norm2.length);
    if (maxLength === 0) return 1.0;

    let distance = 0;
    for (let i = 0; i < maxLength; i++) {
      if (norm1[i] !== norm2[i]) distance++;
    }

    const similarity = 1 - (distance / maxLength);

    // Ajustes específicos por tipo de campo
    switch (fieldType) {
      case 'name':
        // Nomes têm maior tolerância para abreviações
        return similarity > 0.8 ? similarity + 0.1 : similarity;
      case 'phone':
        // Telefones têm formatação variável
        return similarity > 0.7 ? similarity + 0.15 : similarity;
      case 'birthDate':
        // Datas devem ser exatas ou muito próximas
        return similarity > 0.95 ? similarity : similarity * 0.5;
      default:
        return similarity;
    }
  }

  /**
   * Confirma uma duplicata identificada
   */
  async confirmDuplicate(duplicateId: string, reviewedBy: string): Promise<boolean> {
    try {
      // Simular confirmação de duplicata
      console.log(`Duplicata ${duplicateId} confirmada por ${reviewedBy}`);
      return true;
    } catch (error) {
      console.error('Erro ao confirmar duplicata:', error);
      throw new Error('Falha ao confirmar duplicata');
    }
  }

  /**
   * Rejeita uma possível duplicata
   */
  async rejectDuplicate(duplicateId: string, reviewedBy: string, reason: string): Promise<boolean> {
    try {
      // Simular rejeição de duplicata
      console.log(`Duplicata ${duplicateId} rejeitada por ${reviewedBy}: ${reason}`);
      return true;
    } catch (error) {
      console.error('Erro ao rejeitar duplicata:', error);
      throw new Error('Falha ao rejeitar duplicata');
    }
  }

  /**
   * Executa merge de pacientes duplicados
   */
  async mergePatients(
    primaryPatientId: string, 
    duplicatePatientId: string, 
    strategy: MergeStrategy,
    performedBy: string
  ): Promise<MergeResult> {
    try {
      // Simular processo de merge
      const mergeResult: MergeResult = {
        success: true,
        mergedPatientId: primaryPatientId,
        archivedPatientId: duplicatePatientId,
        conflictsResolved: 3,
        dataTransferred: {
          appointments: 12,
          documents: 8,
          medicalRecords: 15,
          financialRecords: 6
        }
      };

      // Verificar se há conflitos que precisam de revisão manual
      if (strategy.financialData === 'manual_review') {
        mergeResult.issues = ['Dados financiais requerem revisão manual'];
      }

      console.log(`Merge executado por ${performedBy}: ${duplicatePatientId} -> ${primaryPatientId}`);
      
      return mergeResult;
    } catch (error) {
      console.error('Erro no merge de pacientes:', error);
      throw new Error('Falha no merge de pacientes');
    }
  }

  /**
   * Gera preview do merge antes da execução
   */
  async previewMerge(
    primaryPatientId: string, 
    duplicatePatientId: string, 
    strategy: MergeStrategy
  ): Promise<any> {
    try {
      const comparisons = await this.comparePatients(primaryPatientId, duplicatePatientId);
      
      const preview = {
        strategy,
        fieldResolutions: comparisons,
        estimatedDataTransfer: {
          appointments: 12,
          documents: 8,
          medicalRecords: 15,
          financialRecords: 6
        },
        potentialConflicts: [
          'Diferentes informações de contato de emergência',
          'Histórico de pagamentos em ambos os registros'
        ],
        recommendations: [
          'Revisar contatos de emergência antes do merge',
          'Verificar dados financiais manualmente'
        ]
      };

      return preview;
    } catch (error) {
      console.error('Erro no preview de merge:', error);
      throw new Error('Falha no preview de merge');
    }
  }

  /**
   * Busca duplicatas usando critérios específicos
   */
  async searchPotentialDuplicates(searchCriteria: {
    name?: string;
    birthDate?: string;
    phone?: string;
    email?: string;
    threshold?: number;
  }): Promise<DuplicateMatch[]> {
    try {
      const threshold = searchCriteria.threshold || 0.7;
      
      // Simular busca de duplicatas baseada em critérios
      const potentialDuplicates = await this.detectDuplicates();
      
      return potentialDuplicates.filter(dup => dup.confidenceScore >= threshold);
    } catch (error) {
      console.error('Erro na busca de duplicatas:', error);
      throw new Error('Falha na busca de duplicatas');
    }
  }

  /**
   * Gera relatório de duplicatas do sistema
   */
  async generateDuplicateReport(): Promise<any> {
    try {
      const allDuplicates = await this.detectDuplicates();
      
      const report = {
        generatedAt: new Date(),
        summary: {
          totalDuplicates: allDuplicates.length,
          pendingReview: allDuplicates.filter(d => d.status === 'pending').length,
          confirmed: allDuplicates.filter(d => d.status === 'confirmed').length,
          merged: allDuplicates.filter(d => d.status === 'merged').length,
          rejected: allDuplicates.filter(d => d.status === 'rejected').length
        },
        confidenceDistribution: {
          high: allDuplicates.filter(d => d.confidenceScore >= 0.9).length,
          medium: allDuplicates.filter(d => d.confidenceScore >= 0.7 && d.confidenceScore < 0.9).length,
          low: allDuplicates.filter(d => d.confidenceScore < 0.7).length
        },
        duplicates: allDuplicates,
        recommendations: [
          'Revisar duplicatas com score > 0.9 primeiro',
          'Configurar detecção automática para scores > 0.95',
          'Implementar validação em tempo real para novos cadastros'
        ]
      };

      return report;
    } catch (error) {
      console.error('Erro ao gerar relatório de duplicatas:', error);
      throw new Error('Falha na geração do relatório');
    }
  }
}

export const duplicateDetectionSystem = new DuplicateDetectionSystem();
