declare module "@neonpro/tools-shared" {
  // Export all the utilities from tools-shared
  export const FRONTEND_TESTING_VERSION: string;
  export const FRONTEND_TESTING_PACKAGE: string;

  // Mock utilities
  export interface MockConfig {
    mockFunctions?: boolean;
    mockAPIs?: boolean;
    mockDatabase?: boolean;
    mockAuth?: boolean;
  }

  export function createMockData<T>(schema: any, count?: number): T[];
  export function setupMockServer(config?: MockConfig): void;
  export function resetAllMocks(): void;

  // Logger utilities
  export interface LoggerConfig {
    level?: "debug" | "info" | "warn" | "error";
    format?: "json" | "pretty";
    output?: "console" | "file";
  }

  export function createLogger(config?: LoggerConfig): any;
  export function setLogLevel(level: string): void;

  // Testing utilities
  export interface TestRunner {
    run(tests: any[]): Promise<any>;
    setup(): Promise<void>;
    teardown(): Promise<void>;
  }

  export function createTestRunner(): TestRunner;

  // Common utilities
  export function generateId(): string;
  export function formatDate(date: Date): string;
  export function sanitizeInput(input: string): string;
}
