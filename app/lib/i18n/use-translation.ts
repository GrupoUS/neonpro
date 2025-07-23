// i18n Utility Hook
// Story 1.3, Task 2: Simple i18n hook for PT-BR translations
// Created: Lightweight internationalization for patient portal

"use client"

import { ptBR } from "./pt-br"

type DeepKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${DeepKeyOf<T[K]>}`
          : K
        : never
    }[keyof T]
  : never

type TranslationPath = DeepKeyOf<typeof ptBR>

export function useTranslation() {
  const t = (key: TranslationPath, fallback?: string): string => {
    try {
      const keys = key.split('.') as Array<keyof any>
      let value: any = ptBR

      for (const k of keys) {
        value = value?.[k]
      }

      if (typeof value === 'string') {
        return value
      }

      if (fallback) {
        return fallback
      }

      // Fallback to key itself if translation not found
      return key
    } catch (error) {
      console.warn(`Translation not found for key: ${key}`)
      return fallback || key
    }
  }

  return { t, ptBR }
}

// Simple helper for direct usage without hook
export function translate(key: TranslationPath, fallback?: string): string {
  try {
    const keys = key.split('.') as Array<keyof any>
    let value: any = ptBR

    for (const k of keys) {
      value = value?.[k]
    }

    if (typeof value === 'string') {
      return value
    }

    return fallback || key
  } catch (error) {
    console.warn(`Translation not found for key: ${key}`)
    return fallback || key
  }
}