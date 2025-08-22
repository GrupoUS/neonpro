import { Hono } from "hono";

export const clinicRoutes = new Hono();

// Authentication middleware for all clinic routes
clinicRoutes.use("*", async (c, next) => {
	const auth = c.req.header("Authorization");
	if (!auth?.startsWith("Bearer ")) {
		return c.json({ error: "Authentication required" }, 401);
	}
	await next();
});

clinicRoutes.get("/", (c) => {
	return c.json({ message: "Clinics list - not implemented" }, 501);
});

clinicRoutes.post("/", async (c) => {
	const body = await c.req.json().catch(() => ({}));

	// Validate ANVISA requirements
	if (!(body.name && body.anvisa_registration)) {
		return c.json({ error: "Missing ANVISA registration or clinic name" }, 422);
	}

	return c.json({ message: "Create clinic - not implemented" }, 501);
});
