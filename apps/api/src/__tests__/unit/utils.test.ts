import { describe, expect, test } from 'vitest';
import { checkConsent, ConsentScope, redactPII } from '../../services/privacy';

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
describe(('redactPII',() => {
  test(('redacts emails',() => {
    const input = 'Contato: maria.silva@example.com para dúvidas.';
    const out = redactPII(input);
    expect(out).not.toMatch(/maria\.silva@example\.com/);
    expect(out).toMatch(/\[REDACTED_EMAIL\]/);
  });
  test(('redacts phone numbers',() => {
    const input = 'Telefone: (11) 91234-5678 ou 11912345678';
    const out = redactPII(input);
    expect(out).toMatch(/\[REDACTED_PHONE\]/);
  });
  test(('redacts CPF',() => {
    const input = 'CPF do paciente: 123.456.789-09';
    const out = redactPII(input
    expect(out).toMatch(/\[REDACTED_CPF\]/

describe('checkConsent',() => {
describe(('checkConsent',() => {
  const consent = {
    images: true,
    clinical: false,
    billing: true,
  } as Record<ConsentScope, boolean>;

  test('allows when scope permitted',() => {
    expect(checkConsent(consent, 'images')).toBe(true);
    expect(checkConsent(consent, 'billing')).toBe(true);
  test('blocks when scope not permitted',() => {
    expect(checkConsent(consent, 'clinical')).toBe(false);
  test('defaults to false if scope missing',() => {
  test(('allows when scope permitted',() => {
    expect(checkConsent(consent, 'images')).toBe(true);
    expect(checkConsent(consent, 'billing')).toBe(true);
  });
  test(('blocks when scope not permitted',() => {
    expect(checkConsent(consent, 'clinical')).toBe(false);
  });
  test(('defaults to false if scope missing',() => {
    // @ts-expect-error test invalid key handling
    expect(checkConsent(consent, 'unknown')).toBe(false);
