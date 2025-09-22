#!/bin/bash

# Fix remaining syntax errors in lgpd.valibot.ts
echo "🔧 Fixing remaining syntax errors in lgpd.valibot.ts..."

cd /home/vibecode/neonpro/packages/types/src

# Fix includes("period") - this is incorrect, should be:
sed -i 's/healthcareRetentions\.includes("period")/healthcareRetentions.includes(period)/g' lgpd.valibot.ts

# Fix array syntax patterns like v.array_DataCategorySchema
sed -i 's/v\.array_\([A-Z][a-zA-Z0-9_]*Schema\)/v.array(\1)/g' lgpd.valibot.ts

# Fix optional patterns like v.optional_LanguageSchema
sed -i 's/v\.optional_\([A-Z][a-zA-Z0-9_]*Schema\)/v.optional(\1)/g' lgpd.valibot.ts

echo "✅ Fixed remaining syntax errors in lgpd.valibot.ts"