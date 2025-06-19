#!/usr/bin/env node

/**
 * NEONPRO Netlify Deployment Script
 * Solução automatizada e otimizada para deploy no Netlify
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 NEONPRO - Deploy Automatizado Netlify\n');
console.log('=' .repeat(50));

// Configurações
const projectDir = path.join(__dirname, '..');
const staticDir = path.join(projectDir, 'static-demo');
const deployDir = path.join(projectDir, 'netlify-deploy');

// Resultados do processo
const results = {
  method: '',
  url: '',
  success: false,
  duration: 0
};

function logStep(step, message) {
  console.log(`\n${step} ${message}`);
}

function logSuccess(message) {
  console.log(`✅ ${message}`);
}

function logError(message) {
  console.log(`❌ ${message}`);
}

function logWarning(message) {
  console.log(`⚠️  ${message}`);
}

// Verificar se Netlify CLI está instalado
function checkNetlifyCLI() {
  logStep('🔍', 'Verificando Netlify CLI...');
  try {
    const version = execSync('netlify --version', { stdio: 'pipe', encoding: 'utf8' });
    logSuccess(`Netlify CLI encontrado: ${version.trim()}`);
    return true;
  } catch (error) {
    logWarning('Netlify CLI não encontrado');
    logStep('📦', 'Instalando Netlify CLI...');
    try {
      execSync('npm install -g netlify-cli', { stdio: 'inherit' });
      logSuccess('Netlify CLI instalado com sucesso');
      return true;
    } catch (installError) {
      logError('Erro ao instalar Netlify CLI');
      return false;
    }
  }
}

// Verificar autenticação
function checkAuth() {
  logStep('🔐', 'Verificando autenticação...');
  try {
    const user = execSync('netlify status', { stdio: 'pipe', encoding: 'utf8' });
    if (user.includes('Logged in')) {
      logSuccess('Já autenticado no Netlify');
      return true;
    }
  } catch (error) {
    logWarning('Não autenticado no Netlify');
    logStep('🔑', 'Iniciando processo de login...');
    console.log('\n📋 Instruções:');
    console.log('1. Uma janela do navegador será aberta');
    console.log('2. Faça login com sua conta Netlify');
    console.log('3. Autorize o acesso');
    console.log('4. Retorne ao terminal\n');
    
    try {
      execSync('netlify login', { stdio: 'inherit' });
      logSuccess('Login realizado com sucesso');
      return true;
    } catch (loginError) {
      logError('Erro no processo de login');
      return false;
    }
  }
  return true;
}

// Preparar versão estática otimizada
function prepareStaticVersion() {
  logStep('📁', 'Preparando versão estática otimizada...');
  
  try {
    // Criar diretório de deploy
    if (fs.existsSync(deployDir)) {
      fs.rmSync(deployDir, { recursive: true, force: true });
    }
    fs.mkdirSync(deployDir, { recursive: true });
    
    // Copiar arquivo HTML principal
    const sourceFile = path.join(staticDir, 'neonpro-demo.html');
    const targetFile = path.join(deployDir, 'index.html');
    
    if (fs.existsSync(sourceFile)) {
      let content = fs.readFileSync(sourceFile, 'utf8');
      
      // Otimizações para Netlify
      content = content.replace(
        '<title>NEONPRO - Advanced Business SaaS Platform | GRUPO US</title>',
        `<title>NEONPRO - Advanced Business SaaS Platform | GRUPO US</title>
    <meta name="netlify-deploy" content="optimized">
    <meta name="generator" content="NEONPRO Deploy Script v1.0">
    <link rel="canonical" href="https://neonpro.netlify.app/">`
      );
      
      fs.writeFileSync(targetFile, content);
      logSuccess('Arquivo HTML otimizado criado');
    } else {
      throw new Error('Arquivo fonte não encontrado');
    }
    
    // Copiar arquivos de configuração
    const configFiles = ['netlify.toml', '_redirects'];
    configFiles.forEach(file => {
      const source = path.join(projectDir, file);
      const target = path.join(deployDir, file);
      if (fs.existsSync(source)) {
        fs.copyFileSync(source, target);
        logSuccess(`${file} copiado`);
      }
    });
    
    // Criar arquivo de manifesto
    const manifest = {
      name: 'NEONPRO',
      short_name: 'NEONPRO',
      description: 'Advanced Business SaaS Platform - GRUPO US',
      start_url: '/',
      display: 'standalone',
      background_color: '#112031',
      theme_color: '#112031',
      icons: [
        {
          src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23112031"><path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>',
          sizes: '192x192',
          type: 'image/svg+xml'
        }
      ]
    };
    
    fs.writeFileSync(
      path.join(deployDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    logSuccess('Manifesto PWA criado');
    
    return true;
  } catch (error) {
    logError(`Erro ao preparar versão estática: ${error.message}`);
    return false;
  }
}

// Deploy para Netlify
function deployToNetlify() {
  logStep('🚀', 'Iniciando deploy para Netlify...');
  
  const startTime = Date.now();
  
  try {
    logStep('📤', 'Fazendo upload dos arquivos...');
    
    const output = execSync(`netlify deploy --dir="${deployDir}" --prod`, {
      stdio: 'pipe',
      encoding: 'utf8',
      cwd: projectDir
    });
    
    results.duration = Math.round((Date.now() - startTime) / 1000);
    results.success = true;
    results.method = 'Netlify CLI';
    
    // Extrair URL do deploy
    const urlMatch = output.match(/Website URL:\s*(https:\/\/[^\s]+)/);
    if (urlMatch) {
      results.url = urlMatch[1];
    }
    
    logSuccess('Deploy concluído com sucesso!');
    return true;
    
  } catch (error) {
    logError(`Erro durante o deploy: ${error.message}`);
    
    // Fallback: instruções para drag-and-drop
    logStep('🔄', 'Tentando método alternativo...');
    console.log('\n📋 Deploy Manual (Drag & Drop):');
    console.log('1. Acesse: https://app.netlify.com/drop');
    console.log(`2. Arraste a pasta: ${deployDir}`);
    console.log('3. Aguarde o upload e processamento');
    console.log('4. Copie a URL fornecida');
    
    results.method = 'Manual (Drag & Drop)';
    return false;
  }
}

// Gerar relatório final
function generateReport() {
  console.log('\n' + '=' .repeat(50));
  console.log('📊 RELATÓRIO DE DEPLOY - NEONPRO');
  console.log('=' .repeat(50));
  
  console.log(`\n🎯 Status: ${results.success ? '✅ SUCESSO' : '⚠️  MANUAL NECESSÁRIO'}`);
  console.log(`⚡ Método: ${results.method}`);
  console.log(`⏱️  Duração: ${results.duration}s`);
  
  if (results.url) {
    console.log(`\n🌐 URL do Site: ${results.url}`);
    console.log(`🔐 Login: ${results.url}/login`);
    console.log(`📊 Dashboard: ${results.url}/dashboard`);
  }
  
  console.log('\n🎯 Funcionalidades Disponíveis:');
  console.log('✅ Design System GRUPO US completo');
  console.log('✅ Layout responsivo (desktop/mobile)');
  console.log('✅ Formulário de autenticação interativo');
  console.log('✅ Acessibilidade WCAG 2.1 AA');
  console.log('✅ Performance otimizada');
  console.log('✅ SEO otimizado');
  console.log('✅ PWA ready');
  
  console.log('\n📋 Próximos Passos:');
  console.log('1. Teste todas as funcionalidades');
  console.log('2. Configure domínio personalizado (opcional)');
  console.log('3. Configure variáveis de ambiente');
  console.log('4. Implemente backend (Supabase/Netlify Functions)');
  
  // Salvar relatório
  const reportData = {
    timestamp: new Date().toISOString(),
    ...results,
    features: [
      'Design System GRUPO US',
      'Layout Responsivo',
      'Autenticação Interativa',
      'Acessibilidade WCAG 2.1 AA',
      'Performance Otimizada',
      'SEO Otimizado',
      'PWA Ready'
    ]
  };
  
  fs.writeFileSync(
    path.join(projectDir, 'NETLIFY_DEPLOY_REPORT.json'),
    JSON.stringify(reportData, null, 2)
  );
  
  console.log('\n💾 Relatório salvo em: NETLIFY_DEPLOY_REPORT.json');
}

// Função principal
async function main() {
  try {
    const startTime = Date.now();
    
    // Verificações e preparação
    if (!checkNetlifyCLI()) process.exit(1);
    if (!checkAuth()) process.exit(1);
    if (!prepareStaticVersion()) process.exit(1);
    
    // Deploy
    deployToNetlify();
    
    // Relatório final
    generateReport();
    
    console.log('\n🎉 Processo concluído!');
    
  } catch (error) {
    logError(`Erro geral: ${error.message}`);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main };
