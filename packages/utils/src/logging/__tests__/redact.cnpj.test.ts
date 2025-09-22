import { describe, it, expect } from "vitest";
import { redact } from "../redact";

describe("redact() CNPJ", () => {
  it("redacts common CNPJ pattern", () => {
    const input = "CNPJ: 12.345.678/0001-12";
    const out = redact(input
    expect(out).not.toMatch(/12\.345\.678\/0001-12/
  }
}
