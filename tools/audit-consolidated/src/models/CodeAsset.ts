/**
 * CodeAsset Model
 * Represents any file or resource in the monorepo with usage and compliance tracking
 * Based on: specs/003-monorepo-audit-optimization/data-model.md
 * Generated: 2025-09-09
 */

import {
  ArchitectureViolation,
  AssetMetadata,
  AssetType,
  ComplianceStatus,
  UsageStatus,
} from './types';

export class CodeAsset {
  public readonly path: string;
  public type: AssetType;
  public readonly size: number;
  public readonly lastModified: Date;
  public usageStatus: UsageStatus;
  public dependencies: string[];
  public dependents: string[];
  public complianceStatus: ComplianceStatus;
  public violations: ArchitectureViolation[];
  public metadata: AssetMetadata;

  constructor(
    path: string,
    type: AssetType,
    size: number,
    lastModified: Date,
    metadata: AssetMetadata = { location: 'other' },
  ) {
    this.path = path;
    this.type = type;
    this.size = size;
    this.lastModified = lastModified;
    this.usageStatus = UsageStatus.UNKNOWN;
    this.dependencies = [];
    this.dependents = [];
    this.complianceStatus = ComplianceStatus.UNKNOWN;
    this.violations = [];
    this.metadata = metadata;
  }

  /**
   * Add a dependency to this asset
   */
  public addDependency(dependencyPath: string): void {
    if (!this.dependencies.includes(dependencyPath)) {
      this.dependencies.push(dependencyPath);
    }
  }

  /**
   * Add a dependent to this asset
   */
  public addDependent(dependentPath: string): void {
    if (!this.dependents.includes(dependentPath)) {
      this.dependents.push(dependentPath);
    }
  }

  /**
   * Remove a dependency from this asset
   */
  public removeDependency(dependencyPath: string): boolean {
    const index = this.dependencies.indexOf(dependencyPath);
    if (index >= 0) {
      this.dependencies.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Remove a dependent from this asset
   */
  public removeDependent(dependentPath: string): boolean {
    const index = this.dependents.indexOf(dependentPath);
    if (index >= 0) {
      this.dependents.splice(index, 1);
      return true;
    }
    return false;
  } /**
   * Add an architecture violation to this asset
   */

  public addViolation(violation: ArchitectureViolation): void {
    this.violations.push(violation);
    this.complianceStatus = ComplianceStatus.VIOLATES;
  }

  /**
   * Clear all violations and mark as compliant
   */
  public clearViolations(): void {
    this.violations = [];
    this.complianceStatus = ComplianceStatus.COMPLIES;
  }

  /**
   * Update usage status based on current dependencies and dependents
   */
  public updateUsageStatus(): void {
    if (this.dependents.length === 0) {
      // No dependents - potentially unused
      if (this.isEntryPoint()) {
        this.usageStatus = UsageStatus.ACTIVE;
      } else {
        this.usageStatus = UsageStatus.UNUSED;
      }
    } else if (this.hasOrphanedDependencies()) {
      this.usageStatus = UsageStatus.ORPHANED;
    } else {
      this.usageStatus = UsageStatus.ACTIVE;
    }
  }

  /**
   * Check if this asset is an entry point (main.tsx, index.ts, etc.)
   */
  public isEntryPoint(): boolean {
    const entryPointPatterns = [
      /main\.(ts|tsx|js|jsx)$/,
      /index\.(ts|tsx|js|jsx)$/,
      /app\.(ts|tsx|js|jsx)$/,
      /_app\.(ts|tsx|js|jsx)$/,
    ];

    return entryPointPatterns.some(pattern => pattern.test(this.path));
  }

  /**
   * Check if this asset has orphaned dependencies
   */
  public hasOrphanedDependencies(): boolean {
    // This would be determined by the DependencyAnalyzer
    // For now, we'll mark as false by default
    return false;
  }

  /**
   * Check if this is a test file
   */
  public isTestFile(): boolean {
    return (
      this.type === AssetType.TEST
      || this.path.includes('.test.')
      || this.path.includes('.spec.')
      || this.path.includes('/__tests__/')
      || this.path.includes('/test/')
    );
  }

  /**
   * Get package name from metadata if available
   */
  public getPackageName(): string | undefined {
    return this.metadata.packageName;
  }

  /**
   * Get file extension
   */
  public getExtension(): string {
    return this.path.split('.').pop() || '';
  }

  /**
   * Check if asset is in apps directory
   */
  public isInApps(): boolean {
    return this.metadata.location === 'apps' || this.path.includes('/apps/');
  }

  /**
   * Check if asset is in packages directory
   */
  public isInPackages(): boolean {
    return this.metadata.location === 'packages' || this.path.includes('/packages/');
  }

  /**
   * Convert to JSON representation
   */
  public toJSON(): object {
    return {
      path: this.path,
      type: this.type,
      size: this.size,
      lastModified: this.lastModified,
      usageStatus: this.usageStatus,
      dependencies: this.dependencies,
      dependents: this.dependents,
      complianceStatus: this.complianceStatus,
      violations: this.violations,
      metadata: this.metadata,
    };
  }

  /**
   * Create CodeAsset from JSON representation
   */
  public static fromJSON(data: any): CodeAsset {
    const asset = new CodeAsset(
      data.path,
      data.type,
      data.size,
      new Date(data.lastModified),
      data.metadata,
    );

    asset.usageStatus = data.usageStatus;
    asset.dependencies = data.dependencies || [];
    asset.dependents = data.dependents || [];
    asset.complianceStatus = data.complianceStatus;
    asset.violations = data.violations || [];

    return asset;
  }
}
