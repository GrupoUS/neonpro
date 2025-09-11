// T044 License audit test (RED)
// Expects performLicenseAudit() to return report with packages array and violations array.
import { describe, expect, it } from 'vitest';
import * as licenseAudit from '../../license-audit'; // not yet implemented

describe('T044 license audit', () => {
  it('returns report structure with packages and violations', async () => {
    if (typeof (licenseAudit as any).performLicenseAudit !== 'function') {
      expect(typeof (licenseAudit as any).performLicenseAudit).toBe('function'); // force fail
      return;
    }
    const report = await (licenseAudit as any).performLicenseAudit();
    expect(report).toHaveProperty('packages');
    expect(Array.isArray(report.packages)).toBe(true);
    expect(report).toHaveProperty('violations');
    expect(Array.isArray(report.violations)).toBe(true);
  });
});
