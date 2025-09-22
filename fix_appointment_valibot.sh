#!/bin/bash

# Fix corrupted v.optional_ method calls in appointment.valibot.ts
echo "🔧 Fixing v.optional_ patterns in appointment.valibot.ts..."

cd /home/vibecode/neonpro/packages/types/src

# Fix v.optional_AppointmentPrioritySchema to v.optional(AppointmentPriority)
sed -i 's/v\.optional_AppointmentPriority/v.optional(AppointmentPriority)/g' appointment.valibot.ts

# Fix v.optional_AppointmentStatusSchema to v.optional(AppointmentStatus)
sed -i 's/v\.optional_AppointmentStatus/v.optional(AppointmentStatus)/g' appointment.valibot.ts

# Fix v.optional_AestheticProcedureTypeSchema to v.optional(AestheticProcedureType)
sed -i 's/v\.optional_AestheticProcedureType/v.optional(AestheticProcedureType)/g' appointment.valibot.ts

echo "✅ Fixed v.optional_ patterns in appointment.valibot.ts"