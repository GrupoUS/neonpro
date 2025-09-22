import React, { createContext, useContext, useMemo, useState } from 'react';
import enUS from './locales/en-US.json';
import ptBR from './locales/pt-BR.json';

type LocaleKey = 'pt-BR' | 'en-US';
export type Messages = Record<string, string>;
const DICTS: Record<LocaleKey, Messages> = {
  'pt-BR': ptBR,
  'en-US': enUS,
} as const;

const I18nCtx = createContext<
  {
    t: (k: string) => string;
    locale: LocaleKey;
    setLocale: (l: LocaleKey) => void;
  } | null
>(null);

export function I18nProvider({
  children,
  defaultLocale = 'pt-BR' as LocaleKey,
}: {
  children: React.ReactNode;
  defaultLocale?: LocaleKey;
}) {
  const [locale, setLocale] = useState<LocaleKey>(defaultLocale);
  const dict = DICTS[locale] || ptBR;
  const value = useMemo(() => ({
      locale,setLocale,
      t: (k: string) => dict[k] ?? k,
    }),
    [locale],
  );
  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
