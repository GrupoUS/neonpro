/**
 * Security Policy Service
 *
 * Healthcare platform security policy management with LGPD compliance
 *
 * @version 1.0.0
 * @compliance LGPD, ANVISA, CFM
 */

// Security Policy Schema
export const SecurityPolicySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum([
    'authentication',
    'authorization',
    'data_protection',
    'audit',
    'compliance',
  ]),
  enabled: z.boolean().default(true),
  rules: z.array(
    z.object({
      id: z.string(),
      condition: z.string(),
      action: z.enum(['allow', 'deny', 'require_mfa', 'audit', 'encrypt']),
      parameters: z.record(z.unknown()).optional(),
    }),
  ),
  metadata: z.object({
    clinicId: z.string().optional(),
    createdBy: z.string(),
    createdAt: z.date().default(_() => new Date()),
    updatedAt: z.date().default(_() => new Date()),
    version: z.number().default(1),
  }),
});

export type SecurityPolicy = z.infer<typeof SecurityPolicySchema>;

// Security Policy Configuration Schema
export const SecurityPolicyConfigSchema = z.object({
  policies: z.array(SecurityPolicySchema),
  globalSettings: z.object({
    enforceStrictMode: z.boolean().default(true),
    auditAllActions: z.boolean().default(true),
    encryptSensitiveData: z.boolean().default(true),
    requireMfaForAdmin: z.boolean().default(true),
  }),
});

export type SecurityPolicyConfig = z.infer<typeof SecurityPolicyConfigSchema>;

// In-memory storage for TDD (will be replaced with database)
const securityPolicies = new Map<string, SecurityPolicy>();
let globalConfig: SecurityPolicyConfig['globalSettings'] = {
  enforceStrictMode: true,
  auditAllActions: true,
  encryptSensitiveData: true,
  requireMfaForAdmin: true,
};

/**
 * Create a new security policy
 */
export async function createSecurityPolicy(
  policy: Omit<SecurityPolicy, 'id' | 'metadata'>,
): Promise<SecurityPolicy> {
  const id = crypto.randomUUID();

  const newPolicy: SecurityPolicy = {
    ...policy,
    id,
    metadata: {
      createdBy: 'system', // Will be replaced with actual user
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    },
  };

  securityPolicies.set(id, newPolicy);

  return newPolicy;
}

/**
 * Get a security policy by ID
 */
export async function getSecurityPolicy(
  id: string,
): Promise<SecurityPolicy | null> {
  return securityPolicies.get(id) || null;
}

/**
 * Update a security policy
 */
export async function updateSecurityPolicy(
  id: string,
  updates: Partial<Omit<SecurityPolicy, 'id' | 'metadata'>>,
): Promise<SecurityPolicy | null> {
  const existing = securityPolicies.get(id);

  if (!existing) {
    return null;
  }

  const updated: SecurityPolicy = {
    ...existing,
    ...updates,
    metadata: {
      ...existing.metadata,
      updatedAt: new Date(),
      version: existing.metadata.version + 1,
    },
  };

  securityPolicies.set(id, updated);

  return updated;
}

/**
 * Delete a security policy
 */
export async function deleteSecurityPolicy(id: string): Promise<boolean> {
  return securityPolicies.delete(id);
}

/**
 * List all security policies
 */
export async function listSecurityPolicies(): Promise<SecurityPolicy[]> {
  return Array.from(securityPolicies.values());
}

/**
 * Evaluate security policies for a given context
 */
export async function evaluateSecurityPolicies(_context: {
  _userId?: string;
  patientId?: string;
  clinicId?: string;
  action: string;
  resource: string;
  metadata?: Record<string, unknown>;
}): Promise<{
  allowed: boolean;
  appliedPolicies: string[];
  requiredActions: string[];
}> {
  const policies = Array.from(securityPolicies.values()).filter(
    p => p.enabled,
  );
  const appliedPolicies: string[] = [];
  const requiredActions: string[] = [];
  let allowed = true;

  for (const policy of policies) {
    // Simple rule evaluation (will be enhanced)
    for (const rule of policy.rules) {
      if (rule.condition === 'always' || rule.condition === context.action) {
        appliedPolicies.push(policy.id);

        switch (rule.action) {
          case 'deny':
            allowed = false;
            break;
          case 'require_mfa':
            requiredActions.push('mfa_required');
            break;
          case 'audit':
            requiredActions.push('audit_required');
            break;
          case 'encrypt':
            requiredActions.push('encryption_required');
            break;
        }
      }
    }
  }

  return {
    allowed,
    appliedPolicies,
    requiredActions,
  };
}

/**
 * Get global security configuration
 */
export async function getGlobalSecurityConfig(): Promise<
  SecurityPolicyConfig['globalSettings']
> {
  return { ...globalConfig };
}

/**
 * Update global security configuration
 */
export async function updateGlobalSecurityConfig(
  updates: Partial<SecurityPolicyConfig['globalSettings']>,
): Promise<SecurityPolicyConfig['globalSettings']> {
  globalConfig = { ...globalConfig, ...updates };
  return { ...globalConfig };
}

/**
 * Clear all security policies (for testing)
 */
export function clearSecurityPolicies(): void {
  securityPolicies.clear();
  globalConfig = {
    enforceStrictMode: true,
    auditAllActions: true,
    encryptSensitiveData: true,
    requireMfaForAdmin: true,
  };
}
