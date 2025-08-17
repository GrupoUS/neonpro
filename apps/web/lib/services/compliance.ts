// Migrated from src/services/compliance.ts
import { supabase } from '@/lib/supabase';

export interface ComplianceCheck {
  id?: string;
  tenant_id: string;
  check_type: 'lgpd' | 'anvisa' | 'cfm';
  status: 'compliant' | 'non_compliant' | 'pending';
  details: Record<string, unknown>;
  checked_at: string;
  expires_at?: string;
}

export interface LGPDComplianceData {
  data_processing_consent: boolean;
  privacy_policy_updated: boolean;
  data_retention_compliant: boolean;
  breach_notification_process: boolean;
  data_subject_rights_enabled: boolean;
}

export interface ANVISAComplianceData {
  product_registration_valid: boolean;
  adverse_event_reporting: boolean;
  quality_management_system: boolean;
  professional_licensing_valid: boolean;
}

export interface CFMComplianceData {
  medical_license_valid: boolean;
  continuing_education_current: boolean;
  ethical_compliance: boolean;
  telemedicine_authorization: boolean;
}

export class ComplianceService {
  async checkLGPDCompliance(tenantId: string): Promise<{
    compliance?: ComplianceCheck;
    error?: string;
  }> {
    try {
      // Check LGPD compliance requirements
      const lgpdData: LGPDComplianceData = {
        data_processing_consent:
          await this.verifyDataProcessingConsent(tenantId),
        privacy_policy_updated: await this.verifyPrivacyPolicyUpdated(tenantId),
        data_retention_compliant:
          await this.verifyDataRetentionCompliance(tenantId),
        breach_notification_process:
          await this.verifyBreachNotificationProcess(tenantId),
        data_subject_rights_enabled:
          await this.verifyDataSubjectRights(tenantId),
      };

      const isCompliant = Object.values(lgpdData).every(Boolean);

      const complianceCheck: ComplianceCheck = {
        tenant_id: tenantId,
        check_type: 'lgpd',
        status: isCompliant ? 'compliant' : 'non_compliant',
        details: lgpdData,
        checked_at: new Date().toISOString(),
        expires_at: new Date(
          Date.now() + 90 * 24 * 60 * 60 * 1000,
        ).toISOString(), // 90 days
      };

      // Store compliance check result
      const { data, error } = await supabase
        .from('compliance_checks')
        .insert(complianceCheck)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { compliance: data };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'LGPD compliance check failed',
      };
    }
  }

  async checkANVISACompliance(tenantId: string): Promise<{
    compliance?: ComplianceCheck;
    error?: string;
  }> {
    try {
      const anvisaData: ANVISAComplianceData = {
        product_registration_valid:
          await this.verifyProductRegistration(tenantId),
        adverse_event_reporting:
          await this.verifyAdverseEventReporting(tenantId),
        quality_management_system: await this.verifyQualityManagement(tenantId),
        professional_licensing_valid:
          await this.verifyProfessionalLicensing(tenantId),
      };

      const isCompliant = Object.values(anvisaData).every(Boolean);

      const complianceCheck: ComplianceCheck = {
        tenant_id: tenantId,
        check_type: 'anvisa',
        status: isCompliant ? 'compliant' : 'non_compliant',
        details: anvisaData,
        checked_at: new Date().toISOString(),
        expires_at: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000,
        ).toISOString(), // 1 year
      };

      const { data, error } = await supabase
        .from('compliance_checks')
        .insert(complianceCheck)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { compliance: data };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'ANVISA compliance check failed',
      };
    }
  }

  async checkCFMCompliance(tenantId: string): Promise<{
    compliance?: ComplianceCheck;
    error?: string;
  }> {
    try {
      const cfmData: CFMComplianceData = {
        medical_license_valid: await this.verifyMedicalLicense(tenantId),
        continuing_education_current:
          await this.verifyContinuingEducation(tenantId),
        ethical_compliance: await this.verifyEthicalCompliance(tenantId),
        telemedicine_authorization: await this.verifyTelemedicineAuth(tenantId),
      };

      const isCompliant = Object.values(cfmData).every(Boolean);

      const complianceCheck: ComplianceCheck = {
        tenant_id: tenantId,
        check_type: 'cfm',
        status: isCompliant ? 'compliant' : 'non_compliant',
        details: cfmData,
        checked_at: new Date().toISOString(),
        expires_at: new Date(
          Date.now() + 180 * 24 * 60 * 60 * 1000,
        ).toISOString(), // 6 months
      };

      const { data, error } = await supabase
        .from('compliance_checks')
        .insert(complianceCheck)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { compliance: data };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'CFM compliance check failed',
      };
    }
  }

  private async verifyDataProcessingConsent(
    tenantId: string,
  ): Promise<boolean> {
    const { data } = await supabase
      .from('patient_consents')
      .select('count')
      .eq('tenant_id', tenantId)
      .eq('consent_type', 'data_processing')
      .eq('status', 'active');

    return (data?.[0]?.count || 0) > 0;
  }

  private async verifyPrivacyPolicyUpdated(tenantId: string): Promise<boolean> {
    const { data } = await supabase
      .from('tenant_settings')
      .select('privacy_policy_updated_at')
      .eq('id', tenantId)
      .single();

    const lastUpdate = new Date(data?.privacy_policy_updated_at || 0);
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

    return lastUpdate > oneYearAgo;
  }

  private async verifyDataRetentionCompliance(
    tenantId: string,
  ): Promise<boolean> {
    // Check if data retention policies are implemented
    const { data } = await supabase
      .from('tenant_settings')
      .select('data_retention_policy')
      .eq('id', tenantId)
      .single();

    return !!data?.data_retention_policy;
  }

  private async verifyBreachNotificationProcess(
    tenantId: string,
  ): Promise<boolean> {
    const { data } = await supabase
      .from('tenant_settings')
      .select('breach_notification_enabled')
      .eq('id', tenantId)
      .single();

    return data?.breach_notification_enabled === true;
  }

  private async verifyDataSubjectRights(tenantId: string): Promise<boolean> {
    const { data } = await supabase
      .from('tenant_settings')
      .select('data_subject_rights_enabled')
      .eq('id', tenantId)
      .single();

    return data?.data_subject_rights_enabled === true;
  }

  private async verifyProductRegistration(tenantId: string): Promise<boolean> {
    const { data } = await supabase
      .from('anvisa_products')
      .select('count')
      .eq('tenant_id', tenantId)
      .eq('registration_status', 'active');

    return (data?.[0]?.count || 0) > 0;
  }

  private async verifyAdverseEventReporting(
    tenantId: string,
  ): Promise<boolean> {
    const { data } = await supabase
      .from('tenant_settings')
      .select('adverse_event_reporting_enabled')
      .eq('id', tenantId)
      .single();

    return data?.adverse_event_reporting_enabled === true;
  }

  private async verifyQualityManagement(tenantId: string): Promise<boolean> {
    const { data } = await supabase
      .from('quality_management_systems')
      .select('count')
      .eq('tenant_id', tenantId)
      .eq('status', 'active');

    return (data?.[0]?.count || 0) > 0;
  }

  private async verifyProfessionalLicensing(
    tenantId: string,
  ): Promise<boolean> {
    const { data } = await supabase
      .from('professional_licenses')
      .select('count')
      .eq('tenant_id', tenantId)
      .gt('expires_at', new Date().toISOString());

    return (data?.[0]?.count || 0) > 0;
  }

  private async verifyMedicalLicense(tenantId: string): Promise<boolean> {
    const { data } = await supabase
      .from('medical_licenses')
      .select('count')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString());

    return (data?.[0]?.count || 0) > 0;
  }

  private async verifyContinuingEducation(tenantId: string): Promise<boolean> {
    const { data } = await supabase
      .from('continuing_education')
      .select('count')
      .eq('tenant_id', tenantId)
      .eq('status', 'completed')
      .gte(
        'completed_at',
        new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      );

    return (data?.[0]?.count || 0) > 0;
  }

  private async verifyEthicalCompliance(tenantId: string): Promise<boolean> {
    const { data } = await supabase
      .from('ethical_compliance_records')
      .select('count')
      .eq('tenant_id', tenantId)
      .eq('status', 'compliant');

    return (data?.[0]?.count || 0) > 0;
  }

  private async verifyTelemedicineAuth(tenantId: string): Promise<boolean> {
    const { data } = await supabase
      .from('telemedicine_authorizations')
      .select('count')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString());

    return (data?.[0]?.count || 0) > 0;
  }
}

export const complianceService = new ComplianceService();
