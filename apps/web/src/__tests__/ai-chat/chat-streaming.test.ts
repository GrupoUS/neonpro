import { aiConfig } from "@neonpro/config";
import type { ChatMessage, ChatSession } from "@neonpro/types";
import { describe, expect, it } from "vitest";

// RED: streaming pipeline not implemented yet; we assert minimal contracts/types are wired

describe("AI Chat — streaming pipeline (Phase 1)", () => {
  it("wires types and env flags correctly", () => {
    const session: ChatSession = {
      id: "s1",
      clinicId: "c1",
      userId: "u1",
      startedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      locale: "pt-BR",
    };

    const msg: ChatMessage = {
      id: "m1",
      sessionId: session.id,
      role: "user",
      content: "Olá, quero saber sobre um tratamento",
      createdAt: new Date().toISOString(),
    };

    expect(session.id).toBe("s1");
    expect(msg.role).toBe("user");
    // Env flag should be boolean
    expect(typeof aiConfig.AI_CHAT_MOCK_MODE).toBe("boolean");
  });

  it("streaming util yields chunks in mock mode", async () => {
    const mod = await import("@/lib/ai-chat/streaming");
    const itr = await mod.startChatStream({ sessionId: "s1", text: "Olá" });
    const out: string[] = [];
    for await (const ev of itr) {
      if (ev.type === "text") out.push(ev.delta);
      if (ev.type === "done") break;
    }
    expect(out.join("")).toContain("estéticos");
  });
});
