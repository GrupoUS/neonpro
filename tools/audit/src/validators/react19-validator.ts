import { access, constants, readdir, readFile, } from 'fs/promises'
import { join, relative, } from 'path'
import { performance, } from 'perf_hooks'
import {
  Performance,
  SecurityResult,
  SystemValidator,
  ValidationResult,
} from '../core/system-validator'

/**
 * React19Validator - Constitutional TDD Compliance for React 19 Healthcare Applications
 *
 * Validates React 19.1.1 configurations, component patterns, and healthcare compliance
 * for NeonPro healthcare management system with LGPD/ANVISA requirements.
 *
 * Constitutional Requirements:
 * - Process 10k+ files in <4 hours
 * - Memory usage <2GB
 * - Healthcare compliance validation (LGPD/ANVISA)
 * - React 19 concurrent features assessment
 * - Component security validation
 * - Performance pattern analysis
 */

interface React19Config {
  version?: string
  mode?: 'development' | 'production' | 'test'
  strictMode?: boolean
  concurrent?: boolean
  suspense?: boolean
  experimental?: ExperimentalFeatures
  typescript?: boolean
}

interface ExperimentalFeatures {
  concurrentFeatures?: boolean
  reactCompiler?: boolean
  reactFresh?: boolean
  newJSXTransform?: boolean
  automaticBatching?: boolean
  suspenseList?: boolean
  transitions?: boolean
  deferredValue?: boolean
}

interface ComponentAnalysis {
  totalComponents: number
  functionalComponents: number
  classComponents: number
  healthcareComponents: number
  hookComponents: number
  memoizedComponents: number
  suspenseComponents: number
  errorBoundaryComponents: number
  accessibleComponents: number
  componentsByType: ComponentTypeAnalysis
}

interface ComponentTypeAnalysis {
  forms: number
  lists: number
  modals: number
  charts: number
  tables: number
  inputs: number
  buttons: number
  navigation: number
  healthcare: HealthcareComponentAnalysis
}

interface HealthcareComponentAnalysis {
  patientForms: number
  appointmentSchedulers: number
  medicalCharts: number
  prescriptionForms: number
  diagnosticDisplays: number
  healthcareProviderComponents: number
  complianceComponents: number
}

interface HookAnalysis {
  totalHooks: number
  builtInHooks: Record<string, number>
  customHooks: CustomHookAnalysis[]
  healthcareHooks: string[]
  performanceHooks: string[]
  securityHooks: string[]
  complianceIssues: string[]
}

interface CustomHookAnalysis {
  name: string
  file: string
  usageCount: number
  isHealthcareRelated: boolean
  hasSecurityImplications: boolean
  hasPerformanceOptimizations: boolean
  lgpdCompliant: boolean
}

interface StateManagementAnalysis {
  patterns: StatePattern[]
  contextUsage: ContextUsage[]
  reducerUsage: ReducerUsage[]
  healthcareDataHandling: HealthcareDataPattern[]
  securityPatterns: SecurityPattern[]
  performanceOptimizations: string[]
}

interface StatePattern {
  type: 'useState' | 'useReducer' | 'useContext' | 'external'
  count: number
  healthcareRelated: number
  sensitiveDataHandling: number
}

interface ContextUsage {
  name: string
  file: string
  consumers: number
  isHealthcareContext: boolean
  hasSecurityMeasures: boolean
  lgpdCompliant: boolean
}

interface ReducerUsage {
  name: string
  file: string
  actions: string[]
  isHealthcareReducer: boolean
  hasAuditLogging: boolean
  immutableUpdates: boolean
}

interface HealthcareDataPattern {
  pattern: string
  description: string
  files: string[]
  lgpdCompliant: boolean
  anvisaCompliant: boolean
  securityIssues: string[]
}

interface SecurityPattern {
  type: 'sanitization' | 'validation' | 'encryption' | 'authorization'
  implementation: string
  healthcareRelevant: boolean
  effectiveness: 'low' | 'medium' | 'high'
}

interface PerformanceAnalysis {
  concurrentFeatures: ConcurrentFeatureUsage
  suspenseUsage: SuspenseUsage
  memoizationPatterns: MemoizationAnalysis
  lazyLoading: LazyLoadingAnalysis
  bundleSplitting: BundleSplittingAnalysis
  healthcareOptimizations: HealthcarePerformanceOptimization[]
}

interface ConcurrentFeatureUsage {
  useTransition: number
  useDeferredValue: number
  startTransition: number
  concurrent: boolean
  healthcareOptimized: boolean
  issues: string[]
}

interface SuspenseUsage {
  suspenseComponents: number
  lazyComponents: number
  errorBoundaries: number
  healthcareSuspense: number
  fallbackPatterns: string[]
}

interface MemoizationAnalysis {
  useMemo: number
  useCallback: number
  reactMemo: number
  healthcareOptimizedMemoization: number
  unnecessaryMemoization: number
  recommendations: string[]
}

interface LazyLoadingAnalysis {
  lazyComponents: number
  dynamicImports: number
  healthcareLazyLoading: number
  loadingStrategies: string[]
  performanceImpact: 'low' | 'medium' | 'high'
}

interface BundleSplittingAnalysis {
  codesplitting: boolean
  routeBasedSplitting: boolean
  componentBasedSplitting: boolean
  healthcareModuleSplitting: boolean
  chunkOptimization: number
}

interface HealthcarePerformanceOptimization {
  type: string
  description: string
  implementation: string
  impact: 'low' | 'medium' | 'high'
  compliance: 'lgpd' | 'anvisa' | 'both'
}

interface AccessibilityAnalysis {
  a11yCompliant: number
  ariaAttributes: number
  keyboardNavigation: number
  screenReaderSupport: number
  colorContrast: number
  healthcareAccessibility: HealthcareA11yAnalysis
  wcagCompliance: WCAGComplianceAnalysis
}

interface HealthcareA11yAnalysis {
  medicalFormAccessibility: number
  patientDataAccessibility: number
  emergencyAccessibility: number
  assistiveTechnologySupport: number
}

interface WCAGComplianceAnalysis {
  level: 'A' | 'AA' | 'AAA'
  perceivable: number
  operable: number
  understandable: number
  robust: number
  overallScore: number
}

interface React19ValidationResult extends ValidationResult {
  configuration: {
    valid: boolean
    version: string | null
    react19Features: {
      enabled: string[]
      missing: string[]
      experimental: string[]
      score: number
    }
    typescript: {
      enabled: boolean
      strict: boolean
      healthcareTypes: number
      issues: string[]
    }
    strictMode: boolean
    concurrent: boolean
    issues: string[]
  }
  components: {
    analysis: ComponentAnalysis
    healthcareCompliance: {
      lgpdCompliant: number
      anvisaCompliant: number
      securityIssues: string[]
      recommendations: string[]
    }
    patterns: {
      recommended: string[]
      antipatterns: string[]
      healthcareSpecific: string[]
    }
  }
  hooks: {
    analysis: HookAnalysis
    healthcareHooks: {
      patientDataHooks: string[]
      appointmentHooks: string[]
      medicalRecordHooks: string[]
      complianceHooks: string[]
    }
    securityPatterns: {
      dataValidation: number
      sanitization: number
      authorization: number
      auditLogging: number
    }
  }
  stateManagement: {
    analysis: StateManagementAnalysis
    healthcareDataFlow: {
      patientDataFlow: boolean
      medicalRecordFlow: boolean
      appointmentFlow: boolean
      complianceFlow: boolean
      securityFlow: boolean
    }
    lgpdCompliance: {
      dataMinimization: boolean
      consentManagement: boolean
      rightToErasure: boolean
      auditTrail: boolean
      score: number
    }
  }
  performance: Performance & {
    react19: {
      concurrentFeatures: ConcurrentFeatureUsage
      suspense: SuspenseUsage
      memoization: MemoizationAnalysis
      lazyLoading: LazyLoadingAnalysis
      bundleSplitting: BundleSplittingAnalysis
    }
    healthcare: {
      optimizations: HealthcarePerformanceOptimization[]
      clinicNetworkOptimized: boolean
      mobileOptimized: boolean
      offlineCapable: boolean
    }
  }
  accessibility: {
    analysis: AccessibilityAnalysis
    healthcare: HealthcareA11yAnalysis
    wcag: WCAGComplianceAnalysis
    anvisaCompliance: boolean
  }
  security: SecurityResult & {
    healthcare: {
      patientDataSecurity: boolean
      medicalRecordSecurity: boolean
      lgpdCompliance: boolean
      anvisaCompliance: boolean
      auditLogging: boolean
    }
    react19Security: {
      concurrentSafety: boolean
      suspenseSecurity: boolean
      contextSecurity: boolean
      hookSecurity: boolean
    }
  }
  healthcareCompliance: {
    lgpdScore: number
    anvisaScore: number
    overallScore: number
    criticalIssues: string[]
    recommendations: string[]
  }
}

export class React19Validator extends SystemValidator {
  private config: React19Config = {}
  private validationStartTime: number = 0

  // Healthcare compliance patterns for Brazilian regulations
  private readonly healthcarePatterns = {
    // LGPD Patient Data Protection Patterns
    lgpd: [
      /patient.*data|dados.*paciente/i,
      /medical.*record|prontuario.*medico/i,
      /personal.*data|dados.*pessoais/i,
      /sensitive.*data|dados.*sensiveis/i,
      /health.*information|informacao.*saude/i,
      /consent.*management|gerenciamento.*consentimento/i,
      /data.*minimization|minimizacao.*dados/i,
      /right.*erasure|direito.*esquecimento/i,
    ],

    // ANVISA Healthcare Regulation Patterns
    anvisa: [
      /prescription.*management|gestao.*receitas/i,
      /medication.*tracking|rastreamento.*medicamentos/i,
      /diagnosis.*recording|registro.*diagnosticos/i,
      /treatment.*monitoring|monitoramento.*tratamentos/i,
      /appointment.*scheduling|agendamento.*consultas/i,
      /healthcare.*provider|profissional.*saude/i,
      /clinical.*workflow|fluxo.*clinico/i,
      /regulatory.*compliance|conformidade.*regulatoria/i,
    ],

    // React Security Patterns
    security: [
      /sanitize.*input|sanitizar.*entrada/i,
      /validate.*data|validar.*dados/i,
      /encrypt.*sensitive|criptografar.*sensivel/i,
      /audit.*log|log.*auditoria/i,
      /access.*control|controle.*acesso/i,
      /authentication|autenticacao/i,
      /authorization|autorizacao/i,
      /secure.*context|contexto.*seguro/i,
    ],
  }

  // React 19 specific patterns and features
  private readonly react19Patterns = {
    // Concurrent Features
    concurrent: [
      /useTransition|useDeferredValue/i,
      /startTransition|isPending/i,
      /concurrent.*mode|modo.*concorrente/i,
      /automatic.*batching|batching.*automatico/i,
    ],

    // Suspense and Error Boundaries
    suspense: [
      /Suspense.*fallback/i,
      /lazy.*loading|carregamento.*lazy/i,
      /ErrorBoundary/i,
      /componentDidCatch|getDerivedStateFromError/i,
    ],

    // New JSX Transform
    jsx: [
      /jsx.*runtime/i,
      /automatic.*jsx/i,
      /new.*jsx.*transform/i,
    ],

    // Performance Optimizations
    performance: [
      /memo.*component|componente.*memo/i,
      /useCallback.*optimization/i,
      /useMemo.*calculation/i,
      /virtualized.*list|lista.*virtualizada/i,
    ],
  }

  constructor() {
    super()
  }

