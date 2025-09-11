// T044 license-audit enhanced implementation
// Provides performLicenseAudit() returning enriched structure.
// Enhancement: gathers root dependency licenses; UNKNOWN when not resolvable.

export interface LicensePackageInfo {
  name: string;
  version: string;
  license: string;
}

export interface LicenseAuditReport {
  packages: LicensePackageInfo[];
  violations: string[];
  generatedAt: string;
  packageCount: number;
  unknownLicenseCount: number;
  status: 'pass' | 'attention';
}

export async function performLicenseAudit(): Promise<LicenseAuditReport> {
  const fs = await import('fs');
  const path = await import('path');
  let rootPkg: any = {};
  try {
    rootPkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8'));
  } catch (_) {
    // ignore
  }
  const depNames = Object.keys({
    ...(rootPkg.dependencies || {}),
    ...(rootPkg.devDependencies || {}),
  });
  const packages: LicensePackageInfo[] = [];
  for (const name of depNames) {
    try {
      const pkgPath = require.resolve(path.join(name, 'package.json'));
      const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const license = pkgJson.license
        || (Array.isArray(pkgJson.licenses)
          ? pkgJson.licenses.map((l: any) => l.type).join(',')
          : 'UNKNOWN');
      packages.push({ name, version: pkgJson.version || '0.0.0', license });
    } catch (e) {
      packages.push({ name, version: 'UNKNOWN', license: 'UNKNOWN' });
    }
  }
  const unknown = packages.filter(p => p.license === 'UNKNOWN');
  return {
    packages,
    violations: [],
    generatedAt: new Date().toISOString(),
    packageCount: packages.length,
    unknownLicenseCount: unknown.length,
    status: unknown.length ? 'attention' : 'pass',
  };
}

/**
 * Basic CLI support: bun tsx tools/audit/license-audit.ts
 */
if (process.argv[1] && process.argv[1].includes('license-audit.ts')) {
  (async () => {
    try {
      const { performLicenseAudit } = await import('./license-audit.ts');
      const report = await performLicenseAudit();
      console.log(JSON.stringify(report, null, 2));
      if (report.packages.some(p => p.license === 'UNKNOWN')) {
        console.error('License audit found UNKNOWN licenses');
        process.exit(1);
      }
    } catch (e: any) {
      console.error('License audit error:', e?.message || e);
      process.exit(2);
    }
  })();
}
export default { performLicenseAudit };
