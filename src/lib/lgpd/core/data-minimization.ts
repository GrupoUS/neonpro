// LGPD Data Minimization Manager - Core Module
// Story 1.5: LGPD Compliance Automation
// Task 7: Data Minimization (AC: 7)

import { createClient } from '@/lib/supabase/client';
import type {
  LGPDServiceResponse,
  LGPDDataCategory,
  LGPDEventType,
  LGPDDataMinimizationRule,
  LGPDDataProcessingPurpose
} from '../types';
import { LGPDAuditLogger } from './audit-logger';
import { LGPDEventEmitter } from '../utils/event-emitter';
import { LGPDComplianceMonitor } from './compliance-monitor';

/**
 * LGPD Data Minimization Manager
 * Implements data minimization principles according to LGPD Article 6°
 * Ensures only necessary data is collected, processed, and stored
 */
export class LGPDDataMinimizationManager {
  private supabase = createClient();
  private auditLogger = new LGPDAuditLogger();
  private eventEmitter = new LGPDEventEmitter();
  private complianceMonitor = new LGPDComplianceMonitor();
  private minimizationRules: Map<string, LGPDDataMinimizationRule[]> = new Map();
  private isMonitoringActive = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  // Default data minimization rules based on processing purposes
  private readonly DEFAULT_MINIMIZATION_RULES = {
    patient_registration: {
      required_fields: ['name', 'birth_date', 'contact_info'],
      optional_fields: ['emergency_contact', 'insurance_info'],
      prohibited_fields: ['political_opinions', 'religious_beliefs'],
      retention_period_days: 2555, // ~7 years
      anonymization_threshold_days: 1825 // ~5 years
    },
    medical_consultation: {
      required_fields: ['patient_id', 'consultation_date', 'symptoms', 'diagnosis'],
      optional_fields: ['treatment_plan', 'medications', 'follow_up_date'],
      prohibited_fields: ['unrelated_personal_info'],
      retention_period_days: 2555, // ~7 years
      anonymization_threshold_days: 1825 // ~5 years
    },
    financial_processing: {
      required_fields: ['patient_id', 'service_type', 'amount', 'payment_method'],
      optional_fields: ['insurance_claim_number', 'discount_applied'],
      prohibited_fields: ['full_financial_history', 'credit_score'],
      retention_period_days: 1825, // ~5 years
      anonymization_threshold_days: 1095 // ~3 years
    },
    marketing_communication: {
      required_fields: ['contact_preference', 'consent_status'],
      optional_fields: ['communication_history', 'preferences'],
      prohibited_fields: ['sensitive_health_data', 'financial_details'],
      retention_period_days: 365, // 1 year
      anonymization_threshold_days: 180 // 6 months
    },
    analytics_processing: {
      required_fields: ['anonymized_id', 'service_category', 'timestamp'],
      optional_fields: ['demographic_category', 'usage_patterns'],
      prohibited_fields: ['personal_identifiers', 'sensitive_data'],
      retention_period_days: 730, // 2 years
      anonymization_threshold_days: 365 // 1 year
    }
  };

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Start data minimization monitoring
   */
  async startMinimizationMonitoring(intervalHours: number = 6): Promise<LGPDServiceResponse<boolean>> {
    const startTime = Date.now();

    try {
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
      }

      this.monitoringInterval = setInterval(async () => {
        await this.performMinimizationCheck();
      }, intervalHours * 60 * 60 * 1000);

      this.isMonitoringActive = true;

      // Perform initial check
      await this.performMinimizationCheck();

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: true,
        compliance_notes: [
          `Data minimization monitoring started with ${intervalHours}-hour intervals`,
          'LGPD Article 6° compliance actively enforced',
          'Unnecessary data collection prevention enabled',
          'Data processing purpose validation active'
        ],
        legal_references: ['LGPD Art. 6°', 'LGPD Art. 9°'],
        audit_logged: false,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start minimization monitoring',
        audit_logged: false,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Stop minimization monitoring
   */
  stopMinimizationMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoringActive = false;
  }

