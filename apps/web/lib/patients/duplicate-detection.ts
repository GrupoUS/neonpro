export type DuplicateMatch = {
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
};

export type FieldComparison = {
  field: string;
  primaryValue: any;
  duplicateValue: any;
  similarity: number;
  action: 'keep_primary' | 'keep_duplicate' | 'merge' | 'manual_review';
};

export type MergeStrategy = {
  patientData: 'keep_primary' | 'keep_duplicate' | 'merge_intelligent';
  medicalHistory: 'combine' | 'keep_primary' | 'keep_duplicate';
  appointments: 'combine' | 'transfer_to_primary';
  documents: 'combine' | 'keep_primary' | 'keep_duplicate';
  financialData: 'combine' | 'keep_primary' | 'manual_review';
};

export type MergeResult = {
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
};

export class DuplicateDetectionSystem {
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
          createdAt: new Date(),
        },
        {
          id: 'dup_002',
          primaryPatientId: 'pat_789',
          duplicatePatientId: 'pat_321',
          confidenceScore: 0.78,
          matchingFields: ['name', 'email'],
          potentialIssues: ['different_phone', 'different_birthDate'],
          status: 'pending',
          createdAt: new Date(),
        },
      ];

      if (patientId) {
        return mockDuplicates.filter(
          (dup) =>
            dup.primaryPatientId === patientId ||
            dup.duplicatePatientId === patientId,
        );
      }

      return mockDuplicates;
    } catch (_error) {
      throw new Error('Falha na detecção de duplicatas');
    }
  }

  /**
   * Compara dois pacientes em detalhes
   */
  async comparePatients(
    _patientId1: string,
    _patientId2: string,
  ): Promise<FieldComparison[]> {
    try {
      // Simular comparação detalhada entre pacientes
      const comparisons: FieldComparison[] = [
        {
          field: 'name',
          primaryValue: 'João Silva Santos',
          duplicateValue: 'João S. Santos',
          similarity: 0.95,
          action: 'keep_primary',
        },
        {
          field: 'birthDate',
          primaryValue: '1985-03-15',
          duplicateValue: '1985-03-15',
          similarity: 1.0,
          action: 'keep_primary',
        },
        {
          field: 'phone',
          primaryValue: '(11) 99999-9999',
          duplicateValue: '11999999999',
          similarity: 0.9,
          action: 'keep_primary',
        },
        {
          field: 'email',
          primaryValue: 'joao.silva@email.com',
          duplicateValue: 'j.santos@email.com',
          similarity: 0.65,
          action: 'manual_review',
        },
        {
          field: 'address',
          primaryValue: 'Rua das Flores, 123',
          duplicateValue: 'Rua das Flores, 123 - Ap 45',
          similarity: 0.85,
          action: 'merge',
        },
        {
          field: 'emergencyContact',
          primaryValue: 'Maria Silva - (11) 88888-8888',
          duplicateValue: '',
          similarity: 0.0,
          action: 'keep_primary',
        },
      ];

      return comparisons;
    } catch (_error) {
      throw new Error('Falha na comparação de pacientes');
    }
  }

  /**
   * Confirma uma duplicata identificada
   */
  async confirmDuplicate(
    _duplicateId: string,
    _reviewedBy: string,
  ): Promise<boolean> {
    try {
      return true;
    } catch (_error) {
      throw new Error('Falha ao confirmar duplicata');
    }
  }

  /**
   * Rejeita uma possível duplicata
   */
  async rejectDuplicate(
    _duplicateId: string,
    _reviewedBy: string,
    _reason: string,
  ): Promise<boolean> {
    try {
      return true;
    } catch (_error) {
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
    _performedBy: string,
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
          financialRecords: 6,
        },
      };

      // Verificar se há conflitos que precisam de revisão manual
      if (strategy.financialData === 'manual_review') {
        mergeResult.issues = ['Dados financiais requerem revisão manual'];
      }

      return mergeResult;
    } catch (_error) {
      throw new Error('Falha no merge de pacientes');
    }
  }

  /**
   * Gera preview do merge antes da execução
   */
  async previewMerge(
    primaryPatientId: string,
    duplicatePatientId: string,
    strategy: MergeStrategy,
  ): Promise<any> {
    try {
      const comparisons = await this.comparePatients(
        primaryPatientId,
        duplicatePatientId,
      );

      const preview = {
        strategy,
        fieldResolutions: comparisons,
        estimatedDataTransfer: {
          appointments: 12,
          documents: 8,
          medicalRecords: 15,
          financialRecords: 6,
        },
        potentialConflicts: [
          'Diferentes informações de contato de emergência',
          'Histórico de pagamentos em ambos os registros',
        ],
        recommendations: [
          'Revisar contatos de emergência antes do merge',
          'Verificar dados financiais manualmente',
        ],
      };

      return preview;
    } catch (_error) {
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

      return potentialDuplicates.filter(
        (dup) => dup.confidenceScore >= threshold,
      );
    } catch (_error) {
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
          pendingReview: allDuplicates.filter((d) => d.status === 'pending')
            .length,
          confirmed: allDuplicates.filter((d) => d.status === 'confirmed')
            .length,
          merged: allDuplicates.filter((d) => d.status === 'merged').length,
          rejected: allDuplicates.filter((d) => d.status === 'rejected').length,
        },
        confidenceDistribution: {
          high: allDuplicates.filter((d) => d.confidenceScore >= 0.9).length,
          medium: allDuplicates.filter(
            (d) => d.confidenceScore >= 0.7 && d.confidenceScore < 0.9,
          ).length,
          low: allDuplicates.filter((d) => d.confidenceScore < 0.7).length,
        },
        duplicates: allDuplicates,
        recommendations: [
          'Revisar duplicatas com score > 0.9 primeiro',
          'Configurar detecção automática para scores > 0.95',
          'Implementar validação em tempo real para novos cadastros',
        ],
      };

      return report;
    } catch (_error) {
      throw new Error('Falha na geração do relatório');
    }
  }
}

export const duplicateDetectionSystem = new DuplicateDetectionSystem();
