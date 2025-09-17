import { AIChatService } from './apps/api/src/services/ai-chat-service.js';
import { PatientService } from './apps/api/src/services/patient-service.js';

console.log('=== Testing AI Insights Debug ===');

const aiChatService = new AIChatService();
const patientService = new PatientService();

// Test patient lookup first
console.log('\n1. Testing patient lookup...');
try {
  const patient = await patientService.getPatientById('550e8400-e29b-41d4-a716-446655440000');
  console.log('Patient lookup result:', { success: patient.success, error: patient.error });
} catch (error) {
  console.log('Patient lookup error:', error.message);
}

// Test AI insights generation
console.log('\n2. Testing AI insights generation...');
try {
  const insightsRequest = {
    conversationId: 'conv-550e8400-e29b-41d4-a716-446655440000',
    analysisType: 'patient_insights',
    includeHistory: true,
  };
  
  const insights = await aiChatService.generateInsights(insightsRequest);
  console.log('Insights result:', { success: insights.success, error: insights.error });
  if (insights.success) {
    console.log('Insights data:', JSON.stringify(insights.data, null, 2));
  }
} catch (error) {
  console.log('Insights error:', error.message);
}

// Test health status
console.log('\n3. Testing health status...');
try {
  const health = aiChatService.getHealthStatus();
  console.log('Health status:', health);
} catch (error) {
  console.log('Health status error:', error.message);
}

console.log('\n=== Debug Complete ===');