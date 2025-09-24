import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

// Create the router
export const router = createRouter({ routeTree })

// Register the router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
