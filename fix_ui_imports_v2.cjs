/**
 * Script para corrigir todos os imports incorretos no UI package
 */

const fs = require('fs');
const path = require('path');

const sourceDir = 'E:\\neonpro\\packages\\ui\\src\\components';

// Função para corrigir imports em um arquivo
function fixImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Pular se não tem imports incorretos
    if (!content.includes('./card') && !content.includes('./button') && !content.includes('./badge')) {
      return false;
    }
    
    console.log(`Fixing imports in: ${filePath}`);
    
    let newContent = content;
    
    // Determinar o path relativo correto baseado na localização do arquivo
    const relativePath = path.relative(path.dirname(filePath), path.join(sourceDir, 'ui'));
    const relativePathNormalized = relativePath.replace(/\\/g, '/');
    
    // Lista de componentes UI para corrigir
    const uiComponents = [
      'alert', 'badge', 'button', 'card', 'dialog', 'input', 'label', 
      'progress', 'select', 'switch', 'table', 'tabs', 'textarea'
    ];
    
    // Corrigir imports relativos incorretos
    for (const component of uiComponents) {
      const incorrectImport = `'./${component}'`;
      const correctImport = `'${relativePathNormalized}/${component}'`;
      newContent = newContent.replace(new RegExp(incorrectImport, 'g'), correctImport);
    }
    
    // Corrigir imports @neonpro/utils para path relativo
    newContent = newContent.replace(
      /@neonpro\/utils/g,
      '@neonpro/utils'
    );
    
    // Corrigir imports @neonpro/domain
    newContent = newContent.replace(
      /@neonpro\/domain/g,
      '@neonpro/domain'
    );
    
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