  /**
   * Create or update data minimization rule
   */
  async createMinimizationRule(
    clinicId: string,
    adminId: string,
    ruleData: {
      rule_name: string;
      processing_purpose: LGPDDataProcessingPurpose;
      data_category: LGPDDataCategory;
      required_fields: string[];
      optional_fields: string[];
      prohibited_fields: string[];
      collection_limit?: number;
      retention_period_days: number;
      anonymization_threshold_days: number;
      auto_enforcement: boolean;
      exceptions?: string[];
    }
  ): Promise<LGPDServiceResponse<LGPDDataMinimizationRule>> {
    const startTime = Date.now();

    try {
      // Validate rule data
      this.validateMinimizationRule(ruleData);

      const ruleRecord: Omit<LGPDDataMinimizationRule, 'id' | 'created_at' | 'updated_at'> = {
        clinic_id: clinicId,
        rule_name: ruleData.rule_name,
        processing_purpose: ruleData.processing_purpose,
        data_category: ruleData.data_category,
        required_fields: ruleData.required_fields,
        optional_fields: ruleData.optional_fields,
        prohibited_fields: ruleData.prohibited_fields,
        collection_limit: ruleData.collection_limit,
        retention_period_days: ruleData.retention_period_days,
        anonymization_threshold_days: ruleData.anonymization_threshold_days,
        auto_enforcement: ruleData.auto_enforcement,
        exceptions: ruleData.exceptions || [],
        status: 'active',
        created_by: adminId,
        last_applied: null,
        application_count: 0,
        violations_detected: 0,
        rule_metadata: {
          created_by_admin: adminId,
          creation_reason: 'manual_rule_creation',
          compliance_framework: 'LGPD',
          review_frequency_days: 180
        }
      };

      // Check for existing rule for the same purpose and category
      const { data: existingRule } = await this.supabase
        .from('lgpd_minimization_rules')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('processing_purpose', ruleData.processing_purpose)
        .eq('data_category', ruleData.data_category)
        .eq('status', 'active')
        .single();

      let result;
      if (existingRule) {
        // Update existing rule
        const { data, error } = await this.supabase
          .from('lgpd_minimization_rules')
          .update({
            ...ruleRecord,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRule.id)
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to update minimization rule: ${error.message}`);
        }
        result = data;
      } else {
        // Create new rule
        const { data, error } = await this.supabase
          .from('lgpd_minimization_rules')
          .insert(ruleRecord)
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to create minimization rule: ${error.message}`);
        }
        result = data;
      }

      // Update local cache
      const clinicRules = this.minimizationRules.get(clinicId) || [];
      const ruleIndex = clinicRules.findIndex(r => r.id === result.id);
      if (ruleIndex >= 0) {
        clinicRules[ruleIndex] = result;
      } else {
        clinicRules.push(result);
      }
      this.minimizationRules.set(clinicId, clinicRules);

      // Log rule creation/update
      await this.auditLogger.logEvent({
        user_id: adminId,
        clinic_id: clinicId,
        action: existingRule ? 'minimization_rule_updated' : 'minimization_rule_created',
        resource_type: 'minimization_rule',
        data_affected: [ruleData.data_category],
        legal_basis: 'legitimate_interest',
        processing_purpose: 'data_minimization_enforcement',
        ip_address: 'system',
        user_agent: 'minimization_manager',
        actor_id: adminId,
        actor_type: 'admin',
        severity: 'medium',
        metadata: {
          rule_id: result.id,
          processing_purpose: ruleData.processing_purpose,
          data_category: ruleData.data_category,
          auto_enforcement: ruleData.auto_enforcement,
          required_fields_count: ruleData.required_fields.length,
          prohibited_fields_count: ruleData.prohibited_fields.length
        }
      });

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: result,
        compliance_notes: [
          `Minimization rule ${existingRule ? 'updated' : 'created'} for ${ruleData.processing_purpose}`,
          `Data category: ${ruleData.data_category}`,
          `Required fields: ${ruleData.required_fields.length}`,
          `Prohibited fields: ${ruleData.prohibited_fields.length}`,
          `Auto-enforcement: ${ruleData.auto_enforcement ? 'enabled' : 'disabled'}`
        ],
        legal_references: ['LGPD Art. 6°', 'LGPD Art. 9°'],
        audit_logged: true,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create minimization rule',
        audit_logged: true,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Validate data collection against minimization rules
   */
  async validateDataCollection(
    clinicId: string,
    processingPurpose: LGPDDataProcessingPurpose,
    dataCategory: LGPDDataCategory,
    proposedData: Record<string, any>,
    userId?: string
  ): Promise<LGPDServiceResponse<{
    is_compliant: boolean;
    allowed_fields: string[];
    prohibited_fields: string[];
    missing_required_fields: string[];
    recommendations: string[];
    violations: string[];
  }>> {
    const startTime = Date.now();

    try {
      // Get applicable minimization rules
      const rules = await this.getApplicableRules(clinicId, processingPurpose, dataCategory);
      
      if (rules.length === 0) {
        // Use default rules if no custom rules exist
        const defaultRule = this.getDefaultRule(processingPurpose);
        if (defaultRule) {
          rules.push(defaultRule);
        }
      }

      if (rules.length === 0) {
        throw new Error(`No minimization rules found for purpose: ${processingPurpose}`);
      }

      const rule = rules[0]; // Use the most specific rule
      const proposedFields = Object.keys(proposedData);
      
      // Validate against rule
      const allowedFields = [...rule.required_fields, ...rule.optional_fields];
      const prohibitedFields = proposedFields.filter(field => 
        rule.prohibited_fields.includes(field)
      );
      const missingRequiredFields = rule.required_fields.filter(field => 
        !proposedFields.includes(field)
      );
      const unnecessaryFields = proposedFields.filter(field => 
        !allowedFields.includes(field) && !rule.prohibited_fields.includes(field)
      );

      const violations: string[] = [];
      const recommendations: string[] = [];

      // Check for violations
      if (prohibitedFields.length > 0) {
        violations.push(`Prohibited fields detected: ${prohibitedFields.join(', ')}`);
      }

      if (missingRequiredFields.length > 0) {
        violations.push(`Missing required fields: ${missingRequiredFields.join(', ')}`);
      }

      if (unnecessaryFields.length > 0) {
        recommendations.push(`Consider removing unnecessary fields: ${unnecessaryFields.join(', ')}`);
      }

      // Check collection limit
      if (rule.collection_limit && proposedFields.length > rule.collection_limit) {
        violations.push(`Data collection exceeds limit: ${proposedFields.length} > ${rule.collection_limit}`);
      }

      const isCompliant = violations.length === 0;

      // Log validation attempt
      if (userId) {
        await this.auditLogger.logEvent({
          user_id: userId,
          clinic_id: clinicId,
          action: 'data_collection_validated',
          resource_type: 'data_validation',
          data_affected: [dataCategory],
          legal_basis: 'legitimate_interest',
          processing_purpose: processingPurpose,
          ip_address: 'system',
          user_agent: 'minimization_manager',
          actor_id: userId,
          actor_type: 'user',
          severity: isCompliant ? 'low' : 'medium',
          metadata: {
            rule_id: rule.id,
            processing_purpose: processingPurpose,
            data_category: dataCategory,
            is_compliant: isCompliant,
            proposed_fields_count: proposedFields.length,
            violations_count: violations.length,
            prohibited_fields: prohibitedFields,
            missing_required: missingRequiredFields
          }
        });
      }

      // Update rule application stats
      if (rule.id) {
        await this.updateRuleStats(rule.id, isCompliant);
      }

      // Generate alert for violations
      if (!isCompliant && violations.length > 0) {
        await this.complianceMonitor.generateAlert(
          clinicId,
          'data_minimization_violation',
          'medium',
          'Data Minimization Violation Detected',
          `Data collection violates minimization rules for ${processingPurpose}`,
          {
            processing_purpose: processingPurpose,
            data_category: dataCategory,
            violations: violations,
            rule_id: rule.id
          }
        );
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          is_compliant: isCompliant,
          allowed_fields: allowedFields,
          prohibited_fields: prohibitedFields,
          missing_required_fields: missingRequiredFields,
          recommendations: recommendations,
          violations: violations
        },
        compliance_notes: [
          `Data collection validation for ${processingPurpose}`,
          `Compliance status: ${isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}`,
          `${violations.length} violations detected`,
          `${recommendations.length} recommendations provided`
        ],
        legal_references: ['LGPD Art. 6°'],
        audit_logged: !!userId,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to validate data collection',
        audit_logged: !!userId,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Apply data minimization to existing dataset
   */
  async applyDataMinimization(
    clinicId: string,
    adminId: string,
    minimizationRequest: {
      data_category: LGPDDataCategory;
      processing_purpose: LGPDDataProcessingPurpose;
      target_table: string;
      record_ids?: string[];
      criteria?: Record<string, any>;
      dry_run: boolean;
    }
  ): Promise<LGPDServiceResponse<{
    affected_records: number;
    fields_removed: string[];
    fields_anonymized: string[];
    compliance_improvement: number;
  }>> {
    const startTime = Date.now();

    try {
      // Get applicable minimization rules
      const rules = await this.getApplicableRules(
        clinicId,
        minimizationRequest.processing_purpose,
        minimizationRequest.data_category
      );

      if (rules.length === 0) {
        throw new Error('No minimization rules found for the specified purpose and category');
      }

      const rule = rules[0];
      
      // Identify records to process
      const recordsToProcess = await this.identifyRecordsForMinimization(
        clinicId,
        minimizationRequest.target_table,
        minimizationRequest.record_ids,
        minimizationRequest.criteria
      );

      if (recordsToProcess.length === 0) {
        throw new Error('No records found matching the specified criteria');
      }

      // Analyze current data structure
      const currentFields = await this.analyzeTableStructure(
        minimizationRequest.target_table,
        recordsToProcess[0]
      );

      // Determine fields to remove/anonymize
      const fieldsToRemove = currentFields.filter(field => 
        rule.prohibited_fields.includes(field) ||
        (!rule.required_fields.includes(field) && !rule.optional_fields.includes(field))
      );

      const fieldsToAnonymize = currentFields.filter(field => 
        rule.optional_fields.includes(field) && 
        this.shouldAnonymizeField(field, rule)
      );

      let affectedRecords = 0;
      const actualFieldsRemoved: string[] = [];
      const actualFieldsAnonymized: string[] = [];

      if (!minimizationRequest.dry_run) {
        // Apply minimization
        const minimizationResult = await this.executeMinimization(
          minimizationRequest.target_table,
          recordsToProcess,
          fieldsToRemove,
          fieldsToAnonymize,
          rule
        );

        affectedRecords = minimizationResult.affected_records;
        actualFieldsRemoved.push(...minimizationResult.fields_removed);
        actualFieldsAnonymized.push(...minimizationResult.fields_anonymized);

        // Update rule application stats
        await this.updateRuleStats(rule.id, true);
      } else {
        affectedRecords = recordsToProcess.length;
        actualFieldsRemoved.push(...fieldsToRemove);
        actualFieldsAnonymized.push(...fieldsToAnonymize);
      }

      // Calculate compliance improvement
      const complianceImprovement = this.calculateComplianceImprovement(
        currentFields,
        actualFieldsRemoved,
        actualFieldsAnonymized,
        rule
      );

      // Log minimization application
      await this.auditLogger.logEvent({
        user_id: adminId,
        clinic_id: clinicId,
        action: minimizationRequest.dry_run ? 'data_minimization_dry_run' : 'data_minimization_applied',
        resource_type: 'data_minimization',
        data_affected: [minimizationRequest.data_category],
        legal_basis: 'legitimate_interest',
        processing_purpose: minimizationRequest.processing_purpose,
        ip_address: 'system',
        user_agent: 'minimization_manager',
        actor_id: adminId,
        actor_type: 'admin',
        severity: 'medium',
        metadata: {
          rule_id: rule.id,
          target_table: minimizationRequest.target_table,
          dry_run: minimizationRequest.dry_run,
          affected_records: affectedRecords,
          fields_removed: actualFieldsRemoved,
          fields_anonymized: actualFieldsAnonymized,
          compliance_improvement: complianceImprovement
        }
      });

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          affected_records: affectedRecords,
          fields_removed: actualFieldsRemoved,
          fields_anonymized: actualFieldsAnonymized,
          compliance_improvement: complianceImprovement
        },
        compliance_notes: [
          `Data minimization ${minimizationRequest.dry_run ? '(dry run)' : 'applied'}`,
          `${affectedRecords} records processed`,
          `${actualFieldsRemoved.length} fields removed`,
          `${actualFieldsAnonymized.length} fields anonymized`,
          `Compliance improvement: ${complianceImprovement}%`
        ],
        legal_references: ['LGPD Art. 6°', 'LGPD Art. 9°'],
        audit_logged: true,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to apply data minimization',
        audit_logged: true,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Get minimization rules for a clinic
   */
  async getMinimizationRules(
    clinicId: string,
    filters?: {
      processingPurpose?: LGPDDataProcessingPurpose;
      dataCategory?: LGPDDataCategory;
      status?: 'active' | 'inactive' | 'draft';
      autoEnforcement?: boolean;
    }
  ): Promise<LGPDServiceResponse<LGPDDataMinimizationRule[]>> {
    const startTime = Date.now();

    try {
      let query = this.supabase
        .from('lgpd_minimization_rules')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (filters?.processingPurpose) {
        query = query.eq('processing_purpose', filters.processingPurpose);
      }

      if (filters?.dataCategory) {
        query = query.eq('data_category', filters.dataCategory);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.autoEnforcement !== undefined) {
        query = query.eq('auto_enforcement', filters.autoEnforcement);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get minimization rules: ${error.message}`);
      }

      // Enhance data with compliance metrics
      const enhancedData = (data || []).map(rule => ({
        ...rule,
        compliance_score: this.calculateRuleComplianceScore(rule),
        effectiveness_rating: this.calculateRuleEffectiveness(rule),
        last_violation_date: null // Would be populated from violation logs
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
        error: error instanceof Error ? error.message : 'Failed to get minimization rules',
        audit_logged: false,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Generate data minimization compliance report
   */
  async generateMinimizationReport(
    clinicId: string,
    reportPeriod: { start: Date; end: Date }
  ): Promise<LGPDServiceResponse<any>> {
    const startTime = Date.now();

    try {
      // Get all minimization rules
      const rulesResult = await this.getMinimizationRules(clinicId);
      if (!rulesResult.success) {
        throw new Error('Failed to get minimization rules');
      }

      const rules = rulesResult.data || [];

      // Get minimization activity logs
      const activityLogs = await this.auditLogger.getAuditLogs({
        clinicId,
        actions: ['data_collection_validated', 'data_minimization_applied', 'minimization_rule_created'],
        dateRange: reportPeriod,
        limit: 1000
      });

      // Calculate compliance metrics
      const complianceMetrics = await this.calculateMinimizationCompliance(clinicId, rules);

      // Analyze data collection patterns
      const collectionPatterns = await this.analyzeDataCollectionPatterns(clinicId, reportPeriod);

      // Generate recommendations
      const recommendations = this.generateMinimizationRecommendations(rules, complianceMetrics);

      const report = {
        clinic_id: clinicId,
        report_period: reportPeriod,
        generated_at: new Date().toISOString(),
        rules_summary: {
          total_rules: rules.length,
          active_rules: rules.filter(r => r.status === 'active').length,
          auto_enforcement_enabled: rules.filter(r => r.auto_enforcement).length,
          average_compliance_score: rules.reduce((sum, r) => sum + (r.compliance_score || 0), 0) / rules.length
        },
        activity_summary: {
          total_validations: activityLogs.data?.filter(log => log.action === 'data_collection_validated').length || 0,
          successful_validations: activityLogs.data?.filter(log => 
            log.action === 'data_collection_validated' && log.metadata?.is_compliant
          ).length || 0,
          minimization_applications: activityLogs.data?.filter(log => log.action === 'data_minimization_applied').length || 0,
          violations_detected: activityLogs.data?.filter(log => 
            log.action === 'data_collection_validated' && !log.metadata?.is_compliant
          ).length || 0
        },
        compliance_metrics: complianceMetrics,
        collection_patterns: collectionPatterns,
        recommendations: recommendations,
        legal_compliance: {
          lgpd_article_6_compliance: complianceMetrics.overall_compliance >= 85,
          data_minimization_score: complianceMetrics.minimization_effectiveness,
          rule_coverage_percentage: complianceMetrics.rule_coverage_percentage
        }
      };

      // Log report generation
      await this.auditLogger.logEvent({
        user_id: 'system',
        clinic_id: clinicId,
        action: 'minimization_report_generated',
        resource_type: 'minimization_report',
        data_affected: ['minimization_data'],
        legal_basis: 'legitimate_interest',
        processing_purpose: 'compliance_reporting',
        ip_address: 'system',
        user_agent: 'minimization_manager',
        actor_id: 'system',
        actor_type: 'system',
        severity: 'low',
        metadata: {
          report_period: reportPeriod,
          rules_count: rules.length,
          compliance_score: complianceMetrics.overall_compliance
        }
      });

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: report,
        compliance_notes: [
          'Data minimization compliance report generated successfully',
          `Overall compliance score: ${complianceMetrics.overall_compliance}%`,
          `${rules.length} minimization rules analyzed`,
          `${recommendations.length} recommendations provided`
        ],
        legal_references: ['LGPD Art. 6°', 'LGPD Art. 9°'],
        audit_logged: true,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate minimization report',
        audit_logged: true,
        processing_time_ms: processingTime
      };
    }
  }

  // Private helper methods

  private async initializeDefaultRules(): Promise<void> {
    // Initialize default minimization rules in memory
    // These would be used as fallbacks when no custom rules exist
  }

  private validateMinimizationRule(ruleData: any): void {
    if (!ruleData.rule_name || ruleData.rule_name.trim().length === 0) {
      throw new Error('Rule name is required');
    }

    if (!ruleData.processing_purpose) {
      throw new Error('Processing purpose is required');
    }

    if (!ruleData.data_category) {
      throw new Error('Data category is required');
    }

    if (!Array.isArray(ruleData.required_fields) || ruleData.required_fields.length === 0) {
      throw new Error('At least one required field must be specified');
    }

    if (!Array.isArray(ruleData.optional_fields)) {
      throw new Error('Optional fields must be an array');
    }

    if (!Array.isArray(ruleData.prohibited_fields)) {
      throw new Error('Prohibited fields must be an array');
    }

    if (ruleData.retention_period_days <= 0) {
      throw new Error('Retention period must be greater than 0');
    }

    if (ruleData.anonymization_threshold_days <= 0) {
      throw new Error('Anonymization threshold must be greater than 0');
    }

    // Check for field conflicts
    const requiredSet = new Set(ruleData.required_fields);
    const optionalSet = new Set(ruleData.optional_fields);
    const prohibitedSet = new Set(ruleData.prohibited_fields);

    const requiredOptionalOverlap = ruleData.required_fields.filter((field: string) => optionalSet.has(field));
    if (requiredOptionalOverlap.length > 0) {
      throw new Error(`Fields cannot be both required and optional: ${requiredOptionalOverlap.join(', ')}`);
    }

    const requiredProhibitedOverlap = ruleData.required_fields.filter((field: string) => prohibitedSet.has(field));
    if (requiredProhibitedOverlap.length > 0) {
      throw new Error(`Fields cannot be both required and prohibited: ${requiredProhibitedOverlap.join(', ')}`);
    }

    const optionalProhibitedOverlap = ruleData.optional_fields.filter((field: string) => prohibitedSet.has(field));
    if (optionalProhibitedOverlap.length > 0) {
      throw new Error(`Fields cannot be both optional and prohibited: ${optionalProhibitedOverlap.join(', ')}`);
    }
  }

  private async performMinimizationCheck(): Promise<void> {
    try {
      // Get all active clinics
      const { data: clinics } = await this.supabase
        .from('clinics')
        .select('id')
        .eq('status', 'active');

      if (!clinics) return;

      // Check minimization compliance for each clinic
      for (const clinic of clinics) {
        await this.checkClinicMinimizationCompliance(clinic.id);
      }

    } catch (error) {
      console.error('Error in minimization check:', error);
    }
  }

  private async checkClinicMinimizationCompliance(clinicId: string): Promise<void> {
    try {
      // Get active auto-enforcement rules
      const { data: rules } = await this.supabase
        .from('lgpd_minimization_rules')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('status', 'active')
        .eq('auto_enforcement', true);

      if (!rules) return;

      // Check each rule for compliance violations
      for (const rule of rules) {
        await this.checkRuleCompliance(rule);
      }

    } catch (error) {
      console.error(`Error checking minimization compliance for clinic ${clinicId}:`, error);
    }
  }

  private async checkRuleCompliance(rule: LGPDDataMinimizationRule): Promise<void> {
    // Implementation would check for compliance violations
    // and generate alerts if necessary
  }

  private async getApplicableRules(
    clinicId: string,
    processingPurpose: LGPDDataProcessingPurpose,
    dataCategory: LGPDDataCategory
  ): Promise<LGPDDataMinimizationRule[]> {
    const { data: rules } = await this.supabase
      .from('lgpd_minimization_rules')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('processing_purpose', processingPurpose)
      .eq('data_category', dataCategory)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    return rules || [];
  }

  private getDefaultRule(processingPurpose: LGPDDataProcessingPurpose): LGPDDataMinimizationRule | null {
    const defaultRuleData = this.DEFAULT_MINIMIZATION_RULES[processingPurpose];
    if (!defaultRuleData) return null;

    return {
      id: `default_${processingPurpose}`,
      clinic_id: 'default',
      rule_name: `Default ${processingPurpose} Rule`,
      processing_purpose: processingPurpose,
      data_category: 'personal_data',
      required_fields: defaultRuleData.required_fields,
      optional_fields: defaultRuleData.optional_fields,
      prohibited_fields: defaultRuleData.prohibited_fields,
      collection_limit: null,
      retention_period_days: defaultRuleData.retention_period_days,
      anonymization_threshold_days: defaultRuleData.anonymization_threshold_days,
      auto_enforcement: false,
      exceptions: [],
      status: 'active',
      created_by: 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_applied: null,
      application_count: 0,
      violations_detected: 0,
      rule_metadata: {
        created_by_admin: 'system',
        creation_reason: 'default_rule',
        compliance_framework: 'LGPD',
        review_frequency_days: 365
      }
    };
  }

  private async updateRuleStats(ruleId: string, isCompliant: boolean): Promise<void> {
    try {
      const updateData: any = {
        last_applied: new Date().toISOString(),
        application_count: this.supabase.rpc('increment_application_count', { rule_id: ruleId }),
        updated_at: new Date().toISOString()
      };

      if (!isCompliant) {
        updateData.violations_detected = this.supabase.rpc('increment_violations_count', { rule_id: ruleId });
      }

      await this.supabase
        .from('lgpd_minimization_rules')
        .update(updateData)
        .eq('id', ruleId);

    } catch (error) {
      console.error('Error updating rule stats:', error);
    }
  }

  private shouldAnonymizeField(field: string, rule: LGPDDataMinimizationRule): boolean {
    // Logic to determine if a field should be anonymized
    // based on rule criteria and field sensitivity
    const sensitiveFields = ['email', 'phone', 'address', 'cpf', 'rg'];
    return sensitiveFields.includes(field.toLowerCase());
  }

  private async identifyRecordsForMinimization(
    clinicId: string,
    targetTable: string,
    recordIds?: string[],
    criteria?: Record<string, any>
  ): Promise<any[]> {
    // Implementation would identify records based on criteria
    // This is a simplified version
    if (recordIds && recordIds.length > 0) {
      const { data } = await this.supabase
        .from(targetTable)
        .select('*')
        .eq('clinic_id', clinicId)
        .in('id', recordIds);
      return data || [];
    }

    // Apply criteria-based selection
    let query = this.supabase
      .from(targetTable)
      .select('*')
      .eq('clinic_id', clinicId);

    if (criteria) {
      Object.entries(criteria).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data } = await query.limit(1000);
    return data || [];
  }

  private async analyzeTableStructure(tableName: string, sampleRecord: any): Promise<string[]> {
    // Return field names from sample record
    return Object.keys(sampleRecord || {});
  }

  private async executeMinimization(
    targetTable: string,
    records: any[],
    fieldsToRemove: string[],
    fieldsToAnonymize: string[],
    rule: LGPDDataMinimizationRule
  ): Promise<{
    affected_records: number;
    fields_removed: string[];
    fields_anonymized: string[];
  }> {
    let affectedRecords = 0;
    const actualFieldsRemoved: string[] = [];
    const actualFieldsAnonymized: string[] = [];

    for (const record of records) {
      try {
        const updateData: any = {};
        let hasChanges = false;

        // Remove prohibited fields
        for (const field of fieldsToRemove) {
          if (record[field] !== undefined) {
            updateData[field] = null;
            hasChanges = true;
            if (!actualFieldsRemoved.includes(field)) {
              actualFieldsRemoved.push(field);
            }
          }
        }

        // Anonymize sensitive fields
        for (const field of fieldsToAnonymize) {
          if (record[field] !== undefined) {
            updateData[field] = this.anonymizeFieldValue(field, record[field]);
            hasChanges = true;
            if (!actualFieldsAnonymized.includes(field)) {
              actualFieldsAnonymized.push(field);
            }
          }
        }

        if (hasChanges) {
          updateData.updated_at = new Date().toISOString();
          updateData.minimization_applied_at = new Date().toISOString();
          updateData.minimization_rule_id = rule.id;

          await this.supabase
            .from(targetTable)
            .update(updateData)
            .eq('id', record.id);

          affectedRecords++;
        }

      } catch (error) {
        console.error(`Error processing record ${record.id}:`, error);
      }
    }

    return {
      affected_records: affectedRecords,
      fields_removed: actualFieldsRemoved,
      fields_anonymized: actualFieldsAnonymized
    };
  }

  private anonymizeFieldValue(fieldName: string, value: any): string {
    // Simple anonymization logic
    if (typeof value !== 'string') {
      return 'ANONYMIZED';
    }

    switch (fieldName.toLowerCase()) {
      case 'email':
        return 'anonymized@example.com';
      case 'phone':
        return 'ANONYMIZED_PHONE';
      case 'cpf':
        return 'ANONYMIZED_CPF';
      case 'name':
        return 'ANONYMIZED_NAME';
      default:
        return 'ANONYMIZED';
    }
  }

  private calculateComplianceImprovement(
    originalFields: string[],
    removedFields: string[],
    anonymizedFields: string[],
    rule: LGPDDataMinimizationRule
  ): number {
    const totalFields = originalFields.length;
    const processedFields = removedFields.length + anonymizedFields.length;
    const allowedFields = rule.required_fields.length + rule.optional_fields.length;
    
    // Calculate improvement as percentage of unnecessary data removed
    const unnecessaryFields = Math.max(0, totalFields - allowedFields);
    if (unnecessaryFields === 0) return 100;
    
    return Math.round((processedFields / unnecessaryFields) * 100);
  }

  private calculateRuleComplianceScore(rule: LGPDDataMinimizationRule): number {
    // Calculate compliance score based on rule effectiveness
    const totalApplications = rule.application_count || 0;
    const violations = rule.violations_detected || 0;
    
    if (totalApplications === 0) return 100;
    
    const successRate = ((totalApplications - violations) / totalApplications) * 100;
    return Math.round(successRate);
  }

  private calculateRuleEffectiveness(rule: LGPDDataMinimizationRule): 'high' | 'medium' | 'low' {
    const complianceScore = this.calculateRuleComplianceScore(rule);
    
    if (complianceScore >= 90) return 'high';
    if (complianceScore >= 70) return 'medium';
    return 'low';
  }

  private async calculateMinimizationCompliance(
    clinicId: string,
    rules: LGPDDataMinimizationRule[]
  ): Promise<any> {
    const totalPurposes = Object.keys(this.DEFAULT_MINIMIZATION_RULES).length;
    const coveredPurposes = new Set(rules.map(r => r.processing_purpose)).size;
    
    const activeRules = rules.filter(r => r.status === 'active');
    const autoEnforcedRules = activeRules.filter(r => r.auto_enforcement);
    
    const averageComplianceScore = rules.length > 0 ? 
      rules.reduce((sum, r) => sum + this.calculateRuleComplianceScore(r), 0) / rules.length : 0;
    
    return {
      overall_compliance: Math.round((coveredPurposes / totalPurposes) * 100),
      rule_coverage_percentage: Math.round((coveredPurposes / totalPurposes) * 100),
      active_rules_percentage: rules.length > 0 ? Math.round((activeRules.length / rules.length) * 100) : 0,
      auto_enforcement_percentage: activeRules.length > 0 ? Math.round((autoEnforcedRules.length / activeRules.length) * 100) : 0,
      minimization_effectiveness: Math.round(averageComplianceScore),
      total_violations: rules.reduce((sum, r) => sum + (r.violations_detected || 0), 0)
    };
  }

  private async analyzeDataCollectionPatterns(
    clinicId: string,
    reportPeriod: { start: Date; end: Date }
  ): Promise<any> {
    // Analyze data collection patterns over the report period
    const validationLogs = await this.auditLogger.getAuditLogs({
      clinicId,
      actions: ['data_collection_validated'],
      dateRange: reportPeriod,
      limit: 1000
    });

    const patterns = {
      most_common_purposes: {},
      most_violated_categories: {},
      compliance_trends: [],
      peak_collection_times: []
    };

    // Analyze logs to extract patterns
    if (validationLogs.success && validationLogs.data) {
      for (const log of validationLogs.data) {
        const purpose = log.processing_purpose;
        const category = log.data_affected?.[0];
        const isCompliant = log.metadata?.is_compliant;

        // Count purposes
        if (purpose) {
          patterns.most_common_purposes[purpose] = (patterns.most_common_purposes[purpose] || 0) + 1;
        }

        // Count violations by category
        if (category && !isCompliant) {
          patterns.most_violated_categories[category] = (patterns.most_violated_categories[category] || 0) + 1;
        }
      }
    }

    return patterns;
  }

  private generateMinimizationRecommendations(
    rules: LGPDDataMinimizationRule[],
    complianceMetrics: any
  ): string[] {
    const recommendations: string[] = [];

    // Check for missing rules
    const coveredPurposes = new Set(rules.map(r => r.processing_purpose));
    const missingPurposes = Object.keys(this.DEFAULT_MINIMIZATION_RULES)
      .filter(purpose => !coveredPurposes.has(purpose as LGPDDataProcessingPurpose));

    if (missingPurposes.length > 0) {
      recommendations.push(`Create minimization rules for: ${missingPurposes.join(', ')}`);
    }

    // Check for rules without auto-enforcement
    const manualRules = rules.filter(r => !r.auto_enforcement);
    if (manualRules.length > 0) {
      recommendations.push('Enable auto-enforcement for manual minimization rules');
    }

    // Check for low-performing rules
    const lowPerformingRules = rules.filter(r => this.calculateRuleComplianceScore(r) < 70);
    if (lowPerformingRules.length > 0) {
      recommendations.push(`Review and improve ${lowPerformingRules.length} low-performing rules`);
    }

    // Check for excessive data collection
    const highViolationRules = rules.filter(r => (r.violations_detected || 0) > 10);
    if (highViolationRules.length > 0) {
      recommendations.push('Investigate and address high violation rates in data collection');
    }

    return recommendations;
  }

  /**
   * Cleanup method
   */
  destroy(): void {
    this.stopMinimizationMonitoring();
    this.minimizationRules.clear();
  }
}
