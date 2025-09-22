import { describe, expect, it } from "vitest";
import { InMemoryEscalationService } from "../../index";

describe("EscalationService.trigger (contract)", () => {
  it(_"returns receipt id and timestamp",_async () => {
<<<<<<< HEAD
    const svc = new InMemoryEscalationService(
=======
    const svc = new InMemoryEscalationService();
>>>>>>> origin/main
    const receipt = await svc.trigger({
      pathId: "ESC-001",
      kpiId: "KPI-AI-HALLUCINATION",
      reason: "Threshold breach",
    }
    expect(receipt.id).toMatch(/REC-/
    expect(receipt.createdAt).toBeInstanceOf(Date
  }
}
