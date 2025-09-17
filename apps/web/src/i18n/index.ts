import { createContext, useContext } from 'react';

export interface I18nContextType {
  locale: string;
  t: (key: string, params?: Record<string, string>) => string;
}

export const I18nContext = createContext<I18nContextType>({
  locale: 'pt-BR',
  t: (key: string) => key,
});

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// Simple translations
const translations = {
  'pt-BR': {
    'auth.login': 'Entrar',
    'auth.register': 'Cadastrar',
    'auth.email': 'E-mail',
    'auth.password': 'Senha',
    'auth.name': 'Nome',
    'common.loading': 'Carregando...',
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Excluir',
    'common.edit': 'Editar',
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
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'dashboard.title': 'Dashboard',
    'clients.title': 'Clients',
    'appointments.title': 'Appointments',
    'services.title': 'Services',
    'financial.title': 'Financial',
    'settings.title': 'Settings',
  },
};

export const t = (key: string, locale: string = 'pt-BR', params?: Record<string, string>) => {
  const translation =
    translations[locale as keyof typeof translations]?.[key as keyof typeof translations['pt-BR']]
    || key;

  if (params) {
    return Object.entries(params).reduce((acc, [param, value]) => {
      return acc.replace(`{{${param}}}`, value);
    }, translation);
  }

  return translation;
};
