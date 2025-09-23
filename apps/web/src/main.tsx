import * as React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { TanStackQueryProvider } from "./components/providers/TanStackQueryProvider";
import { TRPCProvider } from "./components/providers/TRPCProvider";
import { routeTree } from "./routeTree.gen";

// Create the router
const router = createRouter({ routeTree });

// Register the router
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
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
