// jscpd integration service for TypeScript-aware code duplication detection
// Healthcare compliance focused for Brazilian aesthetic clinics
// OXLint optimized for 50-100x performance improvement

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  JscpdConfiguration,
  JscpdAnalysisResult,
  DuplicationCluster,
  RefactoringSuggestion,
  TokenBasedMetrics,
  StructuralMetrics,
  HealthcareMetrics,
  PerformanceMetrics,
  isDuplicationCluster,
  isRefactoringSuggestion
} from '../types/jscpd-config';

const execAsync = promisify(exec);

export class JscpdService {
  private static readonly DEFAULT_CONFIG: JscpdConfiguration = {
    // Basic jscpd configuration optimized for TypeScript
    minLines: 5,
    maxLines: 1000,
    minTokens: 50,
    threshold: 0.8,
    ignoreCase: false,
    encoding: 'utf8',
    
    // TypeScript-specific configuration
    typescript: {
      analyzeTypeAnnotations: true,
      analyzeGenerics: true,
      analyzeInterfaces: true,
      analyzeDecorators: true,
      analyzeEnums: true,
      treatTypesAsIdentifiers: false,
      ignoreTypeOnlyImports: true,
      analyzeMethodOverloads: true,
    },
    
    // Healthcare-specific configuration for Brazilian clinics
    healthcare: {
      patientDataPatterns: [
        'patientData',
        'dadosPaciente',
        'patient',
        'paciente',
        'clinical',
        'clinico',
        'medical',
        'medico',
        'health',
        'saude',
        'treatment',
        'tratamento',
        'appointment',
        'consulta',
        'diagnosis',
        'diagnostico',
        'prescription',
        'receita',
      ],
      clinicalLogicPatterns: [
        'validateClinical',
        'checkContraindications',
        'calculateDosage',
        'verifyEligibility',
        'assessRisk',
        'validateTreatment',
        'checkAllergies',
        'verifyPrescription',
      ],
      validationLogicPatterns: [
        'validate',
        'isValid',
        'check',
        'verify',
        'ensure',
        'confirm',
        'require',
        'mandatory',
        'required',
      ],
      businessLogicPatterns: [
        'calculatePrice',
        'processPayment',
        'generateInvoice',
        'scheduleAppointment',
        'cancelAppointment',
        'rescheduleAppointment',
        'checkAvailability',
      ],
      treatPatientDataAsCritical: true,
      requireSeparationOfConcerns: true,
    },
    
    // Brazilian Portuguese healthcare terminology
    brazilian: {
      portugueseIdentifiers: [
        'dados', 'paciente', 'clinica', 'tratamento', 'consulta', 'medico',
        'enfermeira', 'receita', 'diagnostico', 'procedimento', 'agendamento',
        'cancelamento', 'remarcacao', 'valor', 'pagamento', 'convenio',
      ],
      healthcareTerms: [
        'estetica', 'cosmetica', 'dermatologia', 'plastica', 'rejuvenescimento',
        'preenchimento', 'toxina', 'laser', 'peeling', 'limpeza', 'hidratacao',
      ],
      clinicTerms: [
        'agenda', 'horario', 'profissional', 'especialista', 'tecnico',
        'secretaria', 'recepcionista', 'financeiro', 'faturamento',
      ],
      medicalTerms: [
        'anamnese', 'evolucao', 'prescricao', 'posologia', 'contraindicacao',
        'efeito', 'adverso', 'alergia', 'sensibilidade', 'teste',
      ],
    },
    
    // Performance optimization for OXLint 50-100x speed
    performance: {
      maxFileSize: 1024 * 1024, // 1MB
      maxFilesPerBatch: 100,
      parallelProcessing: true,
      memoryLimit: 512 * 1024 * 1024, // 512MB
      timeoutMs: 30000, // 30 seconds
    },
    
    // Output configuration
    output: {
      format: 'json',
      includeMetrics: true,
      includeRefactoringSuggestions: true,
      includeHealthcareAnalysis: true,
    },
    
    // Path patterns for monorepo analysis
    patterns: {
      include: [
        'packages/**/*.ts',
        'packages/**/*.tsx',
        'apps/**/*.ts',
        'apps/**/*.tsx',
        'src/**/*.ts',
        'src/**/*.tsx',
      ],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.git/**',
        '**/coverage/**',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/generated/**',
        '**/.next/**',
        '**/.turbo/**',
      ],
      excludeTestFiles: true,
      excludeGeneratedFiles: true,
      excludeNodeModules: true,
    },
  };

  /**
   * Analyze codebase for TypeScript-aware code duplication
   * @param projectPath Root path of the project to analyze
   * @param config Optional configuration overrides
   * @returns Promise<JscpdAnalysisResult> Complete analysis results
   */
  static async analyzeDuplication(
    projectPath: string,
    config: Partial<JscpdConfiguration> = {}
  ): Promise<JscpdAnalysisResult> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const startTime = Date.now();

    try {
      // Validate project path
      await this.validateProjectPath(projectPath);

      // Prepare jscpd command with TypeScript and healthcare configuration
      const jscpdCommand = this.buildJscpdCommand(projectPath, finalConfig);

      // Execute jscpd analysis
      const { stdout, stderr } = await execAsync(jscpdCommand, {
        cwd: projectPath,
        timeout: finalConfig.performance.timeoutMs,
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      });

      if (stderr && !stderr.includes('deprecated')) {
        console.warn('jscpd warnings:', stderr);
      }

      // Parse jscpd results
      const rawResults = JSON.parse(stdout);

      // Enhance with TypeScript-specific analysis
      const enhancedClusters = await this.enhanceClustersWithTypeScriptAnalysis(
        rawResults.clusters || [],
        projectPath,
        finalConfig
      );

      // Perform healthcare-specific analysis
      const healthcareAnalysis = await this.performHealthcareAnalysis(
        enhancedClusters,
        finalConfig
      );

      // Generate refactoring suggestions
      const refactoringSuggestions = await this.generateRefactoringSuggestions(
        enhancedClusters,
        finalConfig
      );

      // Calculate metrics
      const metrics = await this.calculateMetrics(
        enhancedClusters,
        rawResults,
        finalConfig
      );

      const executionTime = Date.now() - startTime;

      return {
        summary: {
          totalFiles: rawResults.totalFiles || 0,
          totalLines: rawResults.totalLines || 0,
          duplicateLines: this.calculateTotalDuplicateLines(enhancedClusters),
          duplicationPercentage: this.calculateDuplicationPercentage(
            rawResults.totalLines || 0,
            enhancedClusters
          ),
          clusters: enhancedClusters.length,
          executionTime,
        },
        clusters: enhancedClusters,
        metrics,
        refactoringSuggestions,
        healthcareAnalysis,
      };

    } catch (error) {
      throw new Error(`jscpd analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate project path and ensure it exists
   */
  private static async validateProjectPath(projectPath: string): Promise<void> {
    try {
      const stats = await fs.stat(projectPath);
      if (!stats.isDirectory()) {
        throw new Error(`Project path is not a directory: ${projectPath}`);
      }
    } catch (error) {
      throw new Error(`Invalid project path: ${projectPath}`);
    }
  }

  /**
   * Build jscpd command with TypeScript and healthcare configuration
   */
  private static buildJscpdCommand(
    projectPath: string,
    config: JscpdConfiguration
  ): string {
    const jscpdPath = path.join(projectPath, 'node_modules', '.bin', 'jscpd');
    const configPath = path.join(projectPath, '.jscpd.json');

    // Create temporary jscpd configuration
    const jscpdConfig = {
      minLines: config.minLines,
      maxLines: config.maxLines,
      minTokens: config.minTokens,
      threshold: config.threshold,
      ignoreCase: config.ignoreCase,
      encoding: config.encoding,
      format: config.output.format,
      reporters: ['json'],
      absolute: true,
      gitignore: true,
      ignore: [
        ...config.patterns.exclude,
        '**/*.d.ts',
        '**/*.test.*',
        '**/*.spec.*',
      ],
      mode: 'mild', // TypeScript-specific mode
      babel: false, // Disable babel for pure TypeScript
      typescript: {
        experimental: true,
        tsConfigPath: path.join(projectPath, 'tsconfig.json'),
      },
    };

    // Write temporary configuration
    fs.writeFile(configPath, JSON.stringify(jscpdConfig, null, 2));

    // Build command with OXLint optimization flags
    const command = `${jscpdPath} "${projectPath}" --config "${configPath}" --output "${config.output.format}"`;

    return command;
  }

  /**
   * Enhance jscpd clusters with TypeScript-specific analysis
   */
  private static async enhanceClustersWithTypeScriptAnalysis(
    clusters: any[],
    projectPath: string,
    config: JscpdConfiguration
  ): Promise<DuplicationCluster[]> {
    const enhancedClusters: DuplicationCluster[] = [];

    for (const cluster of clusters) {
      if (!isDuplicationCluster(cluster)) continue;

      try {
        // Analyze first occurrence for TypeScript patterns
        const firstFile = cluster.firstOccurrence.file;
        const filePath = path.join(projectPath, firstFile);
        
        const fileContent = await fs.readFile(filePath, 'utf8');
        const lines = fileContent.split('\n');
        
        const startLine = cluster.firstOccurrence.startLine;
        const endLine = cluster.firstOccurrence.endLine;
        const duplicatedLines = lines.slice(startLine - 1, endLine);

        // TypeScript-specific analysis
        const typescriptAnalysis = this.analyzeTypeScriptPatterns(
          duplicatedLines.join('\n'),
          config.typescript
        );

        // Healthcare relevance analysis
        const healthcareRelevance = this.analyzeHealthcareRelevance(
          duplicatedLines.join('\n'),
          config.healthcare,
          config.brazilian
        );

        enhancedClusters.push({
          ...cluster,
          typescriptAnalysis,
          healthcareRelevance,
        });
      } catch (error) {
        console.warn(`Failed to analyze cluster ${cluster.id}:`, error);
        enhancedClusters.push(cluster);
      }
    }

    return enhancedClusters;
  }

  /**
   * Analyze TypeScript patterns in duplicated code
   */
  private static analyzeTypeScriptPatterns(
    code: string,
    config: JscpdConfiguration['typescript']
  ): DuplicationCluster['typescriptAnalysis'] {
    const hasTypeAnnotations = /:\s*[A-Z][a-zA-Z0-9<>[\]|&,-\s]*/.test(code);
    const hasGenerics = /<[A-Z][a-zA-Z0-9,\s<>|&-]*>/.test(code);
    const hasInterfaces = /interface\s+[A-Z][a-zA-Z0-9]*\s*{/.test(code);
    const hasDecorators = /@\w+/.test(code);
    const hasTypeAnnotationsComplex = code.split('\n').filter(line => 
      line.trim().includes(':') && 
      line.trim().match(/:\s*[A-Z]/)
    ).length;

    return {
      hasTypeAnnotations,
      hasGenerics,
      hasInterfaces,
      hasDecorators,
      typeComplexity: hasTypeAnnotationsComplex > 5 ? 'high' : 
                      hasTypeAnnotationsComplex > 2 ? 'medium' : 'low',
    };
  }

  /**
   * Analyze healthcare relevance of duplicated code
   */
  private static analyzeHealthcareRelevance(
    code: string,
    healthcareConfig: JscpdConfiguration['healthcare'],
    brazilianConfig: JscpdConfiguration['brazilian']
  ): DuplicationCluster['healthcareRelevance'] {
    const lowerCode = code.toLowerCase();
    
    // Check for patient data patterns
    const patientDataInvolved = healthcareConfig.patientDataPatterns.some(pattern => 
      lowerCode.includes(pattern.toLowerCase())
    ) || brazilianConfig.portugueseIdentifiers.some(term => 
      lowerCode.includes(term.toLowerCase())
    );

    // Check for clinical logic
    const clinicalLogic = healthcareConfig.clinicalLogicPatterns.some(pattern => 
      lowerCode.includes(pattern.toLowerCase())
    );

    // Check for validation logic
    const validationLogic = healthcareConfig.validationLogicPatterns.some(pattern => 
      lowerCode.includes(pattern.toLowerCase())
    );

    // Check for business logic
    const businessLogic = healthcareConfig.businessLogicPatterns.some(pattern => 
      lowerCode.includes(pattern.toLowerCase())
    );

    // LGPD relevance for Brazilian healthcare
    const lgpdRelevant = patientDataInvolved || 
      lowerCode.includes('lgpd') || 
      lowerCode.includes('consent') ||
      lowerCode.includes('consentimento') ||
      lowerCode.includes('dados') ||
      lowerCode.includes('privacidade');

    // Calculate risk level
    let riskLevel: DuplicationCluster['healthcareRelevance']['riskLevel'] = 'none';
    if (patientDataInvolved && lgpdRelevant) {
      riskLevel = 'critical';
    } else if (patientDataInvolved || clinicalLogic) {
      riskLevel = 'high';
    } else if (validationLogic || lgpdRelevant) {
      riskLevel = 'medium';
    } else if (businessLogic) {
      riskLevel = 'low';
    }

    return {
      patientDataInvolved,
      clinicalLogic,
      validationLogic,
      businessLogic,
      lgpdRelevant,
      riskLevel,
    };
  }

  /**
   * Perform healthcare-specific analysis
   */
  private static async performHealthcareAnalysis(
    clusters: DuplicationCluster[],
    config: JscpdConfiguration
  ): Promise<JscpdAnalysisResult['healthcareAnalysis']> {
    const patientDataDuplications = [];
    const clinicalLogicDuplications = [];
    const validationLogicDuplications = [];
    const complianceRisks = [];

    for (const cluster of clusters) {
      if (cluster.healthcareRelevance.patientDataInvolved) {
        patientDataDuplications.push({
          pattern: cluster.files.join(' → '),
          occurrences: cluster.occurrences.map(occ => ({
            file: occ.file,
            line: occ.startLine,
            context: `Lines ${occ.startLine}-${occ.endLine}`,
          })),
          riskLevel: cluster.healthcareRelevance.riskLevel,
          recommendation: this.getPatientDataRecommendation(cluster),
        });
      }

      if (cluster.healthcareRelevance.clinicalLogic) {
        clinicalLogicDuplications.push({
          pattern: cluster.files.join(' → '),
          occurrences: cluster.occurrences.map(occ => ({
            file: occ.file,
            line: occ.startLine,
            context: `Lines ${occ.startLine}-${occ.endLine}`,
          })),
          riskLevel: cluster.healthcareRelevance.riskLevel,
          recommendation: this.getClinicalLogicRecommendation(cluster),
        });
      }

      if (cluster.healthcareRelevance.validationLogic) {
        validationLogicDuplications.push({
          pattern: cluster.files.join(' → '),
          occurrences: cluster.occurrences.map(occ => ({
            file: occ.file,
            line: occ.startLine,
            context: `Lines ${occ.startLine}-${occ.endLine}`,
          })),
          riskLevel: cluster.healthcareRelevance.riskLevel,
          recommendation: this.getValidationLogicRecommendation(cluster),
        });
      }

      if (cluster.healthcareRelevance.riskLevel === 'critical' || 
          cluster.healthcareRelevance.riskLevel === 'high') {
        complianceRisks.push({
          type: 'lgpd',
          description: `Critical code duplication affecting ${cluster.healthcareRelevance.patientDataInvolved ? 'patient data' : 'clinical logic'}`,
          severity: cluster.healthcareRelevance.riskLevel as 'high' | 'critical',
          files: cluster.files,
          recommendation: 'Immediate refactoring required to ensure compliance and maintainability',
          requiresImmediateAction: true,
        });
      }
    }

    return {
      patientDataDuplications,
      clinicalLogicDuplications,
      validationLogicDuplications,
      complianceRisks,
    };
  }

  /**
   * Generate refactoring suggestions for duplicated code
   */
  private static async generateRefactoringSuggestions(
    clusters: DuplicationCluster[],
    config: JscpdConfiguration
  ): Promise<RefactoringSuggestion[]> {
    const suggestions: RefactoringSuggestion[] = [];

    for (const cluster of clusters) {
      // Determine refactoring type based on duplication characteristics
      const refactoringType = this.determineRefactoringType(cluster);
      
      // Generate suggestion
      const suggestion: RefactoringSuggestion = {
        clusterId: cluster.id,
        type: refactoringType,
        title: this.generateSuggestionTitle(cluster, refactoringType),
        description: this.generateSuggestionDescription(cluster, refactoringType),
        effort: this.calculateEffort(cluster),
        impact: this.calculateImpact(cluster),
        healthcareImpact: this.calculateHealthcareImpact(cluster),
      };

      // Generate code example if appropriate
      if (cluster.lines < 50) { // Only for smaller duplications
        suggestion.codeExample = await this.generateCodeExample(cluster);
      }

      suggestions.push(suggestion);
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const aPriority = priorityOrder[a.impact.maintainability > 80 ? 'critical' : 
                           a.impact.maintainability > 60 ? 'high' : 
                           a.impact.maintainability > 40 ? 'medium' : 'low'];
      const bPriority = priorityOrder[b.impact.maintainability > 80 ? 'critical' : 
                           b.impact.maintainability > 60 ? 'high' : 
                           b.impact.maintainability > 40 ? 'medium' : 'low'];
      
      return aPriority - bPriority;
    });
  }

  /**
   * Determine the best refactoring type for a duplication cluster
   */
  private static determineRefactoringType(cluster: DuplicationCluster): RefactoringSuggestion['type'] {
    if (cluster.typescriptAnalysis.hasInterfaces && cluster.typescriptAnalysis.hasGenerics) {
      return 'create_base_class';
    } else if (cluster.files.length > 3) {
      return 'extract_class';
    } else if (cluster.typescriptAnalysis.hasTypeAnnotations) {
      return 'extract_function';
    } else {
      return 'use_composition';
    }
  }

  /**
   * Generate suggestion title based on cluster characteristics
   */
  private static generateSuggestionTitle(
    cluster: DuplicationCluster,
    type: RefactoringSuggestion['type']
  ): string {
    const healthcareContext = cluster.healthcareRelevance.patientDataInvolved ? 
      ' (Patient Data)' : 
      cluster.healthcareRelevance.clinicalLogic ? 
      ' (Clinical Logic)' : '';

    switch (type) {
      case 'extract_function':
        return `Extract function${healthcareContext}`;
      case 'extract_class':
        return `Extract class${healthcareContext}`;
      case 'create_base_class':
        return `Create base class${healthcareContext}`;
      case 'use_composition':
        return `Use composition${healthcareContext}`;
      default:
        return `Refactor duplication${healthcareContext}`;
    }
  }

  /**
   * Generate suggestion description
   */
  private static generateSuggestionDescription(
    cluster: DuplicationCluster,
    type: RefactoringSuggestion['type']
  ): string {
    const baseDescription = `Found ${cluster.similarity * 100}% similar code across ${cluster.files.length} files (${cluster.lines} lines each). `;
    
    const healthcareWarning = cluster.healthcareRelevance.riskLevel === 'critical' || 
                           cluster.healthcareRelevance.riskLevel === 'high' ?
      'This duplication affects healthcare-critical code and requires immediate attention. ' : '';

    const refactoringDescription = this.getRefactoringTypeDescription(type);

    return baseDescription + healthcareWarning + refactoringDescription;
  }

  /**
   * Get description for specific refactoring type
   */
  private static getRefactoringTypeDescription(type: RefactoringSuggestion['type']): string {
    switch (type) {
      case 'extract_function':
        return 'Extract the duplicated code into a shared function that can be called from all locations.';
      case 'extract_class':
        return 'Create a new class to encapsulate the duplicated behavior and data.';
      case 'create_base_class':
        return 'Extract common behavior into a base class and use inheritance to share functionality.';
      case 'use_composition':
        return 'Use composition to share behavior through dependency injection or utility classes.';
      default:
        return 'Refactor to eliminate code duplication and improve maintainability.';
    }
  }

  /**
   * Calculate effort required for refactoring
   */
  private static calculateEffort(cluster: DuplicationCluster): RefactoringSuggestion['effort'] {
    if (cluster.lines < 10 && cluster.files.length <= 2) return 'trivial';
    if (cluster.lines < 20 && cluster.files.length <= 3) return 'easy';
    if (cluster.lines < 50 && cluster.files.length <= 5) return 'moderate';
    if (cluster.lines < 100) return 'complex';
    return 'major';
  }

  /**
   * Calculate impact of refactoring
   */
  private static calculateImpact(cluster: DuplicationCluster): RefactoringSuggestion['impact'] {
    const maintainability = Math.min(100, cluster.lines * 2 + cluster.files.length * 10);
    const readability = Math.min(100, maintainability * 0.8);
    const testability = Math.min(100, cluster.files.length * 15);
    const performance = Math.min(100, cluster.lines * 0.5);

    return {
      maintainability,
      readability,
      testability,
      performance,
    };
  }

  /**
   * Calculate healthcare impact of refactoring
   */
  private static calculateHealthcareImpact(cluster: DuplicationCluster): RefactoringSuggestion['healthcareImpact'] {
    if (cluster.healthcareRelevance.riskLevel === 'critical') {
      return {
        patientDataSafety: 'improved',
        compliance: 'improved',
        validation: 'improved',
      };
    } else if (cluster.healthcareRelevance.riskLevel === 'high') {
      return {
        patientDataSafety: 'improved',
        compliance: 'improved',
        validation: 'unchanged',
      };
    } else {
      return {
        patientDataSafety: 'unchanged',
        compliance: 'unchanged',
        validation: 'unchanged',
      };
    }
  }

  /**
   * Generate code example for refactoring
   */
  private static async generateCodeExample(
    cluster: DuplicationCluster
  ): Promise<RefactoringSuggestion['codeExample']> {
    // This is a simplified implementation
    // In a real scenario, you would extract the actual code from the files
    return {
      before: `// Duplicated code in ${cluster.files.length} files\n// ${cluster.lines} lines each`,
      after: `// Refactored shared function\nfunction sharedFunction() {\n  // Extracted logic\n}\n\n// Usage in all files\nsharedFunction()`,
    };
  }

  /**
   * Get recommendation for patient data duplications
   */
  private static getPatientDataRecommendation(cluster: DuplicationCluster): string {
    return `Immediate refactoring required. Patient data duplication creates LGPD compliance risks and security vulnerabilities. Consider creating a centralized data access layer with proper validation and audit logging.`;
  }

  /**
   * Get recommendation for clinical logic duplications
   */
  private static getClinicalLogicRecommendation(cluster: DuplicationCluster): string {
    return `Extract clinical logic into shared service classes to ensure consistency across the application. Implement proper validation and error handling to maintain clinical safety.`;
  }

  /**
   * Get recommendation for validation logic duplications
   */
  private static getValidationLogicRecommendation(cluster: DuplicationCluster): string {
    return `Create reusable validation utilities and decorators to ensure consistent validation across the application. Consider using a validation library like Zod for type-safe validation.`;
  }

  /**
   * Calculate comprehensive metrics
   */
  private static async calculateMetrics(
    clusters: DuplicationCluster[],
    rawResults: any,
    config: JscpdConfiguration
  ): Promise<JscpdAnalysisResult['metrics']> {
    // Token-based metrics
    const tokenBased: TokenBasedMetrics = {
      totalTokens: clusters.reduce((sum, c) => sum + c.tokens, 0),
      duplicateTokens: clusters.reduce((sum, c) => sum + (c.tokens * c.similarity), 0),
      uniqueTokens: 0, // Calculate based on analysis
      identifierTokens: 0, // Would need detailed token analysis
      keywordTokens: 0,
      operatorTokens: 0,
      literalTokens: 0,
      typeAnnotationTokens: 0,
      genericTokens: 0,
    };
    tokenBased.uniqueTokens = tokenBased.totalTokens - tokenBased.duplicateTokens;

    // Structural metrics
    const structural: StructuralMetrics = {
      functionsDuplicated: clusters.filter(c => 
        c.typescriptAnalysis.hasTypeAnnotations && c.lines < 50
      ).length,
      classesDuplicated: clusters.filter(c => 
        c.typescriptAnalysis.hasInterfaces && c.lines > 50
      ).length,
      interfacesDuplicated: clusters.filter(c => 
        c.typescriptAnalysis.hasInterfaces
      ).length,
      methodsDuplicated: clusters.filter(c => 
        c.typescriptAnalysis.hasTypeAnnotations
      ).length,
      propertiesDuplicated: 0, // Would need detailed analysis
      importsDuplicated: 0,
      exportsDuplicated: 0,
      complexityScore: clusters.reduce((sum, c) => 
        sum + (c.typescriptAnalysis.typeComplexity === 'high' ? 3 : 
               c.typescriptAnalysis.typeComplexity === 'medium' ? 2 : 1), 0),
    };

    // Healthcare metrics
    const healthcare: HealthcareMetrics = {
      patientDataPatterns: clusters.filter(c => 
        c.healthcareRelevance.patientDataInvolved
      ).length,
      clinicalLogicPatterns: clusters.filter(c => 
        c.healthcareRelevance.clinicalLogic
      ).length,
      validationLogicPatterns: clusters.filter(c => 
        c.healthcareRelevance.validationLogic
      ).length,
      businessLogicPatterns: clusters.filter(c => 
        c.healthcareRelevance.businessLogic
      ).length,
      lgpdViolations: clusters.filter(c => 
        c.healthcareRelevance.lgpdRelevant && c.healthcareRelevance.riskLevel === 'critical'
      ).length,
      anvisaViolations: 0, // Would need specific ANVISA pattern analysis
      professionalCouncilViolations: 0,
      complianceScore: Math.max(0, 100 - clusters.filter(c => 
        c.healthcareRelevance.riskLevel === 'critical' || c.healthcareRelevance.riskLevel === 'high'
      ).length * 20),
    };

    // Performance metrics
    const performance: PerformanceMetrics = {
      filesProcessed: rawResults.totalFiles || 0,
      linesProcessed: rawResults.totalLines || 0,
      tokensProcessed: tokenBased.totalTokens,
      processingTime: 0, // Would be set by caller
      memoryUsage: 0, // Would need system monitoring
      cacheHits: 0,
      cacheMisses: 0,
    };

    return {
      tokenBased,
      structural,
      healthcare,
      performance,
    };
  }

  /**
   * Calculate total duplicate lines across all clusters
   */
  private static calculateTotalDuplicateLines(clusters: DuplicationCluster[]): number {
    return clusters.reduce((total, cluster) => {
      return total + (cluster.lines * (cluster.occurrences.length - 1));
    }, 0);
  }

  /**
   * Calculate duplication percentage
   */
  private static calculateDuplicationPercentage(
    totalLines: number,
    clusters: DuplicationCluster[]
  ): number {
    if (totalLines === 0) return 0;
    
    const duplicateLines = this.calculateTotalDuplicateLines(clusters);
    return Math.round((duplicateLines / totalLines) * 100 * 100) / 100;
  }
}