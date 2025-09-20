import { describe, expect, it } from "vitest";
import { createTDDSuite } from "@neonpro/testing-toolkit";

describe("TDD Suite Test", () => {
  createTDDSuite("Example TDD Cycle", {
    redPhase: () => {
      // This should fail initially
      expect(false).toBe(true);
    },
    greenPhase: () => {
      // This should pass
      expect(true).toBe(true);
    },
    refactorPhase: () => {
      // This should also pass
      expect(true).toBe(true);
    },
  });
});