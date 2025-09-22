// T007 Env validation test (GREEN phase)
import { describe, expect, it } from "vitest";
import { validateEnv } from "../validate";

describe("T007 validateEnv", () => {
  it("throws when SUPABASE_URL is missing", () => {
    const original = { ...process.env };
    delete process.env.SUPABASE_URL;
    try {
      expect(() => validateEnv()).toThrow(/SUPABASE_URL/
    } finally {
      process.env = original;
    }
  }

  it("returns true when required vars present", () => {
    const original = { ...process.env };
    process.env.SUPABASE_URL = "https://example.supabase.co";
    try {
      expect(validateEnv()).toBe(true);
    } finally {
      process.env = original;
    }
  }
}
