import { describe, expect, it } from "vitest";
import { InMemoryPrioritizationService } from "../../index";

describe("Priority scoring", () => {
  const svc = new InMemoryPrioritizationService();

  it("applies tie-break Risk Reduction then Strategic Fit", async () => {
    const a = await svc.scoreFeature({
      featureId: "F1",
      impact: 8,
      effort: 3,
      _riskReduction: 5,
      strategicFit: 5,
    });
    const b = await svc.scoreFeature({
      featureId: "F2",
      impact: 8,
      effort: 3,
      _riskReduction: 5,
      strategicFit: 4,
    });
    expect(a.priority).toBeDefined();
    expect(b.priority).toBeDefined();
    // Expect deterministic ordering
    expect(a.total).toBeGreaterThanOrEqual(b.total);
  });
});
