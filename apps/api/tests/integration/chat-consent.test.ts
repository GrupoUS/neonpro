import { Hono } from "hono";
import { describe, expect, it } from "vitest";

async function api(path: string, init?: RequestInit) {
  process.env.SUPABASE_URL ??= "http://localhost:54321";
  process.env.SUPABASE_SERVICE_ROLE_KEY ??= "service_role_test_key";
  process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://localhost:54321";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "anon_test_key";
  const { default: chat } = await import("../../src/routes/chat");
  const app = new Hono();
  app.route("/v1/chat", chat);
  const url = new URL(`http://local.test${path}`);
  return app.request(url, init);
}

describe("Integration: consent validation", () => {
  it("returns 403 without consent on non-mock requests", async () => {
    const res = await api("/v1/chat/query", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-user-id": "u-consent-1",
        "x-clinic-id": "c1",
        "x-role": "CLINICAL_STAFF",
      },
      body: JSON.stringify({
        question: "Qual saldo?",
        sessionId: "11111111-2222-3333-4444-555555555555",
      }),
    });
    expect(res.status).toBe(403);
  });

  it("allows 200 when mock=true even if consent missing", async () => {
    const res = await api("/v1/chat/query?mock=true", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-user-id": "u-consent-2",
        "x-clinic-id": "c1",
        "x-role": "CLINICAL_STAFF",
      },
      body: JSON.stringify({
        question: "mock:balance",
        sessionId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      }),
    });
    expect(res.status).toBe(200);
  });
});
