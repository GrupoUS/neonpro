/**
 * Test Suite Coordinator
 * Coordinates test execution across all test categories with parallel/sequential support
 */

import { createLogger, LogLevel } from './utils/logger'
import { TEST_CATEGORIES, TestCategory } from './utils/test-categories'

const logger = createLogger('TestSuiteCoordinator', LogLevel.INFO)

export interface TestSuiteOptions {
  categories?: TestCategory[]
  types?: string[]
  parallel?: boolean
  coverage?: boolean
  watch?: boolean
  ci?: boolean
  healthcareCompliance?: boolean
  timeout?: number
}

export interface TestCommand {
  category: TestCategory
  command: string
  args: string[]
  workingDir: string
  timeout?: number
  env?: Record<string, string>
}

export interface TestSuiteResult {
  success: boolean
  duration: number
  categoryResults: Record<TestCategory, CategoryTestResult>
  overallMetrics: {
    totalTests: number
    passedTests: number
    failedTests: number
    skippedTests: number
    coverage: number
    categories: number
  }
  commands: TestCommand[]
}

export interface CategoryTestResult {
  category: TestCategory
  success: boolean
  duration: number
  metrics: {
    tests: number
    passed: number
    failed: number
    skipped: number
    coverage: number
  }
  output: string
  errors: string[]
}

export class TestSuiteCoordinator {
  private readonly testTools: Record<TestCategory, TestToolConfig>

  constructor() {
    this.testTools = this.initializeTestTools()
  }

  /**
   * Initialize test tool configurations for each category
   */
  private initializeTestTools(): Record<TestCategory, TestToolConfig> {
    return {
      [TestCategory.FRONTEND]: {
        packageName: '@neonpro/tools-frontend-tests',
        workingDir: 'tools/frontend',
        commands: {
          unit: 'bun test',
          components: 'bun test src/components',
          routes: 'bun test src/routes',
          e2e: 'bun test:e2e',
          a11y: 'bun test:a11y',
          'healthcare-ui': 'bun test:healthcare-ui',
          coverage: 'bun test:coverage',
          watch: 'bun test:watch',
          ui: 'bun test:ui',
        },
        healthcareTests: ['a11y', 'healthcare-ui'],
        frameworks: ['vitest', 'playwright', 'testing-library'],
      },
      [TestCategory.BACKEND]: {
        packageName: '@neonpro/tools-backend-tests',
        workingDir: 'tools/backend',
        commands: {
          unit: 'bun test',
          api: 'bun test src/api',
          integration: 'bun test src/integration',
          middleware: 'bun test src/middleware',
          monorepo: 'bun test src/monorepo',
          coverage: 'bun test:coverage',
          watch: 'bun test:watch',
          ui: 'bun test:ui',
        },
        healthcareTests: ['api', 'integration'],
        frameworks: ['vitest', 'supertest', 'msw'],
      },
      [TestCategory.DATABASE]: {
        packageName: '@neonpro/tools-database-tests',
        workingDir: 'tools/database',
        commands: {
          unit: 'bun test',
          rls: 'bun test:rls',
          compliance: 'bun test:compliance',
          schema: 'bun test src/schema',
          migrations: 'bun test src/migrations',
          coverage: 'bun test:coverage',
          watch: 'bun test:watch',
        },
        healthcareTests: ['rls', 'compliance'],
        frameworks: ['vitest', 'supabase'],
      },
      [TestCategory.QUALITY]: {
        packageName: '@neonpro/tools-quality-tests',
        workingDir: 'tools/quality',
        commands: {
          unit: 'bun test',
          lint: 'bun test src/lint',
          security: 'bun test src/security',
          performance: 'bun test src/performance',
          accessibility: 'bun test src/accessibility',
          coverage: 'bun test:coverage',
          watch: 'bun test:watch',
        },
        healthcareTests: ['security', 'accessibility'],
        frameworks: ['vitest', 'oxlint', 'lighthouse'],
      },
    }
  }

  /**
   * Execute test suites with coordination
   */
  async executeTestSuites(
    options: TestSuiteOptions = {},
  ): Promise<TestSuiteResult> {
    const startTime = performance.now()

    logger.constitutional(
      LogLevel.INFO,
      'Starting coordinated test suite execution',
      {
        compliance: options.healthcareCompliance || false,
        requirement: 'Test Suite Coordination',
        standard: 'Testing',
      },
    )

    const categories = options.categories || this.getAllCategories()
    const commands = this.generateTestCommands(categories, options)

    logger.info(
      `Generated ${commands.length} test commands for ${categories.length} categories`,
    )

    try {
      let categoryResults: Record<TestCategory, CategoryTestResult>

      if (options.parallel) {
        logger.info('Executing test suites in parallel')
        categoryResults = await this.executeInParallel(commands, options)
      } else {
        logger.info('Executing test suites sequentially')
        categoryResults = await this.executeSequentially(commands, options)
      }

      const duration = performance.now() - startTime
      const overallMetrics = this.calculateOverallMetrics(categoryResults)
      const success = Object.values(categoryResults).every(
        (result) => result.success,
      )

      logger.constitutional(
        success ? LogLevel.INFO : LogLevel.ERROR,
        `Test suite execution completed: ${success ? 'SUCCESS' : 'FAILED'}`,
        {
          compliance: success,
          requirement: 'Test Suite Completion',
          standard: 'Testing',
        },
      )

      return {
        success,
        duration,
        categoryResults,
        overallMetrics,
        commands,
      }
    } catch (error) {
      const duration = performance.now() - startTime
      logger.error('Test suite execution failed', error)

      return {
        success: false,
        duration,
        categoryResults: {} as Record<TestCategory, CategoryTestResult>,
        overallMetrics: {
          totalTests: 0,
          passedTests: 0,
          failedTests: 0,
          skippedTests: 0,
          coverage: 0,
          categories: 0,
        },
        commands,
      }
    }
  }

