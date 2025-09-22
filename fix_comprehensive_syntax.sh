#!/bin/bash

# Comprehensive fix for underscore syntax errors across the codebase
echo "🔧 Fixing comprehensive underscore syntax errors..."

# Fix branded type pattern - replace (_brand): with __brand:
find /home/vibecode/neonpro/packages/types/src -name "*.ts" -type f -exec sed -i 's/readonly (_brand):/readonly __brand:/g' {} \;

# Fix object property names with underscores - replace property(_name) with property_name
find /home/vibecode/neonpro/packages/types/src -name "*.ts" -type f -exec sed -i 's/\([a-zA-Z_][a-zA-Z0-9_]*\)(\([a-zA-Z_][a-zA-Z0-9_]*\))/\1_\2/g' {} \;

# Fix object method calls - replace method(_call) with method_call
find /home/vibecode/neonpro/packages/types/src -name "*.ts" -type f -exec sed -i 's/\.\([a-zA-Z_][a-zA-Z0-9_]*\)(\([a-zA-Z_][a-zA-Z0-9_]*\))/.\1_\2/g' {} \;

# Fix string literals that got broken - replace _'string' with 'string'
find /home/vibecode/neonpro/packages/types/src -name "*.ts" -type f -exec sed -i "s/_'/'/g" {} \;
find /home/vibecode/neonpro/packages/types/src -name "*.ts" -type f -exec sed -i 's/_")/")/g' {} \;

# Fix array/object access patterns - replace [_key] with [_key]
find /home/vibecode/neonpro/packages/types/src -name "*.ts" -type f -exec sed -i 's/\[_\([a-zA-Z_][a-zA-Z0-9_]*\)\]/[\1]/g' {} \;

echo "✅ Comprehensive syntax fixes completed"
echo "🔍 Testing types package..."

cd /home/vibecode/neonpro/packages/types

# Check if fixes worked
if npx tsc --noEmit 2>/dev/null; then
    echo "✅ Types package compilation successful!"
else
    echo "⚠️  Some errors remain, checking remaining issues..."
    npx tsc --noEmit | head -10
fi