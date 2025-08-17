/**
 * ANVISA Compliance Module for Brazilian Healthcare Regulation
 * Handles product registration, procedure classification, and adverse event reporting
 */

import { createClient } from '@supabase/supabase-js';

export type ANVISAProduct = {
  id: string;
  name: string;
  registration_number: string;
  category: 'medical_device' | 'cosmetic' | 'medicine' | 'procedure';
  manufacturer: string;
  expiry_date: Date;
  batch_number?: string;
  regulatory_status: 'approved' | 'pending' | 'suspended' | 'recalled';
  created_at: Date;
  updated_at: Date;
};

export type ANVISAProcedure = {
  id: string;
  name: string;
  classification: 'low_risk' | 'medium_risk' | 'high_risk' | 'surgical';
  required_qualifications: string[];
  anvisa_code: string;
  description: string;
  contraindications: string[];
  pre_requirements: string[];
  post_care_instructions: string[];
  regulatory_notes: string;
  created_at: Date;
  updated_at: Date;
};

export type AdverseEvent = {
  id: string;
  patient_id: string;
  procedure_id?: string;
  product_id?: string;
  event_type: 'mild' | 'moderate' | 'severe' | 'life_threatening';
  description: string;
  onset_date: Date;
  resolution_date?: Date;
  reported_date: Date;
  reporter_name: string;
  reporter_qualification: string;
  actions_taken: string;
  outcome: 'resolved' | 'ongoing' | 'permanent_damage' | 'death';
  anvisa_reported: boolean;
  anvisa_report_number?: string;
  created_at: Date;
};

export class ANVISACompliance {
  private readonly supabase: any;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  // Product Registration Management
  async registerProduct(
    product: Omit<ANVISAProduct, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ANVISAProduct | null> {
    try {
      const { data, error } = await this.supabase
        .from('anvisa_products')
        .insert(product)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Log compliance action
      await this.logComplianceAction('product_registration', product.name, data.id);

      return data;
    } catch (_error) {
      return null;
    }
  }

  async validateProductCompliance(productId: string): Promise<boolean> {
    try {
      const { data: product, error } = await this.supabase
        .from('anvisa_products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error || !product) {
        return false;
      }

      // Check if product is approved and not expired
      const isApproved = product.regulatory_status === 'approved';
      const notExpired = new Date(product.expiry_date) > new Date();
      const hasValidRegistration =
        product.registration_number && product.registration_number.length > 0;

      return isApproved && notExpired && hasValidRegistration;
    } catch (_error) {
      return false;
    }
  }

  async getExpiringSoonProducts(days = 30): Promise<ANVISAProduct[]> {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const { data, error } = await this.supabase
        .from('anvisa_products')
        .select('*')
        .lte('expiry_date', futureDate.toISOString())
        .gte('expiry_date', new Date().toISOString())
        .eq('regulatory_status', 'approved');

      return data || [];
    } catch (_error) {
      return [];
    }
  }

