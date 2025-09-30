// Middleware Integration Pattern Analysis Service - Atomic Subtask 5 of 10
// Hono + tRPC v11 Edge-First Architecture Analysis
// Brazilian Healthcare Compliance Focused

import * as fs from 'fs/promises';
import type {
  MiddlewareIntegrationPatternAnalysisResult,
  MiddlewareData,
  AuthenticationMiddleware,
  AuthorizationMiddleware,
  ValidationMiddleware,
  AuditMiddleware,
  MiddlewareRecommendation,
} from './types/hono-trpc-analysis.types.js';
import type { HonoTrpcAnalysisConfig } from './hono-trpc-analysis.service.js';

export class MiddlewareIntegrationPatternAnalysisService {
  private config: HonoTrpcAnalysisConfig;

  constructor(config: HonoTrpcAnalysisConfig) {
    this.config = config;
  }

  /**
   * Analyze middleware integration patterns
   */
  async analyze(files: string[]): Promise<MiddlewareIntegrationPatternAnalysisResult> {
    const middleware: MiddlewareData[] = [];
    
    let totalMiddleware = 0;
    let securityMiddleware = 0;
    let healthcareMiddleware = 0;
    let performanceMiddleware = 0;
    let loggingMiddleware = 0;

    // Analyze each file for middleware patterns
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const fileMiddleware = this.extractMiddlewareFromFile(file, content);
        
        middleware.push(...fileMiddleware);
        totalMiddleware += fileMiddleware.length;
        
        // Count middleware types
        securityMiddleware += fileMiddleware.filter(m => 
          ['authentication', 'authorization'].includes(m.type)
        ).length;
        
        healthcareMiddleware += fileMiddleware.filter(m => 
          m.healthcareRelevant
        ).length;
        
        performanceMiddleware += fileMiddleware.filter(m => 
          m.type === 'performance'
        ).length;
        
        loggingMiddleware += fileMiddleware.filter(m => 
          m.type === 'logging'
        ).length;
        
      } catch (error) {
        console.warn(`Failed to analyze file ${file}:`, error);
      }
    }

    // Extract specific middleware patterns
    const authentication = this.extractAuthenticationMiddleware(files);
    const authorization = this.extractAuthorizationMiddleware(files);
    const validation = this.extractValidationMiddleware(files);
    const audit = this.extractAuditMiddleware(files);

    // Generate recommendations
    const recommendations = this.generateMiddlewareRecommendations(middleware, files);

    return {
      summary: {
        totalMiddleware,
        securityMiddleware,
        healthcareMiddleware,
        performanceMiddleware,
        loggingMiddleware,
      },
      middleware,
      patterns: {
        authentication,
        authorization,
        validation,
        audit,
      },
      healthcare: {
        patientDataProtection: this.checkPatientDataProtection(files),
        clinicalWorkflowValidation: this.checkClinicalWorkflowValidation(files),
        lgpdComplianceChecks: this.checkLgpdComplianceChecks(files),
        professionalCouncilValidation: this.checkProfessionalCouncilValidation(files),
      },
      recommendations,
    };
  }

  /**
   * Extract middleware from file content
   */
  private extractMiddlewareFromFile(filePath: string, content: string): MiddlewareData[] {
    const middlewareList: MiddlewareData[] = [];
    
    // Hono middleware patterns
    const honoMiddlewarePattern = /app\.use\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*(\w+)/g;
    let match;
    
    while ((match = honoMiddlewarePattern.exec(content)) !== null) {
      const middlewareName = match[2];
      const type = this.determineMiddlewareType(middlewareName, content);
      const order = middlewareList.length;
      const healthcareRelevant = this.isMiddlewareHealthcareRelevant(middlewareName, content);
      
      middlewareList.push({
        name: middlewareName,
        type,
        order,
        healthcareRelevant,
      });
    }
    
    // tRPC middleware patterns
    const trpcMiddlewarePattern = /\.use\s*\(\s*(\w+)/g;
    
    while ((match = trpcMiddlewarePattern.exec(content)) !== null) {
      const middlewareName = match[1];
      const type = this.determineMiddlewareType(middlewareName, content);
      const order = middlewareList.length;
      const healthcareRelevant = this.isMiddlewareHealthcareRelevant(middlewareName, content);
      
      middlewareList.push({
        name: middlewareName,
        type,
        order,
        healthcareRelevant,
      });
    }
    
    return middlewareList;
  }

  /**
   * Determine middleware type
   */
  private determineMiddlewareType(middlewareName: string, content: string): MiddlewareData['type'] {
    const lowerName = middlewareName.toLowerCase();
    
    if (lowerName.includes('auth') || lowerName.includes('jwt') || lowerName.includes('session')) {
      return 'authentication';
    } else if (lowerName.includes('role') || lowerName.includes('permission') || lowerName.includes('rbac')) {
      return 'authorization';
    } else if (lowerName.includes('validate') || lowerName.includes('zod') || lowerName.includes('schema')) {
      return 'validation';
    } else if (lowerName.includes('audit') || lowerName.includes('log') || lowerName.includes('track')) {
      return 'audit';
    } else if (lowerName.includes('logger') || lowerName.includes('logging')) {
      return 'logging';
    } else if (lowerName.includes('cors') || lowerName.includes('helmet') || lowerName.includes('security')) {
      return 'security';
    } else if (lowerName.includes('cache') || lowerName.includes('compress') || lowerName.includes('rate')) {
      return 'performance';
    } else {
      return 'authentication'; // Default
    }
  }

  /**
   * Check if middleware is healthcare-relevant
   */
  private isMiddlewareHealthcareRelevant(middlewareName: string, content: string): boolean {
    const healthcareKeywords = [
      'patient', 'paciente', 'clinical', 'clinico', 'medical', 'medico',
      'lgpd', 'anvisa', 'health', 'saude', 'treatment', 'consulta',
    ];
    
    const lowerName = middlewareName.toLowerCase();
    const lowerContent = content.toLowerCase();
    
    return healthcareKeywords.some(keyword => 
      lowerName.includes(keyword) || lowerContent.includes(keyword)
    );
  }

  /**
   * Extract authentication middleware
   */
  private extractAuthenticationMiddleware(files: string[]): AuthenticationMiddleware[] {
    const authMiddleware: AuthenticationMiddleware[] = [];
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Look for authentication patterns
        const authPatterns = [
          /jwt\s*=\s*(\w+)/g,
          /authMiddleware\s*=\s*(\w+)/g,
          /authentication\s*=\s*(\w+)/g,
        ];
        
        authPatterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            authMiddleware.push({
              name: match[1],
              strategy: this.determineAuthStrategy(content),
              patientDataAccess: this.hasPatientDataAccess(content),
              professionalValidation: this.hasProfessionalValidation(content),
            });
          }
        });
        
      } catch (error) {
        // Ignore file read errors
      }
    }
    
    return authMiddleware;
  }

  /**
   * Extract authorization middleware
   */
  private extractAuthorizationMiddleware(files: string[]): AuthorizationMiddleware[] {
    const authzMiddleware: AuthorizationMiddleware[] = [];
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Look for authorization patterns
        const authzPatterns = [
          /roleMiddleware\s*=\s*(\w+)/g,
          /authorization\s*=\s*(\w+)/g,
          /rbac\s*=\s*(\w+)/g,
        ];
        
        authzPatterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            authzMiddleware.push({
              name: match[1],
              roles: this.extractRoles(content),
              patientDataAccess: this.hasPatientDataAccess(content),
              clinicalWorkflowAccess: this.hasClinicalWorkflowAccess(content),
            });
          }
        });
        
      } catch (error) {
        // Ignore file read errors
      }
    }
    
    return authzMiddleware;
  }

  /**
   * Extract validation middleware
   */
  private extractValidationMiddleware(files: string[]): ValidationMiddleware[] {
    const validationMiddleware: ValidationMiddleware[] = [];
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Look for validation patterns
        const validationPatterns = [
          /validateMiddleware\s*=\s*(\w+)/g,
          /zodMiddleware\s*=\s*(\w+)/g,
          /validation\s*=\s*(\w+)/g,
        ];
        
        validationPatterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            validationMiddleware.push({
              name: match[1],
              validationType: this.determineValidationType(content),
              patientDataValidation: this.hasPatientDataValidation(content),
              clinicalDataValidation: this.hasClinicalDataValidation(content),
            });
          }
        });
        
      } catch (error) {
        // Ignore file read errors
      }
    }
    
    return validationMiddleware;
  }

  /**
   * Extract audit middleware
   */
  private extractAuditMiddleware(files: string[]): AuditMiddleware[] {
    const auditMiddleware: AuditMiddleware[] = [];
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Look for audit patterns
        const auditPatterns = [
          /auditMiddleware\s*=\s*(\w+)/g,
          /auditLog\s*=\s*(\w+)/g,
          /complianceMiddleware\s*=\s*(\w+)/g,
        ];
        
        auditPatterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            auditMiddleware.push({
              name: match[1],
              auditType: this.determineAuditType(content),
              lgpdCompliance: this.hasLgpdCompliance(content),
              professionalCouncilCompliance: this.hasProfessionalCouncilCompliance(content),
            });
          }
        });
        
      } catch (error) {
        // Ignore file read errors
      }
    }
    
    return auditMiddleware;
  }

  // Helper methods for determining middleware characteristics
  private determineAuthStrategy(content: string): string {
    if (content.includes('jwt')) return 'jwt';
    if (content.includes('oauth')) return 'oauth';
    if (content.includes('session')) return 'session';
    if (content.includes('apikey')) return 'api-key';
    return 'basic';
  }

  private hasPatientDataAccess(content: string): boolean {
    const patterns = ['patient', 'paciente', 'dados', 'medical'];
    const lowerContent = content.toLowerCase();
    return patterns.some(pattern => lowerContent.includes(pattern));
  }

  private hasProfessionalValidation(content: string): boolean {
    const patterns = ['professional', 'council', 'cfm', 'crm'];
    const lowerContent = content.toLowerCase();
    return patterns.some(pattern => lowerContent.includes(pattern));
  }

  private extractRoles(content: string): string[] {
    const rolePattern = /roles?\s*[:=]\s*\[([^\]]+)\]/g;
    const roles: string[] = [];
    let match;
    
    while ((match = rolePattern.exec(content)) !== null) {
      const roleList = match[1].split(',').map(r => r.trim().replace(/['"]/g, ''));
      roles.push(...roleList);
    }
    
    return roles;
  }

  private hasClinicalWorkflowAccess(content: string): boolean {
    const patterns = ['clinical', 'workflow', 'treatment', 'consulta'];
    const lowerContent = content.toLowerCase();
    return patterns.some(pattern => lowerContent.includes(pattern));
  }

  private determineValidationType(content: string): string {
    if (content.includes('zod')) return 'zod';
    if (content.includes('joi')) return 'joi';
    if (content.includes('yup')) return 'yup';
    return 'custom';
  }

  private hasPatientDataValidation(content: string): boolean {
    const patterns = ['patient', 'paciente', 'validate', 'validation'];
    const lowerContent = content.toLowerCase();
    return patterns.some(pattern => lowerContent.includes(pattern));
  }

  private hasClinicalDataValidation(content: string): boolean {
    const patterns = ['clinical', 'medical', 'validate', 'validation'];
    const lowerContent = content.toLowerCase();
    return patterns.some(pattern => lowerContent.includes(pattern));
  }

  private determineAuditType(content: string): string {
    if (content.includes('lgpd')) return 'lgpd-audit';
    if (content.includes('access')) return 'access-log';
    if (content.includes('compliance')) return 'compliance-audit';
    return 'general-audit';
  }

  private hasLgpdCompliance(content: string): boolean {
    const patterns = ['lgpd', 'consent', 'dados', 'privacidade'];
    const lowerContent = content.toLowerCase();
    return patterns.some(pattern => lowerContent.includes(pattern));
  }

  private hasProfessionalCouncilCompliance(content: string): boolean {
    const patterns = ['cfm', 'crm', 'council', 'professional'];
    const lowerContent = content.toLowerCase();
    return patterns.some(pattern => lowerContent.includes(pattern));
  }

  private checkPatientDataProtection(files: string[]): boolean {
    return files.some(file => {
      try {
        const content = fs.readFileSync(file, 'utf8').toLowerCase();
        return content.includes('patient') && 
               (content.includes('protect') || content.includes('secure'));
      } catch (error) {
        return false;
      }
    });
  }

  private checkClinicalWorkflowValidation(files: string[]): boolean {
    return files.some(file => {
      try {
        const content = fs.readFileSync(file, 'utf8').toLowerCase();
        return content.includes('clinical') && content.includes('workflow');
      } catch (error) {
        return false;
      }
    });
  }

  private checkLgpdComplianceChecks(files: string[]): boolean {
    return files.some(file => {
      try {
        const content = fs.readFileSync(file, 'utf8').toLowerCase();
        return content.includes('lgpd') && content.includes('compliance');
      } catch (error) {
        return false;
      }
    });
  }

  private checkProfessionalCouncilValidation(files: string[]): boolean {
    return files.some(file => {
      try {
        const content = fs.readFileSync(file, 'utf8').toLowerCase();
        return (content.includes('cfm') || content.includes('crm')) && 
               content.includes('validation');
      } catch (error) {
        return false;
      }
    });
  }

  private generateMiddlewareRecommendations(
    middleware: MiddlewareData[],
    files: string[]
  ): MiddlewareRecommendation[] {
    const recommendations: MiddlewareRecommendation[] = [];
    
    // Check for missing authentication middleware
    const hasAuth = middleware.some(m => m.type === 'authentication');
    if (!hasAuth) {
      recommendations.push({
        middleware: 'authentication',
        recommendation: 'Implement authentication middleware to secure all endpoints',
        priority: 'critical',
        healthcareRequirement: true,
      });
    }
    
    // Check for missing authorization middleware
    const hasAuthz = middleware.some(m => m.type === 'authorization');
    if (!hasAuthz) {
      recommendations.push({
        middleware: 'authorization',
        recommendation: 'Implement authorization middleware with role-based access control',
        priority: 'critical',
        healthcareRequirement: true,
      });
    }
    
    // Check for missing validation middleware
    const hasValidation = middleware.some(m => m.type === 'validation');
    if (!hasValidation) {
      recommendations.push({
        middleware: 'validation',
        recommendation: 'Implement input validation middleware using Zod schemas',
        priority: 'high',
        healthcareRequirement: true,
      });
    }
    
    // Check for missing audit middleware
    const hasAudit = middleware.some(m => m.type === 'audit');
    if (!hasAudit) {
      recommendations.push({
        middleware: 'audit',
        recommendation: 'Implement audit logging middleware for compliance tracking',
        priority: 'critical',
        healthcareRequirement: true,
      });
    }
    
    // Check for healthcare-specific middleware
    const hasHealthcareMiddleware = middleware.some(m => m.healthcareRelevant);
    if (!hasHealthcareMiddleware) {
      recommendations.push({
        middleware: 'healthcare-compliance',
        recommendation: 'Implement healthcare-specific middleware for LGPD and clinical compliance',
        priority: 'critical',
        healthcareRequirement: true,
      });
    }
    
    return recommendations;
  }
}