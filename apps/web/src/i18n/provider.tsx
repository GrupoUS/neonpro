import React, { createContext, useContext, useState } from 'react';

interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Simple translations
const translations = {
  'pt-BR': {
    'auth.login': 'Entrar',
    'auth.register': 'Cadastrar',
    'auth.email': 'E-mail',
    'auth.password': 'Senha',
    'auth.name': 'Nome',
    'auth.confirmPassword': 'Confirmar Senha',
    'auth.forgotPassword': 'Esqueci minha senha',
    'common.loading': 'Carregando...',
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Excluir',
    'common.edit': 'Editar',
    'common.search': 'Pesquisar',
    'dashboard.title': 'Dashboard',
    'clients.title': 'Clientes',
    'appointments.title': 'Agendamentos',
    'services.title': 'Serviços',
    'financial.title': 'Financeiro',
    'settings.title': 'Configurações',
  },
  'en-US': {
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Name',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot Password',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search',
    'dashboard.title': 'Dashboard',
    'clients.title': 'Clients',
    'appointments.title': 'Appointments',
    'services.title': 'Services',   
    'financial.title': 'Financial',
    'settings.title': 'Settings',
  }
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState('pt-BR');

  const t = (key: string, params?: Record<string, string>) => {
    const translation = translations[locale as keyof typeof translations]?.[key as keyof typeof translations['pt-BR']] || key;
    
    if (params) {
      return Object.entries(params).reduce((acc, [param, value]) => {
        return acc.replace(`{{${param}}}`, value);
      }, translation);
    }
    
    return translation;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}