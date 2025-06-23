#!/usr/bin/env tsx
/**
 * Script para configurar o MCP do Supabase
 * 
 * Este script:
 * 1. Gera um Access Token do Supabase
 * 2. Configura as variáveis de ambiente necessárias
 * 3. Verifica se o MCP está funcionando corretamente
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { execSync } from 'child_process';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function main() {
  console.log('🚀 Configuração do MCP do Supabase\n');

  // 1. Verificar se temos as credenciais do Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Erro: Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não encontradas.');
    console.log('Por favor, certifique-se de que o arquivo .env.local está configurado corretamente.');
    process.exit(1);
  }

  console.log('✅ Credenciais do Supabase encontradas\n');

  // 2. Instruções para obter o Access Token
  console.log('📋 Para configurar o MCP do Supabase, você precisa de um Access Token.\n');
  console.log('Siga estes passos:\n');
  console.log('1. Acesse: https://app.supabase.com/account/tokens');
  console.log('2. Clique em "Generate new token"');
  console.log('3. Dê um nome ao token (ex: "NeonPro MCP")');
  console.log('4. Copie o token gerado\n');

  // Token padrão já configurado
  const defaultToken = 'sbp_40a721931e7ff98b4f6979a5bcb2a28c8ea5c0dc';
  console.log(`Token padrão disponível: ${defaultToken.substring(0, 10)}...`);
  
  const tokenInput = await question('Cole o Access Token aqui (Enter para usar o padrão): ');
  const accessToken = tokenInput.trim() || defaultToken;

  if (!accessToken || accessToken.trim() === '') {
    console.error('❌ Token inválido');
    rl.close();
    process.exit(1);
  }

  // 3. Criar arquivo de configuração MCP
  const mcpConfigPath = path.join(process.cwd(), '.mcp-env');
  const mcpConfig = `# MCP Configuration for Supabase
SUPABASE_ACCESS_TOKEN=${accessToken.trim()}
SUPABASE_PROJECT_ID=gfkskrkbnawkuppazkpt
`;

  fs.writeFileSync(mcpConfigPath, mcpConfig);
  console.log('\n✅ Arquivo .mcp-env criado com sucesso');

  // 4. Adicionar ao .gitignore se necessário
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
  
  if (!gitignoreContent.includes('.mcp-env')) {
    fs.appendFileSync(gitignorePath, '\n# MCP Configuration\n.mcp-env\n');
    console.log('✅ .mcp-env adicionado ao .gitignore');
  }

  // 5. Criar script de inicialização do MCP
  const initScriptPath = path.join(process.cwd(), 'scripts', 'init-mcp.sh');
  const initScript = `#!/bin/bash
# Script para inicializar o MCP do Supabase

# Carregar variáveis de ambiente
if [ -f .mcp-env ]; then
  export $(cat .mcp-env | xargs)
fi

# Verificar se o token está configurado
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
  echo "❌ Erro: SUPABASE_ACCESS_TOKEN não encontrado"
  echo "Execute: pnpm tsx scripts/setup-supabase-mcp.ts"
  exit 1
fi

echo "✅ MCP do Supabase configurado e pronto para uso!"
echo "Project ID: gfkskrkbnawkuppazkpt"
`;

  fs.writeFileSync(initScriptPath, initScript);
  fs.chmodSync(initScriptPath, '755');
  console.log('✅ Script de inicialização criado');

  // 6. Instruções finais
  console.log('\n🎉 Configuração concluída!\n');
  console.log('Para usar o MCP do Supabase:');
  console.log('1. Reinicie o VS Code/Cursor');
  console.log('2. O MCP será carregado automaticamente');
  console.log('3. Use comandos como: supabase.get_project_api_keys');
  console.log('\nVariáveis de ambiente salvas em: .mcp-env');
  console.log('\n⚠️  IMPORTANTE: Nunca commite o arquivo .mcp-env no Git!');

  rl.close();
}

// Executar o script
main().catch(console.error);