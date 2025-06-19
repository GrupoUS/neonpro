#!/usr/bin/env node

/**
 * NEONPRO Development Server Starter
 * Inicia o servidor de desenvolvimento com verificações de saúde
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando NEONPRO Development Server...\n');

// Verificar se as dependências estão instaladas
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Instalando dependências...');
  const install = spawn('npm', ['install'], { 
    stdio: 'inherit',
    shell: true,
    cwd: path.join(__dirname, '..')
  });
  
  install.on('close', (code) => {
    if (code === 0) {
      startDevServer();
    } else {
      console.error('❌ Erro ao instalar dependências');
      process.exit(1);
    }
  });
} else {
  startDevServer();
}

function startDevServer() {
  console.log('🔧 Verificando configuração...');
  
  // Verificar arquivo .env.local
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.log('⚠️  Arquivo .env.local não encontrado');
  } else {
    console.log('✅ Configuração de ambiente encontrada');
  }
  
  console.log('\n🌟 Iniciando servidor Next.js...');
  console.log('📍 URL: http://localhost:3000');
  console.log('🔐 Login: http://localhost:3000/login');
  console.log('📊 Dashboard: http://localhost:3000/dashboard');
  console.log('\n' + '='.repeat(50));
  
  // Iniciar servidor de desenvolvimento
  const devServer = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: path.join(__dirname, '..')
  });
  
  devServer.on('error', (error) => {
    console.error('❌ Erro ao iniciar servidor:', error.message);
  });
  
  devServer.on('close', (code) => {
    console.log(`\n🛑 Servidor encerrado com código: ${code}`);
  });
  
  // Capturar Ctrl+C para encerrar graciosamente
  process.on('SIGINT', () => {
    console.log('\n🛑 Encerrando servidor...');
    devServer.kill('SIGINT');
    process.exit(0);
  });
}
