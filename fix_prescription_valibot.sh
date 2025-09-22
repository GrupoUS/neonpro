#!/bin/bash

# Fix corrupted optional() method calls in prescription.valibot.ts
echo "🔧 Fixing v.optional_ patterns in prescription.valibot.ts..."

cd /home/vibecode/neonpro/packages/types/src

# Fix v.optional_SchemaName patterns to v.optional(SchemaName)
sed -i 's/v\.optional_\([A-Z][a-zA-Z0-9_]*Schema\)/v.optional(\1)/g' prescription.valibot.ts

# Fix v.optional_PrescriptionStatusSchema to v.optional(PrescriptionStatusSchema)
sed -i 's/v\.optional_PrescriptionStatusSchema/v.optional(PrescriptionStatusSchema)/g' prescription.valibot.ts

# Fix v.optional_PrescriptionTypeSchema to v.optional(PrescriptionTypeSchema)
sed -i 's/v\.optional_PrescriptionTypeSchema/v.optional(PrescriptionTypeSchema)/g' prescription.valibot.ts

# Fix v.optional_MedicationTypeSchema to v.optional(MedicationTypeSchema)
sed -i 's/v\.optional_MedicationTypeSchema/v.optional(MedicationTypeSchema)/g' prescription.valibot.ts

echo "✅ Fixed v.optional_ patterns"
echo "🔍 Testing compilation..."

npx tsc --noEmit 2>&1 | head -20