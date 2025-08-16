/**
 * 🛡️ NEONPRO DATA RETENTION & COMPLIANCE ENGINE
 *
 * Sistema de retenção de dados para compliance LGPD/ANVISA
 * Implementa políticas automáticas de limpeza e anonimização
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @compliance LGPD, ANVISA, CFM
 */

import { createClient } from '@/lib/supabase/client';

// ==================== TYPES & INTERFACES ====================

export type RetentionPolicy = {
  table: string;
  retention_period_days: number;
  anonymize_after_days?: number;
  delete_after_days: number;
  sensitive_fields: string[];
  compliance_category:
    | 'patient_data'
    | 'financial_data'
    | 'operational_data'
    | 'audit_logs';
};

export type ComplianceRecord = {
  id: string;
  table_name: string;
  record_id: string;
  action: 'anonymized' | 'deleted' | 'retained';
  timestamp: string;
  reason: string;
  compliance_basis: string;
  operator_id?: string;
};

export type AnonymizationRule = {
  field_name: string;
  anonymization_type: 'hash' | 'mask' | 'remove' | 'generalize';
  mask_pattern?: string;
  generalization_level?: 'city' | 'state' | 'country' | 'age_range';
};

// ==================== RETENTION POLICIES CONFIGURATION ====================

/**
 * Políticas de retenção por categoria de dados conforme LGPD/ANVISA
 */
export const RETENTION_POLICIES: RetentionPolicy[] = [
  // Dados de Pacientes (LGPD Sensíveis)
  {
    table: 'patients',
    retention_period_days: 2555, // 7 anos (CFM)
    anonymize_after_days: 1825, // 5 anos
    delete_after_days: 2555,
    sensitive_fields: ['cpf', 'phone', 'email', 'address'],
    compliance_category: 'patient_data',
  },
  {
    table: 'consultations',
    retention_period_days: 2555, // 7 anos (CFM)
    anonymize_after_days: 1825,
    delete_after_days: 2555,
    sensitive_fields: ['notes', 'diagnosis', 'treatment_plan'],
    compliance_category: 'patient_data',
  },

  // Dados Financeiros (ANVISA/LGPD)
  {
    table: 'transactions',
    retention_period_days: 1825, // 5 anos (fiscal)
    anonymize_after_days: 1095, // 3 anos
    delete_after_days: 1825,
    sensitive_fields: ['payment_method_details', 'bank_data'],
    compliance_category: 'financial_data',
  },
  {
    table: 'invoices',
    retention_period_days: 1825, // 5 anos
    anonymize_after_days: 1095,
    delete_after_days: 1825,
    sensitive_fields: ['customer_details', 'payment_data'],
    compliance_category: 'financial_data',
  },

  // Dados Operacionais
  {
    table: 'appointments',
    retention_period_days: 1095, // 3 anos
    anonymize_after_days: 730, // 2 anos
    delete_after_days: 1095,
    sensitive_fields: ['notes', 'special_requests'],
    compliance_category: 'operational_data',
  },

  // Logs de Auditoria (nunca deletar, apenas anonimizar)
  {
    table: 'audit_logs',
    retention_period_days: 3650, // 10 anos
    anonymize_after_days: 1825, // 5 anos
    delete_after_days: 3650,
    sensitive_fields: ['user_details', 'ip_address', 'device_info'],
    compliance_category: 'audit_logs',
  },
];

// ==================== ANONYMIZATION RULES ====================

export const ANONYMIZATION_RULES: Record<string, AnonymizationRule[]> = {
  patients: [
    {
      field_name: 'cpf',
      anonymization_type: 'mask',
      mask_pattern: '***.***.***-**',
    },
    {
      field_name: 'phone',
      anonymization_type: 'mask',
      mask_pattern: '(**) ****-****',
    },
    {
      field_name: 'email',
      anonymization_type: 'mask',
      mask_pattern: '****@****.***',
    },
    {
      field_name: 'address',
      anonymization_type: 'generalize',
      generalization_level: 'city',
    },
  ],
  consultations: [
    { field_name: 'notes', anonymization_type: 'hash' },
    { field_name: 'diagnosis', anonymization_type: 'generalize' },
    { field_name: 'treatment_plan', anonymization_type: 'hash' },
  ],
  transactions: [
    { field_name: 'payment_method_details', anonymization_type: 'hash' },
    { field_name: 'bank_data', anonymization_type: 'remove' },
  ],
  audit_logs: [
    {
      field_name: 'ip_address',
      anonymization_type: 'mask',
      mask_pattern: '***.***.***.*',
    },
    { field_name: 'device_info', anonymization_type: 'hash' },
  ],
};

