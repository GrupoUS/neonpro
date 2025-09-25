/**
 * Healthcare compliance types for unified AI provider system
 */

import { z } from 'zod';

/**
 * Compliance framework configuration
 */
export interface ComplianceConfig {
  enabled: boolean;
  piiRedaction: boolean;
  auditLogging: boolean;
  dataRetentionDays: number;
  frameworks: ComplianceFramework[];
}

/**
 * Individual compliance framework configuration
 */
export interface ComplianceFramework {
  name: 'HIPAA' | 'LGPD' | 'ANVISA' | 'CFM' | 'CFF' | 'CNEP' | 'COREN';
  enabled: boolean;
  region?: string;
  additionalRules?: Record<string, any>;
}

/**
 * PII redaction patterns and configuration
 */
export interface PIIRedactionConfig {
  enabled: boolean;
  patterns: PIIPattern[];
  customPatterns?: RegExp[];
  redactionMethod: 'replace' | 'mask' | 'hash';
  replacementText: string;
}

/**
 * PII pattern definition
 */
export interface PIIPattern {
  name: string;
  pattern: RegExp;
  category: 'health' | 'personal' | 'financial' | 'contact';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  provider: string;
  event: string;
  userId?: string;
  sessionId?: string;
  data: Record<string, any>;
  compliance: {
    frameworks: string[];
    piiRedacted: boolean;
    dataRetentionDays: number;
  };
  metadata?: Record<string, any>;
}

/**
 * Compliance validation result
 */
export interface ComplianceValidationResult {
  isValid: boolean;
  violations: ComplianceViolation[];
  score: number;
  recommendations: string[];
}

/**
 * Compliance violation details
 */
export interface ComplianceViolation {
  id: string;
  type: 'pii' | 'content' | 'access' | 'retention' | 'consent';
  severity: 'low' | 'medium' | 'high' | 'critical';
  framework: string;
  description: string;
  location: string;
  recommendation: string;
  timestamp: Date;
}

/**
 * Data retention policy
 */
export interface DataRetentionPolicy {
  enabled: boolean;
  retentionDays: number;
  autoDelete: boolean;
  auditRetentionDays: number;
  excludeDataTypes: string[];
}

/**
 * Zod schemas for validation
 */
export const ComplianceConfigSchema = z.object({
  enabled: z.boolean().default(true),
  piiRedaction: z.boolean().default(true),
  auditLogging: z.boolean().default(true),
  dataRetentionDays: z.number().int().min(1).max(3650).default(365),
  frameworks: z.array(z.object({
    name: z.enum(['HIPAA', 'LGPD', 'ANVISA', 'CFM', 'CFF', 'CNEP', 'COREN']),
    enabled: z.boolean().default(true),
    region: z.string().optional(),
    additionalRules: z.record(z.any()).optional(),
  })).default([
    { name: 'LGPD', enabled: true, region: 'BR' },
    { name: 'ANVISA', enabled: true, region: 'BR' },
    { name: 'CFM', enabled: true, region: 'BR' },
  ]),
});

export const PIIRedactionConfigSchema = z.object({
  enabled: z.boolean().default(true),
  patterns: z.array(z.object({
    name: z.string(),
    pattern: z.instanceof(RegExp),
    category: z.enum(['health', 'personal', 'financial', 'contact']),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
  })),
  customPatterns: z.array(z.instanceof(RegExp)).optional(),
  redactionMethod: z.enum(['replace', 'mask', 'hash']).default('replace'),
  replacementText: z.string().default('[REDACTED]'),
});

export const AuditLogEntrySchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  provider: z.string(),
  event: z.string(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  data: z.record(z.any()),
  compliance: z.object({
    frameworks: z.array(z.string()),
    piiRedacted: z.boolean(),
    dataRetentionDays: z.number(),
  }),
  metadata: z.record(z.any()).optional(),
});

export type ComplianceConfigType = z.infer<typeof ComplianceConfigSchema>;
export type PIIRedactionConfigType = z.infer<typeof PIIRedactionConfigSchema>;
export type AuditLogEntryType = z.infer<typeof AuditLogEntrySchema>;