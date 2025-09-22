#!/bin/bash

# Fix domain-events.ts syntax errors
echo "🔧 Fixing domain-events.ts syntax errors..."

cd /home/vibecode/neonpro/packages/domain/src/events

# Fix malformed string literals with trailing semicolons inside quotes
sed -i "s/'PatientCreated;'/'PatientCreated'/g" domain-events.ts
sed -i "s/'Patient;'/'Patient'/g" domain-events.ts
sed -i "s/'PatientUpdated;'/'PatientUpdated'/g" domain-events.ts
sed -i "s/'PatientDeleted;'/'PatientDeleted'/g" domain-events.ts
sed -i "s/'PatientAnonymized;'/'PatientAnonymized'/g" domain-events.ts
sed -i "s/'AppointmentCreated;'/'AppointmentCreated'/g" domain-events.ts
sed -i "s/'Appointment;'/'Appointment'/g" domain-events.ts
sed -i "s/'AppointmentUpdated;'/'AppointmentUpdated'/g" domain-events.ts
sed -i "s/'AppointmentCancelled;'/'AppointmentCancelled'/g" domain-events.ts
sed -i "s/'AppointmentRescheduled;'/'AppointmentRescheduled'/g" domain-events.ts
sed -i "s/'AppointmentCompleted;'/'AppointmentCompleted'/g" domain-events.ts
sed -i "s/'AppointmentNoShow;'/'AppointmentNoShow'/g" domain-events.ts
sed -i "s/'ConsentCreated;'/'ConsentCreated'/g" domain-events.ts
sed -i "s/'Consent;'/'Consent'/g" domain-events.ts
sed -i "s/'ConsentGranted;'/'ConsentGranted'/g" domain-events.ts
sed -i "s/'ConsentRevoked;'/'ConsentRevoked'/g" domain-events.ts
sed -i "s/'ConsentExpired;'/'ConsentExpired'/g" domain-events.ts
sed -i "s/'ConsentRenewed;'/'ConsentRenewed'/g" domain-events.ts
sed -i "s/'ComplianceChecked;'/'ComplianceChecked'/g" domain-events.ts
sed -i "s/'ComplianceViolation;'/'ComplianceViolation'/g" domain-events.ts

# Fix malformed interface declarations with trailing quotes
sed -i "s/extends DomainEvent {'/extends DomainEvent {/g" domain-events.ts

# Fix malformed string literals in data fields
sed -i "s/anonymizedBy: string;'/anonymizedBy: string;/g" domain-events.ts
sed -i "s/reason: 'gdpr_request' | 'data_retention' | ''other/reason: 'gdpr_request' | 'data_retention' | 'other'/g" domain-events.ts
sed -i "s/patientId: string;'/patientId: string;/g" domain-events.ts
sed -i "s/status: 'COMPLIANT' | 'NON_COMPLIANT' | ''PARTIALLY_COMPLIANT'/status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIALLY_COMPLIANT'/g" domain-events.ts
sed -i "s/violationType: string;'/violationType: string;/g" domain-events.ts

# Fix trailing quote at end of file
sed -i "s/}}}}}$'/}}}}}/g" domain-events.ts

echo "✅ Fixed domain-events.ts syntax errors"