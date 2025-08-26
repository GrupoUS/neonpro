// ApiRoute Module
export interface ApiRouteConfig {
  enabled: boolean;
  data?: unknown;
}

export const ApiRoute_DEFAULT: ApiRouteConfig = {
  enabled: true,
  data: undefined,
};

export function createApiRoute() {
  return ApiRoute_DEFAULT;
}

export default {
  config: ApiRoute_DEFAULT,
  create: createApiRoute,
};
