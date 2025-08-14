// 🔒 LGPD Consent Manager - Granular Consent Collection & Management
// NeonPro - Sistema de Automação de Compliance LGPD
// Quality Standard: ≥9.5/10 (BMad Enhanced)

import { createClient } from '@/app/utils/supabase/server';
import { 
  LGPDConsent, 
  ConsentRequest, 
  ProcessingPurpose, 
  DataCategory, 
  ConsentStatus,
  ConsentValidationError,
  LGPDEvent
} from './types';

/**
 * Consent Management System for LGPD Compliance
 * Handles granular consent collection, validation, and lifecycle management
 */
export class ConsentManager {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  // ==================== CONSENT COLLECTION ====================

  /**
   * Collect comprehensive patient consent with granular permissions
   */
  async collectConsent(request: ConsentRequest): Promise<LGPDConsent> {
    try {
      // Validate request structure
      this.validateConsentRequest(request);

      // Check for existing active consent
      const existingConsent = await this.getActiveConsent(request.patientId, request.purposes[0]);
      if (existingConsent) {
        throw new ConsentValidationError('Active consent already exists for this purpose');
      }

      // Create granular permissions matrix
      const granularPermissions = this.createPermissionsMatrix(request.purposes, request.dataCategories);

      // Generate consent record
      const consent: LGPDConsent = {
        id: this.generateConsentId(),
        patientId: request.patientId,
        consentType: request.purposes[0], // Primary purpose
        status: 'granted',
        grantedDate: new Date(),
        granularPermissions,
        version: 1,
        metadata: {
          method: 'explicit',
          context: request.context,
          ipAddress: request.metadata?.ipAddress,
          userAgent: request.metadata?.userAgent
        }
      };

      // Set expiration date (1 year default for medical consent)
      consent.expirationDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      // Store in database
      await this.storeConsent(consent);

      // Log consent collection activity
      await this.logConsentActivity('consent_granted', consent);

      // Send confirmation notification
      await this.sendConsentConfirmation(consent);

      return consent;
    } catch (error) {
      throw new ConsentValidationError('Failed to collect consent', error);
    }
  }

