// T042 redact implementation (minimal GREEN)
// Masks emails and CPF patterns. Extendable via additional regexes.

const EMAIL_REGEX = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
// Brazilian CPF pattern: 000.000.000-00 (simple version, no checksum here)
const CPF_REGEX = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g;

export interface RedactOptions {
  emailReplacement?: string;
  cpfReplacement?: string;
  cnpjReplacement?: string;
  phoneReplacement?: string;
  rgReplacement?: string;
  customPatterns?: { pattern: RegExp; replacement: string }[];
}

// Brazilian phone patterns (simplified): +55 (11) 91234-5678 or (11) 1234-5678
const PHONE_REGEX = /(\+?55\s*)?(\(?\d{2}\)?\s*)?(9?\d{4}-\d{4})/g;
// Brazilian RG (very simplified, e.g., 12.345.678-9)
const RG_REGEX = /\b\d{2}\.\d{3}\.\d{3}-\d{1}\b/g;
// Brazilian CNPJ (simple): 12.345.678/0001-12
const CNPJ_REGEX = /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g;

export function redact(input: string, opts: RedactOptions = {}): string {
  if (!input) return input;
  const emailRepl = opts.emailReplacement || '[REDACTED_EMAIL]';
  const cpfRepl = opts.cpfReplacement || '[REDACTED_CPF]';
  const phoneRepl = opts.phoneReplacement || '[REDACTED_PHONE]';
  const rgRepl = opts.rgReplacement || '[REDACTED_RG]';
  const cnpjRepl = opts.cnpjReplacement || '[REDACTED_CNPJ]';

  let out = input
    .replace(EMAIL_REGEX, emailRepl)
    .replace(CPF_REGEX, cpfRepl)
    .replace(CNPJ_REGEX, cnpjRepl)
    .replace(PHONE_REGEX, phoneRepl)
    .replace(RG_REGEX, rgRepl);

  if (opts.customPatterns) {
    for (const { pattern, replacement } of opts.customPatterns) {
      out = out.replace(pattern, replacement);
    }
  }
  return out;
}

export default redact;
