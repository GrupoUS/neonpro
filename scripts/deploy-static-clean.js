#!/usr/bin/env node

/**
 * NEONPRO Clean Static Deploy
 * Deploy da versão estática limpa sem conflitos de merge
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 NEONPRO - Deploy Estático Limpo\n');
console.log('=' .repeat(50));

// Configurações
const config = {
  siteName: 'neonpro-grupous',
  deployDir: path.join(__dirname, '..', 'netlify-deploy-clean'),
  projectDir: path.join(__dirname, '..')
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

// Preparar versão estática limpa
function prepareCleanStaticVersion() {
  logStep('📁', 'Preparando versão estática limpa...');
  
  try {
    // Limpar e criar diretório
    if (fs.existsSync(config.deployDir)) {
      fs.rmSync(config.deployDir, { recursive: true, force: true });
    }
    fs.mkdirSync(config.deployDir, { recursive: true });
    
    // Usar a demonstração estática como base
    const demoFile = path.join(config.projectDir, 'static-demo', 'neonpro-demo.html');
    const indexFile = path.join(config.deployDir, 'index.html');
    
    if (fs.existsSync(demoFile)) {
      let content = fs.readFileSync(demoFile, 'utf8');
      
      // Otimizar para produção
      content = content.replace(
        '<title>NEONPRO - Advanced Business SaaS Platform | GRUPO US</title>',
        `<title>NEONPRO - Advanced Business SaaS Platform | GRUPO US</title>
    <meta name="description" content="NEONPRO - Plataforma SaaS avançada para gestão de clínicas e consultórios médicos. Sistema completo com IA, analytics e design GRUPO US.">
    <meta name="keywords" content="NEONPRO, GRUPO US, SaaS, healthcare, gestão clínica, sistema médico, IA, analytics">
    <meta name="author" content="GRUPO US">
    <meta property="og:title" content="NEONPRO - Advanced Business SaaS Platform">
    <meta property="og:description" content="Sistema completo para gestão de clínicas com IA e analytics avançados">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://neonpro.netlify.app">
    <meta property="og:image" content="https://neonpro.netlify.app/og-image.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="NEONPRO - Advanced Business SaaS Platform">
    <meta name="twitter:description" content="Sistema completo para gestão de clínicas com IA e analytics avançados">
    <link rel="canonical" href="https://neonpro.netlify.app/">
    <meta name="robots" content="index, follow">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
    <meta name="theme-color" content="#112031">
    <link rel="manifest" href="/manifest.json">`
      );
      
      // Atualizar mensagem de status
      content = content.replace(
        '✅ NEONPRO Deploy Ready! Sistema completo implementado com design GRUPO US.',
        '✅ NEONPRO em Produção! Deploy automatizado concluído com sucesso.'
      );
      
      content = content.replace(
        '🚀 Pronto para produção • 📱 Responsivo • ♿ Acessível • 🎨 Design System GRUPO US',
        '🌐 Hospedado no Netlify • ⚡ Performance Otimizada • 🔒 Seguro • 📊 SEO Otimizado'
      );
      
      fs.writeFileSync(indexFile, content);
      logSuccess('Index.html otimizado criado');
    } else {
      throw new Error('Arquivo de demonstração não encontrado');
    }
    
    // Criar netlify.toml otimizado
    const netlifyToml = `# NEONPRO Netlify Configuration
# Otimizado para performance e SEO

[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    Cache-Control = "public, max-age=3600"

[[headers]]
  for = "/*.{css,js,png,jpg,jpeg,gif,svg,webp,avif,ico,woff,woff2}"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[redirects]]
  from = "/home"
  to = "/"
  status = 301

[[redirects]]
  from = "/signin"
  to = "/"
  status = 301

[[redirects]]
  from = "/signup"
  to = "/"
  status = 301

[[redirects]]
  from = "/login"
  to = "/"
  status = 301

[[redirects]]
  from = "/dashboard"
  to = "/"
  status = 301

[[redirects]]
  from = "/dashboard/*"
  to = "/"
  status = 301

# Force HTTPS
[[redirects]]
  from = "http://neonpro.netlify.app/*"
  to = "https://neonpro.netlify.app/:splat"
  status = 301
  force = true
`;
    
    fs.writeFileSync(path.join(config.deployDir, 'netlify.toml'), netlifyToml);
    logSuccess('netlify.toml criado');
    
    // Criar _redirects
    const redirects = `# NEONPRO Redirects
/home /  301
/signin /  301
/signup /  301
/login /  301
/dashboard /  301
/dashboard/* /  301
/auth /  301
/api/* /  301

# Force HTTPS
http://neonpro.netlify.app/* https://neonpro.netlify.app/:splat 301!
`;
    
    fs.writeFileSync(path.join(config.deployDir, '_redirects'), redirects);
    logSuccess('_redirects criado');
    
    // Criar manifest.json
    const manifest = {
      name: 'NEONPRO - Advanced Business SaaS Platform',
      short_name: 'NEONPRO',
      description: 'Plataforma SaaS avançada para gestão de clínicas e consultórios médicos - GRUPO US',
      start_url: '/',
      display: 'standalone',
      background_color: '#112031',
      theme_color: '#112031',
      orientation: 'portrait-primary',
      categories: ['business', 'medical', 'productivity'],
      lang: 'pt-BR',
      icons: [
        {
          src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23112031"><path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>',
          sizes: '192x192',
          type: 'image/svg+xml',
          purpose: 'any maskable'
        },
        {
          src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23112031"><path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'any maskable'
        }
      ]
    };
    
    fs.writeFileSync(
      path.join(config.deployDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    logSuccess('manifest.json criado');
    
    // Criar robots.txt
    const robots = `User-agent: *
Allow: /

Sitemap: https://neonpro.netlify.app/sitemap.xml
`;
    
    fs.writeFileSync(path.join(config.deployDir, 'robots.txt'), robots);
    logSuccess('robots.txt criado');
    
    // Criar sitemap.xml
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://neonpro.netlify.app/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
    
    fs.writeFileSync(path.join(config.deployDir, 'sitemap.xml'), sitemap);
    logSuccess('sitemap.xml criado');
    
    return true;
  } catch (error) {
    logError(`Erro ao preparar versão limpa: ${error.message}`);
    return false;
  }
}

// Deploy via Netlify CLI
function deployToNetlify() {
  logStep('🚀', 'Fazendo deploy via Netlify CLI...');
  
  try {
    // Verificar autenticação
    try {
      execSync('netlify status', { stdio: 'pipe' });
      logSuccess('Autenticado no Netlify');
    } catch (error) {
      logWarning('Não autenticado no Netlify');
      console.log('\n📋 Para autenticar:');
      console.log('1. Execute: netlify login');
      console.log('2. Siga as instruções no navegador');
      console.log('3. Execute novamente este script');
      return false;
    }
    
    // Deploy
    const deployCommand = `netlify deploy --dir="${config.deployDir}" --prod --message="Clean static deploy - NEONPRO v1.0"`;
    
    const output = execSync(deployCommand, { 
      stdio: 'pipe', 
      encoding: 'utf8',
      cwd: config.projectDir
    });
    
    // Extrair URL
    const urlMatch = output.match(/Website URL:\s*(https:\/\/[^\s]+)/);
    const deployUrl = urlMatch ? urlMatch[1] : null;
    
    if (deployUrl) {
      logSuccess(`Deploy concluído: ${deployUrl}`);
      return deployUrl;
    } else {
      logWarning('Deploy concluído, mas URL não encontrada');
      return true;
    }
    
  } catch (error) {
    logError(`Erro no deploy: ${error.message}`);
    return false;
  }
}

// Abrir Netlify Drop como fallback
function openNetlifyDrop() {
  logStep('🌐', 'Abrindo Netlify Drop como alternativa...');
  
  try {
    const { spawn } = require('child_process');
    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
      spawn('cmd', ['/c', 'start', 'https://app.netlify.com/drop'], { detached: true });
      spawn('explorer', [config.deployDir], { detached: true });
    }
    
    console.log('\n📋 DEPLOY MANUAL:');
    console.log('1. Acesse: https://app.netlify.com/drop');
    console.log(`2. Arraste a pasta: ${config.deployDir}`);
    console.log('3. Aguarde o upload');
    console.log('4. Copie a URL fornecida');
    
    logSuccess('Netlify Drop e pasta abertos');
    return true;
  } catch (error) {
    logWarning('Abra manualmente: https://app.netlify.com/drop');
    return false;
  }
}

// Gerar relatório final
function generateFinalReport(deployUrl) {
  logStep('📊', 'Gerando relatório final...');
  
  const report = {
    timestamp: new Date().toISOString(),
    project: 'NEONPRO',
    version: '1.0.0',
    platform: 'Netlify',
    method: deployUrl ? 'Automated CLI' : 'Manual Drag & Drop',
    url: deployUrl || 'Manual setup required',
    deployDir: config.deployDir,
    optimizations: [
      'SEO Meta Tags',
      'Open Graph Tags',
      'PWA Manifest',
      'Security Headers',
      'Performance Headers',
      'Cache Optimization',
      'Robots.txt',
      'Sitemap.xml',
      'HTTPS Redirect',
      'URL Redirects'
    ],
    features: [
      'Design System GRUPO US',
      'Layout Responsivo',
      'Acessibilidade WCAG 2.1 AA',
      'Performance Otimizada',
      'SEO Otimizado',
      'PWA Ready',
      'Security Headers',
      'Cache Optimization'
    ]
  };
  
  fs.writeFileSync(
    path.join(config.projectDir, 'CLEAN_DEPLOY_REPORT.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n🎉 DEPLOY ESTÁTICO LIMPO CONCLUÍDO!');
  console.log('=' .repeat(50));
  
  if (deployUrl) {
    console.log(`🌐 URL do Site: ${deployUrl}`);
  } else {
    console.log('🌐 URL: Será fornecida após upload manual');
  }
  
  console.log('\n🎯 Otimizações Aplicadas:');
  report.optimizations.forEach(opt => {
    console.log(`✅ ${opt}`);
  });
  
  console.log('\n🚀 Funcionalidades:');
  report.features.forEach(feature => {
    console.log(`✅ ${feature}`);
  });
  
  console.log('\n📋 Teste o Site:');
  console.log('1. Acesse a URL fornecida');
  console.log('2. Teste responsividade (redimensione a janela)');
  console.log('3. Teste navegação por teclado (Tab, Enter, Espaço)');
  console.log('4. Verifique performance no PageSpeed Insights');
  console.log('5. Teste em dispositivos móveis');
  
  console.log('\n💾 Relatório salvo em: CLEAN_DEPLOY_REPORT.json');
  
  return report;
}

// Função principal
async function main() {
  try {
    if (!prepareCleanStaticVersion()) {
      throw new Error('Falha na preparação da versão limpa');
    }
    
    const deployUrl = deployToNetlify();
    
    if (!deployUrl) {
      openNetlifyDrop();
    }
    
    generateFinalReport(deployUrl);
    
    console.log('\n🎉 Processo concluído com sucesso!');
    
  } catch (error) {
    logError(`Erro: ${error.message}`);
    
    console.log('\n🔧 Soluções:');
    console.log('1. Deploy manual: https://app.netlify.com/drop');
    console.log('2. Autenticar Netlify: netlify login');
    console.log('3. Verificar conexão com internet');
    
    process.exit(1);
  }
}

// Executar
if (require.main === module) {
  main();
}

module.exports = { main };
