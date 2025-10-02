import * as React from "react"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { getTRPCClient, trpc, useTRPCHealthcare } from '@/lib/trpc'

interface TRPCProviderProps {
  children: React.ReactNode
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

export function TRPCProvider({ children }: TRPCProviderProps) {
  const trpcClient = React.useMemo(() => getTRPCClient(queryClient), [])

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  )
}

export { trpc, useTRPCHealthcare }
