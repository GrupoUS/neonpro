import { describe, expect, test } from 'vitest';
import { checkConsent, ConsentScope, redactPII } from '../../services/privacy';

describe(_'redactPII',_() => {
  test(_'redacts emails',_() => {
    const input = 'Contato: maria.silva@example.com para dúvidas.';
    const out = redactPII(input);
    expect(out).not.toMatch(/maria\.silva@example\.com/);
    expect(out).toMatch(/\[REDACTED_EMAIL\]/);
  });
  test(_'redacts phone numbers',_() => {
    const input = 'Telefone: (11) 91234-5678 ou 11912345678';
    const out = redactPII(input);
    expect(out).toMatch(/\[REDACTED_PHONE\]/);
  });
  test(_'redacts CPF',_() => {
    const input = 'CPF do paciente: 123.456.789-09';
    const out = redactPII(input);
    expect(out).toMatch(/\[REDACTED_CPF\]/);
  });
});

describe(_'checkConsent',_() => {
  const consent = {
    images: true,
    clinical: false,
    billing: true,
  } as Record<ConsentScope, boolean>;

  test(_'allows when scope permitted',_() => {
    expect(checkConsent(consent, 'images')).toBe(true);
    expect(checkConsent(consent, 'billing')).toBe(true);
  });
  test(_'blocks when scope not permitted',_() => {
    expect(checkConsent(consent, 'clinical')).toBe(false);
  });
  test(_'defaults to false if scope missing',_() => {
    // @ts-expect-error test invalid key handling
    expect(checkConsent(consent, 'unknown')).toBe(false);
  });
});
