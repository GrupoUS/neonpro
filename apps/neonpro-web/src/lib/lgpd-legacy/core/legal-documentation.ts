// LGPD Legal Documentation Automation Manager - Core Module
// Story 1.5: LGPD Compliance Automation
// Task 10: Legal Documentation Automation (AC: 10)

import { createClient } from '@/lib/supabase/client';
import type {
  LGPDServiceResponse,
  LGPDDataCategory,
  LGPDEventType,
  LGPDDataProcessingPurpose,
  LGPDLegalBasis,
  LGPDLegalDocument
} from '../types';
import { LGPDAuditLogger } from './audit-logger';
import { LGPDEventEmitter } from '../utils/event-emitter';
import { LGPDComplianceMonitor } from './compliance-monitor';

/**
 * LGPD Legal Documentation Automation Manager
 * Automates creation, maintenance, and updates of legal documents
 * required for LGPD compliance including privacy policies, consent forms,
 * data processing agreements, and compliance reports
 */
export class LGPDLegalDocumentationManager {
  private supabase = createClient();
  private auditLogger = new LGPDAuditLogger();
  private eventEmitter = new LGPDEventEmitter();
  private complianceMonitor = new LGPDComplianceMonitor();
  private documentTemplates: Map<string, any> = new Map();
  private activeDocuments: Map<string, LGPDLegalDocument[]> = new Map();
  private documentVersions: Map<string, any[]> = new Map();

  // Document Templates and Structures
  private readonly DOCUMENT_TEMPLATES = {
    privacy_policy: {
      name: 'Privacy Policy (Política de Privacidade)',
      type: 'privacy_policy',
      required_sections: [
        'data_controller_identification',
        'data_categories_collected',
        'processing_purposes',
        'legal_basis',
        'data_sharing_recipients',
        'data_retention_periods',
        'data_subject_rights',
        'security_measures',
        'contact_information',
        'policy_updates'
      ],
      legal_references: ['LGPD Art. 9', 'LGPD Art. 18', 'LGPD Art. 19'],
      update_frequency: 'annually',
      mandatory: true
    },
    consent_form: {
      name: 'Consent Form (Formulário de Consentimento)',
      type: 'consent_form',
      required_sections: [
        'purpose_specification',
        'data_categories',
        'processing_duration',
        'withdrawal_mechanism',
        'consequences_of_withdrawal',
        'data_sharing_information',
        'contact_information'
      ],
      legal_references: ['LGPD Art. 8', 'LGPD Art. 9'],
      update_frequency: 'as_needed',
      mandatory: true
    },
    data_processing_agreement: {
      name: 'Data Processing Agreement (Contrato de Processamento)',
      type: 'data_processing_agreement',
      required_sections: [
        'parties_identification',
        'processing_scope',
        'data_categories',
        'processing_purposes',
        'security_obligations',
        'data_subject_rights_assistance',
        'breach_notification',
        'data_return_deletion',
        'audit_rights',
        'liability_provisions'
      ],
      legal_references: ['LGPD Art. 42'],
      update_frequency: 'contract_renewal',
      mandatory: false
    },
    breach_notification: {
      name: 'Data Breach Notification (Notificação de Violação)',
      type: 'breach_notification',
      required_sections: [
        'incident_description',
        'affected_data_categories',
        'affected_individuals_count',
        'incident_timeline',
        'containment_measures',
        'impact_assessment',
        'remedial_actions',
        'prevention_measures'
      ],
      legal_references: ['LGPD Art. 48'],
      update_frequency: 'incident_based',
      mandatory: false
    },
    dpia_report: {
      name: 'Data Protection Impact Assessment Report (Relatório de AIPD)',
      type: 'dpia_report',
      required_sections: [
        'processing_description',
        'necessity_proportionality_assessment',
        'risk_identification',
        'risk_mitigation_measures',
        'stakeholder_consultation',
        'monitoring_measures',
        'review_schedule'
      ],
      legal_references: ['LGPD Art. 38'],
      update_frequency: 'assessment_based',
      mandatory: false
    },
    compliance_report: {
      name: 'LGPD Compliance Report (Relatório de Conformidade)',
      type: 'compliance_report',
      required_sections: [
        'executive_summary',
        'compliance_status_overview',
        'data_processing_inventory',
        'risk_assessment_summary',
        'incident_summary',
        'training_records',
        'audit_findings',
        'improvement_recommendations'
      ],
      legal_references: ['LGPD Art. 50'],
      update_frequency: 'quarterly',
      mandatory: false
    },
    data_subject_response: {
      name: 'Data Subject Rights Response (Resposta aos Direitos do Titular)',
      type: 'data_subject_response',
      required_sections: [
        'request_acknowledgment',
        'identity_verification',
        'response_content',
        'additional_information',
        'appeal_rights',
        'contact_information'
      ],
      legal_references: ['LGPD Art. 18', 'LGPD Art. 19'],
      update_frequency: 'request_based',
      mandatory: false
    },
    retention_policy: {
      name: 'Data Retention Policy (Política de Retenção)',
      type: 'retention_policy',
      required_sections: [
        'retention_principles',
        'data_category_schedules',
        'deletion_procedures',
        'exception_handling',
        'review_procedures',
        'compliance_monitoring'
      ],
      legal_references: ['LGPD Art. 16'],
      update_frequency: 'annually',
      mandatory: true
    }
  };

