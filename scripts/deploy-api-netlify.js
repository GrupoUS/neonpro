#!/usr/bin/env node

/**
 * NEONPRO Direct API Deploy to Netlify
 * Deploy direto via API Netlify sem dependências externas
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 NEONPRO - Deploy Direto via API Netlify\n');

// Configurações
const config = {
  siteName: 'neonpro',
  netlifyToken: process.env.NETLIFY_AUTH_TOKEN || '',
  buildDir: path.join(__dirname, '..', 'out'),
  deployDir: path.join(__dirname, '..', 'netlify-deploy')
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

// Fazer requisição HTTPS
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
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

// Obter token de acesso
async function getAccessToken() {
  if (config.netlifyToken) {
    logSuccess('Token encontrado nas variáveis de ambiente');
    return config.netlifyToken;
  }
  
  logError('Token Netlify não encontrado');
  console.log('\n📋 Para obter o token:');
  console.log('1. Acesse: https://app.netlify.com/user/applications#personal-access-tokens');
  console.log('2. Clique em "New access token"');
  console.log('3. Defina NETLIFY_AUTH_TOKEN como variável de ambiente');
  console.log('4. Execute: set NETLIFY_AUTH_TOKEN=seu_token (Windows)');
  console.log('   ou: export NETLIFY_AUTH_TOKEN=seu_token (Linux/Mac)');
  
  throw new Error('Token de acesso necessário');
}

// Criar site no Netlify
async function createSite(token) {
  logStep('🌐', 'Criando site no Netlify...');
  
  const options = {
    hostname: 'api.netlify.com',
    port: 443,
    path: '/api/v1/sites',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  
  const siteData = {
    name: config.siteName,
    build_settings: {
      cmd: 'npm run build',
      dir: 'out',
      env: {
        NODE_VERSION: '18',
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1'
      }
    }
  };
  
  try {
    const response = await makeRequest(options, siteData);
    
    if (response.status === 201) {
      logSuccess(`Site criado: ${response.data.url}`);
      return response.data;
    } else {
      throw new Error(`Erro ao criar site: ${response.status}`);
    }
  } catch (error) {
    logError(`Erro na criação do site: ${error.message}`);
    throw error;
  }
}

// Preparar arquivos para deploy
async function prepareFiles() {
  logStep('📁', 'Preparando arquivos para deploy...');
  
  try {
    // Limpar diretório de deploy
    if (fs.existsSync(config.deployDir)) {
      fs.rmSync(config.deployDir, { recursive: true, force: true });
    }
    fs.mkdirSync(config.deployDir, { recursive: true });
    
    // Fazer build se necessário
    if (!fs.existsSync(config.buildDir)) {
      logStep('🔨', 'Fazendo build do projeto...');
      execSync('npm run build', { stdio: 'inherit' });
    }
    
    // Copiar arquivos de build
    if (fs.existsSync(config.buildDir)) {
      execSync(`xcopy "${config.buildDir}" "${config.deployDir}" /E /I /Y`, { stdio: 'pipe' });
      logSuccess('Arquivos de build copiados');
    }
    
    // Copiar arquivos de configuração
    const configFiles = ['netlify.toml', '_redirects'];
    configFiles.forEach(file => {
      const source = path.join(__dirname, '..', file);
      const target = path.join(config.deployDir, file);
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
      theme_color: '#112031'
    };
    
    fs.writeFileSync(
      path.join(config.deployDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    logSuccess('Arquivos preparados para deploy');
    return true;
  } catch (error) {
    logError(`Erro ao preparar arquivos: ${error.message}`);
    return false;
  }
}

// Fazer deploy via API
async function deployToNetlify(token, siteId) {
  logStep('🚀', 'Fazendo deploy via API...');
  
  try {
    // Criar arquivo ZIP dos arquivos
    const archiver = require('archiver');
    const zipPath = path.join(__dirname, '..', 'deploy.zip');
    
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.pipe(output);
    archive.directory(config.deployDir, false);
    await archive.finalize();
    
    logSuccess('Arquivo ZIP criado');
    
    // Upload via API
    const zipData = fs.readFileSync(zipPath);
    
    const options = {
      hostname: 'api.netlify.com',
      port: 443,
      path: `/api/v1/sites/${siteId}/deploys`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/zip',
        'Content-Length': zipData.length
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (res.statusCode === 200 || res.statusCode === 201) {
            logSuccess(`Deploy concluído: ${result.url}`);
            
            // Limpar arquivo temporário
            fs.unlinkSync(zipPath);
            
            return result;
          } else {
            throw new Error(`Deploy falhou: ${res.statusCode}`);
          }
        } catch (error) {
          logError(`Erro no deploy: ${error.message}`);
        }
      });
    });
    
    req.on('error', (error) => {
      logError(`Erro na requisição: ${error.message}`);
    });
    
    req.write(zipData);
    req.end();
    
  } catch (error) {
    logError(`Erro no deploy: ${error.message}`);
    
    // Fallback: instruções manuais
    console.log('\n📋 Deploy Manual Alternativo:');
    console.log('1. Instale Netlify CLI: npm install -g netlify-cli');
    console.log('2. Faça login: netlify login');
    console.log(`3. Deploy: netlify deploy --dir="${config.deployDir}" --prod`);
  }
}

// Função principal
async function main() {
  try {
    const token = await getAccessToken();
    
    if (!await prepareFiles()) {
      throw new Error('Falha na preparação dos arquivos');
    }
    
    // Tentar usar site existente ou criar novo
    let siteData;
    try {
      // Verificar se site já existe
      const listOptions = {
        hostname: 'api.netlify.com',
        port: 443,
        path: '/api/v1/sites',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const sitesResponse = await makeRequest(listOptions);
      const existingSite = sitesResponse.data.find(site => 
        site.name === config.siteName
      );
      
      if (existingSite) {
        logSuccess(`Site existente encontrado: ${existingSite.url}`);
        siteData = existingSite;
      } else {
        siteData = await createSite(token);
      }
    } catch (error) {
      siteData = await createSite(token);
    }
    
    await deployToNetlify(token, siteData.id);
    
    console.log('\n🎉 Deploy API concluído!');
    console.log(`🌐 URL: ${siteData.url}`);
    console.log(`📊 Dashboard: https://app.netlify.com/sites/${siteData.id}`);
    
  } catch (error) {
    logError(`Erro geral: ${error.message}`);
    
    console.log('\n🔄 Alternativas:');
    console.log('1. Use o script de setup: npm run deploy:netlify');
    console.log('2. Deploy manual: netlify deploy --dir=netlify-deploy --prod');
    console.log('3. Configure GitHub Actions para deploy automático');
    
    process.exit(1);
  }
}

// Verificar se archiver está disponível
try {
  require('archiver');
} catch (error) {
  console.log('📦 Instalando dependência archiver...');
  execSync('npm install archiver', { stdio: 'inherit' });
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main };
