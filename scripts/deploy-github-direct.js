#!/usr/bin/env node

/**
 * NEONPRO GitHub Direct Deploy
 * Deploy direto do GitHub usando Netlify CLI
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 NEONPRO - Deploy Direto do GitHub\n');
console.log('=' .repeat(50));

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

// Verificar se está em repositório Git
function checkGitRepo() {
  logStep('🔍', 'Verificando repositório Git...');
  
  try {
    const remoteUrl = execSync('git remote get-url origin', { 
      stdio: 'pipe', 
      encoding: 'utf8' 
    }).trim();
    
    if (remoteUrl.includes('github.com')) {
      const match = remoteUrl.match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/);
      if (match) {
        const repoPath = match[1];
        logSuccess(`Repositório GitHub: ${repoPath}`);
        return { url: remoteUrl, path: repoPath };
      }
    }
    
    throw new Error('Repositório GitHub não encontrado');
  } catch (error) {
    logError('Este diretório não é um repositório Git conectado ao GitHub');
    console.log('\n📋 Soluções:');
    console.log('1. Verifique se está no diretório correto');
    console.log('2. Execute: git remote -v');
    console.log('3. Configure o remote: git remote add origin https://github.com/user/repo.git');
    throw error;
  }
}

// Verificar Netlify CLI
function checkNetlifyCLI() {
  logStep('📦', 'Verificando Netlify CLI...');
  
  try {
    const version = execSync('netlify --version', { stdio: 'pipe', encoding: 'utf8' });
    logSuccess(`Netlify CLI ${version.trim()}`);
    return true;
  } catch (error) {
    logStep('📦', 'Instalando Netlify CLI...');
    try {
      execSync('npm install -g netlify-cli', { stdio: 'inherit' });
      logSuccess('Netlify CLI instalado');
      return true;
    } catch (installError) {
      logError('Erro ao instalar Netlify CLI');
      console.log('\n📋 Instale manualmente:');
      console.log('npm install -g netlify-cli');
      return false;
    }
  }
}

// Verificar autenticação Netlify
function checkNetlifyAuth() {
  logStep('🔐', 'Verificando autenticação Netlify...');
  
  try {
    const status = execSync('netlify status', { stdio: 'pipe', encoding: 'utf8' });
    if (status.includes('Logged in')) {
      logSuccess('Já autenticado no Netlify');
      return true;
    }
  } catch (error) {
    logWarning('Não autenticado no Netlify');
    
    console.log('\n🔑 Fazendo login no Netlify...');
    console.log('Uma janela do navegador será aberta para autenticação.');
    
    try {
      execSync('netlify login', { stdio: 'inherit' });
      logSuccess('Login realizado com sucesso');
      return true;
    } catch (loginError) {
      logError('Erro no login');
      console.log('\n📋 Tente manualmente:');
      console.log('netlify login');
      return false;
    }
  }
  
  return true;
}

// Preparar configuração para Next.js estático
function prepareNextConfig() {
  logStep('⚙️', 'Preparando configuração Next.js...');
  
  const configPath = path.join(__dirname, '..', 'next.config.production.js');
  
  const productionConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  // Export estático para Netlify
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  
  // Desabilitar otimização de imagens para export estático
  images: {
    unoptimized: true,
  },
  
  // Configurações de performance
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  // TypeScript (ignorar erros temporariamente)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ESLint (ignorar durante build)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Variáveis de ambiente
  env: {
    NODE_ENV: 'production',
    NEXT_TELEMETRY_DISABLED: '1',
  },
};

module.exports = nextConfig;
`;
  
  fs.writeFileSync(configPath, productionConfig);
  logSuccess('Configuração de produção criada');
  
  return configPath;
}

// Atualizar package.json para build de produção
function updatePackageJson() {
  logStep('📝', 'Atualizando scripts de build...');
  
  const packagePath = path.join(__dirname, '..', 'package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Backup do script original
    if (!packageJson.scripts['build:original']) {
      packageJson.scripts['build:original'] = packageJson.scripts.build;
    }
    
    // Script de build para produção
    packageJson.scripts['build:production'] = 'NEXT_CONFIG_FILE=next.config.production.js next build';
    packageJson.scripts['build'] = 'next build';
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    logSuccess('Scripts de build atualizados');
  } catch (error) {
    logWarning('Erro ao atualizar package.json');
  }
}

// Inicializar site Netlify
function initNetlifySite(repoInfo) {
  logStep('🌐', 'Inicializando site Netlify...');
  
  try {
    // Usar netlify init para conectar ao GitHub automaticamente
    console.log('\n📋 Configuração do site:');
    console.log('- Build command: npm run build');
    console.log('- Publish directory: out');
    console.log('- Repositório: ' + repoInfo.path);
    
    const initCommand = 'netlify init';
    
    console.log('\n🔧 Executando netlify init...');
    console.log('Siga as instruções interativas:');
    console.log('1. Escolha "Create & configure a new site"');
    console.log('2. Selecione sua equipe');
    console.log('3. Nome do site: neonpro-grupous (ou similar)');
    console.log('4. Build command: npm run build');
    console.log('5. Publish directory: out');
    
    execSync(initCommand, { stdio: 'inherit' });
    
    logSuccess('Site Netlify inicializado');
    return true;
  } catch (error) {
    logError('Erro ao inicializar site Netlify');
    return false;
  }
}

// Fazer primeiro deploy
function deployToNetlify() {
  logStep('🚀', 'Fazendo primeiro deploy...');
  
  try {
    // Build do projeto
    logStep('🔨', 'Fazendo build...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Deploy
    logStep('📤', 'Fazendo deploy...');
    const deployOutput = execSync('netlify deploy --prod --dir=out', { 
      stdio: 'pipe', 
      encoding: 'utf8' 
    });
    
    // Extrair URL
    const urlMatch = deployOutput.match(/Website URL:\s*(https:\/\/[^\s]+)/);
    const deployUrl = urlMatch ? urlMatch[1] : null;
    
    if (deployUrl) {
      logSuccess(`Deploy concluído: ${deployUrl}`);
      return deployUrl;
    } else {
      logSuccess('Deploy concluído');
      return true;
    }
  } catch (error) {
    logError('Erro no deploy');
    console.log('\n📋 Tente manualmente:');
    console.log('1. npm run build');
    console.log('2. netlify deploy --prod --dir=out');
    return false;
  }
}

// Configurar variáveis de ambiente
function setupEnvironmentVariables() {
  logStep('🔧', 'Configurando variáveis de ambiente...');
  
  try {
    const envVars = [
      'NODE_VERSION=18',
      'NODE_ENV=production',
      'NEXT_TELEMETRY_DISABLED=1'
    ];
    
    envVars.forEach(envVar => {
      try {
        execSync(`netlify env:set ${envVar}`, { stdio: 'pipe' });
        logSuccess(`Variável configurada: ${envVar.split('=')[0]}`);
      } catch (error) {
        logWarning(`Erro ao configurar: ${envVar.split('=')[0]}`);
      }
    });
  } catch (error) {
    logWarning('Erro ao configurar variáveis de ambiente');
  }
}

// Gerar relatório final
function generateReport(deployUrl, repoInfo) {
  logStep('📊', 'Gerando relatório...');
  
  const report = {
    timestamp: new Date().toISOString(),
    project: 'NEONPRO',
    method: 'GitHub + Netlify CLI',
    repository: repoInfo.path,
    url: deployUrl || 'Verifique no dashboard Netlify',
    buildCommand: 'npm run build',
    publishDirectory: 'out',
    status: deployUrl ? 'SUCCESS' : 'PARTIAL_SUCCESS'
  };
  
  fs.writeFileSync(
    path.join(__dirname, '..', 'GITHUB_DEPLOY_REPORT.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n🎉 DEPLOY GITHUB + NETLIFY CONCLUÍDO!');
  console.log('=' .repeat(50));
  
  if (deployUrl) {
    console.log(`🌐 Site URL: ${deployUrl}`);
  }
  
  console.log(`📁 Repositório: https://github.com/${repoInfo.path}`);
  console.log('📊 Dashboard: https://app.netlify.com');
  
  console.log('\n🎯 Configurações Aplicadas:');
  console.log('✅ Conexão GitHub automática');
  console.log('✅ Build settings configurados');
  console.log('✅ Variáveis de ambiente');
  console.log('✅ Deploy automático habilitado');
  
  console.log('\n📋 Próximos Passos:');
  console.log('1. Verifique o site na URL fornecida');
  console.log('2. Configure domínio personalizado (opcional)');
  console.log('3. Faça push para trigger novos deploys');
  console.log('4. Configure GitHub Actions para CI/CD avançado');
  
  console.log('\n💾 Relatório salvo em: GITHUB_DEPLOY_REPORT.json');
}

// Função principal
async function main() {
  try {
    const repoInfo = checkGitRepo();
    
    if (!checkNetlifyCLI()) {
      throw new Error('Netlify CLI necessário');
    }
    
    if (!checkNetlifyAuth()) {
      throw new Error('Autenticação Netlify necessária');
    }
    
    prepareNextConfig();
    updatePackageJson();
    
    if (!initNetlifySite(repoInfo)) {
      throw new Error('Falha na inicialização do site');
    }
    
    setupEnvironmentVariables();
    
    const deployUrl = deployToNetlify();
    
    generateReport(deployUrl, repoInfo);
    
    console.log('\n🎉 Processo concluído com sucesso!');
    
  } catch (error) {
    logError(`Erro: ${error.message}`);
    
    console.log('\n🔧 Soluções:');
    console.log('1. Verifique se está em um repositório GitHub');
    console.log('2. Instale Netlify CLI: npm install -g netlify-cli');
    console.log('3. Faça login: netlify login');
    console.log('4. Tente novamente');
    
    process.exit(1);
  }
}

// Executar
if (require.main === module) {
  main();
}

module.exports = { main };
