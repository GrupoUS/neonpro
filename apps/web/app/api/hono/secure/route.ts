import { Hono } from "hono";
import { handle } from "hono/vercel";

export const runtime = "nodejs";

const app = new Hono();

app.get("/", async (c) => {
  // TODO: integrate Prisma or other Node-only deps
  return c.json({ ok: true, runtime: "node" });
});

export const GET = handle(app);
