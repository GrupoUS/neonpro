/**
 * ConfigurationOptimizer - Configuration Management Enhancement System
 *
 * Part of the comprehensive optimization suite, this component focuses on:
 * - Configuration file analysis and optimization
 * - Environment variable management and validation
 * - Configuration schema validation and type safety
 * - Configuration merging, inheritance, and overrides
 * - Security best practices for sensitive configuration
 * - Performance optimization for configuration loading
 * - Constitutional compliance for configuration management
 *
 * Constitutional Requirements:
 * - Must maintain functionality while optimizing configuration
 * - Configuration changes must be validated and reversible
 * - Sensitive data must be properly secured and never exposed
 * - Processing must stay within constitutional time limits
 */

import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
import { performance } from 'perf_hooks';

// Constitutional Requirements for Configuration Management
export const CONFIGURATION_REQUIREMENTS = {
  MAX_PROCESSING_TIME_MS: 20 * 60 * 1000, // 20 minutes
  MAX_CONFIG_FILES: 100, // Maximum config files to process
  MIN_SECURITY_SCORE: 0.85, // 85% minimum security compliance
  MAX_LOAD_TIME_MS: 5000, // 5 seconds maximum config load time
  MIN_VALIDATION_COVERAGE: 0.90, // 90% configuration validation coverage
} as const;

export interface ConfigurationAnalysis {
  projectPath: string;
  configFiles: ConfigFileInfo[];
  environmentVariables: EnvironmentVariableInfo[];
  configurationIssues: ConfigurationIssue[];
  securityFindings: SecurityFinding[];
  optimizationOpportunities: ConfigurationOptimizationSuggestion[];
  overallMetrics: {
    securityScore: number; // 0-1 scale
    performanceScore: number; // 0-1 scale
    maintainabilityScore: number; // 0-1 scale
    validationCoverage: number; // 0-1 scale
  };
}

export interface ConfigFileInfo {
  filePath: string;
  type: 'json' | 'yaml' | 'ini' | 'env' | 'js' | 'ts' | 'toml' | 'properties' | 'xml';
  size: number;
  lastModified: number;
  schema?: ConfigSchema;
  structure: {
    depth: number;
    keys: number;
    arrays: number;
    objects: number;
  };
  dependencies: string[]; // Other config files it references
  validation: {
    hasSchema: boolean;
    isValid: boolean;
    errors: ValidationError[];
  };
  security: {
    containsSecrets: boolean;
    secretTypes: string[];
    encryption: 'none' | 'partial' | 'full';
    accessLevel: 'public' | 'internal' | 'sensitive' | 'secret';
  };
}

export interface EnvironmentVariableInfo {
  name: string;
  defaultValue?: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'json' | 'url' | 'path';
  description?: string;
  usageLocations: Array<{
    file: string;
    line: number;
    context: string;
  }>;
  security: {
    isSensitive: boolean;
    classification: 'public' | 'internal' | 'confidential' | 'secret';
    hasDefaultValue: boolean;
    isExposed: boolean;
  };
  validation: {
    hasValidation: boolean;
    validationRules: ValidationRule[];
    currentValue?: string;
    isValid: boolean;
  };
}

export interface ConfigurationIssue {
  id: string;
  type: 'security' | 'performance' | 'validation' | 'maintainability' | 'structure';
  severity: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  location?: {
    line: number;
    column: number;
    key: string;
  };
  description: string;
  impact: {
    security: number; // 1-10 scale
    performance: number; // 1-10 scale
    maintainability: number; // 1-10 scale
  };
  recommendation: string;
  autoFixable: boolean;
  codeExample?: {
    before: string;
    after: string;
  };
}

export interface SecurityFinding {
  id: string;
  type:
    | 'hardcoded-secret'
    | 'weak-encryption'
    | 'exposed-config'
    | 'insecure-default'
    | 'missing-validation';
  severity: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  location: {
    line: number;
    column: number;
    key: string;
    value?: string; // Redacted for secrets
  };
  description: string;
  secretType?:
    | 'api-key'
    | 'password'
    | 'token'
    | 'certificate'
    | 'connection-string'
    | 'private-key';
  remediation: {
    immediate: string[];
    longTerm: string[];
    preventive: string[];
  };
  riskScore: number; // 1-10 scale
}

export interface ConfigurationOptimizationSuggestion {
  id: string;
  type:
    | 'merge-configs'
    | 'add-validation'
    | 'improve-security'
    | 'optimize-loading'
    | 'standardize-format'
    | 'add-schema';
  priority: number; // 1-10, 10 being highest
  description: string;
  files: string[];
  implementation: {
    complexity: 'low' | 'medium' | 'high';
    estimatedTimeHours: number;
    riskLevel: 'low' | 'medium' | 'high';
    requiresDowntime: boolean;
  };
  expectedImprovement: {
    securityGain: number; // percentage
    performanceGain: number; // percentage
    maintainabilityGain: number; // percentage
  };
  implementation_guide: {
    steps: string[];
    prerequisites: string[];
    rollbackPlan: string[];
  };
}

export interface ConfigSchema {
  $schema?: string;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  properties?: Record<string, ConfigSchema>;
  items?: ConfigSchema;
  required?: string[];
  additionalProperties?: boolean | ConfigSchema;
  default?: any;
  description?: string;
  examples?: any[];
  enum?: any[];
  format?: string;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
}

export interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
  code: string;
  value?: any;
  expectedType?: string;
}

export interface ValidationRule {
  type: 'required' | 'pattern' | 'range' | 'enum' | 'custom';
  rule: string | RegExp | Function;
  message: string;
  severity: 'error' | 'warning';
}

