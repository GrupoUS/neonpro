/**
 * Enhanced Session Management Integration
 * 
 * Main integration point for all enhanced session management components including
 * CopilotKit integration, aesthetic clinic features, and compliance frameworks.
 */

export { EnhancedAgentSessionService } from './enhanced-agent-session-service';
export { CopilotKitSessionIntegration } from './copilotkit-session-integration';
export { AestheticSessionHandler } from './aesthetic-session-handler';

// Re-export types for convenience
export type {
  EnhancedSessionConfig,
  EnhancedSessionContext,
  EnhancedSessionData,
  SessionAnalytics,
} from './enhanced-agent-session-service';

export type {
  CopilotKitSessionConfig,
  CopilotKitMessage,
  CopilotKitAction,
  CopilotKitSessionState,
} from './copilotkit-session-integration';

export type {
  AestheticSessionConfig,
  TreatmentWorkflowStep,
  PhotoAnalysisConfig,
  ClientAssessmentConfig,
  AestheticTreatmentSession,
  TreatmentWorkflow,
  PhotoRecord,
  AssessmentResult,
  ComplianceStatus,
  AestheticSessionAnalytics,
} from './aesthetic-session-handler';

// Import base session service for backward compatibility
export { AgentSessionService } from './agent-session-service';

/**
 * Create and configure complete enhanced session management system
 */
export async function createEnhancedSessionManagement(
  supabaseUrl: string,
  supabaseServiceKey: string,
  config: {
    enhancedConfig?: Partial<import('./enhanced-agent-session-service').EnhancedSessionConfig>;
    copilotKitConfig?: Partial<import('./copilotkit-session-integration').CopilotKitSessionConfig>;
    aestheticConfig?: Partial<import('./aesthetic-session-handler').AestheticSessionConfig>;
  } = {},
) {
  const { AgentSessionService } = await import('./agent-session-service');
  
  // Initialize base session service
  const baseSessionService = new AgentSessionService(
    supabaseUrl,
    supabaseServiceKey,
    config.enhancedConfig,
  );

  // Initialize enhanced session service
  const { EnhancedAgentSessionService } = await import('./enhanced-agent-session-service');
  const enhancedSessionService = new EnhancedAgentSessionService(
    supabaseUrl,
    supabaseServiceKey,
    config.enhancedConfig,
  );

  // Initialize CopilotKit integration
  const { CopilotKitSessionIntegration } = await import('./copilotkit-session-integration');
  const copilotKitIntegration = new CopilotKitSessionIntegration(
    enhancedSessionService,
    config.copilotKitConfig,
  );

  // Initialize aesthetic services if enabled
  let aestheticSessionHandler: import('./aesthetic-session-handler').AestheticSessionHandler | undefined;
  
  if (config.aestheticConfig?.enableAestheticFeatures !== false) {
    const { AestheticAguiService } = await import('../agui-protocol/aesthetic-service');
    const { AestheticDataHandlingService } = await import('../agui-protocol/aesthetic-data-handling');
    const { AestheticComplianceService } = await import('../agui-protocol/aesthetic-compliance-service');
    
    const aestheticService = new AestheticAguiService(supabaseUrl, supabaseServiceKey);
    const dataHandlingService = new AestheticDataHandlingService(supabaseUrl, supabaseServiceKey);
    const complianceService = new AestheticComplianceService(supabaseUrl, supabaseServiceKey);
    
    const { AestheticSessionHandler } = await import('./aesthetic-session-handler');
    aestheticSessionHandler = new AestheticSessionHandler(
      enhancedSessionService,
      copilotKitIntegration,
      aestheticService,
      dataHandlingService,
      complianceService,
      config.aestheticConfig,
    );
  }

  return {
    baseSessionService,
    enhancedSessionService,
    copilotKitIntegration,
    aestheticSessionHandler,
    
    /**
     * Create a complete enhanced session with all features
     */
    async createCompleteSession(userId: string, options: {
      title?: string;
      enableAestheticFeatures?: boolean;
      clientProfile?: any;
      treatmentType?: string;
      securityLevel?: 'standard' | 'enhanced' | 'strict';
    } = {}) {
      // Create enhanced session
      const enhancedSession = await enhancedSessionService.createEnhancedSession(
        userId,
        {
          title: options.title || 'Complete Enhanced Session',
          enableCopilotKit: true,
          aestheticData: options.clientProfile ? { clientProfile: options.clientProfile } : undefined,
          securityContext: {
            authenticationLevel: options.securityLevel || 'enhanced',
            dataAccessLevel: 'sensitive',
            complianceMode: 'enhanced',
          },
        },
      );

      // Initialize CopilotKit
      await copilotKitIntegration.initializeCopilotKitSession(enhancedSession.sessionId, {
        userId,
        enableAestheticFeatures: options.enableAestheticFeatures ?? true,
        securityLevel: options.securityLevel || 'enhanced',
      });

      // Initialize aesthetic session if enabled and client profile provided
      if (aestheticSessionHandler && options.clientProfile) {
        await aestheticSessionHandler.initializeAestheticSession(
          enhancedSession.sessionId,
          options.clientProfile,
          {
            userId,
            treatmentType: options.treatmentType,
            enableWorkflow: true,
          },
        );
      }

      return enhancedSession;
    },

    /**
     * Get complete session status with all features
     */
    async getCompleteSessionStatus(sessionId: string) {
      const enhancedSession = await enhancedSessionService.getEnhancedSession(sessionId);
      if (!enhancedSession) {
        return null;
      }

      const copilotKitState = await copilotKitIntegration.getCopilotKitSessionState(sessionId);
      const analytics = await enhancedSessionService.getSessionAnalytics(sessionId);
      
      let aestheticStatus = null;
      if (aestheticSessionHandler) {
        aestheticStatus = await aestheticSessionHandler.getAestheticSessionStatus(sessionId);
      }

      return {
        session: enhancedSession,
        copilotKitState,
        analytics,
        aestheticStatus,
      };
    },

    /**
     * Cleanup all resources
     */
    async shutdown() {
      await enhancedSessionService.shutdown();
      
      if (aestheticSessionHandler) {
        // Additional cleanup for aesthetic session handler if needed
      }
    },
  };
}

