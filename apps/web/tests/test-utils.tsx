import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { I18nProvider } from '@/i18n/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export type Providers = {
  i18n?: { locale?: 'pt-BR' | 'en-US' };
  queryClient?: QueryClient;
};

export function renderWithI18n(ui: React.ReactElement, providers: Providers = {}, options?: RenderOptions) {
  const { i18n, queryClient } = providers;
  const qc = queryClient ?? new QueryClient();
  function AllProviders({ children }: { children: React.ReactNode }) {
    return (
      <I18nProvider defaultLocale={(i18n?.locale as any) ?? 'pt-BR'}>
        <QueryClientProvider client={qc}>{children}</QueryClientProvider>
      </I18nProvider>
    );
  }
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