export interface ConfigurationOptimizationResult {
  optimizationId: string;
  type: ConfigurationOptimizationSuggestion['type'];
  implemented: boolean;
  error?: string;
  filesModified: string[];
  before: {
    securityScore: number;
    performanceScore: number;
    validationCoverage: number;
    configCount: number;
  };
  after?: {
    securityScore: number;
    performanceScore: number;
    validationCoverage: number;
    configCount: number;
  };
}

export class ConfigurationOptimizer extends EventEmitter {
  private readonly analysisCache = new Map<string, ConfigurationAnalysis>();
  private readonly schemaCache = new Map<string, ConfigSchema>();
  private readonly activeOptimizations = new Set<string>();

  // Security patterns for detecting secrets
  private readonly secretPatterns = new Map<string, RegExp>([
    ['api-key', /(?:api[_-]?key|apikey|access[_-]?key)\s*[:=]\s*['"]([^'"]+)['"]/i],
    ['password', /(?:password|passwd|pwd)\s*[:=]\s*['"]([^'"]+)['"]/i],
    ['token', /(?:token|auth[_-]?token|bearer)\s*[:=]\s*['"]([^'"]+)['"]/i],
    ['private-key', /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/],
    [
      'connection-string',
      /(?:connection[_-]?string|conn[_-]?str|database[_-]?url)\s*[:=]\s*['"]([^'"]+)['"]/i,
    ],
    ['aws-access-key', /AKIA[0-9A-Z]{16}/],
    ['github-token', /ghp_[0-9a-zA-Z]{36}/],
    ['jwt-token', /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/],
  ]);

  constructor() {
    super();
    this.setupEventHandlers();
  }

  /**
   * Analyze configuration across the entire project
   */
  async analyzeConfiguration(
    projectPath: string,
    options: {
      includeNodeModules?: boolean;
      configPatterns?: string[];
      securityScanDepth?: 'basic' | 'comprehensive' | 'deep';
      validateSchemas?: boolean;
    } = {},
  ): Promise<ConfigurationAnalysis> {
    this.emit('analysis:started', { projectPath, options });

    const startTime = performance.now();

    try {
      // Discover configuration files
      const configFiles = await this.discoverConfigurationFiles(projectPath, options);

      this.emit('analysis:progress', {
        phase: 'discovery',
        configFilesFound: configFiles.length,
      });

      // Analyze each configuration file
      const configAnalysisPromises = configFiles.map(async filePath => {
        return this.analyzeConfigurationFile(filePath, options);
      });

      const configFileInfos = await Promise.all(configAnalysisPromises);

      // Discover environment variables
      const environmentVariables = await this.discoverEnvironmentVariables(projectPath);

      this.emit('analysis:progress', {
        phase: 'environment-analysis',
        envVarsFound: environmentVariables.length,
      });

      // Detect configuration issues
      const configurationIssues = await this.detectConfigurationIssues(
        configFileInfos,
        environmentVariables,
      );

      // Perform security analysis
      const securityFindings = await this.performSecurityAnalysis(
        configFileInfos,
        options.securityScanDepth || 'comprehensive',
      );

      this.emit('analysis:progress', {
        phase: 'security-analysis',
        securityFindings: securityFindings.length,
      });

      // Generate optimization opportunities
      const optimizationOpportunities = await this.generateOptimizationOpportunities(
        configFileInfos,
        environmentVariables,
        configurationIssues,
        securityFindings,
      );

      // Calculate overall metrics
      const overallMetrics = this.calculateOverallMetrics(
        configFileInfos,
        securityFindings,
        configurationIssues,
      );

      const analysis: ConfigurationAnalysis = {
        projectPath,
        configFiles: configFileInfos,
        environmentVariables,
        configurationIssues,
        securityFindings,
        optimizationOpportunities,
        overallMetrics,
      };

      // Cache the analysis
      this.analysisCache.set(projectPath, analysis);

      const endTime = performance.now();
      this.emit('analysis:completed', {
        projectPath,
        analysisTime: endTime - startTime,
        configFilesAnalyzed: configFileInfos.length,
        issuesFound: configurationIssues.length,
        securityFindings: securityFindings.length,
        overallScore: (overallMetrics.securityScore + overallMetrics.performanceScore
          + overallMetrics.maintainabilityScore) / 3,
      });

      return analysis;
    } catch (error) {
      this.emit('analysis:error', { projectPath, error: error.message });
      throw new Error(`Configuration analysis failed: ${error.message}`);
    }
  }

