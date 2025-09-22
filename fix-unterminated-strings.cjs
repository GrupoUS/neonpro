const fs = require('fs');
const path = require('path');

function fixUnterminatedStrings(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Fix unterminated single-quoted strings ending with _,
    const fixedContent = content.replace(/'([^']*_),?\s*$/gm, "'$1',");
    
    // Fix unterminated single-quoted strings ending with _ not followed by comma
    const fixedContent2 = fixedContent.replace(/'([^']*_)\s*$/gm, "'$1'");
    
    // Fix malformed patterns like 'text_,
    const fixedContent3 = fixedContent2.replace(/'([^']*_),/g, "'$1',");
    
    fs.writeFileSync(filePath, fixedContent3, 'utf8');
    console.log(`Fixed unterminated strings in ${filePath}`);
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

// Fix the specific file
fixUnterminatedStrings('/home/vibecode/neonpro/packages/utils/src/healthcare-errors.ts');

console.log('Completed fixing unterminated strings');