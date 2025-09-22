#!/bin/bash

# Fix corrupted method calls and properties in lgpd.valibot.ts
echo "🔧 Fixing syntax errors in lgpd.valibot.ts..."

cd /home/vibecode/neonpro/packages/types/src

# Fix test_hash to test(hash)
sed -i 's/sha256Regex\.test_hash/sha256Regex.test(hash)/g' lgpd.valibot.ts

# Fix test_token to test(token)
sed -i 's/base64Regex\.test_token/base64Regex.test(token)/g' lgpd.valibot.ts

# Fix other syntax errors that might exist
# Fix includes_period to includes('period')
sed -i 's/includes_period/includes("period")/g' lgpd.valibot.ts

# Fix test_period to test(period)
sed -i 's/test_period/test(period)/g' lgpd.valibot.ts

# Fix test_email to test(email)
sed -i 's/test_email/test(email)/g' lgpd.valibot.ts

echo "✅ Fixed syntax errors in lgpd.valibot.ts"