  async validate(projectPath: string,): Promise<React19ValidationResult> {
    this.validationStartTime = performance.now()

    console.log('🔍 Starting React 19 validation for healthcare application compliance...',)

    const result: React19ValidationResult = {
      valid: false,
      errors: [],
      warnings: [],
      performance: {
        duration: 0,
        filesProcessed: 0,
        memoryUsage: 0,
        react19: {
          concurrentFeatures: {
            useTransition: 0,
            useDeferredValue: 0,
            startTransition: 0,
            concurrent: false,
            healthcareOptimized: false,
            issues: [],
          },
          suspense: {
            suspenseComponents: 0,
            lazyComponents: 0,
            errorBoundaries: 0,
            healthcareSuspense: 0,
            fallbackPatterns: [],
          },
          memoization: {
            useMemo: 0,
            useCallback: 0,
            reactMemo: 0,
            healthcareOptimizedMemoization: 0,
            unnecessaryMemoization: 0,
            recommendations: [],
          },
          lazyLoading: {
            lazyComponents: 0,
            dynamicImports: 0,
            healthcareLazyLoading: 0,
            loadingStrategies: [],
            performanceImpact: 'low',
          },
          bundleSplitting: {
            codesplitting: false,
            routeBasedSplitting: false,
            componentBasedSplitting: false,
            healthcareModuleSplitting: false,
            chunkOptimization: 0,
          },
        },
        healthcare: {
          optimizations: [],
          clinicNetworkOptimized: false,
          mobileOptimized: false,
          offlineCapable: false,
        },
      },
      configuration: {
        valid: false,
        version: null,
        react19Features: {
          enabled: [],
          missing: [],
          experimental: [],
          score: 0,
        },
        typescript: {
          enabled: false,
          strict: false,
          healthcareTypes: 0,
          issues: [],
        },
        strictMode: false,
        concurrent: false,
        issues: [],
      },
      components: {
        analysis: {
          totalComponents: 0,
          functionalComponents: 0,
          classComponents: 0,
          healthcareComponents: 0,
          hookComponents: 0,
          memoizedComponents: 0,
          suspenseComponents: 0,
          errorBoundaryComponents: 0,
          accessibleComponents: 0,
          componentsByType: {
            forms: 0,
            lists: 0,
            modals: 0,
            charts: 0,
            tables: 0,
            inputs: 0,
            buttons: 0,
            navigation: 0,
            healthcare: {
              patientForms: 0,
              appointmentSchedulers: 0,
              medicalCharts: 0,
              prescriptionForms: 0,
              diagnosticDisplays: 0,
              healthcareProviderComponents: 0,
              complianceComponents: 0,
            },
          },
        },
        healthcareCompliance: {
          lgpdCompliant: 0,
          anvisaCompliant: 0,
          securityIssues: [],
          recommendations: [],
        },
        patterns: {
          recommended: [],
          antipatterns: [],
          healthcareSpecific: [],
        },
      },
      hooks: {
        analysis: {
          totalHooks: 0,
          builtInHooks: {},
          customHooks: [],
          healthcareHooks: [],
          performanceHooks: [],
          securityHooks: [],
          complianceIssues: [],
        },
        healthcareHooks: {
          patientDataHooks: [],
          appointmentHooks: [],
          medicalRecordHooks: [],
          complianceHooks: [],
        },
        securityPatterns: {
          dataValidation: 0,
          sanitization: 0,
          authorization: 0,
          auditLogging: 0,
        },
      },
      stateManagement: {
        analysis: {
          patterns: [],
          contextUsage: [],
          reducerUsage: [],
          healthcareDataHandling: [],
          securityPatterns: [],
          performanceOptimizations: [],
        },
        healthcareDataFlow: {
          patientDataFlow: false,
          medicalRecordFlow: false,
          appointmentFlow: false,
          complianceFlow: false,
          securityFlow: false,
        },
        lgpdCompliance: {
          dataMinimization: false,
          consentManagement: false,
          rightToErasure: false,
          auditTrail: false,
          score: 0,
        },
      },
      accessibility: {
        analysis: {
          a11yCompliant: 0,
          ariaAttributes: 0,
          keyboardNavigation: 0,
          screenReaderSupport: 0,
          colorContrast: 0,
          healthcareAccessibility: {
            medicalFormAccessibility: 0,
            patientDataAccessibility: 0,
            emergencyAccessibility: 0,
            assistiveTechnologySupport: 0,
          },
          wcagCompliance: {
            level: 'A',
            perceivable: 0,
            operable: 0,
            understandable: 0,
            robust: 0,
            overallScore: 0,
          },
        },
        healthcare: {
          medicalFormAccessibility: 0,
          patientDataAccessibility: 0,
          emergencyAccessibility: 0,
          assistiveTechnologySupport: 0,
        },
        wcag: {
          level: 'A',
          perceivable: 0,
          operable: 0,
          understandable: 0,
          robust: 0,
          overallScore: 0,
        },
        anvisaCompliance: false,
      },
      security: {
        score: 0,
        issues: [],
        recommendations: [],
        healthcare: {
          patientDataSecurity: false,
          medicalRecordSecurity: false,
          lgpdCompliance: false,
          anvisaCompliance: false,
          auditLogging: false,
        },
        react19Security: {
          concurrentSafety: false,
          suspenseSecurity: false,
          contextSecurity: false,
          hookSecurity: false,
        },
      },
      healthcareCompliance: {
        lgpdScore: 0,
        anvisaScore: 0,
        overallScore: 0,
        criticalIssues: [],
        recommendations: [],
      },
    }

    try {
      // 1. Validate React configuration and version
      await this.validateReactConfiguration(projectPath, result,)

      // 2. Analyze React components
      await this.analyzeComponents(projectPath, result,)

      // 3. Analyze hooks usage
      await this.analyzeHooks(projectPath, result,)

      // 4. Analyze state management patterns
      await this.analyzeStateManagement(projectPath, result,)

      // 5. Analyze React 19 performance features
      await this.analyzePerformanceFeatures(projectPath, result,)

      // 6. Analyze accessibility compliance
      await this.analyzeAccessibility(projectPath, result,)

      // 7. Healthcare compliance assessment
      await this.assessHealthcareCompliance(projectPath, result,)

      // 8. Security validation
      await this.validateSecurity(projectPath, result,)

      // Calculate overall validity
      result.valid = this.calculateOverallValidity(result,)
    } catch (error) {
      result.errors.push(`React 19 validation failed: ${error.message}`,)
    }

    // Performance metrics
    const endTime = performance.now()
    result.performance.duration = endTime - this.validationStartTime
    result.performance.memoryUsage = process.memoryUsage().heapUsed

    console.log(`✅ React 19 validation completed in ${result.performance.duration.toFixed(2,)}ms`,)
    console.log(`📊 Healthcare compliance score: ${result.healthcareCompliance.overallScore}/100`,)

    return result
  }
  private async validateReactConfiguration(
    projectPath: string,
    result: React19ValidationResult,
  ): Promise<void> {
    console.log('🔧 Validating React 19 configuration for healthcare applications...',)

    // Check package.json for React version and dependencies
    await this.analyzePackageJsonReact(projectPath, result,)

    // Check for React configuration files
    await this.analyzeReactConfigFiles(projectPath, result,)

    // Check TypeScript configuration for React
    await this.analyzeTypeScriptReactConfig(projectPath, result,)

    // Validate React 19 specific features
    this.validateReact19Features(result,)
  }

  private async analyzePackageJsonReact(
    projectPath: string,
    result: React19ValidationResult,
  ): Promise<void> {
    const packageJsonPath = join(projectPath, 'package.json',)

    try {
      await access(packageJsonPath, constants.F_OK,)
      const content = await readFile(packageJsonPath, 'utf-8',)
      const packageJson = JSON.parse(content,)

      // Check React version
      const reactVersion = packageJson.dependencies?.react || packageJson.devDependencies?.react
      if (reactVersion) {
        result.configuration.version = reactVersion

        // Check if it's React 19+
        const versionNumber = this.extractVersionNumber(reactVersion,)
        if (versionNumber >= 19) {
          result.configuration.react19Features.enabled.push('React 19+ detected',)
        } else {
          result.configuration.issues.push(`React version ${reactVersion} is not React 19+`,)
        }
      } else {
        result.configuration.issues.push('React not found in dependencies',)
      }

      // Check for React DOM
      const reactDomVersion = packageJson.dependencies?.['react-dom']
        || packageJson.devDependencies?.['react-dom']
      if (!reactDomVersion) {
        result.configuration.issues.push('React DOM not found in dependencies',)
      }

      // Check for TypeScript React types
      const reactTypesVersion = packageJson.dependencies?.['@types/react']
        || packageJson.devDependencies?.['@types/react']
      if (reactTypesVersion) {
        result.configuration.typescript.enabled = true
        result.configuration.react19Features.enabled.push('TypeScript React types available',)
      }

      // Check for healthcare-relevant React dependencies
      this.analyzeHealthcareReactDependencies(packageJson, result,)

      result.performance.filesProcessed++
    } catch (error) {
      result.configuration.issues.push('Failed to analyze package.json for React configuration',)
    }
  }

  private extractVersionNumber(version: string,): number {
    const match = version.match(/(\d+)/,)
    return match ? parseInt(match[1], 10,) : 0
  }

  private analyzeHealthcareReactDependencies(
    packageJson: any,
    result: React19ValidationResult,
  ): void {
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies, }

    // Healthcare-relevant React dependencies
    const healthcareDeps = {
      forms: ['react-hook-form', 'formik', '@hookform/resolvers',], // Patient data forms
      state: ['@reduxjs/toolkit', 'zustand', 'jotai', 'recoil',], // Medical record state management
      ui: ['@mui/material', '@chakra-ui/react', '@radix-ui/react', 'react-aria',], // Healthcare UI components
      charts: ['recharts', 'react-chartjs-2', 'd3-react',], // Medical data visualization
      dates: ['date-fns', 'dayjs', 'react-datepicker',], // Appointment scheduling
      validation: ['joi', 'yup', 'zod',], // Healthcare data validation
      testing: ['@testing-library/react', 'jest', '@testing-library/jest-dom',], // Healthcare component testing
      accessibility: ['@axe-core/react', 'react-focus-trap',], // Medical UI accessibility
      performance: ['react-window', 'react-virtualized',], // Large medical dataset optimization
      security: ['dompurify', 'sanitize-html',], // Healthcare data sanitization
    }

    for (const [category, deps,] of Object.entries(healthcareDeps,)) {
      for (const dep of deps) {
        if (allDeps[dep]) {
          result.configuration.react19Features.enabled.push(`Healthcare ${category}: ${dep}`,)
        }
      }
    }

