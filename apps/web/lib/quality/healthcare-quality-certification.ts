import { createClient } from '@/utils/supabase/server';

export interface QualityCertification {
  id: string;
  name: string;
  description: string;
  standard: string; // ISO 9001, JCI, NABH, etc.
  version: string;
  status: 'active' | 'expired' | 'pending_renewal' | 'suspended';
  issuedBy: string;
  issuedDate: Date;
  expiryDate: Date;
  renewalDate?: Date;
  scope: string[];
  requirements: QualityRequirement[];
  audits: QualityAudit[];
  documents: QualityDocument[];
}

export interface QualityRequirement {
  id: string;
  code: string;
  title: string;
  description: string;
  category:
    | 'patient_safety'
    | 'clinical_governance'
    | 'facility_management'
    | 'human_resources'
    | 'information_management';
  priority: 'critical' | 'major' | 'minor';
  status:
    | 'compliant'
    | 'non_compliant'
    | 'partially_compliant'
    | 'not_applicable';
  evidence: string[];
  lastAssessed: Date;
  nextAssessment: Date;
  assignedTo?: string;
  corrective_actions?: CorrectiveAction[];
}

export interface QualityAudit {
  id: string;
  type: 'internal' | 'external' | 'surveillance' | 'certification';
  auditor: string;
  auditDate: Date;
  scope: string[];
  findings: AuditFinding[];
  overallRating:
    | 'excellent'
    | 'good'
    | 'satisfactory'
    | 'needs_improvement'
    | 'unsatisfactory';
  status: 'planned' | 'in_progress' | 'completed' | 'report_pending';
  reportUrl?: string;
  followUpDate?: Date;
}

export interface AuditFinding {
  id: string;
  type:
    | 'non_conformity'
    | 'observation'
    | 'opportunity_for_improvement'
    | 'best_practice';
  severity: 'critical' | 'major' | 'minor';
  requirement: string;
  description: string;
  evidence: string;
  rootCause?: string;
  corrective_action?: CorrectiveAction;
  status: 'open' | 'in_progress' | 'closed' | 'verified';
}

export interface CorrectiveAction {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  status: 'planned' | 'in_progress' | 'completed' | 'overdue';
  completedDate?: Date;
  effectiveness?:
    | 'effective'
    | 'partially_effective'
    | 'ineffective'
    | 'pending_verification';
  verifiedBy?: string;
  verificationDate?: Date;
}

export interface QualityDocument {
  id: string;
  title: string;
  type:
    | 'policy'
    | 'procedure'
    | 'work_instruction'
    | 'form'
    | 'record'
    | 'manual';
  version: string;
  status: 'draft' | 'approved' | 'active' | 'obsolete';
  approvedBy?: string;
  approvedDate?: Date;
  effectiveDate?: Date;
  reviewDate?: Date;
  url?: string;
  tags: string[];
}

export interface QualityMetric {
  id: string;
  name: string;
  description: string;
  category:
    | 'patient_satisfaction'
    | 'clinical_outcomes'
    | 'safety_indicators'
    | 'efficiency'
    | 'compliance';
  value: number;
  unit: string;
  target: number;
  benchmark?: number;
  trend: 'improving' | 'stable' | 'declining';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  lastUpdated: Date;
  dataSource: string;
}

export class HealthcareQualityCertificationService {
  private supabase = createClient();

