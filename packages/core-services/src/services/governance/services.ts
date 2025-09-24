// In-memory governance service implementations (Phase 1 minimal logic)
// These implementations satisfy contract, unit, scenario, integration tests.

import {
  aggregatePolicyRules,
  computeRiskExposure,
  evaluateKPIValue,
  isProvisionalAging,
  PolicyRule,
  scorePriority,
} from "./helpers";

// Shared basic types
interface ServiceContext {
  _userId?: string;
}

// KPI Service -------------------------------------------------------------
export interface KPIRegisterInput {
  id: string;
  name: string;
  target?: number;
  direction?: "lower-better" | "higher-better";
  unit?: string;
  provisional?: boolean;
}
export interface KPIRecord extends Omit<KPIRegisterInput, "provisional"> {
  status: "Active" | "Provisional" | "Archived";
  provisionalSince?: Date;
  archivedAt?: Date;
  archivedRationale?: string;
}
export interface KPIEvaluationInput {
  value: number;
  ts: Date;
  unit?: string;
}
export interface KPIEvaluationResult {
  kpiId: string;
  status: "within" | "breach";
  value: number;
  target: number;
  direction: "lower-better" | "higher-better";
  delta: number;
}

export class InMemoryKPIService {
  private store = new Map<string, KPIRecord>();
  async register(
    input: KPIRegisterInput,
    _ctx?: ServiceContext,
  ): Promise<KPIRecord> {
    if (this.store.has(input.id)) throw new Error("duplicate_kpi_id");
    const status: KPIRecord["status"] = input.provisional
      ? "Provisional"
      : "Active";
    const rec: KPIRecord = {
      ...input,
      target: input.target ?? 0,
      direction: input.direction ?? "lower-better",
      status,
      provisionalSince: input.provisional ? new Date() : undefined,
    };
    this.store.set(rec.id, rec);
    return rec;
  }
  async archive(input: { id: string; rationale: string }): Promise<KPIRecord> {
    const rec = this.store.get(input.id);
    if (!rec) throw new Error("KPI_NOT_FOUND");
    if (!input.rationale) throw new Error("rationale_required");
    const archived: KPIRecord = {
      ...rec,
      status: "Archived",
      archivedAt: new Date(),
      archivedRationale: input.rationale,
    };
    this.store.set(rec.id, archived);
    return archived;
  }
  async evaluate(
    id: string,
    data?: KPIEvaluationInput,
  ): Promise<KPIEvaluationResult> {
    const kpi = this.store.get(id);
    if (!kpi) throw new Error("KPI_NOT_FOUND");
    const value = data?.value ?? 0;
    const target = (kpi as any).target ?? 0;
    const direction = (kpi as any).direction ?? "lower-better";
    const { status, delta } = evaluateKPIValue({ value, target, direction });
    return { kpiId: id, status, value, target, direction, delta };
  }
  async list(): Promise<KPIRecord[]> {
    return [...this.store.values()];
  }
  // Provisional aging check used in scenario test
  agingCheck(now: Date = new Date()) {
    return [...this.store.values()].filter((k) =>
      isProvisionalAging(k.provisionalSince, now),
    );
  }
}

// Policy Service ----------------------------------------------------------
export interface PolicyRegisterInput {
  id: string;
  name: string;
  rules: PolicyRule[];
}
export interface PolicyRecord extends PolicyRegisterInput {}
export interface PolicyEvaluation
  extends ReturnType<typeof aggregatePolicyRules> {}
export interface PolicyAttachmentInput {
  policyId: string;
  kpiId: string;
  thresholds: Record<string, string>;
}
export interface PolicyAttachmentRecord {
  policyId: string;
  kpiId: string;
  resolvedThresholds: Record<string, string>;
  attachedAt: Date;
}

export class InMemoryPolicyService {
  private store = new Map<string, PolicyRecord>();
  private attachments = new Map<string, PolicyAttachmentRecord>();
  
  async register(input: PolicyRegisterInput): Promise<PolicyRecord> {
    this.store.set(input.id, input);
    return input;
  }
  async evaluate(id: string): Promise<PolicyEvaluation> {
    const p = this.store.get(id);
    if (!p) throw new Error("POLICY_NOT_FOUND");
    return aggregatePolicyRules(p.rules);
  }
  async list(): Promise<PolicyRecord[]> {
    return [...this.store.values()];
  }
  async attach(input: PolicyAttachmentInput): Promise<PolicyAttachmentRecord> {
    const key = `${input.policyId}:${input.kpiId}`;
    const existing = this.attachments.get(key);
    
    if (existing) {
      return existing;
    }
    
    const record: PolicyAttachmentRecord = {
      policyId: input.policyId,
      kpiId: input.kpiId,
      resolvedThresholds: input.thresholds,
      attachedAt: new Date(),
    };
    
    this.attachments.set(key, record);
    return record;
  }
}

// Escalation Service ------------------------------------------------------
export interface EscalationTriggerInput {
  pathId: string;
  kpiId: string;
  reason: string;
}
export interface EscalationRecord {
  id: string;
  pathId: string;
  kpiId: string;
  reason: string;
  createdAt: Date;
}

export class InMemoryEscalationService {
  private records: EscalationRecord[] = [];
  async trigger(input: EscalationTriggerInput): Promise<EscalationRecord> {
    const rec: EscalationRecord = {
      id: `REC-${Date.now()}`,
      createdAt: new Date(),
      ...input,
    };
    this.records.push(rec);
    return rec;
  }
  async list(): Promise<EscalationRecord[]> {
    return [...this.records];
  }
}

// Prioritization Service --------------------------------------------------
export interface FeatureScoreInput {
  featureId: string;
  impact: number;
  effort: number;
  _riskReduction: number;
  strategicFit: number;
}
export interface FeatureScoreResult {
  featureId: string;
  total: number;
  priority: "P0" | "P1" | "P2" | "P3";
}

export class InMemoryPrioritizationService {
  async scoreFeature(input: FeatureScoreInput): Promise<FeatureScoreResult> {
    const total = scorePriority(input);
    let priority: FeatureScoreResult["priority"] = "P3";
    if (total > 25) priority = "P0";
    else if (total > 20) priority = "P1";
    else if (total > 15) priority = "P2";
    return { featureId: input.featureId, total, priority };
  }
}

// Risk Service ------------------------------------------------------------
export interface RiskRegisterInput {
  id: string;
  probability: number;
  impact: number;
}
export interface RiskRecord extends RiskRegisterInput {
  exposure: number;
}

export class InMemoryRiskService {
  private store = new Map<string, RiskRecord>();
  
  async register(input: RiskRegisterInput): Promise<RiskRecord> {
    const exposure = computeRiskExposure({
      probability: input.probability,
      impact: input.impact,
    });
    const rec: RiskRecord = { ...input, exposure };
    this.store.set(rec.id, rec);
    return rec;
  }
  
  async list(): Promise<RiskRecord[]> {
    return [...this.store.values()];
  }
  
  async calculateExposure(input: { probability: number; impact: number }): Promise<{ exposure: number }> {
    const exposure = computeRiskExposure(input);
    return { exposure };
  }
}

// Export Supabase Governance Service
export { SupabaseGovernanceService } from "./supabase-governance.service";
