/**
 * NeonPro - useTranslation Hook
 * Client-side translation hook with Next.js 15 App Router support
 *
 * Features:
 * - Type-safe translation keys
 * - Parameter interpolation
 * - Locale switching
 * - Loading states
 * - Error boundaries
 */

'use client';

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  createTranslator,
  type Dictionary,
  defaultLocale,
  getDictionary,
  type Locale,
} from '../lib/i18n/i18n';

type TranslationContextType = {
  locale: Locale;
  dictionary: Dictionary | null;
  t: (key: string, params?: Record<string, string | number>) => string;
  setLocale: (locale: Locale) => void;
  isLoading: boolean;
  error: string | null;
};

const TranslationContext = createContext<TranslationContextType | undefined>(
  undefined
);

type TranslationProviderProps = {
  children: ReactNode;
  initialLocale?: Locale;
  initialDictionary?: Dictionary;
};

/**
 * Translation Provider Component
 * Provides translation context to child components
 */
export function TranslationProvider({
  children,
  initialLocale = defaultLocale,
  initialDictionary,
}: TranslationProviderProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [dictionary, setDictionary] = useState<Dictionary | null>(
    initialDictionary || null
  );
  const [isLoading, setIsLoading] = useState(!initialDictionary);
  const [error, setError] = useState<string | null>(null);

  // Create translator function
  const translator = dictionary
    ? createTranslator(dictionary)
    : (key: string) => key;

  // Load dictionary when locale changes
  useEffect(() => {
    if (initialDictionary && locale === initialLocale) {
      return; // Use initial dictionary
    }

    setIsLoading(true);
    setError(null);

    getDictionary(locale)
      .then((dict) => {
        setDictionary(dict);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [locale, initialDictionary, initialLocale]);

  // Save locale preference to localStorage
  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    try {
      localStorage.setItem('neonpro-locale', newLocale);
    } catch (_e) {}
  };

  // Load saved locale preference on mount
  useEffect(() => {
    try {
      const savedLocale = localStorage.getItem('neonpro-locale') as Locale;
      if (savedLocale && savedLocale !== initialLocale) {
        setLocale(savedLocale);
      }
    } catch (_e) {}
  }, [initialLocale]);

  const value: TranslationContextType = {
    locale,
    dictionary,
    t: translator,
    setLocale: handleSetLocale,
    isLoading,
    error,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

/**
 * useTranslation Hook
 * Main hook for accessing translation functionality
 */
export function useTranslation() {
  const context = useContext(TranslationContext);

  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }

  return context;
}

/**
 * useLocale Hook
 * Simplified hook for locale management only
 */
export function useLocale() {
  const { locale, setLocale, isLoading } = useTranslation();

  return {
    locale,
    setLocale,
    isLoading,
  };
}

/**
 * Translation Component
 * Component-based translation for JSX templates
 */
type TranslationProps = {
  k: string; // translation key
  params?: Record<string, string | number>;
  fallback?: string;
  children?: (translation: string) => ReactNode;
};

export function Translation({
  k,
  params,
  fallback,
  children,
}: TranslationProps) {
  const { t, isLoading } = useTranslation();

  if (isLoading) {
    return <span className="h-4 w-16 animate-pulse rounded bg-muted" />;
  }

  const translation = t(k, params) || fallback || k;

  if (children) {
    return <>{children(translation)}</>;
  }

  return <>{translation}</>;
}

/**
 * Higher-order component for translation
 * Injects translation props into components
 */
export function withTranslation<P extends object>(
  Component: React.ComponentType<
    P & { t: (key: string, params?: Record<string, string | number>) => string }
  >
) {
  return function TranslatedComponent(props: P) {
    const { t } = useTranslation();
    return <Component {...props} t={t} />;
  };
}

/**
 * Translation namespace hook
 * Scoped translations for specific feature areas
 */
export function useTranslationNamespace(namespace: string) {
  const { t, ...rest } = useTranslation();

  const namespacedT = (
    key: string,
    params?: Record<string, string | number>
  ) => {
    return t(`${namespace}.${key}`, params);
  };

  return {
    ...rest,
    t: namespacedT,
    nt: namespacedT, // alias for namespaced translation
  };
}

/**
 * Healthcare-specific translation hooks
 */
export function usePatientTranslations() {
  return useTranslationNamespace('patients');
}

export function useAppointmentTranslations() {
  return useTranslationNamespace('appointments');
}

export function useServiceTranslations() {
  return useTranslationNamespace('services');
}

export function useProfessionalTranslations() {
  return useTranslationNamespace('professionals');
}

export function useSchedulingTranslations() {
  return useTranslationNamespace('scheduling');
}

export function useFinancialTranslations() {
  return useTranslationNamespace('financial');
}

export function useNotificationTranslations() {
  return useTranslationNamespace('notifications');
}

export function useErrorTranslations() {
  return useTranslationNamespace('errors');
}

export function useSuccessTranslations() {
  return useTranslationNamespace('success');
}

export function useLGPDTranslations() {
  return useTranslationNamespace('lgpd');
}

export function useAccessibilityTranslations() {
  return useTranslationNamespace('accessibility');
}

/**
 * Form validation translations
 * Helper for form error messages
 */
export function useFormTranslations() {
  const { t } = useTranslation();

  return {
    required: (field: string) => t('errors.requiredField', { field }),
    invalid: (field: string) => t('errors.invalidFormat', { field }),
    email: () => t('errors.invalidEmail'),
    phone: () => t('errors.invalidPhone'),
    cpf: () => t('errors.invalidCpf'),
    date: () => t('errors.invalidDate'),
    dateInPast: () => t('errors.dateInPast'),
    dateInFuture: () => t('errors.dateInFuture'),
    minLength: (field: string, min: number) =>
      t('errors.minLength', { field, min }),
    maxLength: (field: string, max: number) =>
      t('errors.maxLength', { field, max }),
    confirmation: (field: string) => t('errors.confirmation', { field }),
  };
}

/**
 * Accessibility translations helper
 * Screen reader and keyboard navigation texts
 */
export function useA11yTranslations() {
  const { t } = useTranslation();

  return {
    skipToContent: () => t('accessibility.skipToContent'),
    skipToNavigation: () => t('accessibility.skipToNavigation'),
    loading: (item?: string) =>
      item ? `${t('common.loading')} ${item}` : t('common.loading'),
    saving: (item?: string) =>
      item ? `${t('common.saving')} ${item}` : t('common.saving'),
    buttonPressed: (button: string, pressed: boolean) =>
      pressed ? `${button} pressionado` : `${button} não pressionado`,
    expandedState: (item: string, expanded: boolean) =>
      expanded ? `${item} expandido` : `${item} recolhido`,
    menuItemOf: (current: number, total: number) =>
      `Item ${current} de ${total}`,
    pageOf: (current: number, total: number) => `Página ${current} de ${total}`,
    required: () => t('common.required'),
    optional: () => t('common.optional'),
    error: (field: string) => `Erro em ${field}`,
    success: (action: string) => `${action} realizado com sucesso`,
  };
}

/**
 * Date and time formatting with translations
 */
export function useDateTimeTranslations() {
  const { t, locale } = useTranslation();

  return {
    formatDate: (date: Date) => {
      return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date);
    },

    formatTime: (date: Date) => {
      return new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    },

    formatDateTime: (date: Date) => {
      return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    },

    formatRelativeTime: (date: Date) => {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
      const now = new Date();
      const diffInMs = date.getTime() - now.getTime();
      const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

      if (Math.abs(diffInDays) < 1) {
        const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));
        if (Math.abs(diffInHours) < 1) {
          const diffInMinutes = Math.round(diffInMs / (1000 * 60));
          return rtf.format(diffInMinutes, 'minute');
        }
        return rtf.format(diffInHours, 'hour');
      }

      return rtf.format(diffInDays, 'day');
    },

    dayNames: {
      monday: t('scheduling.monday'),
      tuesday: t('scheduling.tuesday'),
      wednesday: t('scheduling.wednesday'),
      thursday: t('scheduling.thursday'),
      friday: t('scheduling.friday'),
      saturday: t('scheduling.saturday'),
      sunday: t('scheduling.sunday'),
    },

    periods: {
      morning: t('scheduling.morning'),
      afternoon: t('scheduling.afternoon'),
      evening: t('scheduling.evening'),
      night: t('scheduling.night'),
    },
  };
}

/**
 * Currency and number formatting with translations
 */
export function useNumberTranslations() {
  const { locale } = useTranslation();

  return {
    formatCurrency: (amount: number, currency = 'BRL') => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
      }).format(amount);
    },

    formatNumber: (num: number, options?: Intl.NumberFormatOptions) => {
      return new Intl.NumberFormat(locale, options).format(num);
    },

    formatPercent: (num: number, decimals = 0) => {
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(num / 100);
    },
  };
}