  // Document Content Templates (Portuguese)
  private readonly CONTENT_TEMPLATES = {
    privacy_policy_intro: `
Esta Política de Privacidade descreve como [CLINIC_NAME] coleta, usa, armazena e protege suas informações pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).

Última atualização: [UPDATE_DATE]
`,
    consent_form_intro: `
Ao fornecer seu consentimento, você autoriza [CLINIC_NAME] a processar seus dados pessoais conforme descrito neste formulário, em conformidade com a LGPD.
`,
    data_controller_section: `
## Controlador de Dados

**Nome:** [CLINIC_NAME]
**CNPJ:** [CLINIC_CNPJ]
**Endereço:** [CLINIC_ADDRESS]
**Telefone:** [CLINIC_PHONE]
**E-mail:** [CLINIC_EMAIL]
**Encarregado de Dados:** [DPO_NAME] - [DPO_EMAIL]
`,
    data_subject_rights_section: `
## Seus Direitos como Titular dos Dados

Conforme a LGPD, você possui os seguintes direitos:

- **Confirmação e Acesso:** Confirmar a existência e acessar seus dados pessoais
- **Correção:** Corrigir dados incompletos, inexatos ou desatualizados
- **Anonimização, Bloqueio ou Eliminação:** Solicitar anonimização, bloqueio ou eliminação de dados desnecessários
- **Portabilidade:** Solicitar a portabilidade de seus dados para outro fornecedor
- **Eliminação:** Solicitar a eliminação de dados tratados com base no consentimento
- **Informação:** Obter informações sobre entidades com as quais compartilhamos seus dados
- **Revogação do Consentimento:** Revogar o consentimento a qualquer momento

Para exercer seus direitos, entre em contato conosco através de [CONTACT_EMAIL] ou [CONTACT_PHONE].
`,
    security_measures_section: `
## Medidas de Segurança

Implementamos medidas técnicas e organizacionais adequadas para proteger seus dados pessoais:

- Criptografia de dados em trânsito e em repouso
- Controles de acesso baseados em funções
- Monitoramento e auditoria de segurança
- Treinamento regular da equipe
- Políticas de segurança da informação
- Backup seguro e recuperação de dados
`
  };

  constructor() {
    this.initializeDocumentTemplates();
  }

