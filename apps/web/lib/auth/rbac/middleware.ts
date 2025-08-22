// Middleware Module
export type MiddlewareConfig = {
	enabled: boolean;
	data?: unknown;
};

export const Middleware_DEFAULT: MiddlewareConfig = {
	enabled: true,
	data: null,
};

export function createMiddleware() {
	return Middleware_DEFAULT;
}

export default {
	config: Middleware_DEFAULT,
	create: createMiddleware,
};
