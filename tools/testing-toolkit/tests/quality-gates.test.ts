import { describe, expect, it, vi } from 'vitest';
import { QualityGateValidator } from '../src/core/quality-gates';

describe('QualityGateValidator', () => {
  it('throws when gate is missing', () => {
    const validator = new QualityGateValidator();
    expect(() => validator.validateGate('unknown', 10)).toThrow(
      'Quality gate \'unknown\' not found',
    );
  });

  it('evaluates special gate behavior', () => {
    const validator = new QualityGateValidator();

    expect(validator.validateGate('security-vulnerabilities', 0).passed).toBe(true);
    expect(validator.validateGate('security-vulnerabilities', 2).passed).toBe(false);

    expect(validator.validateGate('performance-budget', 900).passed).toBe(true);
    expect(validator.validateGate('performance-budget', 1200).passed).toBe(false);

    expect(validator.validateGate('test-coverage', 90).passed).toBe(true);
    expect(validator.validateGate('test-coverage', 70).passed).toBe(false);
  });

  it('validates multiple metrics and summarizes results', () => {
    const validator = new QualityGateValidator();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const summary = validator.validateGates({
      'test-coverage': 70,
      'performance-budget': 1100,
      'security-vulnerabilities': 0,
      'unknown-gate': 50,
    });

    expect(summary.passed).toBe(false);
    expect(summary.results).toHaveLength(3);
    expect(summary.criticalFailures.length).toBeGreaterThan(0);
    expect(summary.summary).toContain('critical failures');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Skipping unknown quality gate'));

    warnSpy.mockRestore();
  });

  it('adds or updates gates and generates reports', () => {
    const validator = new QualityGateValidator([]);

    validator.addGate({
      name: 'custom-gate',
      threshold: 50,
      critical: false,
      description: 'Custom quality gate for experiments',
    });

    validator.addGate({
      name: 'custom-gate',
      threshold: 60,
      critical: true,
      description: 'Updated custom gate with stricter threshold',
    });

    const results = [
      validator.validateGate('custom-gate', 40),
      validator.validateGate('custom-gate', 65),
    ];

    const report = validator.generateReport(results);

    expect(report).toContain('Quality Gates Report');
    expect(report).toContain('❌ FAIL custom-gate (CRITICAL)');
    expect(report).toContain('✅ PASS custom-gate');
    expect(validator.getGates()).toHaveLength(1);
  });
});
