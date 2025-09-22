import { describe, expect, test } from 'vitest';
import { checkConsent, ConsentScope, redactPII } from '../../services/privacy';

<<<<<<< HEAD
describe('redactPII',() => {
  test('redacts emails',() => {
    const input = 'Contato: maria.silva@example.com para dúvidas.';
    const out = redactPII(input
    expect(out).not.toMatch(/maria\.silva@example\.com/
    expect(out).toMatch(/\[REDACTED_EMAIL\]/
  test('redacts phone numbers',() => {
    const input = 'Telefone: (11) 91234-5678 ou 11912345678';
    const out = redactPII(input
    expect(out).toMatch(/\[REDACTED_PHONE\]/
  test('redacts CPF',() => {
=======
describe(_'redactPII',() => {
  test(_'redacts emails',() => {
    const input = 'Contato: maria.silva@example.com para dúvidas.';
    const out = redactPII(input);
    expect(out).not.toMatch(/maria\.silva@example\.com/);
    expect(out).toMatch(/\[REDACTED_EMAIL\]/);
  });
  test(_'redacts phone numbers',() => {
    const input = 'Telefone: (11) 91234-5678 ou 11912345678';
    const out = redactPII(input);
    expect(out).toMatch(/\[REDACTED_PHONE\]/);
  });
  test(_'redacts CPF',() => {
>>>>>>> origin/main
    const input = 'CPF do paciente: 123.456.789-09';
    const out = redactPII(input
    expect(out).toMatch(/\[REDACTED_CPF\]/

<<<<<<< HEAD
describe('checkConsent',() => {
=======
describe(_'checkConsent',() => {
>>>>>>> origin/main
  const consent = {
    images: true,
    clinical: false,
    billing: true,
  } as Record<ConsentScope, boolean>;

<<<<<<< HEAD
  test('allows when scope permitted',() => {
    expect(checkConsent(consent, 'images')).toBe(true);
    expect(checkConsent(consent, 'billing')).toBe(true);
  test('blocks when scope not permitted',() => {
    expect(checkConsent(consent, 'clinical')).toBe(false);
  test('defaults to false if scope missing',() => {
=======
  test(_'allows when scope permitted',() => {
    expect(checkConsent(consent, 'images')).toBe(true);
    expect(checkConsent(consent, 'billing')).toBe(true);
  });
  test(_'blocks when scope not permitted',() => {
    expect(checkConsent(consent, 'clinical')).toBe(false);
  });
  test(_'defaults to false if scope missing',() => {
>>>>>>> origin/main
    // @ts-expect-error test invalid key handling
    expect(checkConsent(consent, 'unknown')).toBe(false);
