#!/bin/bash

# Fix underscore syntax errors in types package
echo "🔧 Fixing syntax errors in types package..."

cd /home/vibecode/neonpro/packages/types

# Fix common underscore syntax patterns in test files
find src -name "*.test.ts" -type f -exec sed -i "s/_('/'/g" {} \;
find src -name "*.test.ts" -type f -exec sed -i "s/_\")/')/g" {} \;
find src -name "*.test.ts" -type f -exec sed -i "s/_(\")/()/g" {} \;
find src -name "*.test.ts" -type f -exec sed -i "s/beforeEach(_async () => {/beforeEach(async () => {/g" {} \;
find src -name "*.test.ts" -type f -exec sed -i "s/it(_async () => {/it(async () => {/g" {} \;
find src -name "*.test.ts" -type f -exec sed -i "s/vi.mock(_'/vi.mock('/g" {} \;
find src -name "*.test.ts" -type f -exec sed -i "s/vi.mock(_\"/vi.mock(\"/g" {} \;
find src -name "*.test.ts" -type f -exec sed -i "s/expect(_'/expect('/g" {} \;
find src -name "*.test.ts" -type f -exec sed -i "s/expect(_\"/expect(\"/g" {} \;

# Fix array destructuring patterns
find src -name "*.ts" -type f -exec sed -i 's/_\(\([a-zA-Z_][a-zA-Z0-9_]*\),_\([a-zA-Z_][a-zA-Z0-9_]*\)\)/([ \1, \2])/g' {} \;
find src -name "*.ts" -type f -exec sed -i 's/_\(\([a-zA-Z_][a-zA-Z0-9_]*\)\)/(\1)/g' {} \;

# Fix string literal patterns
find src -name "*.ts" -type f -exec sed -i "s/_('/'/g" {} \;
find src -name "*.ts" -type f -exec sed -i "s/_\")/')/g" {} \;
find src -name "*.ts" -type f -exec sed -i "s/_(\")/()/g" {} \;

# Fix specific patterns in bundle-optimizer.ts
if [ -f "src/utils/bundle-optimizer.ts" ]; then
    sed -i 's/_\([a-zA-Z_][a-zA-Z0-9_]*\)/\1/g' src/utils/bundle-optimizer.ts
fi

# Fix security-testing-framework.ts
if [ -f "src/security/security-testing-framework.ts" ]; then
    sed -i 's/return _(/return (/g' src/security/security-testing-framework.ts
fi

echo "✅ Types package syntax fixes completed"
echo "🔍 Running TypeScript check..."

# Check if fixes worked
if npx tsc --noEmit 2>/dev/null; then
    echo "✅ TypeScript compilation successful!"
else
    echo "⚠️  Some errors remain, checking remaining issues..."
    npx tsc --noEmit | head -20
fi