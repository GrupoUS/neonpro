#!/bin/bash

# Fix syntax errors in patient.valibot.ts
echo "🔧 Fixing syntax errors in patient.valibot.ts..."

cd /home/vibecode/neonpro/packages/types/src

# Fix includes_cleanCPF to includes(cleanCPF)
sed -i 's/includes_cleanCPF/includes(cleanCPF)/g' patient.valibot.ts

# Fix charAt_i to charAt(i)
sed -i 's/charAt_i/charAt(i)/g' patient.valibot.ts

# Fix includes_firstDigit to includes(firstDigit)
sed -i 's/includes_firstDigit/includes(firstDigit)/g' patient.valibot.ts

# Fix parseInt_areaCode to parseInt(areaCode)
sed -i 's/parseInt_areaCode/parseInt(areaCode)/g' patient.valibot.ts

echo "✅ Fixed syntax errors in patient.valibot.ts"