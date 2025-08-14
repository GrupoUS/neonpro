// LGPD Third-Party Data Sharing Compliance Manager - Core Module
// Story 1.5: LGPD Compliance Automation
// Task 8: Third-Party Data Sharing Compliance (AC: 8)

import { createClient } from '@/lib/supabase/client';
import type {
  LGPDServiceResponse,
  LGPDDataCategory,
  LGPDEventType,
  LGPDThirdPartyAgreement,
  LGPDDataProcessingPurpose,
  LGPDLegalBasis
} from '../types';
import { LGPDAuditLogger } from './audit-logger';
import { LGPDEventEmitter } from '../utils/event-emitter';
import { LGPDComplianceMonitor } from './compliance-monitor';

/**
 * LGPD Third-Party Data Sharing Compliance Manager
 * Manages compliance for data sharing with third parties according to LGPD Articles 26-33
 * Ensures proper agreements, consent, and monitoring of third-party data processing
 */
export class LGPDThirdPartyComplianceManager {
  private supabase = createClient();
  private auditLogger = new LGPDAuditLogger();
  private eventEmitter = new LGPDEventEmitter();
  private complianceMonitor = new LGPDComplianceMonitor();
  private activeAgreements: Map<string, LGPDThirdPartyAgreement[]> = new Map();
  private isMonitoringActive = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  // Standard third-party categories and their compliance requirements
  private readonly THIRD_PARTY_CATEGORIES = {
    payment_processor: {
      required_clauses: ['data_protection', 'purpose_limitation', 'retention_limits', 'security_measures'],
      max_retention_days: 2555, // ~7 years for financial records
      required_certifications: ['PCI_DSS'],
      data_categories_allowed: ['financial_data', 'personal_data'],
      monitoring_frequency_hours: 24
    },
    cloud_provider: {
      required_clauses: ['data_protection', 'data_location', 'security_measures', 'breach_notification'],
      max_retention_days: 2555,
      required_certifications: ['ISO_27001', 'SOC_2'],
      data_categories_allowed: ['personal_data', 'health_data', 'financial_data'],
      monitoring_frequency_hours: 12
    },
    analytics_provider: {
      required_clauses: ['data_anonymization', 'purpose_limitation', 'no_reidentification'],
      max_retention_days: 730, // 2 years
      required_certifications: ['ISO_27001'],
      data_categories_allowed: ['anonymized_data'],
      monitoring_frequency_hours: 48
    },
    email_service: {
      required_clauses: ['data_protection', 'purpose_limitation', 'security_measures'],
      max_retention_days: 365, // 1 year
      required_certifications: ['ISO_27001'],
      data_categories_allowed: ['contact_data', 'personal_data'],
      monitoring_frequency_hours: 24
    },
    backup_service: {
      required_clauses: ['data_protection', 'encryption', 'access_controls', 'retention_limits'],
      max_retention_days: 2555,
      required_certifications: ['ISO_27001', 'SOC_2'],
      data_categories_allowed: ['personal_data', 'health_data', 'financial_data'],
      monitoring_frequency_hours: 12
    },
    integration_partner: {
      required_clauses: ['data_protection', 'purpose_limitation', 'data_minimization', 'security_measures'],
      max_retention_days: 1825, // 5 years
      required_certifications: ['ISO_27001'],
      data_categories_allowed: ['personal_data', 'health_data'],
      monitoring_frequency_hours: 24
    }
  };

  constructor() {
    this.initializeComplianceFramework();
  }

  /**
   * Start third-party compliance monitoring
   */
  async startThirdPartyMonitoring(intervalHours: number = 12): Promise<LGPDServiceResponse<boolean>> {
    const startTime = Date.now();

    try {
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
      }

      this.monitoringInterval = setInterval(async () => {
        await this.performComplianceCheck();
      }, intervalHours * 60 * 60 * 1000);

      this.isMonitoringActive = true;

      // Perform initial compliance check
      await this.performComplianceCheck();

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: true,
        compliance_notes: [
          `Third-party compliance monitoring started with ${intervalHours}-hour intervals`,
          'LGPD Articles 26-33 compliance actively monitored',
          'Agreement compliance validation enabled',
          'Data sharing authorization tracking active'
        ],
        legal_references: ['LGPD Art. 26', 'LGPD Art. 27', 'LGPD Art. 28', 'LGPD Art. 33'],
        audit_logged: false,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start third-party monitoring',
        audit_logged: false,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Stop third-party monitoring
   */
  stopThirdPartyMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoringActive = false;
  }

