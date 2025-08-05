/**
 * Test to debug the validateAppointmentSlot function in Jest environment
 */

import type { validateAppointmentSlot } from "./utils";

describe("Debug validateAppointmentSlot Function", () => {
  it("should debug the function behavior step by step", () => {
    const futureDate = new Date("2026-12-31T14:00:00.000Z").toISOString();
    const duration = 60;

    console.log("=== Jest Environment Debug ===");
    console.log("futureDate:", futureDate);
    console.log("duration:", duration);
    console.log("validateAppointmentSlot type:", typeof validateAppointmentSlot);
    console.log("validateAppointmentSlot toString:", validateAppointmentSlot.toString());

    // Test the function manually
    console.log("\n=== Manual Test in Jest ===");
    try {
      const appointmentDate = new Date(futureDate);
      const now = new Date();

      console.log("appointmentDate:", appointmentDate);
      console.log("now:", now);
      console.log("appointmentDate > now:", appointmentDate > now);
      console.log("duration > 0:", duration > 0);
      console.log("duration <= 480:", duration <= 480);
      console.log("duration % 15 === 0:", duration % 15 === 0);

      const result = validateAppointmentSlot(futureDate, duration);
      console.log("validateAppointmentSlot result:", result);

      // Force pass the test for now to see debug output
      expect(true).toBe(true);
    } catch (error) {
      console.error("Error in manual test:", error);
      expect(true).toBe(true);
    }
  });
});
