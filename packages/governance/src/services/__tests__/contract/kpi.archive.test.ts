import { describe, expect, it } from "vitest";
import { InMemoryKPIService } from "../../index";

describe("KPIService.archive (contract)", () => {
  it(_"requires rationale and sets status Archived",_async () => {
<<<<<<< HEAD
    const svc = new InMemoryKPIService(
    await svc.register({ id: "KPI-X", name: "X Metric" }
=======
    const svc = new InMemoryKPIService();
    await svc.register({ id: "KPI-X", name: "X Metric" });
>>>>>>> origin/main
    const archived = await svc.archive({
      id: "KPI-X",
      rationale: "Replaced by KPI-Y",
    }
    expect(archived.status).toBe("Archived"
  }

  it(_"throws if rationale missing",_async () => {
<<<<<<< HEAD
    const svc = new InMemoryKPIService(
    await svc.register({ id: "KPI-Y", name: "Y Metric" }
=======
    const svc = new InMemoryKPIService();
    await svc.register({ id: "KPI-Y", name: "Y Metric" });
>>>>>>> origin/main
    // @ts-expect-error testing missing rationale
    await expect(svc.archive({ id: "KPI-Y" })).rejects.toThrow(/rationale/i
  }
}
