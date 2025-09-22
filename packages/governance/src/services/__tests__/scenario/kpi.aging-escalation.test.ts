import { describe, expect, it } from "vitest";
import { InMemoryEscalationService, InMemoryKPIService } from "../../index";

// Scenario: KPI remains provisional for >60 days triggers escalation

describe("Scenario: KPI provisional aging escalation", () => {
  it(_"escalates after 61 days provisional",_async () => {
    const kpiSvc = new InMemoryKPIService();
    const escSvc = new InMemoryEscalationService();
    await kpiSvc.register({
      id: "KPI-NO_SHOW",
      name: "No-show Rate",
      provisional: true,
    });
    // Time travel then evaluate
    const sixtyOneDaysLater = new Date(Date.now() + 61 * 24 * 60 * 60 * 1000);
    await kpiSvc.evaluate("KPI-NO_SHOW", sixtyOneDaysLater);
    const receipt = await escSvc.trigger({
      pathId: "ESC-003",
      kpiId: "KPI-NO_SHOW",
      reason: "Provisional aging > 60 days",
    });
    expect(receipt.pathId).toBe("ESC-003");
  });
});
