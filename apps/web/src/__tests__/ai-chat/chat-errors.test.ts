import { describe, expect, it } from "vitest";

// RED: no implementation yet; we assert that importing a guard throws until implemented

describe("AI Chat — error handling", () => {
  it("placeholder error helper returns generic message", async () => {
    const mod = await import("@/lib/ai-chat/errors");
    expect(typeof mod.toUserMessage).toBe("function");
    expect(mod.toUserMessage(new Error("x"))).toContain("unavailable");
  });
});