  /**
   * Generate a new legal document based on template and clinic data
   */
  async generateDocument(
    clinicId: string,
    userId: string,
    documentType: keyof typeof this.DOCUMENT_TEMPLATES,
    documentData: {
      title?: string;
      clinic_info?: {
        name: string;
        cnpj: string;
        address: string;
        phone: string;
        email: string;
        dpo_name?: string;
        dpo_email?: string;
      };
      custom_sections?: Record<string, string>;
      variables?: Record<string, any>;
      language?: 'pt' | 'en';
      format?: 'html' | 'markdown' | 'pdf';
    }
  ): Promise<LGPDServiceResponse<LGPDLegalDocument>> {
    const startTime = Date.now();

    try {
      // Validate document type
      const template = this.DOCUMENT_TEMPLATES[documentType];
      if (!template) {
        throw new Error(`Invalid document type: ${documentType}`);
      }

      // Get clinic information if not provided
      let clinicInfo = documentData.clinic_info;
      if (!clinicInfo) {
        const clinicResult = await this.getClinicInformation(clinicId);
        if (!clinicResult.success) {
          throw new Error('Failed to get clinic information');
        }
        clinicInfo = clinicResult.data;
      }

      // Generate document content
      const documentContent = await this.generateDocumentContent(
        template,
        clinicInfo,
        documentData.custom_sections || {},
        documentData.variables || {}
      );

      // Create document record
      const documentRecord: Omit<LGPDLegalDocument, 'id' | 'created_at' | 'updated_at'> = {
        clinic_id: clinicId,
        document_type: documentType,
        title: documentData.title || template.name,
        content: documentContent,
        version: '1.0',
        status: 'draft',
        language: documentData.language || 'pt',
        format: documentData.format || 'html',
        created_by: userId,
        approved_by: null,
        approval_date: null,
        effective_date: null,
        expiry_date: this.calculateExpiryDate(template.update_frequency),
        legal_references: template.legal_references,
        template_version: '1.0',
        variables_used: documentData.variables || {},
        review_required: template.mandatory,
        compliance_status: 'pending_review',
        document_metadata: {
          template_used: documentType,
          generation_method: 'automated',
          required_sections: template.required_sections,
          custom_sections: Object.keys(documentData.custom_sections || {}),
          word_count: this.countWords(documentContent),
          last_review_date: null,
          next_review_date: this.calculateNextReviewDate(template.update_frequency)
        }
      };

      // Save document to database
      const { data, error } = await this.supabase
        .from('lgpd_legal_documents')
        .insert(documentRecord)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to save document: ${error.message}`);
      }

      // Update local cache
      const clinicDocuments = this.activeDocuments.get(clinicId) || [];
      clinicDocuments.push(data);
      this.activeDocuments.set(clinicId, clinicDocuments);

      // Log document generation
      await this.auditLogger.logEvent({
        user_id: userId,
        clinic_id: clinicId,
        action: 'legal_document_generated',
        resource_type: 'legal_document',
        data_affected: ['document_content'],
        legal_basis: 'legitimate_interest',
        processing_purpose: 'legal_compliance',
        ip_address: 'system',
        user_agent: 'documentation_manager',
        actor_id: userId,
        actor_type: 'user',
        severity: 'low',
        metadata: {
          document_id: data.id,
          document_type: documentType,
          document_title: data.title,
          template_version: '1.0',
          word_count: documentRecord.document_metadata.word_count
        }
      });

      // Generate alert for mandatory documents requiring review
      if (template.mandatory) {
        await this.complianceMonitor.generateAlert(
          clinicId,
          'mandatory_document_review_required',
          'medium',
          'Mandatory Legal Document Requires Review',
          `Document "${data.title}" has been generated and requires review for compliance`,
          {
            document_id: data.id,
            document_type: documentType,
            legal_references: template.legal_references
          }
        );
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: data,
        compliance_notes: [
          `Legal document generated: ${data.title}`,
          `Document type: ${template.name}`,
          `Status: ${data.status}`,
          `Review required: ${template.mandatory ? 'Yes' : 'No'}`,
          `Word count: ${documentRecord.document_metadata.word_count}`
        ],
        legal_references: template.legal_references,
        audit_logged: true,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate legal document',
        audit_logged: true,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Update an existing document
   */
  async updateDocument(
    clinicId: string,
    documentId: string,
    userId: string,
    updates: {
      content?: string;
      status?: 'draft' | 'under_review' | 'approved' | 'published' | 'archived';
      title?: string;
      custom_sections?: Record<string, string>;
      variables?: Record<string, any>;
      reviewer_notes?: string;
    }
  ): Promise<LGPDServiceResponse<LGPDLegalDocument>> {
    const startTime = Date.now();

    try {
      // Get existing document
      const { data: existingDocument, error: fetchError } = await this.supabase
        .from('lgpd_legal_documents')
        .select('*')
        .eq('id', documentId)
        .eq('clinic_id', clinicId)
        .single();

      if (fetchError || !existingDocument) {
        throw new Error('Document not found');
      }

      // Create new version if content changed
      let newVersion = existingDocument.version;
      if (updates.content && updates.content !== existingDocument.content) {
        newVersion = this.incrementVersion(existingDocument.version);
        
        // Store previous version
        await this.storeDocumentVersion(existingDocument);
      }

      // Prepare update data
      const updateData: any = {
        updated_at: new Date().toISOString(),
        version: newVersion
      };

      if (updates.content) {
        updateData.content = updates.content;
        updateData.document_metadata = {
          ...existingDocument.document_metadata,
          word_count: this.countWords(updates.content),
          last_modified_by: userId,
          last_modification_date: new Date().toISOString()
        };
      }

      if (updates.status) {
        updateData.status = updates.status;
        
        if (updates.status === 'approved') {
          updateData.approved_by = userId;
          updateData.approval_date = new Date().toISOString();
          updateData.compliance_status = 'compliant';
        } else if (updates.status === 'published') {
          updateData.effective_date = new Date().toISOString();
          updateData.compliance_status = 'active';
        }
      }

      if (updates.title) {
        updateData.title = updates.title;
      }

      if (updates.variables) {
        updateData.variables_used = {
          ...existingDocument.variables_used,
          ...updates.variables
        };
      }

      if (updates.reviewer_notes) {
        updateData.reviewer_notes = updates.reviewer_notes;
      }

      // Update document
      const { data, error } = await this.supabase
        .from('lgpd_legal_documents')
        .update(updateData)
        .eq('id', documentId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update document: ${error.message}`);
      }

