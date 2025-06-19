#!/usr/bin/env node

/**
 * NEONPRO GitHub + Netlify Integration Setup
 * Configuração automatizada via API para repositório GitHub existente
 */

const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 NEONPRO - Setup GitHub + Netlify Integration\n');
console.log('=' .repeat(60));

// Configurações
const config = {
  siteName: 'neonpro-grupous',
  repoUrl: '', // Será detectado automaticamente
  netlifyToken: process.env.NETLIFY_AUTH_TOKEN || '',
  buildCommand: 'npm run build',
  publishDir: 'out',
  nodeVersion: '18'
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

// Detectar repositório GitHub
function detectGitHubRepo() {
  logStep('🔍', 'Detectando repositório GitHub...');
  
  try {
    const remoteUrl = execSync('git remote get-url origin', { 
      stdio: 'pipe', 
      encoding: 'utf8' 
    }).trim();
    
    // Extrair owner/repo do URL
    let repoPath = '';
    if (remoteUrl.includes('github.com')) {
      const match = remoteUrl.match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/);
      if (match) {
        repoPath = match[1];
        config.repoUrl = `https://github.com/${repoPath}`;
        logSuccess(`Repositório detectado: ${repoPath}`);
        return repoPath;
      }
    }
    
    throw new Error('URL do repositório GitHub não encontrado');
  } catch (error) {
    logError('Erro ao detectar repositório GitHub');
    console.log('\n📋 Soluções:');
    console.log('1. Verifique se está em um repositório Git');
    console.log('2. Verifique se o remote origin está configurado');
    console.log('3. Execute: git remote -v');
    throw error;
  }
}

// Obter token Netlify
function getNetlifyToken() {
  if (config.netlifyToken) {
    logSuccess('Token Netlify encontrado');
    return config.netlifyToken;
  }
  
  logError('Token Netlify não encontrado');
  console.log('\n📋 Para obter o token:');
  console.log('1. Acesse: https://app.netlify.com/user/applications#personal-access-tokens');
  console.log('2. Clique em "New access token"');
  console.log('3. Dê um nome: "NEONPRO GitHub Integration"');
  console.log('4. Copie o token');
  console.log('5. Execute: set NETLIFY_AUTH_TOKEN=seu_token (Windows)');
  console.log('   ou: export NETLIFY_AUTH_TOKEN=seu_token (Linux/Mac)');
  console.log('6. Execute novamente este script');
  
  throw new Error('Token Netlify necessário');
}

// Fazer requisição para API Netlify
function makeNetlifyRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.netlify.com',
      port: 443,
      path: `/api/v1${path}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${config.netlifyToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Criar site no Netlify conectado ao GitHub
async function createNetlifySiteWithGitHub(repoPath) {
  logStep('🌐', 'Criando site no Netlify conectado ao GitHub...');
  
  const siteData = {
    name: config.siteName,
    repo: {
      provider: 'github',
      repo: repoPath,
      branch: 'main',
      cmd: config.buildCommand,
      dir: config.publishDir,
      env: {
        NODE_VERSION: config.nodeVersion,
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1'
      }
    },
    build_settings: {
      cmd: config.buildCommand,
      dir: config.publishDir,
      env: {
        NODE_VERSION: config.nodeVersion,
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1'
      }
    }
  };
  
  try {
    const response = await makeNetlifyRequest('/sites', 'POST', siteData);
    
    if (response.status === 201) {
      logSuccess(`Site criado: ${response.data.url}`);
      return response.data;
    } else if (response.status === 422) {
      logWarning('Site pode já existir ou erro de validação');
      console.log('Resposta:', response.data);
      
      // Tentar criar sem conexão GitHub primeiro
      const simpleSiteData = {
        name: config.siteName
      };
      
      const simpleResponse = await makeNetlifyRequest('/sites', 'POST', simpleSiteData);
      if (simpleResponse.status === 201) {
        logSuccess(`Site básico criado: ${simpleResponse.data.url}`);
        return simpleResponse.data;
      }
    }
    
    throw new Error(`Erro ao criar site: ${response.status} - ${JSON.stringify(response.data)}`);
  } catch (error) {
    logError(`Erro na criação do site: ${error.message}`);
    throw error;
  }
}

// Configurar build settings
async function configureBuildSettings(siteId, repoPath) {
  logStep('⚙️', 'Configurando build settings...');
  
  const buildSettings = {
    build_settings: {
      cmd: config.buildCommand,
      dir: config.publishDir,
      env: {
        NODE_VERSION: config.nodeVersion,
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1'
      }
    },
    repo: {
      provider: 'github',
      repo: repoPath,
      branch: 'main'
    }
  };
  
  try {
    const response = await makeNetlifyRequest(`/sites/${siteId}`, 'PATCH', buildSettings);
    
    if (response.status === 200) {
      logSuccess('Build settings configurados');
      return response.data;
    } else {
      logWarning('Erro ao configurar build settings via API');
      console.log('Resposta:', response.data);
    }
  } catch (error) {
    logWarning(`Erro ao configurar build settings: ${error.message}`);
  }
}

// Gerar instruções para conexão manual
function generateManualInstructions(siteData, repoPath) {
  logStep('📋', 'Gerando instruções para conexão manual...');
  
  const instructions = `
