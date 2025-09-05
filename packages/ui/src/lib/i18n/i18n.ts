// Minimal i18n utilities for UI hooks
export type Locale = "pt-BR" | "en-US";
export type Dictionary = Record<string, any>;

export const defaultLocale: Locale = "pt-BR";

export function createTranslator(dictionary: Dictionary) {
  return (key: string, params?: Record<string, string | number>) => {
    const value = getValue(dictionary, key);
    const text = typeof value === "string" ? value : key;
    return interpolate(text, params);
  };
}

export async function getDictionary(_locale: Locale): Promise<Dictionary> {
  // Placeholder: replace with dynamic import or remote fetch in future
  return {};
}

function getValue(obj: any, path: string): any {
  return path.split(".").reduce((acc, part) => (acc && acc[part] != null ? acc[part] : undefined), obj);
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
}
