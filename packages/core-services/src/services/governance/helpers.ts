// Helper functions for governance services (Phase 1 minimal logic to satisfy tests)
// Keep pure & side-effect free where possible.

export interface RiskExposureInput {
  probability: number;
  impact: number;
}
export const computeRiskExposure = ({
  probability,
  impact,
}: RiskExposureInput) => probability * impact;

export interface KPIEvalInput {
  value: number;
  target: number;
  direction: "lower-better" | "higher-better";
}
export interface KPIEvalResult {
  status: "within" | "breach";
  delta: number;
}
export const evaluateKPIValue = ({
  value,
  target,
  direction,
}: KPIEvalInput): KPIEvalResult => {
  if (direction === "lower-better") {
    if (value <= target) return { status: "within", delta: target - value };
    return { status: "breach", delta: value - target };
  }
  if (value >= target) return { status: "within", delta: value - target };
  return { status: "breach", delta: target - value };
};

export interface PriorityScoreFactors {
  impact: number;
  effort: number;
  riskReduction: number;
  strategicFit: number;
}
// Simple weighted scoring: higher impact, riskReduction, strategicFit better; lower effort better.
export const scorePriority = ({
  impact,
  effort,
  _riskReduction,
  strategicFit,
}: PriorityScoreFactors) => {
  const base = impact * 2 + _riskReduction * 1.5 + strategicFit * 1.2 - effort;
  return base;
};

export interface PolicyRule {
  id: string;
  type: "boolean";
  evaluate: () => boolean;
}
export interface PolicyAggregationResult {
  total: number;
  passed: number;
  status: "pass" | "fail" | "partial";
}
export const aggregatePolicyRules = (
  rules: PolicyRule[],
): PolicyAggregationResult => {
  const results = rules.map((r) => r.evaluate());
  const passed = results.filter(Boolean).length;
  const total = results.length;
  let status: PolicyAggregationResult["status"] = "fail";
  if (passed === total) status = "pass";
  else if (passed > 0) status = "partial";
  return { total, passed, status };
};

// Escalation: simple receipt id generator using timestamp for now (Phase 1 minimal)
export const generateEscalationId = () => `ESC-REC-${Date.now()}`;

// KPI provisional aging check (> 60 days)
export const isProvisionalAging = (
  provisionalSince: Date | undefined,
  now: Date,
) => {
  if (!provisionalSince) return false;
  const diffMs = now.getTime() - provisionalSince.getTime();
  const days = diffMs / (1000 * 60 * 60 * 24);
  return days > 60;
};
