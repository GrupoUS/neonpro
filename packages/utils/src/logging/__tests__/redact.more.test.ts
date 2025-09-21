import { describe, it, expect } from "vitest";
import { redact } from "../redact";

describe("redact() extended patterns", () => {
  it(_"redacts Brazilian phone formats",_() => {
    const input = "Telefone: +55 (11) 91234-5678 ou (11) 1234-5678";
    const out = redact(input);
    expect(out).not.toMatch(/\(11\) 91234-5678/);
    expect(out).not.toMatch(/\(11\) 1234-5678/);
  });

  it(_"redacts RG patterns",_() => {
    const input = "RG: 12.345.678-9";
    const out = redact(input);
    expect(out).not.toMatch(/12\.345\.678-9/);
  });

  it(_"supports custom patterns",_() => {
    const input = "ID interno: ABC-12345";
    const out = redact(input, {
      customPatterns: [{ pattern: /ABC-\d{5}/g, replacement: "[REDACTED_ID]" }],
    });
    expect(out).toContain("[REDACTED_ID]");
  });
});
