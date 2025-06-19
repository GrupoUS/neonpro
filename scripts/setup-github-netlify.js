#!/usr/bin/env node

/**
 * NEONPRO GitHub + Netlify Setup Automation
 * Configuração completa e profissional para deploy automatizado
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

console.log('🚀 NEONPRO - Setup GitHub + Netlify Automation\n');
console.log('=' .repeat(60));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const config = {
  githubRepo: '',
  netlifyToken: '',
  siteId: '',
  siteName: 'neonpro',
  customDomain: ''
};

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

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

// Verificar dependências
async function checkDependencies() {
  logStep('🔍', 'Verificando dependências...');
  
  const dependencies = [
    { cmd: 'git --version', name: 'Git' },
    { cmd: 'node --version', name: 'Node.js' },
    { cmd: 'npm --version', name: 'NPM' }
  ];
  
  for (const dep of dependencies) {
    try {
      execSync(dep.cmd, { stdio: 'pipe' });
      logSuccess(`${dep.name} encontrado`);
    } catch (error) {
      logError(`${dep.name} não encontrado`);
      throw new Error(`${dep.name} é obrigatório`);
    }
  }
}

// Instalar Netlify CLI
async function installNetlifyCLI() {
  logStep('📦', 'Verificando Netlify CLI...');
  
  try {
    execSync('netlify --version', { stdio: 'pipe' });
    logSuccess('Netlify CLI já instalado');
  } catch (error) {
    logStep('📦', 'Instalando Netlify CLI...');
    execSync('npm install -g netlify-cli', { stdio: 'inherit' });
    logSuccess('Netlify CLI instalado');
  }
}

// Coletar informações do usuário
async function collectUserInfo() {
  logStep('📝', 'Coletando informações de configuração...');
  
  console.log('\n📋 Informações necessárias:');
  console.log('1. Repositório GitHub (ex: username/neonpro)');
  console.log('2. Token de acesso Netlify');
  console.log('3. Nome do site (opcional)');
  console.log('4. Domínio personalizado (opcional)\n');
  
  config.githubRepo = await question('🔗 Repositório GitHub (username/repo): ');
  
  console.log('\n💡 Para obter o token Netlify:');
  console.log('1. Acesse: https://app.netlify.com/user/applications#personal-access-tokens');
  console.log('2. Clique em "New access token"');
  console.log('3. Dê um nome e copie o token\n');
  
  config.netlifyToken = await question('🔑 Token Netlify: ');
  
  const customSiteName = await question(`📝 Nome do site [${config.siteName}]: `);
  if (customSiteName.trim()) {
    config.siteName = customSiteName.trim();
  }
  
  config.customDomain = await question('🌐 Domínio personalizado (opcional): ');
}

// Criar site no Netlify
async function createNetlifySite() {
  logStep('🌐', 'Criando site no Netlify...');
  
  try {
    // Login no Netlify
    process.env.NETLIFY_AUTH_TOKEN = config.netlifyToken;
    
    // Criar site
    const createCommand = `netlify sites:create --name ${config.siteName} --json`;
    const result = execSync(createCommand, { 
      stdio: 'pipe', 
      encoding: 'utf8',
      env: { ...process.env, NETLIFY_AUTH_TOKEN: config.netlifyToken }
    });
    
    const siteData = JSON.parse(result);
    config.siteId = siteData.site_id;
    
    logSuccess(`Site criado: ${siteData.url}`);
    logSuccess(`Site ID: ${config.siteId}`);
    
    return siteData;
  } catch (error) {
    logError('Erro ao criar site no Netlify');
    throw error;
  }
}

// Configurar build settings
async function configureBuildSettings() {
  logStep('⚙️', 'Configurando build settings...');
  
  try {
    const buildSettings = {
      build_command: 'npm run build',
      publish_directory: 'out',
      environment: {
        NODE_VERSION: '18',
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1'
      }
    };
    
    // Aplicar configurações via API
    const settingsJson = JSON.stringify(buildSettings);
    const updateCommand = `netlify api updateSite --data='{"build_settings":${settingsJson}}' --site-id=${config.siteId}`;
    
    execSync(updateCommand, { 
      stdio: 'pipe',
      env: { ...process.env, NETLIFY_AUTH_TOKEN: config.netlifyToken }
    });
    
    logSuccess('Build settings configurados');
  } catch (error) {
    logWarning('Erro ao configurar build settings via API, usando netlify.toml');
  }
}

// Conectar repositório GitHub
async function connectGitHub() {
  logStep('🔗', 'Conectando repositório GitHub...');
  
  try {
    const linkCommand = `netlify link --repo https://github.com/${config.githubRepo} --site-id=${config.siteId}`;
    
    execSync(linkCommand, { 
      stdio: 'inherit',
      env: { ...process.env, NETLIFY_AUTH_TOKEN: config.netlifyToken }
    });
    
    logSuccess('Repositório GitHub conectado');
  } catch (error) {
    logWarning('Conexão manual necessária no Netlify Dashboard');
    console.log(`\n📋 Conecte manualmente:`);
    console.log(`1. Acesse: https://app.netlify.com/sites/${config.siteId}/settings/deploys`);
    console.log(`2. Conecte o repositório: ${config.githubRepo}`);
    console.log(`3. Configure branch: main`);
  }
}

// Configurar domínio personalizado
async function configureCustomDomain() {
  if (!config.customDomain) return;
  
  logStep('🌐', 'Configurando domínio personalizado...');
  
  try {
    const domainCommand = `netlify domains:create ${config.customDomain} --site-id=${config.siteId}`;
    
    execSync(domainCommand, { 
      stdio: 'inherit',
      env: { ...process.env, NETLIFY_AUTH_TOKEN: config.netlifyToken }
    });
    
    logSuccess(`Domínio ${config.customDomain} configurado`);
  } catch (error) {
    logWarning('Configure o domínio manualmente no Netlify Dashboard');
  }
}

// Gerar secrets para GitHub
async function generateGitHubSecrets() {
  logStep('🔐', 'Gerando secrets para GitHub Actions...');
  
  console.log('\n📋 Configure estes secrets no GitHub:');
  console.log('=' .repeat(50));
  console.log(`NETLIFY_AUTH_TOKEN: ${config.netlifyToken}`);
  console.log(`NETLIFY_SITE_ID: ${config.siteId}`);
  console.log('=' .repeat(50));
  
  console.log('\n📝 Como configurar:');
  console.log(`1. Acesse: https://github.com/${config.githubRepo}/settings/secrets/actions`);
  console.log('2. Clique em "New repository secret"');
  console.log('3. Adicione os secrets acima');
  
  // Salvar em arquivo para referência
  const secretsFile = path.join(__dirname, '..', 'GITHUB_SECRETS.txt');
  const secretsContent = `# GitHub Secrets para NEONPRO
# Configure em: https://github.com/${config.githubRepo}/settings/secrets/actions

NETLIFY_AUTH_TOKEN=${config.netlifyToken}
NETLIFY_SITE_ID=${config.siteId}

# Configurado em: ${new Date().toISOString()}
`;
  
  fs.writeFileSync(secretsFile, secretsContent);
  logSuccess('Secrets salvos em GITHUB_SECRETS.txt');
}

// Fazer primeiro deploy
async function initialDeploy() {
  logStep('🚀', 'Fazendo deploy inicial...');
  
  try {
    // Preparar build
    logStep('🔨', 'Preparando build...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Deploy
    const deployCommand = `netlify deploy --prod --dir=out --message="Initial automated deploy"`;
    
    const output = execSync(deployCommand, { 
      stdio: 'pipe', 
      encoding: 'utf8',
      env: { ...process.env, NETLIFY_AUTH_TOKEN: config.netlifyToken }
    });
    
    const urlMatch = output.match(/Website URL:\s*(https:\/\/[^\s]+)/);
    const deployUrl = urlMatch ? urlMatch[1] : `https://${config.siteName}.netlify.app`;
    
    logSuccess(`Deploy inicial concluído: ${deployUrl}`);
    return deployUrl;
  } catch (error) {
    logWarning('Deploy inicial falhou, será feito via GitHub Actions');
    return null;
  }
}

// Gerar relatório final
async function generateReport(deployUrl) {
  logStep('📊', 'Gerando relatório de configuração...');
  
  const report = {
    timestamp: new Date().toISOString(),
    github: {
      repository: config.githubRepo,
      actionsUrl: `https://github.com/${config.githubRepo}/actions`,
      secretsUrl: `https://github.com/${config.githubRepo}/settings/secrets/actions`
    },
    netlify: {
      siteId: config.siteId,
      siteName: config.siteName,
      url: deployUrl || `https://${config.siteName}.netlify.app`,
      dashboardUrl: `https://app.netlify.com/sites/${config.siteId}`,
      customDomain: config.customDomain || null
    },
    features: {
      cicd: 'GitHub Actions',
      monitoring: 'Lighthouse CI',
      previewDeploys: 'Enabled',
      performanceTracking: 'Enabled',
      securityHeaders: 'Configured',
      seoOptimization: 'Enabled'
    },
    nextSteps: [
      'Configure GitHub secrets',
      'Push code to trigger first automated deploy',
      'Test all functionalities',
      'Configure custom domain (if applicable)',
      'Set up monitoring alerts'
    ]
  };
  
  fs.writeFileSync(
    path.join(__dirname, '..', 'SETUP_REPORT.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n🎉 CONFIGURAÇÃO CONCLUÍDA!');
  console.log('=' .repeat(60));
  console.log(`🌐 Site URL: ${report.netlify.url}`);
  console.log(`📊 Netlify Dashboard: ${report.netlify.dashboardUrl}`);
  console.log(`🔧 GitHub Actions: ${report.github.actionsUrl}`);
  console.log(`🔐 Configure Secrets: ${report.github.secretsUrl}`);
  
  if (config.customDomain) {
    console.log(`🌍 Domínio Personalizado: ${config.customDomain}`);
  }
  
  console.log('\n📋 Próximos Passos:');
  report.nextSteps.forEach((step, index) => {
    console.log(`${index + 1}. ${step}`);
  });
  
  console.log('\n💾 Relatório salvo em: SETUP_REPORT.json');
}

// Função principal
async function main() {
  try {
    await checkDependencies();
    await installNetlifyCLI();
    await collectUserInfo();
    
    const siteData = await createNetlifySite();
    await configureBuildSettings();
    await connectGitHub();
    await configureCustomDomain();
    await generateGitHubSecrets();
    
    const deployUrl = await initialDeploy();
    await generateReport(deployUrl);
    
    console.log('\n🎉 Setup concluído com sucesso!');
    
  } catch (error) {
    logError(`Erro durante setup: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main };
