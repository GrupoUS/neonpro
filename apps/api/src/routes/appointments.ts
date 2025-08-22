import { Hono } from "hono";
import { HTTP_STATUS, RESPONSE_MESSAGES } from "../lib/constants";

export const appointmentRoutes = new Hono();

// Authentication middleware for all appointment routes
appointmentRoutes.use("*", async (c, next) => {
	const auth = c.req.header("Authorization");
	if (!auth?.startsWith("Bearer ")) {
		return c.json({ error: RESPONSE_MESSAGES.AUTH_REQUIRED }, HTTP_STATUS.UNAUTHORIZED);
	}
	await next();
});

appointmentRoutes.get("/", (c) => {
	return c.json({ message: RESPONSE_MESSAGES.NOT_IMPLEMENTED }, HTTP_STATUS.NOT_IMPLEMENTED);
});

appointmentRoutes.post("/", async (c) => {
	const body = await c.req.json().catch(() => ({}));

	// Validate appointment data
	if (!(body.patient_id && body.date)) {
		return c.json({ error: RESPONSE_MESSAGES.INVALID_DATA }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
	}

	return c.json({ message: RESPONSE_MESSAGES.NOT_IMPLEMENTED }, HTTP_STATUS.NOT_IMPLEMENTED);
});
