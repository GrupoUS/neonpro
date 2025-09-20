/**
 * Shared Utilities for NeonPro Tools
 *
 * Consolidates common utility functions used across different tools
 * to reduce duplication and maintain consistency.
 */

import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  statSync,
  readdirSync,
} from "fs";
import { join, dirname, resolve, relative, parse, extname } from "path";
import { exec, execSync } from "child_process";
import { promisify } from "util";
import {
  Result,
  FileOperationOptions,
  ValidationResult,
  PackageInfo,
  ToolError,
  ValidationError,
} from "../types";

const execAsync = promisify(exec);

// ========================================
// File System Utilities
// ========================================

/**
 * Safely read file with error handling
 */
export function readFileSafe(
  filePath: string,
  encoding: BufferEncoding = "utf8",
): Result<string> {
  try {
    const content = readFileSync(filePath, encoding);
    return {
      success: true,
      data: content,
      message: `Successfully read file: ${filePath}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error as Error,
      message: `Failed to read file: ${filePath}`,
    };
  }
}

/**
 * Safely write file with directory creation
 */
export function writeFileSafe(
  filePath: string,
  content: string,
  options: FileOperationOptions = {},
): Result<void> {
  try {
    const dir = dirname(filePath);
    if (options.createDirectories && !existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(filePath, content, {
      encoding: options.encoding || "utf8",
      mode: options.mode,
      flag: options.flag,
    });

    return {
      success: true,
      message: `Successfully wrote file: ${filePath}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error as Error,
      message: `Failed to write file: ${filePath}`,
    };
  }
}

/**
 * Get file statistics safely
 */
export function getFileStat(
  filePath: string,
): Result<{ size: number; mtime: Date; isDirectory: boolean }> {
  try {
    const stats = statSync(filePath);
    return {
      success: true,
      data: {
        size: stats.size,
        mtime: stats.mtime,
        isDirectory: stats.isDirectory(),
      },
      message: `Successfully got stats for: ${filePath}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error as Error,
      message: `Failed to get stats for: ${filePath}`,
    };
  }
}

/**
 * Find files recursively with pattern matching
 */
export function findFiles(
  directory: string,
  pattern: RegExp | string,
  maxDepth: number = 10,
): Result<string[]> {
  try {
    const files: string[] = [];
    const patternRegex =
      typeof pattern === "string" ? new RegExp(pattern) : pattern;

    function walkDirectory(dir: string, depth: number = 0): void {
      if (depth > maxDepth) return;

      const entries = readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          walkDirectory(fullPath, depth + 1);
        } else if (patternRegex.test(entry.name)) {
          files.push(fullPath);
        }
      }
    }

    walkDirectory(directory);

    return {
      success: true,
      data: files,
      message: `Found ${files.length} files matching pattern`,
    };
  } catch (error) {
    return {
      success: false,
      error: error as Error,
      message: `Failed to find files in: ${directory}`,
    };
  }
}

// ========================================
// Package and Dependency Utilities
// ========================================

/**
 * Read and parse package.json safely
 */
export function readPackageJson(
  filePath: string = "package.json",
): Result<PackageInfo> {
  try {
    const content = readFileSync(filePath, "utf8");
    const packageData = JSON.parse(content);

    const packageInfo: PackageInfo = {
      name: packageData.name,
      version: packageData.version,
      description: packageData.description,
      dependencies: packageData.dependencies || {},
      devDependencies: packageData.devDependencies || {},
      peerDependencies: packageData.peerDependencies || {},
    };

    return {
      success: true,
      data: packageInfo,
      message: `Successfully parsed package.json: ${filePath}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error as Error,
      message: `Failed to read package.json: ${filePath}`,
    };
  }
}

/**
 * Check if package is installed
 */
export function isPackageInstalled(
  packageName: string,
  directory: string = process.cwd(),
): boolean {
  try {
    const packagePath = resolve(directory, "node_modules", packageName);
    return existsSync(packagePath);
  } catch {
    return false;
  }
}

/**
 * Get package version from node_modules
 */
export function getInstalledPackageVersion(
  packageName: string,
  directory: string = process.cwd(),
): Result<string> {
  try {
    const packageJsonPath = resolve(
      directory,
      "node_modules",
      packageName,
      "package.json",
    );
    const result = readPackageJson(packageJsonPath);

    if (!result.success || !result.data) {
      return {
        success: false,
        error: new Error("Package not found"),
        message: `Package ${packageName} is not installed`,
      };
    }

    return {
      success: true,
      data: result.data.version,
      message: `Found version ${result.data.version} for ${packageName}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error as Error,
      message: `Failed to get version for ${packageName}`,
    };
  }
}

// ========================================
// Command Execution Utilities
// ========================================

/**
 * Execute command safely with timeout
 */
export async function executeCommand(
  command: string,
  options: {
    cwd?: string;
    timeout?: number;
    env?: Record<string, string>;
  } = {},
): Promise<Result<{ stdout: string; stderr: string }>> {
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: options.cwd || process.cwd(),
      timeout: options.timeout || 30000,
      env: { ...process.env, ...options.env },
    });

    return {
      success: true,
      data: { stdout, stderr },
      message: `Command executed successfully: ${command}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error as Error,
      message: `Command failed: ${command}`,
    };
  }
}

/**
 * Execute command synchronously
 */
