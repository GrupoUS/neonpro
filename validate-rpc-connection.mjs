import { readFile } from 'fs/promises';
import { join } from 'path';

console.log('🎯 VALIDAÇÃO HONO RPC CLIENT - Iniciando análise...\n');

// Função para ler e analisar arquivos
async function analyzeFile(filePath, description) {
  try {
    console.log(`📁 Analisando: ${description}`);
    console.log(`   Caminho: ${filePath}`);
    
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n').length;
    
    console.log(`   ✅ Arquivo encontrado - ${lines} linhas`);
    
    // Extrair imports e exports principais
    const imports = content.match(/^import.*from.*$/gm) || [];
    const exports = content.match(/^export.*$/gm) || [];
    
    console.log(`   📦 Imports: ${imports.length}`);
    console.log(`   📤 Exports: ${exports.length}`);
    
    // Verificar padrões específicos do Hono
    const honoPatterns = {
      'hono import': /import.*from ['"]hono['"]/.test(content),
      'hono/rpc-client': /hono\/rpc/.test(content),
      'api routes': /\.get\(|\.post\(|\.put\(|\.delete\(/.test(content),
      'type inference': /AppType|RpcClient/.test(content)
    };
    
    console.log(`   🔍 Padrões Hono detectados:`);
    Object.entries(honoPatterns).forEach(([pattern, found]) => {
      console.log(`      ${found ? '✅' : '❌'} ${pattern}`);
    });
    
    console.log('');
    return { content, imports, exports, honoPatterns };
    
  } catch (error) {
    console.log(`   ❌ Erro ao ler arquivo: ${error.message}\n`);
    return null;
  }
}

// Analisar arquivos principais
const files = [
  {
    path: 'apps/api/src/index.ts',
    description: 'Backend Hono - API Server'
  },
  {
    path: 'packages/shared/src/api-client.ts', 
    description: 'RPC Client - Frontend Integration'
  },
  {
    path: 'apps/web/hooks/enhanced/use-patients.ts',
    description: 'Hook de uso do API Client'
  }
];

console.log('📋 ANÁLISE DOS ARQUIVOS PRINCIPAIS\n');
console.log('=' .repeat(50));

for (const file of files) {
  await analyzeFile(file.path, file.description);
}

console.log('🎯 Análise concluída!');