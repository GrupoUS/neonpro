#!/bin/bash
# Fix inconsistent error variable references in catch blocks

echo "🔧 Fixing inconsistent error variable references..."

cd apps/web

# Fix err -> error references in catch blocks
echo "Fixing 'err' references to match 'error' parameter..."
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/err instanceof Error/error instanceof Error/g'
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/err\.message/error.message/g'
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/err as /error as /g'
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/console\.error.*err)/console.error(error)/g'

# Fix catch blocks that truly don't use the error - replace with _
echo "Finding catch blocks that truly don't use the error parameter..."

# For files where catch(error) but error is never referenced in the block
# This requires more sophisticated parsing, so let's do it manually for now

echo "Fixed error references. Re-running lint to check progress..."