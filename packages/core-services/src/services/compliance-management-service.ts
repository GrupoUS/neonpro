/**
 * Automated Compliance and Reporting Service for Brazilian Aesthetic Clinics
 * Handles LGPD, ANVISA, and Professional Council compliance requirements
 */

import {
  ComplianceCategory,
  ComplianceRequirement,
  ComplianceAssessment,
  DataConsentRecord,
  DataSubjectRequest,
  DataBreachIncident,
  AnvisaProductCompliance,
  ProfessionalLicenseCompliance,
  ComplianceReport,
  ComplianceAlert,
  ComplianceAuditTrail,
  RetentionPolicy,
  DataRetentionJob,
  type ComplianceAssessmentInput,
  type DataConsentInput,
  type DataSubjectRequestInput,
  type DataBreachInput,
  type ComplianceAlertInput,
  type ComplianceReportInput
} from '@neonpro/types';
import { logHealthcareError, complianceLogger } from '../../../shared/src/logging/healthcare-logger';

export class ComplianceManagementService {
  private supabase: any;

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  // Compliance Categories and Requirements Management
  async getComplianceCategories(regulatoryBody?: string): Promise<ComplianceCategory[]> {
    let query = this.supabase.from('compliance_categories').select('*');
    
    if (regulatoryBody) {
      query = query.eq('regulatory_body', regulatoryBody);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Erro ao buscar categorias de compliance: ${error.message}`);
    }
    
    return data || [];
  }

  async getComplianceRequirements(categoryId?: string): Promise<ComplianceRequirement[]> {
    let query = this.supabase.from('compliance_requirements').select('*');
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Erro ao buscar requisitos de compliance: ${error.message}`);
    }
    
