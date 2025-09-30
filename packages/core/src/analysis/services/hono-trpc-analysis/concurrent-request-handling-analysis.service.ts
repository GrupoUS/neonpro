// Concurrent Request Handling Analysis Service - Atomic Subtask 3 of 10
// Hono + tRPC v11 Edge-First Architecture Analysis
// Brazilian Healthcare Compliance Focused

import * as fs from 'fs/promises';
import * as path from 'path';
import type {
  ConcurrentRequestHandlingAnalysisResult,
  ConcurrentRequestData,
  ConcurrencyRecommendation,
} from './types/hono-trpc-analysis.types.js';
import type { HonoTrpcAnalysisConfig } from './hono-trpc-analysis.service.js';

export class ConcurrentRequestHandlingAnalysisService {
  private config: HonoTrpcAnalysisConfig;

  constructor(config: HonoTrpcAnalysisConfig) {
    this.config = config;
  }

  /**
   * Analyze concurrent request handling capabilities
   */
  async analyze(files: string[]): Promise<ConcurrentRequestHandlingAnalysisResult> {
    const endpoints: ConcurrentRequestData[] = [];
    
    let totalEndpoints = 0;
    let concurrentCapableEndpoints = 0;
    let rateLimitedEndpoints = 0;
    let queueEnabledEndpoints = 0;
    
    let patientRequestConcurrency = 0;
    let clinicalRequestPriority = 0;
    let emergencyRequestBypass = 0;
    let complianceLogging = 0;

    // Analyze each file for concurrent request handling patterns
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const fileEndpoints = this.extractEndpointsFromFile(file, content);
        
        endpoints.push(...fileEndpoints);
        totalEndpoints += fileEndpoints.length;
        concurrentCapableEndpoints += fileEndpoints.filter(e => e.maxConcurrentRequests > 1).length;
        rateLimitedEndpoints += fileEndpoints.filter(e => e.rateLimiting).length;
        queueEnabledEndpoints += fileEndpoints.filter(e => e.queueSupport).length;
        
        // Count healthcare-specific concurrent handling
        patientRequestConcurrency += this.countPatientRequestConcurrency(content);
        clinicalRequestPriority += this.countClinicalRequestPriority(content);
        emergencyRequestBypass += this.countEmergencyRequestBypass(content);
        complianceLogging += this.countComplianceLogging(content);
        
      } catch (error) {
        console.warn(`Failed to analyze file ${file}:`, error);
      }
    }

    // Calculate performance metrics
    const peakConcurrentRequests = this.calculatePeakConcurrentRequests(endpoints);
    const averageProcessingTime = this.calculateAverageProcessingTime(endpoints);
    const queueDepth = this.calculateQueueDepth(endpoints);
    const timeoutOccurrences = this.countTimeoutOccurrences(files);

    // Generate recommendations
    const recommendations = this.generateConcurrencyRecommendations(endpoints, files);

    return {
      summary: {
        totalEndpoints,
        concurrentCapableEndpoints,
        rateLimitedEndpoints,
        queueEnabledEndpoints,
      },
      endpoints,
      performance: {
        peakConcurrentRequests,
        averageProcessingTime,
        queueDepth,
        timeoutOccurrences,
      },
      healthcare: {
        patientRequestConcurrency,
        clinicalRequestPriority: clinicalRequestPriority > 0,
        emergencyRequestBypass: emergencyRequestBypass > 0,
        complianceLogging: complianceLogging > 0,
      },
      recommendations,
    };
  }

  /**
   * Extract endpoint data from file content
   */
  private extractEndpointsFromFile(filePath: string, content: string): ConcurrentRequestData[] {
    const endpoints: ConcurrentRequestData[] = [];
    
    // Extract Hono routes
    const honoRoutes = this.extractHonoRoutes(content);
    endpoints.push(...honoRoutes);
    
    // Extract tRPC procedures
    const trpcProcedures = this.extractTrpcProcedures(content);
    endpoints.push(...trpcProcedures);
    
    return endpoints.map(endpoint => ({
      ...endpoint,
      healthcareRelevant: this.isEndpointHealthcareRelevant(content, endpoint.endpoint),
    }));
  }

  /**
   * Extract Hono routes with concurrency analysis
   */
  private extractHonoRoutes(content: string): ConcurrentRequestData[] {
    const routes: ConcurrentRequestData[] = [];
    
    // Pattern to match Hono route definitions
    const routePattern = /\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = routePattern.exec(content)) !== null) {
      const method = match[1].toUpperCase();
      const routePath = match[2];
      const endpoint = `${method} ${routePath}`;
      
      routes.push({
        endpoint,
        maxConcurrentRequests: this.estimateMaxConcurrentRequests(content, endpoint),
        rateLimiting: this.hasRateLimiting(content, endpoint),
        queueSupport: this.hasQueueSupport(content, endpoint),
        healthcareRelevant: false, // Will be set by caller
      });
    }
    
    return routes;
  }

  /**
   * Extract tRPC procedures with concurrency analysis
   */
  private extractTrpcProcedures(content: string): ConcurrentRequestData[] {
    const procedures: ConcurrentRequestData[] = [];
    
    // Pattern to match tRPC procedure definitions
    const procedurePattern = /(\w+)\s*:\s*t\.procedure\s*\.\s*(query|mutation)/g;
    let match;
    
    while ((match = procedurePattern.exec(content)) !== null) {
      const procedureName = match[1];
      const procedureType = match[2];
      const endpoint = `tRPC ${procedureType} ${procedureName}`;
      
      procedures.push({
        endpoint,
        maxConcurrentRequests: this.estimateMaxConcurrentRequests(content, endpoint),
        rateLimiting: this.hasRateLimiting(content, endpoint),
        queueSupport: this.hasQueueSupport(content, endpoint),
        healthcareRelevant: false, // Will be set by caller
      });
    }
    
    return procedures;
  }

  /**
   * Estimate maximum concurrent requests for an endpoint
   */
  private estimateMaxConcurrentRequests(content: string, endpoint: string): number {
    let maxConcurrent = 1; // Default
    
    // Check for explicit concurrency configuration
    if (content.includes('concurrency') || content.includes('parallel')) {
      maxConcurrent = 10;
    }
    
    // Check for edge optimization (usually supports higher concurrency)
    if (content.includes('edge') || content.includes('serverless')) {
      maxConcurrent = Math.max(maxConcurrent, 100);
    }
    
    // Check for database connection pooling
    if (content.includes('pool') || content.includes('connection')) {
      maxConcurrent = Math.max(maxConcurrent, 20);
    }
    
    // Check for async/await patterns (indicates better concurrency)
    if (content.includes('async') && content.includes('await')) {
      maxConcurrent = Math.max(maxConcurrent, 5);
    }
    
    // Healthcare endpoints may have controlled concurrency for safety
    if (this.isEndpointHealthcareRelevant(content, endpoint)) {
      maxConcurrent = Math.min(maxConcurrent, 50);
    }
    
    return maxConcurrent;
  }

  /**
   * Check if endpoint has rate limiting
   */
  private hasRateLimiting(content: string, endpoint: string): boolean {
    const rateLimitPatterns = [
      'rateLimit', 'rate-limit', 'throttle', 'limiter',
      'express-rate-limit', 'rateLimiter', 'rate-limit',
      '@upstash/ratelimit', 'redis-rate-limit',
    ];
    
    return rateLimitPatterns.some(pattern => content.includes(pattern));
  }

  /**
   * Check if endpoint has queue support
   */
  private hasQueueSupport(content: string, endpoint: string): boolean {
    const queuePatterns = [
      'queue', 'bull', 'bee-queue', 'agenda', 'kue',
      'redis-queue', 'sqs', 'rabbitmq', 'amqp',
      'background', 'job', 'task', 'worker',
    ];
    
    return queuePatterns.some(pattern => content.includes(pattern));
  }

  /**
   * Check if endpoint is healthcare-relevant
   */
  private isEndpointHealthcareRelevant(content: string, endpoint: string): boolean {
    const healthcareKeywords = [
      'patient', 'paciente', 'clinical', 'clinico', 'medical', 'medico',
      'health', 'saude', 'treatment', 'tratamento', 'appointment', 'consulta',
      'diagnosis', 'diagnostico', 'prescription', 'receita', 'lgpd', 'anvisa',
    ];
    
    const lowerContent = content.toLowerCase();
    const lowerEndpoint = endpoint.toLowerCase();
    
    return healthcareKeywords.some(keyword => 
      lowerContent.includes(keyword) || lowerEndpoint.includes(keyword)
    );
  }

  /**
   * Count patient request concurrency patterns
   */
  private countPatientRequestConcurrency(content: string): number {
    const patterns = [
      'patientConcurrency', 'pacienteConcorrencia', 'patientParallel',
      'concurrentPatient', 'parallelPatient',
    ];
    
    return patterns.reduce((count, pattern) => {
      const regex = new RegExp(pattern, 'gi');
      const matches = content.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  /**
   * Count clinical request priority patterns
   */
  private countClinicalRequestPriority(content: string): number {
    const patterns = [
      'clinicalPriority', 'prioridadeClinica', 'medicalPriority',
      'emergencyPriority', 'urgencyLevel', 'triage',
    ];
    
    return patterns.reduce((count, pattern) => {
      const regex = new RegExp(pattern, 'gi');
      const matches = content.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  /**
   * Count emergency request bypass patterns
   */
  private countEmergencyRequestBypass(content: string): number {
    const patterns = [
      'emergencyBypass', 'bypassEmergency', 'overrideRateLimit',
      'emergencyAccess', 'urgencyBypass', 'criticalBypass',
    ];
    
    return patterns.reduce((count, pattern) => {
      const regex = new RegExp(pattern, 'gi');
      const matches = content.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  /**
   * Count compliance logging patterns
   */
  private countComplianceLogging(content: string): number {
    const patterns = [
      'complianceLog', 'auditLog', 'lgpdLog', 'regulatoryLog',
      'accessLog', 'auditTrail', 'complianceTracking',
    ];
    
    return patterns.reduce((count, pattern) => {
      const regex = new RegExp(pattern, 'gi');
      const matches = content.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  /**
   * Calculate peak concurrent requests
   */
  private calculatePeakConcurrentRequests(endpoints: ConcurrentRequestData[]): number {
    if (endpoints.length === 0) return 0;
    
    // Sum of all concurrent capabilities
    return endpoints.reduce((sum, endpoint) => sum + endpoint.maxConcurrentRequests, 0);
  }

  /**
   * Calculate average processing time
   */
  private calculateAverageProcessingTime(endpoints: ConcurrentRequestData[]): number {
    if (endpoints.length === 0) return 0;
    
    // Estimate based on endpoint characteristics
    const totalTime = endpoints.reduce((sum, endpoint) => {
      let processingTime = 100; // Base time in ms
      
      // Add time for rate limiting
      if (endpoint.rateLimiting) {
        processingTime += 10;
      }
      
      // Add time for queue processing
      if (endpoint.queueSupport) {
        processingTime += 50;
      }
      
      // Reduce time for high concurrency
      if (endpoint.maxConcurrentRequests > 50) {
        processingTime *= 0.8;
      }
      
      // Healthcare endpoints may require additional processing
      if (endpoint.healthcareRelevant) {
        processingTime += 25;
      }
      
      return sum + processingTime;
    }, 0);
    
    return Math.round(totalTime / endpoints.length);
  }

  /**
   * Calculate queue depth
   */
  private calculateQueueDepth(endpoints: ConcurrentRequestData[]): number {
    const queuedEndpoints = endpoints.filter(e => e.queueSupport);
    
    if (queuedEndpoints.length === 0) return 0;
    
    // Estimate queue depth based on concurrency limits
    return queuedEndpoints.reduce((sum, endpoint) => {
      // Estimated queue depth as 2x the concurrent capacity
      return sum + (endpoint.maxConcurrentRequests * 2);
    }, 0);
  }

  /**
   * Count timeout occurrences
   */
  private countTimeoutOccurrences(files: string[]): number {
    let timeoutCount = 0;
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Look for timeout configurations
        const timeoutPatterns = [
          'timeout:', 'setTimeout', 'requestTimeout',
          'connectionTimeout', 'responseTimeout',
        ];
        
        timeoutPatterns.forEach(pattern => {
          const regex = new RegExp(pattern, 'gi');
          const matches = content.match(regex);
          if (matches) {
            timeoutCount += matches.length;
          }
        });
        
      } catch (error) {
        // Ignore file read errors
      }
    }
    
    return timeoutCount;
  }

  /**
   * Generate concurrency recommendations
   */
  private generateConcurrencyRecommendations(
    endpoints: ConcurrentRequestData[],
    files: string[]
  ): ConcurrencyRecommendation[] {
    const recommendations: ConcurrencyRecommendation[] = [];
    
    // Analyze endpoints without rate limiting
    const nonRateLimitedEndpoints = endpoints.filter(e => !e.rateLimiting);
    if (nonRateLimitedEndpoints.length > 0) {
      recommendations.push({
        endpoint: `${nonRateLimitedEndpoints.length} endpoints`,
        recommendation: 'Implement rate limiting to prevent abuse and ensure system stability',
        priority: 'high',
        healthcareImpact: 'Prevents overload of patient-critical systems',
      });
    }
    
    // Analyze endpoints with low concurrency
    const lowConcurrencyEndpoints = endpoints.filter(e => e.maxConcurrentRequests <= 5);
    if (lowConcurrencyEndpoints.length > 0) {
      recommendations.push({
        endpoint: `${lowConcurrencyEndpoints.length} endpoints`,
        recommendation: 'Increase concurrency limits for better performance under load',
        priority: 'medium',
        healthcareImpact: 'Improves response times for clinical workflows',
      });
    }
    
    // Analyze endpoints without queue support
    const nonQueuedEndpoints = endpoints.filter(e => !e.queueSupport);
    if (nonQueuedEndpoints.length > 0) {
      recommendations.push({
        endpoint: `${nonQueuedEndpoints.length} endpoints`,
        recommendation: 'Implement request queuing for handling traffic spikes',
        priority: 'medium',
        healthcareImpact: 'Ensures no patient requests are lost during peak times',
      });
    }
    
    // Healthcare-specific recommendations
    const healthcareEndpoints = endpoints.filter(e => e.healthcareRelevant);
    if (healthcareEndpoints.length > 0) {
      const highPriorityHealthcare = healthcareEndpoints.filter(e => e.maxConcurrentRequests > 100);
      if (highPriorityHealthcare.length > 0) {
        recommendations.push({
          endpoint: `${highPriorityHealthcare.length} healthcare endpoints`,
          recommendation: 'Consider implementing priority queues for critical patient data operations',
          priority: 'critical',
          healthcareImpact: 'Ensures emergency and critical patient requests are processed first',
        });
      }
      
      const nonCompliantHealthcare = healthcareEndpoints.filter(e => 
        !this.hasComplianceLogging(files, e.endpoint)
      );
      if (nonCompliantHealthcare.length > 0) {
        recommendations.push({
          endpoint: `${nonCompliantHealthcare.length} healthcare endpoints`,
          recommendation: 'Add compliance logging for all healthcare-related endpoints',
          priority: 'critical',
          healthcareImpact: 'Required for LGPD and medical board compliance',
        });
      }
    }
    
    // Performance recommendations
    const avgProcessingTime = this.calculateAverageProcessingTime(endpoints);
    if (avgProcessingTime > 200) {
      recommendations.push({
        endpoint: 'System-wide',
        recommendation: 'Optimize request processing to reduce average response time',
        priority: 'high',
        healthcareImpact: 'Faster access to patient data improves clinical efficiency',
      });
    }
    
    return recommendations;
  }

  /**
   * Check if endpoint has compliance logging
   */
  private hasComplianceLogging(files: string[], endpoint: string): boolean {
    // Simple check - in a real implementation, this would be more sophisticated
    return files.some(file => {
      try {
        const content = fs.readFileSync(file, 'utf8').toLowerCase();
        return content.includes('compliance') || 
               content.includes('audit') || 
               content.includes('lgpd');
      } catch (error) {
        return false;
      }
    });
  }
}