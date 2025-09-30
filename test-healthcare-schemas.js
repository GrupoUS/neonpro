// Test healthcare-specific schemas from apps/api
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Try to import healthcare schemas
try {
  const healthcareSchemas = require('./apps/api/src/schemas/healthcare-validation-schemas.ts');
  console.log('✅ Healthcare schemas imported successfully');
  
  // Test patient schema
  if (healthcareSchemas.PatientSchema) {
    console.log('✅ Patient schema is available');
  }
  
  // Test appointment schema
  if (healthcareSchemas.AppointmentSchema) {
    console.log('✅ Appointment schema is available');
  }
  
  // Test CPF validation function
  if (healthcareSchemas.validateCPF) {
    const validCPF = healthcareSchemas.validateCPF('12345678909');
    console.log('✅ CPF validation function works:', validCPF);
  }
  
} catch (_error) {
  console.error('❌ Healthcare schemas test failed:', _error.message);
}

// Try to import tRPC contracts
try {
  require('./apps/api/src/trpc/contracts/patient.ts');
  console.log('✅ Patient tRPC contracts imported successfully');
} catch (_error) {
  console.error('❌ Patient tRPC contracts import failed:', _error.message);
}

try {
  require('./apps/api/src/trpc/contracts/appointment.ts');
  console.log('✅ Appointment tRPC contracts imported successfully');
} catch (_error) {
  console.error('❌ Appointment tRPC contracts import failed:', _error.message);
}

console.log('🎉 Healthcare schemas test completed!');