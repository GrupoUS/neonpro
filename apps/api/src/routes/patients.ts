import { Hono } from "hono";

export const patientRoutes = new Hono();

// Authentication middleware for all patient routes
patientRoutes.use("*", async (c, next) => {
	const auth = c.req.header("Authorization");
	if (!auth?.startsWith("Bearer ")) {
		return c.json({ error: "Authentication required" }, 401);
	}
	await next();
});

patientRoutes.get("/", (c) => {
	return c.json({ message: "Patients list - not implemented" }, 501);
});

patientRoutes.post("/", async (c) => {
	const body = await c.req.json().catch(() => ({}));

	// Validate required fields
	if (!(body.name && body.email) || body.lgpd_consent === false) {
		return c.json(
			{ error: "Invalid patient data or missing LGPD consent" },
			422,
		);
	}

	return c.json({ message: "Create patient - not implemented" }, 501);
});

patientRoutes.put("/:id", (c) => {
	return c.json({ message: "Update patient - not implemented" }, 422);
});
