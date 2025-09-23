import * as React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { TanStackQueryProvider } from "./components/providers/TanStackQueryProvider";
import { TRPCProvider } from "./components/providers/TRPCProvider";
import { routeTree } from "./routeTree.gen";

// Import PWA Styles
import "./styles/pwa.css";

// Create the router
const router = createRouter({ routeTree });

// Register the router
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// PWA Initialization
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}

// PWA Install Prompt Handler
let deferredPrompt: any;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Show custom install UI if needed
  const installButton = document.getElementById('pwa-install-button');
  if (installButton) {
    installButton.style.display = 'block';
    installButton.addEventListener('click', () => {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        deferredPrompt = null;
      });
    });
  }
});

// Handle app installed
window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  const installButton = document.getElementById('pwa-install-button');
  if (installButton) {
    installButton.style.display = 'none';
  }
});

// Handle online/offline status
window.addEventListener('online', () => {
  console.log('App is online');
  document.body.classList.remove('offline');
  document.body.classList.add('online');
});

window.addEventListener('offline', () => {
  console.log('App is offline');
  document.body.classList.remove('online');
  document.body.classList.add('offline');
});

// Set initial online status
if (navigator.onLine) {
  document.body.classList.add('online');
} else {
  document.body.classList.add('offline');
}

// Render the app
const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <TanStackQueryProvider>
      <TRPCProvider>
        <RouterProvider router={router} />
      </TRPCProvider>
    </TanStackQueryProvider>
  </React.StrictMode>,
);