const { PatientService } = await import('./apps/api/src/services/patient-service.js');

console.log('Testing PatientService...');

const patientService = new PatientService();

console.log('Service initialized:', patientService.isConfigured());

// Test with the existing mock patient ID
try {
  const result = await patientService.getPatientById('patient-123');
  console.log('Patient lookup result:', result);
} catch (error) {
  console.error('Error:', error);
}

// Test with test patient ID
try {
  const result = await patientService.getPatientById('550e8400-e29b-41d4-a716-446655440000');
  console.log('Test patient lookup result:', result);
} catch (error) {
  console.error('Error:', error);
}