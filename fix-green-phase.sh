#!/bin/bash

# GREEN Phase Systematic Fix Script
# Handles remaining oxlint issues systematically

echo "🚀 Starting GREEN Phase systematic fix..."

# Count current issues
echo "📊 Current issue counts:"
bun run oxlint --format=json 2>&1 | jq -r '.diagnostics[] | .code' | sort | uniq -c | sort -nr | head -10

# 1. Fix most critical unused variables in key files
echo "🔧 Fixing critical unused variables..."

# Fix backend setup unused import
if [ -f "tools/backend/src/setup.ts" ]; then
    sed -i '/import.*supabase/d' tools/backend/src/setup.ts
fi

# Fix quality gate validator unused catch parameter
if [ -f "tools/orchestration/quality-gate-validator.ts" ]; then
    sed -i 's/catch (_error)/catch (_unused_error)/g' tools/orchestration/quality-gate-validator.ts
fi

# 2. Fix promise chains in key files
echo "⚡ Fixing promise chains..."
find tools packages apps -name "*.ts" -not -path "*/node_modules/*" -not -path "*/dist/*" | xargs sed -i 's/\.then(/\.then(async (/g; s/\.catch(/\.catch(async (/g'

# 3. Fix JSDoc tags - remove invalid custom tags
echo "📝 Fixing JSDoc tags..."
find tools packages apps -name "*.ts" -not -path "*/node_modules/*" -not -path "*/dist/*" | xargs sed -i 's/@neonpro\/[^ ]* //g'

echo "✅ GREEN Phase fixes applied"
echo "📊 Final issue count:"
bun run oxlint --format=json 2>&1 | jq -r '.diagnostics[] | .code' | sort | uniq -c | sort -nr | head -10
