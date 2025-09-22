/* eslint-disable */

// @ts-expect-error
import type { Route as rootRoute } from './routes/__root'
// @ts-expect-error
import type { Route as loginRoute } from './routes/auth/login'
// @ts-expect-error
import type { Route as dashboardIndexRoute } from './routes/dashboard/index'

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      preLoaderRoute: typeof rootRoute
      parentRoute: typeof rootRoute
    }
    '/auth/login': {
      preLoaderRoute: typeof loginRoute
      parentRoute: typeof rootRoute
    }
    '/dashboard/': {
      preLoaderRoute: typeof dashboardIndexRoute
      parentRoute: typeof rootRoute
    }
  }
}

export const routeTree = rootRoute.addChildren([loginRoute, dashboardIndexRoute])