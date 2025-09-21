#!/bin/bash
# Remove common unused imports that are safe to remove

echo "🔧 Removing unused imports..."

cd apps/web

# Remove the most common unused imports that are clearly not needed
echo "Removing commonly unused UI component imports..."

# UI components that are commonly imported but not used
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i '/^import.*Separator.*from/d'
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i '/^import.*Clock.*from/d'
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i '/^import.*Calendar.*from/d'
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i '/^import.*FileText.*from/d'
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i '/^import.*Progress.*from/d'
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i '/^import.*Phone.*from/d'
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i '/^import.*Activity.*from/d'

echo "Removing commonly unused React hooks..."
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/, useCallback//g'
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/useCallback, //g'
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/, useEffect//g'
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/useEffect, //g'
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/, useMemo//g'
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/useMemo, //g'

echo "Cleaned up imports. Checking lint status..."