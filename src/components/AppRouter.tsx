
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import Layout from '@/components/Layout';
import AuthPage from '@/pages/AuthPage';
import Dashboard from '@/pages/Dashboard';
import Clientes from '@/pages/Clientes';
import Agendamentos from '@/pages/Agendamentos';
import Financeiro from '@/pages/Financeiro';
import Relatorios from '@/pages/Relatorios';
import Servicos from '@/pages/Servicos';
import Configuracoes from '@/pages/Configuracoes';
import ChatbotPage from '@/pages/ChatbotPage';

const AppRouter: React.FC = () => {
  const { user, isLoading } = useAuth();

  console.log('🔍 AppRouter: Estado atual', {
    hasUser: !!user,
    isLoading,
    userId: user?.id,
    timestamp: new Date().toISOString()
  });

  if (isLoading) {
    console.log('⏳ AppRouter: Carregando autenticação...');
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ AppRouter: Usuário não autenticado, mostrando AuthPage');
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  console.log('✅ AppRouter: Usuário autenticado, mostrando aplicação');
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="agendamentos" element={<Agendamentos />} />
        <Route path="financeiro" element={<Financeiro />} />
        <Route path="servicos" element={<Servicos />} />
        <Route path="relatorios" element={<Relatorios />} />
        <Route path="configuracoes" element={<Configuracoes />} />
        <Route path="chatbot" element={<ChatbotPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
      <Route path="/auth" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRouter;
