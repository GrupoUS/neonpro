// Governance & Compliance domain types derived from unified PRD spec (001-unified-prd-index)
// NOTE: Keep purely structural; no runtime logic.

export type KPIStatus = "Active" | "Provisional" | "Archived";
export interface KPI {
  id: string;
  name: string;
  formula: string; // mathematical expression or description
  baseline?: string | number;
  targets: {
    phase1?: string | number;
    phase2?: string | number;
    longTerm?: string | number;
  };
  owner: string;
  cadence: string; // e.g. 'Monthly', 'Quarterly'
  source: string; // data source path or authoritative clause
  status: KPIStatus;
  escalationPathId?: string;
  measurement?: string; // measurement methodology narrative
  notes?: string;
}

export interface EscalationPath {
  id: string;
  triggerCondition: string;
  notificationTargets: string[];
  actions: string[];
  timeToResponse: string; // e.g. '2d'
  fallbackReference?: string;
}

export interface RiskItem {
  id: string;
  description: string;
  probability: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  mitigation: string;
  owner: string;
  reviewCadence: string;
  status: "Open" | "Mitigating" | "Accepted" | "Transferred" | "Closed";
  exposure?: number; // probability * impact (can be computed externally)
}

export interface GovernancePolicy {
  id: string;
  policyType: "AI" | "Compliance" | "Data";
  thresholds: Record<string, string | number>;
  escalationPathId?: string;
  updatedAt: string; // ISO date
  owner: string;
}

export interface PriorityScore {
  featureId: string;
  impact: number;
  effort: number;
  riskReduction: number;
  strategicFit: number;
  totalScore: number;
  priorityLevel: "P0" | "P1" | "P2" | "P3";
  tieBreakerNotes?: string;
}

export interface PHIEntity {
  id: string;
  entityType: string; // e.g. 'patient_record_
  encryptionAtRest: "AES-256";
  encryptionInTransit: "TLS>=1.2";
  rlsPolicy: string; // reference to RLS predicate name
  validationSchema: string; // e.g. zod schema identifier
  auditLogStream: string; // reference to logging destination
}

export interface LGPDPolicy {
  id: string;
  consentRequired: boolean;
  dataMinimization: string; // description of minimization approach
  auditTrail: string; // location of audit logs
  owner: string;
}

export interface GovernanceLinkageRow {
  requirementId: string;
  kpiIds: string[];
  riskIds: string[];
  escalationPathId?: string;
  notes?: string;
}

export interface UnifiedTraceabilityIndex {
  storiesToKpi: Record<string, string[]>; // storyId -> KPI IDs
  kpiToRequirements: Record<string, string[]>; // KPI ID -> FR IDs
  requirementToRisks: Record<string, string[]>; // FR ID -> Risk IDs
}
