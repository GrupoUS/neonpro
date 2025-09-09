import { promises as fs, } from 'fs'
import { join, } from 'path'
import { performance, } from 'perf_hooks'
import { ArchitectureValidator, } from '../src/services/ArchitectureValidator.js'
import { CleanupEngine, } from '../src/services/CleanupEngine.js'
import { DependencyAnalyzer, } from '../src/services/DependencyAnalyzer.js'
import { FileScanner, } from '../src/services/FileScanner.js'
import { ReportGenerator, } from '../src/services/ReportGenerator.js'
import { logger, } from '../src/utils/Logger.js'
import { performanceMonitor, PerformanceReport, } from '../src/utils/PerformanceMonitor.js'

// Performance targets from specs
const PERFORMANCE_TARGETS = {
  // File scanning: <30s for 10k files
  fileScanningTimeMs: 30000,
  fileScanningMaxFiles: 10000,

  // Memory usage: <500MB during operations
  maxMemoryUsageMB: 500,

  // Dependency analysis: reasonable time for complex graphs
  dependencyAnalysisTimeMs: 60000,
  maxDependencyNodes: 5000,

  // Architecture validation: fast rule processing
  architectureValidationTimeMs: 15000,
  maxValidationRules: 100,

  // Report generation: comprehensive reports in reasonable time
  reportGenerationTimeMs: 20000,

  // Cleanup operations: safe and efficient
  cleanupOperationTimeMs: 45000,

  // Overall workflow: complete audit cycle
  completeWorkflowTimeMs: 180000, // 3 minutes
}

interface BenchmarkResult {
  testName: string
  duration: number
  memoryUsed: number
  memoryPeak: number
  passed: boolean
  target: number
  actualVsTarget: number
  details: Record<string, any>
}

interface BenchmarkSuite {
  suiteName: string
  results: BenchmarkResult[]
  overallPassed: boolean
  totalDuration: number
  summary: {
    passed: number
    failed: number
    total: number
  }
}

export class PerformanceBenchmark {
  private testDataDir: string
  private results: BenchmarkSuite[] = []

  constructor(testDataDir: string = './test-data',) {
    this.testDataDir = testDataDir
  }

  async setupTestData(): Promise<void> {
    logger.info('Setting up performance test data', {
      component: 'PerformanceBenchmark',
      operation: 'setupTestData',
    },)

    // Create test directories
    await fs.mkdir(this.testDataDir, { recursive: true, },)
    await fs.mkdir(join(this.testDataDir, 'large-project',), { recursive: true, },)
    await fs.mkdir(join(this.testDataDir, 'large-project', 'apps',), { recursive: true, },)
    await fs.mkdir(join(this.testDataDir, 'large-project', 'packages',), { recursive: true, },)

    // Generate large project structure for benchmarking
    await this.generateLargeProjectStructure()
  }

  private async generateLargeProjectStructure(): Promise<void> {
    const appsDir = join(this.testDataDir, 'large-project', 'apps',)
    const packagesDir = join(this.testDataDir, 'large-project', 'packages',)

    // Generate 10 apps with 100 files each (1000 files)
    for (let i = 1; i <= 10; i++) {
      const appDir = join(appsDir, `app-${i}`,)
      await fs.mkdir(appDir, { recursive: true, },)
      await fs.mkdir(join(appDir, 'src',), { recursive: true, },)
      await fs.mkdir(join(appDir, 'src', 'components',), { recursive: true, },)
      await fs.mkdir(join(appDir, 'src', 'pages',), { recursive: true, },)
      await fs.mkdir(join(appDir, 'src', 'utils',), { recursive: true, },)

      // Generate files in each app
      for (let j = 1; j <= 25; j++) {
        await this.generateReactComponent(
          join(appDir, 'src', 'components', `Component${j}.tsx`,),
          i,
          j,
        )
        await this.generateReactPage(join(appDir, 'src', 'pages', `Page${j}.tsx`,), i, j,)
        await this.generateUtilFile(join(appDir, 'src', 'utils', `util${j}.ts`,), i, j,)
        await this.generateTestFile(
          join(appDir, 'src', 'components', `Component${j}.test.tsx`,),
          i,
          j,
        )
      }

      // App configuration files
      await this.generatePackageJson(join(appDir, 'package.json',), `app-${i}`,)
      await this.generateTsConfig(join(appDir, 'tsconfig.json',),)
    }

    // Generate 50 packages with 100 files each (5000 files)
    for (let i = 1; i <= 50; i++) {
      const packageDir = join(packagesDir, `package-${i}`,)
      await fs.mkdir(packageDir, { recursive: true, },)
      await fs.mkdir(join(packageDir, 'src',), { recursive: true, },)
      await fs.mkdir(join(packageDir, 'lib',), { recursive: true, },)
      await fs.mkdir(join(packageDir, 'types',), { recursive: true, },)

      // Generate files in each package
      for (let j = 1; j <= 33; j++) {
        await this.generateLibraryFile(join(packageDir, 'src', `lib${j}.ts`,), i, j,)
        await this.generateTypesFile(join(packageDir, 'types', `types${j}.d.ts`,), i, j,)
        await this.generateTestFile(join(packageDir, 'src', `lib${j}.test.ts`,), i, j,)
      }

      // Package configuration files
      await this.generatePackageJson(join(packageDir, 'package.json',), `@monorepo/package-${i}`,)
      await this.generateTsConfig(join(packageDir, 'tsconfig.json',),)
    }

    // Root configuration files
    await this.generateRootPackageJson(join(this.testDataDir, 'large-project', 'package.json',),)
    await this.generateTurboConfig(join(this.testDataDir, 'large-project', 'turbo.json',),)
    await this.generateRootTsConfig(join(this.testDataDir, 'large-project', 'tsconfig.json',),)

    logger.info('Generated large project structure for performance testing', {
      component: 'PerformanceBenchmark',
      metadata: {
        totalApps: 10,
        totalPackages: 50,
        estimatedTotalFiles: 6000,
      },
    },)
  }