// ==================== DATA RETENTION ENGINE ====================

export class DataRetentionEngine {
  private readonly supabase: ReturnType<typeof createClient>;

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Executa políticas de retenção para todas as tabelas
   */
  async executeRetentionPolicies(): Promise<ComplianceRecord[]> {
    const complianceRecords: ComplianceRecord[] = [];

    try {
      for (const policy of RETENTION_POLICIES) {
        // Anonimizar dados que passaram do período de anonimização
        if (policy.anonymize_after_days) {
          const anonymizedRecords = await this.anonymizeExpiredData(policy);
          complianceRecords.push(...anonymizedRecords);
        }

        // Deletar dados que passaram do período de retenção
        const deletedRecords = await this.deleteExpiredData(policy);
        complianceRecords.push(...deletedRecords);
      }

      // Registrar compliance records no audit log
      await this.logComplianceActions(complianceRecords);

      return complianceRecords;
    } catch (error) {
      throw new Error(`Data retention execution failed: ${error}`);
    }
  }

  /**
   * Anonimiza dados que passaram do período de anonimização
   */
  private async anonymizeExpiredData(
    policy: RetentionPolicy,
  ): Promise<ComplianceRecord[]> {
    if (!policy.anonymize_after_days) {
      return [];
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.anonymize_after_days);
    // Buscar registros que precisam ser anonimizados
    const { data: records, error } = await this.supabase
      .from(policy.table as any)
      .select('*')
      .lt('created_at', cutoffDate.toISOString())
      .is('anonymized_at', null);

    if (error) {
      throw error;
    }
    if (!records || records.length === 0) {
      return [];
    }

    const complianceRecords: ComplianceRecord[] = [];
    const anonymizationRules = ANONYMIZATION_RULES[policy.table] || [];

    for (const record of records) {
      const anonymizedData = this.applyAnonymization(
        record,
        anonymizationRules,
      );

      // Atualizar registro com dados anonimizados
      const { error: updateError } = await this.supabase
        .from(policy.table as any)
        .update({
          ...anonymizedData,
          anonymized_at: new Date().toISOString(),
          anonymization_reason: `Automatic anonymization after ${policy.anonymize_after_days} days`,
        })
        .eq('id', record.id);

      if (updateError) {
        continue;
      }

      complianceRecords.push({
        id: crypto.randomUUID(),
        table_name: policy.table,
        record_id: record.id,
        action: 'anonymized',
        timestamp: new Date().toISOString(),
        reason: `Automatic anonymization after ${policy.anonymize_after_days} days`,
        compliance_basis: 'LGPD Art. 16 - Data minimization principle',
      });
    }

    return complianceRecords;
  }

  /**
   * Deleta dados que passaram do período de retenção
   */
  private async deleteExpiredData(
    policy: RetentionPolicy,
  ): Promise<ComplianceRecord[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.delete_after_days);
    // Para audit logs, nunca deletar completamente
    if (policy.compliance_category === 'audit_logs') {
      return [];
    }

    // Buscar registros que precisam ser deletados
    const { data: records, error: selectError } = await this.supabase
      .from(policy.table as any)
      .select('id')
      .lt('created_at', cutoffDate.toISOString());

    if (selectError) {
      throw selectError;
    }
    if (!records || records.length === 0) {
      return [];
    }

    // Deletar registros expirados
    const { error: deleteError } = await this.supabase
      .from(policy.table as any)
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (deleteError) {
      throw deleteError;
    }

    const complianceRecords: ComplianceRecord[] = records.map((record) => ({
      id: crypto.randomUUID(),
      table_name: policy.table,
      record_id: record.id,
      action: 'deleted',
      timestamp: new Date().toISOString(),
      reason: `Automatic deletion after ${policy.delete_after_days} days retention period`,
      compliance_basis: 'LGPD Art. 16 - Storage limitation principle',
    }));

