import fs from 'node:fs';
import path from 'node:path';

describe('tASK-001 Foundation Setup Verification', () => {
  const rootDir = path.join(__dirname, '../../');

  describe('monitoring Utilities', () => {
    it('should have all required monitoring utility files', () => {
      const monitoringDir = path.join(rootDir, 'lib/monitoring');

      const requiredFiles = [
        'analytics.ts',
        'error-tracking.ts',
        'feature-flags.ts',
        'performance.ts',
        'baseline.ts',
        'emergency-response.ts',
        'index.ts',
        'performance-monitor.ts',
      ];

      requiredFiles.forEach((file) => {
        const filePath = path.join(monitoringDir, file);
        expect(fs.existsSync(filePath)).toBeTruthy();
      });
    });

    it('should have monitoring components', () => {
      const componentsDir = path.join(rootDir, 'components/monitoring');

      const requiredComponents = [
        'FeatureFlagManager.tsx',
        'SystemHealthWidget.tsx',
        'performance-dashboard.tsx',
      ];

      requiredComponents.forEach((component) => {
        const componentPath = path.join(componentsDir, component);
        expect(fs.existsSync(componentPath)).toBeTruthy();
      });
    });

    it('should have monitoring API endpoints', () => {
      const apiDir = path.join(rootDir, 'app/api/monitoring');

      const requiredEndpoints = ['health', 'feature-flags', 'metrics'];

      requiredEndpoints.forEach((endpoint) => {
        const endpointPath = path.join(apiDir, endpoint, 'route.ts');
        expect(fs.existsSync(endpointPath)).toBeTruthy();
      });
    });
  });
});
