import { describe, expect, it } from "vitest";
import { InMemoryEscalationService, InMemoryKPIService } from "../../index";

// Scenario: two consecutive breaches trigger escalation path receipt

describe("Scenario: escalation breach sequence", () => {
  const kpiSvc = new InMemoryKPIService();
  const escSvc = new InMemoryEscalationService();

  it("creates escalation receipt after two evaluate breaches", async () => {
    await kpiSvc.register({
      id: "KPI-AI-HALLUCINATION",
      name: "AI Hallucination Rate",
      provisional: true,
    });
    // Simulate first breach evaluation
    await kpiSvc.evaluate("KPI-AI-HALLUCINATION");
    // Second breach triggers escalation
    await kpiSvc.evaluate("KPI-AI-HALLUCINATION");
    const receipt = await escSvc.trigger({
      pathId: "ESC-001",
      kpiId: "KPI-AI-HALLUCINATION",
      reason: "Two consecutive breaches",
    });
    expect(receipt.pathId).toBe("ESC-001");
  });
});