  private async generateReactComponent(
    filePath: string,
    appId: number,
    componentId: number,
  ): Promise<void> {
    const content = `import React from 'react';
import { Button } from '@monorepo/ui';
import { useHook${componentId} } from '../hooks/useHook${componentId}';
import { utils${componentId} } from '../utils/util${componentId}';

interface Component${componentId}Props {
  title: string;
  description?: string;
  isActive: boolean;
  onClick: () => void;
}

export const Component${componentId}: React.FC<Component${componentId}Props> = ({
  title,
  description,
  isActive,
  onClick,
}) => {
  const { data, loading } = useHook${componentId}();

  return (
    <div className="component-${componentId}">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      <Button 
        onClick={onClick}
        disabled={loading}
        variant={isActive ? 'primary' : 'secondary'}
      >
        {loading ? 'Loading...' : 'Click me'}
      </Button>
      <div>{utils${componentId}.formatData(data)}</div>
    </div>
  );
};

export default Component${componentId};
`
    await fs.writeFile(filePath, content, 'utf8',)
  }

  private async generateReactPage(filePath: string, appId: number, pageId: number,): Promise<void> {
    const content = `import React from 'react';
import { Component${pageId} } from '../components/Component${pageId}';
import { Layout } from '@monorepo/layout';
import { useRouter } from '@tanstack/react-router';

export const Page${pageId}: React.FC = () => {
  const router = useRouter();
  
  const handleClick = () => {
    router.navigate({ to: '/next-page' });
  };

  return (
    <Layout title="Page ${pageId}">
      <div className="page-${pageId}">
        <h1>Welcome to Page ${pageId}</h1>
        <Component${pageId}
          title="Page ${pageId} Component"
          description="This is a generated page component for performance testing"
          isActive={true}
          onClick={handleClick}
        />
      </div>
    </Layout>
  );
};

export default Page${pageId};
`
    await fs.writeFile(filePath, content, 'utf8',)
  }

  private async generateUtilFile(filePath: string, appId: number, utilId: number,): Promise<void> {
    const content = `export const utils${utilId} = {
  formatData: (data: any) => {
    if (!data) return 'No data';
    return JSON.stringify(data, null, 2);
  },

  validateInput: (input: string): boolean => {
    return input && input.length > 0;
  },

  generateId: (): string => {
    return \`\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
  },

  debounce: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): T => {
    let timeoutId: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
  },

  throttle: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): T => {
    let lastCall = 0;
    return ((...args: any[]) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return func(...args);
      }
    }) as T;
  },
};

export const API_ENDPOINTS = {
  users: '/api/users',
  posts: '/api/posts',
  comments: '/api/comments',
};

export const CONSTANTS = {
  MAX_ITEMS: 100,
  DEFAULT_PAGE_SIZE: 20,
  CACHE_TTL: 300000,
};
`
    await fs.writeFile(filePath, content, 'utf8',)
  }

  private async generateTestFile(filePath: string, appId: number, testId: number,): Promise<void> {
    const content = `import { describe, it, expect, vi } from 'vitest';

describe('Test Suite ${testId}', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true);
  });

  it('should handle async operations', async () => {
    const result = await Promise.resolve('success');
    expect(result).toBe('success');
  });

  it('should mock functions properly', () => {
    const mockFn = vi.fn();
    mockFn('test');
    expect(mockFn).toHaveBeenCalledWith('test');
  });
});
`
    await fs.writeFile(filePath, content, 'utf8',)
  }
  private async generateLibraryFile(
    filePath: string,
    packageId: number,
    libId: number,
  ): Promise<void> {
    const content = `export interface DataModel${libId} {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

export class Service${libId} {
  private data: DataModel${libId}[] = [];

  async create(item: Omit<DataModel${libId}, 'id' | 'createdAt' | 'updatedAt'>): Promise<DataModel${libId}> {
    const newItem: DataModel${libId} = {
      ...item,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.data.push(newItem);
    return newItem;
  }

  async findById(id: string): Promise<DataModel${libId} | null> {
    return this.data.find(item => item.id === id) || null;
  }

  async findAll(): Promise<DataModel${libId}[]> {
    return [...this.data];
  }

  async update(id: string, updates: Partial<DataModel${libId}>): Promise<DataModel${libId} | null> {
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    this.data[index] = { ...this.data[index], ...updates, updatedAt: new Date() };
    return this.data[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) return false;
    
    this.data.splice(index, 1);
    return true;
  }

  private generateId(): string {
    return \`\${packageId}-\${libId}-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
  }
}

export const service${libId} = new Service${libId}();
`
    await fs.writeFile(filePath, content, 'utf8',)
  }

