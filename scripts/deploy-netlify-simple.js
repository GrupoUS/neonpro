#!/usr/bin/env node

/**
 * NEONPRO Netlify Simple Deploy
 * Deploy direto via drag-and-drop automatizado
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 NEONPRO - Deploy Simples Netlify\n');

const projectDir = path.join(__dirname, '..');
const deployDir = path.join(projectDir, 'netlify-deploy');

try {
  // Verificar se os arquivos estão prontos
  console.log('🔍 Verificando arquivos de deploy...');
  
  const requiredFiles = ['index.html', 'netlify.toml', '_redirects', 'manifest.json'];
  const missingFiles = requiredFiles.filter(file => 
    !fs.existsSync(path.join(deployDir, file))
  );
  
  if (missingFiles.length > 0) {
    console.log('📁 Preparando arquivos...');
    execSync('node scripts/deploy-netlify.js', { 
      stdio: 'inherit', 
      cwd: projectDir 
    });
  } else {
    console.log('✅ Arquivos de deploy encontrados');
  }
  
  // Abrir Netlify Drop
  console.log('\n🌐 Abrindo Netlify Drop...');
  
  // Tentar abrir no navegador
  const { spawn } = require('child_process');
  const isWindows = process.platform === 'win32';
  const isMac = process.platform === 'darwin';
  
  if (isWindows) {
    spawn('cmd', ['/c', 'start', 'https://app.netlify.com/drop'], { detached: true });
  } else if (isMac) {
    spawn('open', ['https://app.netlify.com/drop'], { detached: true });
  } else {
    spawn('xdg-open', ['https://app.netlify.com/drop'], { detached: true });
  }
  
  console.log('✅ Netlify Drop aberto no navegador');
  
  // Instruções detalhadas
  console.log('\n📋 INSTRUÇÕES DE DEPLOY:');
  console.log('=' .repeat(50));
  console.log('1. 🌐 Uma aba do navegador foi aberta com Netlify Drop');
  console.log('2. 📁 Arraste a pasta abaixo para a área de upload:');
  console.log(`   📂 ${deployDir}`);
  console.log('3. ⏳ Aguarde o upload (30-60 segundos)');
  console.log('4. 🎯 Copie a URL fornecida pelo Netlify');
  console.log('5. ✅ Teste o site na URL fornecida');
  
  console.log('\n🎯 FUNCIONALIDADES PARA TESTAR:');
  console.log('✅ Design System GRUPO US');
  console.log('✅ Toggle Sign In/Sign Up');
  console.log('✅ Responsividade (redimensione a janela)');
  console.log('✅ Navegação por teclado (Tab, Enter, Espaço)');
  console.log('✅ Performance (deve carregar rapidamente)');
  
  console.log('\n🔧 CONFIGURAÇÕES APLICADAS:');
  console.log('✅ Headers de segurança');
  console.log('✅ Redirects otimizados');
  console.log('✅ Cache configurado');
  console.log('✅ SEO otimizado');
  console.log('✅ PWA ready');
  
  console.log('\n📱 TESTE EM DISPOSITIVOS:');
  console.log('• Desktop: Redimensione a janela');
  console.log('• Tablet: Use DevTools (F12 > Device Mode)');
  console.log('• Mobile: Acesse pelo celular');
  
  console.log('\n🎉 APÓS O DEPLOY:');
  console.log('1. 📝 Anote a URL fornecida');
  console.log('2. 🧪 Teste todas as funcionalidades');
  console.log('3. 📊 Verifique performance no PageSpeed Insights');
  console.log('4. 🔗 Configure domínio personalizado (opcional)');
  
  // Abrir pasta no explorador
  console.log('\n📂 Abrindo pasta de deploy...');
  if (isWindows) {
    spawn('explorer', [deployDir], { detached: true });
  } else if (isMac) {
    spawn('open', [deployDir], { detached: true });
  } else {
    spawn('xdg-open', [deployDir], { detached: true });
  }
  
  console.log('✅ Pasta de deploy aberta no explorador');
  
  // Informações adicionais
  console.log('\n💡 DICAS:');
  console.log('• Se o drag-and-drop não funcionar, use: netlify deploy --dir="' + deployDir + '"');
  console.log('• Para updates futuros, execute novamente este script');
  console.log('• Para deploy via Git, conecte seu repositório no Netlify Dashboard');
  
  console.log('\n📞 SUPORTE:');
  console.log('• Netlify Docs: https://docs.netlify.com');
  console.log('• Community: https://community.netlify.com');
  console.log('• Status: https://netlifystatus.com');
  
  console.log('\n🎯 PRONTO PARA DEPLOY!');
  console.log('Arraste a pasta netlify-deploy para o Netlify Drop');
  
} catch (error) {
  console.error('\n❌ Erro:', error.message);
  console.log('\n🔧 Soluções:');
  console.log('1. Execute: node scripts/deploy-netlify.js');
  console.log('2. Acesse manualmente: https://app.netlify.com/drop');
  console.log('3. Arraste a pasta netlify-deploy');
}
