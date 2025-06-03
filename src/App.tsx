
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Helmet } from "react-helmet";
import { AuthProvider } from "@/contexts/auth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AppRouter from "@/components/AppRouter";

// Create a client
const queryClient = new QueryClient();

const App: React.FC = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <Helmet titleTemplate="%s | NEON PRO" defaultTitle="NEON PRO - Sistema Premium de Gestão">
            <meta name="theme-color" content="#112031" />
          </Helmet>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <AppRouter />
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
