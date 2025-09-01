/* eslint-disable react-hooks/rules-of-hooks */
/**
 * Unit tests for ANVISA Controlled Substances service and utilities.
 * Testing framework: auto-adapts to Vitest or Jest based on globals.
 * If using Vitest, vi is available; if using Jest, jest is available.
 */

const usingVitest = typeof (globalThis as unknown).vi !== "undefined";
const usingJest = typeof (globalThis as unknown).jest !== "undefined";

// Aliases for timer and spy methods to avoid Biome hook detection
const viFakeTimers = usingVitest
  ? (globalThis as unknown).vi.useFakeTimers.bind((globalThis as unknown).vi)
  : undefined;
const jestFakeTimers = usingJest
  ? (globalThis as unknown).jest.useFakeTimers.bind((globalThis as unknown).jest)
  : undefined;
const viSetSystemTime = usingVitest
  ? (globalThis as unknown).vi.setSystemTime.bind((globalThis as unknown).vi)
  : undefined;
const jestSetSystemTime = usingJest
  ? (globalThis as unknown).jest.setSystemTime.bind((globalThis as unknown).jest)
  : undefined;
const viRealTimers = usingVitest
  ? (globalThis as unknown).vi.useRealTimers.bind((globalThis as unknown).vi)
  : undefined;
const jestRealTimers = usingJest
  ? (globalThis as unknown).jest.useRealTimers.bind((globalThis as unknown).jest)
  : undefined;
const viSpy = usingVitest
  ? (globalThis as unknown).vi.spyOn.bind((globalThis as unknown).vi)
  : undefined;
const jestSpy = usingJest
  ? (globalThis as unknown).jest.spyOn.bind((globalThis as unknown).jest)
  : undefined;
const viFn = usingVitest
  ? (globalThis as unknown).vi.fn.bind((globalThis as unknown).vi)
  : undefined;
const jestFn = usingJest
  ? (globalThis as unknown).jest.fn.bind((globalThis as unknown).jest)
  : undefined;

const clock = {
  fakeTimers() {
    if (usingVitest) {viFakeTimers?.();}
    else if (usingJest) {jestFakeTimers?.();}
  },
  setSystemTime(d: Date | number) {
    if (usingVitest) {viSetSystemTime?.(d);}
    else if (usingJest) {jestSetSystemTime?.(d);}
  },
  realTimers() {
    if (usingVitest) {viRealTimers?.();}
    else if (usingJest) {jestRealTimers?.();}
  },
  spyOn(obj: unknown, method: string) {
    if (usingVitest) {return viSpy?.(obj, method as unknown);}
    return jestSpy?.(obj, method as unknown);
  },
  fn() {
    if (usingVitest) {return viFn?.();}
    return jestFn?.();
  },
};

import Service, {
  anvisaControlledSubstancesService,
  anvisaUtils,
} from "./anvisa-controlled-substances"; // Adjust import if implementation filename differs

// Helper to reset singleton state between tests
function resetService() {
  anvisaControlledSubstancesService.clearData();
}

// Fixed reference date for deterministic tests: Jan 1, 2025 00:00:00 UTC
const T0 = new Date("2025-01-01T00:00:00.000Z");

describe("ANVISA utils", () => {
  test("getClassInfo returns proper classification info", () => {
    const a1 = anvisaUtils.getClassInfo("A1");
    expect(a1).toBeTruthy();
    expect(a1.name).toMatch(/A1/);
    expect(a1.maxDays).toBe(30);
  });

  test("getPrescriptionTypeColor returns configured color and default fallback", () => {
    expect(anvisaUtils.getPrescriptionTypeColor("receituario-a")).toBe("#fef3c7");
    expect(anvisaUtils.getPrescriptionTypeColor("receituario-b")).toBe("#dbeafe");
    expect(anvisaUtils.getPrescriptionTypeColor("receituario-c")).toBe("#f3f4f6");
    expect(anvisaUtils.getPrescriptionTypeColor("receituario-especial")).toBe("#fce7f3");
    expect(anvisaUtils.getPrescriptionTypeColor("notificacao-receita")).toBe("#ecfdf5");
    // @ts-expect-error testing fallback behavior with unknown key (runtime fallback to receituario-c)
    expect(anvisaUtils.getPrescriptionTypeColor("unknown-type")).toBe("#f3f4f6");
  });

  test("formatPrescriptionNumber keeps segments in place", () => {
    expect(anvisaUtils.formatPrescriptionNumber("ABC-12345-XY")).toBe("ABC-12345-XY");
    // No hyphens -> regex won't match; returns unchanged
    expect(anvisaUtils.formatPrescriptionNumber("ABC12345XY")).toBe("ABC12345XY");
  });

  test("isPrescriptionExpiringSoon correctly compares against cutoff", () => {
    clock.fakeTimers();
    clock.setSystemTime(T0);
    const in6Days = new Date(T0.getTime() + 6 * 24 * 60 * 60 * 1000);
    const in8Days = new Date(T0.getTime() + 8 * 24 * 60 * 60 * 1000);
    expect(anvisaUtils.isPrescriptionExpiringSoon(in6Days)).toBe(true);
    expect(anvisaUtils.isPrescriptionExpiringSoon(in8Days)).toBe(false);
    clock.realTimers();
  });
});

