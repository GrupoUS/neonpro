import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

/**
 * Vitest Integration Tests Configuration
 * Optimized for integration tests with database and external services
 */
export default defineConfig({
  test: {
    // Test environment
    environment: "node", // Node environment for integration tests
    
    // Test files pattern
    include: [
      "tools/tests/integration/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "packages/**/tests/integration/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],
    
    // Exclude patterns
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/e2e/**",
      "**/unit/**",
    ],
    
    // Global setup and teardown
    globalSetup: [
      "./tools/tests/integration/setup/global-setup.ts",
    ],
    
    setupFiles: [
      "./tools/tests/integration/setup/integration-setup.ts",
    ],
    
    // Test execution configuration
    globals: true,
    testTimeout: 30_000, // 30 seconds for integration tests
    hookTimeout: 10_000, // 10 seconds for hooks
    teardownTimeout: 10_000,
    
    // Parallel execution (limited for integration tests)
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 2, // Limited threads for database connections
        minThreads: 1,
      },
    },
    
    // Retry configuration
    retry: 2, // Retry failed tests twice
    
    // Coverage configuration for integration tests
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "coverage/integration",
      
      // Include patterns
      include: [
        "packages/**/src/**/*.{js,ts,tsx}",
        "lib/**/*.{js,ts}",
        "utils/**/*.{js,ts}",
      ],
      
      // Exclude patterns
      exclude: [
        "**/*.d.ts",
        "**/*.config.{js,ts}",
        "**/node_modules/**",
        "**/dist/**",
        "**/build/**",
        "**/*.test.{js,ts,tsx}",
        "**/*.spec.{js,ts,tsx}",
        "**/tests/**",
        "**/e2e/**",
        "**/mocks/**",
        "**/fixtures/**",
      ],
      
      // Coverage thresholds for integration tests
      thresholds: {
        global: {
          branches: 60,
          functions: 70,
          lines: 70,
          statements: 70,
        },
        // Specific thresholds for critical modules
        "packages/patient-management/src/": {
          branches: 70,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    
    // Reporter configuration
    reporter: [
      "verbose",
      "json",
      "junit",
      ["html", { outputFile: "test-results/integration/index.html" }],
    ],
    
    // Output configuration
    outputFile: {
      json: "test-results/integration/results.json",
      junit: "test-results/integration/junit.xml",
    },
    
    // Watch mode configuration
    watch: false, // Disabled by default for integration tests
    
    // Environment variables
    env: {
      NODE_ENV: "test",
      VITEST_INTEGRATION: "true",
      // Database configuration for tests
      DATABASE_URL: process.env.TEST_DATABASE_URL || "postgresql://test:test@localhost:5432/neonpro_test",
      SUPABASE_URL: process.env.TEST_SUPABASE_URL || "http://localhost:54321",
      SUPABASE_ANON_KEY: process.env.TEST_SUPABASE_ANON_KEY || "test-key",
    },
    
    // Sequence configuration
    sequence: {
      shuffle: false, // Keep deterministic order for integration tests
      concurrent: false, // Run integration tests sequentially by default
    },
    
    // Isolation configuration
    isolate: true, // Isolate each test file
    
    // Mock configuration
    clearMocks: true,
    restoreMocks: true,
    
    // Snapshot configuration
    resolveSnapshotPath: (testPath, snapExtension) => {
      return testPath.replace(/\.test\.([tj]sx?)/, `.test.${snapExtension}`);
    },
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
      "@/lib": resolve(__dirname, "lib"),
      "@/utils": resolve(__dirname, "utils"),
      "@/packages": resolve(__dirname, "packages"),
      "@/tools": resolve(__dirname, "tools"),
      "@/tests": resolve(__dirname, "tools/tests"),
      "@/fixtures": resolve(__dirname, "tools/tests/fixtures"),
      "@/mocks": resolve(__dirname, "tools/tests/mocks"),
    },
  },
  
  // Define configuration
  define: {
    __TEST_ENV__: "integration",
    __DEV__: false,
  },
  
  // Esbuild configuration
  esbuild: {
    target: "node18",
    sourcemap: true,
  },
  
  // Optimizations
  optimizeDeps: {
    include: [
      "@testing-library/react",
      "@testing-library/jest-dom",
      "@testing-library/user-event",
    ],
  },
});