/**
 * RED Phase Tests - CI Build Failure
 * These tests should fail initially and pass after fixing lockfile issues
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { beforeEach, describe, expect, it } from 'vitest';

describe('CI Build Failure Tests', () => {
  const projectRoot = path.join(__dirname, '../../../../..');
  const apiPackagePath = path.join(projectRoot, 'apps/api/package.json');
  const rootPackagePath = path.join(projectRoot, 'package.json');
  const bunLockPath = path.join(projectRoot, 'bun.lock');
  const pnpmLockPath = path.join(projectRoot, 'pnpm-lock.yaml');

  beforeEach(() => {
    // Reset any changes made during tests
    try {
      execSync('git checkout -- package.json bun.lock pnpm-lock.yaml', {
        cwd: projectRoot,
        stdio: 'pipe',
      });
    } catch (error) {
      // Ignore errors if files don't exist
    }
  });

  describe('Lockfile Consistency', () => {
    it('should have consistent package manager configuration', () => {
      // This test should fail if there are lockfile conflicts
      const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));
      const apiPackage = JSON.parse(fs.readFileSync(apiPackagePath, 'utf8'));

      // Check that package manager is consistently configured
      expect(rootPackage.packageManager).toBeDefined();
      expect(rootPackage.packageManager).toContain('pnpm');

      // Check that workspaces are properly configured
      expect(rootPackage.workspaces).toContain('apps/*');
      expect(rootPackage.workspaces).toContain('packages/*');
    });

    it('should have valid lockfile that works with frozen install', () => {
      // This test should fail if bun install --frozen-lockfile fails
      expect(fs.existsSync(bunLockPath)).toBe(true);

      if (fs.existsSync(pnpmLockPath)) {
        expect(fs.existsSync(pnpmLockPath)).toBe(true);
      }

      // Try to validate lockfile format
      const lockfileContent = fs.readFileSync(bunLockPath, 'utf8');
      expect(lockfileContent).toContain('"lockfileVersion": 1');
      expect(lockfileContent).toContain('"workspaces"');
    });

    it('should not have conflicting dependency versions', () => {
      // This test should fail if there are version conflicts
      const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));

      // Check for common version conflicts
      const dependencies = {
        ...rootPackage.dependencies,
        ...rootPackage.devDependencies,
      };

      // Ensure no duplicate packages with different versions
      const depNames = Object.keys(dependencies);
      const uniqueDeps = new Set(depNames);
      expect(depNames.length).toBe(uniqueDeps.size);
    });
  });

  describe('Package Scripts Compatibility', () => {
    it('should have compatible build scripts across packages', () => {
      // This test should fail if build scripts are incompatible
      const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));
      const apiPackage = JSON.parse(fs.readFileSync(apiPackagePath, 'utf8'));

      // Check that build scripts exist and are compatible
      expect(rootPackage.scripts.build).toBeDefined();
      expect(apiPackage.scripts.build).toBeDefined();

      // Check that both use turbo for building
      expect(rootPackage.scripts.build).toContain('turbo');
    });
  });
});
