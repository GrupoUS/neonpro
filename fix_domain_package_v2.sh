#!/bin/bash

# Fix remaining syntax errors in domain package
echo "🔧 Fixing remaining syntax errors in domain package..."

cd /home/vibecode/neonpro/packages/domain/src

# Fix malformed super() calls with single quotes at end of template literals
sed -i "s/ not found\`', APPOINTMENT_NOT_FOUND_', 404);/ not found\`, 'APPOINTMENT_NOT_FOUND', 404);/g" errors/domain-errors.ts

sed -i "s/ failed: \${validationErrors.join(', ')}\`', APPOINTMENT_VALIDATION_ERROR_', 400);/ failed: \${validationErrors.join(', ')}\`, 'APPOINTMENT_VALIDATION_ERROR', 400);/g" errors/domain-errors.ts

sed -i "s/ is already cancelled\`', APPOINTMENT_ALREADY_CANCELLED_', 400);/ is already cancelled\`, 'APPOINTMENT_ALREADY_CANCELLED', 400);/g" errors/domain-errors.ts

sed -i "s/ in the past: \${startTime}\`', APPOINTMENT_IN_PAST_', 400);/ in the past: \${startTime}\`, 'APPOINTMENT_IN_PAST', 400);/g" errors/domain-errors.ts

sed -i "s/ not found\`', CONSENT_NOT_FOUND_', 404);/ not found\`, 'CONSENT_NOT_FOUND', 404);/g" errors/domain-errors.ts

sed -i "s/ failed: \${validationErrors.join(', ')}\`', CONSENT_VALIDATION_ERROR_', 400);/ failed: \${validationErrors.join(', ')}\`, 'CONSENT_VALIDATION_ERROR', 400);/g" errors/domain-errors.ts

sed -i "s/ is already revoked\`', CONSENT_ALREADY_REVOKED_', 400);/ is already revoked\`, 'CONSENT_ALREADY_REVOKED', 400);/g" errors/domain-errors.ts

sed -i "s/ has expired\`', CONSENT_EXPIRED_', 400);/ has expired\`, 'CONSENT_EXPIRED', 400);/g" errors/domain-errors.ts

sed -i "s/ detected: \${violations.join(', ')}\`', COMPLIANCE_VIOLATION_', 403);/ detected: \${violations.join(', ')}\`, 'COMPLIANCE_VIOLATION', 403);/g" errors/domain-errors.ts

sed -i "s/ error: \${message}\`', LGPD_COMPLIANCE_ERROR_', 403);/ error: \${message}\`, 'LGPD_COMPLIANCE_ERROR', 403);/g" errors/domain-errors.ts

# Fix constructor parameters with malformed quotes
sed -i "s/constructor(message: string', originalError?: Error)/constructor(message: string, originalError?: Error)/g" errors/domain-errors.ts

# Fix malformed string literals in return statements
sed -i "s/return ''REPOSITORY_ERROR'/return 'REPOSITORY_ERROR'/g" errors/domain-errors.ts

sed -i "s/return ''DATABASE_CONNECTION_ERROR'/return 'DATABASE_CONNECTION_ERROR'/g" errors/domain-errors.ts

sed -i "s/return ''QUERY_TIMEOUT_ERROR'/return 'QUERY_TIMEOUT_ERROR'/g" errors/domain-errors.ts

sed -i "s/return ''CONSTRAINT_VIOLATION_ERROR'/return 'CONSTRAINT_VIOLATION_ERROR'/g" errors/domain-errors.ts

sed -i "s/return ''AUTHORIZATION_ERROR'/return 'AUTHORIZATION_ERROR'/g" errors/domain-errors.ts

sed -i "s/return ''PERMISSION_DENIED'/return 'PERMISSION_DENIED'/g" errors/domain-errors.ts

# Fix more constructor parameters
sed -i "s/constructor(permission: string', resource: string)/constructor(permission: string, resource: string)/g" errors/domain-errors.ts

sed -i "s/constructor(query: string', timeoutMs: number)/constructor(query: string, timeoutMs: number)/g" errors/domain-errors.ts

sed -i "s/constructor(constraint: string', table: string)/constructor(constraint: string, table: string)/g" errors/domain-errors.ts

sed -i "s/constructor(rule: string', message: string)/constructor(rule: string, message: string)/g" errors/domain-errors.ts

# Fix message parameter
sed -i "s/public readonly message: string',/public readonly message: string,/g" errors/domain-errors.ts

# Fix super calls with authentication errors
sed -i "s/failed')', AUTHENTICATION_ERROR_', 401);/failed', 'AUTHENTICATION_ERROR', 401);/g" errors/domain-errors.ts

sed -i "s/failed')', AUTHORIZATION_ERROR_', 403);/failed', 'AUTHORIZATION_ERROR', 403);/g" errors/domain-errors.ts

# Fix validation error super call
sed -i "s/failed for field '\${field}': \${message}\`', VALIDATION_ERROR_', 400);/failed for field '\${field}': \${message}\`, 'VALIDATION_ERROR', 400);/g" errors/domain-errors.ts

# Fix aggregate validation error
sed -i "s/Validation failed with \${errors.length} error(s): \${errors.map(e => e.message).join(', ')}\`', 'AGGREGATE_VALIDATION_ERROR_', 400);/Validation failed with \${errors.length} error(s): \${errors.map(e => e.message).join(', ')}\`, 'AGGREGATE_VALIDATION_ERROR', 400);/g" errors/domain-errors.ts

# Fix business rule violation
sed -i "s/Business rule violation: \${rule} - \${message}\`', BUSINESS_RULE_VIOLATION_', 400);/Business rule violation: \${rule} - \${message}\`, 'BUSINESS_RULE_VIOLATION', 400);/g" errors/domain-errors.ts

echo "✅ Fixed remaining syntax errors in domain package"