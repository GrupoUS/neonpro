
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from './auth/ProtectedRoute';
import LoginForm from '../components/auth/LoginForm';
import Layout from '@/components/Layout';
import AuthPage from '@/pages/AuthPage';
import Dashboard from '@/pages/Dashboard';
import Clientes from '@/pages/Clientes';
import Agendamentos from '@/pages/Agendamentos';
import Financeiro from '@/pages/Financeiro';
import Relatorios from '@/pages/Relatorios';
import Servicos from '@/pages/Servicos';

const AppRouter: React.FC = () => {
  const { session, isLoading } = useAuth(); // Usar isLoading em vez de loading

  if (isLoading) { // Usar isLoading
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/clientes" element={<ProtectedRoute><Layout><Clientes /></Layout></ProtectedRoute>} />
      <Route path="/agendamentos" element={<ProtectedRoute><Layout><Agendamentos /></Layout></ProtectedRoute>} />
      <Route path="/financeiro" element={<ProtectedRoute><Layout><Financeiro /></Layout></ProtectedRoute>} />
      <Route path="/servicos" element={<ProtectedRoute><Layout><Servicos /></Layout></ProtectedRoute>} />
      <Route path="/relatorios" element={<ProtectedRoute><Layout><Relatorios /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