  /**
   * Create comprehensive configuration optimization plan
   */
  async createOptimizationPlan(
    analysis: ConfigurationAnalysis,
    options: {
      priorityThreshold?: number;
      maxRiskLevel?: 'low' | 'medium' | 'high';
      focusAreas?: ConfigurationOptimizationSuggestion['type'][];
      includeSecurityFixes?: boolean;
      allowDowntime?: boolean;
    } = {},
  ): Promise<{
    planId: string;
    suggestions: ConfigurationOptimizationSuggestion[];
    estimatedImpact: {
      securityImprovement: number;
      performanceImprovement: number;
      maintainabilityImprovement: number;
      riskReduction: number;
    };
    implementationPhases: Array<{
      phase: number;
      name: string;
      suggestions: string[];
      estimatedTime: number;
      requiresDowntime: boolean;
    }>;
    risks: Array<{ level: string; description: string; mitigation: string }>;
  }> {
    const planId = `config-opt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.emit('planning:started', { planId, analysis });

    try {
      // Filter optimization suggestions based on options
      const filteredSuggestions = this.filterOptimizationSuggestions(
        analysis.optimizationOpportunities,
        options,
      );

      // Calculate estimated impact
      const estimatedImpact = this.calculateOptimizationImpact(filteredSuggestions);

      // Create implementation phases
      const implementationPhases = this.createImplementationPhases(
        filteredSuggestions,
        options.allowDowntime || false,
      );

      // Assess risks
      const risks = this.assessOptimizationRisks(filteredSuggestions, analysis);

      const plan = {
        planId,
        suggestions: filteredSuggestions,
        estimatedImpact,
        implementationPhases,
        risks,
      };

      this.emit('planning:completed', { planId, plan });
      return plan;
    } catch (error) {
      this.emit('planning:error', { planId, error: error.message });
      throw new Error(`Configuration optimization planning failed: ${error.message}`);
    }
  }

  /**
   * Execute configuration optimization plan with comprehensive validation
   */
  async executeOptimizationPlan(
    planId: string,
    suggestions: ConfigurationOptimizationSuggestion[],
    options: {
      dryRun?: boolean;
      backupBeforeOptimization?: boolean;
      validateAfterEachPhase?: boolean;
      skipSecurityOptimizations?: boolean;
    } = {},
  ): Promise<ConfigurationOptimizationResult[]> {
    if (this.activeOptimizations.has(planId)) {
      throw new Error(`Configuration optimization plan already executing: ${planId}`);
    }

    this.activeOptimizations.add(planId);
    this.emit('optimization:started', { planId });

    const results: ConfigurationOptimizationResult[] = [];

    try {
      // Create backup if requested
      if (options.backupBeforeOptimization) {
        await this.createConfigurationBackup(planId);
      }

      // Group suggestions into phases
      const phases = this.createImplementationPhases(suggestions, false);

      for (const [phaseIndex, phase] of phases.entries()) {
        this.emit('phase:started', {
          planId,
          phase: phaseIndex + 1,
          name: phase.name,
          suggestionsCount: phase.suggestions.length,
        });

        // Execute suggestions in this phase
        const phasePromises = phase.suggestions.map(async suggestionId => {
          const suggestion = suggestions.find(s => s.id === suggestionId);
          if (!suggestion) {
            throw new Error(`Configuration optimization suggestion not found: ${suggestionId}`);
          }

          // Skip security optimizations if requested
          if (options.skipSecurityOptimizations && suggestion.type === 'improve-security') {
            return null;
          }

          return this.executeOptimization(suggestion, options);
        });

        const phaseResults = await Promise.allSettled(phasePromises);

        for (const result of phaseResults) {
          if (result.status === 'fulfilled' && result.value) {
            results.push(result.value);
          } else if (result.status === 'rejected') {
            this.emit('optimization:error', {
              planId,
              phase: phaseIndex + 1,
              error: result.reason.message,
            });

            results.push({
              optimizationId: `failed_${Date.now()}`,
              type: 'add-validation',
              implemented: false,
              error: result.reason.message,
              filesModified: [],
              before: {
                securityScore: 0,
                performanceScore: 0,
                validationCoverage: 0,
                configCount: 0,
              },
              improvement: { securityGain: 0, performanceGain: 0, maintainabilityGain: 0 },
              constitutionalCompliance: {
                maintainsFunctionality: false,
                improvesSecurity: false,
                optimizesPerformance: false,
                preservesAccessibility: false,
              },
            });
          }
        }

        // Validate after phase if requested
        if (options.validateAfterEachPhase) {
          await this.validatePhaseResults(results, phaseIndex + 1);
        }

        this.emit('phase:completed', {
          planId,
          phase: phaseIndex + 1,
          successfulOptimizations: phaseResults.filter(r => r.status === 'fulfilled').length,
        });
      }

      // Final validation and configuration reload test
      await this.finalizeOptimizations(results, options);

      this.emit('optimization:completed', { planId, results });
      return results;
    } catch (error) {
      this.emit('optimization:error', { planId, error: error.message });

      // Attempt rollback if backup exists
      if (options.backupBeforeOptimization) {
        await this.rollbackOptimizations(planId);
      }

      throw new Error(`Configuration optimization execution failed: ${error.message}`);
    } finally {
      this.activeOptimizations.delete(planId);
    }
  } /**
   * Discover configuration files in the project
   */

  private async discoverConfigurationFiles(
    projectPath: string,
    options: { includeNodeModules?: boolean; configPatterns?: string[] },
  ): Promise<string[]> {
    const configFiles: string[] = [];

    // Default configuration file patterns
    const defaultPatterns = [
      '**/*.json',
      '**/*.yaml',
      '**/*.yml',
      '**/.env*',
      '**/config.*',
      '**/settings.*',
      '**/*config*',
      '**/*.ini',
      '**/*.properties',
      '**/*.toml',
      '**/package.json',
      '**/tsconfig.json',
      '**/webpack.config.*',
      '**/vite.config.*',
      '**/next.config.*',
      '**/nuxt.config.*',
    ];

    const patterns = options.configPatterns || defaultPatterns;

    try {
      const entries = await fs.readdir(projectPath, { withFileTypes: true, recursive: true });

      for (const entry of entries) {
        if (entry.isFile()) {
          const filePath = path.join(projectPath, entry.name);

          // Skip node_modules if not included
          if (!options.includeNodeModules && filePath.includes('node_modules')) {
            continue;
          }

          // Check if file matches configuration patterns
          const isConfigFile = patterns.some(pattern => {
            const regexPattern = pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*');
            return new RegExp(regexPattern, 'i').test(filePath);
          }) || this.isKnownConfigFile(filePath);

          if (isConfigFile) {
            configFiles.push(filePath);
          }
        }
      }

      return configFiles.sort();
    } catch (error) {
      this.emit('discovery:error', { projectPath, error: error.message });
      return [];
    }
  }

  /**
   * Analyze individual configuration file
   */
  private async analyzeConfigurationFile(
    filePath: string,
    options: { validateSchemas?: boolean },
  ): Promise<ConfigFileInfo> {
    const stats = await fs.stat(filePath);
    const content = await fs.readFile(filePath, 'utf-8');

    const fileInfo: ConfigFileInfo = {
      filePath,
      type: this.detectConfigType(filePath),
      size: stats.size,
      lastModified: stats.mtime.getTime(),
      structure: { depth: 0, keys: 0, arrays: 0, objects: 0 },
      dependencies: [],
      validation: { hasSchema: false, isValid: true, errors: [] },
      security: {
        containsSecrets: false,
        secretTypes: [],
        encryption: 'none',
        accessLevel: 'public',
      },
    };

    try {
      // Parse configuration content
      const parsedConfig = await this.parseConfigurationFile(filePath, content);

      // Analyze structure
      fileInfo.structure = this.analyzeConfigStructure(parsedConfig);

      // Detect dependencies
      fileInfo.dependencies = this.detectConfigDependencies(content, filePath);

      // Security analysis
      fileInfo.security = await this.analyzeConfigSecurity(content, filePath);

      // Schema validation if requested
      if (options.validateSchemas) {
        fileInfo.validation = await this.validateConfigSchema(
          parsedConfig,
          filePath,
          fileInfo.type,
        );
      }

      return fileInfo;
    } catch (error) {
      fileInfo.validation.isValid = false;
      fileInfo.validation.errors.push({
        path: filePath,
        message: `Failed to analyze configuration file: ${error.message}`,
        severity: 'error',
        code: 'ANALYSIS_ERROR',
      });

      return fileInfo;
    }
  }

  /**
   * Discover environment variables used in the project
   */
  private async discoverEnvironmentVariables(
    projectPath: string,
  ): Promise<EnvironmentVariableInfo[]> {
    const envVars = new Map<string, EnvironmentVariableInfo>();

    try {
      // Scan for environment variable usage in code files
      const entries = await fs.readdir(projectPath, { withFileTypes: true, recursive: true });

      for (const entry of entries) {
        if (entry.isFile() && this.isSourceFile(entry.name)) {
          const filePath = path.join(projectPath, entry.name);
          const content = await fs.readFile(filePath, 'utf-8');

          // Find environment variable references
          const envReferences = this.extractEnvReferences(content, filePath);

          for (const envRef of envReferences) {
            if (!envVars.has(envRef.name)) {
              envVars.set(envRef.name, {
                name: envRef.name,
                required: false,
                type: 'string',
                usageLocations: [],
                security: {
                  isSensitive: this.isSensitiveEnvVar(envRef.name),
                  classification: this.classifyEnvVar(envRef.name),
                  hasDefaultValue: false,
                  isExposed: false,
                },
                validation: {
                  hasValidation: false,
                  validationRules: [],
                  isValid: true,
                },
              });
            }

            envVars.get(envRef.name)!.usageLocations.push({
              file: filePath,
              line: envRef.line,
              context: envRef.context,
            });
          }
        }
      }

      // Check .env files for definitions
      const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];
      for (const envFile of envFiles) {
        const envFilePath = path.join(projectPath, envFile);
        try {
          const envContent = await fs.readFile(envFilePath, 'utf-8');
          this.parseEnvFileDefinitions(envContent, envVars);
        } catch (error) {
          // .env file doesn't exist, continue
        }
      }

      return Array.from(envVars.values());
    } catch (error) {
      this.emit('env-discovery:error', { projectPath, error: error.message });
      return [];
    }
  }

  /**
   * Detect various configuration issues
   */
  private async detectConfigurationIssues(
    configFiles: ConfigFileInfo[],
    environmentVariables: EnvironmentVariableInfo[],
  ): Promise<ConfigurationIssue[]> {
    const issues: ConfigurationIssue[] = [];

    // Detect duplicate configurations
    issues.push(...this.detectDuplicateConfigurations(configFiles));

    // Detect missing validation
    issues.push(...this.detectMissingValidation(configFiles));

    // Detect performance issues
    issues.push(...this.detectPerformanceIssues(configFiles));

    // Detect maintainability issues
    issues.push(...this.detectMaintainabilityIssues(configFiles, environmentVariables));

    // Detect structural issues
    issues.push(...this.detectStructuralIssues(configFiles));

    return issues.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Perform security analysis on configuration files
   */
  private async performSecurityAnalysis(
    configFiles: ConfigFileInfo[],
    scanDepth: 'basic' | 'comprehensive' | 'deep',
  ): Promise<SecurityFinding[]> {
    const findings: SecurityFinding[] = [];

    for (const configFile of configFiles) {
      try {
        const content = await fs.readFile(configFile.filePath, 'utf-8');

        // Detect hardcoded secrets
        findings.push(...this.detectHardcodedSecrets(content, configFile.filePath));

        // Check for insecure defaults
        if (scanDepth === 'comprehensive' || scanDepth === 'deep') {
          findings.push(...this.detectInsecureDefaults(content, configFile.filePath));
        }

        // Check for exposed configuration
        if (scanDepth === 'deep') {
          findings.push(...this.detectExposedConfiguration(configFile));
        }

        // Validate encryption practices
        findings.push(...this.validateEncryptionPractices(content, configFile.filePath));
      } catch (error) {
        this.emit('security-analysis:error', {
          file: configFile.filePath,
          error: error.message,
        });
      }
    }

    return findings.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Generate optimization opportunities
   */
  private async generateOptimizationOpportunities(
    configFiles: ConfigFileInfo[],
    environmentVariables: EnvironmentVariableInfo[],
    issues: ConfigurationIssue[],
    securityFindings: SecurityFinding[],
  ): Promise<ConfigurationOptimizationSuggestion[]> {
    const suggestions: ConfigurationOptimizationSuggestion[] = [];

    // Generate merge configuration suggestions
    suggestions.push(...this.suggestConfigurationMerging(configFiles));

    // Generate validation enhancement suggestions
    suggestions.push(...this.suggestValidationEnhancements(configFiles, issues));

    // Generate security improvement suggestions
    suggestions.push(...this.suggestSecurityImprovements(securityFindings));

    // Generate performance optimization suggestions
    suggestions.push(...this.suggestPerformanceOptimizations(configFiles, issues));

    // Generate standardization suggestions
    suggestions.push(...this.suggestStandardization(configFiles));

    // Generate schema addition suggestions
    suggestions.push(...this.suggestSchemaAdditions(configFiles));

    return suggestions.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Utility methods for configuration analysis
   */
  private isKnownConfigFile(filePath: string): boolean {
    const knownConfigFiles = [
      'dockerfile',
      'docker-compose.yml',
      'docker-compose.yaml',
      'makefile',
      'browserslist',
      '.gitignore',
      '.eslintrc',
      '.prettierrc',
      'babel.config.js',
      'jest.config.js',
      '.config/build/tailwind.config.js',
    ];

    const fileName = path.basename(filePath).toLowerCase();
    return knownConfigFiles.includes(fileName) || fileName.startsWith('.env');
  }

  private detectConfigType(filePath: string): ConfigFileInfo['type'] {
    const extension = path.extname(filePath).toLowerCase();
    const baseName = path.basename(filePath).toLowerCase();

    if (extension === '.json') return 'json';
    if (extension === '.yml' || extension === '.yaml') return 'yaml';
    if (extension === '.ini') return 'ini';
    if (extension === '.js' || extension === '.mjs') return 'js';
    if (extension === '.ts' || extension === '.mts') return 'ts';
    if (extension === '.toml') return 'toml';
    if (extension === '.properties') return 'properties';
    if (extension === '.xml') return 'xml';
    if (baseName.startsWith('.env')) return 'env';

    return 'json'; // Default assumption
  }

  private async parseConfigurationFile(filePath: string, content: string): Promise<any> {
    const type = this.detectConfigType(filePath);

    try {
      switch (type) {
        case 'json':
          return JSON.parse(content);

        case 'yaml':
          // Would use a YAML parser like js-yaml
          return { _yaml_content: content }; // Placeholder

        case 'env':
          return this.parseEnvFile(content);

        case 'ini':
          return this.parseIniFile(content);

        case 'js':
        case 'ts':
          // Would need to evaluate JS/TS config files safely
          return { _js_content: content }; // Placeholder

        case 'properties':
          return this.parsePropertiesFile(content);

        case 'toml':
          // Would use a TOML parser
          return { _toml_content: content }; // Placeholder

        case 'xml':
          // Would use an XML parser
          return { _xml_content: content }; // Placeholder

        default:
          return { _raw_content: content };
      }
    } catch (error) {
      throw new Error(`Failed to parse ${type} configuration: ${error.message}`);
    }
  }

  private parseEnvFile(content: string): Record<string, string> {
    const env: Record<string, string> = {};
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          let value = valueParts.join('=');
          // Remove quotes if present
          if (
            (value.startsWith('"') && value.endsWith('"'))
            || (value.startsWith('\'') && value.endsWith('\''))
          ) {
            value = value.slice(1, -1);
          }
          env[key.trim()] = value;
        }
      }
    }

    return env;
  }

  private parseIniFile(content: string): Record<string, any> {
    const ini: Record<string, any> = {};
    let currentSection = '';

    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(';') || trimmed.startsWith('#')) {
        continue;
      }

      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        currentSection = trimmed.slice(1, -1);
        ini[currentSection] = {};
      } else {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          if (currentSection) {
            ini[currentSection][key.trim()] = value;
          } else {
            ini[key.trim()] = value;
          }
        }
      }
    }

    return ini;
  }

  private parsePropertiesFile(content: string): Record<string, string> {
    const properties: Record<string, string> = {};
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('!')) {
        const separatorIndex = Math.max(trimmed.indexOf('='), trimmed.indexOf(':'));
        if (separatorIndex > 0) {
          const key = trimmed.substring(0, separatorIndex).trim();
          const value = trimmed.substring(separatorIndex + 1).trim();
          properties[key] = value;
        }
      }
    }

    return properties;
  }

  private analyzeConfigStructure(config: any): ConfigFileInfo['structure'] {
    let depth = 0;
    let keys = 0;
    let arrays = 0;
    let objects = 0;

    const analyze = (obj: any, currentDepth: number) => {
      depth = Math.max(depth, currentDepth);

      if (Array.isArray(obj)) {
        arrays++;
        obj.forEach(item => analyze(item, currentDepth + 1));
      } else if (obj && typeof obj === 'object') {
        objects++;
        const objKeys = Object.keys(obj);
        keys += objKeys.length;
        objKeys.forEach(key => analyze(obj[key], currentDepth + 1));
      }
    };

    analyze(config, 0);

    return { depth, keys, arrays, objects };
  }
  private detectConfigDependencies(content: string, filePath: string): string[] {
    const dependencies: string[] = [];

    // Look for file references in configuration
    const fileRefPatterns = [
      /["']([^"']+\.(?:json|yaml|yml|env|js|ts|config).*?)["']/g,
      /import\s+.*?from\s+["']([^"']+)["']/g,
      /require\s*\(\s*["']([^"']+)["']\s*\)/g,
    ];

    for (const pattern of fileRefPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const refPath = match[1];
        if (refPath && !refPath.startsWith('http') && !refPath.startsWith('node:')) {
          dependencies.push(path.resolve(path.dirname(filePath), refPath));
        }
      }
    }

    return Array.from(new Set(dependencies));
  }

  private async analyzeConfigSecurity(
    content: string,
    filePath: string,
  ): Promise<ConfigFileInfo['security']> {
    let containsSecrets = false;
    const secretTypes: string[] = [];
    let encryption = 'none' as ConfigFileInfo['security']['encryption'];
    let accessLevel = 'public' as ConfigFileInfo['security']['accessLevel'];

    // Detect secrets using patterns
    for (const [secretType, pattern] of this.secretPatterns) {
      if (pattern.test(content)) {
        containsSecrets = true;
        secretTypes.push(secretType);
      }
    }

    // Check for encryption indicators
    if (
      content.includes('-----BEGIN ENCRYPTED')
      || content.includes('cipher')
      || content.includes('encrypted')
    ) {
      encryption = 'partial';
    }

    // Classify access level based on file location and content
    if (
      filePath.includes('secret')
      || filePath.includes('private')
      || containsSecrets
    ) {
      accessLevel = 'secret';
    } else if (
      filePath.includes('internal')
      || filePath.includes('config')
      || content.includes('password')
      || content.includes('token')
    ) {
      accessLevel = 'internal';
    } else if (filePath.includes('sensitive')) {
      accessLevel = 'sensitive';
    }

    return { containsSecrets, secretTypes, encryption, accessLevel };
  }

  private async validateConfigSchema(
    config: any,
    filePath: string,
    configType: ConfigFileInfo['type'],
  ): Promise<ConfigFileInfo['validation']> {
    const validation: ConfigFileInfo['validation'] = {
      hasSchema: false,
      isValid: true,
      errors: [],
    };

    try {
      // Check if schema exists
      const schemaPath = this.findSchemaForConfig(filePath, configType);
      if (schemaPath) {
        validation.hasSchema = true;
        const schema = await this.loadConfigSchema(schemaPath);

        // Validate against schema (simplified implementation)
        const validationErrors = this.validateAgainstSchema(config, schema, filePath);
        validation.errors = validationErrors;
        validation.isValid = validationErrors.length === 0;
      }

      return validation;
    } catch (error) {
      validation.isValid = false;
      validation.errors.push({
        path: filePath,
        message: `Schema validation failed: ${error.message}`,
        severity: 'error',
        code: 'SCHEMA_VALIDATION_ERROR',
      });

      return validation;
    }
  }

  private isSourceFile(fileName: string): boolean {
    const sourceExtensions = ['.js', '.ts', '.jsx', '.tsx', '.vue', '.py', '.go', '.java', '.cs'];
    return sourceExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  }

  private extractEnvReferences(content: string, filePath: string): Array<{
    name: string;
    line: number;
    context: string;
  }> {
    const references: Array<{ name: string; line: number; context: string }> = [];
    const lines = content.split('\n');

    const envPatterns = [
      /process\.env\.([A-Z_][A-Z0-9_]*)/g,
      /os\.environ(?:\.get)?\s*\[\s*["']([A-Z_][A-Z0-9_]*)["']\s*\]/g,
      /\$\{([A-Z_][A-Z0-9_]*)\}/g,
      /\$([A-Z_][A-Z0-9_]*)/g,
    ];

    lines.forEach((line, index) => {
      for (const pattern of envPatterns) {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          references.push({
            name: match[1],
            line: index + 1,
            context: line.trim(),
          });
        }
      }
    });

    return references;
  }

  private parseEnvFileDefinitions(
    content: string,
    envVars: Map<string, EnvironmentVariableInfo>,
  ): void {
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const existingVar = envVars.get(key.trim());
          if (existingVar) {
            existingVar.defaultValue = valueParts.join('=').trim();
            existingVar.security.hasDefaultValue = true;
          }
        }
      }
    }
  }

  private isSensitiveEnvVar(name: string): boolean {
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /key/i,
      /token/i,
      /auth/i,
      /credential/i,
      /private/i,
    ];

    return sensitivePatterns.some(pattern => pattern.test(name));
  }

  private classifyEnvVar(name: string): 'public' | 'internal' | 'confidential' | 'secret' {
    if (this.isSensitiveEnvVar(name)) {
      if (name.toLowerCase().includes('secret') || name.toLowerCase().includes('private')) {
        return 'secret';
      }
      return 'confidential';
    }

    if (name.startsWith('INTERNAL_') || name.includes('CONFIG')) {
      return 'internal';
    }

    return 'public';
  }

  /**
   * Issue detection methods
   */
  private detectDuplicateConfigurations(configFiles: ConfigFileInfo[]): ConfigurationIssue[] {
    const issues: ConfigurationIssue[] = [];
    const configsByType = new Map<string, ConfigFileInfo[]>();

    // Group by configuration type
    for (const config of configFiles) {
      if (!configsByType.has(config.type)) {
        configsByType.set(config.type, []);
      }
      configsByType.get(config.type)!.push(config);
    }

    // Look for duplicates
    for (const [type, configs] of configsByType) {
      if (configs.length > 3) {
        issues.push({
          id: `duplicate-configs-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          type: 'maintainability',
          severity: 'medium',
          file: configs[0].filePath,
          description:
            `Multiple ${type} configuration files found (${configs.length}). Consider consolidation.`,
          impact: { security: 3, performance: 5, maintainability: 8 },
          recommendation:
            `Consolidate ${type} configurations into a single file or use environment-specific configs`,
          autoFixable: false,
          codeExample: {
            before: `Multiple config files:\n${
              configs.map(c => `- ${path.basename(c.filePath)}`).join('\n')
            }`,
            after:
              `Single consolidated config:\n- config.${type}\n- config.development.${type}\n- config.production.${type}`,
          },
        });
      }
    }

    return issues;
  }

  private detectMissingValidation(configFiles: ConfigFileInfo[]): ConfigurationIssue[] {
    const issues: ConfigurationIssue[] = [];

    for (const config of configFiles) {
      if (!config.validation.hasSchema && config.size > 1000) {
        issues.push({
          id: `missing-validation-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          type: 'validation',
          severity: 'medium',
          file: config.filePath,
          description: 'Large configuration file lacks schema validation',
          impact: { security: 6, performance: 4, maintainability: 8 },
          recommendation: 'Add JSON Schema or equivalent validation for configuration files',
          autoFixable: false,
          codeExample: {
            before: '// No validation schema',
            after: `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "server": { "type": "object" }
  },
  "required": ["server"]
}`,
          },
        });
      }
    }

    return issues;
  }

  private detectPerformanceIssues(configFiles: ConfigFileInfo[]): ConfigurationIssue[] {
    const issues: ConfigurationIssue[] = [];

    for (const config of configFiles) {
      // Large configuration files
      if (config.size > 1024 * 1024) { // 1MB
        issues.push({
          id: `large-config-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          type: 'performance',
          severity: 'high',
          file: config.filePath,
          description: `Configuration file is very large (${
            (config.size / 1024 / 1024).toFixed(2)
          }MB)`,
          impact: { security: 2, performance: 9, maintainability: 6 },
          recommendation: 'Split large configuration into smaller, focused files',
          autoFixable: false,
        });
      }

      // Deep nesting
      if (config.structure.depth > 8) {
        issues.push({
          id: `deep-nesting-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          type: 'performance',
          severity: 'medium',
          file: config.filePath,
          description: `Configuration has deep nesting (depth: ${config.structure.depth})`,
          impact: { security: 1, performance: 6, maintainability: 7 },
          recommendation: 'Flatten configuration structure to improve readability and performance',
          autoFixable: false,
        });
      }
    }

    return issues;
  }

  private detectMaintainabilityIssues(
    configFiles: ConfigFileInfo[],
    environmentVariables: EnvironmentVariableInfo[],
  ): ConfigurationIssue[] {
    const issues: ConfigurationIssue[] = [];

    // Unused environment variables
    const unusedEnvVars = environmentVariables.filter(env => env.usageLocations.length === 0);
    if (unusedEnvVars.length > 0) {
      issues.push({
        id: `unused-env-vars-${Date.now()}`,
        type: 'maintainability',
        severity: 'low',
        file: 'environment',
        description: `${unusedEnvVars.length} unused environment variables detected`,
        impact: { security: 2, performance: 1, maintainability: 6 },
        recommendation: 'Remove unused environment variables',
        autoFixable: true,
      });
    }

    // Missing documentation
    for (const config of configFiles) {
      if (config.structure.keys > 20 && config.size > 5000) {
        // Large config without documentation
        issues.push({
          id: `missing-docs-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          type: 'maintainability',
          severity: 'medium',
          file: config.filePath,
          description: 'Large configuration file lacks documentation',
          impact: { security: 2, performance: 1, maintainability: 8 },
          recommendation: 'Add inline comments and documentation for configuration options',
          autoFixable: false,
        });
      }
    }

    return issues;
  }

  private detectStructuralIssues(configFiles: ConfigFileInfo[]): ConfigurationIssue[] {
    const issues: ConfigurationIssue[] = [];

    for (const config of configFiles) {
      // Too many top-level keys
      if (config.structure.keys > 50) {
        issues.push({
          id: `too-many-keys-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          type: 'structure',
          severity: 'medium',
          file: config.filePath,
          description: `Configuration has too many keys (${config.structure.keys})`,
          impact: { security: 1, performance: 4, maintainability: 7 },
          recommendation: 'Group related configuration options into nested objects',
          autoFixable: false,
        });
      }
    }

    return issues;
  }

  /**
   * Security analysis methods
   */
  private detectHardcodedSecrets(content: string, filePath: string): SecurityFinding[] {
    const findings: SecurityFinding[] = [];
    const lines = content.split('\n');

    for (const [secretType, pattern] of this.secretPatterns) {
      const matches = content.matchAll(new RegExp(pattern.source, 'gi'));

      for (const match of matches) {
        const lineNumber = this.getLineNumber(content, match.index!);

        findings.push({
          id: `secret-${secretType}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          type: 'hardcoded-secret',
          severity: secretType.includes('private-key') ? 'critical' : 'high',
          file: filePath,
          location: {
            line: lineNumber,
            column: match.index! - content.lastIndexOf('\n', match.index!) - 1,
            key: secretType,
            value: '[REDACTED]',
          },
          description: `Hardcoded ${secretType} detected in configuration`,
          secretType: secretType as SecurityFinding['secretType'],
          remediation: {
            immediate: [
              'Remove the hardcoded secret from version control',
              'Revoke and regenerate the compromised secret',
              'Move secret to environment variables or secure vault',
            ],
            longTerm: [
              'Implement proper secret management solution',
              'Add pre-commit hooks to prevent secret commits',
              'Regular security scanning of configuration files',
            ],
            preventive: [
              'Use environment variables for all sensitive values',
              'Implement configuration validation',
              'Regular security audits',
            ],
          },
          riskScore: secretType.includes('private-key') ? 10 : 8,
        });
      }
    }

    return findings;
  }

  private detectInsecureDefaults(content: string, filePath: string): SecurityFinding[] {
    const findings: SecurityFinding[] = [];

    const insecurePatterns = [
      {
        pattern: /debug\s*[:=]\s*true/i,
        type: 'insecure-default',
        description: 'Debug mode enabled in production',
      },
      {
        pattern: /ssl\s*[:=]\s*false/i,
        type: 'insecure-default',
        description: 'SSL/TLS disabled',
      },
      {
        pattern: /secure\s*[:=]\s*false/i,
        type: 'insecure-default',
        description: 'Security feature disabled',
      },
      {
        pattern: /password\s*[:=]\s*["'](?:admin|password|123456?)["']/i,
        type: 'insecure-default',
        description: 'Weak default password',
      },
    ];

    for (const { pattern, type, description } of insecurePatterns) {
      const matches = content.matchAll(new RegExp(pattern.source, 'gi'));

      for (const match of matches) {
        const lineNumber = this.getLineNumber(content, match.index!);

        findings.push({
          id: `insecure-default-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          type: type as SecurityFinding['type'],
          severity: 'medium',
          file: filePath,
          location: {
            line: lineNumber,
            column: match.index! - content.lastIndexOf('\n', match.index!) - 1,
            key: 'configuration',
          },
          description,
          remediation: {
            immediate: ['Change default value to secure setting'],
            longTerm: ['Implement security-by-default configuration'],
            preventive: ['Regular security configuration reviews'],
          },
          riskScore: 6,
        });
      }
    }

    return findings;
  }

  private detectExposedConfiguration(configFile: ConfigFileInfo): SecurityFinding[] {
    const findings: SecurityFinding[] = [];

    // Check if sensitive config is in public locations
    if (
      configFile.security.accessLevel === 'secret'
      && (configFile.filePath.includes('public/')
        || configFile.filePath.includes('static/')
        || configFile.filePath.includes('assets/'))
    ) {
      findings.push({
        id: `exposed-config-${Date.now()}`,
        type: 'exposed-config',
        severity: 'critical',
        file: configFile.filePath,
        location: { line: 1, column: 1, key: 'file-location' },
        description: 'Sensitive configuration file in public directory',
        remediation: {
          immediate: ['Move configuration file to secure location'],
          longTerm: ['Implement proper configuration management'],
          preventive: ['Configuration location auditing'],
        },
        riskScore: 9,
      });
    }

    return findings;
  }

  private validateEncryptionPractices(content: string, filePath: string): SecurityFinding[] {
    const findings: SecurityFinding[] = [];

    // Check for weak encryption indicators
    if (content.includes('MD5') || content.includes('SHA1')) {
      findings.push({
        id: `weak-encryption-${Date.now()}`,
        type: 'weak-encryption',
        severity: 'high',
        file: filePath,
        location: { line: 1, column: 1, key: 'encryption' },
        description: 'Weak encryption algorithm detected (MD5/SHA1)',
        remediation: {
          immediate: ['Replace with stronger algorithms (SHA-256 or better)'],
          longTerm: ['Implement cryptographic standards policy'],
          preventive: ['Regular cryptographic review'],
        },
        riskScore: 7,
      });
    }

    return findings;
  }

  private getLineNumber(content: string, index: number): number {
    return content.substring(0, index).split('\n').length;
  }

  /**
   * Helper methods for schema handling and optimization suggestions
   */
  private findSchemaForConfig(
    filePath: string,
    configType: ConfigFileInfo['type'],
  ): string | null {
    // Look for schema files in common locations
    const possibleSchemas = [
      `${filePath}.schema.json`,
      `${path.dirname(filePath)}/schema/${path.basename(filePath)}.json`,
      `${path.dirname(filePath)}/schemas/${path.basename(filePath)}.json`,
    ];

    // This would check if schema files exist
    return null; // Placeholder
  }

  private async loadConfigSchema(schemaPath: string): Promise<ConfigSchema> {
    // This would load and parse the schema file
    return {} as ConfigSchema; // Placeholder
  }

  private validateAgainstSchema(
    config: any,
    schema: ConfigSchema,
    filePath: string,
  ): ValidationError[] {
    // This would perform actual schema validation
    return []; // Placeholder
  }

  private calculateOverallMetrics(
    configFiles: ConfigFileInfo[],
    securityFindings: SecurityFinding[],
    issues: ConfigurationIssue[],
  ): ConfigurationAnalysis['overallMetrics'] {
    // Calculate security score (0-1)
    const criticalFindings = securityFindings.filter(f => f.severity === 'critical').length;
    const highFindings = securityFindings.filter(f => f.severity === 'high').length;
    const securityScore = Math.max(0, 1 - (criticalFindings * 0.3 + highFindings * 0.15));

    // Calculate performance score
    const performanceIssues = issues.filter(i => i.type === 'performance').length;
    const performanceScore = Math.max(0, 1 - (performanceIssues * 0.1));

    // Calculate maintainability score
    const maintainabilityIssues = issues.filter(i => i.type === 'maintainability').length;
    const maintainabilityScore = Math.max(0, 1 - (maintainabilityIssues * 0.08));

    // Calculate validation coverage
    const validatedConfigs = configFiles.filter(c => c.validation.hasSchema).length;
    const validationCoverage = configFiles.length > 0 ? validatedConfigs / configFiles.length : 1;

    return {
      securityScore,
      performanceScore,
      maintainabilityScore,
      validationCoverage,
    };
  }
}