      // Update local cache
      const clinicDocuments = this.activeDocuments.get(clinicId) || [];
      const documentIndex = clinicDocuments.findIndex(d => d.id === documentId);
      if (documentIndex >= 0) {
        clinicDocuments[documentIndex] = data;
      }
      this.activeDocuments.set(clinicId, clinicDocuments);

      // Log document update
      await this.auditLogger.logEvent({
        user_id: userId,
        clinic_id: clinicId,
        action: 'legal_document_updated',
        resource_type: 'legal_document',
        data_affected: ['document_content'],
        legal_basis: 'legitimate_interest',
        processing_purpose: 'legal_compliance',
        ip_address: 'system',
        user_agent: 'documentation_manager',
        actor_id: userId,
        actor_type: 'user',
        severity: 'low',
        metadata: {
          document_id: documentId,
          previous_version: existingDocument.version,
          new_version: newVersion,
          status_change: updates.status,
          content_changed: !!updates.content
        }
      });

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: data,
        compliance_notes: [
          `Document updated: ${data.title}`,
          `Version: ${existingDocument.version} → ${newVersion}`,
          `Status: ${updates.status || data.status}`,
          `Content changed: ${updates.content ? 'Yes' : 'No'}`
        ],
        legal_references: data.legal_references,
        audit_logged: true,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update document',
        audit_logged: true,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Get documents for a clinic
   */
  async getDocuments(
    clinicId: string,
    filters?: {
      document_type?: keyof typeof this.DOCUMENT_TEMPLATES;
      status?: 'draft' | 'under_review' | 'approved' | 'published' | 'archived';
      language?: 'pt' | 'en';
      dateRange?: { start: Date; end: Date };
      search?: string;
    }
  ): Promise<LGPDServiceResponse<LGPDLegalDocument[]>> {
    const startTime = Date.now();

    try {
      let query = this.supabase
        .from('lgpd_legal_documents')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (filters?.document_type) {
        query = query.eq('document_type', filters.document_type);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.language) {
        query = query.eq('language', filters.language);
      }

      if (filters?.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start.toISOString())
          .lte('created_at', filters.dateRange.end.toISOString());
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get documents: ${error.message}`);
      }

      // Enhance data with additional information
      const enhancedData = (data || []).map(document => ({
        ...document,
        days_since_creation: Math.floor(
          (Date.now() - new Date(document.created_at).getTime()) / (24 * 60 * 60 * 1000)
        ),
        days_until_expiry: document.expiry_date ? Math.floor(
          (new Date(document.expiry_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
        ) : null,
        is_expired: document.expiry_date ? new Date(document.expiry_date) < new Date() : false,
        template_info: this.DOCUMENT_TEMPLATES[document.document_type as keyof typeof this.DOCUMENT_TEMPLATES]
      }));

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: enhancedData,
        processing_time_ms: processingTime,
        audit_logged: false
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get documents',
        audit_logged: false,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Generate compliance documentation package
   */
  async generateCompliancePackage(
    clinicId: string,
    userId: string,
    packageType: 'basic' | 'comprehensive' | 'audit_ready' = 'basic'
  ): Promise<LGPDServiceResponse<{ documents: LGPDLegalDocument[]; package_info: any }>> {
    const startTime = Date.now();

    try {
      // Define required documents for each package type
      const packageRequirements = {
        basic: ['privacy_policy', 'consent_form', 'retention_policy'],
        comprehensive: [
          'privacy_policy', 'consent_form', 'retention_policy',
          'data_processing_agreement', 'compliance_report'
        ],
        audit_ready: [
          'privacy_policy', 'consent_form', 'retention_policy',
          'data_processing_agreement', 'compliance_report',
          'dpia_report', 'data_subject_response'
        ]
      };

      const requiredDocuments = packageRequirements[packageType];
      const generatedDocuments: LGPDLegalDocument[] = [];
      const errors: string[] = [];

      // Get clinic information
      const clinicResult = await this.getClinicInformation(clinicId);
      if (!clinicResult.success) {
        throw new Error('Failed to get clinic information');
      }
      const clinicInfo = clinicResult.data;

      // Generate each required document
      for (const documentType of requiredDocuments) {
        try {
          const result = await this.generateDocument(
            clinicId,
            userId,
            documentType as keyof typeof this.DOCUMENT_TEMPLATES,
            {
              clinic_info: clinicInfo,
              title: `${this.DOCUMENT_TEMPLATES[documentType as keyof typeof this.DOCUMENT_TEMPLATES].name} - ${clinicInfo.name}`
            }
          );

          if (result.success && result.data) {
            generatedDocuments.push(result.data);
          } else {
            errors.push(`Failed to generate ${documentType}: ${result.error}`);
          }
        } catch (error) {
          errors.push(`Error generating ${documentType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Create package metadata
      const packageInfo = {
        package_type: packageType,
        clinic_id: clinicId,
        generated_by: userId,
        generation_date: new Date().toISOString(),
        documents_count: generatedDocuments.length,
        required_documents: requiredDocuments,
        generated_documents: generatedDocuments.map(d => d.document_type),
        missing_documents: requiredDocuments.filter(
          type => !generatedDocuments.some(d => d.document_type === type)
        ),
        errors: errors,
        compliance_score: this.calculatePackageComplianceScore(generatedDocuments, requiredDocuments),
        next_review_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
      };

      // Log package generation
      await this.auditLogger.logEvent({
        user_id: userId,
        clinic_id: clinicId,
        action: 'compliance_package_generated',
        resource_type: 'compliance_package',
        data_affected: ['legal_documents'],
        legal_basis: 'legitimate_interest',
        processing_purpose: 'legal_compliance',
        ip_address: 'system',
        user_agent: 'documentation_manager',
        actor_id: userId,
        actor_type: 'user',
        severity: 'low',
        metadata: packageInfo
      });

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          documents: generatedDocuments,
          package_info: packageInfo
        },
        compliance_notes: [
          `Compliance package generated: ${packageType}`,
          `Documents created: ${generatedDocuments.length}/${requiredDocuments.length}`,
          `Compliance score: ${packageInfo.compliance_score}%`,
          `Errors: ${errors.length}`
        ],
        legal_references: ['LGPD Art. 9', 'LGPD Art. 18', 'LGPD Art. 38'],
        audit_logged: true,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate compliance package',
        audit_logged: true,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Check for document updates and renewals
   */
  async checkDocumentRenewals(
    clinicId: string
  ): Promise<LGPDServiceResponse<{ expired: LGPDLegalDocument[]; expiring_soon: LGPDLegalDocument[]; up_to_date: LGPDLegalDocument[] }>> {
    const startTime = Date.now();

    try {
      const documentsResult = await this.getDocuments(clinicId);
      if (!documentsResult.success) {
        throw new Error('Failed to get documents');
      }

      const documents = documentsResult.data || [];
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const expired = documents.filter(doc => 
        doc.expiry_date && new Date(doc.expiry_date) < now
      );

      const expiringSoon = documents.filter(doc => 
        doc.expiry_date && 
        new Date(doc.expiry_date) >= now && 
        new Date(doc.expiry_date) <= thirtyDaysFromNow
      );

      const upToDate = documents.filter(doc => 
        !doc.expiry_date || new Date(doc.expiry_date) > thirtyDaysFromNow
      );

      // Generate alerts for expired and expiring documents
      for (const doc of expired) {
        await this.complianceMonitor.generateAlert(
          clinicId,
          'document_expired',
          'high',
          'Legal Document Expired',
          `Document "${doc.title}" has expired and requires immediate renewal`,
          {
            document_id: doc.id,
            document_type: doc.document_type,
            expiry_date: doc.expiry_date
          }
        );
      }

      for (const doc of expiringSoon) {
        await this.complianceMonitor.generateAlert(
          clinicId,
          'document_expiring_soon',
          'medium',
          'Legal Document Expiring Soon',
          `Document "${doc.title}" will expire on ${new Date(doc.expiry_date!).toLocaleDateString()}`,
          {
            document_id: doc.id,
            document_type: doc.document_type,
            expiry_date: doc.expiry_date
          }
        );
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          expired,
          expiring_soon: expiringSoon,
          up_to_date: upToDate
        },
        compliance_notes: [
          `Document renewal check completed`,
          `Expired documents: ${expired.length}`,
          `Expiring soon: ${expiringSoon.length}`,
          `Up to date: ${upToDate.length}`
        ],
        audit_logged: false,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check document renewals',
        audit_logged: false,
        processing_time_ms: processingTime
      };
    }
  }

  // Private helper methods

  private async initializeDocumentTemplates(): Promise<void> {
    // Initialize document templates
    for (const [key, template] of Object.entries(this.DOCUMENT_TEMPLATES)) {
      this.documentTemplates.set(key, template);
    }
  }

  private async getClinicInformation(clinicId: string): Promise<LGPDServiceResponse<any>> {
    try {
      const { data, error } = await this.supabase
        .from('clinics')
        .select('name, cnpj, address, phone, email, dpo_name, dpo_email')
        .eq('id', clinicId)
        .single();

      if (error) {
        throw new Error(`Failed to get clinic information: ${error.message}`);
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get clinic information'
      };
    }
  }

  private async generateDocumentContent(
    template: any,
    clinicInfo: any,
    customSections: Record<string, string>,
    variables: Record<string, any>
  ): Promise<string> {
    let content = '';

    // Add document header
    content += `# ${template.name}\n\n`;

    // Add introduction based on document type
    if (template.type === 'privacy_policy') {
      content += this.replaceVariables(this.CONTENT_TEMPLATES.privacy_policy_intro, {
        CLINIC_NAME: clinicInfo.name,
        UPDATE_DATE: new Date().toLocaleDateString('pt-BR')
      });
    } else if (template.type === 'consent_form') {
      content += this.replaceVariables(this.CONTENT_TEMPLATES.consent_form_intro, {
        CLINIC_NAME: clinicInfo.name
      });
    }

    // Add data controller section
    content += this.replaceVariables(this.CONTENT_TEMPLATES.data_controller_section, {
      CLINIC_NAME: clinicInfo.name,
      CLINIC_CNPJ: clinicInfo.cnpj || '[CNPJ]',
      CLINIC_ADDRESS: clinicInfo.address || '[ENDEREÇO]',
      CLINIC_PHONE: clinicInfo.phone || '[TELEFONE]',
      CLINIC_EMAIL: clinicInfo.email || '[EMAIL]',
      DPO_NAME: clinicInfo.dpo_name || '[NOME DO ENCARREGADO]',
      DPO_EMAIL: clinicInfo.dpo_email || '[EMAIL DO ENCARREGADO]'
    });

    // Add required sections based on template
    for (const sectionName of template.required_sections) {
      if (customSections[sectionName]) {
        content += `\n## ${this.formatSectionTitle(sectionName)}\n\n${customSections[sectionName]}\n`;
      } else {
        content += this.generateDefaultSectionContent(sectionName, template.type, clinicInfo);
      }
    }

    // Add data subject rights section for applicable documents
    if (['privacy_policy', 'consent_form'].includes(template.type)) {
      content += this.replaceVariables(this.CONTENT_TEMPLATES.data_subject_rights_section, {
        CONTACT_EMAIL: clinicInfo.dpo_email || clinicInfo.email || '[EMAIL]',
        CONTACT_PHONE: clinicInfo.phone || '[TELEFONE]'
      });
    }

    // Add security measures section for applicable documents
    if (['privacy_policy', 'data_processing_agreement'].includes(template.type)) {
      content += this.CONTENT_TEMPLATES.security_measures_section;
    }

    // Add custom sections
    for (const [sectionName, sectionContent] of Object.entries(customSections)) {
      if (!template.required_sections.includes(sectionName)) {
        content += `\n## ${this.formatSectionTitle(sectionName)}\n\n${sectionContent}\n`;
      }
    }

    // Add footer with legal references
    content += `\n---\n\n**Referências Legais:** ${template.legal_references.join(', ')}\n\n`;
    content += `**Data de Geração:** ${new Date().toLocaleDateString('pt-BR')}\n`;

    // Replace any remaining variables
    content = this.replaceVariables(content, variables);

    return content;
  }

  private replaceVariables(content: string, variables: Record<string, any>): string {
    let result = content;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `[${key}]`;
      result = result.replace(new RegExp(placeholder, 'g'), String(value));
    }
    return result;
  }

