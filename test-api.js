#!/usr/bin/env node

import http from 'http';

function testAPI(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3004,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, res => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', err => {
      reject(err);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function main() {
  console.log('Testing NeonPro API Health Endpoints...\n');

  try {
    // Test basic health
    console.log('1. Testing basic health endpoint...');
    const basicHealth = await testAPI('/health');
    console.log(`Status: ${basicHealth.status}`);
    console.log(`Response:`, JSON.stringify(basicHealth.data, null, 2));
    console.log('');

    // Test comprehensive health
    console.log('2. Testing comprehensive health endpoint...');
    const comprehensiveHealth = await testAPI('/v1/health/comprehensive');
    console.log(`Status: ${comprehensiveHealth.status}`);
    console.log(`Response:`, JSON.stringify(comprehensiveHealth.data, null, 2));
    console.log('');

    // Test supabase health
    console.log('3. Testing supabase health endpoint...');
    const supabaseHealth = await testAPI('/v1/health/supabase');
    console.log(`Status: ${supabaseHealth.status}`);
    console.log(`Response:`, JSON.stringify(supabaseHealth.data, null, 2));
    console.log('');
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

main();
