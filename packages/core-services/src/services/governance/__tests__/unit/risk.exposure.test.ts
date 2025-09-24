import { describe, expect, it } from "vitest";
import { InMemoryRiskService } from "../../index";

describe("Risk exposure recompute", () => {
  const svc = new InMemoryRiskService();

  it("exposure = probability * impact", async () => {
    const risk = await svc.calculateExposure({
      probability: 0.7,
      impact: 100000,
    });
    expect(risk.exposure).toBe(70000);
  });
});