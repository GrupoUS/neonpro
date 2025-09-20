import type { Context, Next } from "hono";
import { errorTracker } from "../services/error-tracking-bridge";
import {
  badRequest,
  forbidden,
  notFound,
  serverError,
  unauthorized,
} from "../utils/responses";

export async function errorHandler(
  c: Context,
  next: Next,
): Promise<Response | void> {
  try {
    await next();

    // If downstream didn't set a response for 404
    if (c.res.status === 404 && !c.res.body) {
      return notFound(c, "Route not found");
    }
  } catch (err: any) {
    const message = err?.message || "Unhandled error";
    const code = err?.code || "INTERNAL_ERROR";

    // Extract context and capture exception with healthcare compliance
    const context = errorTracker.extractContextFromHono(c);
    const eventId = errorTracker.captureException(err, context, {
      errorCode: code,
      errorMessage: message,
      details: err?.details,
    });

    // Add breadcrumb for error handling
    errorTracker.addBreadcrumb("Error handled in middleware", "error", {
      code,
      eventId,
      endpoint: c.req.path,
      method: c.req.method,
    });

    // Map common error types
    if (code === "VALIDATION_ERROR") {
      return badRequest(c, code, message, err?.details);
    }
    if (code === "AUTHENTICATION_REQUIRED") {
      return unauthorized(c, message);
    }
    if (code === "FORBIDDEN") {
      return forbidden(c, message);
    }
    if (code === "NOT_FOUND") {
      return notFound(c, message);
    }

    // Default - include eventId for tracking
    return serverError(c, message, {
      eventId,
      ...(process.env.NODE_ENV === "production" ? {} : { error: err }),
    });
  }
}
