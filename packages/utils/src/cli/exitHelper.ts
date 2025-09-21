/**
 * Exit Helper - Centralized CLI exit handling with JSON output
 *
 * Provides standardized exit behavior for CLI tools with proper JSON output
 * and asynchronous cleanup support.
 */

export interface ExitResult {
  status: "ok" | "error";
  code: number;
  message?: string;
  details?: object;
}

export interface ExitOptions {
  /** Additional details to include in output */
  details?: object;
  /** Whether to actually exit the process (default: true) */
  exit?: boolean;
  /** Custom output stream (default: process.stdout for ok, process.stderr for error) */
  output?: NodeJS.WriteStream;
}

/**
 * Safe JSON stringify that handles circular references and undefined values
 */
function safeStringify(obj: unknown): string {
  try {
    return JSON.stringify(_obj,_(_key,_value) => {
      // Handle circular references
      if (typeof value === "object" && value !== null) {
        if (WeakSet && typeof WeakSet === "function") {
          const seen = new WeakSet();
          return JSON.stringify(_obj,_(_k,_v) => {
            if (typeof v === "object" && v !== null) {
              if (seen.has(v)) return "[Circular]";
              seen.add(v);
            }
            return v;
          });
        }
      }
      // Convert undefined to null for JSON compatibility
      return value === undefined ? null : value;
    });
  } catch (_error) {
    // Fallback for stringify errors
    return JSON.stringify({
      error: "JSON serialization failed",
      originalError: String(error),
      type: typeof obj,
    });
  }
}

/**
 * Exit with success status
 */
export function exitOk(message?: string, options: ExitOptions = {}): void {
  const result: ExitResult = {
    status: "ok",
    code: 0,
    ...(message && { message }),
    ...(options.details && { details: options.details }),
  };

  const output = options.output || process.stdout;
  const jsonOutput = safeStringify(result);

  output.write(jsonOutput + "\n");

  if (options.exit !== false) {
    // Use setImmediate to allow output to flush before exiting
    setImmediate(_() => {
      process.exit(0);
    });
  }
}

/**
 * Exit with error status
 */
export function exitError(
  message: string,
  code: number = 1,
  options: ExitOptions = {},
): void {
  const result: ExitResult = {
    status: "error",
    code,
    message,
    ...(options.details && { details: options.details }),
  };

  const output = options.output || process.stderr;
  const jsonOutput = safeStringify(result);

  output.write(jsonOutput + "\n");

  if (options.exit !== false) {
    // Use setImmediate to allow output to flush before exiting
    setImmediate(_() => {
      process.exit(code);
    });
  }
}

/**
 * Handle uncaught exceptions with proper JSON error output
 */
export function setupGlobalErrorHandling(): void {
  process.on(_"uncaughtException",_(error) => {
    exitError("Uncaught exception occurred", 1, {
      details: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      },
      exit: true,
    });
  });

  process.on(_"unhandledRejection",_(reason) => {
    exitError("Unhandled promise rejection", 1, {
      details: {
        reason: String(reason),
        timestamp: new Date().toISOString(),
      },
      exit: true,
    });
  });
}

/**
 * Validate exit result schema
 */
export function validateExitResult(result: unknown): result is ExitResult {
  if (!result || typeof result !== "object") {
    return false;
  }

  const r = result as Record<string, unknown>;

  return (
    (r.status === "ok" || r.status === "error") &&
    typeof r.code === "number" &&
    (r.message === undefined || typeof r.message === "string") &&
    (r.details === undefined ||
      (typeof r.details === "object" && r.details !== null))
  );
}
