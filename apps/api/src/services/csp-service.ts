/**
 * Content Security Policy Service
 * Healthcare-compliant CSP management and reporting
 */

export interface CSPDirective {
  name: string;
  values: string[];
}

export interface ContentSecurityPolicy {
  id: string;
  name: string;
  directives: CSPDirective[];
  reportOnly: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CSPReport {
  'csp-report': {
    'document-uri': string;
    'violated-directive': string;
    'original-policy': string;
    'blocked-uri': string;
    referrer?: string;
    'status-code'?: number;
    'source-file'?: string;
    'line-number'?: number;
    'column-number'?: number;
  };
}

export interface CSPViolation {
  documentUri: string;
  violatedDirective: string;
  originalPolicy: string;
  blockedUri: string;
  referrer?: string;
  statusCode?: number;
  sourceFile?: string;
  lineNumber?: number;
  columnNumber?: number;
  timestamp: Date;
}

/**
 * Generate CSP header string from policy configuration
 */
export function generateCSP(policy: ContentSecurityPolicy): string {
  const directives = policy.directives
    .map(directive => `${directive.name} ${directive.values.join(' ')}`)
    .join('; ');

  return directives;
}

/**
 * Parse CSP violation report
 */
export function parseCSPReport(report: CSPReport): CSPViolation {
  const cspReport = report['csp-report'];

  return {
    documentUri: cspReport['document-uri'],
    violatedDirective: cspReport['violated-directive'],
    originalPolicy: cspReport['original-policy'],
    blockedUri: cspReport['blocked-uri'],
    referrer: cspReport.referrer,
    statusCode: cspReport['status-code'],
    sourceFile: cspReport['source-file'],
    lineNumber: cspReport['line-number'],
    columnNumber: cspReport['column-number'],
    timestamp: new Date(),
  };
}

/**
 * Validate CSP policy configuration
 */
export function validateCSP(policy: ContentSecurityPolicy): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic validation
  if (!policy.directives || policy.directives.length === 0) {
    errors.push('Policy must contain at least one directive');
  }

  // Check for potentially unsafe directives
  for (const directive of policy.directives) {
    if (directive.values.includes('\'unsafe-inline\'')) {
      warnings.push(`Directive ${directive.name} contains 'unsafe-inline'`);
    }
    if (directive.values.includes('\'unsafe-eval\'')) {
      warnings.push(`Directive ${directive.name} contains 'unsafe-eval'`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Create default CSP policy for healthcare applications
 */
export function createHealthcareCSP(): ContentSecurityPolicy {
  return {
    id: crypto.randomUUID(),
    name: 'Healthcare Default Policy',
    directives: [
      {
        name: 'default-src',
        values: ['\'self\''],
      },
      {
        name: 'script-src',
        values: ['\'self\'', '\'strict-dynamic\''],
      },
      {
        name: 'style-src',
        values: ['\'self\'', '\'unsafe-inline\''],
      },
      {
        name: 'img-src',
        values: ['\'self\'', 'data:', 'https:'],
      },
      {
        name: 'connect-src',
        values: ['\'self\'', 'https://api.supabase.co'],
      },
      {
        name: 'frame-ancestors',
        values: ['\'none\''],
      },
      {
        name: 'base-uri',
        values: ['\'self\''],
      },
      {
        name: 'form-action',
        values: ['\'self\''],
      },
    ],
    reportOnly: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Get CSP policy by ID
 */
export async function getCSPPolicy(id: string): Promise<ContentSecurityPolicy | null> {
  // Mock implementation for contract testing
  if (id === 'healthcare-default') {
    return createHealthcareCSP();
  }
  return null;
}

/**
 * Create new CSP policy
 */
export async function createCSPPolicy(
  name: string,
  directives: CSPDirective[],
  reportOnly: boolean = false,
): Promise<ContentSecurityPolicy> {
  return {
    id: crypto.randomUUID(),
    name,
    directives,
    reportOnly,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Update existing CSP policy
 */
export async function updateCSPPolicy(
  id: string,
  updates: Partial<Omit<ContentSecurityPolicy, 'id' | 'createdAt'>>,
): Promise<ContentSecurityPolicy | null> {
  // Mock implementation for contract testing
  const existingPolicy = await getCSPPolicy(id);
  if (!existingPolicy) {
    return null;
  }

  return {
    ...existingPolicy,
    ...updates,
    updatedAt: new Date(),
  };
}

/**
 * Delete CSP policy
 */
export async function deleteCSPPolicy(id: string): Promise<boolean> {
  // Mock implementation for contract testing
  return true;
}

/**
 * List all CSP policies
 */
export async function listCSPPolicies(): Promise<ContentSecurityPolicy[]> {
  // Mock implementation for contract testing
  return [createHealthcareCSP()];
}