  private async generateTypesFile(
    filePath: string,
    packageId: number,
    typeId: number,
  ): Promise<void> {
    const content = `export interface Config${typeId} {
  apiUrl: string;
  timeout: number;
  retries: number;
  cacheEnabled: boolean;
}

export interface User${typeId} {
  id: string;
  username: string;
  email: string;
  profile: UserProfile${typeId};
}

export interface UserProfile${typeId} {
  firstName: string;
  lastName: string;
  avatar?: string;
  preferences: UserPreferences${typeId};
}

export interface UserPreferences${typeId} {
  theme: 'light' | 'dark';
  language: string;
  notifications: NotificationSettings${typeId};
}

export interface NotificationSettings${typeId} {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export type ApiResponse${typeId}<T> = {
  success: true;
  data: T;
  meta: ResponseMeta${typeId};
} | {
  success: false;
  error: ApiError${typeId};
};

export interface ResponseMeta${typeId} {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
}

export interface ApiError${typeId} {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export enum Status${typeId} {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}
`
    await fs.writeFile(filePath, content, 'utf8',)
  }

  private async generatePackageJson(filePath: string, name: string,): Promise<void> {
    const content = {
      name,
      version: '1.0.0',
      description: `Generated package for performance testing: ${name}`,
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      scripts: {
        build: 'tsc',
        test: 'vitest',
        lint: 'eslint src/',
        'type-check': 'tsc --noEmit',
      },
      dependencies: {
        react: '^18.2.0',
        '@tanstack/react-router': '^1.0.0',
      },
      devDependencies: {
        typescript: '^5.7.2',
        '@types/react': '^18.2.0',
        vitest: '^1.1.0',
        eslint: '^8.56.0',
      },
    }
    await fs.writeFile(filePath, JSON.stringify(content, null, 2,), 'utf8',)
  }

  private async generateTsConfig(filePath: string,): Promise<void> {
    const content = {
      extends: '../../tsconfig.json',
      compilerOptions: {
        outDir: './dist',
        rootDir: './src',
      },
      include: ['src/**/*',],
      exclude: ['node_modules', 'dist', '**/*.test.*',],
    }
    await fs.writeFile(filePath, JSON.stringify(content, null, 2,), 'utf8',)
  }

  private async generateRootPackageJson(filePath: string,): Promise<void> {
    const content = {
      name: 'large-project-benchmark',
      private: true,
      workspaces: ['apps/*', 'packages/*',],
      scripts: {
        build: 'turbo run build',
        test: 'turbo run test',
        lint: 'turbo run lint',
        dev: 'turbo run dev',
      },
      devDependencies: {
        turbo: '^1.10.0',
        typescript: '^5.7.2',
      },
    }
    await fs.writeFile(filePath, JSON.stringify(content, null, 2,), 'utf8',)
  }

  private async generateTurboConfig(filePath: string,): Promise<void> {
    const content = {
      $schema: 'https://turbo.build/schema.json',
      pipeline: {
        build: {
          dependsOn: ['^build',],
          outputs: ['dist/**',],
        },
        test: {
          dependsOn: ['build',],
          outputs: [],
        },
        lint: {
          outputs: [],
        },
        dev: {
          cache: false,
        },
      },
    }
    await fs.writeFile(filePath, JSON.stringify(content, null, 2,), 'utf8',)
  }

  private async generateRootTsConfig(filePath: string,): Promise<void> {
    const content = {
      compilerOptions: {
        target: 'ES2022',
        lib: ['ES2022', 'DOM',],
        module: 'ESNext',
        moduleResolution: 'node',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true,
      },
      include: [],
      exclude: ['node_modules',],
    }
    await fs.writeFile(filePath, JSON.stringify(content, null, 2,), 'utf8',)
  } // Core benchmarking methods
  async runAllBenchmarks(): Promise<BenchmarkSuite[]> {
    logger.info('Starting comprehensive performance benchmark suite', {
      component: 'PerformanceBenchmark',
    },)

    await this.setupTestData()

    // Run benchmark suites
    const fileScanningResults = await this.benchmarkFileScanning()
    const dependencyAnalysisResults = await this.benchmarkDependencyAnalysis()
    const architectureValidationResults = await this.benchmarkArchitectureValidation()
    const reportGenerationResults = await this.benchmarkReportGeneration()
    const cleanupOperationsResults = await this.benchmarkCleanupOperations()
    const completeWorkflowResults = await this.benchmarkCompleteWorkflow()

    this.results = [
      fileScanningResults,
      dependencyAnalysisResults,
      architectureValidationResults,
      reportGenerationResults,
      cleanupOperationsResults,
      completeWorkflowResults,
    ]

    await this.generateBenchmarkReport()
    return this.results
  }

