#!/bin/bash
# Carefully remove specific unused imports

echo "🔧 Removing specific unused imports..."

cd apps/web

# Remove unused Separator import from specific file
echo "Fixing NoShowRiskDisplay.tsx..."
sed -i "/import { Separator } from '@\/components\/ui\/separator';/d" src/components/appointments/NoShowRiskDisplay.tsx

# Remove unused DropdownMenuSeparator from ResponseFormatter.tsx
echo "Fixing ResponseFormatter.tsx..."
sed -i "s/  DropdownMenuSeparator,//g" src/components/ai/ResponseFormatter.tsx

# Remove unused Separator from ReminderManagement.tsx
echo "Fixing ReminderManagement.tsx..."
sed -i "/import { Separator } from '@\/components\/ui\/separator';/d" src/components/appointments/ReminderManagement.tsx

echo "Fixed specific unused imports. Checking progress..."