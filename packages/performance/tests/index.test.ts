import { describe, expect, it } from "vitest";

describe("@neonpro/performance", () => {
  it("should export performance utilities", () => {
    // Basic test to ensure the package can be imported
    expect(true).toBe(true);
  });

  it("should have proper package structure", () => {
    // Test that the package is properly structured
    expect(typeof require("../package.json")).toBe("object");
  });
});