  // Certifications Management
  async getCertifications(filters?: {
    status?: string[];
    standard?: string;
    expiringWithin?: number; // days
  }): Promise<QualityCertification[]> {
    try {
      let query = this.supabase
        .from('quality_certifications')
        .select(`
          *,
          requirements:quality_requirements(*),
          audits:quality_audits(*),
          documents:quality_documents(*)
        `)
        .order('expiry_date', { ascending: true });

      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters?.standard) {
        query = query.eq('standard', filters.standard);
      }
      if (filters?.expiringWithin) {
        const expiryThreshold = new Date();
        expiryThreshold.setDate(
          expiryThreshold.getDate() + filters.expiringWithin,
        );
        query = query.lte('expiry_date', expiryThreshold.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      return (
        data?.map((cert) => ({
          ...cert,
          issuedDate: new Date(cert.issued_date),
          expiryDate: new Date(cert.expiry_date),
          renewalDate: cert.renewal_date
            ? new Date(cert.renewal_date)
            : undefined,
        })) || []
      );
    } catch (error) {
      console.error('Error fetching certifications:', error);
      return [];
    }
  }

  async getCertification(id: string): Promise<QualityCertification | null> {
    try {
      const { data, error } = await this.supabase
        .from('quality_certifications')
        .select(`
          *,
          requirements:quality_requirements(*),
          audits:quality_audits(*),
          documents:quality_documents(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return data
        ? {
            ...data,
            issuedDate: new Date(data.issued_date),
            expiryDate: new Date(data.expiry_date),
            renewalDate: data.renewal_date
              ? new Date(data.renewal_date)
              : undefined,
          }
        : null;
    } catch (error) {
      console.error('Error fetching certification:', error);
      return null;
    }
  }

  // Requirements Management
  async getRequirements(
    certificationId?: string,
    filters?: {
      category?: string[];
      status?: string[];
      priority?: string[];
      overdue?: boolean;
    },
  ): Promise<QualityRequirement[]> {
    try {
      let query = this.supabase
        .from('quality_requirements')
        .select('*')
        .order('priority', { ascending: false });

      if (certificationId) {
        query = query.eq('certification_id', certificationId);
      }
      if (filters?.category?.length) {
        query = query.in('category', filters.category);
      }
      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters?.priority?.length) {
        query = query.in('priority', filters.priority);
      }
      if (filters?.overdue) {
        query = query.lt('next_assessment', new Date().toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      return (
        data?.map((req) => ({
          ...req,
          lastAssessed: new Date(req.last_assessed),
          nextAssessment: new Date(req.next_assessment),
        })) || []
      );
    } catch (error) {
      console.error('Error fetching requirements:', error);
      return [];
    }
  }

  async updateRequirementStatus(
    id: string,
    status: QualityRequirement['status'],
    evidence?: string[],
    assessedBy?: string,
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('quality_requirements')
        .update({
          status,
          evidence: evidence || [],
          last_assessed: new Date().toISOString(),
          assessed_by: assessedBy,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating requirement status:', error);
      return false;
    }
  }

  // Audits Management
  async getAudits(filters?: {
    type?: string[];
    status?: string[];
    dateRange?: { start: Date; end: Date };
    certificationId?: string;
  }): Promise<QualityAudit[]> {
    try {
      let query = this.supabase
        .from('quality_audits')
        .select(`
          *,
          findings:audit_findings(*)
        `)
        .order('audit_date', { ascending: false });

      if (filters?.type?.length) {
        query = query.in('type', filters.type);
      }
      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters?.certificationId) {
        query = query.eq('certification_id', filters.certificationId);
      }
      if (filters?.dateRange) {
        query = query
          .gte('audit_date', filters.dateRange.start.toISOString())
          .lte('audit_date', filters.dateRange.end.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      return (
        data?.map((audit) => ({
          ...audit,
          auditDate: new Date(audit.audit_date),
          followUpDate: audit.follow_up_date
            ? new Date(audit.follow_up_date)
            : undefined,
        })) || []
      );
    } catch (error) {
      console.error('Error fetching audits:', error);
      return [];
    }
  }

  async createAudit(
    audit: Omit<QualityAudit, 'id' | 'findings'>,
  ): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('quality_audits')
        .insert({
          ...audit,
          audit_date: audit.auditDate.toISOString(),
          follow_up_date: audit.followUpDate?.toISOString(),
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) throw error;
      return data?.id || null;
    } catch (error) {
      console.error('Error creating audit:', error);
      return null;
    }
  }

  // Quality Metrics
  async getQualityMetrics(filters?: {
    category?: string[];
    period?: string;
    dateRange?: { start: Date; end: Date };
  }): Promise<QualityMetric[]> {
    try {
      let query = this.supabase
        .from('quality_metrics')
        .select('*')
        .order('last_updated', { ascending: false });

      if (filters?.category?.length) {
        query = query.in('category', filters.category);
      }
      if (filters?.period) {
        query = query.eq('period', filters.period);
      }
      if (filters?.dateRange) {
        query = query
          .gte('last_updated', filters.dateRange.start.toISOString())
          .lte('last_updated', filters.dateRange.end.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      return (
        data?.map((metric) => ({
          ...metric,
          lastUpdated: new Date(metric.last_updated),
        })) || []
      );
    } catch (error) {
      console.error('Error fetching quality metrics:', error);
      return [];
    }
  }

  async updateQualityMetric(
    id: string,
    value: number,
    dataSource?: string,
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('quality_metrics')
        .update({
          value,
          data_source: dataSource,
          last_updated: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating quality metric:', error);
      return false;
    }
  }

  // Dashboard Analytics
  async getQualityDashboard(): Promise<{
    certifications: {
      total: number;
      active: number;
      expiringSoon: number;
      expired: number;
    };
    requirements: {
      total: number;
      compliant: number;
      nonCompliant: number;
      overdue: number;
    };
    audits: {
      total: number;
      completed: number;
      pending: number;
      findings: number;
    };
    metrics: {
      averageScore: number;
      trending: 'up' | 'down' | 'stable';
      criticalIssues: number;
    };
  }> {
    try {
      // Get certifications summary
      const { data: certificationsData } = await this.supabase
        .from('quality_certifications')
        .select('status, expiry_date');

      // Get requirements summary
      const { data: requirementsData } = await this.supabase
        .from('quality_requirements')
        .select('status, next_assessment');

      // Get audits summary
      const { data: auditsData } = await this.supabase
        .from('quality_audits')
        .select('status')
        .gte(
          'audit_date',
          new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        );

      // Get findings count
      const { data: findingsData } = await this.supabase
        .from('audit_findings')
        .select('id')
        .eq('status', 'open');

      const now = new Date();
      const thirtyDaysFromNow = new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000,
      );

      const certifications = {
        total: certificationsData?.length || 0,
        active:
          certificationsData?.filter((c) => c.status === 'active').length || 0,
        expiringSoon:
          certificationsData?.filter(
            (c) =>
              new Date(c.expiry_date) <= thirtyDaysFromNow &&
              new Date(c.expiry_date) > now,
          ).length || 0,
        expired:
          certificationsData?.filter((c) => new Date(c.expiry_date) <= now)
            .length || 0,
      };

      const requirements = {
        total: requirementsData?.length || 0,
        compliant:
          requirementsData?.filter((r) => r.status === 'compliant').length || 0,
        nonCompliant:
          requirementsData?.filter((r) => r.status === 'non_compliant')
            .length || 0,
        overdue:
          requirementsData?.filter((r) => new Date(r.next_assessment) < now)
            .length || 0,
      };

      const audits = {
        total: auditsData?.length || 0,
        completed:
          auditsData?.filter((a) => a.status === 'completed').length || 0,
        pending:
          auditsData?.filter((a) =>
            ['planned', 'in_progress'].includes(a.status),
          ).length || 0,
        findings: findingsData?.length || 0,
      };

      const complianceRate =
        requirements.total > 0
          ? (requirements.compliant / requirements.total) * 100
          : 100;

      const metrics = {
        averageScore: Math.round(complianceRate),
        trending:
          complianceRate >= 90
            ? ('up' as const)
            : complianceRate >= 70
              ? ('stable' as const)
              : ('down' as const),
        criticalIssues: requirements.nonCompliant + audits.findings,
      };

      return { certifications, requirements, audits, metrics };
    } catch (error) {
      console.error('Error fetching quality dashboard:', error);
      return {
        certifications: { total: 0, active: 0, expiringSoon: 0, expired: 0 },
        requirements: { total: 0, compliant: 0, nonCompliant: 0, overdue: 0 },
        audits: { total: 0, completed: 0, pending: 0, findings: 0 },
        metrics: { averageScore: 0, trending: 'stable', criticalIssues: 0 },
      };
    }
  }
}

// Export singleton instance
export const healthcareQualityCertificationService =
  new HealthcareQualityCertificationService();

// Export utility functions
export const getQualityCertifications = (
  filters?: Parameters<
    HealthcareQualityCertificationService['getCertifications']
  >[0],
) => healthcareQualityCertificationService.getCertifications(filters);

export const getQualityCertification = (id: string) =>
  healthcareQualityCertificationService.getCertification(id);

export const getQualityRequirements = (
  certificationId?: string,
  filters?: Parameters<
    HealthcareQualityCertificationService['getRequirements']
  >[1],
) =>
  healthcareQualityCertificationService.getRequirements(
    certificationId,
    filters,
  );

export const updateQualityRequirementStatus = (
  id: string,
  status: QualityRequirement['status'],
  evidence?: string[],
  assessedBy?: string,
) =>
  healthcareQualityCertificationService.updateRequirementStatus(
    id,
    status,
    evidence,
    assessedBy,
  );

export const getQualityAudits = (
  filters?: Parameters<HealthcareQualityCertificationService['getAudits']>[0],
) => healthcareQualityCertificationService.getAudits(filters);

export const createQualityAudit = (
  audit: Parameters<HealthcareQualityCertificationService['createAudit']>[0],
) => healthcareQualityCertificationService.createAudit(audit);

export const getQualityMetrics = (
  filters?: Parameters<
    HealthcareQualityCertificationService['getQualityMetrics']
  >[0],
) => healthcareQualityCertificationService.getQualityMetrics(filters);

export const updateQualityMetric = (
  id: string,
  value: number,
  dataSource?: string,
) =>
  healthcareQualityCertificationService.updateQualityMetric(
    id,
    value,
    dataSource,
  );

export const getQualityDashboard = () =>
  healthcareQualityCertificationService.getQualityDashboard();