// Default configurations
export const DEFAULT_ENHANCED_SESSION_CONFIG: Partial<import('./enhanced-agent-session-service').EnhancedSessionConfig> = {
  defaultExpirationMs: 24 * 60 * 60 * 1000, // 24 hours
  maxSessionLengthMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  cleanupIntervalMs: 15 * 60 * 1000, // 15 minutes
  maxConcurrentSessions: 10,
  enableCopilotKit: true,
  enableAestheticFeatures: true,
  securityLevel: 'enhanced',
  enableSessionAnalytics: true,
  enableRealtimeCollaboration: false,
};

export const DEFAULT_COPILOTKIT_CONFIG: Partial<import('./copilotkit-session-integration').CopilotKitSessionConfig> = {
  endpoint: '/api/copilotkit',
  enableRealtimeSync: true,
  enableAestheticFeatures: true,
  maxConcurrentRequests: 10,
  requestTimeout: 30000,
  enableSecurityValidation: true,
  enableDataEncryption: true,
};

export const DEFAULT_AESTHETIC_CONFIG: Partial<import('./aesthetic-session-handler').AestheticSessionConfig> = {
  enableTreatmentWorkflow: true,
  enablePhotoAnalysis: true,
  enableClientManagement: true,
  enableFinancialIntegration: true,
  enableComplianceValidation: true,
  enableRealtimeCollaboration: false,
};

// Utility functions
export const SessionManagementUtils = {
  /**
   * Validate session configuration
   */
  validateConfig(config: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.supabaseUrl) {
      errors.push('Supabase URL is required');
    }

    if (!config.supabaseServiceKey) {
      errors.push('Supabase service key is required');
    }

    if (config.enhancedConfig?.maxConcurrentSessions && config.enhancedConfig.maxConcurrentSessions < 1) {
      errors.push('Max concurrent sessions must be at least 1');
    }

    if (config.enhancedConfig?.defaultExpirationMs && config.enhancedConfig.defaultExpirationMs < 60000) {
      errors.push('Default expiration must be at least 60 seconds');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Generate session analytics summary
   */
  generateAnalyticsSummary(analytics: any): string {
    if (!analytics) {
      return 'No analytics available';
    }

    const parts = [
      `Duration: ${Math.round(analytics.sessionDuration / 1000 / 60)} minutes`,
      `Messages: ${analytics.messageCount}`,
      `Features used: ${Object.keys(analytics.featureUsage || {}).length}`,
      `Engagement: ${Math.round(analytics.engagementScore || 0)}%`,
    ];

    if (analytics.satisfactionScore !== undefined) {
      parts.push(`Satisfaction: ${analytics.satisfactionScore}/5`);
    }

    return parts.join(' | ');
  },

  /**
   * Assess session security level
   */
  assessSecurityLevel(session: any): 'low' | 'medium' | 'high' | 'critical' {
    if (!session.securityMetadata) {
      return 'medium';
    }

    const { riskScore, complianceFlags } = session.securityMetadata;

    if (riskScore >= 75 || complianceFlags.some((f: any) => f.severity === 'critical')) {
      return 'critical';
    }

    if (riskScore >= 50 || complianceFlags.some((f: any) => f.severity === 'high')) {
      return 'high';
    }

    if (riskScore >= 25 || complianceFlags.some((f: any) => f.severity === 'medium')) {
      return 'medium';
    }

    return 'low';
  },

  /**
   * Get compliance recommendations
   */
  getComplianceRecommendations(complianceStatus: any): string[] {
    if (!complianceStatus || complianceStatus.overall === 'compliant') {
      return [];
    }

    const recommendations: string[] = [];

    complianceStatus.flags?.forEach((flag: any) => {
      switch (flag.type) {
        case 'missing_consent':
          recommendations.push(`Obtain ${flag.description.split(' ')[1]} consent immediately`);
          break;
        case 'expired_document':
          recommendations.push(`Update expired documentation: ${flag.description}`);
          break;
        case 'data_retention':
          recommendations.push(`Review and clean up data retention: ${flag.description}`);
          break;
        default:
          recommendations.push(`Address compliance issue: ${flag.description}`);
      }
    });

    return recommendations;
  },
};

// Version info
export const SESSION_MANAGEMENT_VERSION = '1.0.0';
export const COMPATIBILITY_VERSION = '^1.0.0';

// Error types
export class SessionManagementError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'SessionManagementError';
  }
}

export class SessionNotFoundError extends SessionManagementError {
  constructor(sessionId: string) {
    super(`Session ${sessionId} not found`, 'SESSION_NOT_FOUND', { sessionId });
  }
}

export class SessionExpiredError extends SessionManagementError {
  constructor(sessionId: string, expiredAt: Date) {
    super(`Session ${sessionId} expired at ${expiredAt.toISOString()}`, 'SESSION_EXPIRED', {
      sessionId,
      expiredAt,
    });
  }
}

export class SecurityValidationError extends SessionManagementError {
  constructor(message: string, public validationErrors: string[]) {
    super(message, 'SECURITY_VALIDATION_ERROR', { validationErrors });
  }
}

export class ComplianceError extends SessionManagementError {
  constructor(message: string, public complianceFlags: any[]) {
    super(message, 'COMPLIANCE_ERROR', { complianceFlags });
  }
}