  private async measurePerformance<T,>(
    testName: string,
    operation: () => Promise<T>,
    target: number,
  ): Promise<BenchmarkResult> {
    // Start memory monitoring
    const initialMemory = process.memoryUsage()
    let peakMemory = initialMemory.heapUsed

    const memoryMonitor = setInterval(() => {
      const current = process.memoryUsage().heapUsed
      if (current > peakMemory) {
        peakMemory = current
      }
    }, 100,)

    const startTime = performance.now()
    let result: T
    let error: Error | null = null

    try {
      result = await operation()
    } catch (err) {
      error = err as Error
    } finally {
      clearInterval(memoryMonitor,)
    }

    const endTime = performance.now()
    const duration = endTime - startTime
    const finalMemory = process.memoryUsage()
    const memoryUsed = (finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024 // MB
    const memoryPeak = peakMemory / 1024 / 1024 // MB

    const passed = !error && duration <= target
      && memoryPeak <= PERFORMANCE_TARGETS.maxMemoryUsageMB
    const actualVsTarget = (duration / target) * 100

    return {
      testName,
      duration,
      memoryUsed,
      memoryPeak,
      passed,
      target,
      actualVsTarget,
      details: {
        error: error?.message,
        memoryEfficiency: memoryUsed < 100 ? 'Excellent' : memoryUsed < 200 ? 'Good' : 'Poor',
        timeEfficiency: actualVsTarget < 50 ? 'Excellent' : actualVsTarget < 80 ? 'Good' : 'Poor',
      },
    }
  }

  private async benchmarkFileScanning(): Promise<BenchmarkSuite> {
    logger.info('Running file scanning benchmarks', {
      component: 'PerformanceBenchmark',
    },)

    const results: BenchmarkResult[] = []

    // Test 1: Large directory scan (10k files)
    results.push(
      await this.measurePerformance(
        'Large Directory Scan (10k files)',
        async () => {
          const scanner = new FileScanner()
          const projectPath = join(this.testDataDir, 'large-project',)
          return await scanner.scan(projectPath, {
            baseDirectory: projectPath,
            includePatterns: ['**/*.{ts,tsx,js,jsx,json}',],
            excludePatterns: ['node_modules/**', 'dist/**',],
            maxDepth: 10,
            followSymlinks: false,
            includeContent: false,
          },)
        },
        PERFORMANCE_TARGETS.fileScanningTimeMs,
      ),
    )

    // Test 2: Parallel scanning performance
    results.push(
      await this.measurePerformance(
        'Parallel Directory Scanning',
        async () => {
          const scanner = new FileScanner()
          const projectPath = join(this.testDataDir, 'large-project',)
          const promises = []

          // Scan apps and packages in parallel
          promises.push(scanner.scan(join(projectPath, 'apps',), {
            baseDirectory: join(projectPath, 'apps',),
            includePatterns: ['**/*.{ts,tsx}',],
            excludePatterns: ['**/*.test.*',],
            maxDepth: 5,
          },),)

          promises.push(scanner.scan(join(projectPath, 'packages',), {
            baseDirectory: join(projectPath, 'packages',),
            includePatterns: ['**/*.{ts,d.ts}',],
            excludePatterns: ['**/*.test.*',],
            maxDepth: 5,
          },),)

          return await Promise.all(promises,)
        },
        PERFORMANCE_TARGETS.fileScanningTimeMs * 0.7, // Should be faster with parallelization
      ),
    )

    // Test 3: Memory efficiency during large scans
    results.push(
      await this.measurePerformance(
        'Memory Efficient Large Scan',
        async () => {
          const scanner = new FileScanner()
          const projectPath = join(this.testDataDir, 'large-project',)
          return await scanner.scan(projectPath, {
            baseDirectory: projectPath,
            includePatterns: ['**/*',],
            excludePatterns: ['node_modules/**',],
            maxDepth: 8,
            includeContent: false, // Reduce memory usage
            progressCallback: (progress,) => {
              // Simulate progress handling
              if (progress.processedFiles % 1000 === 0) {
                logger.debug(`Processed ${progress.processedFiles} files`,)
              }
            },
          },)
        },
        PERFORMANCE_TARGETS.fileScanningTimeMs,
      ),
    )

    return {
      suiteName: 'File Scanning Performance',
      results,
      overallPassed: results.every(r => r.passed),
      totalDuration: results.reduce((sum, r,) => sum + r.duration, 0,),
      summary: {
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        total: results.length,
      },
    }
  }

  private async benchmarkDependencyAnalysis(): Promise<BenchmarkSuite> {
    logger.info('Running dependency analysis benchmarks', {
      component: 'PerformanceBenchmark',
    },)

    const results: BenchmarkResult[] = []

    // Set up scan data for dependency analysis
    const scanner = new FileScanner()
    const projectPath = join(this.testDataDir, 'large-project',)
    const scanResult = await scanner.scan(projectPath, {
      baseDirectory: projectPath,
      includePatterns: ['**/*.{ts,tsx,js,jsx}',],
      excludePatterns: ['node_modules/**', '**/*.test.*',],
      maxDepth: 10,
      includeContent: true,
    },)

    // Test 1: Large dependency graph building
    results.push(
      await this.measurePerformance(
        'Large Dependency Graph Building',
        async () => {
          const analyzer = new DependencyAnalyzer()
          return await analyzer.buildGraph(scanResult,)
        },
        PERFORMANCE_TARGETS.dependencyAnalysisTimeMs,
      ),
    )

    // Test 2: Circular dependency detection
    results.push(
      await this.measurePerformance(
        'Circular Dependency Detection',
        async () => {
          const analyzer = new DependencyAnalyzer()
          const graph = await analyzer.buildGraph(scanResult,)
          return await analyzer.detectCircularDependencies(graph,)
        },
        PERFORMANCE_TARGETS.dependencyAnalysisTimeMs * 0.3,
      ),
    )

    // Test 3: Unused asset detection
    results.push(
      await this.measurePerformance(
        'Unused Asset Detection',
        async () => {
          const analyzer = new DependencyAnalyzer()
          const graph = await analyzer.buildGraph(scanResult,)
          return await analyzer.findUnusedAssets(graph, ['src/main.tsx', 'src/index.ts',],)
        },
        PERFORMANCE_TARGETS.dependencyAnalysisTimeMs * 0.4,
      ),
    )

    // Test 4: Importance score calculation
    results.push(
      await this.measurePerformance(
        'Importance Score Calculation',
        async () => {
          const analyzer = new DependencyAnalyzer()
          const graph = await analyzer.buildGraph(scanResult,)
          return await analyzer.calculateImportanceScores(graph,)
        },
        PERFORMANCE_TARGETS.dependencyAnalysisTimeMs * 0.2,
      ),
    )

    return {
      suiteName: 'Dependency Analysis Performance',
      results,
      overallPassed: results.every(r => r.passed),
      totalDuration: results.reduce((sum, r,) => sum + r.duration, 0,),
      summary: {
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        total: results.length,
      },
    }
  }
  private async benchmarkArchitectureValidation(): Promise<BenchmarkSuite> {
    logger.info('Running architecture validation benchmarks', {
      component: 'PerformanceBenchmark',
    },)

    const results: BenchmarkResult[] = []

    // Set up scan data for architecture validation
    const scanner = new FileScanner()
    const projectPath = join(this.testDataDir, 'large-project',)
    const scanResult = await scanner.scan(projectPath, {
      baseDirectory: projectPath,
      includePatterns: ['**/*.{ts,tsx,js,jsx,json}',],
      excludePatterns: ['node_modules/**',],
      maxDepth: 10,
      includeContent: true,
    },)

    // Test 1: Turborepo validation
    results.push(
      await this.measurePerformance(
        'Turborepo Architecture Validation',
        async () => {
          const validator = new ArchitectureValidator()
          return await validator.validateAssets(scanResult.assets, {
            turborepo: {
              enabled: true,
              requireWorkspaceConfig: true,
              enforceAppPackageStructure: true,
              validateTurboConfig: true,
            },
            hono: { enabled: false, },
            tanStackRouter: { enabled: false, },
          },)
        },
        PERFORMANCE_TARGETS.architectureValidationTimeMs,
      ),
    )

    // Test 2: Hono patterns validation
    results.push(
      await this.measurePerformance(
        'Hono Patterns Validation',
        async () => {
          const validator = new ArchitectureValidator()
          return await validator.validateAssets(scanResult.assets, {
            turborepo: { enabled: false, },
            hono: {
              enabled: true,
              enforceApiStructure: true,
              requireMiddleware: true,
              validateRoutes: true,
            },
            tanStackRouter: { enabled: false, },
          },)
        },
        PERFORMANCE_TARGETS.architectureValidationTimeMs * 0.6,
      ),
    )

    // Test 3: TanStack Router validation
    results.push(
      await this.measurePerformance(
        'TanStack Router Validation',
        async () => {
          const validator = new ArchitectureValidator()
          return await validator.validateAssets(scanResult.assets, {
            turborepo: { enabled: false, },
            hono: { enabled: false, },
            tanStackRouter: {
              enabled: true,
              enforceFileBasedRouting: true,
              requireTypeScriptRoutes: true,
              validateRouteFiles: true,
            },
          },)
        },
        PERFORMANCE_TARGETS.architectureValidationTimeMs * 0.7,
      ),
    )

    // Test 4: Complete validation with all rules
    results.push(
      await this.measurePerformance(
        'Complete Architecture Validation',
        async () => {
          const validator = new ArchitectureValidator()
          return await validator.validateAssets(scanResult.assets, {
            turborepo: {
              enabled: true,
              requireWorkspaceConfig: true,
              enforceAppPackageStructure: true,
              validateTurboConfig: true,
            },
            hono: {
              enabled: true,
              enforceApiStructure: true,
              requireMiddleware: true,
              validateRoutes: true,
            },
            tanStackRouter: {
              enabled: true,
              enforceFileBasedRouting: true,
              requireTypeScriptRoutes: true,
              validateRouteFiles: true,
            },
          },)
        },
        PERFORMANCE_TARGETS.architectureValidationTimeMs,
      ),
    )

    return {
      suiteName: 'Architecture Validation Performance',
      results,
      overallPassed: results.every(r => r.passed),
      totalDuration: results.reduce((sum, r,) => sum + r.duration, 0,),
      summary: {
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        total: results.length,
      },
    }
  }

  private async benchmarkReportGeneration(): Promise<BenchmarkSuite> {
    logger.info('Running report generation benchmarks', {
      component: 'PerformanceBenchmark',
    },)

    const results: BenchmarkResult[] = []

    // Set up complete audit data for reporting
    const scanner = new FileScanner()
    const projectPath = join(this.testDataDir, 'large-project',)
    const scanResult = await scanner.scan(projectPath, {
      baseDirectory: projectPath,
      includePatterns: ['**/*.{ts,tsx,js,jsx,json}',],
      excludePatterns: ['node_modules/**',],
      maxDepth: 10,
      includeContent: true,
    },)

    const analyzer = new DependencyAnalyzer()
    const dependencyGraph = await analyzer.buildGraph(scanResult,)

    const validator = new ArchitectureValidator()
    const validationResults = await validator.validateAssets(scanResult.assets, {
      turborepo: { enabled: true, },
      hono: { enabled: true, },
      tanStackRouter: { enabled: true, },
    },)

    // Test 1: HTML report generation
    results.push(
      await this.measurePerformance(
        'HTML Report Generation',
        async () => {
          const generator = new ReportGenerator()
          const report = await generator.generateAuditReport({
            scanResult,
            dependencyGraph,
            validationResults,
            projectName: 'Performance Benchmark Test',
            generatedAt: new Date(),
          },)

          return await generator.exportReport(report, {
            outputDirectory: join(this.testDataDir, 'reports',),
            filename: 'performance-test-report.html',
            format: 'html',
            includeAssets: true,
          },)
        },
        PERFORMANCE_TARGETS.reportGenerationTimeMs,
      ),
    )

    // Test 2: JSON report generation
    results.push(
      await this.measurePerformance(
        'JSON Report Generation',
        async () => {
          const generator = new ReportGenerator()
          const report = await generator.generateAuditReport({
            scanResult,
            dependencyGraph,
            validationResults,
            projectName: 'Performance Benchmark Test JSON',
            generatedAt: new Date(),
          },)

          return await generator.exportReport(report, {
            outputDirectory: join(this.testDataDir, 'reports',),
            filename: 'performance-test-report.json',
            format: 'json',
          },)
        },
        PERFORMANCE_TARGETS.reportGenerationTimeMs * 0.3,
      ),
    )

    // Test 3: Dashboard generation
    results.push(
      await this.measurePerformance(
        'Interactive Dashboard Generation',
        async () => {
          const generator = new ReportGenerator()
          const report = await generator.generateAuditReport({
            scanResult,
            dependencyGraph,
            validationResults,
            projectName: 'Performance Benchmark Dashboard',
            generatedAt: new Date(),
          },)

          return await generator.generateDashboard(report, {
            outputDirectory: join(this.testDataDir, 'dashboard',),
            includeCharts: true,
            includeInteractiveElements: true,
          },)
        },
        PERFORMANCE_TARGETS.reportGenerationTimeMs * 1.2,
      ),
    )

    // Test 4: Executive summary generation
    results.push(
      await this.measurePerformance(
        'Executive Summary Generation',
        async () => {
          const generator = new ReportGenerator()
          return await generator.generateExecutiveSummary({
            scanResult,
            dependencyGraph,
            validationResults,
            projectName: 'Performance Benchmark Executive',
            generatedAt: new Date(),
          },)
        },
        PERFORMANCE_TARGETS.reportGenerationTimeMs * 0.2,
      ),
    )

    return {
      suiteName: 'Report Generation Performance',
      results,
      overallPassed: results.every(r => r.passed),
      totalDuration: results.reduce((sum, r,) => sum + r.duration, 0,),
      summary: {
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        total: results.length,
      },
    }
  }

  private async benchmarkCleanupOperations(): Promise<BenchmarkSuite> {
    logger.info('Running cleanup operations benchmarks', {
      component: 'PerformanceBenchmark',
    },)

    const results: BenchmarkResult[] = []

    // Test 1: Cleanup plan creation
    results.push(
      await this.measurePerformance(
        'Cleanup Plan Creation',
        async () => {
          const cleanup = new CleanupEngine()
          const projectPath = join(this.testDataDir, 'large-project',)

          return await cleanup.createCleanupPlan({
            targetPaths: [projectPath,],
            backupDirectory: join(this.testDataDir, 'backup',),
            dryRun: true,
            includeUnused: true,
            includeDuplicates: true,
            includeOrphaned: true,
          },)
        },
        PERFORMANCE_TARGETS.cleanupOperationTimeMs * 0.3,
      ),
    )

    // Test 2: Cleanup plan validation
    results.push(
      await this.measurePerformance(
        'Cleanup Plan Validation',
        async () => {
          const cleanup = new CleanupEngine()
          const projectPath = join(this.testDataDir, 'large-project',)

          const plan = await cleanup.createCleanupPlan({
            targetPaths: [projectPath,],
            backupDirectory: join(this.testDataDir, 'backup',),
            dryRun: true,
            includeUnused: true,
            includeDuplicates: true,
            includeOrphaned: true,
          },)

          return await cleanup.validateCleanupPlan(plan,)
        },
        PERFORMANCE_TARGETS.cleanupOperationTimeMs * 0.2,
      ),
    )

    // Test 3: Dry run execution (safe)
    results.push(
      await this.measurePerformance(
        'Dry Run Cleanup Execution',
        async () => {
          const cleanup = new CleanupEngine()
          const projectPath = join(this.testDataDir, 'large-project',)

          const plan = await cleanup.createCleanupPlan({
            targetPaths: [projectPath,],
            backupDirectory: join(this.testDataDir, 'backup',),
            dryRun: true,
            includeUnused: true,
            includeDuplicates: false, // Reduce scope for performance test
            includeOrphaned: false,
          },)

          return await cleanup.executeCleanupPlan(plan,)
        },
        PERFORMANCE_TARGETS.cleanupOperationTimeMs,
      ),
    )

    return {
      suiteName: 'Cleanup Operations Performance',
      results,
      overallPassed: results.every(r => r.passed),
      totalDuration: results.reduce((sum, r,) => sum + r.duration, 0,),
      summary: {
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        total: results.length,
      },
    }
  }
  private async benchmarkCompleteWorkflow(): Promise<BenchmarkSuite> {
    logger.info('Running complete workflow benchmarks', {
      component: 'PerformanceBenchmark',
    },)

    const results: BenchmarkResult[] = []

    // Test 1: Complete audit workflow
    results.push(
      await this.measurePerformance(
        'Complete Audit Workflow',
        async () => {
          const projectPath = join(this.testDataDir, 'large-project',)

          // Step 1: File Scanning
          const scanner = new FileScanner()
          const scanResult = await scanner.scan(projectPath, {
            baseDirectory: projectPath,
            includePatterns: ['**/*.{ts,tsx,js,jsx,json}',],
            excludePatterns: ['node_modules/**', 'dist/**',],
            maxDepth: 10,
            includeContent: true,
          },)

          // Step 2: Dependency Analysis
          const analyzer = new DependencyAnalyzer()
          const dependencyGraph = await analyzer.buildGraph(scanResult,)
          const circularDependencies = await analyzer.detectCircularDependencies(dependencyGraph,)
          const unusedAssets = await analyzer.findUnusedAssets(dependencyGraph, ['src/main.tsx',],)

          // Step 3: Architecture Validation
          const validator = new ArchitectureValidator()
          const validationResults = await validator.validateAssets(scanResult.assets, {
            turborepo: { enabled: true, },
            hono: { enabled: true, },
            tanStackRouter: { enabled: true, },
          },)

          // Step 4: Report Generation
          const generator = new ReportGenerator()
          const report = await generator.generateAuditReport({
            scanResult,
            dependencyGraph,
            validationResults,
            projectName: 'Complete Workflow Test',
            generatedAt: new Date(),
          },)

          // Step 5: Export Report
          const exportResult = await generator.exportReport(report, {
            outputDirectory: join(this.testDataDir, 'complete-workflow',),
            filename: 'complete-audit-report.html',
            format: 'html',
            includeAssets: true,
          },)

          return {
            scanResult,
            dependencyGraph,
            circularDependencies,
            unusedAssets,
            validationResults,
            report,
            exportResult,
          }
        },
        PERFORMANCE_TARGETS.completeWorkflowTimeMs,
      ),
    )

    // Test 2: Complete workflow with cleanup
    results.push(
      await this.measurePerformance(
        'Complete Workflow with Cleanup',
        async () => {
          const projectPath = join(this.testDataDir, 'large-project',)

          // Run complete audit first
          const scanner = new FileScanner()
          const analyzer = new DependencyAnalyzer()
          const validator = new ArchitectureValidator()
          const generator = new ReportGenerator()
          const cleanup = new CleanupEngine()

          const scanResult = await scanner.scan(projectPath, {
            baseDirectory: projectPath,
            includePatterns: ['**/*.{ts,tsx,js,jsx}',],
            excludePatterns: ['node_modules/**',],
            maxDepth: 8,
            includeContent: true,
          },)

          const dependencyGraph = await analyzer.buildGraph(scanResult,)
          const unusedAssets = await analyzer.findUnusedAssets(dependencyGraph, ['src/main.tsx',],)

          // Create cleanup plan based on unused assets
          const cleanupPlan = await cleanup.createCleanupPlan({
            targetPaths: [projectPath,],
            backupDirectory: join(this.testDataDir, 'workflow-backup',),
            dryRun: true,
            includeUnused: true,
            includeDuplicates: false,
            includeOrphaned: false,
          },)

          const validationResults = await validator.validateAssets(scanResult.assets, {
            turborepo: { enabled: true, },
            hono: { enabled: false, },
            tanStackRouter: { enabled: false, },
          },)

          const report = await generator.generateAuditReport({
            scanResult,
            dependencyGraph,
            validationResults,
            cleanupPlan,
            projectName: 'Complete Workflow with Cleanup',
            generatedAt: new Date(),
          },)

          return {
            scanResult,
            dependencyGraph,
            unusedAssets,
            cleanupPlan,
            validationResults,
            report,
          }
        },
        PERFORMANCE_TARGETS.completeWorkflowTimeMs * 1.2,
      ),
    )

    return {
      suiteName: 'Complete Workflow Performance',
      results,
      overallPassed: results.every(r => r.passed),
      totalDuration: results.reduce((sum, r,) => sum + r.duration, 0,),
      summary: {
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        total: results.length,
      },
    }
  }

  private async generateBenchmarkReport(): Promise<void> {
    const reportPath = join(this.testDataDir, 'benchmark-report.json',)
    const htmlReportPath = join(this.testDataDir, 'benchmark-report.html',)

    const overallSummary = {
      totalSuites: this.results.length,
      totalTests: this.results.reduce((sum, suite,) => sum + suite.results.length, 0,),
      passedSuites: this.results.filter(suite => suite.overallPassed).length,
      passedTests: this.results.reduce((sum, suite,) => sum + suite.summary.passed, 0,),
      failedTests: this.results.reduce((sum, suite,) => sum + suite.summary.failed, 0,),
      totalDuration: this.results.reduce((sum, suite,) => sum + suite.totalDuration, 0,),
      memoryPeaks: this.results.flatMap(suite => suite.results.map(r => r.memoryPeak)),
      performanceTargets: PERFORMANCE_TARGETS,
    }

    const reportData = {
      timestamp: new Date().toISOString(),
      overallSummary,
      suites: this.results,
      recommendations: this.generatePerformanceRecommendations(),
    }

    // Write JSON report
    await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2,), 'utf8',)

