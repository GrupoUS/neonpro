/**
 * HTTP Status Code Constants
 * Centralized status codes for consistent API responses
 */
export const HTTP_STATUS = {
	OK: 200,
	CREATED: 201,
	ACCEPTED: 202,
	NO_CONTENT: 204,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	METHOD_NOT_ALLOWED: 405,
	CONFLICT: 409,
	UNPROCESSABLE_ENTITY: 422,
	INTERNAL_SERVER_ERROR: 500,
	NOT_IMPLEMENTED: 501,
	SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Common response templates
 */
export const RESPONSE_MESSAGES = {
	AUTH_REQUIRED: "Authentication required",
	DATABASE_ERROR: "Database middleware failed",
	HEALTH_CHECK_FAILED: "Health check failed",
	NOT_IMPLEMENTED: "Feature not implemented",
	INVALID_DATA: "Invalid data provided",
} as const;

/**
 * Request ID and correlation constants
 */
export const REQUEST_ID = {
	HEADER_NAME: "X-Request-ID",
	MAX_LENGTH: 100,
	TRACE_ID_LENGTH: 12,
	SPAN_ID_LENGTH: 8,
	CHILD_ID_LENGTH: 4,
	DEFAULT_ID_LENGTH: 8,
} as const;
