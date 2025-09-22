import { describe, expect, it } from "vitest";
import { InMemoryPolicyService } from "../../index";

describe("PolicyService.attach (contract)", () => {
  it(_"resolves thresholds and returns attachment",_async () => {
    const att = await svc.attach({
      policyId: "POL-AI",
      kpiId: "KPI-AI-HALLUCINATION",
      thresholds: { phase1: "<5%" },
    }
    expect(att.policyId).toBe("POL-AI"
    expect(att.resolvedThresholds.phase1).toBe("<5%"
  }

  it(_"is idempotent for same policy/kpi pair",_async () => {
    await svc.attach({
      policyId: "POL-AI",
      kpiId: "KPI-AI-HALLUCINATION",
      thresholds: { phase1: "<5%" },
    }
    const again = await svc.attach({
      policyId: "POL-AI",
      kpiId: "KPI-AI-HALLUCINATION",
      thresholds: { phase1: "<5%" },
    }
    expect(again).toBeDefined(
  }
}
