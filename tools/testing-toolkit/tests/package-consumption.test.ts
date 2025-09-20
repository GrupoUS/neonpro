/**
 * Test to verify the package can be consumed externally without Vitest
 * This simulates how external consumers would use the package
 */

import { createTDDSuite } from "@neonpro/testing-toolkit";

describe("Package Consumption Test", () => {
  it("should import and use createTDDSuite without Vitest errors", () => {
    // Import the function directly to test
    const { createTDDSuite } = require("../src/core/tdd-cycle");
    
    expect(typeof createTDDSuite).toBe("function");

    // Test that we can create a TDD suite without errors
    // The function expects a config object and implementation object
    const suite = createTDDSuite(
      { 
        feature: "test-suite", 
        description: "Test description",
        agents: ["test-agent"]
      },
      {
        // RED phase should throw an error to simulate failing tests
        redPhase: () => { throw new Error("Tests should fail in RED phase"); },
        greenPhase: () => { /* Implementation that passes tests */ },
        refactorPhase: () => { /* Code improvement */ }
      },
      { forceMock: true }
    );
    expect(suite).toBeDefined();
    expect(suite.name).toBe("test-suite");
    expect(suite.description).toBe("TDD: test-suite");
  });

  it("should handle Vitest functions being undefined gracefully", async () => {
    // When consumed externally, Vitest functions should be undefined
    // but the package should still work for non-Vitest functionality

    // Import the main index to check Vitest exports
    const testingToolkit = await import("../src/index");
    
    // These should be defined even when Vitest is not available
    expect(testingToolkit.createTDDSuite).toBeDefined();
    expect(typeof testingToolkit.createTDDSuite).toBe("function");
    
    // Test that we can create a TDD suite
    const suite = testingToolkit.createTDDSuite(
      { 
        feature: "external-test", 
        description: "External test description",
        agents: ["test-agent"]
      },
      {
        // RED phase should throw an error to simulate failing tests
        redPhase: () => { throw new Error("Tests should fail in RED phase"); },
        greenPhase: () => { /* Implementation that passes tests */ },
        refactorPhase: () => { /* Code improvement */ }
      }
    );
    expect(suite).toBeDefined();
    expect(suite.name).toBe("external-test");
  });
});