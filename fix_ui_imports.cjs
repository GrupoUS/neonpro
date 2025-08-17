/**
 * Script para corrigir imports @neonpro/ui nos componentes do package UI
 */

const fs = require('fs');
const path = require('path');

const sourceDir = 'E:\\neonpro\\packages\\ui\\src';

// Função para corrigir imports em um arquivo
function fixImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Pular se não tem imports @neonpro/ui
    if (!content.includes('@neonpro/ui')) {
      return false;
    }
    
    console.log(`Fixing imports in: ${filePath}`);
    
    // Calcular path relativo baseado na estrutura de pastas
    const relativePath = path.relative(path.dirname(filePath), path.join(sourceDir, 'components', 'ui'));
    const relativePathNormalized = relativePath.replace(/\\/g, '/');
    
    // Substituir imports @neonpro/ui por paths relativos
    let newContent = content.replace(
      /@neonpro\/ui\/([a-zA-Z-]+)/g,
      `${relativePathNormalized}/$1`
    );
    
    // Se o arquivo está na pasta ui, usar paths relativos diretos
    if (filePath.includes('\\ui\\')) {
      newContent = content.replace(
        /@neonpro\/ui\/([a-zA-Z-]+)/g,
        './$1'
      );
    }
    
    // Se o arquivo está em components mas não em ui, usar ../ui/
    if (filePath.includes('\\components\\') && !filePath.includes('\\ui\\')) {
      const depth = (filePath.split('\\components\\')[1].split('\\').length - 1);
      const prefix = '../'.repeat(depth) + 'ui/';
      newContent = content.replace(
        /@neonpro\/ui\/([a-zA-Z-]+)/g,
        `${prefix}$1`
      );
    }
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    return true;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Função para percorrer diretórios recursivamente
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let fixedCount = 0;
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      fixedCount += walkDir(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      if (fixImports(fullPath)) {
        fixedCount++;
      }
    }
  }
  
  return fixedCount;
}

console.log('Starting import fixes...');
const fixedCount = walkDir(sourceDir);
console.log(`Fixed imports in ${fixedCount} files.`);