    // Generate HTML report
    const htmlContent = this.generateHtmlReport(reportData,)
    await fs.writeFile(htmlReportPath, htmlContent, 'utf8',)

    logger.info('Performance benchmark report generated', {
      component: 'PerformanceBenchmark',
      metadata: {
        jsonReport: reportPath,
        htmlReport: htmlReportPath,
        totalTests: overallSummary.totalTests,
        passedTests: overallSummary.passedTests,
        overallPassRate: ((overallSummary.passedTests / overallSummary.totalTests) * 100).toFixed(
          1,
        ),
      },
    },)
  }

  private generatePerformanceRecommendations(): string[] {
    const recommendations: string[] = []

    this.results.forEach(suite => {
      suite.results.forEach(result => {
        if (!result.passed) {
          if (result.duration > result.target) {
            recommendations.push(
              `⚠️ ${result.testName}: Exceeded time target by ${
                (result.actualVsTarget - 100).toFixed(1,)
              }%. Consider optimization.`,
            )
          }

          if (result.memoryPeak > PERFORMANCE_TARGETS.maxMemoryUsageMB) {
            recommendations.push(
              `🧠 ${result.testName}: Memory usage (${
                result.memoryPeak.toFixed(1,)
              }MB) exceeded target (${PERFORMANCE_TARGETS.maxMemoryUsageMB}MB). Review memory efficiency.`,
            )
          }
        }

        // Performance suggestions
        if (result.actualVsTarget > 70 && result.actualVsTarget <= 100) {
          recommendations.push(
            `💡 ${result.testName}: Good performance but could be optimized (${
              result.actualVsTarget.toFixed(1,)
            }% of target time).`,
          )
        }
      },)
    },)

    // General recommendations
    const flatResults = this.results.flatMap(s => s.results)
    const totalResults = flatResults.length
    const avgMemory = totalResults === 0
      ? 0
      : flatResults.reduce((sum, r,) => sum + r.memoryPeak, 0,) / totalResults

    if (avgMemory > PERFORMANCE_TARGETS.maxMemoryUsageMB * 0.8) {
      recommendations.push(
        '🔧 Consider implementing streaming/chunking for large file operations to reduce memory usage.',
      )
    }

    const slowTests = this.results
      .flatMap(s => s.results)
      .filter(r => r.actualVsTarget > 80)
      .length

    if (slowTests > 3) {
      recommendations.push(
        '⚡ Multiple operations are approaching performance limits. Consider parallelization and caching strategies.',
      )
    }

    return recommendations
  }

  private generateHtmlReport(reportData: any,): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Benchmark Report</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 6px; text-align: center; }
        .metric h3 { margin: 0; color: #495057; font-size: 14px; text-transform: uppercase; }
        .metric .value { font-size: 24px; font-weight: bold; color: #007bff; margin: 10px 0; }
        .suite { margin-bottom: 30px; border: 1px solid #dee2e6; border-radius: 6px; }
        .suite-header { background: #007bff; color: white; padding: 15px; font-weight: bold; }
        .test-result { padding: 15px; border-bottom: 1px solid #dee2e6; display: flex; justify-content: space-between; align-items: center; }
        .test-result:last-child { border-bottom: none; }
        .test-name { font-weight: 500; }
        .test-metrics { display: flex; gap: 15px; font-size: 12px; color: #6c757d; }
        .passed { border-left: 4px solid #28a745; }
        .failed { border-left: 4px solid #dc3545; }
        .recommendations { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 6px; margin-top: 30px; }
        .recommendations h3 { margin-top: 0; color: #856404; }
        .recommendation { margin: 10px 0; padding: 8px; background: white; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Performance Benchmark Report</h1>
            <p>Generated on ${new Date(reportData.timestamp,).toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="metric">
                <h3>Total Tests</h3>
                <div class="value">${reportData.overallSummary.totalTests}</div>
            </div>
            <div class="metric">
                <h3>Passed Tests</h3>
                <div class="value" style="color: #28a745">${reportData.overallSummary.passedTests}</div>
            </div>
            <div class="metric">
                <h3>Failed Tests</h3>
                <div class="value" style="color: #dc3545">${reportData.overallSummary.failedTests}</div>
            </div>
            <div class="metric">
                <h3>Total Duration</h3>
                <div class="value">${
      (reportData.overallSummary.totalDuration / 1000).toFixed(2,)
    }s</div>
            </div>
        </div>

        ${
      reportData.suites.map((suite: BenchmarkSuite,) => `
            <div class="suite">
                <div class="suite-header">
                    ${suite.suiteName} (${suite.summary.passed}/${suite.summary.total} passed)
                </div>
                ${
        suite.results.map((result: BenchmarkResult,) => `
                    <div class="test-result ${result.passed ? 'passed' : 'failed'}">
                        <div class="test-name">${result.testName}</div>
                        <div class="test-metrics">
                            <span>Duration: ${result.duration.toFixed(0,)}ms</span>
                            <span>Memory: ${result.memoryPeak.toFixed(1,)}MB</span>
                            <span>Target: ${result.actualVsTarget.toFixed(1,)}%</span>
                        </div>
                    </div>
                `).join('',)
      }
            </div>
        `).join('',)
    }

        ${
      reportData.recommendations.length > 0
        ? `
            <div class="recommendations">
                <h3>📊 Performance Recommendations</h3>
                ${
          reportData.recommendations.map((rec: string,) => `
                    <div class="recommendation">${rec}</div>
                `).join('',)
        }
            </div>
        `
        : ''
    }
    </div>
</body>
</html>`
  }

  async cleanup(): Promise<void> {
    try {
      await fs.rm(this.testDataDir, { recursive: true, force: true, },)
      logger.info('Benchmark test data cleaned up', {
        component: 'PerformanceBenchmark',
      },)
    } catch (error) {
      logger.warn('Failed to cleanup benchmark test data', {
        component: 'PerformanceBenchmark',
      }, error as Error,)
    }
  }
}
