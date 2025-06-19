#!/usr/bin/env node

/**
 * NEONPRO Simple Deploy Script
 * Deploy direto para Vercel sem validações complexas
 */

const { execSync } = require('child_process');

console.log('🚀 NEONPRO - Deploy Simples para Vercel\n');

try {
  // Verificar se Vercel CLI está instalado
  console.log('🔍 Verificando Vercel CLI...');
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    console.log('✅ Vercel CLI encontrado');
  } catch (error) {
    console.log('📦 Instalando Vercel CLI...');
    execSync('npm install -g vercel', { stdio: 'inherit' });
    console.log('✅ Vercel CLI instalado');
  }

  // Fazer login se necessário
  console.log('\n🔐 Verificando autenticação...');
  try {
    execSync('vercel whoami', { stdio: 'pipe' });
    console.log('✅ Já autenticado no Vercel');
  } catch (error) {
    console.log('🔑 Fazendo login no Vercel...');
    execSync('vercel login', { stdio: 'inherit' });
  }

  // Deploy
  console.log('\n🚀 Iniciando deploy...');
  console.log('📍 Projeto: NEONPRO');
  console.log('🌐 Plataforma: Vercel');
  console.log('⚡ Modo: Preview (para teste)');
  
  const output = execSync('vercel', { 
    stdio: 'pipe', 
    encoding: 'utf8',
    cwd: __dirname + '/..'
  });
  
  console.log('\n✅ Deploy concluído com sucesso!');
  
  // Extrair URL
  const urlMatch = output.match(/https:\/\/[^\s]+/);
  if (urlMatch) {
    const deployUrl = urlMatch[0];
    console.log(`\n🌐 URL do Deploy: ${deployUrl}`);
    console.log(`🔐 Login: ${deployUrl}/login`);
    console.log(`📊 Dashboard: ${deployUrl}/dashboard`);
    
    // Salvar URL
    require('fs').writeFileSync(
      __dirname + '/../DEPLOY_URL.txt',
      `Deploy URL: ${deployUrl}\nDate: ${new Date().toISOString()}\n`
    );
    
    console.log('\n📋 Próximos passos:');
    console.log('1. Acesse a URL acima para testar');
    console.log('2. Configure variáveis de ambiente no Vercel Dashboard');
    console.log('3. Teste todas as funcionalidades');
    console.log('4. Se tudo estiver OK, faça deploy para produção com: vercel --prod');
    
  } else {
    console.log('\n⚠️  URL não encontrada no output, mas deploy foi concluído');
    console.log('Verifique no Vercel Dashboard: https://vercel.com/dashboard');
  }

} catch (error) {
  console.error('\n❌ Erro durante o deploy:', error.message);
  console.log('\n🔧 Possíveis soluções:');
  console.log('1. Verifique sua conexão com a internet');
  console.log('2. Faça login manual: vercel login');
  console.log('3. Tente novamente: node scripts/simple-deploy.js');
  console.log('4. Deploy manual: vercel');
  process.exit(1);
}
