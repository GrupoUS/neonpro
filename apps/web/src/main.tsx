import { createRouter, RouterProvider } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import ErrorBoundary from './components/error-pages/ErrorBoundary';
import LocalErrorBoundary from './components/monitoring/LocalErrorBoundary';
import { ThemeProvider } from './components/theme-provider';
import { ConsentProvider } from './contexts/ConsentContext';
import { criticalComponents } from './hooks/useLazyComponent';
// import { initializeSentry } from './lib/sentry'; // temporarily disabled to unblock deploy
import { logBundleSize, performanceMonitor } from './utils/performance';
import { initializeServiceWorker } from './utils/serviceWorker';
import { generateNonce, getSecurityHeaders } from './lib/security/csp';

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

if ((import.meta as any).env?.DEV) {
  window.addEventListener('error', e => showErrorBanner(e.message));
  window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    const reason: any = (e as any).reason;
    showErrorBanner(typeof reason === 'string' ? reason : reason?.message ?? String(reason));
  });
  // Boot log
  console.log('[NeonPro] Bootstrapping app...');
}

// Initialize Sentry monitoring disabled for now to unblock Vercel build
// initializeSentry();

async function bootstrap() {
  const rootEl = document.getElementById('root');
  if (!rootEl) throw new Error('#root element not found');

  // Initialize healthcare security headers with CSP
  const nonce = generateNonce();
  const securityHeaders = getSecurityHeaders(nonce);
  
  // Apply security headers to the document
  Object.entries(securityHeaders).forEach(([name, value]) => {
    const meta = document.createElement('meta');
    meta.httpEquiv = name;
    meta.content = value;
    document.head.appendChild(meta);
  });

  // Store nonce for dynamic script loading
  (window as any).__CSP_NONCE__ = nonce;

  // Initialize performance monitoring
  if ((import.meta as any).env?.DEV) {
    logBundleSize();
  }

  // Initialize service worker for caching
  if (process.env.NODE_ENV === 'production') {
    initializeServiceWorker().catch(console.error);
  }

  // Render a minimal placeholder immediately (so page is not blank)
  const root = ReactDOM.createRoot(rootEl);
  root.render(<div style={{ padding: 16, fontFamily: 'monospace' }}>Carregando NeonPro…</div>);

  try {
    // Preload critical components
    const preloader = {
      preloadRouteComponents: async (components: any[]) => {
        await Promise.allSettled(components.map(c => c.importFn()));
      },
    };

    // Preload critical components in background
    preloader.preloadRouteComponents(criticalComponents).catch(console.error);

    // Dynamic import so our error handlers are active before evaluating route modules
    const mod = await import('./routeTree.gen');
    const routeTree = mod.routeTree;

    const router = createRouter({ routeTree });

    // (Type registration removed in dev bootstrap to avoid TS limitations with dynamic import)

    root.render(
      <React.StrictMode>
        <LocalErrorBoundary>
          <ThemeProvider attribute='class' defaultTheme='system'>
            <ErrorBoundary>
              <ConsentProvider>
                <RouterProvider router={router} />
              </ConsentProvider>
            </ErrorBoundary>
          </ThemeProvider>
        </LocalErrorBoundary>
      </React.StrictMode>,
    );

    console.log('[NeonPro] App mounted.');

    // Log performance metrics in development
    if ((import.meta as any).env?.DEV) {
      setTimeout(() => {
        const metrics = performanceMonitor.getMetrics();
        console.log('[Performance] Core Web Vitals:', metrics);
      }, 2000);
    }
  } catch (err: any) {
    console.error('[NeonPro] Boot error:', err);
    if ((import.meta as any).env?.DEV) showErrorBanner(err?.message ?? String(err));
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
