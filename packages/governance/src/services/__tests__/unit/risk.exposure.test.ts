import { describe, expect, it } from "vitest";
import { InMemoryRiskService } from "../../index";

describe("Risk exposure recompute", () => {
  it(_"exposure = probability * impact",_async () => {
    const svc = new InMemoryRiskService(
    const r = await svc.register({ id: "RISK-1", probability: 3, impact: 4 }
    expect(r.exposure).toBe(12
  }
}