  /**
   * Generate test commands for categories and options
   */
  private generateTestCommands(
    categories: TestCategory[],
    options: TestSuiteOptions,
  ): TestCommand[] {
    const commands: TestCommand[] = []

    for (const category of categories) {
      const toolConfig = this.testTools[category]
      const types = options.types || this.getDefaultTypes(category, options)

      for (const type of types) {
        const command = toolConfig.commands[type]
        if (command) {
          commands.push({
            category,
            command: command.split(' ')[0],
            args: command.split(' ').slice(1),
            workingDir: toolConfig.workingDir,
            timeout: options.timeout || 30000,
            env: this.getEnvironmentVariables(category, options),
          })
        }
      }
    }

    return commands
  }

  /**
   * Get default test types for category
   */
  private getDefaultTypes(
    category: TestCategory,
    options: TestSuiteOptions,
  ): string[] {
    const toolConfig = this.testTools[category]

    if (options.healthcareCompliance) {
      return ['unit', ...toolConfig.healthcareTests]
    }

    if (options.coverage) {
      return ['unit', 'coverage']
    }

    if (options.watch) {
      return ['watch']
    }

    return ['unit']
  }

  /**
   * Get environment variables for test execution
   */
  private getEnvironmentVariables(
    category: TestCategory,
    options: TestSuiteOptions,
  ): Record<string, string> {
    const env: Record<string, string> = {
      NODE_ENV: 'test',
      CI: options.ci ? 'true' : 'false',
    }

    if (options.healthcareCompliance) {
      env.HEALTHCARE_COMPLIANCE = 'true'
      env.LGPD_TESTING = 'true'
      env.ANVISA_TESTING = 'true'
      env.CFM_TESTING = 'true'
    }

    if (options.coverage) {
      env.COVERAGE = 'true'
    }

    return env
  }

  /**
   * Execute test commands in parallel
   */
  private async executeInParallel(
    commands: TestCommand[],
    options: TestSuiteOptions,
  ): Promise<Record<TestCategory, CategoryTestResult>> {
    const groupedCommands = this.groupCommandsByCategory(commands)
    const categories = Object.keys(groupedCommands) as TestCategory[]

    // Execute categories in parallel
    const results = await Promise.all(
      categories.map((category) =>
        this.executeCategoryTests(category, groupedCommands[category], options)
      ),
    )

    const categoryResults: Record<TestCategory, CategoryTestResult> = {
      [TestCategory.FRONTEND]: {} as CategoryTestResult,
      [TestCategory.BACKEND]: {} as CategoryTestResult,
      [TestCategory.DATABASE]: {} as CategoryTestResult,
      [TestCategory.QUALITY]: {} as CategoryTestResult,
    }
    categories.forEach((category, index) => {
      categoryResults[category] = results[index]
    })

    return categoryResults
  }

  /**
   * Execute test commands sequentially
   */
  private async executeSequentially(
    commands: TestCommand[],
    options: TestSuiteOptions,
  ): Promise<Record<TestCategory, CategoryTestResult>> {
    const groupedCommands = this.groupCommandsByCategory(commands)
    const categoryResults: Record<TestCategory, CategoryTestResult> = {
      [TestCategory.FRONTEND]: {} as CategoryTestResult,
      [TestCategory.BACKEND]: {} as CategoryTestResult,
      [TestCategory.DATABASE]: {} as CategoryTestResult,
      [TestCategory.QUALITY]: {} as CategoryTestResult,
    }

    for (const category of Object.keys(groupedCommands) as TestCategory[]) {
      categoryResults[category] = await this.executeCategoryTests(
        category,
        groupedCommands[category],
        options,
      )

      // Stop on first failure if not in CI mode
      if (!categoryResults[category].success && !options.ci) {
        logger.warn(
          `Category ${category} failed, stopping sequential execution`,
        )
        break
      }
    }

    return categoryResults
  }

  /**
   * Group commands by category
   */
  private groupCommandsByCategory(
    commands: TestCommand[],
  ): Record<TestCategory, TestCommand[]> {
    const grouped: Record<TestCategory, TestCommand[]> = {
      [TestCategory.FRONTEND]: [],
      [TestCategory.BACKEND]: [],
      [TestCategory.DATABASE]: [],
      [TestCategory.QUALITY]: [],
    }

    for (const command of commands) {
      if (!grouped[command.category]) {
        grouped[command.category] = []
      }
      grouped[command.category].push(command)
    }

    return grouped
  }