    return data || [];
  }

  // Compliance Assessments
  async createComplianceAssessment(assessment: ComplianceAssessmentInput): Promise<ComplianceAssessment> {
    const { data, error } = await this.supabase
      .from('compliance_assessments')
      .insert([{
        requirement_id: assessment.requirementId,
        clinic_id: assessment.clinicId,
        assessment_type: assessment.assessmentType,
        findings: assessment.findings || [],
        recommendations: assessment.recommendations || [],
        evidence_urls: assessment.evidenceUrls || [],
        assessed_by: assessment.assessedBy
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar avaliação de compliance: ${error.message}`);
    }

    // Log the assessment creation
    await this.logComplianceAction({
      clinicId: assessment.clinicId,
      actionType: 'assessment_created',
      actionDescription: `Nova avaliação de compliance criada para requisito ${assessment.requirementId}`,
      performedBy: assessment.assessedBy,
      affectedRecordId: data.id,
      affectedRecordType: 'compliance_assessment',
      newValues: { assessment_type: assessment.assessmentType }
    });

    return data;
  }

  async getComplianceAssessments(clinicId: string, status?: string): Promise<ComplianceAssessment[]> {
    let query = this.supabase
      .from('compliance_assessments')
      .select(`
        *,
        requirement:compliance_requirements (
          id,
          name,
          category:compliance_categories (
            id,
            name,
            regulatory_body
          )
        ),
        assessor:professionals (
          id,
          name,
          professional_type
        )
      `)
      .eq('clinic_id', clinicId);

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('assessment_date', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar avaliações de compliance: ${error.message}`);
    }

    return data || [];
  }

  async updateAssessmentStatus(assessmentId: string, status: string, score?: number): Promise<ComplianceAssessment> {
    const { data, error } = await this.supabase
      .from('compliance_assessments')
      .update({
        status,
        score,
        updated_at: new Date().toISOString()
      })
      .eq('id', assessmentId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar status da avaliação: ${error.message}`);
    }

    return data;
  }

  // Data Consent Management
  async createDataConsent(consent: DataConsentInput): Promise<DataConsentRecord> {
    const { data, error } = await this.supabase
      .from('data_consent_records')
      .insert([{
        client_id: consent.clientId,
        clinic_id: consent.clinicId,
        consent_type: consent.consentType,
        consent_version: consent.consentVersion,
        consent_document_url: consent.consentDocumentUrl,
        ip_address: consent.ipAddress,
        user_agent: consent.userAgent
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar registro de consentimento: ${error.message}`);
    }

    return data;
  }

  async getClientConsents(clientId: string, clinicId: string): Promise<DataConsentRecord[]> {
    const { data, error } = await this.supabase
      .from('data_consent_records')
      .select('*')
      .eq('client_id', clientId)
      .eq('clinic_id', clinicId)
      .order('consent_date', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar consentimentos do cliente: ${error.message}`);
    }

    return data || [];
  }

  async withdrawConsent(consentId: string, withdrawalReason?: string): Promise<DataConsentRecord> {
    const { data, error } = await this.supabase
      .from('data_consent_records')
      .update({
        is_active: false,
        withdrawal_date: new Date().toISOString(),
        withdrawal_reason: withdrawalReason,
        updated_at: new Date().toISOString()
      })
      .eq('id', consentId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao revogar consentimento: ${error.message}`);
    }

    return data;
  }

  // Data Subject Rights Management
  async createDataSubjectRequest(request: DataSubjectRequestInput): Promise<DataSubjectRequest> {
    const resolutionDeadline = new Date();
    resolutionDeadline.setDate(resolutionDeadline.getDate() + 15); // 15 days as per LGPD

    const { data, error } = await this.supabase
      .from('data_subject_requests')
      .insert([{
        client_id: request.clientId,
        clinic_id: request.clinicId,
        request_type: request.requestType,
        request_description: request.requestDescription,
        requested_data: request.requestedData || [],
        resolution_deadline: resolutionDeadline.toISOString()
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar solicitação de titular: ${error.message}`);
    }

    return data;
  }

  async getDataSubjectRequests(clinicId: string, status?: string): Promise<DataSubjectRequest[]> {
    let query = this.supabase
      .from('data_subject_requests')
      .select(`
        *,
        client:clients (
          id,
          name,
          email
        ),
        processor:professionals (
          id,
          name,
          professional_type
        )
      `)
      .eq('clinic_id', clinicId);

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar solicitações de titulares: ${error.message}`);
    }

    return data || [];
  }

  async processDataSubjectRequest(
    requestId: string, 
    status: string, 
    responseText?: string, 
    processedBy?: string
  ): Promise<DataSubjectRequest> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (processedBy) {
      updateData.processed_by = processedBy;
    }

    if (responseText) {
      updateData.response_text = responseText;
    }

    if (status === 'completed' || status === 'rejected') {
      updateData.processed_at = new Date().toISOString();
    }

    const { data, error } = await this.supabase
      .from('data_subject_requests')
      .update(updateData)
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao processar solicitação de titular: ${error.message}`);
    }

    return data;
  }

  // Data Breach Management
  async createDataBreachIncident(breach: DataBreachInput): Promise<DataBreachIncident> {
    const { data, error } = await this.supabase
      .from('data_breach_incidents')
      .insert([{
        clinic_id: breach.clinicId,
        breach_type: breach.breachType,
        severity_level: breach.severityLevel,
        description: breach.description,
        affected_data_types: breach.affectedDataTypes || [],
        affected_clients_count: breach.affectedClientsCount,
        reported_by: breach.reportedBy
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar incidente de vazamento de dados: ${error.message}`);
    }

    // Log the breach creation
    await this.logComplianceAction({
      clinicId: breach.clinicId,
      actionType: 'breach_reported',
      actionDescription: `Novo incidente de vazamento de dados reportado: ${breach.breachType}`,
      performedBy: breach.reportedBy,
      affectedRecordId: data.id,
      affectedRecordType: 'data_breach_incident',
      newValues: { breach_type: breach.breachType, severity_level: breach.severityLevel }
    });

    return data;
  }

  async getDataBreachIncidents(clinicId: string): Promise<DataBreachIncident[]> {
    const { data, error } = await this.supabase
      .from('data_breach_incidents')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('discovery_date', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar incidentes de vazamento: ${error.message}`);
    }

    return data || [];
  }

  async updateDataBreachIncident(
    incidentId: string, 
    updates: Partial<DataBreachIncident>
  ): Promise<DataBreachIncident> {
    const { data, error } = await this.supabase
      .from('data_breach_incidents')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', incidentId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar incidente de vazamento: ${error.message}`);
    }

    return data;
  }

  // ANVISA Compliance Management
  async updateAnvisaCompliance(
    productId: string, 
    complianceData: Partial<AnvisaProductCompliance>
  ): Promise<AnvisaProductCompliance> {
    const { data, error } = await this.supabase
      .from('anvisa_product_compliance')
      .upsert([{
        product_id: productId,
        ...complianceData,
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar compliance ANVISA: ${error.message}`);
    }

    return data;
  }

  async getAnvisaComplianceStatus(clinicId: string): Promise<AnvisaProductCompliance[]> {
    const { data, error } = await this.supabase
      .from('anvisa_product_compliance')
      .select(`
        *,
        product:products (
          id,
          name,
          sku,
          anvisa_registration
        )
      `)
      .in('product_id', (
        this.supabase
          .from('products')
          .select('id')
          .eq('clinic_id', clinicId)
      ))
      .order('expiry_date', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar status ANVISA: ${error.message}`);
    }

    return data || [];
  }

  // Professional License Compliance
  async updateProfessionalLicenseCompliance(
    professionalId: string, 
    complianceData: Partial<ProfessionalLicenseCompliance>
  ): Promise<ProfessionalLicenseCompliance> {
    const { data, error } = await this.supabase
      .from('professional_license_compliance')
      .upsert([{
        professional_id: professionalId,
        ...complianceData,
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar compliance de licença: ${error.message}`);
    }

    return data;
  }

  async getProfessionalLicenseCompliance(clinicId: string): Promise<ProfessionalLicenseCompliance[]> {
    const { data, error } = await this.supabase
      .from('professional_license_compliance')
      .select(`
        *,
        professional:professionals (
          id,
          name,
          professional_type,
          license_number
        )
      `)
      .in('professional_id', (
        this.supabase
          .from('professionals')
          .select('id')
          .eq('clinic_id', clinicId)
      ))
      .order('expiry_date', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar compliance de licenças: ${error.message}`);
    }

    return data || [];
  }

  // Compliance Reports
  async generateComplianceReport(report: ComplianceReportInput): Promise<ComplianceReport> {
    const { data, error } = await this.supabase
      .from('compliance_reports')
      .insert([{
        clinic_id: report.clinicId,
        report_type: report.reportType,
        report_period_start: report.reportPeriodStart,
        report_period_end: report.reportPeriodEnd,
        status: 'generating',
        generated_by: report.generatedBy
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar relatório de compliance: ${error.message}`);
    }

    // Generate the report data asynchronously
    this.generateReportData(data.id).catch(error => {
      logHealthcareError('compliance', error, { method: 'generateReportDataAsync', reportId: data.id });
    });

    return data;
  }

  private async generateReportData(reportId: string): Promise<void> {
    try {
      // Get report details
      const { data: report, error: reportError } = await this.supabase
        .from('compliance_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (reportError) throw reportError;

      let reportData: any = {};

      switch (report.report_type) {
        case 'lgpd_summary':
          reportData = await this.generateLGPDReport(report.clinic_id, report.report_period_start, report.report_period_end);
          break;
        case 'anvisa_compliance':
          reportData = await this.generateANVISAReport(report.clinic_id);
          break;
        case 'license_status':
          reportData = await this.generateLicenseStatusReport(report.clinic_id);
          break;
        case 'assessment_summary':
          reportData = await this.generateAssessmentSummaryReport(report.clinic_id, report.report_period_start, report.report_period_end);
          break;
      }

      // Update the report with generated data
      const { error: updateError } = await this.supabase
        .from('compliance_reports')
        .update({
          report_data: reportData,
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (updateError) throw updateError;

    } catch (error) {
      logHealthcareError('compliance', error, { method: 'generateReportData', reportId });
      
      // Mark report as failed
      await this.supabase
        .from('compliance_reports')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);
    }
  }

  private async generateLGPDReport(clinicId: string, startDate: string, endDate: string): Promise<any> {
    const [consentRecords, subjectRequests, breachIncidents] = await Promise.all([
      this.getClientConsentsByDateRange(clinicId, startDate, endDate),
      this.getDataSubjectRequestsByDateRange(clinicId, startDate, endDate),
      this.getDataBreachIncidentsByDateRange(clinicId, startDate, endDate)
    ]);

    return {
      consentSummary: {
        total: consentRecords.length,
        active: consentRecords.filter(c => c.is_active).length,
        expired: consentRecords.filter(c => !c.is_active).length,
        byType: this.groupByType(consentRecords, 'consent_type')
      },
      subjectRequests: {
        total: subjectRequests.length,
        byStatus: this.groupByType(subjectRequests, 'status'),
        byType: this.groupByType(subjectRequests, 'request_type'),
        averageResolutionTime: this.calculateAverageResolutionTime(subjectRequests)
      },
      breachIncidents: {
        total: breachIncidents.length,
        bySeverity: this.groupByType(breachIncidents, 'severity_level'),
        byType: this.groupByType(breachIncidents, 'breach_type'),
        averageResolutionTime: this.calculateBreachResolutionTime(breachIncidents)
      },
      generatedAt: new Date().toISOString()
    };
  }

  private async generateANVISAReport(clinicId: string): Promise<any> {
    const anvisaCompliance = await this.getAnvisaComplianceStatus(clinicId);
    
    return {
      productSummary: {
        total: anvisaCompliance.length,
        active: anvisaCompliance.filter(a => a.registration_status === 'active').length,
        expired: anvisaCompliance.filter(a => a.registration_status === 'expired').length,
        expiringSoon: anvisaCompliance.filter(a => {
          const daysUntilExpiry = Math.ceil((new Date(a.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
        }).length
      },
      productsByStatus: this.groupByType(anvisaCompliance, 'registration_status'),
      generatedAt: new Date().toISOString()
    };
  }

  private async generateLicenseStatusReport(clinicId: string): Promise<any> {
    const licenseCompliance = await this.getProfessionalLicenseCompliance(clinicId);
    
    return {
      licenseSummary: {
        total: licenseCompliance.length,
        active: licenseCompliance.filter(l => l.license_status === 'active').length,
        expired: licenseCompliance.filter(l => l.license_status === 'expired').length,
        expiringSoon: licenseCompliance.filter(l => {
          const daysUntilExpiry = Math.ceil((new Date(l.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
        }).length,
        verified: licenseCompliance.filter(l => l.is_verified).length
      },
      licensesByType: this.groupByType(licenseCompliance, 'license_type'),
      licensesByStatus: this.groupByType(licenseCompliance, 'license_status'),
      generatedAt: new Date().toISOString()
    };
  }

  private async generateAssessmentSummaryReport(clinicId: string, startDate: string, endDate: string): Promise<any> {
    const assessments = await this.getComplianceAssessmentsByDateRange(clinicId, startDate, endDate);
    
    return {
      assessmentSummary: {
        total: assessments.length,
        byStatus: this.groupByType(assessments, 'status'),
        byType: this.groupByType(assessments, 'assessment_type'),
        averageScore: assessments.reduce((sum, a) => sum + (a.score || 0), 0) / assessments.length || 0,
        passRate: assessments.filter(a => a.status === 'passed').length / assessments.length * 100
      },
      generatedAt: new Date().toISOString()
    };
  }

  // Compliance Alerts
  async getComplianceAlerts(clinicId: string, unresolvedOnly: boolean = false): Promise<ComplianceAlert[]> {
    let query = this.supabase
      .from('compliance_alerts')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });

    if (unresolvedOnly) {
      query = query.eq('is_resolved', false);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar alertas de compliance: ${error.message}`);
    }

    return data || [];
  }

  async createComplianceAlert(alert: ComplianceAlertInput): Promise<ComplianceAlert> {
    const { data, error } = await this.supabase
      .from('compliance_alerts')
      .insert([{
        clinic_id: alert.clinicId,
        alert_type: alert.alertType,
        severity_level: alert.severityLevel,
        title: alert.title,
        description: alert.description,
        reference_id: alert.referenceId,
        reference_type: alert.referenceType
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar alerta de compliance: ${error.message}`);
    }

    return data;
  }

  async resolveAlert(alertId: string, resolvedBy: string, resolutionNotes?: string): Promise<ComplianceAlert> {
    const { data, error } = await this.supabase
      .from('compliance_alerts')
      .update({
        is_resolved: true,
        resolved_by: resolvedBy,
        resolution_notes: resolutionNotes,
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', alertId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao resolver alerta de compliance: ${error.message}`);
    }

    return data;
  }

  // Automated Compliance Checks
  async runAutomatedComplianceChecks(clinicId: string): Promise<void> {
    try {
      // Check for license expiry alerts
      await this.checkLicenseExpiryAlerts(clinicId);
      
      // Check for ANVISA compliance alerts
      await this.checkANVISAComplianceAlerts(clinicId);
      
      // Check for consent expiry alerts
      await this.checkConsentExpiryAlerts(clinicId);
      
      // Generate automated assessments for scheduled requirements
      await this.generateScheduledAssessments(clinicId);
      
    } catch (error) {
      logHealthcareError('compliance', error, { method: 'runAutomatedComplianceChecks', clinicId });
    }
  }

  private async checkLicenseExpiryAlerts(clinicId: string): Promise<void> {
    const { data: expiringLicenses, error } = await this.supabase
      .rpc('check_license_expiry');

    if (error) {
      logHealthcareError('compliance', error, { method: 'checkLicenseExpiryAlerts', clinicId });
      return;
    }

    for (const license of expiringLicenses || []) {
      if (license.clinic_id === clinicId && license.days_until_expiry <= 30) {
        await this.createComplianceAlert({
          clinicId,
          alertType: 'license_expiry',
          severityLevel: this.getSeverityLevel(license.days_until_expiry),
          title: 'Licença Profissional Próxima do Vencimento',
          description: `Licença ${license.license_type} vence em ${license.days_until_expiry} dias`,
          referenceId: license.professional_id,
          referenceType: 'professional'
        });
      }
    }
  }

  private async checkANVISAComplianceAlerts(clinicId: string): Promise<void> {
    const { data: expiringProducts, error } = await this.supabase
      .rpc('check_anvisa_compliance');

    if (error) {
      logHealthcareError('compliance', error, { method: 'checkANVISAComplianceAlerts', clinicId });
      return;
    }

    for (const product of expiringProducts || []) {
      if (product.clinic_id === clinicId && product.days_until_expiry <= 30) {
        await this.createComplianceAlert({
          clinicId,
          alertType: 'license_expiry',
          severityLevel: this.getSeverityLevel(product.days_until_expiry),
          title: 'Registro ANVISA Próximo do Vencimento',
          description: `Registro ANVISA vence em ${product.days_until_expiry} dias`,
          referenceId: product.product_id,
          referenceType: 'product'
        });
      }
    }
  }

  private async checkConsentExpiryAlerts(clinicId: string): Promise<void> {
    const { data: expiringConsents, error } = await this.supabase
      .rpc('check_consent_expiry');

    if (error) {
      logHealthcareError('compliance', error, { method: 'checkConsentExpiryAlerts', clinicId });
      return;
    }

    for (const consent of expiringConsents || []) {
      if (consent.clinic_id === clinicId && consent.days_until_expiry <= 30) {
        await this.createComplianceAlert({
          clinicId,
          alertType: 'consent_expiry',
          severityLevel: 'medium',
          title: 'Consentimento Próximo do Vencimento',
          description: `Consentimento ${consent.consent_type} vence em ${consent.days_until_expiry} dias`,
          referenceId: consent.client_id,
          referenceType: 'consent'
        });
      }
    }
  }

  private async generateScheduledAssessments(clinicId: string): Promise<void> {
    const requirements = await this.getComplianceRequirements();
    
    for (const requirement of requirements) {
      if (requirement.frequency === 'monthly') {
        // Check if assessment already exists for this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const existingAssessment = await this.getComplianceAssessments(clinicId);
        const monthlyAssessment = existingAssessment.find(a => 
          a.requirement_id === requirement.id && 
          new Date(a.assessment_date) >= startOfMonth
        );

        if (!monthlyAssessment) {
          await this.createComplianceAssessment({
            requirementId: requirement.id,
            clinicId,
            assessmentType: 'automated',
            findings: ['Avaliação automática mensal gerada'],
            recommendations: ['Realizar verificação manual completa']
          });
        }
      }
    }
  }

  // Audit Trail
  private async logComplianceAction(action: {
    clinicId: string;
    actionType: string;
    actionDescription: string;
    performedBy?: string;
    performedAsClient?: string;
    affectedRecordId?: string;
    affectedRecordType?: string;
    oldValues?: any;
    newValues?: any;
  }): Promise<void> {
    const { error } = await this.supabase
      .from('compliance_audit_trail')
      .insert([{
        clinic_id: action.clinicId,
        action_type: action.actionType,
        action_description: action.actionDescription,
        performed_by: action.performedBy,
        performed_as_client: action.performedAsClient,
        affected_record_id: action.affectedRecordId,
        affected_record_type: action.affectedRecordType,
        old_values: action.oldValues,
        new_values: action.newValues
      }]);

    if (error) {
      logHealthcareError('compliance', error, { method: 'logComplianceAction', actionType: action.actionType });
    }
  }

  // Helper methods
  private groupByType<T>(items: T[], typeKey: keyof T): Record<string, number> {
    return items.reduce((acc, item) => {
      const key = String(item[typeKey]);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private calculateAverageResolutionTime(requests: DataSubjectRequest[]): number {
    const resolvedRequests = requests.filter(r => r.processed_at && r.created_at);
    if (resolvedRequests.length === 0) return 0;

    const totalTime = resolvedRequests.reduce((sum, request) => {
      const processed = new Date(request.processed_at!).getTime();
      const created = new Date(request.created_at).getTime();
      return sum + (processed - created);
    }, 0);

    return totalTime / resolvedRequests.length / (1000 * 60 * 60 * 24); // Convert to days
  }

  private calculateBreachResolutionTime(breaches: DataBreachIncident[]): number {
    const resolvedBreaches = breaches.filter(b => b.resolution_date && b.discovery_date);
    if (resolvedBreaches.length === 0) return 0;

    const totalTime = resolvedBreaches.reduce((sum, breach) => {
      const resolved = new Date(breach.resolution_date!).getTime();
      const discovered = new Date(breach.discovery_date).getTime();
      return sum + (resolved - discovered);
    }, 0);

    return totalTime / resolvedBreaches.length / (1000 * 60 * 60 * 24); // Convert to days
  }

  private getSeverityLevel(daysUntilExpiry: number): string {
    if (daysUntilExpiry <= 7) return 'critical';
    if (daysUntilExpiry <= 15) return 'high';
    if (daysUntilExpiry <= 30) return 'medium';
    return 'low';
  }

  // Helper methods for report generation
  private async getClientConsentsByDateRange(clinicId: string, startDate: string, endDate: string): Promise<DataConsentRecord[]> {
    const { data, error } = await this.supabase
      .from('data_consent_records')
      .select('*')
      .eq('clinic_id', clinicId)
      .gte('consent_date', startDate)
      .lte('consent_date', endDate);

    if (error) throw error;
    return data || [];
  }

  private async getDataSubjectRequestsByDateRange(clinicId: string, startDate: string, endDate: string): Promise<DataSubjectRequest[]> {
    const { data, error } = await this.supabase
      .from('data_subject_requests')
      .select('*')
      .eq('clinic_id', clinicId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) throw error;
    return data || [];
  }

  private async getDataBreachIncidentsByDateRange(clinicId: string, startDate: string, endDate: string): Promise<DataBreachIncident[]> {
    const { data, error } = await this.supabase
      .from('data_breach_incidents')
      .select('*')
      .eq('clinic_id', clinicId)
      .gte('discovery_date', startDate)
      .lte('discovery_date', endDate);

    if (error) throw error;
    return data || [];
  }

  private async getComplianceAssessmentsByDateRange(clinicId: string, startDate: string, endDate: string): Promise<ComplianceAssessment[]> {
    const { data, error } = await this.supabase
      .from('compliance_assessments')
      .select('*')
      .eq('clinic_id', clinicId)
      .gte('assessment_date', startDate)
      .lte('assessment_date', endDate);

    if (error) throw error;
    return data || [];
  }

  // Data Retention Management
  async processScheduledDataRetention(clinicId?: string): Promise<void> {
    const { data: policies, error } = await this.supabase
      .from('retention_policies')
      .select('*')
      .eq('is_active', true);

    if (error) {
      logHealthcareError('compliance', error, { method: 'processScheduledDataRetention', clinicId });
      return;
    }

    for (const policy of policies) {
      try {
        // Create a retention job
        const { data: job, error: jobError } = await this.supabase
          .from('data_retention_jobs')
          .insert([{
            policy_id: policy.id,
            clinic_id: clinicId,
            job_status: 'processing',
            scheduled_date: new Date().toISOString()
          }])
          .select()
          .single();

        if (jobError) {
          logHealthcareError('compliance', jobError, { method: 'processScheduledDataRetention', policyId: policy.id, clinicId });
          continue;
        }

        // Process the retention policy
        await this.executeRetentionPolicy(policy, clinicId, job.id);

      } catch (error) {
        logHealthcareError('compliance', error, { method: 'processScheduledDataRetention', policyId: policy.id, clinicId });
      }
    }
  }

  private async executeRetentionPolicy(policy: RetentionPolicy, clinicId?: string, jobId?: string): Promise<void> {
    try {
      let processedRecords = 0;
      let deletedRecords = 0;

      // Execute retention logic based on policy type
      if (policy.retention_rule === 'fixed') {
        // Process fixed retention periods
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - policy.retention_period_months);

        switch (policy.document_type) {
          case 'consent_forms':
            // Archive expired consent forms
            const { error: consentError } = await this.supabase
              .from('data_consent_records')
              .update({ is_active: false })
              .lt('consent_date', cutoffDate.toISOString())
              .eq('clinic_id', clinicId);

            if (consentError) throw consentError;
            
            processedRecords = 1; // Placeholder
            deletedRecords = 1; // Placeholder
            break;
        }
      }

      // Update the job record
      if (jobId) {
        await this.supabase
          .from('data_retention_jobs')
          .update({
            job_status: 'completed',
            processed_records,
            deleted_records,
            completed_at: new Date().toISOString()
          })
          .eq('id', jobId);
      }

    } catch (error) {
      logHealthcareError('compliance', error, { method: 'executeRetentionPolicy', policyId: policy.id, clinicId, jobId });
      
      if (jobId) {
        await this.supabase
          .from('data_retention_jobs')
          .update({
            job_status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error'
          })
          .eq('id', jobId);
      }
    }
  }
}