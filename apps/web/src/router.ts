import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import App from './App'

const rootRoute = createRootRoute({
  component: App,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
})

const authLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/login',
})

const authRegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/register',
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  authLoginRoute,
  authRegisterRoute,
])

export const router = createRouter({ routeTree })