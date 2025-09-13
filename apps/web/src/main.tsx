import { createRouter, RouterProvider } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';

// Import the generated route tree
import { routeTree } from './routeTree.gen';
import './index.css';

console.log('🚀 main.tsx carregado!');
console.log('React:', React);
console.log('ReactDOM:', ReactDOM);

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

console.log('🎯 Tentando renderizar App...');
const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  console.log('Root criado:', root);
  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  );
  console.log('✅ App renderizado com sucesso!');
} else {
  console.error('❌ Elemento root não encontrado!');
}
