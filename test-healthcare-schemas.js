// Test healthcare-specific schemas from apps/api
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Try to import healthcare schemas
try {
  // @ts-ignore - Dynamic require for TypeScript files
  const healthcareSchemas = /** @type {{PatientSchema?: any, AppointmentSchema?: any, validateCPF?: Function}} */ (require('./apps/api/src/schemas/healthcare-validation-schemas.ts'));
  console.warn('✅ Healthcare schemas imported successfully');

  // Test patient schema
  if (healthcareSchemas && healthcareSchemas.PatientSchema) {
    console.warn('✅ Patient schema is available');
  }

  // Test appointment schema
  if (healthcareSchemas && healthcareSchemas.AppointmentSchema) {
    console.warn('✅ Appointment schema is available');
  }

  // Test CPF validation function
  if (healthcareSchemas && typeof healthcareSchemas.validateCPF === 'function') {
    const validCPF = /** @type {any} */ (healthcareSchemas.validateCPF('12345678909'));
    console.warn('✅ CPF validation function works:', validCPF);
  }

} catch (_error) {
  console.error('❌ Healthcare schemas test failed:', String(_error));
}

// Try to import tRPC contracts
try {
  // @ts-ignore - Dynamic require for TypeScript files
  require('./apps/api/src/trpc/contracts/patient.ts');
  console.warn('✅ Patient tRPC contracts imported successfully');
} catch (_error) {
  console.error('❌ Patient tRPC contracts import failed:', String(_error));
}

try {
  // @ts-ignore - Dynamic require for TypeScript files
  require('./apps/api/src/trpc/contracts/appointment.ts');
  console.warn('✅ Appointment tRPC contracts imported successfully');
} catch (_error) {
  console.error('❌ Appointment tRPC contracts import failed:', String(_error));
}

console.warn('🎉 Healthcare schemas test completed!');