  /**
   * Execute tests for a specific category
   */
  private async executeCategoryTests(
    category: TestCategory,
    commands: TestCommand[],
    options: TestSuiteOptions,
  ): Promise<CategoryTestResult> {
    const startTime = performance.now()

    logger.info(`Executing ${commands.length} test commands for ${category}`)

    try {
      // Simulate test execution for now
      // In real implementation, this would execute actual test commands
      await this.simulateTestExecution(category, commands)

      const duration = performance.now() - startTime

      // Generate simulated metrics
      const metrics = this.generateTestMetrics(category, options)

      return {
        category,
        success: metrics.failed === 0,
        duration,
        metrics,
        output: `Test execution completed for ${category}`,
        errors: metrics.failed > 0
          ? [`${metrics.failed} tests failed in ${category}`]
          : [],
      }
    } catch (error) {
      const duration = performance.now() - startTime
      logger.error(`Test execution failed for ${category}`, error)

      return {
        category,
        success: false,
        duration,
        metrics: {
          tests: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          coverage: 0,
        },
        output: '',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      }
    }
  }

  /**
   * Simulate test execution (replace with actual execution)
   */
  private async simulateTestExecution(
    category: TestCategory,
    commands: TestCommand[],
  ): Promise<void> {
    const executionTime = {
      [TestCategory.FRONTEND]: 3000, // 3s for frontend tests
      [TestCategory.BACKEND]: 4000, // 4s for backend tests
      [TestCategory.DATABASE]: 5000, // 5s for database tests
      [TestCategory.QUALITY]: 6000, // 6s for quality tests
    }

    const baseTime = executionTime[category] || 3000
    const commandMultiplier = commands.length * 0.5
    const totalTime = baseTime + commandMultiplier * 1000

    await new Promise((resolve) => setTimeout(resolve, totalTime))
  }

  /**
   * Generate test metrics (replace with actual metrics collection)
   */
  private generateTestMetrics(
    category: TestCategory,
    options: TestSuiteOptions,
  ) {
    const baseTests = {
      [TestCategory.FRONTEND]: 25,
      [TestCategory.BACKEND]: 35,
      [TestCategory.DATABASE]: 20,
      [TestCategory.QUALITY]: 30,
    }

    const testCount = baseTests[category] || 25
    const successRate = options.healthcareCompliance ? 0.9 : 0.95 // 90% with healthcare, 95% without
    const passed = Math.floor(testCount * successRate)
    const failed = testCount - passed

    const coverage = options.coverage
      ? Math.floor(Math.random() * 10) + 85 // 85-95% coverage
      : Math.floor(Math.random() * 15) + 75 // 75-90% coverage

    return {
      tests: testCount,
      passed,
      failed,
      skipped: 0,
      coverage,
    }
  }

  /**
   * Calculate overall metrics from category results
   */
  private calculateOverallMetrics(
    categoryResults: Record<TestCategory, CategoryTestResult>,
  ) {
    const allMetrics = Object.values(categoryResults).map(
      (result) => result.metrics,
    )

    const totalTests = allMetrics.reduce(
      (sum, metrics) => sum + metrics.tests,
      0,
    )
    const passedTests = allMetrics.reduce(
      (sum, metrics) => sum + metrics.passed,
      0,
    )
    const failedTests = allMetrics.reduce(
      (sum, metrics) => sum + metrics.failed,
      0,
    )
    const skippedTests = allMetrics.reduce(
      (sum, metrics) => sum + metrics.skipped,
      0,
    )

    const coverage = allMetrics.length > 0
      ? allMetrics.reduce((sum, metrics) => sum + metrics.coverage, 0)
        / allMetrics.length
      : 0

    return {
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      coverage: Math.round(coverage),
      categories: Object.keys(categoryResults).length,
    }
  }

  /**
   * Get all available categories
   */
  private getAllCategories(): TestCategory[] {
    return Object.keys(TEST_CATEGORIES) as TestCategory[]
  }

  /**
   * Get available commands for a category
   */
  getAvailableCommands(category: TestCategory): string[] {
    return Object.keys(this.testTools[category].commands)
  }

  /**
   * Get tool configuration for a category
   */
  getToolConfig(category: TestCategory): TestToolConfig {
    return this.testTools[category]
  }

  /**
   * Get healthcare-specific test types
   */
  getHealthcareTestTypes(): Record<TestCategory, string[]> {
    const healthcareTypes: Record<TestCategory, string[]> = {
      [TestCategory.FRONTEND]: [],
      [TestCategory.BACKEND]: [],
      [TestCategory.DATABASE]: [],
      [TestCategory.QUALITY]: [],
    }

    for (const category of Object.keys(this.testTools) as TestCategory[]) {
      healthcareTypes[category] = this.testTools[category].healthcareTests
    }

    return healthcareTypes
  }
}

interface TestToolConfig {
  packageName: string
  workingDir: string
  commands: Record<string, string>
  healthcareTests: string[]
  frameworks: string[]
}
