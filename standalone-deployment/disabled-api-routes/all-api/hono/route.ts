import { Hono } from "hono";
import { handle } from "hono/vercel";

export const runtime = "edge";

const app = new Hono();

app.get("/", (c) => c.json({ ok: true, runtime: "edge" }));

export const GET = handle(app);
