// Script para testar a interface web do Accounts Payable
// Usage: node scripts/test-web-interface.js

const _https = require('node:https');
const http = require('node:http');

const baseUrl = 'http://127.0.0.1:8080';

console.log('🌐 Testando Interface Web do Accounts Payable...');
console.log(`📍 Base URL: ${baseUrl}`);

// Lista de rotas para testar
const routesToTest = [
  '/dashboard',
  '/dashboard/accounts-payable',
  '/dashboard/accounts-payable/vendors',
  '/dashboard/accounts-payable/reports',
  '/dashboard/accounts-payable/approvals',
  '/dashboard/accounts-payable/notifications',
  '/dashboard/accounts-payable/analytics',
];

async function testRoute(path) {
  return new Promise((resolve) => {
    const url = `${baseUrl}${path}`;

    const req = http.get(url, (res) => {
      const statusCode = res.statusCode;
      const statusMessage = res.statusMessage;

      // Verificar se a resposta é válida
      if (statusCode === 200) {
        console.log(`✅ ${path} - Status: ${statusCode} (OK)`);
        resolve({ path, status: statusCode, success: true });
      } else if (statusCode === 302 || statusCode === 307) {
        console.log(`🔄 ${path} - Status: ${statusCode} (Redirect - provavelmente auth)`);
        resolve({
          path,
          status: statusCode,
          success: true,
          note: 'Redirect (Auth required)',
        });
      } else if (statusCode === 404) {
        console.log(`❌ ${path} - Status: ${statusCode} (Not Found)`);
        resolve({
          path,
          status: statusCode,
          success: false,
          error: 'Route not found',
        });
      } else {
        console.log(`⚠️  ${path} - Status: ${statusCode} (${statusMessage})`);
        resolve({
          path,
          status: statusCode,
          success: false,
          error: statusMessage,
        });
      }
    });

    req.on('error', (error) => {
      console.log(`❌ ${path} - Error: ${error.message}`);
      resolve({ path, status: 0, success: false, error: error.message });
    });

    // Timeout após 5 segundos
    req.setTimeout(5000, () => {
      req.destroy();
      console.log(`⏱️  ${path} - Timeout`);
      resolve({ path, status: 0, success: false, error: 'Timeout' });
    });
  });
}

async function runWebInterfaceTests() {
  console.log('\n🧪 Iniciando testes de interface...\n');

  const results = [];

  for (const route of routesToTest) {
    const result = await testRoute(route);
    results.push(result);
    // Pequena pausa entre requests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log('\n📊 RESUMO DOS TESTES DE INTERFACE:');
  console.log('='.repeat(50));

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`✅ Rotas funcionando: ${successful.length}/${results.length}`);

  if (successful.length > 0) {
    console.log('\n✅ ROTAS OK:');
    successful.forEach((result) => {
      const note = result.note ? ` (${result.note})` : '';
      console.log(`   • ${result.path} - ${result.status}${note}`);
    });
  }

  if (failed.length > 0) {
    console.log('\n❌ ROTAS COM PROBLEMAS:');
    failed.forEach((result) => {
      console.log(`   • ${result.path} - ${result.error || 'Unknown error'}`);
    });
  }

  console.log('\n🎯 RECOMENDAÇÕES:');

  if (successful.length === results.length) {
    console.log('🚀 Todas as rotas estão funcionando! Interface web está operacional.');
  } else if (successful.length > 0) {
    console.log('⚠️  Algumas rotas precisam de verificação manual ou implementação adicional.');
  } else {
    console.log('❌ Problemas graves detectados. Verificar servidor e configurações.');
  }

  console.log(`\n🌐 Para testar manualmente, acesse: ${baseUrl}/dashboard/accounts-payable`);
  console.log('🔐 Note: Algumas rotas podem requerer autenticação.');

  return results;
}

// Executar os testes
runWebInterfaceTests().catch(console.error);