export function executeCommandSync(
  command: string,
  options: {
    cwd?: string;
    encoding?: BufferEncoding;
  } = {},
): Result<string> {
  try {
    const output = execSync(command, {
      cwd: options.cwd || process.cwd(),
      encoding: options.encoding || "utf8",
    });

    return {
      success: true,
      data: output,
      message: `Command executed successfully: ${command}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error as Error,
      message: `Command failed: ${command}`,
    };
  }
}

// ========================================
// Validation Utilities
// ========================================

/**
 * Validate TypeScript files
 */
export async function validateTypeScript(
  files: string[],
  tsConfigPath?: string,
): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const tsConfigArg = tsConfigPath ? `--project ${tsConfigPath}` : "";
    const command = `npx tsc --noEmit ${tsConfigArg} ${files.join(" ")}`;

    const result = await executeCommand(command);

    if (!result.success) {
      const output = result.error?.message || "";
      const lines = output.split("\n");

      for (const line of lines) {
        if (line.includes("error TS")) {
          errors.push(line.trim());
        } else if (line.includes("warning") || line.includes("deprecated")) {
          warnings.push(line.trim());
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score: errors.length === 0 ? (warnings.length === 0 ? 100 : 90) : 0,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [`TypeScript validation failed: ${(error as Error).message}`],
      warnings: [],
      score: 0,
    };
  }
}

/**
 * Validate configuration object against schema
 */
export function validateConfig<T>(
  config: any,
  requiredFields: (keyof T)[],
  optionalFields: (keyof T)[] = [],
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config || typeof config !== "object") {
    return {
      valid: false,
      errors: ["Configuration must be an object"],
      warnings: [],
      score: 0,
    };
  }

  // Check required fields
  for (const field of requiredFields) {
    if (
      !(field in config) ||
      config[field] === undefined ||
      config[field] === null
    ) {
      errors.push(`Missing required field: ${String(field)}`);
    }
  }

  // Check for unknown fields
  const allowedFields = [...requiredFields, ...optionalFields];
  for (const key in config) {
    if (!allowedFields.includes(key as keyof T)) {
      warnings.push(`Unknown field: ${key}`);
    }
  }

  const score = errors.length === 0 ? (warnings.length === 0 ? 100 : 85) : 0;

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score,
  };
}

// ========================================
// String and Formatting Utilities
// ========================================

/**
 * Convert string to camelCase
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase(),
    )
    .replace(/\s+/g, "");
}

/**
 * Convert string to kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

/**
 * Convert string to PascalCase
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
    .replace(/\s+/g, "");
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Format duration in milliseconds to human readable string
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else if (seconds > 0) {
    return `${seconds}s`;
  } else {
    return `${ms}ms`;
  }
}

/**
 * Truncate string with ellipsis
 */
export function truncate(
  str: string,
  maxLength: number,
  ellipsis: string = "...",
): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - ellipsis.length) + ellipsis;
}

// ========================================
// Path Utilities
// ========================================

/**
 * Get relative path from one directory to another
 */
export function getRelativePath(from: string, to: string): string {
  return relative(from, to);
}

/**
 * Normalize path separators to forward slashes
 */
export function normalizePath(path: string): string {
  return path.replace(/\\/g, "/");
}

/**
 * Get file extension without dot
 */
export function getFileExtension(filePath: string): string {
  return extname(filePath).slice(1);
}

/**
 * Get file name without extension
 */
export function getFileNameWithoutExtension(filePath: string): string {
  const parsed = parse(filePath);
  return parsed.name;
}

// ========================================
// Array and Object Utilities
// ========================================

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Remove duplicates from array
 */
export function removeDuplicates<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Group array by key function
 */
export function groupBy<T, K extends string | number | symbol>(
  array: T[],
  keyFn: (item: T) => K,
): Record<K, T[]> {
  return array.reduce(
    (groups, item) => {
      const key = keyFn(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    },
    {} as Record<K, T[]>,
  );
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>,
): T {
  const result = { ...target } as Record<string, unknown>;

  const keys = Object.keys(source as Record<string, unknown>) as (keyof T)[];

  for (const key of keys) {
    const sourceValue = source[key];
    if (sourceValue === undefined) {
      continue;
    }

    const targetValue = result[key as string];

    if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
      result[key as string] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>,
      );
    } else {
      result[key as string] = sourceValue as unknown;
    }
  }

  return result as T;
}

/**
 * Pick specific keys from object
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Omit specific keys from object
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...obj } as Record<string, unknown>;
  for (const key of keys) {
    delete result[key as string];
  }
  return result as Omit<T, K>;
}

// ========================================
// Promise Utilities
// ========================================

/**
 * Delay execution for specified milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000,
): Promise<Result<T>> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn();
      return {
        success: true,
        data: result,
        message: `Operation succeeded on attempt ${attempt}`,
      };
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxAttempts) {
        const delayMs = baseDelay * Math.pow(2, attempt - 1);
        await delay(delayMs);
      }
    }
  }

  return {
    success: false,
    error: lastError!,
    message: `Operation failed after ${maxAttempts} attempts`,
  };
}

/**
 * Run promises with timeout
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timer));
  });
}

// ========================================
// Validation and Error Utilities
// ========================================

/**
 * Assert condition and throw error if false
 */
export function assert(condition: any, message: string): asserts condition {
  if (!condition) {
    throw new ValidationError(message);
  }
}

/**
 * Create error with additional context
 */
export function createError(
  message: string,
  code: string,
  details?: Record<string, any>,
): ToolError {
  return new ToolError(message, code, details);
}

/**
 * Check if value is defined and not null
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Safely get nested property from object
 */
export function safeGet<T>(
  obj: any,
  path: string,
  defaultValue?: T,
): T | undefined {
  try {
    return (
      path.split(".").reduce((current, key) => current?.[key], obj) ??
      defaultValue
    );
  } catch {
    return defaultValue;
  }
}

// Export everything
export * from "../types";
