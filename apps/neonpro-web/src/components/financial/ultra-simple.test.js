"use strict";
/**
 * Ultra simple test to isolate the validateAppointmentSlot issue
 */
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
describe("Ultra Simple Debug", function () {
  it("should validate the simplest possible case", function () {
    var result = (0, utils_1.validateAppointmentSlot)("2026-12-31T14:00:00.000Z", 60);
    // Force display in test name
    console.error("FORCED ERROR FOR DISPLAY - Result:", result);
    // Check step by step
    var date = new Date("2026-12-31T14:00:00.000Z");
    var now = new Date();
    var isInFuture = date > now;
    console.error("FORCED ERROR - Date check:", isInFuture);
    var duration = 60;
    var isDurationValid = duration > 0 && duration <= 480;
    console.error("FORCED ERROR - Duration valid:", isDurationValid);
    var isDivisibleBy15 = duration % 15 === 0;
    console.error("FORCED ERROR - Divisible by 15:", isDivisibleBy15);
    expect(result).toBe(true);
  });
});
