import { createRouter, RouterProvider } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';

// Import the generated route tree
import { ConsentProvider } from './contexts/ConsentContext';
import { routeTree } from './routeTree.gen';
import './index.css';
import { ThemeProvider } from './components/theme-provider';

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConsentProvider>
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
        <RouterProvider router={router} />
      </ThemeProvider>
    </ConsentProvider>
  </React.StrictMode>,
);
