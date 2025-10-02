// Minimal tRPC client shim for apps/web during cleanup
// KISS: avoid importing router types to prevent type collisions while backend stabilizes.
// This file provides a very small surface used by hooks/components without enforcing types.

import { createTRPCClient, httpBatchLink } from '@trpc/client'

export type TRPCQueryFn = (path: string, input?: unknown) => Promise<unknown>
export type TRPCMutationFn = (path: string, input?: unknown) => Promise<unknown>

export interface TRPCClientShim {
  query: TRPCQueryFn
  mutation: TRPCMutationFn
}

function getApiBaseUrl() {
  // Prefer explicit env var in Vite. Falls back to window origin or localhost:3005.
  const viteEnv = (import.meta as any)?.env?.VITE_API_URL as string | undefined
  const nodeEnv = (process as any)?.env?.VITE_API_URL as string | undefined
  if (viteEnv && typeof viteEnv === 'string') return viteEnv.replace(/\/$/, '')
  if (nodeEnv && typeof nodeEnv === 'string') return nodeEnv.replace(/\/$/, '')
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin
  return 'http://localhost:3005'
}

// Factory that creates a thin untyped tRPC client bound to our API base.
export function createTRPCClientShim(): TRPCClientShim {
  const client: any = createTRPCClient<any>({
    links: [
      httpBatchLink({
        url: `${getApiBaseUrl()}/trpc`,
        headers() {
          return {
            'content-type': 'application/json',
          }
        },
      }),
    ],
  })

  return {
    query: async (path, input) => client.query(path as any, input as any),
    mutation: async (path, input) => client.mutation(path as any, input as any),
  }
}

// Singleton convenience instance for places that don't need multiple clients.
export const trpcClient = createTRPCClientShim()

