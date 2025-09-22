// T042 Redaction test (RED)
// Expects redact() to mask emails and CPF patterns.
import { describe, expect, it } from "vitest";
import * as redactModule from "../redact";

describe("T042 redact", () => {
  it("masks email and CPF", () => {
    if (typeof (redactModule as any).redact !== "function") {
      expect(typeof (redactModule as any).redact).toBe("function"); // force fail until implemented
      return;
    }
    const input = "Contato: user@example.com CPF: 123.456.789-00";
    const out = (redactModule as any).redact(input);
    expect(out).not.toContain("user@example.com");
    expect(out).not.toMatch(/123\.456\.789-00/);
  });
});