    // Check for missing essential healthcare dependencies
    const essentialDeps = ['react-hook-form', '@testing-library/react', 'date-fns',]
    for (const dep of essentialDeps) {
      if (!allDeps[dep]) {
        result.configuration.react19Features.missing.push(dep,)
      }
    }
  }

  private async analyzeReactConfigFiles(
    projectPath: string,
    result: React19ValidationResult,
  ): Promise<void> {
    // Check for React-specific configuration files
    const configFiles = [
      '.eslintrc.js',
      '.config/eslint/.eslintrc.json',
      'eslint.config.js',
      'jest.config.js',
      'jest.config.ts',
      'babel.config.js',
      '.babelrc',
    ]

    for (const configFile of configFiles) {
      const filePath = join(projectPath, configFile,)
      try {
        await access(filePath, constants.F_OK,)
        const content = await readFile(filePath, 'utf-8',)

        // Analyze React-specific configurations
        this.analyzeReactConfigContent(content, configFile, result,)

        result.performance.filesProcessed++
      } catch (error) {
        // File doesn't exist, continue
      }
    }

    // Check for strict mode configuration
    await this.checkStrictModeUsage(projectPath, result,)
  }

  private analyzeReactConfigContent(
    content: string,
    filename: string,
    result: React19ValidationResult,
  ): void {
    if (filename.includes('eslint',)) {
      // Check for React ESLint rules
      if (content.includes('react-hooks/exhaustive-deps',)) {
        result.configuration.react19Features.enabled.push('React hooks ESLint rules enabled',)
      }

      if (content.includes('jsx-a11y',)) {
        result.configuration.react19Features.enabled.push('JSX accessibility rules enabled',)
        result.accessibility.analysis.a11yCompliant++
      }

      // Check for healthcare-specific ESLint rules
      if (content.includes('security',)) {
        result.configuration.react19Features.enabled.push(
          'Security ESLint rules for healthcare data',
        )
      }
    }

    if (filename.includes('babel',)) {
      // Check for new JSX transform
      if (content.includes('automatic',) || content.includes('jsx-runtime',)) {
        result.configuration.react19Features.enabled.push('New JSX transform enabled',)
      }

      // Check for React refresh
      if (content.includes('react-refresh',)) {
        result.configuration.react19Features.enabled.push('React Fast Refresh enabled',)
      }
    }

    if (filename.includes('jest',)) {
      // Check for React testing configuration
      if (content.includes('@testing-library',)) {
        result.configuration.react19Features.enabled.push('React Testing Library configured',)
      }

      if (content.includes('jsdom',)) {
        result.configuration.react19Features.enabled.push('JSDOM environment for React testing',)
      }
    }
  }

  private async checkStrictModeUsage(
    projectPath: string,
    result: React19ValidationResult,
  ): Promise<void> {
    // Look for StrictMode usage in main React files
    const mainFiles = [
      'src/main.tsx',
      'src/main.jsx',
      'src/index.tsx',
      'src/index.jsx',
      'src/App.tsx',
      'src/App.jsx',
    ]

    for (const mainFile of mainFiles) {
      const filePath = join(projectPath, mainFile,)
      try {
        await access(filePath, constants.F_OK,)
        const content = await readFile(filePath, 'utf-8',)

        if (content.includes('StrictMode',)) {
          result.configuration.strictMode = true
          result.configuration.react19Features.enabled.push('React StrictMode enabled',)
        }

        // Check for concurrent mode indicators
        if (content.includes('createRoot',)) {
          result.configuration.concurrent = true
          result.configuration.react19Features.enabled.push('React 18+ createRoot API',)
        }

        result.performance.filesProcessed++
        break // Use first found main file
      } catch (error) {
        // File doesn't exist, continue
      }
    }
  }

  private async analyzeTypeScriptReactConfig(
    projectPath: string,
    result: React19ValidationResult,
  ): Promise<void> {
    const tsConfigPath = join(projectPath, 'tsconfig.json',)

    try {
      await access(tsConfigPath, constants.F_OK,)
      const content = await readFile(tsConfigPath, 'utf-8',)
      const tsConfig = JSON.parse(content,)

      result.configuration.typescript.enabled = true

      // Check for strict TypeScript configuration
      if (tsConfig.compilerOptions?.strict) {
        result.configuration.typescript.strict = true
        result.configuration.react19Features.enabled.push(
          'Strict TypeScript enabled for healthcare safety',
        )
      }

      // Check for JSX configuration
      if (tsConfig.compilerOptions?.jsx) {
        result.configuration.react19Features.enabled.push(`JSX: ${tsConfig.compilerOptions.jsx}`,)
      }

      // Check for React-specific TypeScript settings
      if (tsConfig.compilerOptions?.esModuleInterop) {
        result.configuration.react19Features.enabled.push('ES Module interop for React',)
      }

      result.performance.filesProcessed++
    } catch (error) {
      // TypeScript config doesn't exist or invalid JSON
    }
  }

  private validateReact19Features(result: React19ValidationResult,): void {
    // Check for missing essential React 19 features
    const essentialFeatures = [
      'React 19+ detected',
      'TypeScript React types available',
      'React StrictMode enabled',
      'React 18+ createRoot API',
    ]

    for (const feature of essentialFeatures) {
      if (!result.configuration.react19Features.enabled.includes(feature,)) {
        result.configuration.react19Features.missing.push(feature,)
      }
    }

    // Calculate React 19 features score
    const totalFeatures = result.configuration.react19Features.enabled.length
      + result.configuration.react19Features.missing.length

    if (totalFeatures > 0) {
      result.configuration.react19Features.score =
        (result.configuration.react19Features.enabled.length / totalFeatures) * 100
    }

    // Mark experimental features
    const experimentalFeatures = [
      'React Compiler',
      'Concurrent Features',
      'Server Components',
    ]

    for (const feature of result.configuration.react19Features.enabled) {
      if (experimentalFeatures.some(exp => feature.includes(exp,))) {
        result.configuration.react19Features.experimental.push(feature,)
      }
    }

    // Validate overall configuration
    result.configuration.valid = result.configuration.version !== null
      && result.configuration.react19Features.score >= 60
      && result.configuration.issues.length === 0
  }

  private async analyzeComponents(
    projectPath: string,
    result: React19ValidationResult,
  ): Promise<void> {
    console.log('📦 Analyzing React components for healthcare compliance...',)

    // Find all React component files
    const componentFiles = await this.findComponentFiles(projectPath,)

    // Analyze each component file
    for (const componentFile of componentFiles) {
      await this.analyzeComponentFile(componentFile, result,)
      result.performance.filesProcessed++
    }

    // Assess healthcare component compliance
    this.assessHealthcareComponentCompliance(result,)

    // Generate component pattern recommendations
    this.generateComponentPatternRecommendations(result,)
  }

  private async findComponentFiles(projectPath: string,): Promise<string[]> {
    const componentFiles: string[] = []

    // Look in common React component directories
    const componentDirs = [
      'src/components',
      'src/pages',
      'src/views',
      'src/containers',
      'components',
      'pages',
    ]

    for (const dir of componentDirs) {
      const fullPath = join(projectPath, dir,)
      try {
        await access(fullPath, constants.F_OK,)
        await this.findReactFilesInDirectory(fullPath, componentFiles,)
      } catch (error) {
        // Directory doesn't exist, continue
      }
    }

    return componentFiles
  }

  private async findReactFilesInDirectory(
    dirPath: string,
    componentFiles: string[],
  ): Promise<void> {
    try {
      const entries = await readdir(dirPath, { withFileTypes: true, },)

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name,)

        if (entry.isDirectory()) {
          await this.findReactFilesInDirectory(fullPath, componentFiles,)
        } else if (entry.isFile() && this.isReactFile(entry.name,)) {
          componentFiles.push(fullPath,)
        }
      }
    } catch (error) {
      // Directory read failed, continue
    }
  }

  private isReactFile(filename: string,): boolean {
    const reactExtensions = ['.tsx', '.jsx', '.ts', '.js',]
    return reactExtensions.some(ext => filename.endsWith(ext,))
      && !filename.includes('.test.',)
      && !filename.includes('.spec.',)
  }

  private async analyzeComponentFile(
    filePath: string,
    result: React19ValidationResult,
  ): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf-8',)
      const filename = filePath.split('/',).pop() || ''

      // Basic component analysis
      this.analyzeComponentStructure(content, filename, result,)

      // Healthcare-specific analysis
      this.analyzeHealthcareComponentPatterns(content, filename, result,)

      // Security analysis
      this.analyzeComponentSecurity(content, filename, result,)

      // Accessibility analysis
      this.analyzeComponentAccessibility(content, filename, result,)

      // Performance analysis
      this.analyzeComponentPerformance(content, filename, result,)
    } catch (error) {
      result.components.healthcareCompliance.securityIssues.push(
        `Failed to analyze component file: ${filePath}`,
      )
    }
  }

  private analyzeComponentStructure(
    content: string,
    filename: string,
    result: React19ValidationResult,
  ): void {
    const analysis = result.components.analysis

    // Count total components
    analysis.totalComponents++

    // Functional vs Class components
    if (content.includes('function ',) || content.includes('const ',) && content.includes('=>',)) {
      analysis.functionalComponents++
    }

    if (content.includes('class ',) && content.includes('extends',)) {
      analysis.classComponents++
    }

    // Hook usage
    if (content.includes('use',)) {
      analysis.hookComponents++
    }

    // Memoization
    if (content.includes('memo(',) || content.includes('React.memo',)) {
      analysis.memoizedComponents++
    }

    // Suspense
    if (content.includes('Suspense',)) {
      analysis.suspenseComponents++
    }

    // Error boundaries
    if (content.includes('ErrorBoundary',) || content.includes('componentDidCatch',)) {
      analysis.errorBoundaryComponents++
    }

    // Component type classification
    this.classifyComponentType(content, filename, result,)
  }

  private classifyComponentType(
    content: string,
    filename: string,
    result: React19ValidationResult,
  ): void {
    const types = result.components.analysis.componentsByType
    const lowerContent = content.toLowerCase()
    const lowerFilename = filename.toLowerCase()

    // General component types
    if (lowerContent.includes('form',) || lowerFilename.includes('form',)) {
      types.forms++
    }

    if (
      lowerContent.includes('list',) || lowerContent.includes('table',)
      || lowerFilename.includes('list',)
    ) {
      types.lists++
    }

    if (lowerContent.includes('modal',) || lowerContent.includes('dialog',)) {
      types.modals++
    }

    if (lowerContent.includes('chart',) || lowerContent.includes('graph',)) {
      types.charts++
    }

    if (lowerContent.includes('input',) || lowerContent.includes('field',)) {
      types.inputs++
    }

    if (lowerContent.includes('button',) || lowerFilename.includes('button',)) {
      types.buttons++
    }

    if (lowerContent.includes('nav',) || lowerContent.includes('menu',)) {
      types.navigation++
    }

    // Healthcare-specific component types
    this.classifyHealthcareComponents(content, filename, result,)
  }

  private classifyHealthcareComponents(
    content: string,
    filename: string,
    result: React19ValidationResult,
  ): void {
    const healthcare = result.components.analysis.componentsByType.healthcare
    const lowerContent = content.toLowerCase()
    const lowerFilename = filename.toLowerCase()

    // Patient-related components
    if (lowerContent.includes('patient',) || lowerFilename.includes('patient',)) {
      healthcare.patientForms++
      result.components.analysis.healthcareComponents++
    }

    // Appointment scheduling components
    if (
      lowerContent.includes('appointment',) || lowerContent.includes('schedule',)
      || lowerFilename.includes('appointment',)
    ) {
      healthcare.appointmentSchedulers++
      result.components.analysis.healthcareComponents++
    }

    // Medical charts and data visualization
    if (
      lowerContent.includes('medical',) && lowerContent.includes('chart',)
      || lowerFilename.includes('medical',)
    ) {
      healthcare.medicalCharts++
      result.components.analysis.healthcareComponents++
    }

    // Prescription management
    if (
      lowerContent.includes('prescription',) || lowerContent.includes('medication',)
      || lowerFilename.includes('prescription',)
    ) {
      healthcare.prescriptionForms++
      result.components.analysis.healthcareComponents++
    }

    // Diagnostic displays
    if (
      lowerContent.includes('diagnosis',) || lowerContent.includes('diagnostic',)
      || lowerFilename.includes('diagnosis',)
    ) {
      healthcare.diagnosticDisplays++
      result.components.analysis.healthcareComponents++
    }

    // Healthcare provider components
    if (
      lowerContent.includes('doctor',) || lowerContent.includes('provider',)
      || lowerContent.includes('physician',)
    ) {
      healthcare.healthcareProviderComponents++
      result.components.analysis.healthcareComponents++
    }

    // Compliance components
    if (
      lowerContent.includes('consent',) || lowerContent.includes('privacy',)
      || lowerContent.includes('gdpr',) || lowerContent.includes('lgpd',)
    ) {
      healthcare.complianceComponents++
      result.components.analysis.healthcareComponents++
    }
  }
  private analyzeHealthcareComponentPatterns(
    content: string,
    filename: string,
    result: React19ValidationResult,
  ): void {
    // LGPD compliance patterns
    let lgpdCompliant = false
    let anvisaCompliant = false

    // Check for LGPD data protection patterns
    for (const pattern of this.healthcarePatterns.lgpd) {
      if (pattern.test(content,)) {
        lgpdCompliant = true
        break
      }
    }

    // Check for ANVISA healthcare regulation patterns
    for (const pattern of this.healthcarePatterns.anvisa) {
      if (pattern.test(content,)) {
        anvisaCompliant = true
        break
      }
    }

    // Update compliance counts
    if (lgpdCompliant) {
      result.components.healthcareCompliance.lgpdCompliant++
    }

    if (anvisaCompliant) {
      result.components.healthcareCompliance.anvisaCompliant++
    }

    // Check for healthcare-specific patterns
    this.identifyHealthcarePatterns(content, filename, result,)
  }

  private identifyHealthcarePatterns(
    content: string,
    filename: string,
    result: React19ValidationResult,
  ): void {
    const patterns = result.components.patterns

    // Recommended patterns
    if (content.includes('useForm',) || content.includes('react-hook-form',)) {
      patterns.recommended.push('React Hook Form for medical data collection',)
    }

    if (content.includes('ErrorBoundary',)) {
      patterns.recommended.push('Error boundaries for healthcare application stability',)
    }

    if (
      content.includes('memo(',) || content.includes('useCallback',) || content.includes('useMemo',)
    ) {
      patterns.recommended.push('Performance optimization for medical data processing',)
    }

    if (content.includes('Suspense',)) {
      patterns.recommended.push('Suspense for lazy loading healthcare modules',)
    }

    // Anti-patterns
    if (content.includes('dangerouslySetInnerHTML',)) {
      patterns.antipatterns.push('Dangerous HTML injection - security risk for healthcare data',)
      result.components.healthcareCompliance.securityIssues.push(
        `Dangerous HTML injection detected in ${filename}`,
      )
    }

    if (content.includes('eval(',) || content.includes('Function(',)) {
      patterns.antipatterns.push('Dynamic code execution - security risk for medical applications',)
      result.components.healthcareCompliance.securityIssues.push(
        `Dynamic code execution detected in ${filename}`,
      )
    }

    if (
      content.includes('console.log',) && !filename.includes('.dev.',)
      && !filename.includes('.debug.',)
    ) {
      patterns.antipatterns.push('Console logging in production - may leak patient data',)
    }

    // Healthcare-specific patterns
    if (content.includes('sanitize',) || content.includes('validate',)) {
      patterns.healthcareSpecific.push('Input sanitization for patient data safety',)
    }

    if (content.includes('encrypt',) || content.includes('decrypt',)) {
      patterns.healthcareSpecific.push('Data encryption for LGPD compliance',)
    }

    if (content.includes('audit',) || content.includes('log',)) {
      patterns.healthcareSpecific.push('Audit logging for healthcare compliance',)
    }

    if (content.includes('consent',) || content.includes('permission',)) {
      patterns.healthcareSpecific.push('Consent management for LGPD compliance',)
    }
  }

  private analyzeComponentSecurity(
    content: string,
    filename: string,
    result: React19ValidationResult,
  ): void {
    // Check for security patterns
    for (const pattern of this.healthcarePatterns.security) {
      if (pattern.test(content,)) {
        result.hooks.securityPatterns.dataValidation++
      }
    }

    // Check for potential security issues
    const securityIssues = []

    // XSS vulnerabilities
    if (content.includes('innerHTML',) || content.includes('dangerouslySetInnerHTML',)) {
      securityIssues.push('Potential XSS vulnerability through HTML injection',)
    }

    // Unsafe references
    if (content.includes('window.',) && !content.includes('window.location',)) {
      securityIssues.push('Direct window object access - potential security risk',)
    }

    // External script loading
    if (content.includes('script',) && content.includes('src=',)) {
      securityIssues.push('External script loading detected - verify source integrity',)
    }

    // Insecure storage
    if (content.includes('localStorage',) || content.includes('sessionStorage',)) {
      if (this.containsSensitiveData(content,)) {
        securityIssues.push('Potential sensitive data storage in browser storage',)
      }
    }

    // Add issues to result
    result.components.healthcareCompliance.securityIssues.push(...securityIssues,)
  }

  private containsSensitiveData(content: string,): boolean {
    const sensitivePatterns = [
      /patient.*id|cpf|rg|medical.*record/i,
      /password|token|secret|key/i,
      /credit.*card|payment|billing/i,
      /social.*security|ssn|tax.*id/i,
      /health.*information|medical.*data/i,
    ]

    return sensitivePatterns.some(pattern => pattern.test(content,))
  }

  private analyzeComponentAccessibility(
    content: string,
    filename: string,
    result: React19ValidationResult,
  ): void {
    const a11y = result.accessibility.analysis

    // ARIA attributes
    const ariaMatches = content.match(/aria-\w+/g,) || []
    a11y.ariaAttributes += ariaMatches.length

    // Keyboard navigation
    if (
      content.includes('onKeyDown',) || content.includes('onKeyUp',)
      || content.includes('tabIndex',)
    ) {
      a11y.keyboardNavigation++
    }

    // Screen reader support
    if (
      content.includes('aria-label',) || content.includes('aria-describedby',)
      || content.includes('role=',)
    ) {
      a11y.screenReaderSupport++
    }

    // Color contrast considerations
    if (content.includes('color',) && content.includes('contrast',)) {
      a11y.colorContrast++
    }

    // Healthcare accessibility patterns
    this.analyzeHealthcareAccessibility(content, filename, result,)

    // Check for accessibility compliance
    if (ariaMatches.length > 0 || content.includes('role=',)) {
      a11y.a11yCompliant++
      result.components.analysis.accessibleComponents++
    }
  }

  private analyzeHealthcareAccessibility(
    content: string,
    filename: string,
    result: React19ValidationResult,
  ): void {
    const healthcareA11y = result.accessibility.healthcare

    // Medical form accessibility
    if (
      (content.includes('form',) || content.includes('input',))
      && this.isHealthcareComponent(content,)
    ) {
      healthcareA11y.medicalFormAccessibility++
    }

    // Patient data accessibility
    if (
      content.includes('patient',) && (content.includes('aria-',) || content.includes('role=',))
    ) {
      healthcareA11y.patientDataAccessibility++
    }

    // Emergency accessibility
    if (content.includes('emergency',) || content.includes('urgent',)) {
      healthcareA11y.emergencyAccessibility++
    }

    // Assistive technology support
    if (
      content.includes('screen',) && content.includes('reader',)
      || content.includes('assistive',)
      || content.includes('voice',)
    ) {
      healthcareA11y.assistiveTechnologySupport++
    }
  }

  private isHealthcareComponent(content: string,): boolean {
    const healthcareKeywords = [
      'patient',
      'medical',
      'health',
      'clinic',
      'appointment',
      'prescription',
      'diagnosis',
      'treatment',
      'doctor',
      'nurse',
    ]

    const lowerContent = content.toLowerCase()
    return healthcareKeywords.some(keyword => lowerContent.includes(keyword,))
  }

  private analyzeComponentPerformance(
    content: string,
    filename: string,
    result: React19ValidationResult,
  ): void {
    const react19Perf = result.performance.react19

    // React 19 concurrent features
    if (content.includes('useTransition',)) {
      react19Perf.concurrentFeatures.useTransition++
    }

    if (content.includes('useDeferredValue',)) {
      react19Perf.concurrentFeatures.useDeferredValue++
    }

    if (content.includes('startTransition',)) {
      react19Perf.concurrentFeatures.startTransition++
    }

    // Suspense usage
    if (content.includes('Suspense',)) {
      react19Perf.suspense.suspenseComponents++
      if (this.isHealthcareComponent(content,)) {
        react19Perf.suspense.healthcareSuspense++
      }
    }

    // Lazy loading
    if (content.includes('lazy(',) || content.includes('React.lazy',)) {
      react19Perf.lazyLoading.lazyComponents++
      if (this.isHealthcareComponent(content,)) {
        react19Perf.lazyLoading.healthcareLazyLoading++
      }
    }

    // Dynamic imports
    if (content.includes('import(',)) {
      react19Perf.lazyLoading.dynamicImports++
    }

    // Memoization
    if (content.includes('useMemo',)) {
      react19Perf.memoization.useMemo++
      if (this.isHealthcareComponent(content,)) {
        react19Perf.memoization.healthcareOptimizedMemoization++
      }
    }

    if (content.includes('useCallback',)) {
      react19Perf.memoization.useCallback++
    }

    if (content.includes('memo(',) || content.includes('React.memo',)) {
      react19Perf.memoization.reactMemo++
    }

    // Check for unnecessary memoization
    if (
      (content.includes('useMemo',) || content.includes('useCallback',))
      && !this.hasComplexLogic(content,)
    ) {
      react19Perf.memoization.unnecessaryMemoization++
    }
  }

  private hasComplexLogic(content: string,): boolean {
    // Simple heuristic to detect complex logic that benefits from memoization
    const complexityIndicators = [
      /for\s*\(/g,
      /while\s*\(/g,
      /\.map\(/g,
      /\.filter\(/g,
      /\.reduce\(/g,
      /\.sort\(/g,
      /Math\./g,
      /JSON\./g,
    ]

    return complexityIndicators.some(pattern => pattern.test(content,))
  }

  private assessHealthcareComponentCompliance(result: React19ValidationResult,): void {
    const compliance = result.components.healthcareCompliance
    const analysis = result.components.analysis

    // Generate recommendations based on analysis
    if (analysis.healthcareComponents === 0) {
      compliance.recommendations.push(
        'No healthcare-specific components detected - consider implementing medical data components',
      )
    }

    if (compliance.lgpdCompliant < analysis.healthcareComponents * 0.8) {
      compliance.recommendations.push('Improve LGPD compliance in healthcare components',)
    }

    if (compliance.anvisaCompliant < analysis.healthcareComponents * 0.6) {
      compliance.recommendations.push(
        'Implement ANVISA-compliant healthcare workflows in components',
      )
    }

    if (compliance.securityIssues.length > 0) {
      compliance.recommendations.push('Address security issues in healthcare components',)
    }

    if (analysis.errorBoundaryComponents < analysis.healthcareComponents * 0.5) {
      compliance.recommendations.push('Add error boundaries for healthcare component stability',)
    }

    if (analysis.accessibleComponents < analysis.healthcareComponents * 0.7) {
      compliance.recommendations.push('Improve accessibility compliance for healthcare components',)
    }
  }

  private generateComponentPatternRecommendations(result: React19ValidationResult,): void {
    const patterns = result.components.patterns
    const analysis = result.components.analysis

    // Performance recommendations
    if (analysis.memoizedComponents < analysis.totalComponents * 0.3) {
      patterns.recommended.push(
        'Consider memoizing more components for healthcare data processing performance',
      )
    }

    // Security recommendations
    if (result.components.healthcareCompliance.securityIssues.length > 0) {
      patterns.recommended.push('Implement security patterns for healthcare data protection',)
    }

    // Healthcare-specific recommendations
    if (
      analysis.componentsByType.healthcare.patientForms === 0 && analysis.componentsByType.forms > 0
    ) {
      patterns.healthcareSpecific.push('Consider implementing patient-specific form components',)
    }

    if (analysis.componentsByType.healthcare.complianceComponents === 0) {
      patterns.healthcareSpecific.push(
        'Implement consent management components for LGPD compliance',
      )
    }

    // Error handling recommendations
    if (analysis.errorBoundaryComponents === 0) {
      patterns.recommended.push(
        'Implement error boundaries for healthcare application reliability',
      )
    }

    // Accessibility recommendations
    if (analysis.accessibleComponents < analysis.totalComponents * 0.5) {
      patterns.recommended.push('Improve accessibility compliance for healthcare user interfaces',)
    }
  }

  private async analyzeHooks(projectPath: string, result: React19ValidationResult,): Promise<void> {
    console.log('🎣 Analyzing React hooks usage for healthcare data handling...',)

    // Find all React files for hook analysis
    const reactFiles = await this.findComponentFiles(projectPath,)

    // Analyze hooks in each file
    for (const file of reactFiles) {
      await this.analyzeHooksInFile(file, result,)
    }

    // Analyze custom hooks
    await this.analyzeCustomHooks(projectPath, result,)

    // Assess healthcare hook compliance
    this.assessHealthcareHookCompliance(result,)
  }

  private async analyzeHooksInFile(
    filePath: string,
    result: React19ValidationResult,
  ): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf-8',)
      const filename = filePath.split('/',).pop() || ''

      // Count built-in hooks
      this.countBuiltInHooks(content, result,)

      // Analyze healthcare-specific hook patterns
      this.analyzeHealthcareHookPatterns(content, filename, result,)

      // Check hook security patterns
      this.analyzeHookSecurityPatterns(content, result,)
    } catch (error) {
      result.hooks.analysis.complianceIssues.push(`Failed to analyze hooks in ${filePath}`,)
    }
  }

  private countBuiltInHooks(content: string, result: React19ValidationResult,): void {
    const builtInHooks = [
      'useState',
      'useEffect',
      'useContext',
      'useReducer',
      'useMemo',
      'useCallback',
      'useRef',
      'useImperativeHandle',
      'useLayoutEffect',
      'useDebugValue',
      'useTransition',
      'useDeferredValue',
      'useId',
      'useSyncExternalStore',
    ]

    for (const hook of builtInHooks) {
      const matches = content.match(new RegExp(`\\b${hook}\\b`, 'g',),) || []
      result.hooks.analysis.builtInHooks[hook] = (result.hooks.analysis.builtInHooks[hook] || 0)
        + matches.length
      result.hooks.analysis.totalHooks += matches.length

      // React 19 specific hooks
      if (
        ['useTransition', 'useDeferredValue', 'useId', 'useSyncExternalStore',].includes(hook,)
        && matches.length > 0
      ) {
        result.performance.react19.concurrentFeatures.concurrent = true
        if (this.isHealthcareComponent(content,)) {
          result.performance.react19.concurrentFeatures.healthcareOptimized = true
        }
      }

      // Performance hooks
      if (
        ['useMemo', 'useCallback', 'useTransition', 'useDeferredValue',].includes(hook,)
        && matches.length > 0
      ) {
        result.hooks.analysis.performanceHooks.push(hook,)
      }
    }
  }

  private analyzeHealthcareHookPatterns(
    content: string,
    filename: string,
    result: React19ValidationResult,
  ): void {
    const healthcareHooks = result.hooks.healthcareHooks

    // Patient data hooks
    if (
      content.includes('patient',)
      && (content.includes('useState',) || content.includes('useEffect',))
    ) {
      healthcareHooks.patientDataHooks.push(filename,)
    }

    // Appointment hooks
    if (content.includes('appointment',) || content.includes('schedule',)) {
      if (content.includes('use',)) {
        healthcareHooks.appointmentHooks.push(filename,)
      }
    }

    // Medical record hooks
    if (content.includes('medical',) && content.includes('record',)) {
      if (content.includes('use',)) {
        healthcareHooks.medicalRecordHooks.push(filename,)
      }
    }

    // Compliance hooks
    if (
      content.includes('consent',) || content.includes('privacy',) || content.includes('lgpd',)
      || content.includes('gdpr',)
    ) {
      healthcareHooks.complianceHooks.push(filename,)
    }

    // Add to general healthcare hooks list
    if (this.isHealthcareComponent(content,) && content.includes('use',)) {
      result.hooks.analysis.healthcareHooks.push(filename,)
    }
  }

  private analyzeHookSecurityPatterns(content: string, result: React19ValidationResult,): void {
    const securityPatterns = result.hooks.securityPatterns

    // Data validation patterns
    if (
      content.includes('validate',) || content.includes('schema',) || content.includes('yup',)
      || content.includes('joi',)
    ) {
      securityPatterns.dataValidation++
    }

    // Sanitization patterns
    if (
      content.includes('sanitize',) || content.includes('escape',) || content.includes('clean',)
    ) {
      securityPatterns.sanitization++
    }

    // Authorization patterns
    if (content.includes('auth',) || content.includes('permission',) || content.includes('role',)) {
      securityPatterns.authorization++
    }

    // Audit logging patterns
    if (content.includes('audit',) || content.includes('log',) || content.includes('track',)) {
      securityPatterns.auditLogging++
    }

    // Security hooks
    if (
      content.includes('use',)
      && (content.includes('auth',) || content.includes('security',)
        || content.includes('validate',))
    ) {
      result.hooks.analysis.securityHooks.push('Security hook pattern detected',)
    }
  }
  private async analyzeCustomHooks(
    projectPath: string,
    result: React19ValidationResult,
  ): Promise<void> {
    // Look for custom hooks in hooks directory
    const hooksDir = join(projectPath, 'src/hooks',)

    try {
      await access(hooksDir, constants.F_OK,)
      await this.analyzeHooksDirectory(hooksDir, result,)
    } catch (error) {
      // Hooks directory doesn't exist, look in components
    }

    // Look for custom hooks in component files
    const componentFiles = await this.findComponentFiles(projectPath,)
    for (const file of componentFiles) {
      await this.findCustomHooksInFile(file, result,)
    }
  }

  private async analyzeHooksDirectory(
    hooksDir: string,
    result: React19ValidationResult,
  ): Promise<void> {
    try {
      const files = await readdir(hooksDir, { withFileTypes: true, },)

      for (const file of files) {
        if (file.isFile() && this.isReactFile(file.name,)) {
          const filePath = join(hooksDir, file.name,)
          await this.analyzeCustomHookFile(filePath, result,)
          result.performance.filesProcessed++
        }
      }
    } catch (error) {
      result.hooks.analysis.complianceIssues.push('Failed to analyze hooks directory',)
    }
  }

  private async analyzeCustomHookFile(
    filePath: string,
    result: React19ValidationResult,
  ): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf-8',)
      const filename = filePath.split('/',).pop() || ''

      // Find custom hooks (functions starting with 'use')
      const customHookMatches = content.match(/export\s+(?:const|function)\s+use[A-Z]\w*/g,) || []

      for (const match of customHookMatches) {
        const hookName = match.replace(/export\s+(?:const|function)\s+/, '',)

        const customHook: CustomHookAnalysis = {
          name: hookName,
          file: filename,
          usageCount: 0, // Would need cross-file analysis to determine actual usage
          isHealthcareRelated: this.isHealthcareComponent(content,),
          hasSecurityImplications: this.hasSecurityImplications(content,),
          hasPerformanceOptimizations: this.hasPerformanceOptimizations(content,),
          lgpdCompliant: this.isLGPDCompliant(content,),
        }

        result.hooks.analysis.customHooks.push(customHook,)
      }
    } catch (error) {
      result.hooks.analysis.complianceIssues.push(
        `Failed to analyze custom hook file: ${filePath}`,
      )
    }
  }

  private async findCustomHooksInFile(
    filePath: string,
    result: React19ValidationResult,
  ): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf-8',)
      const filename = filePath.split('/',).pop() || ''

      // Look for inline custom hooks
      const inlineHookMatches = content.match(/const\s+use[A-Z]\w*\s*=/g,) || []

      for (const match of inlineHookMatches) {
        const hookName = match.replace(/const\s+/, '',).replace(/\s*=/, '',)

        const customHook: CustomHookAnalysis = {
          name: hookName,
          file: filename,
          usageCount: 1, // At least used once in the same file
          isHealthcareRelated: this.isHealthcareComponent(content,),
          hasSecurityImplications: this.hasSecurityImplications(content,),
          hasPerformanceOptimizations: this.hasPerformanceOptimizations(content,),
          lgpdCompliant: this.isLGPDCompliant(content,),
        }

        result.hooks.analysis.customHooks.push(customHook,)
      }
    } catch (error) {
      // Continue silently for component files
    }
  }

  private hasSecurityImplications(content: string,): boolean {
    const securityPatterns = [
      /auth|authenticate|authorize/i,
      /encrypt|decrypt|hash|crypto/i,
      /sanitize|validate|escape/i,
      /token|jwt|session/i,
      /permission|role|access/i,
    ]

    return securityPatterns.some(pattern => pattern.test(content,))
  }

  private hasPerformanceOptimizations(content: string,): boolean {
    const performancePatterns = [
      /useMemo|useCallback/i,
      /debounce|throttle/i,
      /virtualize|lazy|defer/i,
      /cache|memoize/i,
      /optimize|performance/i,
    ]

    return performancePatterns.some(pattern => pattern.test(content,))
  }

  private isLGPDCompliant(content: string,): boolean {
    const lgpdPatterns = [
      /consent|consentimento/i,
      /privacy|privacidade/i,
      /data.*protection|protecao.*dados/i,
      /audit|auditoria/i,
      /anonymize|anonimizar/i,
    ]

    return lgpdPatterns.some(pattern => pattern.test(content,))
  }

  private assessHealthcareHookCompliance(result: React19ValidationResult,): void {
    const analysis = result.hooks.analysis
    const healthcareHooks = result.hooks.healthcareHooks

    // Assess custom hook compliance
    const healthcareCustomHooks = analysis.customHooks.filter(hook => hook.isHealthcareRelated)
    const lgpdCompliantHooks = analysis.customHooks.filter(hook => hook.lgpdCompliant)
    const securityHooks = analysis.customHooks.filter(hook => hook.hasSecurityImplications)

    // Generate compliance issues
    if (healthcareCustomHooks.length > 0 && lgpdCompliantHooks.length === 0) {
      analysis.complianceIssues.push('Healthcare custom hooks lack LGPD compliance measures',)
    }

    if (analysis.customHooks.length > 0 && securityHooks.length === 0) {
      analysis.complianceIssues.push('No security-focused custom hooks detected',)
    }

    if (
      healthcareHooks.patientDataHooks.length > 0
      && result.hooks.securityPatterns.dataValidation === 0
    ) {
      analysis.complianceIssues.push('Patient data hooks lack proper validation patterns',)
    }

    // Performance hook assessment
    const totalHooks = analysis.totalHooks
    const performanceHooks = analysis.performanceHooks.length

    if (totalHooks > 50 && performanceHooks < totalHooks * 0.2) {
      analysis.complianceIssues.push(
        'Consider more performance optimization hooks for healthcare data processing',
      )
    }
  }

  private async analyzeStateManagement(
    projectPath: string,
    result: React19ValidationResult,
  ): Promise<void> {
    console.log('🗂️ Analyzing state management patterns for healthcare data flow...',)

    // Find all React files for state management analysis
    const reactFiles = await this.findComponentFiles(projectPath,)

    // Analyze state patterns in each file
    for (const file of reactFiles) {
      await this.analyzeStateInFile(file, result,)
    }

    // Look for context providers
    await this.analyzeContextUsage(projectPath, result,)

    // Look for reducers
    await this.analyzeReducerUsage(projectPath, result,)

    // Assess healthcare data flow
    this.assessHealthcareDataFlow(result,)

    // Assess LGPD compliance in state management
    this.assessLGPDStateCompliance(result,)
  }

  private async analyzeStateInFile(
    filePath: string,
    result: React19ValidationResult,
  ): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf-8',)

      // Count state patterns
      this.countStatePatterns(content, result,)

      // Analyze healthcare data handling patterns
      this.analyzeHealthcareDataHandling(content, filePath, result,)

      // Check for security patterns in state management
      this.analyzeStateSecurityPatterns(content, result,)
    } catch (error) {
      // Continue silently for files that can't be read
    }
  }

  private countStatePatterns(content: string, result: React19ValidationResult,): void {
    const stateAnalysis = result.stateManagement.analysis

    // useState pattern
    const useStateMatches = content.match(/useState/g,) || []
    this.updateStatePattern(stateAnalysis, 'useState', useStateMatches.length, content,)

    // useReducer pattern
    const useReducerMatches = content.match(/useReducer/g,) || []
    this.updateStatePattern(stateAnalysis, 'useReducer', useReducerMatches.length, content,)

    // useContext pattern
    const useContextMatches = content.match(/useContext/g,) || []
    this.updateStatePattern(stateAnalysis, 'useContext', useContextMatches.length, content,)

    // External state management (Redux, Zustand, etc.)
    const externalStatePatterns = [
      /useSelector|useDispatch/g, // Redux
      /useStore/g, // Zustand
      /useAtom/g, // Jotai
      /useRecoilState/g, // Recoil
    ]

    let externalStateCount = 0
    for (const pattern of externalStatePatterns) {
      const matches = content.match(pattern,) || []
      externalStateCount += matches.length
    }

    if (externalStateCount > 0) {
      this.updateStatePattern(stateAnalysis, 'external', externalStateCount, content,)
    }
  }

  private updateStatePattern(
    stateAnalysis: StateManagementAnalysis,
    type: 'useState' | 'useReducer' | 'useContext' | 'external',
    count: number,
    content: string,
  ): void {
    let pattern = stateAnalysis.patterns.find(p => p.type === type)

    if (!pattern) {
      pattern = {
        type,
        count: 0,
        healthcareRelated: 0,
        sensitiveDataHandling: 0,
      }
      stateAnalysis.patterns.push(pattern,)
    }

    pattern.count += count

    if (this.isHealthcareComponent(content,)) {
      pattern.healthcareRelated += count
    }

    if (this.containsSensitiveData(content,)) {
      pattern.sensitiveDataHandling += count
    }
  }

  private analyzeHealthcareDataHandling(
    content: string,
    filePath: string,
    result: React19ValidationResult,
  ): void {
    const healthcareDataHandling = result.stateManagement.analysis.healthcareDataHandling

    // Patient data handling patterns
    if (
      content.includes('patient',)
      && (content.includes('useState',) || content.includes('useReducer',))
    ) {
      const pattern: HealthcareDataPattern = {
        pattern: 'Patient Data State Management',
        description: 'State management for patient information',
        files: [filePath,],
        lgpdCompliant: this.isLGPDCompliant(content,),
        anvisaCompliant: this.isANVISACompliant(content,),
        securityIssues: this.findSecurityIssues(content,),
      }

      healthcareDataHandling.push(pattern,)
      result.stateManagement.healthcareDataFlow.patientDataFlow = true
    }

    // Medical record handling
    if (content.includes('medical',) && content.includes('record',)) {
      const pattern: HealthcareDataPattern = {
        pattern: 'Medical Record State Management',
        description: 'State management for medical records',
        files: [filePath,],
        lgpdCompliant: this.isLGPDCompliant(content,),
        anvisaCompliant: this.isANVISACompliant(content,),
        securityIssues: this.findSecurityIssues(content,),
      }

      healthcareDataHandling.push(pattern,)
      result.stateManagement.healthcareDataFlow.medicalRecordFlow = true
    }

    // Appointment handling
    if (content.includes('appointment',) || content.includes('schedule',)) {
      result.stateManagement.healthcareDataFlow.appointmentFlow = true
    }

    // Compliance handling
    if (content.includes('consent',) || content.includes('privacy',)) {
      result.stateManagement.healthcareDataFlow.complianceFlow = true
    }
  }

  private isANVISACompliant(content: string,): boolean {
    const anvisaPatterns = [
      /prescription|medication/i,
      /healthcare.*provider|profissional.*saude/i,
      /regulatory.*compliance|conformidade.*regulatoria/i,
      /audit.*trail|trilha.*auditoria/i,
    ]

    return anvisaPatterns.some(pattern => pattern.test(content,))
  }

  private findSecurityIssues(content: string,): string[] {
    const issues = []

    if (content.includes('localStorage',) && this.containsSensitiveData(content,)) {
      issues.push('Sensitive data stored in localStorage',)
    }

    if (content.includes('console.log',) && this.containsSensitiveData(content,)) {
      issues.push('Potential sensitive data logging',)
    }

    if (!content.includes('validate',) && this.containsSensitiveData(content,)) {
      issues.push('Missing data validation for sensitive information',)
    }

    return issues
  }

  private analyzeStateSecurityPatterns(content: string, result: React19ValidationResult,): void {
    const securityPatterns = result.stateManagement.analysis.securityPatterns

    if (content.includes('validate',) || content.includes('schema',)) {
      const pattern: SecurityPattern = {
        type: 'validation',
        implementation: 'Data validation in state management',
        healthcareRelevant: this.isHealthcareComponent(content,),
        effectiveness: this.assessSecurityEffectiveness(content, 'validation',),
      }
      securityPatterns.push(pattern,)
    }

    if (content.includes('sanitize',) || content.includes('escape',)) {
      const pattern: SecurityPattern = {
        type: 'sanitization',
        implementation: 'Data sanitization in state updates',
        healthcareRelevant: this.isHealthcareComponent(content,),
        effectiveness: this.assessSecurityEffectiveness(content, 'sanitization',),
      }
      securityPatterns.push(pattern,)
    }

    if (content.includes('encrypt',) || content.includes('hash',)) {
      const pattern: SecurityPattern = {
        type: 'encryption',
        implementation: 'Data encryption in state management',
        healthcareRelevant: this.isHealthcareComponent(content,),
        effectiveness: this.assessSecurityEffectiveness(content, 'encryption',),
      }
      securityPatterns.push(pattern,)
    }

    if (content.includes('auth',) || content.includes('permission',)) {
      const pattern: SecurityPattern = {
        type: 'authorization',
        implementation: 'Authorization checks in state access',
        healthcareRelevant: this.isHealthcareComponent(content,),
        effectiveness: this.assessSecurityEffectiveness(content, 'authorization',),
      }
      securityPatterns.push(pattern,)
    }
  }

  private assessSecurityEffectiveness(content: string, type: string,): 'low' | 'medium' | 'high' {
    const effectivenessFactors = {
      validation: ['schema', 'strict', 'comprehensive',],
      sanitization: ['dompurify', 'escape', 'clean',],
      encryption: ['aes', 'strong', 'key',],
      authorization: ['role', 'permission', 'access',],
    }

    const factors = effectivenessFactors[type as keyof typeof effectivenessFactors] || []
    const matchingFactors = factors.filter(factor => content.toLowerCase().includes(factor,))

    if (matchingFactors.length >= 2) return 'high'
    if (matchingFactors.length === 1) return 'medium'
    return 'low'
  }

  private async analyzeContextUsage(
    projectPath: string,
    result: React19ValidationResult,
  ): Promise<void> {
    // Look for context providers
    const contextFiles = await this.findFilesWithPattern(projectPath, /createContext|useContext/,)

    for (const file of contextFiles) {
      await this.analyzeContextFile(file, result,)
    }
  }

  private async findFilesWithPattern(projectPath: string, pattern: RegExp,): Promise<string[]> {
    const matchingFiles: string[] = []
    const allFiles = await this.findComponentFiles(projectPath,)

    for (const file of allFiles) {
      try {
        const content = await readFile(file, 'utf-8',)
        if (pattern.test(content,)) {
          matchingFiles.push(file,)
        }
      } catch (error) {
        // Continue silently
      }
    }

    return matchingFiles
  }

  private async analyzeContextFile(
    filePath: string,
    result: React19ValidationResult,
  ): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf-8',)
      const filename = filePath.split('/',).pop() || ''

      // Find context definitions
      const contextMatches = content.match(/createContext\s*\(/g,) || []

      for (const match of contextMatches) {
        const contextUsage: ContextUsage = {
          name: this.extractContextName(content, match,),
          file: filename,
          consumers: this.countContextConsumers(content,),
          isHealthcareContext: this.isHealthcareComponent(content,),
          hasSecurityMeasures: this.hasSecurityImplications(content,),
          lgpdCompliant: this.isLGPDCompliant(content,),
        }

        result.stateManagement.analysis.contextUsage.push(contextUsage,)
      }
    } catch (error) {
      // Continue silently
    }
  }

  private extractContextName(content: string, match: string,): string {
    // Simple heuristic to extract context name
    const beforeMatch = content.substring(0, content.indexOf(match,),)
    const nameMatch = beforeMatch.match(/(\w+Context)\s*=\s*$/,)
    return nameMatch ? nameMatch[1] : 'UnknownContext'
  }

  private countContextConsumers(content: string,): number {
    const consumerMatches = content.match(/useContext\s*\(/g,) || []
    return consumerMatches.length
  }

  private async analyzeReducerUsage(
    projectPath: string,
    result: React19ValidationResult,
  ): Promise<void> {
    // Look for reducer files
    const reducerFiles = await this.findFilesWithPattern(projectPath, /useReducer|reducer/,)

    for (const file of reducerFiles) {
      await this.analyzeReducerFile(file, result,)
    }
  }

  private async analyzeReducerFile(
    filePath: string,
    result: React19ValidationResult,
  ): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf-8',)
      const filename = filePath.split('/',).pop() || ''

      // Find reducer definitions
      const reducerMatches = content.match(/useReducer\s*\(/g,) || []

      if (reducerMatches.length > 0) {
        const reducerUsage: ReducerUsage = {
          name: this.extractReducerName(content,),
          file: filename,
          actions: this.extractReducerActions(content,),
          isHealthcareReducer: this.isHealthcareComponent(content,),
          hasAuditLogging: content.includes('audit',) || content.includes('log',),
          immutableUpdates: this.hasImmutableUpdates(content,),
        }

        result.stateManagement.analysis.reducerUsage.push(reducerUsage,)
      }
    } catch (error) {
      // Continue silently
    }
  }

  private extractReducerName(content: string,): string {
    const nameMatch = content.match(/(\w+Reducer)/,)
    return nameMatch ? nameMatch[1] : 'UnknownReducer'
  }

  private extractReducerActions(content: string,): string[] {
    const actionMatches = content.match(/case\s+['"`]([^'"`]+)['"`]/g,) || []
    return actionMatches.map(match => match.replace(/case\s+['"`]/, '',).replace(/['"`]/, '',))
  }

  private hasImmutableUpdates(content: string,): boolean {
    return content.includes('...',) || content.includes('spread',)
      || content.includes('immer',) || content.includes('immutable',)
  }
  private assessHealthcareDataFlow(result: React19ValidationResult,): void {
    const dataFlow = result.stateManagement.healthcareDataFlow
    const analysis = result.stateManagement.analysis

    // Check for comprehensive healthcare data flow
    const healthcarePatterns = analysis.healthcareDataHandling
    const hasPatientFlow = healthcarePatterns.some(p => p.pattern.includes('Patient',))
    const hasMedicalFlow = healthcarePatterns.some(p => p.pattern.includes('Medical',))
    const hasComplianceFlow = analysis.securityPatterns.some(p => p.type === 'authorization')
    const hasSecurityFlow = analysis.securityPatterns.length > 0

    // Update data flow status
    dataFlow.patientDataFlow = hasPatientFlow
    dataFlow.medicalRecordFlow = hasMedicalFlow
    dataFlow.complianceFlow = hasComplianceFlow
    dataFlow.securityFlow = hasSecurityFlow

    // Add performance optimizations based on data patterns
    if (hasPatientFlow || hasMedicalFlow) {
      result.stateManagement.analysis.performanceOptimizations.push(
        'Healthcare data flow optimization needed',
      )
    }

    if (analysis.patterns.some(p => p.sensitiveDataHandling > 0)) {
      result.stateManagement.analysis.performanceOptimizations.push(
        'Sensitive data handling patterns detected',
      )
    }
  }

  private assessLGPDStateCompliance(result: React19ValidationResult,): void {
    const lgpdCompliance = result.stateManagement.lgpdCompliance
    const analysis = result.stateManagement.analysis

    // Data minimization assessment
    const totalStates = analysis.patterns.reduce((sum, p,) => sum + p.count, 0,)
    const sensitiveStates = analysis.patterns.reduce((sum, p,) => sum + p.sensitiveDataHandling, 0,)

    if (totalStates > 0) {
      const sensitiveRatio = sensitiveStates / totalStates
      lgpdCompliance.dataMinimization = sensitiveRatio < 0.3 // Less than 30% sensitive data
    }

    // Consent management assessment
    lgpdCompliance.consentManagement = analysis.contextUsage.some(c =>
      c.name.toLowerCase().includes('consent',)
      || c.name.toLowerCase().includes('privacy',)
    )

    // Right to erasure assessment
    lgpdCompliance.rightToErasure = analysis.reducerUsage.some(r =>
      r.actions.some(action =>
        action.toLowerCase().includes('delete',)
        || action.toLowerCase().includes('remove',)
        || action.toLowerCase().includes('clear',)
      )
    )

    // Audit trail assessment
    lgpdCompliance.auditTrail = analysis.reducerUsage.some(r => r.hasAuditLogging)
      || analysis.securityPatterns.some(p => p.implementation.includes('audit',))

    // Calculate LGPD compliance score
    const complianceFactors = [
      lgpdCompliance.dataMinimization,
      lgpdCompliance.consentManagement,
      lgpdCompliance.rightToErasure,
      lgpdCompliance.auditTrail,
    ]

    const compliantFactors = complianceFactors.filter(Boolean,).length
    lgpdCompliance.score = (compliantFactors / complianceFactors.length) * 100
  }

  private async analyzePerformanceFeatures(
    projectPath: string,
    result: React19ValidationResult,
  ): Promise<void> {
    console.log('⚡ Analyzing React 19 performance features for healthcare optimization...',)

    // Analyze concurrent features usage
    await this.analyzeConcurrentFeatures(projectPath, result,)

    // Analyze Suspense usage
    await this.analyzeSuspenseFeatures(projectPath, result,)

    // Assess healthcare performance optimizations
    this.assessHealthcarePerformanceOptimizations(result,)

    // Generate performance recommendations
    this.generatePerformanceRecommendations(result,)
  }

  private async analyzeConcurrentFeatures(
    projectPath: string,
    result: React19ValidationResult,
  ): Promise<void> {
    const reactFiles = await this.findComponentFiles(projectPath,)
    const concurrent = result.performance.react19.concurrentFeatures

    for (const file of reactFiles) {
      try {
        const content = await readFile(file, 'utf-8',)

        // Count concurrent features usage
        const useTransitionMatches = content.match(/useTransition/g,) || []
        concurrent.useTransition += useTransitionMatches.length

        const useDeferredMatches = content.match(/useDeferredValue/g,) || []
        concurrent.useDeferredValue += useDeferredMatches.length

        const startTransitionMatches = content.match(/startTransition/g,) || []
        concurrent.startTransition += startTransitionMatches.length

        // Check if concurrent features are used in healthcare contexts
        if (
          this.isHealthcareComponent(content,)
          && (useTransitionMatches.length > 0 || useDeferredMatches.length > 0
            || startTransitionMatches.length > 0)
        ) {
          concurrent.healthcareOptimized = true
        }

        // Detect concurrent mode usage
        if (
          content.includes('concurrent',) || useTransitionMatches.length > 0
          || useDeferredMatches.length > 0
        ) {
          concurrent.concurrent = true
        }

        // Check for potential issues
        if (useTransitionMatches.length > 0 && !content.includes('isPending',)) {
          concurrent.issues.push(
            `useTransition without isPending check in ${file.split('/',).pop()}`,
          )
        }
      } catch (error) {
        concurrent.issues.push(`Failed to analyze concurrent features in ${file}`,)
      }
    }
  }

  private async analyzeSuspenseFeatures(
    projectPath: string,
    result: React19ValidationResult,
  ): Promise<void> {
    const reactFiles = await this.findComponentFiles(projectPath,)
    const suspense = result.performance.react19.suspense

    for (const file of reactFiles) {
      try {
        const content = await readFile(file, 'utf-8',)

        // Count Suspense usage
        const suspenseMatches = content.match(/<Suspense|React\.Suspense/g,) || []
        suspense.suspenseComponents += suspenseMatches.length

        // Count lazy components
        const lazyMatches = content.match(/React\.lazy|lazy\(/g,) || []
        suspense.lazyComponents += lazyMatches.length

        // Count error boundaries
        const errorBoundaryMatches = content.match(/ErrorBoundary|componentDidCatch/g,) || []
        suspense.errorBoundaries += errorBoundaryMatches.length

        // Check healthcare Suspense usage
        if (this.isHealthcareComponent(content,) && suspenseMatches.length > 0) {
          suspense.healthcareSuspense++
        }

        // Extract fallback patterns
        const fallbackMatches = content.match(/fallback=\{([^}]+)\}/g,) || []
        for (const match of fallbackMatches) {
          const fallback = match.replace(/fallback=\{/, '',).replace(/\}$/, '',)
          if (!suspense.fallbackPatterns.includes(fallback,)) {
            suspense.fallbackPatterns.push(fallback,)
          }
        }
      } catch (error) {
        // Continue silently
      }
    }
  }

  private assessHealthcarePerformanceOptimizations(result: React19ValidationResult,): void {
    const healthcare = result.performance.healthcare
    const react19 = result.performance.react19

    // Check for clinic network optimizations
    if (
      react19.lazyLoading.healthcareLazyLoading > 0
      || react19.suspense.healthcareSuspense > 0
    ) {
      healthcare.clinicNetworkOptimized = true

      const optimization: HealthcarePerformanceOptimization = {
        type: 'Network Optimization',
        description: 'Lazy loading and Suspense for clinic network conditions',
        implementation: 'React 19 concurrent features',
        impact: 'high',
        compliance: 'both',
      }
      healthcare.optimizations.push(optimization,)
    }

    // Check for mobile optimizations
    if (react19.memoization.healthcareOptimizedMemoization > 0) {
      healthcare.mobileOptimized = true

      const optimization: HealthcarePerformanceOptimization = {
        type: 'Mobile Optimization',
        description: 'Memoization for healthcare mobile interfaces',
        implementation: 'React memoization patterns',
        impact: 'medium',
        compliance: 'lgpd',
      }
      healthcare.optimizations.push(optimization,)
    }

    // Check for offline capability
    if (
      react19.suspense.suspenseComponents > 0
      && react19.lazyLoading.lazyComponents > 0
    ) {
      healthcare.offlineCapable = true

      const optimization: HealthcarePerformanceOptimization = {
        type: 'Offline Capability',
        description: 'Suspense and lazy loading for offline healthcare access',
        implementation: 'React 19 Suspense with lazy components',
        impact: 'high',
        compliance: 'anvisa',
      }
      healthcare.optimizations.push(optimization,)
    }
  }

  private generatePerformanceRecommendations(result: React19ValidationResult,): void {
    const react19 = result.performance.react19
    const memoization = react19.memoization

    // Memoization recommendations
    if (memoization.unnecessaryMemoization > 0) {
      memoization.recommendations.push('Remove unnecessary memoization for better performance',)
    }

    if (memoization.useMemo === 0 && memoization.useCallback === 0) {
      memoization.recommendations.push('Consider using memoization for healthcare data processing',)
    }

    if (
      memoization.healthcareOptimizedMemoization
        < result.components.analysis.healthcareComponents * 0.5
    ) {
      memoization.recommendations.push('Optimize memoization for healthcare components',)
    }

    // Lazy loading recommendations
    const lazyLoading = react19.lazyLoading
    if (lazyLoading.lazyComponents === 0) {
      lazyLoading.loadingStrategies.push('Implement lazy loading for healthcare modules',)
      lazyLoading.performanceImpact = 'high'
    }

    if (lazyLoading.healthcareLazyLoading < result.components.analysis.healthcareComponents * 0.3) {
      lazyLoading.loadingStrategies.push('Increase lazy loading for healthcare components',)
    }

    // Bundle splitting recommendations
    const bundleSplitting = react19.bundleSplitting
    if (!bundleSplitting.routeBasedSplitting) {
      bundleSplitting.routeBasedSplitting = false // Keep as false but add recommendation
    }

    if (!bundleSplitting.healthcareModuleSplitting) {
      bundleSplitting.healthcareModuleSplitting = false
    }
  }

  private async analyzeAccessibility(
    projectPath: string,
    result: React19ValidationResult,
  ): Promise<void> {
    console.log('♿ Analyzing accessibility compliance for healthcare interfaces...',)

    // Find all React component files
    const componentFiles = await this.findComponentFiles(projectPath,)

    // Analyze accessibility in each component
    for (const file of componentFiles) {
      await this.analyzeAccessibilityInFile(file, result,)
    }

    // Calculate WCAG compliance
    this.calculateWCAGCompliance(result,)

    // Assess ANVISA accessibility requirements
    this.assessANVISAAccessibility(result,)
  }

  private async analyzeAccessibilityInFile(
    filePath: string,
    result: React19ValidationResult,
  ): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf-8',)
      const a11y = result.accessibility.analysis

      // Count ARIA attributes
      const ariaAttributes = content.match(/aria-\w+/g,) || []
      a11y.ariaAttributes += ariaAttributes.length

      // Check for semantic HTML
      const semanticElements = content.match(
        /<(main|nav|header|footer|section|article|aside|h[1-6]|button|input|label|form)/g,
      ) || []
      if (semanticElements.length > 0) {
        a11y.perceivable++
      }

      // Check for keyboard navigation support
      const keyboardEvents = content.match(/onKey(Down|Up|Press)/g,) || []
      if (keyboardEvents.length > 0) {
        a11y.keyboardNavigation++
        a11y.operable++
      }

      // Check for focus management
      const focusManagement = content.match(/(tabIndex|autoFocus|focus\(\))/g,) || []
      if (focusManagement.length > 0) {
        a11y.operable++
      }

      // Check for screen reader support
      const screenReaderSupport = content.match(/(aria-label|aria-describedby|role=|alt=)/g,) || []
      a11y.screenReaderSupport += screenReaderSupport.length
      if (screenReaderSupport.length > 0) {
        a11y.perceivable++
        a11y.understandable++
      }

      // Check for form accessibility
      const formAccessibility = content.match(/<label|for=|aria-required|aria-invalid/g,) || []
      if (formAccessibility.length > 0) {
        a11y.understandable++
      }

      // Check for robust markup
      const validMarkup = content.match(/<!DOCTYPE|<html|lang=/g,) || []
      if (validMarkup.length > 0) {
        a11y.robust++
      }

      // Healthcare-specific accessibility analysis
      this.analyzeHealthcareAccessibilityInFile(content, filePath, result,)
    } catch (error) {
      // Continue silently for files that can't be read
    }
  }

  private analyzeHealthcareAccessibilityInFile(
    content: string,
    filePath: string,
    result: React19ValidationResult,
  ): void {
    const healthcareA11y = result.accessibility.healthcare

    // Medical form accessibility
    if (content.includes('form',) && this.isHealthcareComponent(content,)) {
      if (content.includes('aria-',) || content.includes('label',)) {
        healthcareA11y.medicalFormAccessibility++
      }
    }

    // Patient data accessibility
    if (
      content.includes('patient',)
      && (content.includes('aria-label',) || content.includes('role=',))
    ) {
      healthcareA11y.patientDataAccessibility++
    }

    // Emergency accessibility features
    if (
      content.includes('emergency',) || content.includes('urgent',) || content.includes('critical',)
    ) {
      healthcareA11y.emergencyAccessibility++
    }

    // Assistive technology support
    const assistiveSupport = content.match(/(screen.*reader|voice.*control|magnifier|contrast)/gi,)
      || []
    healthcareA11y.assistiveTechnologySupport += assistiveSupport.length
  }

  private calculateWCAGCompliance(result: React19ValidationResult,): void {
    const a11y = result.accessibility.analysis
    const wcag = a11y.wcagCompliance

    // Calculate scores for each WCAG principle (0-100)
    const totalComponents = result.components.analysis.totalComponents || 1

    wcag.perceivable = Math.min(100, (a11y.perceivable / totalComponents) * 100,)
    wcag.operable = Math.min(100, (a11y.operable / totalComponents) * 100,)
    wcag.understandable = Math.min(100, (a11y.understandable / totalComponents) * 100,)
    wcag.robust = Math.min(100, (a11y.robust / totalComponents) * 100,)

    // Calculate overall WCAG score
    wcag.overallScore = (wcag.perceivable + wcag.operable + wcag.understandable + wcag.robust) / 4

    // Determine WCAG level
    if (wcag.overallScore >= 90) {
      wcag.level = 'AAA'
    } else if (wcag.overallScore >= 70) {
      wcag.level = 'AA'
    } else {
      wcag.level = 'A'
    }

    // Update result accessibility
    result.accessibility.wcag = wcag
  }

  private assessANVISAAccessibility(result: React19ValidationResult,): void {
    const healthcareA11y = result.accessibility.healthcare
    const wcag = result.accessibility.wcag

    // ANVISA requires AA level compliance for healthcare applications
    const requiredScore = 70
    const hasHealthcareAccessibility = healthcareA11y.medicalFormAccessibility > 0
      || healthcareA11y.patientDataAccessibility > 0
      || healthcareA11y.emergencyAccessibility > 0

    result.accessibility.anvisaCompliance = wcag.overallScore >= requiredScore
      && hasHealthcareAccessibility
  }

  private async assessHealthcareCompliance(
    projectPath: string,
    result: React19ValidationResult,
  ): Promise<void> {
    console.log('🏥 Assessing comprehensive healthcare compliance for React 19 application...',)

    let lgpdScore = 0
    let anvisaScore = 0
    const maxScore = 100

    // LGPD Compliance Assessment
    lgpdScore += this.assessLGPDComponentCompliance(result,) * 25 // 25 points
    lgpdScore += this.assessLGPDStateCompliance(result,) * 20 // 20 points
    lgpdScore += this.assessLGPDHookCompliance(result,) * 20 // 20 points
    lgpdScore += this.assessLGPDSecurityCompliance(result,) * 20 // 20 points
    lgpdScore += this.assessLGPDAccessibilityCompliance(result,) * 15 // 15 points

    // ANVISA Compliance Assessment
    anvisaScore += this.assessANVISAHealthcareWorkflow(result,) * 30 // 30 points
    anvisaScore += this.assessANVISAComponentCompliance(result,) * 25 // 25 points
    anvisaScore += this.assessANVISAPerformanceCompliance(result,) * 20 // 20 points
    anvisaScore += this.assessANVISAAccessibilityCompliance(result,) * 15 // 15 points
    anvisaScore += this.assessANVISASecurityCompliance(result,) * 10 // 10 points

    // Calculate overall score
    const overallScore = (lgpdScore + anvisaScore) / 2

    result.healthcareCompliance.lgpdScore = Math.min(lgpdScore, maxScore,)
    result.healthcareCompliance.anvisaScore = Math.min(anvisaScore, maxScore,)
    result.healthcareCompliance.overallScore = Math.min(overallScore, maxScore,)

    // Generate recommendations
    this.generateHealthcareComplianceRecommendations(result,)

    // Identify critical issues
    this.identifyHealthcareCriticalIssues(result,)
  }

  private assessLGPDComponentCompliance(result: React19ValidationResult,): number {
    const components = result.components
    const totalHealthcareComponents = components.analysis.healthcareComponents || 1

    let score = 0

    // Data protection in components
    score += Math.min(1, components.healthcareCompliance.lgpdCompliant / totalHealthcareComponents,)
      * 0.4

    // Security patterns in components
    const securityScore = Math.max(
      0,
      1 - (components.healthcareCompliance.securityIssues.length / 10),
    )
    score += securityScore * 0.3

    // Healthcare-specific patterns
    const healthcarePatterns = components.patterns.healthcareSpecific.length
    score += Math.min(1, healthcarePatterns / 5,) * 0.3

    return score
  }

  private assessLGPDStateCompliance(result: React19ValidationResult,): number {
    return result.stateManagement.lgpdCompliance.score / 100
  }

  private assessLGPDHookCompliance(result: React19ValidationResult,): number {
    const hooks = result.hooks.analysis
    const totalCustomHooks = hooks.customHooks.length || 1

    let score = 0

    // LGPD compliant custom hooks
    const lgpdHooks = hooks.customHooks.filter(h => h.lgpdCompliant).length
    score += (lgpdHooks / totalCustomHooks) * 0.5

    // Security hooks
    score += Math.min(1, result.hooks.securityPatterns.dataValidation / 5,) * 0.3

    // Compliance hooks
    score += Math.min(1, result.hooks.healthcareHooks.complianceHooks.length / 3,) * 0.2

    return score
  }

  private assessLGPDSecurityCompliance(result: React19ValidationResult,): number {
    const security = result.security

    // Base security score
    let score = security.score / 100

    // Healthcare-specific security
    if (security.healthcare.lgpdCompliance) score += 0.2
    if (security.healthcare.auditLogging) score += 0.1

    // React 19 specific security
    if (security.react19Security.contextSecurity) score += 0.1
    if (security.react19Security.hookSecurity) score += 0.1

    return Math.min(1, score,)
  }

  private assessLGPDAccessibilityCompliance(result: React19ValidationResult,): number {
    const accessibility = result.accessibility

    // WCAG compliance contributes to LGPD (digital inclusion)
    let score = accessibility.wcag.overallScore / 100

    // Healthcare accessibility bonus
    const healthcareA11y = accessibility.healthcare
    const hasHealthcareAccessibility = healthcareA11y.medicalFormAccessibility > 0
      || healthcareA11y.patientDataAccessibility > 0

    if (hasHealthcareAccessibility) score += 0.2

    return Math.min(1, score,)
  }

  private assessANVISAHealthcareWorkflow(result: React19ValidationResult,): number {
    const components = result.components.analysis.componentsByType.healthcare

    let score = 0

    // Essential healthcare components
    if (components.patientForms > 0) score += 0.2
    if (components.appointmentSchedulers > 0) score += 0.2
    if (components.medicalCharts > 0) score += 0.2
    if (components.prescriptionForms > 0) score += 0.2
    if (components.healthcareProviderComponents > 0) score += 0.1
    if (components.complianceComponents > 0) score += 0.1

    return score
  }

  private assessANVISAComponentCompliance(result: React19ValidationResult,): number {
    const components = result.components

    let score = 0

    // ANVISA compliant components
    const totalHealthcare = components.analysis.healthcareComponents || 1
    score += (components.healthcareCompliance.anvisaCompliant / totalHealthcare) * 0.6

    // Error handling (critical for healthcare)
    const errorBoundaries = components.analysis.errorBoundaryComponents
    score += Math.min(1, errorBoundaries / totalHealthcare,) * 0.4

    return score
  }

  private assessANVISAPerformanceCompliance(result: React19ValidationResult,): number {
    const performance = result.performance

    let score = 0

    // Healthcare performance optimizations
    if (performance.healthcare.clinicNetworkOptimized) score += 0.4
    if (performance.healthcare.mobileOptimized) score += 0.3
    if (performance.healthcare.offlineCapable) score += 0.3

    return score
  }

  private assessANVISAAccessibilityCompliance(result: React19ValidationResult,): number {
    return result.accessibility.anvisaCompliance ? 1 : 0
  }

  private assessANVISASecurityCompliance(result: React19ValidationResult,): number {
    const security = result.security.healthcare

    let score = 0

    if (security.patientDataSecurity) score += 0.3
    if (security.medicalRecordSecurity) score += 0.3
    if (security.anvisaCompliance) score += 0.4

    return score
  }
  private generateHealthcareComplianceRecommendations(result: React19ValidationResult,): void {
    const recommendations = result.healthcareCompliance.recommendations

    // LGPD Recommendations
    if (result.healthcareCompliance.lgpdScore < 80) {
      recommendations.push('Implement comprehensive LGPD compliance in React components',)
      recommendations.push('Add consent management components for patient data collection',)
      recommendations.push('Implement data minimization patterns in healthcare forms',)
    }

    if (result.healthcareCompliance.lgpdScore < 60) {
      recommendations.push(
        'Critical LGPD compliance issues - implement audit logging for all patient data access',
      )
      recommendations.push('Add data encryption patterns for sensitive healthcare information',)
      recommendations.push('Implement right to erasure functionality for patient data',)
    }

    // ANVISA Recommendations
    if (result.healthcareCompliance.anvisaScore < 80) {
      recommendations.push('Implement ANVISA-compliant healthcare workflow components',)
      recommendations.push('Add prescription management and medication tracking components',)
      recommendations.push('Implement healthcare provider and clinical workflow components',)
    }

    if (result.healthcareCompliance.anvisaScore < 60) {
      recommendations.push(
        'Critical ANVISA compliance issues - implement comprehensive healthcare component suite',
      )
      recommendations.push('Add error boundaries and error handling for medical data safety',)
      recommendations.push('Implement accessibility compliance for healthcare user interfaces',)
    }

    // Overall Healthcare Recommendations
    if (result.healthcareCompliance.overallScore < 70) {
      recommendations.push(
        'Conduct comprehensive healthcare compliance review with medical and legal teams',
      )
      recommendations.push(
        'Implement React 19 concurrent features for healthcare performance optimization',
      )
      recommendations.push('Add comprehensive accessibility support for healthcare interfaces',)
    }

    // React 19 Specific Recommendations
    if (result.configuration.react19Features.score < 70) {
      recommendations.push(
        'Upgrade to React 19 and implement concurrent features for healthcare optimization',
      )
      recommendations.push('Implement Suspense and lazy loading for healthcare module performance',)
    }

    if (result.performance.react19.concurrentFeatures.healthcareOptimized === false) {
      recommendations.push('Optimize React 19 concurrent features for healthcare data processing',)
    }
  }

  private identifyHealthcareCriticalIssues(result: React19ValidationResult,): void {
    const criticalIssues = result.healthcareCompliance.criticalIssues

    // Critical LGPD Issues
    if (result.components.healthcareCompliance.securityIssues.length > 0) {
      criticalIssues.push(
        `CRITICAL: ${result.components.healthcareCompliance.securityIssues.length} security issues detected in healthcare components`,
      )
    }

    if (result.stateManagement.lgpdCompliance.score < 50) {
      criticalIssues.push(
        'CRITICAL: LGPD compliance score below acceptable threshold for healthcare data',
      )
    }

    if (
      result.hooks.healthcareHooks.complianceHooks.length === 0
      && result.components.analysis.healthcareComponents > 0
    ) {
      criticalIssues.push('CRITICAL: No compliance hooks detected for healthcare data management',)
    }

    // Critical ANVISA Issues
    if (
      result.components.analysis.componentsByType.healthcare.patientForms === 0
      && result.components.analysis.componentsByType.forms > 0
    ) {
      criticalIssues.push(
        'CRITICAL: Form components detected but no patient-specific forms for healthcare compliance',
      )
    }

    if (
      !result.accessibility.anvisaCompliance
      && result.components.analysis.healthcareComponents > 0
    ) {
      criticalIssues.push('CRITICAL: Healthcare components not ANVISA accessibility compliant',)
    }

    // Critical Performance Issues
    if (
      result.performance.react19.lazyLoading.lazyComponents === 0
      && result.components.analysis.totalComponents > 20
    ) {
      criticalIssues.push('CRITICAL: No lazy loading implemented for large healthcare application',)
    }

    // Critical React 19 Issues
    if (result.configuration.version && !result.configuration.version.includes('19',)) {
      criticalIssues.push(
        'CRITICAL: Not using React 19+ - missing healthcare performance optimizations',
      )
    }

    if (
      result.components.analysis.errorBoundaryComponents === 0
      && result.components.analysis.healthcareComponents > 0
    ) {
      criticalIssues.push('CRITICAL: No error boundaries for healthcare component stability',)
    }

    // Critical Configuration Issues
    if (!result.configuration.strictMode) {
      criticalIssues.push(
        'CRITICAL: React StrictMode not enabled - potential healthcare data integrity issues',
      )
    }

    if (!result.configuration.typescript.enabled) {
      criticalIssues.push(
        'CRITICAL: TypeScript not enabled - lack of type safety for healthcare data',
      )
    }
  }

  private async validateSecurity(
    projectPath: string,
    result: React19ValidationResult,
  ): Promise<void> {
    console.log('🔒 Validating security patterns for healthcare React application...',)

    // Initialize security results
    result.security.healthcare = {
      patientDataSecurity: false,
      medicalRecordSecurity: false,
      lgpdCompliance: false,
      anvisaCompliance: false,
      auditLogging: false,
    }

    result.security.react19Security = {
      concurrentSafety: false,
      suspenseSecurity: false,
      contextSecurity: false,
      hookSecurity: false,
    }

    // Analyze healthcare security patterns
    await this.analyzeHealthcareSecurity(projectPath, result,)

    // Analyze React 19 specific security
    this.analyzeReact19Security(result,)

    // Calculate overall security score
    this.calculateSecurityScore(result,)
  }

  private async analyzeHealthcareSecurity(
    projectPath: string,
    result: React19ValidationResult,
  ): Promise<void> {
    const reactFiles = await this.findComponentFiles(projectPath,)
    const healthcare = result.security.healthcare

    let patientDataSecurity = false
    let medicalRecordSecurity = false
    let auditLogging = false

    for (const file of reactFiles) {
      try {
        const content = await readFile(file, 'utf-8',)

        // Check for patient data security patterns
        if (
          content.includes('patient',)
          && (content.includes('encrypt',) || content.includes('validate',)
            || content.includes('sanitize',))
        ) {
          patientDataSecurity = true
        }

        // Check for medical record security patterns
        if (
          content.includes('medical',) && content.includes('record',)
          && (content.includes('auth',) || content.includes('permission',)
            || content.includes('access',))
        ) {
          medicalRecordSecurity = true
        }

        // Check for audit logging patterns
        if (content.includes('audit',) || content.includes('log',) || content.includes('track',)) {
          auditLogging = true
        }

        // Check for security issues
        this.checkSecurityIssues(content, file, result,)
      } catch (error) {
        result.security.issues.push(`Failed to analyze security in ${file}`,)
      }
    }

    healthcare.patientDataSecurity = patientDataSecurity
    healthcare.medicalRecordSecurity = medicalRecordSecurity
    healthcare.auditLogging = auditLogging

    // Assess LGPD and ANVISA compliance
    healthcare.lgpdCompliance = result.stateManagement.lgpdCompliance.score >= 70
    healthcare.anvisaCompliance = result.accessibility.anvisaCompliance && patientDataSecurity
  }

  private checkSecurityIssues(
    content: string,
    filePath: string,
    result: React19ValidationResult,
  ): void {
    const filename = filePath.split('/',).pop() || ''

    // Check for dangerous patterns
    if (content.includes('dangerouslySetInnerHTML',)) {
      result.security.issues.push(`Dangerous HTML injection in ${filename}`,)
    }

    if (content.includes('eval(',) || content.includes('Function(',)) {
      result.security.issues.push(`Dynamic code execution detected in ${filename}`,)
    }

    // Check for insecure storage
    if (content.includes('localStorage',) && this.containsSensitiveData(content,)) {
      result.security.issues.push(`Sensitive data in localStorage in ${filename}`,)
    }

    // Check for unvalidated inputs
    if (
      content.includes('input',) && !content.includes('validate',)
      && this.isHealthcareComponent(content,)
    ) {
      result.security.issues.push(`Unvalidated healthcare input in ${filename}`,)
    }

    // Check for missing authentication
    if (
      this.isHealthcareComponent(content,)
      && !content.includes('auth',)
      && !content.includes('permission',)
      && content.includes('patient',)
    ) {
      result.security.issues.push(`Missing authentication for patient data in ${filename}`,)
    }
  }

  private analyzeReact19Security(result: React19ValidationResult,): void {
    const react19Security = result.security.react19Security
    const react19 = result.performance.react19

    // Concurrent features safety
    if (react19.concurrentFeatures.concurrent && react19.concurrentFeatures.issues.length === 0) {
      react19Security.concurrentSafety = true
    }

    // Suspense security
    if (react19.suspense.suspenseComponents > 0 && react19.suspense.errorBoundaries > 0) {
      react19Security.suspenseSecurity = true
    }

    // Context security
    const contextUsage = result.stateManagement.analysis.contextUsage
    const secureContexts = contextUsage.filter(c => c.hasSecurityMeasures).length
    if (contextUsage.length > 0 && secureContexts >= contextUsage.length * 0.7) {
      react19Security.contextSecurity = true
    }

    // Hook security
    const hooks = result.hooks.analysis
    const securityHooks = hooks.securityHooks.length
    const customHooks = hooks.customHooks.length
    if (customHooks === 0 || securityHooks >= customHooks * 0.5) {
      react19Security.hookSecurity = true
    }
  }

  private calculateSecurityScore(result: React19ValidationResult,): void {
    let score = 100

    // Deduct for security issues
    score -= result.security.issues.length * 10
    score -= result.components.healthcareCompliance.securityIssues.length * 15

    // Bonus for healthcare security
    const healthcare = result.security.healthcare
    if (healthcare.patientDataSecurity) score += 10
    if (healthcare.medicalRecordSecurity) score += 10
    if (healthcare.auditLogging) score += 5
    if (healthcare.lgpdCompliance) score += 10
    if (healthcare.anvisaCompliance) score += 10

    // Bonus for React 19 security
    const react19Security = result.security.react19Security
    if (react19Security.concurrentSafety) score += 5
    if (react19Security.suspenseSecurity) score += 5
    if (react19Security.contextSecurity) score += 5
    if (react19Security.hookSecurity) score += 5

    result.security.score = Math.max(0, Math.min(100, score,),)

    // Generate security recommendations
    if (result.security.score < 70) {
      result.security.recommendations.push(
        'Implement comprehensive security measures for healthcare data',
      )
      result.security.recommendations.push(
        'Add authentication and authorization for patient data access',
      )
      result.security.recommendations.push('Implement data validation and sanitization patterns',)
    }

    if (!healthcare.lgpdCompliance) {
      result.security.recommendations.push(
        'Implement LGPD compliance measures for patient data protection',
      )
    }

    if (!healthcare.anvisaCompliance) {
      result.security.recommendations.push(
        'Implement ANVISA compliance measures for healthcare applications',
      )
    }

    if (result.security.issues.length > 0) {
      result.security.recommendations.push(
        'Address identified security vulnerabilities immediately',
      )
    }
  }

  private calculateOverallValidity(result: React19ValidationResult,): boolean {
    // React configuration must be valid
    if (!result.configuration.valid) return false

    // Must have minimal React 19 features
    if (result.configuration.react19Features.score < 50) return false

    // Must have minimal healthcare compliance
    if (result.healthcareCompliance.overallScore < 60) return false

    // Security score must be acceptable
    if (result.security.score < 70) return false

    // No critical healthcare issues
    if (result.healthcareCompliance.criticalIssues.length > 0) return false

    // Must have some healthcare components if healthcare patterns detected
    if (
      result.components.analysis.healthcareComponents === 0
      && result.hooks.analysis.healthcareHooks.length > 0
    ) {
      return false
    }

    return true
  }

  // Public method to get validation summary
  getValidationSummary(result: React19ValidationResult,): string {
    return `
🔍 React 19 Healthcare Application Audit Summary
==============================================

📊 Overall Status: ${result.valid ? '✅ VALID' : '❌ INVALID'}
⚛️ React Version: ${result.configuration.version || 'Not Detected'}

🏥 Healthcare Compliance:
  • LGPD Score: ${result.healthcareCompliance.lgpdScore.toFixed(1,)}/100
  • ANVISA Score: ${result.healthcareCompliance.anvisaScore.toFixed(1,)}/100
  • Overall Score: ${result.healthcareCompliance.overallScore.toFixed(1,)}/100

⚛️ React 19 Configuration:
  • Features Score: ${result.configuration.react19Features.score.toFixed(1,)}/100
  • Enabled Features: ${result.configuration.react19Features.enabled.length}
  • Missing Features: ${result.configuration.react19Features.missing.length}
  • Experimental Features: ${result.configuration.react19Features.experimental.length}
  • Strict Mode: ${result.configuration.strictMode ? '✅' : '❌'}
  • Concurrent Mode: ${result.configuration.concurrent ? '✅' : '❌'}
  • TypeScript: ${result.configuration.typescript.enabled ? '✅' : '❌'}

📦 Component Analysis:
  • Total Components: ${result.components.analysis.totalComponents}
  • Healthcare Components: ${result.components.analysis.healthcareComponents}
  • Functional Components: ${result.components.analysis.functionalComponents}
  • Hook Components: ${result.components.analysis.hookComponents}
  • Memoized Components: ${result.components.analysis.memoizedComponents}
  • Accessible Components: ${result.components.analysis.accessibleComponents}

🏥 Healthcare Components:
  • Patient Forms: ${result.components.analysis.componentsByType.healthcare.patientForms}
  • Appointment Schedulers: ${result.components.analysis.componentsByType.healthcare.appointmentSchedulers}
  • Medical Charts: ${result.components.analysis.componentsByType.healthcare.medicalCharts}
  • Prescription Forms: ${result.components.analysis.componentsByType.healthcare.prescriptionForms}
  • Compliance Components: ${result.components.analysis.componentsByType.healthcare.complianceComponents}

🎣 Hooks Analysis:
  • Total Hooks: ${result.hooks.analysis.totalHooks}
  • Custom Hooks: ${result.hooks.analysis.customHooks.length}
  • Healthcare Hooks: ${result.hooks.analysis.healthcareHooks.length}
  • Security Hooks: ${result.hooks.analysis.securityHooks.length}
  • Performance Hooks: ${result.hooks.analysis.performanceHooks.length}

🗂️ State Management:
  • State Patterns: ${result.stateManagement.analysis.patterns.length}
  • Context Usage: ${result.stateManagement.analysis.contextUsage.length}
  • Reducer Usage: ${result.stateManagement.analysis.reducerUsage.length}
  • LGPD Compliance Score: ${result.stateManagement.lgpdCompliance.score.toFixed(1,)}/100
  • Healthcare Data Flow: ${
      Object.values(result.stateManagement.healthcareDataFlow,).filter(Boolean,).length
    }/5

⚡ React 19 Performance:
  • useTransition Usage: ${result.performance.react19.concurrentFeatures.useTransition}
  • useDeferredValue Usage: ${result.performance.react19.concurrentFeatures.useDeferredValue}
  • Suspense Components: ${result.performance.react19.suspense.suspenseComponents}
  • Lazy Components: ${result.performance.react19.suspense.lazyComponents}
  • Healthcare Optimized: ${
      result.performance.react19.concurrentFeatures.healthcareOptimized ? '✅' : '❌'
    }

♿ Accessibility:
  • WCAG Level: ${result.accessibility.wcag.level}
  • WCAG Score: ${result.accessibility.wcag.overallScore.toFixed(1,)}/100
  • ARIA Attributes: ${result.accessibility.analysis.ariaAttributes}
  • Screen Reader Support: ${result.accessibility.analysis.screenReaderSupport}
  • Healthcare Accessibility: ${result.accessibility.healthcare.medicalFormAccessibility}
  • ANVISA Compliance: ${result.accessibility.anvisaCompliance ? '✅' : '❌'}

🔒 Security Assessment:
  • Security Score: ${result.security.score}/100
  • Patient Data Security: ${result.security.healthcare.patientDataSecurity ? '✅' : '❌'}
  • Medical Record Security: ${result.security.healthcare.medicalRecordSecurity ? '✅' : '❌'}
  • LGPD Compliance: ${result.security.healthcare.lgpdCompliance ? '✅' : '❌'}
  • ANVISA Compliance: ${result.security.healthcare.anvisaCompliance ? '✅' : '❌'}
  • Audit Logging: ${result.security.healthcare.auditLogging ? '✅' : '❌'}

⚡ Performance Metrics:
  • Processing Time: ${result.performance.duration.toFixed(2,)}ms
  • Files Processed: ${result.performance.filesProcessed}
  • Memory Usage: ${(result.performance.memoryUsage / 1024 / 1024).toFixed(2,)}MB
  • Healthcare Network Optimized: ${
      result.performance.healthcare.clinicNetworkOptimized ? '✅' : '❌'
    }
  • Mobile Optimized: ${result.performance.healthcare.mobileOptimized ? '✅' : '❌'}
  • Offline Capable: ${result.performance.healthcare.offlineCapable ? '✅' : '❌'}

🚨 Critical Issues: ${result.healthcareCompliance.criticalIssues.length}
⚠️ Warnings: ${result.warnings.length}
❌ Errors: ${result.errors.length}

💡 Top Recommendations:
${result.healthcareCompliance.recommendations.slice(0, 5,).map(rec => `  • ${rec}`).join('\n',)}
    `.trim()
  }
}