  /**
   * Create dynamic consent forms based on processing needs
   */
  async createDynamicConsentForm(
    purposes: ProcessingPurpose[], 
    dataCategories: DataCategory[],
    context: string
  ): Promise<{
    formId: string;
    purposes: Array<{
      purpose: ProcessingPurpose;
      description: string;
      required: boolean;
      dataTypes: DataCategory[];
      legalBasis: string;
    }>;
    dataCategories: Array<{
      category: DataCategory;
      description: string;
      sensitivity: 'low' | 'medium' | 'high';
      examples: string[];
    }>;
    consentText: string;
    expirationInfo: string;
  }> {
    const formId = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Purpose details mapping
    const purposeDetails = {
      medical_care: {
        description: 'Fornecimento de cuidados médicos e estéticos, incluindo diagnóstico, tratamento e acompanhamento',
        required: true,
        legalBasis: 'Cuidados de saúde (Art. 11, LGPD)'
      },
      appointment_scheduling: {
        description: 'Agendamento de consultas e procedimentos, incluindo lembretes e confirmações',
        required: true,
        legalBasis: 'Execução de contrato (Art. 7º, V, LGPD)'
      },
      billing: {
        description: 'Processamento de pagamentos, emissão de notas fiscais e cobrança',
        required: true,
        legalBasis: 'Obrigação legal contábil (Art. 7º, II, LGPD)'
      },
      marketing: {
        description: 'Envio de ofertas personalizadas, newsletters e comunicação promocional',
        required: false,
        legalBasis: 'Consentimento (Art. 7º, I, LGPD)'
      },
      analytics: {
        description: 'Análise de padrões de uso para melhoria dos serviços prestados',
        required: false,
        legalBasis: 'Interesse legítimo (Art. 7º, IX, LGPD)'
      },
      research: {
        description: 'Pesquisas científicas em saúde e desenvolvimento de novos tratamentos',
        required: false,
        legalBasis: 'Consentimento para pesquisa (Art. 13, LGPD)'
      }
    };

    // Data category details mapping
    const categoryDetails = {
      personal: {
        description: 'Dados pessoais básicos como nome, CPF, telefone, email',
        sensitivity: 'low' as const,
        examples: ['Nome completo', 'CPF/RG', 'Telefone', 'Email', 'Endereço']
      },
      sensitive: {
        description: 'Dados sensíveis como origem racial, convicções religiosas',
        sensitivity: 'high' as const,
        examples: ['Origem étnica', 'Convicções religiosas', 'Orientação sexual']
      },
      medical: {
        description: 'Dados relacionados à saúde, histórico médico e tratamentos',
        sensitivity: 'high' as const,
        examples: ['Histórico médico', 'Alergias', 'Medicamentos', 'Procedimentos', 'Fotos médicas']
      },
      financial: {
        description: 'Dados financeiros para processamento de pagamentos',
        sensitivity: 'medium' as const,
        examples: ['Dados bancários', 'Informações de cartão', 'Histórico de pagamentos']
      },
      biometric: {
        description: 'Dados biométricos como impressões digitais, reconhecimento facial',
        sensitivity: 'high' as const,
        examples: ['Impressão digital', 'Reconhecimento facial', 'Assinatura biométrica']
      },
      behavioral: {
        description: 'Padrões de comportamento e preferências de uso dos serviços',
        sensitivity: 'medium' as const,
        examples: ['Padrões de agendamento', 'Preferências de comunicação', 'Histórico de navegação']
      }
    };

    // Map purposes
    const mappedPurposes = purposes.map(purpose => ({
      purpose,
      description: purposeDetails[purpose]?.description || purpose,
      required: purposeDetails[purpose]?.required || false,
      dataTypes: dataCategories.filter(cat => this.isPurposeDataCategoryCompatible(purpose, cat)),
      legalBasis: purposeDetails[purpose]?.legalBasis || 'Consentimento'
    }));

    // Map data categories
    const mappedCategories = dataCategories.map(category => ({
      category,
      description: categoryDetails[category]?.description || category,
      sensitivity: categoryDetails[category]?.sensitivity || 'medium',
      examples: categoryDetails[category]?.examples || []
    }));

    // Generate consent text
    const consentText = this.generateConsentText(mappedPurposes, mappedCategories, context);

    return {
      formId,
      purposes: mappedPurposes,
      dataCategories: mappedCategories,
      consentText,
      expirationInfo: 'Este consentimento é válido por 12 meses a partir da data de concessão'
    };
  }

  // ==================== CONSENT VALIDATION ====================

  /**
   * Validate consent for specific data processing activity
   */
  async validateConsentForProcessing(
    patientId: string, 
    purpose: ProcessingPurpose, 
    dataCategories: DataCategory[]
  ): Promise<{
    valid: boolean;
    consent?: LGPDConsent;
    issues: string[];
    recommendations: string[];
  }> {
    try {
      const issues: string[] = [];
      const recommendations: string[] = [];

      // Check if consent exists and is active
      const consent = await this.getActiveConsent(patientId, purpose);
      
      if (!consent) {
        issues.push(`Consentimento não encontrado para o propósito: ${purpose}`);
        recommendations.push('Solicitar novo consentimento antes de processar dados');
        return { valid: false, issues, recommendations };
      }

      // Check if consent covers required data categories
      const missingCategories = dataCategories.filter(category => 
        !consent.granularPermissions[category]
      );

      if (missingCategories.length > 0) {
        issues.push(`Consentimento não cobre as categorias: ${missingCategories.join(', ')}`);
        recommendations.push('Solicitar consentimento adicional para categorias em falta');
      }

      // Check expiration
      if (consent.expirationDate && consent.expirationDate < new Date()) {
        issues.push('Consentimento expirado');
        recommendations.push('Renovar consentimento antes de processar dados');
      }

      // Check withdrawal status
      if (consent.withdrawnDate) {
        issues.push('Consentimento foi retirado');
        recommendations.push('Não processar dados - consentimento retirado pelo titular');
      }

      const valid = issues.length === 0;

      // Log validation activity
      await this.logConsentActivity('consent_validation', consent, {
        valid,
        purpose,
        dataCategories,
        issues: issues.length
      });

      return {
        valid,
        consent: valid ? consent : undefined,
        issues,
        recommendations
      };
    } catch (error) {
      throw new ConsentValidationError('Failed to validate consent', error);
    }
  }

