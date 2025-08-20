import { describe, expect, it } from 'vitest';

/**
 * Basic Utility Tests - No External Dependencies
 * ==============================================
 *
 * Simple tests to verify Vitest is working correctly
 * without complex dependencies or imports.
 */

describe('Basic Utility Functions', () => {
  // Helper function to test
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Helper function to validate email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Helper function to capitalize name
  const capitalizeName = (name: string): string => {
    return name
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  it('should format currency correctly', () => {
    expect(formatCurrency(100)).toBe('R$ 100,00');
    expect(formatCurrency(1500.5)).toBe('R$ 1.500,50');
    expect(formatCurrency(0)).toBe('R$ 0,00');
  });

  it('should validate email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user@domain.co.uk')).toBe(true);
    expect(isValidEmail('invalid.email')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
  });

  it('should capitalize names correctly', () => {
    expect(capitalizeName('joão silva')).toBe('João Silva');
    expect(capitalizeName('MARIA DOS SANTOS')).toBe('Maria Dos Santos');
    expect(capitalizeName('pedro')).toBe('Pedro');
    expect(capitalizeName('')).toBe('');
  });

  it('should handle basic arithmetic', () => {
    expect(2 + 2).toBe(4);
    expect(10 - 5).toBe(5);
    expect(3 * 4).toBe(12);
    expect(15 / 3).toBe(5);
  });

  it('should work with arrays', () => {
    const patients = ['João', 'Maria', 'Pedro'];

    expect(patients).toHaveLength(3);
    expect(patients).toContain('João');
    expect(patients[0]).toBe('João');

    const filtered = patients.filter((name) => name.startsWith('M'));
    expect(filtered).toEqual(['Maria']);
  });

  it('should work with objects', () => {
    const patient = {
      id: 1,
      name: 'João Silva',
      age: 35,
      active: true,
    };

    expect(patient.name).toBe('João Silva');
    expect(patient.age).toBeGreaterThan(30);
    expect(patient.active).toBe(true);
    expect(patient).toHaveProperty('id');
  });
});