describe("ANVISAControlledSubstancesService (singleton + basic queries)", () => {
  beforeEach(() => resetService());

  test("getInstance returns a singleton", () => {
    const s1 = Service.getInstance();
    const s2 = Service.getInstance();
    expect(s1).toBe(s2);
  });

  test("searchSubstances matches by substanceName, commercialName, and activeIngredient; sorted by name", () => {
    const s = Service.getInstance();

    // Single-match queries
    expect(s.searchSubstances("Diazepam").map(x => x.id)).toStrictEqual(["anvisa-001"]);
    expect(s.searchSubstances("Valium").map(x => x.id)).toStrictEqual(["anvisa-001"]);
    expect(s.searchSubstances("Sulfato de Morfina").map(x => x.id)).toStrictEqual(["anvisa-002"]);

    // Multiple results sorted by substanceName
    const results = s.searchSubstances("i"); // "Isotretinoína", "Morfina"
    expect(results.length).toBeGreaterThanOrEqual(2);
    const names = results.map(r => r.substanceName);
    expect(names[0] <= names[1]).toBe(true);
  });

  test("getSubstance returns null for unknown id", () => {
    const s = Service.getInstance();
    expect(s.getSubstance("does-not-exist")).toBeNull();
  });

  test("getSubstancesByClass filters and sorts", () => {
    const s = Service.getInstance();
    const b1 = s.getSubstancesByClass("B1");
    expect(b1.map(x => x.substanceName)).toStrictEqual(["Diazepam"]);
    const c2 = s.getSubstancesByClass("C2");
    expect(c2.map(x => x.substanceName)).toStrictEqual(["Isotretinoína"]);
  });

  test("getControlledClassesInfo exposes classification constants", () => {
    const s = Service.getInstance();
    const info = s.getControlledClassesInfo();
    expect(info.A1.maxDays).toBe(30);
    expect(info.B1.prescriptionType).toBe("receituario-b");
  });
});

describe("Prescription creation validations", () => {
  beforeEach(() => {
    resetService();
    clock.fakeTimers();
    clock.setSystemTime(T0);
  });
  afterEach(() => {
    clock.realTimers();
  });

  const baseData = {
    substanceId: "anvisa-001", // Diazepam (B1, maxDays 60)
    prescriptionType: "receituario-b",
    quantity: 10,
    treatmentDays: 30,
    patientId: "patient-1",
    doctorCRM: "CRM-12345",
  } as unknown; // Use unknown to avoid test compile-time dependency on internal types

  test("fails when substance does not exist", async () => {
    const s = Service.getInstance();
    const res = await s.createControlledPrescription({ ...baseData, substanceId: "missing-123" });
    expect(res.isValid).toBe(false);
    expect(res.errors.join(" ")).toMatch(/Substância não encontrada/i);
  });

  test("fails when prescription type does not match substance class", async () => {
    const s = Service.getInstance();
    // For Diazepam (B1), wrong type 'receituario-a'
    const res = await s.createControlledPrescription({
      ...baseData,
      prescriptionType: "receituario-a",
    });
    expect(res.isValid).toBe(false);
    expect(res.errors[0]).toMatch(/Tipo de receituário incorreto/i);
  });

  test("fails when treatmentDays exceeds class maxDays", async () => {
    const s = Service.getInstance();
    const res = await s.createControlledPrescription({ ...baseData, treatmentDays: 120 });
    expect(res.isValid).toBe(false);
    expect(res.errors[0]).toMatch(/Duração do tratamento excede/i);
  });

  test("succeeds with valid data and returns warnings equal to substance restrictions", async () => {
    const s = Service.getInstance();
    const res = await s.createControlledPrescription(baseData);
    expect(res.isValid).toBe(true);
    expect(res.data!.status).toBe("prescribed");
    expect(res.data!.id).toMatch(/^ANV-/);
    expect(res.warnings.length).toBeGreaterThan(0);
    // Validity date is 30 days after T0
    const expectedValidUntil = new Date(T0.getTime() + 30 * 24 * 60 * 60 * 1000);
    expect(+res.data!.validUntil).toBe(+expectedValidUntil);
  });
});

