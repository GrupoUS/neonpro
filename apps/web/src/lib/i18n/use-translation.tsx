import * as React from 'react'

// Simple i18n hook for now - can be enhanced later
export const useTranslation = () => {
  return {
    t: (key: string) => {
      // Simple Portuguese translations for healthcare context
      const translations: Record<string, string> = {
        'error.title': 'Erro no Sistema',
        'error.description': 'Ocorreu um erro inesperado. Tente novamente em alguns instantes.',
        'error.retry': 'Tentar Novamente',
        'error.contact': 'Entrar em Contato',
        'error.reload': 'Recarregar Página'
      }
      return translations[key] || key
    }
  }
}

interface TranslationContextType {
  t: (key: string) => string;
}

const TranslationContext = React.createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const translation = useTranslation();

  return (
    <TranslationContext.Provider value={translation}>
      {children}
    </TranslationContext.Provider>
  );
};
