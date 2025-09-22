#!/bin/bash

# Fix unused parameter warnings in lgpd.valibot.ts
echo "🔧 Fixing unused parameter warnings in lgpd.valibot.ts..."

cd /home/vibecode/neonpro/packages/types/src

# Fix unused consent parameter
sed -i 's/export const validateLGPDConsentLifecycle = (consent: unknown): boolean => {/export const validateLGPDConsentLifecycle = (_consent: unknown): boolean => {/g' lgpd.valibot.ts

# Fix unused consentData parameter
sed -i 's/  consentData: string,/  _consentData: string,/g' lgpd.valibot.ts

echo "✅ Fixed unused parameter warnings in lgpd.valibot.ts"