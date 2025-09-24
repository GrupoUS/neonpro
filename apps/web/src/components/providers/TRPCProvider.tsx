import * as React from 'react';
import { trpc, trpcClient } from '../../lib/trpc';
import { queryClient } from './TanStackQueryProvider';

interface TRPCProviderProps {
  children: React.ReactNode;
}

export function TRPCProvider({ children }: TRPCProviderProps) {
  return (
    // @ts-ignore - Ignore Provider type error due to TRPC constraint
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      {children}
    </trpc.Provider>
  );
}