describe("Dispensation flow", () => {
  beforeEach(() => {
    resetService();
    clock.fakeTimers();
    clock.setSystemTime(T0);
  });
  afterEach(() => {
    clock.realTimers();
  });

  async function createRx(quantity = 10) {
    const s = Service.getInstance();
    const res = await s.createControlledPrescription({
      substanceId: "anvisa-001", // B1 Diazepam
      prescriptionType: "receituario-b",
      quantity,
      treatmentDays: 30,
      patientId: "p-1",
      doctorCRM: "CRM-1",
    } as unknown);
    expect(res.isValid).toBe(true);
    return res.data!;
  }

  test("fails when prescription is not found", async () => {
    const s = Service.getInstance();
    const res = await s.recordDispensation("nope", 5, "pharma-1");
    expect(res.isValid).toBe(false);
    expect(res.errors[0]).toMatch(/não encontrada/i);
  });

  test("fails when prescription is expired", async () => {
    const s = Service.getInstance();
    const rx = await createRx(5);
    // Advance time > 30 days to expire
    clock.setSystemTime(new Date(T0.getTime() + 31 * 24 * 60 * 60 * 1000));
    const res = await s.recordDispensation(rx.id, 1, "pharma-9");
    expect(res.isValid).toBe(false);
    expect(res.errors[0]).toMatch(/expirada/i);
  });

  test("fails when trying to dispense more than prescribed", async () => {
    const s = Service.getInstance();
    const rx = await createRx(5);
    const res = await s.recordDispensation(rx.id, 6, "pharma-9");
    expect(res.isValid).toBe(false);
    expect(res.errors[0]).toMatch(/excede o prescrito/i);
  });

  test("supports partial then full dispensation and updates status", async () => {
    const s = Service.getInstance();
    const rx = await createRx(10);

    const part = await s.recordDispensation(rx.id, 4, "pharma-2");
    expect(part.isValid).toBe(true);
    expect(part.data!.dispensedQuantity).toBe(4);
    expect(part.data!.status).toBe("partially-dispensed");

    const full = await s.recordDispensation(rx.id, 6, "pharma-2");
    expect(full.isValid).toBe(true);
    expect(full.data!.dispensedQuantity).toBe(10);
    expect(full.data!.status).toBe("dispensed");
  });

  test("rejects dispensation when status is not dispensable", async () => {
    const s = Service.getInstance();
    const rx = await createRx(2);
    const full = await s.recordDispensation(rx.id, 2, "pharma-x");
    expect(full.isValid).toBe(true);
    // Attempt to dispense again after 'dispensed'
    const again = await s.recordDispensation(rx.id, 1, "pharma-x");
    expect(again.isValid).toBe(false);
    expect(again.errors[0]).toMatch(/não pode ser dispensada/i);
  });
});

