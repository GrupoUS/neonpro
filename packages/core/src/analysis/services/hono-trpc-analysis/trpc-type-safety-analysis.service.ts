// tRPC Type Safety Analysis Service - Atomic Subtask 2 of 10
// Hono + tRPC v11 Edge-First Architecture Analysis
// Brazilian Healthcare Compliance Focused

import * as fs from 'fs/promises';
import * as path from 'path';
import type {
  TrpcTypeSafetyAnalysisResult,
  ProcedureTypeData,
  ValidationSchema,
  TypeInferenceData,
  TypeSafetyIssue,
} from './types/hono-trpc-analysis.types.js';
import type { HonoTrpcAnalysisConfig } from './hono-trpc-analysis.service.js';

export class TrpcTypeSafetyAnalysisService {
  private config: HonoTrpcAnalysisConfig;

  constructor(config: HonoTrpcAnalysisConfig) {
    this.config = config;
  }

  /**
   * Analyze tRPC type safety across the codebase
   */
  async analyze(files: string[]): Promise<TrpcTypeSafetyAnalysisResult> {
    const procedures: ProcedureTypeData[] = [];
    const inputSchemas: ValidationSchema[] = [];
    const outputSchemas: ValidationSchema[] = [];
    const typeInferences: TypeInferenceData[] = [];
    const issues: TypeSafetyIssue[] = [];

    let patientDataTypeValidations = 0;
    let clinicalLogicValidations = 0;
    let complianceValidations = 0;
    let auditTrailValidations = 0;

    // Analyze each file for tRPC procedures and type safety
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        
        // Extract tRPC procedures
        const fileProcedures = this.extractProceduresFromFile(file, content);
        procedures.push(...fileProcedures);
        
        // Extract validation schemas
        const fileInputSchemas = this.extractInputSchemas(file, content);
        inputSchemas.push(...fileInputSchemas);
        
        const fileOutputSchemas = this.extractOutputSchemas(file, content);
        outputSchemas.push(...fileOutputSchemas);
        
        // Analyze type inference
        const fileTypeInferences = this.analyzeTypeInference(file, content);
        typeInferences.push(...fileTypeInferences);
        
        // Detect type safety issues
        const fileIssues = this.detectTypeSafetyIssues(file, content);
        issues.push(...fileIssues);
        
        // Count healthcare-specific validations
        patientDataTypeValidations += this.countPatientDataValidations(content);
        clinicalLogicValidations += this.countClinicalLogicValidations(content);
        complianceValidations += this.countComplianceValidations(content);
        auditTrailValidations += this.countAuditTrailValidations(content);
        
      } catch (error) {
        console.warn(`Failed to analyze file ${file}:`, error);
      }
    }

    // Calculate type coverage
    const typeSafeProcedures = procedures.filter(p => p.hasInputValidation && p.hasOutputValidation).length;
    const typeCoverage = procedures.length > 0 ? Math.round((typeSafeProcedures / procedures.length) * 100) : 0;

    return {
      summary: {
        totalProcedures: procedures.length,
        typeSafeProcedures,
        inputValidations: inputSchemas.length,
        outputValidations: outputSchemas.length,
        typeCoverage,
      },
      procedures,
      validation: {
        inputSchemas,
        outputSchemas,
        typeInferences,
      },
      healthcare: {
        patientDataTypeValidations,
        clinicalLogicValidations,
        complianceValidations,
        auditTrailValidations,
      },
      issues,
    };
  }

  /**
   * Extract tRPC procedures from file content
   */
  private extractProceduresFromFile(filePath: string, content: string): ProcedureTypeData[] {
    const procedures: ProcedureTypeData[] = [];
    
    // Pattern to match tRPC procedure definitions
    const procedurePattern = /(\w+)\s*:\s*t\s*\.procedure\s*\.\s*(query|mutation|subscription)/g;
    let match;
    
    while ((match = procedurePattern.exec(content)) !== null) {
      const procedureName = match[1];
      const procedureType = match[2] as 'query' | 'mutation' | 'subscription';
      
      // Check if procedure has input validation
      const hasInputValidation = this.hasInputValidation(content, procedureName);
      
      // Check if procedure has output validation
      const hasOutputValidation = this.hasOutputValidation(content, procedureName);
      
      // Check if procedure is healthcare-relevant
      const healthcareRelevant = this.isProcedureHealthcareRelevant(content, procedureName);
      
      procedures.push({
        name: procedureName,
        type: procedureType,
        hasInputValidation,
        hasOutputValidation,
        healthcareRelevant,
      });
    }
    
    return procedures;
  }

  /**
   * Check if procedure has input validation
   */
  private hasInputValidation(content: string, procedureName: string): boolean {
    // Look for .input() calls after the procedure definition
    const procedurePattern = new RegExp(`${procedureName}\\s*:\\s*t\\.procedure[^}]*}`, 's');
    const procedureMatch = content.match(procedurePattern);
    
    if (procedureMatch) {
      return procedureMatch[0].includes('.input(') || 
             procedureMatch[0].includes('z.object(') ||
             procedureMatch[0].includes('z.array(') ||
             procedureMatch[0].includes('z.string(');
    }
    
    return false;
  }

  /**
   * Check if procedure has output validation
   */
  private hasOutputValidation(content: string, procedureName: string): boolean {
    // Look for .output() calls after the procedure definition
    const procedurePattern = new RegExp(`${procedureName}\\s*:\\s*t\\.procedure[^}]*}`, 's');
    const procedureMatch = content.match(procedurePattern);
    
    if (procedureMatch) {
      return procedureMatch[0].includes('.output(');
    }
    
    return false;
  }

  /**
   * Check if procedure is healthcare-relevant
   */
  private isProcedureHealthcareRelevant(content: string, procedureName: string): boolean {
    const healthcareKeywords = [
      'patient', 'paciente', 'clinical', 'clinico', 'medical', 'medico',
      'health', 'saude', 'treatment', 'tratamento', 'appointment', 'consulta',
      'diagnosis', 'diagnostico', 'prescription', 'receita', 'lgpd', 'anvisa',
    ];
    
    const lowerContent = content.toLowerCase();
    const lowerProcedureName = procedureName.toLowerCase();
    
    return healthcareKeywords.some(keyword => 
      lowerContent.includes(keyword) || lowerProcedureName.includes(keyword)
    );
  }

  /**
   * Extract input validation schemas
   */
  private extractInputSchemas(filePath: string, content: string): ValidationSchema[] {
    const schemas: ValidationSchema[] = [];
    
    // Pattern to match input validation schemas
    const inputPattern = /\.input\s*\(\s*(z\.[^(]+\([^)]*\))/g;
    let match;
    
    while ((match = inputPattern.exec(content)) !== null) {
      const schemaDefinition = match[1];
      const patientDataFields = this.extractPatientDataFields(schemaDefinition);
      const validationComplexity = this.assessValidationComplexity(schemaDefinition);
      
      schemas.push({
        procedureName: this.findProcedureName(content, match.index),
        schemaType: 'input',
        patientDataFields,
        validationComplexity,
      });
    }
    
    return schemas;
  }

  /**
   * Extract output validation schemas
   */
  private extractOutputSchemas(filePath: string, content: string): ValidationSchema[] {
    const schemas: ValidationSchema[] = [];
    
    // Pattern to match output validation schemas
    const outputPattern = /\.output\s*\(\s*(z\.[^(]+\([^)]*\))/g;
    let match;
    
    while ((match = outputPattern.exec(content)) !== null) {
      const schemaDefinition = match[1];
      const patientDataFields = this.extractPatientDataFields(schemaDefinition);
      const validationComplexity = this.assessValidationComplexity(schemaDefinition);
      
      schemas.push({
        procedureName: this.findProcedureName(content, match.index),
        schemaType: 'output',
        patientDataFields,
        validationComplexity,
      });
    }
    
    return schemas;
  }

  /**
   * Find procedure name near a position in content
   */
  private findProcedureName(content: string, position: number): string {
    const beforePosition = content.substring(0, position);
    const lines = beforePosition.split('\n');
    
    // Search backwards for procedure definition
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      const procedureMatch = line.match(/(\w+)\s*:\s*t\.procedure/);
      if (procedureMatch) {
        return procedureMatch[1];
      }
    }
    
    return 'unknown';
  }

  /**
   * Extract patient data fields from schema
   */
  private extractPatientDataFields(schemaDefinition: string): string[] {
    const patientDataKeywords = [
      'patient', 'paciente', 'clinical', 'clinico', 'medical', 'medico',
      'health', 'saude', 'treatment', 'tratamento', 'appointment', 'consulta',
      'diagnosis', 'diagnostico', 'prescription', 'receita',
    ];
    
    const fields: string[] = [];
    const fieldPattern = /(\w+)\s*:/g;
    let match;
    
    while ((match = fieldPattern.exec(schemaDefinition)) !== null) {
      const fieldName = match[1].toLowerCase();
      
      if (patientDataKeywords.some(keyword => fieldName.includes(keyword))) {
        fields.push(match[1]);
      }
    }
    
    return fields;
  }

  /**
   * Assess validation complexity
   */
  private assessValidationComplexity(schemaDefinition: string): 'simple' | 'medium' | 'complex' {
    let complexity = 0;
    
    // Count validation rules
    if (schemaDefinition.includes('.min(')) complexity++;
    if (schemaDefinition.includes('.max(')) complexity++;
    if (schemaDefinition.includes('.email(')) complexity++;
    if (schemaDefinition.includes('.regex(')) complexity++;
    if (schemaDefinition.includes('.refine(')) complexity++;
    if (schemaDefinition.includes('.superRefine(')) complexity += 2;
    if (schemaDefinition.includes('z.object(') && schemaDefinition.includes('z.object(').length > 1) complexity++;
    if (schemaDefinition.includes('z.array(')) complexity++;
    if (schemaDefinition.includes('z.union(')) complexity++;
    if (schemaDefinition.includes('z.intersection(')) complexity++;
    
    if (complexity <= 2) return 'simple';
    if (complexity <= 5) return 'medium';
    return 'complex';
  }

  /**
   * Analyze type inference patterns
   */
  private analyzeTypeInference(filePath: string, content: string): TypeInferenceData[] {
    const typeInferences: TypeInferenceData[] = [];
    
    // Pattern to match type definitions
    const typePattern = /(?:type|interface)\s+(\w+)/g;
    let match;
    
    while ((match = typePattern.exec(content)) !== null) {
      const typeName = match[1];
      const inferenceType = this.determineInferenceType(content, typeName);
      const healthcareData = this.isTypeHealthcareRelated(content, typeName);
      const complexity = this.calculateTypeComplexity(content, typeName);
      
      typeInferences.push({
        typeName,
        inferenceType,
        healthcareData,
        complexity,
      });
    }
    
    return typeInferences;
  }

  /**
   * Determine type inference method
   */
  private determineInferenceType(content: string, typeName: string): 'automatic' | 'explicit' | 'mixed' {
    const typePattern = new RegExp(`(?:type|interface)\\s+${typeName}\\s*[^{]*{`, 'g');
    const typeMatch = content.match(typePattern);
    
    if (typeMatch) {
      const typeDefinition = typeMatch[0];
      
      if (typeDefinition.includes('typeof') || typeDefinition.includes('keyof')) {
        return 'automatic';
      } else if (typeDefinition.includes(': string') || typeDefinition.includes(': number')) {
        return 'explicit';
      } else {
        return 'mixed';
      }
    }
    
    return 'explicit';
  }

  /**
   * Check if type is healthcare-related
   */
  private isTypeHealthcareRelated(content: string, typeName: string): boolean {
    const healthcareKeywords = [
      'patient', 'paciente', 'clinical', 'clinico', 'medical', 'medico',
      'health', 'saude', 'treatment', 'tratamento', 'appointment', 'consulta',
      'diagnosis', 'diagnostico', 'prescription', 'receita', 'lgpd', 'anvisa',
    ];
    
    const lowerTypeName = typeName.toLowerCase();
    
    return healthcareKeywords.some(keyword => lowerTypeName.includes(keyword));
  }

  /**
   * Calculate type complexity
   */
  private calculateTypeComplexity(content: string, typeName: string): number {
    const typePattern = new RegExp(`(?:type|interface)\\s+${typeName}\\s*{([^}]*)}`, 's');
    const typeMatch = content.match(typePattern);
    
    if (!typeMatch) return 0;
    
    let complexity = 0;
    const typeBody = typeMatch[1];
    
    // Count properties
    const properties = typeBody.match(/\w+\s*:/g);
    if (properties) {
      complexity += properties.length;
    }
    
    // Count nested objects
    const nestedObjects = typeBody.match(/{[^}]*}/g);
    if (nestedObjects) {
      complexity += nestedObjects.length * 2;
    }
    
    // Count arrays
    const arrays = typeBody.match(/\w+\[\]/g);
    if (arrays) {
      complexity += arrays.length;
    }
    
    // Count unions
    const unions = typeBody.match(/\|/g);
    if (unions) {
      complexity += unions.length;
    }
    
    // Count intersections
    const intersections = typeBody.match(/&/g);
    if (intersections) {
      complexity += intersections.length * 2;
    }
    
    return complexity;
  }

  /**
   * Detect type safety issues
   */
  private detectTypeSafetyIssues(filePath: string, content: string): TypeSafetyIssue[] {
    const issues: TypeSafetyIssue[] = [];
    
    // Look for procedures without input validation
    const proceduresWithoutInput = this.findProceduresWithoutInputValidation(content);
    issues.push(...proceduresWithoutInput.map(name => ({
      procedureName: name,
      issueType: 'missing_validation' as const,
      severity: 'high' as const,
      description: `Procedure ${name} lacks input validation`,
      healthcareRelevant: this.isProcedureHealthcareRelevant(content, name),
    })));
    
    // Look for procedures without output validation
    const proceduresWithoutOutput = this.findProceduresWithoutOutputValidation(content);
    issues.push(...proceduresWithoutOutput.map(name => ({
      procedureName: name,
      issueType: 'missing_validation' as const,
      severity: 'medium' as const,
      description: `Procedure ${name} lacks output validation`,
      healthcareRelevant: this.isProcedureHealthcareRelevant(content, name),
    })));
    
    // Look for type mismatches
    const typeMismatches = this.findTypeMismatches(content);
    issues.push(...typeMismatches);
    
    // Look for circular dependencies
    const circularDependencies = this.findCircularDependencies(content);
    issues.push(...circularDependencies);
    
    // Look for overly complex types
    const complexTypes = this.findComplexTypes(content);
    issues.push(...complexTypes);
    
    return issues;
  }

  /**
   * Find procedures without input validation
   */
  private findProceduresWithoutInputValidation(content: string): string[] {
    const procedures: string[] = [];
    
    const procedurePattern = /(\w+)\s*:\s*t\.procedure\s*\.\s*(query|mutation|subscription)/g;
    let match;
    
    while ((match = procedurePattern.exec(content)) !== null) {
      const procedureName = match[1];
      
      if (!this.hasInputValidation(content, procedureName)) {
        procedures.push(procedureName);
      }
    }
    
    return procedures;
  }

  /**
   * Find procedures without output validation
   */
  private findProceduresWithoutOutputValidation(content: string): string[] {
    const procedures: string[] = [];
    
    const procedurePattern = /(\w+)\s*:\s*t\.procedure\s*\.\s*(query|mutation|subscription)/g;
    let match;
    
    while ((match = procedurePattern.exec(content)) !== null) {
      const procedureName = match[1];
      
      if (!this.hasOutputValidation(content, procedureName)) {
        procedures.push(procedureName);
      }
    }
    
    return procedures;
  }

  /**
   * Find type mismatches
   */
  private findTypeMismatches(content: string): TypeSafetyIssue[] {
    const issues: TypeSafetyIssue[] = [];
    
    // Look for any type usage that might be problematic
    const anyTypePattern = /:\s*any\b/g;
    let match;
    
    while ((match = anyTypePattern.exec(content)) !== null) {
      const context = content.substring(Math.max(0, match.index - 50), match.index + 50);
      const procedureName = this.findProcedureName(content, match.index);
      
      issues.push({
        procedureName,
        issueType: 'type_mismatch',
        severity: 'medium',
        description: 'Usage of "any" type detected, consider using specific types',
        healthcareRelevant: this.isProcedureHealthcareRelevant(content, procedureName),
      });
    }
    
    return issues;
  }

  /**
   * Find circular dependencies
   */
  private findCircularDependencies(content: string): TypeSafetyIssue[] {
    const issues: TypeSafetyIssue[] = [];
    
    // Simple circular dependency detection
    const types = this.extractTypeDefinitions(content);
    
    for (const typeName of types) {
      const typePattern = new RegExp(`(?:type|interface)\\s+${typeName}\\s*{([^}]*)}`, 's');
      const typeMatch = content.match(typePattern);
      
      if (typeMatch) {
        const typeBody = typeMatch[1];
        
        // Check if type references itself
        if (typeBody.includes(typeName)) {
          issues.push({
            procedureName: typeName,
            issueType: 'circular_dependency',
            severity: 'medium',
            description: `Type ${typeName} has circular dependency`,
            healthcareRelevant: this.isTypeHealthcareRelated(content, typeName),
          });
        }
      }
    }
    
    return issues;
  }

  /**
   * Find complex types
   */
  private findComplexTypes(content: string): TypeSafetyIssue[] {
    const issues: TypeSafetyIssue[] = [];
    
    const types = this.extractTypeDefinitions(content);
    
    for (const typeName of types) {
      const complexity = this.calculateTypeComplexity(content, typeName);
      
      if (complexity > 10) {
        issues.push({
          procedureName: typeName,
          issueType: 'complex_type',
          severity: 'low',
          description: `Type ${typeName} is overly complex (complexity: ${complexity})`,
          healthcareRelevant: this.isTypeHealthcareRelated(content, typeName),
        });
      }
    }
    
    return issues;
  }

  /**
   * Extract type definitions from content
   */
  private extractTypeDefinitions(content: string): string[] {
    const types: string[] = [];
    
    const typePattern = /(?:type|interface)\s+(\w+)/g;
    let match;
    
    while ((match = typePattern.exec(content)) !== null) {
      types.push(match[1]);
    }
    
    return types;
  }

  /**
   * Count patient data validations
   */
  private countPatientDataValidations(content: string): number {
    const patientDataPatterns = [
      'patient', 'paciente', 'dadosPaciente', 'patientData',
    ];
    
    return patientDataPatterns.reduce((count, pattern) => {
      const regex = new RegExp(pattern, 'gi');
      const matches = content.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  /**
   * Count clinical logic validations
   */
  private countClinicalLogicValidations(content: string): number {
    const clinicalPatterns = [
      'clinical', 'clinico', 'medical', 'medico', 'treatment', 'tratamento',
    ];
    
    return clinicalPatterns.reduce((count, pattern) => {
      const regex = new RegExp(pattern, 'gi');
      const matches = content.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  /**
   * Count compliance validations
   */
  private countComplianceValidations(content: string): number {
    const compliancePatterns = [
      'lgpd', 'compliance', 'validacao', 'validation',
    ];
    
    return compliancePatterns.reduce((count, pattern) => {
      const regex = new RegExp(pattern, 'gi');
      const matches = content.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  /**
   * Count audit trail validations
   */
  private countAuditTrailValidations(content: string): number {
    const auditPatterns = [
      'audit', 'trail', 'log', 'registro', 'auditoria',
    ];
    
    return auditPatterns.reduce((count, pattern) => {
      const regex = new RegExp(pattern, 'gi');
      const matches = content.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
  }
}