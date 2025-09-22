#!/bin/bash

# Fix corrupted syntax in domain package due to broken underscore transformation
echo "🔧 Fixing syntax errors in domain package..."

cd /home/vibecode/neonpro/packages/domain/src

# Fix malformed super() calls with extra quotes and commas
sed -i "s/super(\`Patient with ID \${patientId} not found\`', PATIENT_NOT_FOUND', 404);/super(\`Patient with ID \${patientId} not found\`, 'PATIENT_NOT_FOUND', 404);/g" errors/domain-errors.ts

# Fix malformed join calls
sed -i "s/join('', )/join(', ')/g" errors/domain-errors.ts

# Fix malformed constructor parameters
sed -i "s/constructor(identifier: string', identifierType:/constructor(identifier: string, identifierType:/g" errors/domain-errors.ts

# Fix malformed super() calls in other error classes
sed -i "s/already exists\`', PATIENT_ALREADY_EXISTS_', 409);/already exists\`, 'PATIENT_ALREADY_EXISTS', 409);/g" errors/domain-errors.ts

# Fix malformed string literals throughout the domain package
find . -name "*.ts" -exec sed -i "s/}', '/}, /g" {} \;
find . -name "*.ts" -exec sed -i "s/}`)/\`})/g" {} \;
find . -name "*.ts" -exec sed -i "s/}', '/}, /g" {} \;

# Fix common malformed patterns
find . -name "*.ts" -exec sed -i "s/ string',/ string,/g" {} \;
find . -name "*.ts" -exec sed -i "s/ number',/ number,/g" {} \;
find . -name "*.ts" -exec sed -i "s/ boolean',/ boolean,/g" {} \;
find . -name "*.ts" -exec sed -i "s/')/')/g" {} \;

echo "✅ Fixed syntax errors in domain package"