describe("Queries: by patient/doctor, expiring, stats, audit trail, and compliance report", () => {
  beforeEach(() => {
    resetService();
    clock.fakeTimers();
    clock.setSystemTime(T0);
  });
  afterEach(() => {
    clock.realTimers();
  });

  async function createRx(
    args: Partial<{
      qty: number;
      patientId: string;
      doctorCRM: string;
      substanceId: string;
      type: string;
      tDays: number;
    }> = {},
  ) {
    const s = Service.getInstance();
    const res = await s.createControlledPrescription({
      substanceId: args.substanceId ?? "anvisa-001", // B1
      prescriptionType: (args.type ?? "receituario-b") as unknown,
      quantity: args.qty ?? 5,
      treatmentDays: args.tDays ?? 30,
      patientId: args.patientId ?? "p-1",
      doctorCRM: args.doctorCRM ?? "CRM-1",
    } as unknown);
    expect(res.isValid).toBe(true);
    return res.data!;
  }

  test("getPrescriptionsByPatient returns prescriptions sorted by date desc", async () => {
    const s = Service.getInstance();
    const r1 = await createRx({ patientId: "alice", qty: 3 });
    clock.setSystemTime(new Date(T0.getTime() + 1000)); // +1s
    const r2 = await createRx({ patientId: "alice", qty: 1 });
    const list = s.getPrescriptionsByPatient("alice");
    expect(list.map(r => r.id)).toStrictEqual([r2.id, r1.id]);
  });

  test("getPrescriptionsByDoctor returns prescriptions sorted by date desc", async () => {
    const s = Service.getInstance();
    const r1 = await createRx({ doctorCRM: "CRM-77" });
    clock.setSystemTime(new Date(T0.getTime() + 2000));
    const r2 = await createRx({ doctorCRM: "CRM-77" });
    const list = s.getPrescriptionsByDoctor("CRM-77");
    expect(list.map(r => r.id)).toStrictEqual([r2.id, r1.id]);
  });

  test("getExpiringPrescriptions returns those due within N days and sorts by validUntil asc", async () => {
    const s = Service.getInstance();
    // Create two prescriptions at different times to yield different validUntil
    const r1 = await createRx({ patientId: "pE", qty: 1 }); // validUntil = T0 + 30d
    clock.setSystemTime(new Date(T0.getTime() + 10 * 24 * 60 * 60 * 1000)); // +10d
    const r2 = await createRx({ patientId: "pE", qty: 1 }); // validUntil = T0 + 40d

    // Now move 'now' close to r1.validUntil so r1 is within 7 days, r2 likely outside unless we extend days
    clock.setSystemTime(new Date(T0.getTime() + 25 * 24 * 60 * 60 * 1000)); // Now = T0 + 25d; cutoff = +32d
    let expiring = s.getExpiringPrescriptions(); // default 7 days
    expect(expiring.map(x => x.id)).toContain(r1.id);
    // r2.validUntil = T0 + 40d -> not in default 7-day window
    expect(expiring.map(x => x.id)).not.toContain(r2.id);

    // With a larger window, both can appear and order is by validUntil asc (r1 first)
    expiring = s.getExpiringPrescriptions(20);
    expect(expiring.map(x => x.id)).toStrictEqual([r1.id, r2.id]);
  });

  test("getTrackingStatistics counts totals and classes without expired prescriptions", async () => {
    const s = Service.getInstance();
    const r1 = await createRx({ substanceId: "anvisa-001", type: "receituario-b" }); // B1
    const r2 = await createRx({ substanceId: "anvisa-003", type: "receituario-c" }); // C2
    await s.recordDispensation(r1.id, r1.quantity, "ph-1"); // dispensed

    const stats = s.getTrackingStatistics();
    expect(stats.totalPrescriptions).toBe(2);
    expect(stats.prescriptionsPerClass.B1).toBeGreaterThanOrEqual(1);
    expect(stats.prescriptionsPerClass.C2).toBeGreaterThanOrEqual(1);
    expect(stats.dispensedPrescriptions).toBe(1);
    // No pathway to set 'expired' status via public API; stays 0
    expect(stats.expiredPrescriptions).toBe(0);
    // Substances count comes from mock DB (3)
    expect(stats.totalSubstances).toBeGreaterThanOrEqual(3);
  });

  test("getAuditTrail returns only 'anvisa' entries, limited and newest-first", async () => {
    const s = Service.getInstance();
    // Create 3 prescriptions (each adds an audit entry)
    await createRx({ qty: 1 });
    await createRx({ qty: 1 });
    const last = await createRx({ qty: 1 });

    const trail = s.getAuditTrail(2);
    expect(trail).toHaveLength(2);
    expect(trail[0].entityId).toBe(last.id); // newest first
    expect(trail.every(e => e.complianceType === "anvisa")).toBe(true);
  });

  test("generateComplianceReport aggregates statistics and applies compliance scoring deductions for expiring items", async () => {
    const s = Service.getInstance();
    // Create one prescription that will be within 7 days window
    const rx = await createRx({ qty: 1 });
    // Move time so that it becomes expiring soon (validUntil = T0 + 30d; set now = T0 + 25d)
    clock.setSystemTime(new Date(T0.getTime() + 25 * 24 * 60 * 60 * 1000));
    const report = s.generateComplianceReport();
    expect(report.success).toBe(true);
    expect(report.data.statistics.totalPrescriptions).toBeGreaterThanOrEqual(1);
    // With 1 expiring and 0 expired: score = 100 - min(10, 1) = 99
    expect(report.data.complianceScore).toBe(99);
    expect(report.message).toMatch(/gerado com sucesso/i);
  });
});

describe("clearData resets state but keeps substances loaded", () => {
  test("clearData empties prescriptions and audit trail while reloading substances database", async () => {
    clock.fakeTimers();
    clock.setSystemTime(T0);
    const s = Service.getInstance();
    const res = await s.createControlledPrescription({
      substanceId: "anvisa-001",
      prescriptionType: "receituario-b",
      quantity: 2,
      treatmentDays: 30,
      patientId: "p-x",
      doctorCRM: "CRM-x",
    } as unknown);
    expect(res.isValid).toBe(true);

    // Sanity
    expect(s.getTrackingStatistics().totalPrescriptions).toBe(1);
    expect(s.getAuditTrail(10).length).toBeGreaterThanOrEqual(1);

    s.clearData();

    expect(s.getTrackingStatistics().totalPrescriptions).toBe(0);
    expect(s.getAuditTrail(10)).toHaveLength(0);

    // Substances still available
    const b1 = s.getSubstancesByClass("B1");
    expect(b1.length).toBeGreaterThanOrEqual(1);

    clock.realTimers();
  });
});
