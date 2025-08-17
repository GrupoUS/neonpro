/**
 * @fileoverview AI Package Types
 * @description Core types for healthcare AI features
 */

// Core AI Configuration Types
export interface AIConfig {
  version: string;
  features: string[];
  status: 'development' | 'production';
}

// Healthcare AI Status
export interface HealthcareAIStatus {
  chatbot: AIConfig;
  followUp: AIConfig;
  scheduling: AIConfig;
  workflow: AIConfig;
  ethics: AIConfig;
}

// Basic AI Response Type
export interface AIResponse {
  id: string;
  timestamp: string;
  confidence: number;
  recommendation: string;
  reasoning: string;
}

// Export default configuration
export const AI_PACKAGE_CONFIG: HealthcareAIStatus = {
  chatbot: {
    version: '1.0.0',
    features: ['nlp', 'privacy', 'lgpd-compliance'],
    status: 'development',
  },
  followUp: {
    version: '1.0.0',
    features: ['cfm-compliance', 'automated-scheduling', 'patient-safety'],
    status: 'development',
  },
  scheduling: {
    version: '1.0.0',
    features: ['optimization', 'patient-preferences', 'resource-allocation'],
    status: 'development',
  },
  workflow: {
    version: '1.0.0',
    features: ['automation', 'optimization', 'compliance'],
    status: 'development',
  },
  ethics: {
    version: '1.0.0',
    features: ['explainable-ai', 'bias-detection', 'medical-oversight'],
    status: 'development',
  },
} as const;
