/**
 * Registry Utilities - Component Installation Management
 *
 * Types and utilities for managing component installations
 * from the NEONPRO UI registry system
 */

export interface InstallationOptions {
  /**
   * Enable constitutional compliance validation during installation
   */
  constitutionalMode?: boolean

  /**
   * Force installation even if conflicts are detected
   */
  force?: boolean

  /**
   * Dry run - simulate installation without actually installing
   */
  dryRun?: boolean

  /**
   * Skip dependency installation
   */
  skipDependencies?: boolean

  /**
   * Verbose logging during installation
   */
  verbose?: boolean
}

export interface InstallationResult {
  /**
   * Whether the installation was successful
   */
  success: boolean

  /**
   * List of successfully installed components
   */
  installed: string[]

  /**
   * List of components that failed to install
   */
  failed: string[]

  /**
   * Dependency conflicts detected during installation
   */
  conflicts: string[]

  /**
   * Warning messages generated during installation
   */
  warnings: string[]

  /**
   * Total size of installed components in bytes
   */
  totalSize: number

  /**
   * Detailed error messages for failed installations
   */
  errors?: string[]
}
