/**
 * 🎯 Error patterns conhecidos com recovery actions
 */
const KNOWN_ERROR_PATTERNS: ErrorPattern[] = [
  // Database errors
  {
    pattern: /connection.*timeout|connection.*refused|too many connections/i,
    category: 'database',
    severity: 'high',
    recoveryAction: 'retry_with_backoff',
    description: 'Database connection issues',
  },
  {
    pattern: /row level security|rls.*policy/i,
    category: 'database',
    severity: 'medium',
    recoveryAction: 'check_permissions',
    description: 'RLS policy violation',
  },
  {
    pattern: /unique constraint|duplicate key/i,
    category: 'database',
    severity: 'low',
    recoveryAction: 'handle_duplicate',
    description: 'Duplicate data insertion',
  },

  // Auth errors
  {
    pattern: /jwt.*expired|token.*invalid|unauthorized/i,
    category: 'auth',
    severity: 'medium',
    recoveryAction: 'refresh_token',
    description: 'Authentication token issues',
  },
  {
    pattern: /session.*not found|session.*expired/i,
    category: 'auth',
    severity: 'medium',
    recoveryAction: 'redirect_login',
    description: 'Session management issues',
  },

  // API errors
  {
    pattern: /rate limit|too many requests/i,
    category: 'api',
    severity: 'low',
    recoveryAction: 'exponential_backoff',
    description: 'Rate limiting triggered',
  },
  {
    pattern: /network error|fetch.*failed|connection.*reset/i,
    category: 'network',
    severity: 'medium',
    recoveryAction: 'retry_request',
    description: 'Network connectivity issues',
  },

  // Validation errors
  {
    pattern: /validation.*failed|invalid.*input|schema.*error/i,
    category: 'validation',
    severity: 'low',
    recoveryAction: 'validate_input',
    description: 'Input validation failures',
  },
];

export { KNOWN_ERROR_PATTERNS };
