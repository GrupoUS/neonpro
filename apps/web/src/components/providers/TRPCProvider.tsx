import * as React from 'react'

interface TRPCProviderProps {
  children: React.ReactNode
}

// KISS: pass-through provider until API client surface is stabilized
export function TRPCProvider({ children }: TRPCProviderProps) {
  return <>{children}</>
}
