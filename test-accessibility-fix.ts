/**
 * Test to validate accessibility testing setup
 * This should help identify the issue with toHaveNoViolations
 */

import { toHaveNoViolations } from "vitest-axe";
import { expect } from "vitest";

// Test the matcher import
describe("Accessibility Setup Validation", () => {
  test("toHaveNoViolations should be available", () => {
    expect(typeof toHaveNoViolations).toBe("function");
  });

  test("expect.extend should work with toHaveNoViolations", () => {
    expect(() => {
      expect.extend({ toHaveNoViolations });
    }).not.toThrow();
  });
});
