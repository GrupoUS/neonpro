#!/bin/bash

# Fix remaining domain-events.ts syntax errors
echo "🔧 Fixing remaining domain-events.ts syntax errors..."

cd /home/vibecode/neonpro/packages/domain/src/events

# Fix missing closing quotes in aggregateType
sed -i "s/aggregateType: 'Patient;/aggregateType: 'Patient';/g" domain-events.ts
sed -i "s/aggregateType: 'Appointment;/aggregateType: 'Appointment';/g" domain-events.ts
sed -i "s/aggregateType: 'Consent;/aggregateType: 'Consent';/g" domain-events.ts

# Fix missing closing quotes in riskLevel and severity
sed -i "s/riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL;/riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';/g" domain-events.ts
sed -i "s/severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL;/severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';/g" domain-events.ts

echo "✅ Fixed remaining domain-events.ts syntax errors"