# 🔗 Instruções para Conexão Manual GitHub + Netlify

## Site Criado
- **Nome**: ${config.siteName}
- **URL**: ${siteData.url}
- **Site ID**: ${siteData.id}
- **Dashboard**: https://app.netlify.com/sites/${siteData.id}

## Conectar Repositório GitHub

### Opção 1: Via Dashboard Netlify
1. Acesse: https://app.netlify.com/sites/${siteData.id}/settings/deploys
2. Clique em "Link site to Git"
3. Escolha "GitHub"
4. Selecione o repositório: ${repoPath}
5. Configure:
   - **Branch**: main
   - **Build command**: ${config.buildCommand}
   - **Publish directory**: ${config.publishDir}

### Opção 2: Via Netlify CLI
\`\`\`bash
netlify link --id ${siteData.id}
netlify env:set NODE_VERSION ${config.nodeVersion}
netlify env:set NODE_ENV production
netlify env:set NEXT_TELEMETRY_DISABLED 1
\`\`\`

## Build Settings
- **Build Command**: ${config.buildCommand}
- **Publish Directory**: ${config.publishDir}
- **Node Version**: ${config.nodeVersion}

## Environment Variables
\`\`\`
NODE_VERSION=${config.nodeVersion}
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
\`\`\`

## GitHub Actions Secrets
Configure estes secrets no GitHub:
- **NETLIFY_AUTH_TOKEN**: ${config.netlifyToken.substring(0, 8)}...
- **NETLIFY_SITE_ID**: ${siteData.id}

URL: https://github.com/${repoPath}/settings/secrets/actions

## Próximos Passos
1. Conecte o repositório (Opção 1 ou 2)
2. Faça um push para trigger o primeiro deploy
3. Configure domínio personalizado (opcional)
4. Configure GitHub Actions para CI/CD

## URLs Importantes
- **Site**: ${siteData.url}
- **Dashboard**: https://app.netlify.com/sites/${siteData.id}
- **Deploy Settings**: https://app.netlify.com/sites/${siteData.id}/settings/deploys
- **Environment Variables**: https://app.netlify.com/sites/${siteData.id}/settings/env
`;
  
  fs.writeFileSync(
    path.join(__dirname, '..', 'GITHUB_NETLIFY_SETUP.md'),
    instructions
  );
  
  logSuccess('Instruções salvas em GITHUB_NETLIFY_SETUP.md');
  
  return instructions;
}

// Abrir URLs importantes
function openImportantUrls(siteData) {
  logStep('🌐', 'Abrindo URLs importantes...');
  
  try {
    const { spawn } = require('child_process');
    const isWindows = process.platform === 'win32';
    
    const urls = [
      `https://app.netlify.com/sites/${siteData.id}/settings/deploys`,
      siteData.url
    ];
    
    if (isWindows) {
      urls.forEach(url => {
        spawn('cmd', ['/c', 'start', url], { detached: true });
      });
    }
    
    logSuccess('URLs abertas no navegador');
  } catch (error) {
    logWarning('Abra manualmente as URLs fornecidas');
  }
}

// Função principal
async function main() {
  try {
    const repoPath = detectGitHubRepo();
    const token = getNetlifyToken();
    
    config.netlifyToken = token;
    
    const siteData = await createNetlifySiteWithGitHub(repoPath);
    
    await configureBuildSettings(siteData.id, repoPath);
    
    generateManualInstructions(siteData, repoPath);
    
    openImportantUrls(siteData);
    
    console.log('\n🎉 SETUP GITHUB + NETLIFY CONCLUÍDO!');
    console.log('=' .repeat(60));
    console.log(`🌐 Site URL: ${siteData.url}`);
    console.log(`📊 Dashboard: https://app.netlify.com/sites/${siteData.id}`);
    console.log(`🔗 Deploy Settings: https://app.netlify.com/sites/${siteData.id}/settings/deploys`);
    console.log(`📁 Repositório: ${config.repoUrl}`);
    
    console.log('\n📋 Próximos Passos:');
    console.log('1. Conecte o repositório GitHub no dashboard Netlify');
    console.log('2. Configure as build settings se necessário');
    console.log('3. Faça um push para trigger o primeiro deploy');
    console.log('4. Configure GitHub Actions secrets para CI/CD');
    
    console.log('\n💾 Instruções detalhadas salvas em: GITHUB_NETLIFY_SETUP.md');
    
  } catch (error) {
    logError(`Erro: ${error.message}`);
    
    console.log('\n🔧 Soluções alternativas:');
    console.log('1. Configure manualmente no Netlify Dashboard');
    console.log('2. Use Netlify CLI: netlify init');
    console.log('3. Verifique token e permissões');
    
    process.exit(1);
  }
}

// Executar
if (require.main === module) {
  main();
}

module.exports = { main };
