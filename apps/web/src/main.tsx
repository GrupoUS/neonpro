import { createRouter, RouterProvider } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import ErrorBoundary from './components/error-pages/ErrorBoundary';
import { ThemeProvider } from './components/theme-provider';
import { ConsentProvider } from './contexts/ConsentContext';

import './index.css';

// Simple dev error banner to surface runtime errors causing blank screen
function showErrorBanner(message: string) {
  const id = 'np-dev-error-banner';
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.id = id;
    el.style.position = 'fixed';
    el.style.top = '0';
    el.style.left = '0';
    el.style.right = '0';
    el.style.zIndex = '2147483647';
    el.style.padding = '10px 16px';
    el.style.background = '#8B0000';
    el.style.color = 'white';
    el.style.fontFamily = 'monospace';
    document.body.prepend(el);
  }
  el!.textContent = `Runtime error: ${message}`;
}

if (import.meta.env.DEV) {
  window.addEventListener('error', e => showErrorBanner(e.message));
  window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    const reason: any = (e as any).reason;
    showErrorBanner(typeof reason === 'string' ? reason : reason?.message ?? String(reason));
  });
  // Boot log
  console.log('[NeonPro] Bootstrapping app...');
}

async function bootstrap() {
  const rootEl = document.getElementById('root');
  if (!rootEl) throw new Error('#root element not found');

  // Render a minimal placeholder immediately (so page is not blank)
  const root = ReactDOM.createRoot(rootEl);
  root.render(<div style={{ padding: 16, fontFamily: 'monospace' }}>Carregando NeonPro…</div>);

  try {
    // Dynamic import so our error handlers are active before evaluating route modules
    const mod = await import('./routeTree.gen');
    const routeTree = mod.routeTree;

    const router = createRouter({ routeTree });

    // (Type registration removed in dev bootstrap to avoid TS limitations with dynamic import)

    root.render(
      <React.StrictMode>
        <ThemeProvider attribute='class' defaultTheme='system'>
          <ErrorBoundary>
            <ConsentProvider>
              <RouterProvider router={router} />
            </ConsentProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </React.StrictMode>,
    );
    console.log('[NeonPro] App mounted.');
  } catch (err: any) {
    console.error('[NeonPro] Boot error:', err);
    if (import.meta.env.DEV) showErrorBanner(err?.message ?? String(err));
    // Fallback UI so page never stays blank
    root.render(
      <div style={{ padding: 24, fontFamily: 'monospace', color: '#8B0000' }}>
        <h2>Falha ao iniciar a UI</h2>
        <p>{String(err?.message ?? err)}</p>
        <p>Verifique o console do navegador para detalhes.</p>
      </div>,
    );
  }
}

bootstrap();
