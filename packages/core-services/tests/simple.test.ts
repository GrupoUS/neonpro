/**
 * Simple Test to verify vitest is working
 */

import { describe, expect, it } from "vitest";

describe("Simple Test", () => {
  it("should pass basic test", () => {
    expect(1 + 1).toBe(2);
  });

  it("should handle strings", () => {
    expect("hello").toBe("hello");
  });
});