  private formatSectionTitle(sectionName: string): string {
    return sectionName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private generateDefaultSectionContent(sectionName: string, documentType: string, clinicInfo: any): string {
    // Generate default content for common sections
    switch (sectionName) {
      case 'data_categories_collected':
        return `\n## Categorias de Dados Coletados\n\n- Dados de identificação (nome, CPF, RG)\n- Dados de contato (telefone, email, endereço)\n- Dados de saúde (histórico médico, exames, diagnósticos)\n- Dados financeiros (forma de pagamento, histórico de pagamentos)\n\n`;
      
      case 'processing_purposes':
        return `\n## Finalidades do Tratamento\n\n- Prestação de serviços médicos e de saúde\n- Agendamento de consultas e procedimentos\n- Comunicação com pacientes\n- Cumprimento de obrigações legais\n- Gestão financeira e cobrança\n\n`;
      
      case 'legal_basis':
        return `\n## Base Legal\n\n- Consentimento do titular dos dados\n- Execução de contrato de prestação de serviços\n- Cumprimento de obrigação legal\n- Interesse legítimo do controlador\n\n`;
      
      default:
        return `\n## ${this.formatSectionTitle(sectionName)}\n\n[Conteúdo a ser definido]\n\n`;
    }
  }

  private calculateExpiryDate(updateFrequency: string): string | null {
    const now = new Date();
    
    switch (updateFrequency) {
      case 'annually':
        return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
      case 'quarterly':
        return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();
      case 'monthly':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return null;
    }
  }

  private calculateNextReviewDate(updateFrequency: string): string | null {
    const now = new Date();
    
    switch (updateFrequency) {
      case 'annually':
        return new Date(now.getTime() + 330 * 24 * 60 * 60 * 1000).toISOString(); // 11 months
      case 'quarterly':
        return new Date(now.getTime() + 75 * 24 * 60 * 60 * 1000).toISOString(); // 2.5 months
      case 'monthly':
        return new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString(); // 25 days
      default:
        return null;
    }
  }

  private countWords(content: string): number {
    return content.trim().split(/\s+/).length;
  }

  private incrementVersion(currentVersion: string): string {
    const parts = currentVersion.split('.');
    const major = parseInt(parts[0]) || 1;
    const minor = parseInt(parts[1]) || 0;
    
    return `${major}.${minor + 1}`;
  }

  private async storeDocumentVersion(document: LGPDLegalDocument): Promise<void> {
    const versions = this.documentVersions.get(document.id) || [];
    versions.push({
      version: document.version,
      content: document.content,
      created_at: document.updated_at || document.created_at,
      created_by: document.created_by
    });
    this.documentVersions.set(document.id, versions);
  }

  private calculatePackageComplianceScore(generatedDocuments: LGPDLegalDocument[], requiredDocuments: string[]): number {
    const generatedCount = generatedDocuments.length;
    const requiredCount = requiredDocuments.length;
    
    if (requiredCount === 0) return 100;
    
    return Math.round((generatedCount / requiredCount) * 100);
  }

  /**
   * Cleanup method
   */
  destroy(): void {
    this.documentTemplates.clear();
    this.activeDocuments.clear();
    this.documentVersions.clear();
  }
}
