import * as React from "react";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "./router";
import { PWAInstallPrompt } from "./components/pwa/PWAInstallPrompt";
import { PWAOfflineIndicator } from "./components/pwa/PWAOfflineIndicator";

// Service Worker Registration
export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    });
  }
}

// PWA Install Handlers
export function setupPWAInstallHandlers() {
  let deferredPrompt: any;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    window.dispatchEvent(new CustomEvent("pwa-install-available", {
      detail: deferredPrompt
    }));
  });

  window.addEventListener("appinstalled", () => {
    console.log("PWA was installed");
    window.dispatchEvent(new CustomEvent("pwa-installed"));
  });
}

function App() {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  React.useEffect(() => {
    // Register Service Worker
    registerServiceWorker();
    
    // Setup PWA Install Handlers
    setupPWAInstallHandlers();
    
    // Set up online/offline event listeners
    const handleOnline = () => {
      console.log("App is online");
      window.dispatchEvent(new CustomEvent("app-online"));
    };
    
    const handleOffline = () => {
      console.log("App is offline");
      window.dispatchEvent(new CustomEvent("app-offline"));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        {/* PWA Components */}
        <PWAInstallPrompt className="fixed bottom-4 right-4 z-50" />
        <PWAOfflineIndicator className="fixed top-4 right-4 z-50" />
        
        {/* Main Application Router */}
        <RouterProvider router={router} />
      </div>
    </QueryClientProvider>
  );
}

export default App;