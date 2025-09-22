#!/bin/bash

# Fix final syntax errors in domain package
echo "🔧 Fixing final syntax errors in domain package..."

cd /home/vibecode/neonpro/packages/domain/src

# Fix remaining malformed super() calls
sed -i "s/\`Repository error: \${message}\`', REPOSITORY_ERROR_', 500);/\`Repository error: \${message}\`, 'REPOSITORY_ERROR', 500);/g" errors/domain-errors.ts

sed -i "s/failed')', AUTHENTICATION_ERROR_', 401);/failed', 'AUTHENTICATION_ERROR', 401);/g" errors/domain-errors.ts

sed -i "s/message')', AUTHORIZATION_ERROR_', 403);/message', 'AUTHORIZATION_ERROR', 403);/g" errors/domain-errors.ts

# Fix constructor parameter 
sed -i "s/constructor(_query: string', timeoutMs: number)/constructor(_query: string, timeoutMs: number)/g" errors/domain-errors.ts

echo "✅ Fixed final syntax errors in domain package"