/**
 * CLI Wrapper - Standardized CLI command execution with JSON output
 *
 * Provides a consistent interface for CLI commands with proper error handling,
 * timeout support, and standardized JSON output format.
 */

import { exitOk, exitError, setupGlobalErrorHandling } from "./exitHelper.js";

export interface CLICommand {
  /** Command name for identification */
  name: string;
  /** Command description */
  description?: string;
  /** Command handler function */
  handler: (args: string[], options: CLIOptions) => Promise<void> | void;
  /** Command-specific options schema */
  options?: Record<string, CLIOptionDefinition>;
}

export interface CLIOptionDefinition {
  /** Option description */
  description: string;
  /** Option type */
  type: "string" | "number" | "boolean";
  /** Default value */
  default?: unknown;
  /** Whether the option is required */
  required?: boolean;
  /** Option alias (single character) */
  alias?: string;
}

export interface CLIOptions {
  [key: string]: unknown;
}

export interface CLIWrapperConfig {
  /** Application name */
  appName: string;
  /** Application version */
  version?: string;
  /** Application description */
  description?: string;
  /** Global timeout in milliseconds */
  timeout?: number;
  /** Whether to setup global error handling */
  setupErrorHandling?: boolean;
}

export class CLIWrapper {
  private commands = new Map<string, CLICommand>();
  private config: Required<CLIWrapperConfig>;

  constructor(config: CLIWrapperConfig) {
    this.config = {
      version: "1.0.0",
      description: "",
      timeout: 30000,
      setupErrorHandling: true,
      ...config,
    };

    if (this.config.setupErrorHandling) {
      setupGlobalErrorHandling();
    }
  }

  /**
   * Register a CLI command
   */
  command(cmd: CLICommand): this {
    this.commands.set(cmd.name, cmd);
    return this;
  }

  /**
   * Parse command line arguments
   */
  private parseArgs(args: string[]): {
    command?: string;
    options: CLIOptions;
    positional: string[];
  } {
    const result: {
      command?: string;
      options: CLIOptions;
      positional: string[];
    } = {
      options: {},
      positional: [],
    };

    let currentOption: string | null = null;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      // Handle long options (--option=value or --option value)
      if (arg?.startsWith("--")) {
        if (currentOption) {
          result.options[currentOption] = true; // Previous option was a flag
        }

        const [option, value] = arg.slice(2).split("=");
        if (value !== undefined && option) {
          result.options[option] = value;
          currentOption = null;
        } else if (option) {
          currentOption = option;
        }
      }
      // Handle short options (-o value or -o=value)
      else if (arg?.startsWith("-") && arg.length > 1) {
        if (currentOption) {
          result.options[currentOption] = true; // Previous option was a flag
        }

        const option = arg.slice(1);
        if (option.includes("=")) {
          const [opt, value] = option.split("=");
          if (opt) {
            result.options[opt] = value ?? '';
          }
          currentOption = null;
        } else {
          currentOption = option;
        }
      }
      // Handle option values or positional arguments
      else {
        if (currentOption) {
          result.options[currentOption] = arg ?? '';
          currentOption = null;
        } else {
          if (!result.command && arg && this.commands.has(arg)) {
            result.command = arg;
          } else if (arg) {
            result.positional.push(arg);
          }
        }
      }
    }

    // Handle final flag option
    if (currentOption) {
      result.options[currentOption] = true;
    }

    return result;
  }

  /**
   * Show help information
   */
  private showHelp(commandName?: string): void {
    if (commandName && this.commands.has(commandName)) {
      const cmd = this.commands.get(commandName)!;
      exitOk(`${this.config.appName} ${commandName}`, {
        details: {
          description: cmd.description,
          options: cmd.options,
        },
      });
    } else {
      const commands = Array.from(this.commands.entries()).map(_([name,_cmd]) => ({
          name,
          description: cmd.description,
        }),
      );

      exitOk(`${this.config.appName} v${this.config.version}`, {
        details: {
          description: this.config.description,
          commands,
          usage: `${this.config.appName} <command> [options] [args]`,
        },
      });
    }
  }

  /**
   * Execute CLI with timeout support
   */
  async run(args: string[] = process.argv.slice(2)): Promise<void> {
    try {
      const parsed = this.parseArgs(args);

      // Handle help
      if (parsed.options.help || parsed.options.h) {
        this.showHelp(parsed.command);
        return;
      }

      // Handle version
      if (parsed.options.version || parsed.options.v) {
        exitOk(this.config.version);
        return;
      }

      // Validate command
      if (!parsed.command) {
        exitError("No command provided", 1, {
          details: { availableCommands: Array.from(this.commands.keys()) },
        });
        return;
      }

      if (!this.commands.has(parsed.command)) {
        exitError(`Unknown command: ${parsed.command}`, 1, {
          details: { availableCommands: Array.from(this.commands.keys()) },
        });
        return;
      }

      const command = this.commands.get(parsed.command)!;

      // Execute command with timeout
      const timeoutId = setTimeout(_() => {
        exitError(
          `Command '${parsed.command}' timed out after ${this.config.timeout}ms`,
          124,
        );
      }, this.config.timeout);

      try {
        await Promise.resolve(
          command.handler(parsed.positional, parsed.options),
        );
        clearTimeout(timeoutId);
      } catch (_error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (_error) {
      const errorDetails =
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : { error: String(error) };

      exitError("Command execution failed", 1, {
        details: errorDetails,
      });
    }
  }
}

/**
 * Create a CLI wrapper instance
 */
export function createCLI(config: CLIWrapperConfig): CLIWrapper {
  return new CLIWrapper(config);
}
