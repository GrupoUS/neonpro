#!/usr/bin/env node

/**
 * Frontend API Integration Test
 * Tests the patient management flow from frontend to backend
 */

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:3003';

async function testEndpoints() {
  console.log('🧪 Testing Frontend-Backend Integration\n');

  // Test 1: Backend Health
  try {
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Backend Health Check:', healthData.status);
  } catch (error) {
    console.error('❌ Backend Health Check Failed:', error.message);
    return;
  }

  // Test 2: Frontend Availability
  try {
    const frontendResponse = await fetch(FRONTEND_URL);
    if (frontendResponse.ok) {
      console.log('✅ Frontend Available');
    } else {
      console.log('⚠️  Frontend Response:', frontendResponse.status);
    }
  } catch (error) {
    console.error('❌ Frontend Connection Failed:', error.message);
    return;
  }

  // Test 3: API Proxy (Next.js -> Hono.dev)
  try {
    const proxyResponse = await fetch(`${FRONTEND_URL}/api/health`);
    if (proxyResponse.ok) {
      const proxyData = await proxyResponse.json();
      console.log('✅ API Proxy Working:', proxyData.status);
    } else {
      console.log('⚠️  API Proxy Response:', proxyResponse.status);
    }
  } catch (error) {
    console.error('❌ API Proxy Failed:', error.message);
  }

  // Test 4: Patient Endpoints (Backend Direct)
  try {
    const patientsResponse = await fetch(`${BACKEND_URL}/api/patients`);
    if (patientsResponse.ok) {
      const patientsData = await patientsResponse.json();
      console.log('✅ Patients Endpoint:', patientsData.data?.length || 0, 'patients');
    } else {
      console.log('⚠️  Patients Endpoint Response:', patientsResponse.status);
    }
  } catch (error) {
    console.error('❌ Patients Endpoint Failed:', error.message);
  }

  console.log('\n🎯 Integration Test Complete!');
  console.log('📊 Results:');
  console.log('   - Frontend: http://localhost:3000');
  console.log('   - Backend: http://localhost:3003');
  console.log('   - Patient Management: Ready for testing');
}

testEndpoints().catch(console.error);