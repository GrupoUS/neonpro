// Middleware Module
export interface MiddlewareConfig {
  enabled: boolean;
  data?: unknown;
}

export const Middleware_DEFAULT: MiddlewareConfig = {
  enabled: true,
  data: undefined,
};

export function createMiddleware() {
  return Middleware_DEFAULT;
}

export default {
  config: Middleware_DEFAULT,
  create: createMiddleware,
};