  // Procedure Classification Management
  async classifyProcedure(
    procedure: Omit<ANVISAProcedure, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ANVISAProcedure | null> {
    try {
      const { data, error } = await this.supabase
        .from('anvisa_procedures')
        .insert(procedure)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Log compliance action
      await this.logComplianceAction('procedure_classification', procedure.name, data.id);

      return data;
    } catch (_error) {
      return null;
    }
  }

  async validateProcedureQualifications(
    procedureId: string,
    professionalQualifications: string[]
  ): Promise<boolean> {
    try {
      const { data: procedure, error } = await this.supabase
        .from('anvisa_procedures')
        .select('required_qualifications')
        .eq('id', procedureId)
        .single();

      if (error || !procedure) {
        return false;
      }

      // Check if professional has all required qualifications
      return procedure.required_qualifications.every((req: string) =>
        professionalQualifications.includes(req)
      );
    } catch (_error) {
      return false;
    }
  }

  // Adverse Event Reporting
  async reportAdverseEvent(
    event: Omit<AdverseEvent, 'id' | 'created_at'>
  ): Promise<AdverseEvent | null> {
    try {
      const { data, error } = await this.supabase
        .from('adverse_events')
        .insert(event)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Auto-determine if ANVISA reporting is required
      const requiresANVISAReport = this.requiresANVISAReporting(event.event_type, event.outcome);

      if (requiresANVISAReport && !event.anvisa_reported) {
        await this.scheduleANVISAReport(data.id);
      }

      // Log compliance action
      await this.logComplianceAction(
        'adverse_event_report',
        `Event: ${event.description}`,
        data.id
      );

      return data;
    } catch (_error) {
      return null;
    }
  }

  private requiresANVISAReporting(
    eventType: AdverseEvent['event_type'],
    outcome: AdverseEvent['outcome']
  ): boolean {
    // Severe or life-threatening events always require reporting
    if (eventType === 'severe' || eventType === 'life_threatening') {
      return true;
    }

    // Permanent damage or death always requires reporting
    if (outcome === 'permanent_damage' || outcome === 'death') {
      return true;
    }

    return false;
  }

  private async scheduleANVISAReport(eventId: string): Promise<void> {
    // In a real implementation, this would integrate with ANVISA's reporting system
    // For now, we'll create a task for manual reporting
    try {
      await this.supabase.from('compliance_tasks').insert({
        type: 'anvisa_adverse_event_report',
        reference_id: eventId,
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        status: 'pending',
        description: 'Submit adverse event report to ANVISA within 72 hours',
      });
    } catch (_error) {}
  }

  async getPendingANVISAReports(): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('compliance_tasks')
        .select(
          `
          *,
          adverse_events:reference_id (
            id,
            description,
            event_type,
            outcome,
            reported_date
          )
        `
        )
        .eq('type', 'anvisa_adverse_event_report')
        .eq('status', 'pending');

      return data || [];
    } catch (_error) {
      return [];
    }
  }

  // Compliance Monitoring
  async generateComplianceReport(startDate: Date, endDate: Date): Promise<any> {
    try {
      const [products, procedures, events] = await Promise.all([
        this.supabase
          .from('anvisa_products')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),

        this.supabase
          .from('anvisa_procedures')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),

        this.supabase
          .from('adverse_events')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
      ]);

      const expiringSoon = await this.getExpiringSoonProducts();
      const pendingReports = await this.getPendingANVISAReports();

      return {
        period: {
          start: startDate,
          end: endDate,
        },
        products: {
          total: products.data?.length || 0,
          approved:
            products.data?.filter((p: any) => p.regulatory_status === 'approved').length || 0,
          expiring_soon: expiringSoon.length,
          suspended:
            products.data?.filter((p: any) => p.regulatory_status === 'suspended').length || 0,
        },
        procedures: {
          total: procedures.data?.length || 0,
          by_risk: {
            low_risk:
              procedures.data?.filter((p: any) => p.classification === 'low_risk').length || 0,
            medium_risk:
              procedures.data?.filter((p: any) => p.classification === 'medium_risk').length || 0,
            high_risk:
              procedures.data?.filter((p: any) => p.classification === 'high_risk').length || 0,
            surgical:
              procedures.data?.filter((p: any) => p.classification === 'surgical').length || 0,
          },
        },
        adverse_events: {
          total: events.data?.length || 0,
          by_severity: {
            mild: events.data?.filter((e: any) => e.event_type === 'mild').length || 0,
            moderate: events.data?.filter((e: any) => e.event_type === 'moderate').length || 0,
            severe: events.data?.filter((e: any) => e.event_type === 'severe').length || 0,
            life_threatening:
              events.data?.filter((e: any) => e.event_type === 'life_threatening').length || 0,
          },
          pending_anvisa_reports: pendingReports.length,
        },
        compliance_score: this.calculateComplianceScore(
          products.data,
          procedures.data,
          events.data,
          pendingReports
        ),
      };
    } catch (_error) {
      return null;
    }
  }

  private calculateComplianceScore(
    products: any[],
    _procedures: any[],
    _events: any[],
    pendingReports: any[]
  ): number {
    let score = 100;

    // Deduct points for compliance issues
    const expiredProducts =
      products?.filter((p) => new Date(p.expiry_date) < new Date()).length || 0;
    const suspendedProducts =
      products?.filter((p) => p.regulatory_status === 'suspended').length || 0;
    const overduePendingReports =
      pendingReports?.filter((r) => new Date(r.due_date) < new Date()).length || 0;

    score -= expiredProducts * 5;
    score -= suspendedProducts * 10;
    score -= overduePendingReports * 15;

    return Math.max(0, Math.min(100, score));
  }

  private async logComplianceAction(
    action: string,
    description: string,
    referenceId: string
  ): Promise<void> {
    try {
      await this.supabase.from('compliance_logs').insert({
        action,
        description,
        reference_id: referenceId,
        module: 'anvisa',
        timestamp: new Date().toISOString(),
      });
    } catch (_error) {}
  }

  // Utility methods
  async validateANVISARegistrationNumber(registrationNumber: string): Promise<boolean> {
    // Brazilian ANVISA registration numbers follow specific patterns
    // This is a simplified validation - real implementation would call ANVISA API
    const anvisaPattern = /^[0-9]{13}$/; // 13-digit number
    return anvisaPattern.test(registrationNumber);
  }

  async getProductByRegistration(registrationNumber: string): Promise<ANVISAProduct | null> {
    try {
      const { data, error } = await this.supabase
        .from('anvisa_products')
        .select('*')
        .eq('registration_number', registrationNumber)
        .single();

      return error ? null : data;
    } catch (_error) {
      return null;
    }
  }
}