    return complianceRecords;
  }

  /**
   * Aplica regras de anonimização a um registro
   */
  private applyAnonymization(record: any, rules: AnonymizationRule[]): any {
    const anonymizedRecord = { ...record };

    for (const rule of rules) {
      if (!anonymizedRecord[rule.field_name]) {
        continue;
      }

      switch (rule.anonymization_type) {
        case 'mask':
          anonymizedRecord[rule.field_name] =
            rule.mask_pattern || '***MASKED***';
          break;

        case 'hash':
          anonymizedRecord[rule.field_name] = this.hashValue(
            anonymizedRecord[rule.field_name],
          );
          break;

        case 'remove':
          delete anonymizedRecord[rule.field_name];
          break;

        case 'generalize':
          anonymizedRecord[rule.field_name] = this.generalizeValue(
            anonymizedRecord[rule.field_name],
            rule.generalization_level,
          );
          break;
      }
    }

    return anonymizedRecord;
  }

  /**
   * Hash de valor para anonimização
   */
  private hashValue(value: string): string {
    // Usar uma função de hash simples para demonstração
    // Em produção, usar biblioteca criptográfica apropriada
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash &= hash; // Convert to 32-bit integer
    }
    return `HASH_${Math.abs(hash).toString(36).toUpperCase()}`;
  }

  /**
   * Generaliza valor conforme nível especificado
   */
  private generalizeValue(_value: string, level?: string): string {
    switch (level) {
      case 'city':
        return 'CITY_GENERALIZED';
      case 'state':
        return 'STATE_GENERALIZED';
      case 'country':
        return 'BRAZIL';
      case 'age_range':
        return 'AGE_RANGE_GENERALIZED';
      default:
        return 'GENERALIZED';
    }
  }

  /**
   * Registra ações de compliance no audit log
   */
  private async logComplianceActions(
    complianceRecords: ComplianceRecord[],
  ): Promise<void> {
    if (complianceRecords.length === 0) {
      return;
    }

    try {
      const { error } = await this.supabase
        .from('compliance_audit_log')
        .insert(complianceRecords);

      if (error) {
        // Não throw error aqui para não interromper o processo de retenção
      }
    } catch (_error) {}
  }

  /**
   * Verifica status de compliance para uma tabela específica
   */
  async checkComplianceStatus(tableName: string): Promise<{
    table: string;
    total_records: number;
    records_need_anonymization: number;
    records_need_deletion: number;
    compliance_percentage: number;
  }> {
    const policy = RETENTION_POLICIES.find((p) => p.table === tableName);
    if (!policy) {
      throw new Error(
        `Política de retenção não encontrada para tabela: ${tableName}`,
      );
    }
    // Contar total de registros
    const { count: totalRecords } = await this.supabase
      .from(policy.table as any)
      .select('*', { count: 'exact', head: true });

    // Contar registros que precisam ser anonimizados
    let recordsNeedAnonymization = 0;
    if (policy.anonymize_after_days) {
      const anonymizationCutoff = new Date();
      anonymizationCutoff.setDate(
        anonymizationCutoff.getDate() - policy.anonymize_after_days,
      );

      const { count } = await this.supabase
        .from(policy.table as any)
        .select('*', { count: 'exact', head: true })
        .lt('created_at', anonymizationCutoff.toISOString())
        .is('anonymized_at', null);

      recordsNeedAnonymization = count || 0;
    }

    // Contar registros que precisam ser deletados
    const deletionCutoff = new Date();
    deletionCutoff.setDate(deletionCutoff.getDate() - policy.delete_after_days);

    const { count: recordsNeedDeletion } = await this.supabase
      .from(policy.table as any)
      .select('*', { count: 'exact', head: true })
      .lt('created_at', deletionCutoff.toISOString());

    const compliancePercentage = totalRecords
      ? Math.round(
          (1 -
            (recordsNeedAnonymization + (recordsNeedDeletion || 0)) /
              totalRecords) *
            100,
        )
      : 100;

    return {
      table: tableName,
      total_records: totalRecords || 0,
      records_need_anonymization: recordsNeedAnonymization,
      records_need_deletion: recordsNeedDeletion || 0,
      compliance_percentage: compliancePercentage,
    };
  }
}

// ==================== AUTOMATED CLEANUP JOB ====================

/**
 * Job automático para execução das políticas de retenção
 * Pode ser chamado via cron job ou scheduler
 */
export async function executeAutomatedCleanup(): Promise<{
  success: boolean;
  processed_records: number;
  compliance_actions: ComplianceRecord[];
  execution_time: string;
  errors?: string[];
}> {
  const startTime = new Date();
  const errors: string[] = [];

  try {
    const retentionEngine = new DataRetentionEngine();
    const complianceRecords = await retentionEngine.executeRetentionPolicies();

    const endTime = new Date();
    const executionTime = `${endTime.getTime() - startTime.getTime()}ms`;

    return {
      success: true,
      processed_records: complianceRecords.length,
      compliance_actions: complianceRecords,
      execution_time: executionTime,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    errors.push(errorMessage);

    return {
      success: false,
      processed_records: 0,
      compliance_actions: [],
      execution_time: `${Date.now() - startTime.getTime()}ms`,
      errors,
    };
  }
}

// ==================== EXPORTS ====================

export { DataRetentionEngine };
export default DataRetentionEngine;
