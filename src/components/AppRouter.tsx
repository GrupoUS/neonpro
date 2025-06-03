
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

const AppRouter: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
