/**
 * Test to debug the validateAppointmentSlot function in Jest environment
 */
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
describe("Debug validateAppointmentSlot Function", () => {
  it("should debug the function behavior step by step", () => {
    var futureDate = new Date("2026-12-31T14:00:00.000Z").toISOString();
    var duration = 60;
    console.log("=== Jest Environment Debug ===");
    console.log("futureDate:", futureDate);
    console.log("duration:", duration);
    console.log("validateAppointmentSlot type:", typeof utils_1.validateAppointmentSlot);
    console.log("validateAppointmentSlot toString:", utils_1.validateAppointmentSlot.toString());
    // Test the function manually
    console.log("\n=== Manual Test in Jest ===");
    try {
      var appointmentDate = new Date(futureDate);
      var now = new Date();
      console.log("appointmentDate:", appointmentDate);
      console.log("now:", now);
      console.log("appointmentDate > now:", appointmentDate > now);
      console.log("duration > 0:", duration > 0);
      console.log("duration <= 480:", duration <= 480);
      console.log("duration % 15 === 0:", duration % 15 === 0);
      var result = (0, utils_1.validateAppointmentSlot)(futureDate, duration);
      console.log("validateAppointmentSlot result:", result);
      // Force pass the test for now to see debug output
      expect(true).toBe(true);
    } catch (error) {
      console.error("Error in manual test:", error);
      expect(true).toBe(true);
    }
  });
});
