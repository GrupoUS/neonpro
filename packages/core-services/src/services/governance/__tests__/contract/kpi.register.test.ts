import { describe, expect, it } from "vitest";
import { InMemoryKPIService } from "../../index";

// Contract: duplicate rejection & provisionalSince set when provisional flag true

describe("KPIService.register (contract)", () => {
  it(_"sets provisionalSince when provisional flag provided",_async () => {
    const rec = await svc.register({
      id: "KPI-NO_SHOW",
      name: "No-show Rate",
      provisional: true,
    }
    expect(rec.status).toBe("Provisional"
    expect(rec.provisionalSince).toBeInstanceOf(Date
  }

  it(_"rejects duplicate id registration",_async () => {
    await expect(
      svc.register({ id: "KPI-NO_SHOW", name: "No-show Rate" }),
    ).rejects.toThrow(/duplicate/i
  }
}