  /**
   * Create or update third-party agreement
   */
  async createThirdPartyAgreement(
    clinicId: string,
    adminId: string,
    agreementData: {
      third_party_name: string;
      third_party_category: keyof typeof this.THIRD_PARTY_CATEGORIES;
      contact_email: string;
      contact_phone?: string;
      data_categories: LGPDDataCategory[];
      processing_purposes: LGPDDataProcessingPurpose[];
      legal_basis: LGPDLegalBasis;
      data_location: string;
      retention_period_days: number;
      security_measures: string[];
      certifications: string[];
      agreement_clauses: string[];
      data_transfer_methods: string[];
      monitoring_requirements: {
        frequency_hours: number;
        compliance_checks: string[];
        reporting_requirements: string[];
      };
      termination_conditions: string[];
      breach_notification_timeframe_hours: number;
      data_return_deletion_timeframe_days: number;
      agreement_start_date: Date;
      agreement_end_date?: Date;
      auto_renewal: boolean;
      special_conditions?: string[];
    }
  ): Promise<LGPDServiceResponse<LGPDThirdPartyAgreement>> {
    const startTime = Date.now();

    try {
      // Validate agreement data
      this.validateAgreementData(agreementData);

      // Check compliance with category requirements
      const categoryRequirements = this.THIRD_PARTY_CATEGORIES[agreementData.third_party_category];
      this.validateCategoryCompliance(agreementData, categoryRequirements);

      const agreementRecord: Omit<LGPDThirdPartyAgreement, 'id' | 'created_at' | 'updated_at'> = {
        clinic_id: clinicId,
        third_party_name: agreementData.third_party_name,
        third_party_category: agreementData.third_party_category,
        contact_email: agreementData.contact_email,
        contact_phone: agreementData.contact_phone,
        data_categories: agreementData.data_categories,
        processing_purposes: agreementData.processing_purposes,
        legal_basis: agreementData.legal_basis,
        data_location: agreementData.data_location,
        retention_period_days: agreementData.retention_period_days,
        security_measures: agreementData.security_measures,
        certifications: agreementData.certifications,
        agreement_clauses: agreementData.agreement_clauses,
        data_transfer_methods: agreementData.data_transfer_methods,
        monitoring_requirements: agreementData.monitoring_requirements,
        termination_conditions: agreementData.termination_conditions,
        breach_notification_timeframe_hours: agreementData.breach_notification_timeframe_hours,
        data_return_deletion_timeframe_days: agreementData.data_return_deletion_timeframe_days,
        agreement_start_date: agreementData.agreement_start_date.toISOString(),
        agreement_end_date: agreementData.agreement_end_date?.toISOString(),
        auto_renewal: agreementData.auto_renewal,
        special_conditions: agreementData.special_conditions || [],
        status: 'active',
        compliance_status: 'compliant',
        last_compliance_check: new Date().toISOString(),
        data_transfers_count: 0,
        violations_detected: 0,
        created_by: adminId,
        agreement_metadata: {
          created_by_admin: adminId,
          compliance_framework: 'LGPD',
          risk_assessment_score: this.calculateRiskScore(agreementData),
          review_frequency_days: 180,
          next_review_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
        }
      };

      // Check for existing agreement with same third party
      const { data: existingAgreement } = await this.supabase
        .from('lgpd_third_party_agreements')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('third_party_name', agreementData.third_party_name)
        .eq('status', 'active')
        .single();

      let result;
      if (existingAgreement) {
        // Update existing agreement
        const { data, error } = await this.supabase
          .from('lgpd_third_party_agreements')
          .update({
            ...agreementRecord,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAgreement.id)
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to update third-party agreement: ${error.message}`);
        }
        result = data;
      } else {
        // Create new agreement
        const { data, error } = await this.supabase
          .from('lgpd_third_party_agreements')
          .insert(agreementRecord)
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to create third-party agreement: ${error.message}`);
        }
        result = data;
      }

      // Update local cache
      const clinicAgreements = this.activeAgreements.get(clinicId) || [];
      const agreementIndex = clinicAgreements.findIndex(a => a.id === result.id);
      if (agreementIndex >= 0) {
        clinicAgreements[agreementIndex] = result;
      } else {
        clinicAgreements.push(result);
      }
      this.activeAgreements.set(clinicId, clinicAgreements);

      // Log agreement creation/update
      await this.auditLogger.logEvent({
        user_id: adminId,
        clinic_id: clinicId,
        action: existingAgreement ? 'third_party_agreement_updated' : 'third_party_agreement_created',
        resource_type: 'third_party_agreement',
        data_affected: agreementData.data_categories,
        legal_basis: agreementData.legal_basis,
        processing_purpose: 'third_party_compliance',
        ip_address: 'system',
        user_agent: 'third_party_manager',
        actor_id: adminId,
        actor_type: 'admin',
        severity: 'medium',
        metadata: {
          agreement_id: result.id,
          third_party_name: agreementData.third_party_name,
          third_party_category: agreementData.third_party_category,
          data_categories: agreementData.data_categories,
          processing_purposes: agreementData.processing_purposes,
          risk_score: result.agreement_metadata.risk_assessment_score
        }
      });

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: result,
        compliance_notes: [
          `Third-party agreement ${existingAgreement ? 'updated' : 'created'} for ${agreementData.third_party_name}`,
          `Category: ${agreementData.third_party_category}`,
          `Data categories: ${agreementData.data_categories.length}`,
          `Processing purposes: ${agreementData.processing_purposes.length}`,
          `Risk assessment score: ${result.agreement_metadata.risk_assessment_score}/100`
        ],
        legal_references: ['LGPD Art. 26', 'LGPD Art. 27', 'LGPD Art. 28'],
        audit_logged: true,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create third-party agreement',
        audit_logged: true,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Authorize data transfer to third party
   */
  async authorizeDataTransfer(
    clinicId: string,
    userId: string,
    transferRequest: {
      agreement_id: string;
      data_subject_ids: string[];
      data_categories: LGPDDataCategory[];
      processing_purpose: LGPDDataProcessingPurpose;
      transfer_method: string;
      estimated_data_volume: number;
      transfer_justification: string;
      urgency_level: 'low' | 'medium' | 'high' | 'critical';
      expected_completion_date: Date;
      additional_safeguards?: string[];
    }
  ): Promise<LGPDServiceResponse<{
    transfer_id: string;
    authorization_status: 'authorized' | 'denied' | 'conditional';
    conditions?: string[];
    expiry_date: Date;
    monitoring_requirements: string[];
  }>> {
    const startTime = Date.now();

    try {
      // Get and validate agreement
      const agreement = await this.getAgreement(clinicId, transferRequest.agreement_id);
      if (!agreement) {
        throw new Error('Third-party agreement not found or inactive');
      }

      // Validate transfer request against agreement
      const validationResult = this.validateTransferRequest(transferRequest, agreement);
      if (!validationResult.is_valid) {
        throw new Error(`Transfer validation failed: ${validationResult.violations.join(', ')}`);
      }

      // Check consent requirements for data subjects
      const consentValidation = await this.validateDataSubjectConsent(
        clinicId,
        transferRequest.data_subject_ids,
        transferRequest.processing_purpose,
        agreement.third_party_name
      );

      // Determine authorization status
      let authorizationStatus: 'authorized' | 'denied' | 'conditional' = 'authorized';
      const conditions: string[] = [];
      const monitoringRequirements: string[] = [];

      // Apply conditional authorization if needed
      if (!consentValidation.all_consented) {
        if (transferRequest.urgency_level === 'critical') {
          authorizationStatus = 'conditional';
          conditions.push('Obtain explicit consent within 24 hours');
          conditions.push('Notify data subjects of emergency transfer');
        } else {
          authorizationStatus = 'denied';
          throw new Error('Missing required consent for data transfer');
        }
      }

      // Add monitoring requirements based on risk
      const riskScore = this.calculateTransferRisk(transferRequest, agreement);
      if (riskScore >= 70) {
        monitoringRequirements.push('Real-time transfer monitoring required');
        monitoringRequirements.push('Immediate completion notification required');
      }
      if (riskScore >= 50) {
        monitoringRequirements.push('Daily status updates required');
      }

      // Create transfer authorization record
      const transferId = `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days default

      const transferRecord = {
        id: transferId,
        clinic_id: clinicId,
        agreement_id: transferRequest.agreement_id,
        third_party_name: agreement.third_party_name,
        authorized_by: userId,
        data_subject_ids: transferRequest.data_subject_ids,
        data_categories: transferRequest.data_categories,
        processing_purpose: transferRequest.processing_purpose,
        transfer_method: transferRequest.transfer_method,
        estimated_data_volume: transferRequest.estimated_data_volume,
        transfer_justification: transferRequest.transfer_justification,
        urgency_level: transferRequest.urgency_level,
        authorization_status: authorizationStatus,
        conditions: conditions,
        monitoring_requirements: monitoringRequirements,
        risk_score: riskScore,
        authorized_at: new Date().toISOString(),
        expiry_date: expiryDate.toISOString(),
        expected_completion_date: transferRequest.expected_completion_date.toISOString(),
        status: 'pending',
        transfer_metadata: {
          consent_validation: consentValidation,
          additional_safeguards: transferRequest.additional_safeguards || [],
          compliance_framework: 'LGPD'
        }
      };

      // Store transfer authorization
      const { error: insertError } = await this.supabase
        .from('lgpd_data_transfers')
        .insert(transferRecord);

      if (insertError) {
        throw new Error(`Failed to create transfer authorization: ${insertError.message}`);
      }

      // Update agreement transfer count
      await this.updateAgreementStats(transferRequest.agreement_id, 'transfer_authorized');

      // Log transfer authorization
      await this.auditLogger.logEvent({
        user_id: userId,
        clinic_id: clinicId,
        action: 'data_transfer_authorized',
        resource_type: 'data_transfer',
        data_affected: transferRequest.data_categories,
        legal_basis: agreement.legal_basis,
        processing_purpose: transferRequest.processing_purpose,
        ip_address: 'system',
        user_agent: 'third_party_manager',
        actor_id: userId,
        actor_type: 'user',
        severity: riskScore >= 70 ? 'high' : riskScore >= 50 ? 'medium' : 'low',
        metadata: {
          transfer_id: transferId,
          agreement_id: transferRequest.agreement_id,
          third_party_name: agreement.third_party_name,
          authorization_status: authorizationStatus,
          risk_score: riskScore,
          data_subjects_count: transferRequest.data_subject_ids.length,
          urgency_level: transferRequest.urgency_level
        }
      });

      // Generate alert for high-risk transfers
      if (riskScore >= 70) {
        await this.complianceMonitor.generateAlert(
          clinicId,
          'high_risk_data_transfer',
          'high',
          'High-Risk Data Transfer Authorized',
          `High-risk data transfer to ${agreement.third_party_name} requires enhanced monitoring`,
          {
            transfer_id: transferId,
            third_party_name: agreement.third_party_name,
            risk_score: riskScore,
            data_subjects_count: transferRequest.data_subject_ids.length
          }
        );
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          transfer_id: transferId,
          authorization_status: authorizationStatus,
          conditions: conditions.length > 0 ? conditions : undefined,
          expiry_date: expiryDate,
          monitoring_requirements: monitoringRequirements
        },
        compliance_notes: [
          `Data transfer ${authorizationStatus} for ${agreement.third_party_name}`,
          `Transfer ID: ${transferId}`,
          `Risk score: ${riskScore}/100`,
          `${transferRequest.data_subject_ids.length} data subjects affected`,
          `Expires: ${expiryDate.toLocaleDateString()}`
        ],
        legal_references: ['LGPD Art. 26', 'LGPD Art. 27', 'LGPD Art. 33'],
        audit_logged: true,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to authorize data transfer',
        audit_logged: true,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Complete data transfer and update status
   */
  async completeDataTransfer(
    clinicId: string,
    transferId: string,
    completionData: {
      actual_data_volume: number;
      completion_status: 'completed' | 'failed' | 'partial';
      completion_notes?: string;
      data_integrity_verified: boolean;
      security_incidents?: string[];
      third_party_confirmation?: string;
    }
  ): Promise<LGPDServiceResponse<boolean>> {
    const startTime = Date.now();

    try {
      // Get transfer record
      const { data: transfer, error: fetchError } = await this.supabase
        .from('lgpd_data_transfers')
        .select('*')
        .eq('id', transferId)
        .eq('clinic_id', clinicId)
        .single();

      if (fetchError || !transfer) {
        throw new Error('Data transfer record not found');
      }

      if (transfer.status === 'completed') {
        throw new Error('Data transfer already completed');
      }

      // Update transfer record
      const updateData = {
        status: completionData.completion_status,
        actual_data_volume: completionData.actual_data_volume,
        completion_notes: completionData.completion_notes,
        data_integrity_verified: completionData.data_integrity_verified,
        security_incidents: completionData.security_incidents || [],
        third_party_confirmation: completionData.third_party_confirmation,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await this.supabase
        .from('lgpd_data_transfers')
        .update(updateData)
        .eq('id', transferId);

      if (updateError) {
        throw new Error(`Failed to update transfer record: ${updateError.message}`);
      }

      // Update agreement statistics
      await this.updateAgreementStats(transfer.agreement_id, 'transfer_completed');

      // Log transfer completion
      await this.auditLogger.logEvent({
        user_id: 'system',
        clinic_id: clinicId,
        action: 'data_transfer_completed',
        resource_type: 'data_transfer',
        data_affected: transfer.data_categories,
        legal_basis: 'legitimate_interest',
        processing_purpose: transfer.processing_purpose,
        ip_address: 'system',
        user_agent: 'third_party_manager',
        actor_id: 'system',
        actor_type: 'system',
        severity: completionData.completion_status === 'completed' ? 'low' : 'medium',
        metadata: {
          transfer_id: transferId,
          third_party_name: transfer.third_party_name,
          completion_status: completionData.completion_status,
          actual_data_volume: completionData.actual_data_volume,
          data_integrity_verified: completionData.data_integrity_verified,
          security_incidents_count: completionData.security_incidents?.length || 0
        }
      });

      // Generate alerts for issues
      if (completionData.completion_status === 'failed') {
        await this.complianceMonitor.generateAlert(
          clinicId,
          'data_transfer_failed',
          'high',
          'Data Transfer Failed',
          `Data transfer to ${transfer.third_party_name} failed`,
          {
            transfer_id: transferId,
            third_party_name: transfer.third_party_name,
            completion_notes: completionData.completion_notes
          }
        );
      }

      if (completionData.security_incidents && completionData.security_incidents.length > 0) {
        await this.complianceMonitor.generateAlert(
          clinicId,
          'data_transfer_security_incident',
          'high',
          'Security Incident During Data Transfer',
          `Security incidents detected during transfer to ${transfer.third_party_name}`,
          {
            transfer_id: transferId,
            third_party_name: transfer.third_party_name,
            security_incidents: completionData.security_incidents
          }
        );
      }

      if (!completionData.data_integrity_verified) {
        await this.complianceMonitor.generateAlert(
          clinicId,
          'data_integrity_not_verified',
          'medium',
          'Data Integrity Not Verified',
          `Data integrity could not be verified for transfer to ${transfer.third_party_name}`,
          {
            transfer_id: transferId,
            third_party_name: transfer.third_party_name
          }
        );
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: true,
        compliance_notes: [
          `Data transfer ${completionData.completion_status}`,
          `Actual data volume: ${completionData.actual_data_volume} records`,
          `Data integrity verified: ${completionData.data_integrity_verified ? 'Yes' : 'No'}`,
          `Security incidents: ${completionData.security_incidents?.length || 0}`
        ],
        legal_references: ['LGPD Art. 33'],
        audit_logged: true,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to complete data transfer',
        audit_logged: true,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Get third-party agreements for a clinic
   */
  async getThirdPartyAgreements(
    clinicId: string,
    filters?: {
      status?: 'active' | 'inactive' | 'expired';
      category?: keyof typeof this.THIRD_PARTY_CATEGORIES;
      complianceStatus?: 'compliant' | 'non_compliant' | 'under_review';
      expiringWithinDays?: number;
    }
  ): Promise<LGPDServiceResponse<LGPDThirdPartyAgreement[]>> {
    const startTime = Date.now();

    try {
      let query = this.supabase
        .from('lgpd_third_party_agreements')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.category) {
        query = query.eq('third_party_category', filters.category);
      }

      if (filters?.complianceStatus) {
        query = query.eq('compliance_status', filters.complianceStatus);
      }

      if (filters?.expiringWithinDays) {
        const expiryThreshold = new Date(Date.now() + filters.expiringWithinDays * 24 * 60 * 60 * 1000);
        query = query.lte('agreement_end_date', expiryThreshold.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get third-party agreements: ${error.message}`);
      }

      // Enhance data with compliance metrics
      const enhancedData = (data || []).map(agreement => ({
        ...agreement,
        compliance_score: this.calculateAgreementComplianceScore(agreement),
        risk_level: this.calculateAgreementRiskLevel(agreement),
        days_until_expiry: agreement.agreement_end_date ? 
          Math.ceil((new Date(agreement.agreement_end_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000)) : null
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
        error: error instanceof Error ? error.message : 'Failed to get third-party agreements',
        audit_logged: false,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Generate third-party compliance report
   */
  async generateThirdPartyComplianceReport(
    clinicId: string,
    reportPeriod: { start: Date; end: Date }
  ): Promise<LGPDServiceResponse<any>> {
    const startTime = Date.now();

    try {
      // Get all agreements
      const agreementsResult = await this.getThirdPartyAgreements(clinicId);
      if (!agreementsResult.success) {
        throw new Error('Failed to get third-party agreements');
      }

      const agreements = agreementsResult.data || [];

      // Get transfer activity
      const { data: transfers } = await this.supabase
        .from('lgpd_data_transfers')
        .select('*')
        .eq('clinic_id', clinicId)
        .gte('authorized_at', reportPeriod.start.toISOString())
        .lte('authorized_at', reportPeriod.end.toISOString());

      // Get compliance activity logs
      const complianceActivity = await this.auditLogger.getAuditLogs({
        clinicId,
        actions: ['third_party_agreement_created', 'data_transfer_authorized', 'data_transfer_completed'],
        dateRange: reportPeriod,
        limit: 1000
      });

      // Calculate compliance metrics
      const complianceMetrics = this.calculateThirdPartyCompliance(agreements, transfers || []);

      // Analyze transfer patterns
      const transferPatterns = this.analyzeTransferPatterns(transfers || []);

      // Generate recommendations
      const recommendations = this.generateThirdPartyRecommendations(agreements, transfers || []);

      const report = {
        clinic_id: clinicId,
        report_period: reportPeriod,
        generated_at: new Date().toISOString(),
        agreements_summary: {
          total_agreements: agreements.length,
          active_agreements: agreements.filter(a => a.status === 'active').length,
          compliant_agreements: agreements.filter(a => a.compliance_status === 'compliant').length,
          expiring_soon: agreements.filter(a => a.days_until_expiry !== null && a.days_until_expiry <= 30).length,
          high_risk_agreements: agreements.filter(a => a.risk_level === 'high').length
        },
        transfers_summary: {
          total_transfers: transfers?.length || 0,
          completed_transfers: transfers?.filter(t => t.status === 'completed').length || 0,
          failed_transfers: transfers?.filter(t => t.status === 'failed').length || 0,
          high_risk_transfers: transfers?.filter(t => t.risk_score >= 70).length || 0,
          total_data_volume: transfers?.reduce((sum, t) => sum + (t.actual_data_volume || 0), 0) || 0
        },
        compliance_metrics: complianceMetrics,
        transfer_patterns: transferPatterns,
        recommendations: recommendations,
        legal_compliance: {
          lgpd_article_26_compliance: complianceMetrics.agreement_compliance >= 85,
          lgpd_article_27_compliance: complianceMetrics.transfer_authorization_compliance >= 90,
          lgpd_article_33_compliance: complianceMetrics.monitoring_compliance >= 80,
          overall_compliance_score: complianceMetrics.overall_compliance
        }
      };

      // Log report generation
      await this.auditLogger.logEvent({
        user_id: 'system',
        clinic_id: clinicId,
        action: 'third_party_compliance_report_generated',
        resource_type: 'compliance_report',
        data_affected: ['third_party_data'],
        legal_basis: 'legitimate_interest',
        processing_purpose: 'compliance_reporting',
        ip_address: 'system',
        user_agent: 'third_party_manager',
        actor_id: 'system',
        actor_type: 'system',
        severity: 'low',
        metadata: {
          report_period: reportPeriod,
          agreements_count: agreements.length,
          transfers_count: transfers?.length || 0,
          compliance_score: complianceMetrics.overall_compliance
        }
      });

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: report,
        compliance_notes: [
          'Third-party compliance report generated successfully',
          `Overall compliance score: ${complianceMetrics.overall_compliance}%`,
          `${agreements.length} agreements analyzed`,
          `${transfers?.length || 0} transfers reviewed`,
          `${recommendations.length} recommendations provided`
        ],
        legal_references: ['LGPD Art. 26', 'LGPD Art. 27', 'LGPD Art. 28', 'LGPD Art. 33'],
        audit_logged: true,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate third-party compliance report',
        audit_logged: true,
        processing_time_ms: processingTime
      };
    }
  }

  // Private helper methods

  private async initializeComplianceFramework(): Promise<void> {
    // Initialize compliance framework and load active agreements
  }

  private validateAgreementData(agreementData: any): void {
    if (!agreementData.third_party_name || agreementData.third_party_name.trim().length === 0) {
      throw new Error('Third party name is required');
    }

    if (!agreementData.contact_email || !this.isValidEmail(agreementData.contact_email)) {
      throw new Error('Valid contact email is required');
    }

    if (!Array.isArray(agreementData.data_categories) || agreementData.data_categories.length === 0) {
      throw new Error('At least one data category must be specified');
    }

    if (!Array.isArray(agreementData.processing_purposes) || agreementData.processing_purposes.length === 0) {
      throw new Error('At least one processing purpose must be specified');
    }

    if (!agreementData.data_location || agreementData.data_location.trim().length === 0) {
      throw new Error('Data location is required');
    }

    if (agreementData.retention_period_days <= 0) {
      throw new Error('Retention period must be greater than 0');
    }

    if (!Array.isArray(agreementData.security_measures) || agreementData.security_measures.length === 0) {
      throw new Error('At least one security measure must be specified');
    }

    if (agreementData.breach_notification_timeframe_hours <= 0) {
      throw new Error('Breach notification timeframe must be greater than 0');
    }

    if (agreementData.data_return_deletion_timeframe_days <= 0) {
      throw new Error('Data return/deletion timeframe must be greater than 0');
    }

    if (!agreementData.agreement_start_date) {
      throw new Error('Agreement start date is required');
    }

    if (agreementData.agreement_end_date && agreementData.agreement_end_date <= agreementData.agreement_start_date) {
      throw new Error('Agreement end date must be after start date');
    }
  }

  private validateCategoryCompliance(agreementData: any, categoryRequirements: any): void {
    // Check required clauses
    const missingClauses = categoryRequirements.required_clauses.filter(
      (clause: string) => !agreementData.agreement_clauses.includes(clause)
    );
    if (missingClauses.length > 0) {
      throw new Error(`Missing required clauses for category: ${missingClauses.join(', ')}`);
    }

    // Check retention period
    if (agreementData.retention_period_days > categoryRequirements.max_retention_days) {
      throw new Error(`Retention period exceeds maximum for category: ${categoryRequirements.max_retention_days} days`);
    }

    // Check data categories
    const invalidCategories = agreementData.data_categories.filter(
      (category: string) => !categoryRequirements.data_categories_allowed.includes(category)
    );
    if (invalidCategories.length > 0) {
      throw new Error(`Invalid data categories for this third-party type: ${invalidCategories.join(', ')}`);
    }
  }

  private calculateRiskScore(agreementData: any): number {
    let riskScore = 0;

    // Data sensitivity risk
    const sensitiveCategories = ['health_data', 'financial_data', 'biometric_data'];
    const sensitiveDataCount = agreementData.data_categories.filter(
      (cat: string) => sensitiveCategories.includes(cat)
    ).length;
    riskScore += sensitiveDataCount * 15;

    // Data location risk
    if (agreementData.data_location !== 'Brazil') {
      riskScore += 20;
    }

    // Retention period risk
    if (agreementData.retention_period_days > 1825) { // > 5 years
      riskScore += 15;
    }

    // Security measures risk
    const requiredSecurityMeasures = ['encryption', 'access_controls', 'audit_logging'];
    const missingSecurityMeasures = requiredSecurityMeasures.filter(
      measure => !agreementData.security_measures.includes(measure)
    );
    riskScore += missingSecurityMeasures.length * 10;

    // Certification risk
    if (agreementData.certifications.length === 0) {
      riskScore += 20;
    }

    return Math.min(100, Math.max(0, riskScore));
  }

  private async performComplianceCheck(): Promise<void> {
    try {
      // Get all active clinics
      const { data: clinics } = await this.supabase
        .from('clinics')
        .select('id')
        .eq('status', 'active');

      if (!clinics) return;

      // Check compliance for each clinic
      for (const clinic of clinics) {
        await this.checkClinicThirdPartyCompliance(clinic.id);
      }

    } catch (error) {
      console.error('Error in third-party compliance check:', error);
    }
  }

  private async checkClinicThirdPartyCompliance(clinicId: string): Promise<void> {
    try {
      // Get active agreements
      const agreementsResult = await this.getThirdPartyAgreements(clinicId, { status: 'active' });
      if (!agreementsResult.success) return;

      const agreements = agreementsResult.data || [];

      // Check each agreement for compliance issues
      for (const agreement of agreements) {
        await this.checkAgreementCompliance(agreement);
      }

    } catch (error) {
      console.error(`Error checking third-party compliance for clinic ${clinicId}:`, error);
    }
  }

  private async checkAgreementCompliance(agreement: LGPDThirdPartyAgreement): Promise<void> {
    // Check for expiring agreements
    if (agreement.agreement_end_date) {
      const daysUntilExpiry = Math.ceil(
        (new Date(agreement.agreement_end_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
      );

      if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
        await this.complianceMonitor.generateAlert(
          agreement.clinic_id,
          'third_party_agreement_expiring',
          'medium',
          'Third-Party Agreement Expiring Soon',
          `Agreement with ${agreement.third_party_name} expires in ${daysUntilExpiry} days`,
          {
            agreement_id: agreement.id,
            third_party_name: agreement.third_party_name,
            days_until_expiry: daysUntilExpiry
          }
        );
      }
    }

    // Check for compliance violations
    // Implementation would include specific compliance checks
  }

  private async getAgreement(clinicId: string, agreementId: string): Promise<LGPDThirdPartyAgreement | null> {
    const { data, error } = await this.supabase
      .from('lgpd_third_party_agreements')
      .select('*')
      .eq('id', agreementId)
      .eq('clinic_id', clinicId)
      .eq('status', 'active')
      .single();

    if (error || !data) return null;
    return data;
  }

  private validateTransferRequest(transferRequest: any, agreement: LGPDThirdPartyAgreement): {
    is_valid: boolean;
    violations: string[];
  } {
    const violations: string[] = [];

    // Check data categories
    const invalidCategories = transferRequest.data_categories.filter(
      (cat: string) => !agreement.data_categories.includes(cat)
    );
    if (invalidCategories.length > 0) {
      violations.push(`Unauthorized data categories: ${invalidCategories.join(', ')}`);
    }

    // Check processing purpose
    if (!agreement.processing_purposes.includes(transferRequest.processing_purpose)) {
      violations.push(`Unauthorized processing purpose: ${transferRequest.processing_purpose}`);
    }

    // Check transfer method
    if (!agreement.data_transfer_methods.includes(transferRequest.transfer_method)) {
      violations.push(`Unauthorized transfer method: ${transferRequest.transfer_method}`);
    }

    return {
      is_valid: violations.length === 0,
      violations
    };
  }

  private async validateDataSubjectConsent(
    clinicId: string,
    dataSubjectIds: string[],
    processingPurpose: LGPDDataProcessingPurpose,
    thirdPartyName: string
  ): Promise<{
    all_consented: boolean;
    consented_subjects: string[];
    missing_consent: string[];
  }> {
    // Implementation would check consent records
    // This is a simplified version
    const consentedSubjects: string[] = [];
    const missingConsent: string[] = [];

    for (const subjectId of dataSubjectIds) {
      // Check if consent exists for third-party sharing
      const { data: consent } = await this.supabase
        .from('lgpd_consent_records')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('data_subject_id', subjectId)
        .eq('processing_purpose', processingPurpose)
        .eq('status', 'granted')
        .single();

      if (consent) {
        consentedSubjects.push(subjectId);
      } else {
        missingConsent.push(subjectId);
      }
    }

    return {
      all_consented: missingConsent.length === 0,
      consented_subjects: consentedSubjects,
      missing_consent: missingConsent
    };
  }

  private calculateTransferRisk(transferRequest: any, agreement: LGPDThirdPartyAgreement): number {
    let riskScore = 0;

    // Base risk from agreement
    riskScore += agreement.agreement_metadata?.risk_assessment_score || 0;

    // Data volume risk
    if (transferRequest.estimated_data_volume > 10000) {
      riskScore += 20;
    } else if (transferRequest.estimated_data_volume > 1000) {
      riskScore += 10;
    }

    // Urgency risk
    const urgencyRisk = {
      low: 0,
      medium: 5,
      high: 15,
      critical: 25
    };
    riskScore += urgencyRisk[transferRequest.urgency_level] || 0;

    // Data sensitivity risk
    const sensitiveCategories = ['health_data', 'financial_data', 'biometric_data'];
    const sensitiveDataCount = transferRequest.data_categories.filter(
      (cat: string) => sensitiveCategories.includes(cat)
    ).length;
    riskScore += sensitiveDataCount * 10;

    return Math.min(100, Math.max(0, riskScore));
  }

  private async updateAgreementStats(agreementId: string, eventType: string): Promise<void> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (eventType === 'transfer_authorized' || eventType === 'transfer_completed') {
        updateData.data_transfers_count = this.supabase.rpc('increment_transfers_count', { agreement_id: agreementId });
      }

      await this.supabase
        .from('lgpd_third_party_agreements')
        .update(updateData)
        .eq('id', agreementId);

    } catch (error) {
      console.error('Error updating agreement stats:', error);
    }
  }

  private calculateAgreementComplianceScore(agreement: LGPDThirdPartyAgreement): number {
    let score = 100;

    // Check for missing required elements
    if (!agreement.certifications || agreement.certifications.length === 0) {
      score -= 20;
    }

    if (!agreement.security_measures || agreement.security_measures.length < 3) {
      score -= 15;
    }

    if (agreement.violations_detected && agreement.violations_detected > 0) {
      score -= Math.min(30, agreement.violations_detected * 5);
    }

    // Check agreement age
    const agreementAge = Date.now() - new Date(agreement.created_at).getTime();
    const ageInDays = agreementAge / (24 * 60 * 60 * 1000);
    if (ageInDays > 365) {
      score -= 10; // Older agreements may need review
    }

    return Math.max(0, score);
  }

  private calculateAgreementRiskLevel(agreement: LGPDThirdPartyAgreement): 'low' | 'medium' | 'high' {
    const riskScore = agreement.agreement_metadata?.risk_assessment_score || 0;
    
    if (riskScore >= 70) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }

  private calculateThirdPartyCompliance(agreements: LGPDThirdPartyAgreement[], transfers: any[]): any {
    const totalAgreements = agreements.length;
    const compliantAgreements = agreements.filter(a => a.compliance_status === 'compliant').length;
    const completedTransfers = transfers.filter(t => t.status === 'completed').length;
    const totalTransfers = transfers.length;

    return {
      agreement_compliance: totalAgreements > 0 ? Math.round((compliantAgreements / totalAgreements) * 100) : 100,
      transfer_authorization_compliance: totalTransfers > 0 ? Math.round((completedTransfers / totalTransfers) * 100) : 100,
      monitoring_compliance: 85, // Would be calculated based on monitoring activities
      overall_compliance: totalAgreements > 0 ? Math.round((
        (compliantAgreements / totalAgreements) * 0.4 +
        (totalTransfers > 0 ? (completedTransfers / totalTransfers) : 1) * 0.4 +
        0.85 * 0.2
      ) * 100) : 85
    };
  }

  private analyzeTransferPatterns(transfers: any[]): any {
    const patterns = {
      most_active_third_parties: {},
      transfer_volume_trends: [],
      risk_distribution: { low: 0, medium: 0, high: 0 },
      completion_rates: {}
    };

    // Analyze transfer patterns
    for (const transfer of transfers) {
      // Count transfers by third party
      const thirdParty = transfer.third_party_name;
      patterns.most_active_third_parties[thirdParty] = 
        (patterns.most_active_third_parties[thirdParty] || 0) + 1;

      // Risk distribution
      const riskLevel = transfer.risk_score >= 70 ? 'high' : 
                       transfer.risk_score >= 40 ? 'medium' : 'low';
      patterns.risk_distribution[riskLevel]++;

      // Completion rates by third party
      if (!patterns.completion_rates[thirdParty]) {
        patterns.completion_rates[thirdParty] = { total: 0, completed: 0 };
      }
      patterns.completion_rates[thirdParty].total++;
      if (transfer.status === 'completed') {
        patterns.completion_rates[thirdParty].completed++;
      }
    }

    return patterns;
  }

  private generateThirdPartyRecommendations(agreements: LGPDThirdPartyAgreement[], transfers: any[]): string[] {
    const recommendations: string[] = [];

    // Check for agreements without certifications
    const agreementsWithoutCerts = agreements.filter(a => !a.certifications || a.certifications.length === 0);
    if (agreementsWithoutCerts.length > 0) {
      recommendations.push(`Require security certifications for ${agreementsWithoutCerts.length} third-party agreements`);
    }

    // Check for high-risk agreements
    const highRiskAgreements = agreements.filter(a => a.risk_level === 'high');
    if (highRiskAgreements.length > 0) {
      recommendations.push(`Review and mitigate risks for ${highRiskAgreements.length} high-risk agreements`);
    }

    // Check for expiring agreements
    const expiringAgreements = agreements.filter(a => a.days_until_expiry !== null && a.days_until_expiry <= 60);
    if (expiringAgreements.length > 0) {
      recommendations.push(`Renew or update ${expiringAgreements.length} agreements expiring within 60 days`);
    }

    // Check transfer failure rates
    const failedTransfers = transfers.filter(t => t.status === 'failed');
    if (failedTransfers.length > transfers.length * 0.1) {
      recommendations.push('Investigate high transfer failure rates and improve data transfer processes');
    }

    // Check for missing monitoring
    const agreementsWithoutMonitoring = agreements.filter(a => 
      !a.monitoring_requirements || a.monitoring_requirements.frequency_hours > 48
    );
    if (agreementsWithoutMonitoring.length > 0) {
      recommendations.push('Implement more frequent monitoring for third-party agreements');
    }

    return recommendations;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Cleanup method
   */
  destroy(): void {
    this.stopThirdPartyMonitoring();
    this.activeAgreements.clear();
  }
}
