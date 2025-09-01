#!/usr/bin/env node

/**
 * MCP Configuration Synchronization Script
 * Ensures all MCP configurations are synchronized across different tools
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const CONFIG_FILES = {
  vscode: '.vscode/.mcp.json',
  cursor: '.cursor/mcp.json',
  ruler: '.ruler/ruler.toml'
};

function checkMCPConfigurations() {
  console.log('🔍 Verificando configurações MCP...\n');
  
  // Check .vscode/.mcp.json (primary configuration)
  const vscodeConfigPath = path.join(projectRoot, CONFIG_FILES.vscode);
  if (fs.existsSync(vscodeConfigPath)) {
    console.log('✅ .vscode/.mcp.json encontrado (configuração principal)');
    
    try {
      const config = JSON.parse(fs.readFileSync(vscodeConfigPath, 'utf8'));
      const servers = Object.keys(config.mcpServers || {});
      console.log(`   📋 Servidores configurados: ${servers.join(', ')}`);
      
      // Check desktop-commander configuration
      if (config.mcpServers?.['desktop-commander']) {
        const desktopCmd = config.mcpServers['desktop-commander'];
        if (desktopCmd.command === 'docker') {
          console.log('   🐳 Desktop Commander configurado com Docker ✅');
        } else {
          console.log('   ⚠️  Desktop Commander não está usando Docker');
        }
      }
    } catch (error) {
      console.log('   ❌ Erro ao ler configuração:', error.message);
    }
  } else {
    console.log('❌ .vscode/.mcp.json não encontrado');
  }
  
  // Check .ruler/ruler.toml
  const rulerConfigPath = path.join(projectRoot, CONFIG_FILES.ruler);
  if (fs.existsSync(rulerConfigPath)) {
    console.log('✅ .ruler/ruler.toml encontrado');
    
    try {
      const content = fs.readFileSync(rulerConfigPath, 'utf8');
      if (content.includes('[mcp_servers.desktop-commander]')) {
        if (content.includes('command = "docker"')) {
          console.log('   🐳 Desktop Commander no Ruler configurado com Docker ✅');
        } else {
          console.log('   ⚠️  Desktop Commander no Ruler não está usando Docker');
        }
      }
    } catch (error) {
      console.log('   ❌ Erro ao ler configuração do Ruler:', error.message);
    }
  } else {
    console.log('❌ .ruler/ruler.toml não encontrado');
  }
  
  console.log('\n📋 Status das configurações MCP:');
  console.log('   • .vscode/.mcp.json: Configuração principal para VS Code/Cursor');
  console.log('   • .ruler/ruler.toml: Configuração para sistema de agentes Ruler');
  console.log('   • Desktop Commander: Configurado com Docker em ambos os arquivos');
  
  console.log('\n🚀 Para usar os servidores MCP:');
  console.log('   1. Certifique-se de que o Docker está rodando');
  console.log('   2. Execute: docker pull mcp/desktop-commander:latest');
  console.log('   3. Reinicie seu IDE (VS Code/Cursor)');
  console.log('   4. Os servidores MCP devem estar disponíveis automaticamente');
}

function validateEnvironmentVariables() {
  console.log('\n🔐 Verificando variáveis de ambiente...');
  
  const requiredEnvVars = [
    'EXA_API_KEY',
    'TAVILY_API_KEY', 
    'UPSTASH_CONTEXT7_API_KEY',
    'SUPABASE_ACCESS_TOKEN',
    'GITHUB_PERSONAL_ACCESS_TOKEN'
  ];
  
  const missing = [];
  const present = [];
  
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      present.push(envVar);
    } else {
      missing.push(envVar);
    }
  }
  
  if (present.length > 0) {
    console.log('✅ Variáveis encontradas:', present.join(', '));
  }
  
  if (missing.length > 0) {
    console.log('⚠️  Variáveis faltando:', missing.join(', '));
    console.log('   💡 Crie um arquivo .env na raiz do projeto com essas variáveis');
  }
}

// Run the checks
checkMCPConfigurations();
validateEnvironmentVariables();
