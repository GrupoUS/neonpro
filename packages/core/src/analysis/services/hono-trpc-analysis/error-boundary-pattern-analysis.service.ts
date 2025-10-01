// Error Boundary Pattern Analysis Service - Atomic Subtask 4 of 10
// Hono + tRPC v11 Edge-First Architecture Analysis
// Brazilian Healthcare Compliance Focused

import * as fs from 'fs/promises';
import * as path from 'path';
import type {
  ErrorBoundaryPatternAnalysisResult,
  ErrorBoundaryData,
  GlobalErrorHandler,
  RouteErrorHandler,
  PatientDataErrorHandler,
  ErrorHandlingRecommendation,
} from './types/hono-trpc-analysis.types.js';
import type { HonoTrpcAnalysisConfig } from './hono-trpc-analysis.service.js';

export class ErrorBoundaryPatternAnalysisService {
  private config: HonoTrpcAnalysisConfig;

  constructor(config: HonoTrpcAnalysisConfig) {
    this.config = config;
  }

  /**
   * Analyze error boundary patterns across the codebase
   */
  async analyze(files: string[]): Promise<ErrorBoundaryPatternAnalysisResult> {
    const services: ErrorBoundaryData[] = [];
    
    let totalServices = 0;
    let servicesWithErrorBoundaries = 0;
    let errorRecoveryStrategies = 0;
    let patientDataErrorHandling = 0;

    // Analyze each file for error handling patterns
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const serviceData = this.analyzeServiceErrorHandling(file, content);
        
        if (serviceData) {
          services.push(serviceData);
          totalServices++;
          
          if (serviceData.hasErrorBoundary) {
            servicesWithErrorBoundaries++;
          }
          
          if (serviceData.errorRecoveryStrategy !== 'none') {
            errorRecoveryStrategies++;
          }
          
          if (serviceData.patientDataProtection) {
            patientDataErrorHandling++;
          }
        }
      } catch (error) {
        console.warn(`Failed to analyze file ${file}:`, error);
      }
    }

    // Extract error handling patterns
    const globalErrorHandlers = this.extractGlobalErrorHandlers(files);
    const routeSpecificErrorHandlers = this.extractRouteSpecificErrorHandlers(files);
    const patientDataErrorHandlers = this.extractPatientDataErrorHandlers(files);

    // Generate recommendations
    const recommendations = this.generateErrorHandlingRecommendations(services, files);

    return {
      summary: {
        totalServices,
        servicesWithErrorBoundaries,
        errorRecoveryStrategies,
        patientDataErrorHandling,
      },
      services,
      patterns: {
        globalErrorHandlers,
        routeSpecificErrorHandlers,
        patientDataErrorHandlers,
      },
      healthcare: {
        patientDataErrorEncryption: this.checkPatientDataEncryption(files),
        clinicalErrorLogging: this.checkClinicalErrorLogging(files),
        complianceErrorReporting: this.checkComplianceErrorReporting(files),
        emergencyErrorProtocols: this.checkEmergencyErrorProtocols(files),
      },
      recommendations,
    };
  }

  /**
   * Analyze error handling for a single service
   */
  private analyzeServiceErrorHandling(filePath: string, content: string): ErrorBoundaryData | null {
    // Check if file contains service-like content
    if (!this.isServiceFile(content)) {
      return null;
    }

    const serviceName = this.extractServiceName(filePath, content);
    const hasErrorBoundary = this.hasErrorBoundary(content);
    const errorRecoveryStrategy = this.determineErrorRecoveryStrategy(content);
    const patientDataProtection = this.hasPatientDataProtection(content);

    return {
      serviceName,
      hasErrorBoundary,
      errorRecoveryStrategy,
      patientDataProtection,
    };
  }

  /**
   * Check if file contains service-like content
   */
  private isServiceFile(content: string): boolean {
    const serviceIndicators = [
      'class', 'export', 'function', 'procedure', 'router',
      'middleware', 'controller', 'service',
    ];
    
    return serviceIndicators.some(indicator => content.includes(indicator));
  }

  /**
   * Extract service name from file path or content
   */
  private extractServiceName(filePath: string, content: string): string {
    // Try to extract from file path
    const pathParts = filePath.split('/');
    const fileName = pathParts[pathParts.length - 1];
    const serviceName = fileName.replace(/\.(ts|js)$/, '');
    
    // Try to extract class or function name from content
    const classMatch = content.match(/export\s+class\s+(\w+)/);
    const functionMatch = content.match(/export\s+(?:const|function)\s+(\w+)/);
    
    return classMatch?.[1] || functionMatch?.[1] || serviceName;
  }

  /**
   * Check if service has error boundary
   */
  private hasErrorBoundary(content: string): boolean {
    const errorBoundaryPatterns = [
      'try\\s*{', 'catch\\s*\\(', 'onError', 'onerror',
      'errorHandler', 'error-boundary', 'ErrorBoundary',
      'app.onError', 'middleware\\.error', 'error\\.catch',
    ];
    
    return errorBoundaryPatterns.some(pattern => {
      const regex = new RegExp(pattern, 'gi');
      return regex.test(content);
    });
  }

  /**
   * Determine error recovery strategy
   */
  private determineErrorRecoveryStrategy(content: string): string {
    if (content.includes('retry') || content.includes('reattempt')) {
      return 'retry';
    } else if (content.includes('fallback') || content.includes('default')) {
      return 'fallback';
    } else if (content.includes('circuit') && content.includes('breaker')) {
      return 'circuit-breaker';
    } else if (content.includes('graceful') || content.includes('degrade')) {
      return 'graceful-degradation';
    } else if (this.hasErrorBoundary(content)) {
      return 'basic-handling';
    } else {
      return 'none';
    }
  }

  /**
   * Check if service has patient data protection
   */
  private hasPatientDataProtection(content: string): boolean {
    const protectionPatterns = [
      'encrypt', 'decrypt', 'hash', 'sanitize', 'anonymize',
      'patientDataProtection', 'lgpdProtection', 'dataMasking',
      'patientPrivacy', 'clinicalDataProtection',
    ];
    
    const lowerContent = content.toLowerCase();
    return protectionPatterns.some(pattern => lowerContent.includes(pattern));
  }

  /**
   * Extract global error handlers
   */
  private async extractGlobalErrorHandlers(files: string[]): Promise<GlobalErrorHandler[]> {
    const handlers: GlobalErrorHandler[] = [];
    
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        
        // Look for global error handler patterns
        const globalPatterns = [
          /app\.onError\s*\(\s*\(?\s*err[^)]*\)?\s*=>\s*{([^}]*)}/g,
          /globalErrorHandler\s*=\s*(\w+)/g,
          /errorMiddleware\s*=\s*(\w+)/g,
        ];
        
        globalPatterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            handlers.push({
              route: 'global',
              errorType: 'global',
              handlingStrategy: this.extractHandlingStrategy(match[0]),
              healthcareCompliance: this.hasHealthcareCompliance(content),
            });
          }
        });
        
      } catch (error) {
        console.warn(`Failed to extract global error handlers from ${file}:`, error);
      }
    }
    
    return handlers;
  }

  /**
   * Extract route-specific error handlers
   */
  private async extractRouteSpecificErrorHandlers(files: string[]): Promise<RouteErrorHandler[]> {
    const handlers: RouteErrorHandler[] = [];
    
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        
        // Look for route-specific error handling
        const routePatterns = [
          /\.onError\s*\(\s*\([^)]*\)\s*=>\s*{([^}]*)}/g,
          /catch\s*\(\s*error[^)]*\)\s*{([^}]*)}/g,
          /try\s*{[^}]*}\s*catch\s*\([^)]*\)\s*{([^}]*)}/g,
        ];
        
        routePatterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            const route = this.extractRouteFromContext(content, match.index);
            
            handlers.push({
              route: route || 'unknown',
              errorType: 'route-specific',
              handlingStrategy: this.extractHandlingStrategy(match[0]),
              patientDataHandling: this.hasPatientDataHandling(match[0]),
            });
          }
        });
        
      } catch (error) {
        console.warn(`Failed to extract route error handlers from ${file}:`, error);
      }
    }
    
    return handlers;
  }

  /**
   * Extract patient data error handlers
   */
  private async extractPatientDataErrorHandlers(files: string[]): Promise<PatientDataErrorHandler[]> {
    const handlers: PatientDataErrorHandler[] = [];
    
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        
        // Look for patient data-specific error handling
        const patientDataPatterns = [
          /patientDataError/gi,
          /lgpdError/gi,
          /clinicalDataError/gi,
          /patientPrivacyError/gi,
        ];
        
        patientDataPatterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            const context = content.substring(
              Math.max(0, match.index - 100),
              Math.min(content.length, match.index + 100)
            );
            
            handlers.push({
              errorType: match[0],
              handlingStrategy: this.extractHandlingStrategy(context),
              lgpdCompliant: this.hasLgpdCompliance(context),
              auditLogging: this.hasAuditLogging(context),
            });
          }
        });
        
      } catch (error) {
        console.warn(`Failed to extract patient data error handlers from ${file}:`, error);
      }
    }
    
    return handlers;
  }

  /**
   * Extract route from context
   */
  private extractRouteFromContext(content: string, position: number): string | null {
    const beforePosition = content.substring(0, position);
    const lines = beforePosition.split('\n');
    
    // Search backwards for route definition
    for (let i = lines.length - 1; i >= Math.max(0, lines.length - 10); i--) {
      const line = lines[i].trim();
      
      // Look for Hono route definitions
      const routeMatch = line.match(/\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/);
      if (routeMatch) {
        return `${routeMatch[1].toUpperCase()} ${routeMatch[2]}`;
      }
      
      // Look for tRPC procedure definitions
      const procedureMatch = line.match(/(\w+)\s*:\s*t\.procedure/);
      if (procedureMatch) {
        return `tRPC ${procedureMatch[1]}`;
      }
    }
    
    return null;
  }

  /**
   * Extract handling strategy from error handler
   */
  private extractHandlingStrategy(handlerContent: string): string {
    if (handlerContent.includes('retry') || handlerContent.includes('reattempt')) {
      return 'retry-strategy';
    } else if (handlerContent.includes('fallback') || handlerContent.includes('default')) {
      return 'fallback-strategy';
    } else if (handlerContent.includes('log') || handlerContent.includes('logger')) {
      return 'logging-strategy';
    } else if (handlerContent.includes('return') && handlerContent.includes('error')) {
      return 'error-propagation';
    } else if (handlerContent.includes('status') && handlerContent.includes('500')) {
      return 'server-error-response';
    } else {
      return 'basic-handling';
    }
  }

  /**
   * Check if error handler has patient data handling
   */
  private hasPatientDataHandling(handlerContent: string): boolean {
    const patientDataPatterns = [
      'patient', 'paciente', 'clinical', 'clinico', 'medical',
      'lgpd', 'anvisa', 'health', 'saude',
    ];
    
    const lowerContent = handlerContent.toLowerCase();
    return patientDataPatterns.some(pattern => lowerContent.includes(pattern));
  }

  /**
   * Check if handler has healthcare compliance
   */
  private hasHealthcareCompliance(content: string): boolean {
    const compliancePatterns = [
      'lgpd', 'compliance', 'audit', 'regulation', 'anvisa',
      'healthcare', 'medical', 'clinical',
    ];
    
    const lowerContent = content.toLowerCase();
    return compliancePatterns.some(pattern => lowerContent.includes(pattern));
  }

  /**
   * Check if handler has LGPD compliance
   */
  private hasLgpdCompliance(content: string): boolean {
    const lgpdPatterns = [
      'lgpd', 'consent', 'consentimento', 'dados', 'privacidade',
      'anonymization', 'retention', 'portability',
    ];
    
    const lowerContent = content.toLowerCase();
    return lgpdPatterns.some(pattern => lowerContent.includes(pattern));
  }

  /**
   * Check if handler has audit logging
   */
  private hasAuditLogging(content: string): boolean {
    const auditPatterns = [
      'audit', 'log', 'registro', 'auditoria', 'tracking',
      'monitoring', 'compliance-log',
    ];
    
    const lowerContent = content.toLowerCase();
    return auditPatterns.some(pattern => lowerContent.includes(pattern));
  }

  /**
   * Check if patient data encryption is enabled
   */
  private checkPatientDataEncryption(files: string[]): boolean {
    return files.some(file => {
      try {
        const content = fs.readFileSync(file, 'utf8').toLowerCase();
        const encryptionPatterns = [
          'encrypt', 'decrypt', 'cipher', 'aes', 'rsa',
          'patientdataencryption', 'lgpdencryption',
        ];
        return encryptionPatterns.some(pattern => content.includes(pattern));
      } catch (error) {
        return false;
      }
    });
  }

  /**
   * Check if clinical error logging is enabled
   */
  private checkClinicalErrorLogging(files: string[]): boolean {
    return files.some(file => {
      try {
        const content = fs.readFileSync(file, 'utf8').toLowerCase();
        const clinicalPatterns = [
          'clinical', 'clinico', 'medical', 'medico',
          'errorlog', 'clinicallog', 'medicallog',
        ];
        return clinicalPatterns.some(pattern => content.includes(pattern));
      } catch (error) {
        return false;
      }
    });
  }

  /**
   * Check if compliance error reporting is enabled
   */
  private checkComplianceErrorReporting(files: string[]): boolean {
    return files.some(file => {
      try {
        const content = fs.readFileSync(file, 'utf8').toLowerCase();
        const compliancePatterns = [
          'compliance', 'lgpd', 'anvisa', 'report',
          'errorreport', 'compliancereport',
        ];
        return compliancePatterns.some(pattern => content.includes(pattern));
      } catch (error) {
        return false;
      }
    });
  }

  /**
   * Check if emergency error protocols are in place
   */
  private checkEmergencyErrorProtocols(files: string[]): boolean {
    return files.some(file => {
      try {
        const content = fs.readFileSync(file, 'utf8').toLowerCase();
        const emergencyPatterns = [
          'emergency', 'urgency', 'critical', 'life-threatening',
          'emergencyprotocol', 'criticalerror', 'urgent',
        ];
        return emergencyPatterns.some(pattern => content.includes(pattern));
      } catch (error) {
        return false;
      }
    });
  }

  /**
   * Generate error handling recommendations
   */
  private generateErrorHandlingRecommendations(
    services: ErrorBoundaryData[],
    files: string[]
  ): ErrorHandlingRecommendation[] {
    const recommendations: ErrorHandlingRecommendation[] = [];
    
    // Services without error boundaries
    const servicesWithoutBoundaries = services.filter(s => !s.hasErrorBoundary);
    if (servicesWithoutBoundaries.length > 0) {
      recommendations.push({
        service: `${servicesWithoutBoundaries.length} services`,
        recommendation: 'Implement error boundaries to prevent cascading failures',
        priority: 'critical',
        healthcareRequirement: servicesWithoutBoundaries.some(s => s.patientDataProtection),
      });
    }
    
    // Services with basic error handling only
    const basicHandlingServices = services.filter(s => 
      s.hasErrorBoundary && s.errorRecoveryStrategy === 'basic-handling'
    );
    if (basicHandlingServices.length > 0) {
      recommendations.push({
        service: `${basicHandlingServices.length} services`,
        recommendation: 'Enhance error handling with recovery strategies beyond basic error catching',
        priority: 'high',
        healthcareRequirement: basicHandlingServices.some(s => s.patientDataProtection),
      });
    }
    
    // Services without patient data protection
    const servicesWithoutProtection = services.filter(s => !s.patientDataProtection);
    const patientDataServices = services.filter(s => 
      this.serviceHandlesPatientData(files, s.serviceName)
    );
    const patientDataServicesWithoutProtection = patientDataServices.filter(s => !s.patientDataProtection);
    
    if (patientDataServicesWithoutProtection.length > 0) {
      recommendations.push({
        service: `${patientDataServicesWithoutProtection.length} patient data services`,
        recommendation: 'Implement patient data protection in error handling (encryption, anonymization)',
        priority: 'critical',
        healthcareRequirement: true,
      });
    }
    
    // Check for comprehensive error logging
    const hasComprehensiveLogging = this.checkComprehensiveErrorLogging(files);
    if (!hasComprehensiveLogging) {
      recommendations.push({
        service: 'System-wide',
        recommendation: 'Implement comprehensive error logging with audit trails for compliance',
        priority: 'high',
        healthcareRequirement: true,
      });
    }
    
    // Check for emergency protocols
    const hasEmergencyProtocols = this.checkEmergencyErrorProtocols(files);
    if (!hasEmergencyProtocols) {
      recommendations.push({
        service: 'System-wide',
        recommendation: 'Implement emergency error protocols for critical system failures',
        priority: 'high',
        healthcareRequirement: true,
      });
    }
    
    return recommendations;
  }

  /**
   * Check if service handles patient data
   */
  private serviceHandlesPatientData(files: string[], serviceName: string): boolean {
    return files.some(file => {
      try {
        const content = fs.readFileSync(file, 'utf8').toLowerCase();
        return content.includes(serviceName.toLowerCase()) && 
               (content.includes('patient') || content.includes('paciente'));
      } catch (error) {
        return false;
      }
    });
  }

  /**
   * Check for comprehensive error logging
   */
  private checkComprehensiveErrorLogging(files: string[]): boolean {
    const loggingPatterns = [
      'winston', 'pino', 'bunyan', 'log4js',
      'errorlogger', 'auditlogger', 'compliancelogger',
    ];
    
    return files.some(file => {
      try {
        const content = fs.readFileSync(file, 'utf8').toLowerCase();
        return loggingPatterns.some(pattern => content.includes(pattern));
      } catch (error) {
        return false;
      }
    });
  }
}