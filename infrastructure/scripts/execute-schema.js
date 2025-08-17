const fs = require('node:fs');
const https = require('node:https');
require('dotenv').config({ path: '../.env.local' });

// Configurações do Supabase - USAR VARIÁVEIS DE AMBIENTE
const projectRef =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] || 'gfkskrkbnawkuppazkpt';
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

console.log('🚀 Executando Schema CRM no Supabase...');
console.log('🔑 Project:', projectRef);

// Ler o arquivo SQL
const sqlContent = fs.readFileSync('15-insert-single-customer.sql', 'utf8');
console.log(`📝 SQL Schema carregado. Tamanho: ${sqlContent.length} caracteres`);

// Configurar requisição
const postData = JSON.stringify({
  query: sqlContent,
});

const options = {
  hostname: 'api.supabase.com',
  port: 443,
  path: `/v1/projects/${projectRef}/database/query`,
  method: 'POST',
  headers: {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
  },
};

console.log('🔄 Executando SQL no Supabase...');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Schema CRM executado com sucesso!');
      console.log('📊 Resposta:', JSON.parse(data));
    } else {
      console.log('❌ Erro ao executar schema:', res.statusCode);
      console.log('Resposta:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro na requisição:', error);
});

req.write(postData);
req.end();
