#!/usr/bin/env node

/**
 * NEONPRO Static Deploy Script
 * Deploy da versão estática para demonstração
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 NEONPRO - Deploy Estático para Vercel\n');

const staticDir = path.join(__dirname, '..', 'static-deploy');

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

  // Verificar autenticação
  console.log('\n🔐 Verificando autenticação...');
  try {
    const whoami = execSync('vercel whoami', { stdio: 'pipe', encoding: 'utf8' });
    console.log(`✅ Autenticado como: ${whoami.trim()}`);
  } catch (error) {
    console.log('❌ Não autenticado no Vercel');
    console.log('🔑 Execute: vercel login');
    console.log('📋 Depois execute novamente este script');
    process.exit(1);
  }

  // Deploy da versão estática
  console.log('\n🚀 Fazendo deploy da versão estática...');
  console.log(`📁 Diretório: ${staticDir}`);
  console.log('📄 Tipo: Site estático HTML');
  console.log('🎯 Objetivo: Demonstração NEONPRO');
  
  const output = execSync('vercel --yes', { 
    stdio: 'pipe', 
    encoding: 'utf8',
    cwd: staticDir
  });
  
  console.log('\n✅ Deploy estático concluído com sucesso!');
  
  // Extrair URL
  const urlMatch = output.match(/https:\/\/[^\s]+/);
  if (urlMatch) {
    const deployUrl = urlMatch[0];
    console.log(`\n🌐 URL da Demonstração: ${deployUrl}`);
    
    // Salvar URL
    require('fs').writeFileSync(
      path.join(__dirname, '..', 'STATIC_DEPLOY_URL.txt'),
      `Static Deploy URL: ${deployUrl}\nDate: ${new Date().toISOString()}\nType: Static HTML Demo\n`
    );
    
    console.log('\n🎯 Funcionalidades Demonstradas:');
    console.log('✅ Design System GRUPO US completo');
    console.log('✅ Layout responsivo (desktop/mobile)');
    console.log('✅ Formulário de autenticação interativo');
    console.log('✅ Acessibilidade WCAG 2.1 AA');
    console.log('✅ Tipografia Optima + Inter');
    console.log('✅ Paleta de cores PANTONE oficial');
    console.log('✅ Transições e animações suaves');
    
    console.log('\n📋 Para testar:');
    console.log('1. Acesse a URL acima');
    console.log('2. Teste o toggle Sign In/Sign Up');
    console.log('3. Redimensione a janela (responsividade)');
    console.log('4. Use Tab para navegar (acessibilidade)');
    console.log('5. Teste em dispositivos móveis');
    
    console.log('\n🚀 Para deploy da versão completa:');
    console.log('1. Resolva os conflitos de merge');
    console.log('2. Execute: vercel (no diretório raiz)');
    console.log('3. Configure variáveis de ambiente');
    
  } else {
    console.log('\n⚠️  URL não encontrada, mas deploy foi concluído');
    console.log('Verifique no Vercel Dashboard: https://vercel.com/dashboard');
  }

} catch (error) {
  console.error('\n❌ Erro durante o deploy:', error.message);
  
  if (error.message.includes('not authenticated')) {
    console.log('\n🔑 Solução: Faça login no Vercel');
    console.log('Execute: vercel login');
  } else {
    console.log('\n🔧 Possíveis soluções:');
    console.log('1. Verifique sua conexão com a internet');
    console.log('2. Tente fazer login novamente: vercel login');
    console.log('3. Deploy manual da pasta static-deploy: cd static-deploy && vercel');
  }
  
  process.exit(1);
}
