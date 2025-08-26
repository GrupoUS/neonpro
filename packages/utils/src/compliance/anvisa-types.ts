/**
 * ANVISA Types and Interfaces
 */

export interface ANVISAProduct {
  id: string;
  name: string;
  registration_number: string;
  category: "medical_device" | "cosmetic" | "medicine" | "procedure";
  manufacturer: string;
  expiry_date: Date;
  batch_number?: string;
  regulatory_status: "approved" | "pending" | "suspended" | "recalled";
  created_at: Date;
  updated_at: Date;
}

export interface ANVISAProcedure {
  id: string;
  name: string;
  classification: "low_risk" | "medium_risk" | "high_risk" | "surgical";
  required_qualifications: string[];
  anvisa_code: string;
  description: string;
  contraindications: string[];
  pre_requirements: string[];
  post_care_instructions: string[];
  regulatory_notes: string;
  created_at: Date;
  updated_at: Date;
}

export interface AdverseEvent {
  id: string;
  patient_id: string;
  procedure_id?: string;
  product_id?: string;
  event_type: "mild" | "moderate" | "severe" | "life_threatening";
  description: string;
  onset_date: Date;
  resolution_date?: Date;
  reported_date: Date;
  reporter_name: string;
  reporter_qualification: string;
  actions_taken: string;
  outcome: "resolved" | "ongoing" | "permanent_damage" | "death";
  anvisa_reported: boolean;
  anvisa_report_number?: string;
  created_at: Date;
}

export interface ComplianceTask {
  id: string;
  type: string;
  reference_id: string;
  due_date: Date;
  status: "pending" | "completed" | "overdue";
  description: string;
}

export interface ComplianceReport {
  period: {
    end: Date;
    start: Date;
  };
  adverse_events: {
    by_severity: {
      life_threatening: number;
      mild: number;
      moderate: number;
      severe: number;
    };
    pending_anvisa_reports: number;
    total: number;
  };
  compliance_score: number;
  procedures: {
    by_risk: {
      high_risk: number;
      low_risk: number;
      medium_risk: number;
      surgical: number;
    };
    total: number;
  };
  products: {
    approved: number;
    expiring_soon: number;
    suspended: number;
    total: number;
  };
}