  /**
   * Check consent dependency mapping (which services require which data)
   */
  async checkConsentDependencies(patientId: string): Promise<{
    services: Array<{
      service: string;
      purpose: ProcessingPurpose;
      requiredData: DataCategory[];
      consentStatus: 'granted' | 'missing' | 'expired' | 'withdrawn';
      impact: string;
    }>;
    overallStatus: 'fully_consented' | 'partially_consented' | 'missing_consent';
    recommendations: string[];
  }> {
    const serviceMapping = [
      {
        service: 'Atendimento Médico',
        purpose: 'medical_care' as ProcessingPurpose,
        requiredData: ['personal', 'medical', 'sensitive'] as DataCategory[],
        impact: 'Não será possível fornecer atendimento médico sem este consentimento'
      },
      {
        service: 'Agendamento Online',
        purpose: 'appointment_scheduling' as ProcessingPurpose,
        requiredData: ['personal'] as DataCategory[],
        impact: 'Agendamentos deverão ser feitos presencialmente'
      },
      {
        service: 'Cobrança e Pagamento',
        purpose: 'billing' as ProcessingPurpose,
        requiredData: ['personal', 'financial'] as DataCategory[],
        impact: 'Pagamentos deverão ser processados manualmente'
      },
      {
        service: 'Comunicação Promocional',
        purpose: 'marketing' as ProcessingPurpose,
        requiredData: ['personal', 'behavioral'] as DataCategory[],
        impact: 'Não receberá ofertas personalizadas e promoções'
      }
    ];

    const services = await Promise.all(
      serviceMapping.map(async (service) => {
        const validation = await this.validateConsentForProcessing(
          patientId, 
          service.purpose, 
          service.requiredData
        );

        let status: 'granted' | 'missing' | 'expired' | 'withdrawn' = 'missing';
        if (validation.valid) {
          status = 'granted';
        } else if (validation.consent?.withdrawnDate) {
          status = 'withdrawn';
        } else if (validation.consent?.expirationDate && validation.consent.expirationDate < new Date()) {
          status = 'expired';
        }

        return {
          ...service,
          consentStatus: status
        };
      })
    );

    // Calculate overall status
    const grantedCount = services.filter(s => s.consentStatus === 'granted').length;
    const totalCount = services.length;
    
    let overallStatus: 'fully_consented' | 'partially_consented' | 'missing_consent';
    if (grantedCount === totalCount) {
      overallStatus = 'fully_consented';
    } else if (grantedCount > 0) {
      overallStatus = 'partially_consented';
    } else {
      overallStatus = 'missing_consent';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    const missingServices = services.filter(s => s.consentStatus !== 'granted');
    
    if (missingServices.length > 0) {
      recommendations.push(`Solicitar consentimento para: ${missingServices.map(s => s.service).join(', ')}`);
    }

    const expiredServices = services.filter(s => s.consentStatus === 'expired');
    if (expiredServices.length > 0) {
      recommendations.push(`Renovar consentimento para: ${expiredServices.map(s => s.service).join(', ')}`);
    }

    return {
      services,
      overallStatus,
      recommendations
    };
  }

  // ==================== CONSENT LIFECYCLE MANAGEMENT ====================

  /**
   * Withdraw consent for specific purposes
   */
  async withdrawConsent(
    patientId: string, 
    purposes: ProcessingPurpose[],
    reason?: string
  ): Promise<{
    withdrawn: LGPDConsent[];
    impactedServices: string[];
    nextSteps: string[];
  }> {
    try {
      const withdrawnConsents: LGPDConsent[] = [];
      const withdrawnDate = new Date();

      // Process each purpose
      for (const purpose of purposes) {
        const consent = await this.getActiveConsent(patientId, purpose);
        if (consent) {
          // Update consent status
          await this.supabase
            .from('lgpd_consents')
            .update({
              withdrawn_date: withdrawnDate.toISOString(),
              status: 'withdrawn'
            })
            .eq('id', consent.id);

          consent.withdrawnDate = withdrawnDate;
          consent.status = 'withdrawn';
          withdrawnConsents.push(consent);

          // Log withdrawal
          await this.logConsentActivity('consent_withdrawn', consent, { reason });
        }
      }

      // Determine impacted services
      const dependencyCheck = await this.checkConsentDependencies(patientId);
      const impactedServices = dependencyCheck.services
        .filter(service => purposes.includes(service.purpose))
        .map(service => service.service);

      // Generate next steps
      const nextSteps = [
        'Processamento de dados será interrompido para os propósitos retirados',
        'Dados existentes serão mantidos conforme período de retenção legal',
        'Serviços impactados poderão ter funcionalidade reduzida',
        'Consentimento pode ser concedido novamente a qualquer momento'
      ];

      if (purposes.includes('medical_care')) {
        nextSteps.push('ATENÇÃO: Retirada do consentimento médico pode impactar a continuidade do tratamento');
      }

      return {
        withdrawn: withdrawnConsents,
        impactedServices,
        nextSteps
      };
    } catch (error) {
      throw new ConsentValidationError('Failed to withdraw consent', error);
    }
  }

  /**
   * Renew expiring or expired consents
   */
  async renewExpiring consents(patientId: string, daysBeforeExpiration: number = 30): Promise<{
    expiring: LGPDConsent[];
    renewalForms: Array<{
      consentId: string;
      purpose: ProcessingPurpose;
      expirationDate: Date;
      renewalForm: any;
    }>;
    recommendations: string[];
  }> {
    try {
      // Find consents expiring within specified days
      const expirationThreshold = new Date(Date.now() + daysBeforeExpiration * 24 * 60 * 60 * 1000);

      const { data: expiringConsents, error } = await this.supabase
        .from('lgpd_consents')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'granted')
        .is('withdrawn_date', null)
        .lte('expiration_date', expirationThreshold.toISOString());

      if (error) {
        throw new ConsentValidationError('Failed to query expiring consents', error);
      }

      const expiring = expiringConsents?.map(this.mapDatabaseToConsent) || [];

      // Create renewal forms for each expiring consent
      const renewalForms = await Promise.all(
        expiring.map(async (consent) => {
          const dataCategories = Object.keys(consent.granularPermissions) as DataCategory[];
          const renewalForm = await this.createDynamicConsentForm(
            [consent.consentType],
            dataCategories,
            'consent_renewal'
          );

          return {
            consentId: consent.id,
            purpose: consent.consentType,
            expirationDate: consent.expirationDate!,
            renewalForm
          };
        })
      );

      // Generate recommendations
      const recommendations = [
        `${expiring.length} consentimento(s) expiram em breve`,
        'Recomendamos renovar antes da expiração para manter serviços ativos',
        'Renovação pode ser feita através do portal do paciente ou presencialmente'
      ];

      if (expiring.some(c => c.consentType === 'medical_care')) {
        recommendations.push('PRIORIDADE: Consentimento médico expirando - renovar urgentemente');
      }

      return {
        expiring,
        renewalForms,
        recommendations
      };
    } catch (error) {
      throw new ConsentValidationError('Failed to process expiring consents', error);
    }
  }

