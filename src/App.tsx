import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Layout from "./components/Layout";

import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AgendaPage from "./pages/Agenda";
import ClientesPage from "./pages/Clientes";
import ServicosPage from "./pages/Servicos";
import FinanceiroPage from "./pages/Financeiro";
import NovaTransacaoPage from "./pages/financeiro/NovaTransacao";
import RelatoriosPage from "./pages/Relatorios";
import ConfiguracoesPage from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PatientRegistration from "./pages/patients/PatientRegistration";

// Create a client
const queryClient = new QueryClient();

const App: React.FC = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Helmet titleTemplate="%s | NEON PRO" defaultTitle="NEON PRO - Sistema Premium de Gestão">
          <meta name="theme-color" content="#112031" />
        </Helmet>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
              
              {/* Protected routes with Layout */}
              <Route path="/" element={<ProtectedRoute><Layout><Index /></Layout></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
              <Route path="/agenda" element={<ProtectedRoute><Layout><AgendaPage /></Layout></ProtectedRoute>} />
              <Route path="/pacientes" element={<ProtectedRoute><Layout><ClientesPage /></Layout></ProtectedRoute>} />
              <Route path="/pacientes/cadastro" element={<ProtectedRoute><Layout><PatientRegistration /></Layout></ProtectedRoute>} />
              <Route path="/servicos" element={<ProtectedRoute><Layout><ServicosPage /></Layout></ProtectedRoute>} />
              <Route path="/financeiro" element={<ProtectedRoute><Layout><FinanceiroPage /></Layout></ProtectedRoute>} />
              <Route path="/financeiro/novo" element={<ProtectedRoute><Layout><NovaTransacaoPage /></Layout></ProtectedRoute>} />
              <Route path="/relatorios" element={<ProtectedRoute><Layout><RelatoriosPage /></Layout></ProtectedRoute>} />
              <Route path="/configuracoes" element={<ProtectedRoute><Layout><ConfiguracoesPage /></Layout></ProtectedRoute>} />
              
              {/* Handle OAuth redirects and cleanup URLs */}
              <Route path="/auth/callback" element={<Navigate to="/dashboard" replace />} />
              
              {/* Catch-all route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
