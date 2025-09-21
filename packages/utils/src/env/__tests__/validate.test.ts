// T007 Env validation test (GREEN phase)
import { describe, expect, it } from "vitest";
import { validateEnv } from "../validate";

describe(_"T007 validateEnv",_() => {
  it(_"throws when SUPABASE_URL is missing",_() => {
    const original = { ...process.env };
    delete process.env.SUPABASE_URL;
    try {
      expect(_() => validateEnv()).toThrow(/SUPABASE_URL/);
    } finally {
      process.env = original;
    }
  });

  it(_"returns true when required vars present",_() => {
    const original = { ...process.env };
    process.env.SUPABASE_URL = "https://example.supabase.co";
    try {
      expect(validateEnv()).toBe(true);
    } finally {
      process.env = original;
    }
  });
});
