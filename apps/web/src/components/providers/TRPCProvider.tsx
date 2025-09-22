import * as React from 'react'
import { trpc, trpcClient } from '../../lib/trpc/client'

interface TRPCProviderProps {
  children: React.ReactNode
}

export function TRPCProvider({ children }: TRPCProviderProps) {
  return (
    <trpc.Provider client={trpcClient} queryClient={undefined}>
      {children}
    </trpc.Provider>
  )
}