import { Hono } from "hono";
import { HTTP_STATUS } from "../lib/constants.js";

export const clinicRoutes = new Hono();

// Authentication middleware for all clinic routes
clinicRoutes.use("*", async (c, next) => {
  const auth = c.req.header("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return c.json(
      { error: "Authentication required" },
      HTTP_STATUS.UNAUTHORIZED,
    );
  }
  await next();
});

clinicRoutes.get("/", (c) => {
  return c.json(
    { message: "Clinics list - not implemented" },
    HTTP_STATUS.NOT_IMPLEMENTED,
  );
});

clinicRoutes.post("/", async (c) => {
  const body = await c.req.json().catch(() => ({
    error: "Invalid JSON payload",
  }));

  // Validate ANVISA requirements
  if (!(body.name && body.anvisa_registration)) {
    return c.json(
      { error: "Missing ANVISA registration or clinic name" },
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
    );
  }

  return c.json(
    { message: "Create clinic - not implemented" },
    HTTP_STATUS.NOT_IMPLEMENTED,
  );
});
