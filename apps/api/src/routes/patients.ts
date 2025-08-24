import { Hono } from "hono";
import { HTTP_STATUS } from "../lib/constants.js";

export const patientRoutes = new Hono();

// Authentication middleware for all patient routes
patientRoutes.use("*", async (c, next) => {
	const auth = c.req.header("Authorization");
	if (!auth?.startsWith("Bearer ")) {
		return c.json({ error: "Authentication required" }, HTTP_STATUS.UNAUTHORIZED);
	}
	await next();
});

patientRoutes.get("/", (c) => {
	return c.json({ message: "Patients list - not implemented" }, HTTP_STATUS.NOT_IMPLEMENTED);
});

patientRoutes.post("/", async (c) => {
	const body = await c.req.json().catch(() => ({
		error: "Invalid JSON payload",
	}));

	// Validate required fields
	if (!(body.name && body.email) || body.lgpd_consent === false) {
		return c.json({ error: "Invalid patient data or missing LGPD consent" }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
	}

	return c.json({ message: "Create patient - not implemented" }, HTTP_STATUS.NOT_IMPLEMENTED);
});

patientRoutes.put("/:id", (c) => {
	return c.json({ message: "Update patient - not implemented" }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
});
