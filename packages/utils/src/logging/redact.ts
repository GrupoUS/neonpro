// T042 redact implementation (minimal GREEN)
// Masks emails and CPF patterns. Extendable via additional regexes.

const EMAIL_REGEX = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
// Brazilian CPF pattern: 000.000.000-00 (simple version, no checksum here)
const CPF_REGEX = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g;
const CPF_UNFORMATTED_REGEX = /\b\d{11}\b/g;

export interface RedactOptions {
  emailReplacement?: (match: string) => string;
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
// Name regex for full names (3 or more words with capitals, including accented)
const NAME_REGEX = /([A-ZÀ-Ú][a-zà-ú]+ ){2,}[A-ZÀ-Ú][a-zà-ú]+/g;
// Medical record
const MEDICAL_RECORD_REGEX = /MR-\d{6}/g;
// CRM
const CRM_REGEX = /CRM\/[A-Z]{2} \d{6}/g;
// CEP
const CEP_REGEX = /\d{5}-\d{3}/g;
// Credit card space separated
const CREDIT_CARD_SPACE_REGEX = /\b\d{4} \d{4} \d{4} \d{4}\b/g;
// Credit card dotted
const CREDIT_CARD_DOTTED_REGEX = /\b\d{4}\.\d{4}\.\d{4}\.\d{4}\b/g;
// Bank info
const BANK_REGEX = /Banco:\s*\d{3}\s*Agência:\s*\d{4}\s*Conta:\s*\d{6}-\d/g;
// SUS and CNS
const SUS_CNS_REGEX = /\b\d{3} \d{4} \d{4} \d{4}\b/g;
// Insurance
const INSURANCE_REGEX = /Unimed \d{5}/g;

export function redact(input: string, opts: RedactOptions = {}) {
  if (!input) return input;

  // Email replacer function
  const emailRepl = opts.emailReplacement || ((match: string) => {
    const [local, domain] = match.split('@');
    const maskedLocal = local[0] + '*'.repeat(local.length - 1);
    return maskedLocal + '@' + domain;
  });

  const cpfRepl = opts.cpfReplacement || "***.***.***-**";
  const phoneRepl = opts.phoneReplacement || "(11) 9****-****";
  const rgRepl = opts.rgReplacement || "***";
  const cnpjRepl = opts.cnpjReplacement || "**";

  let out = input
    .replace(EMAIL_REGEX, emailRepl)
    .replace(CPF_REGEX, cpfRepl)
    .replace(CPF_UNFORMATTED_REGEX, cpfRepl)
    .replace(CNPJ_REGEX, cnpjRepl)
    .replace(PHONE_REGEX, phoneRepl)
    .replace(RG_REGEX, rgRepl)
    .replace(NAME_REGEX, "*** *** ***")
    .replace(MEDICAL_RECORD_REGEX, "MR-******")
    .replace(CRM_REGEX, "[REDACTED_REG]")
    .replace(CEP_REGEX, "*****-***")
    .replace(CREDIT_CARD_SPACE_REGEX, "**** **** **** ****")
    .replace(CREDIT_CARD_DOTTED_REGEX, "****.****.****.****")
    .replace(BANK_REGEX, "Banco: *** Agência: **** Conta: ******-*")
    .replace(SUS_CNS_REGEX, "[REDACTED_SUS_CNS]")
    .replace(INSURANCE_REGEX, "Unimed *****");

  if (opts.customPatterns) {
    for (const { pattern, replacement } of opts.customPatterns) {
      out = out.replace(pattern, replacement);
    }
  }
  return out;
}

export default redact;