  // ==================== HELPER METHODS ====================

  private validateConsentRequest(request: ConsentRequest): void {
    if (!request.patientId) {
      throw new ConsentValidationError('Patient ID is required');
    }
    if (!request.purposes || request.purposes.length === 0) {
      throw new ConsentValidationError('At least one purpose is required');
    }
    if (!request.dataCategories || request.dataCategories.length === 0) {
      throw new ConsentValidationError('At least one data category is required');
    }
    if (!request.context) {
      throw new ConsentValidationError('Context is required');
    }
  }

  private async getActiveConsent(patientId: string, purpose: ProcessingPurpose): Promise<LGPDConsent | null> {
    const { data, error } = await this.supabase
      .from('lgpd_consents')
      .select('*')
      .eq('patient_id', patientId)
      .eq('consent_type', purpose)
      .eq('status', 'granted')
      .is('withdrawn_date', null)
      .order('granted_date', { ascending: false })
      .limit(1);

    if (error) {
      throw new ConsentValidationError('Failed to query active consent', error);
    }

    return data && data.length > 0 ? this.mapDatabaseToConsent(data[0]) : null;
  }

  private createPermissionsMatrix(purposes: ProcessingPurpose[], dataCategories: DataCategory[]): Record<DataCategory, boolean> {
    const matrix: Record<DataCategory, boolean> = {} as Record<DataCategory, boolean>;
    
    for (const category of dataCategories) {
      matrix[category] = true;
    }

    return matrix;
  }

