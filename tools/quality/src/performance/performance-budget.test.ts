// T009 Performance budget scaffold test (RED)
// Expects performance-budget.json with keys LCP, CLS, TTFB.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("T009 performance budget", () => {
  it("contains required metric keys", () => {
    const p = join(
      process.cwd(),
      "..",
      "..",
      "tools",
      "testing",
      "performance-budget.json"
    );
    
    let data: any;
    try {
      data = JSON.parse(readFileSync(p, "utf-8"));
    } catch {
      data = {};
    }
    expect(data).toHaveProperty("LCP");
    expect(data).toHaveProperty("CLS");
    expect(data).toHaveProperty("TTFB");
  });
});