  private isPurposeDataCategoryCompatible(purpose: ProcessingPurpose, category: DataCategory): boolean {
    const compatibility = {
      medical_care: ['personal', 'sensitive', 'medical', 'biometric'],
      appointment_scheduling: ['personal', 'behavioral'],
      billing: ['personal', 'financial'],
      marketing: ['personal', 'behavioral'],
      analytics: ['behavioral'],
      research: ['personal', 'medical', 'sensitive'],
      legal_obligation: ['personal', 'medical', 'financial']
    };

    return compatibility[purpose]?.includes(category) || false;
  }

  private generateConsentId(): string {
    return `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateConsentText(purposes: any[], categories: any[], context: string): string {
    const purposeTexts = purposes.map(p => `• ${p.description} (${p.legalBasis})`).join('\n');
    const categoryTexts = categories.map(c => `• ${c.description} (Nível: ${c.sensitivity})`).join('\n');

    return `
TERMO DE CONSENTIMENTO PARA TRATAMENTO DE DADOS PESSOAIS

Contexto: ${context}

FINALIDADES DO TRATAMENTO:
${purposeTexts}

DADOS QUE SERÃO TRATADOS:
${categoryTexts}

DIREITOS DO TITULAR:
• Acessar seus dados pessoais
• Corrigir dados incompletos, inexatos ou desatualizados
• Solicitar a exclusão de dados (direito ao esquecimento)
• Solicitar a portabilidade de dados
• Revogar o consentimento a qualquer momento
• Obter informações sobre compartilhamento

PRAZO DE ARMAZENAMENTO:
Os dados serão mantidos pelo período necessário para as finalidades informadas, respeitando os prazos legais de retenção.

COMPARTILHAMENTO:
Seus dados podem ser compartilhados com prestadores de serviços essenciais, sempre com suas devidas proteções e apenas para as finalidades consentidas.

Para exercer seus direitos ou obter mais informações, entre em contato através dos canais oficiais da clínica.
    `.trim();
  }

  private async storeConsent(consent: LGPDConsent): Promise<void> {
    const { error } = await this.supabase
      .from('lgpd_consents')
      .insert({
        id: consent.id,
        patient_id: consent.patientId,
        consent_type: consent.consentType,
        status: consent.status,
        granted_date: consent.grantedDate.toISOString(),
        expiration_date: consent.expirationDate?.toISOString(),
        granular_permissions: consent.granularPermissions,
        version: consent.version,
        metadata: consent.metadata
      });

    if (error) {
      throw new ConsentValidationError('Failed to store consent', error);
    }
  }

  private async logConsentActivity(activity: string, consent: LGPDConsent, metadata?: any): Promise<void> {
    // Log to data processing log
    const { error } = await this.supabase
      .from('data_processing_log')
      .insert({
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        patient_id: consent.patientId,
        processing_type: 'update',
        purpose: 'legal_obligation',
        timestamp: new Date().toISOString(),
        user_id: 'system',
        system_component: 'consent_manager',
        data_fields: ['consent_status'],
        legal_basis: 'legal_obligation',
        metadata: { activity, consentId: consent.id, ...metadata }
      });

    if (error) {
      console.error('Failed to log consent activity:', error);
    }
  }

  private async sendConsentConfirmation(consent: LGPDConsent): Promise<void> {
    // Implementation would send confirmation email/SMS
    console.log(`Sending consent confirmation for ${consent.id}`);
  }

  private mapDatabaseToConsent(dbRecord: any): LGPDConsent {
    return {
      id: dbRecord.id,
      patientId: dbRecord.patient_id,
      consentType: dbRecord.consent_type,
      status: dbRecord.status,
      grantedDate: new Date(dbRecord.granted_date),
      withdrawnDate: dbRecord.withdrawn_date ? new Date(dbRecord.withdrawn_date) : undefined,
      expirationDate: dbRecord.expiration_date ? new Date(dbRecord.expiration_date) : undefined,
      granularPermissions: dbRecord.granular_permissions,
      version: dbRecord.version,
      metadata: dbRecord.metadata
    };
  }
}

/**
 * Singleton instance for application-wide use
 */
export const consentManager = new ConsentManager();

/**
 * Export for integration with LGPD Manager
 */
export default ConsentManager;