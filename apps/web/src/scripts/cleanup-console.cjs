const fs = require('fs');
const path = require('path');

const filesToProcess = [
  'src/routes/ai-clinical-support/assessment.tsx',
  'src/routes/ai-clinical-support/recommendations.tsx',
  'src/routes/ai-clinical-support/predictions.tsx',
  'src/routes/ai-clinical-support/contraindications.tsx',
  'src/routes/ai-clinical-support/guidelines.tsx',
  'src/routes/ai-clinical-support/monitoring.tsx',
  'src/routes/inventory/product/$productId.tsx',
  'src/routes/inventory/new-product.tsx',
  'src/routes/inventory/index.tsx',
  'src/routes/aesthetic-scheduling/recovery.tsx',
  'src/routes/aesthetic-scheduling/contraindications.tsx',
  'src/routes/aesthetic-scheduling/certification.tsx',
  'src/routes/aesthetic-scheduling/multi-session.tsx',
  'src/routes/aesthetic-scheduling/rooms.tsx',
  'src/routes/aesthetic-scheduling/packages.tsx'
];

const loggerImport = `import { logger } from '@/utils/logger'\n`;

function replaceConsoleStatements(content) {
  let result = content;
  
  // Add logger import if not present
  if (!result.includes("import { logger } from '@/utils/logger'")) {
    // Find the last import statement and add logger import after it
    const importMatches = result.match(/^import.*$/gm);
    if (importMatches && importMatches.length > 0) {
      const lastImport = importMatches[importMatches.length - 1];
      result = result.replace(lastImport, lastImport + '\n' + loggerImport);
    }
  }
  
  // Replace console.error statements
  result = result.replace(
    /console\.error\('([^']*)'([^)]*),?\s*([^)]*)\)/g,
    (match, message, context, error) => {
      if (context && error) {
        return `await logger.error('${message}', { ${error.trim()} })`;
      } else if (error) {
        return `await logger.error('${message}', { ${error.trim()} })`;
      } else {
        return `await logger.error('${message}')`;
      }
    }
  );
  
  // Replace console.warn statements
  result = result.replace(
    /console\.warn\('([^']*)'([^)]*),?\s*([^)]*)\)/g,
    (match, message, context, data) => {
      if (context && data) {
        return `await logger.warn('${message}', { ${data.trim()} })`;
      } else if (data) {
        return `await logger.warn('${message}', { ${data.trim()} })`;
      } else {
        return `await logger.warn('${message}')`;
      }
    }
  );
  
  // Replace console.log statements
  result = result.replace(
    /console\.log\('([^']*)'([^)]*),?\s*([^)]*)\)/g,
    (match, message, context, data) => {
      if (context && data) {
        return `await logger.info('${message}', { ${data.trim()} })`;
      } else if (data) {
        return `await logger.info('${message}', { ${data.trim()} })`;
      } else {
        return `await logger.info('${message}')`;
      }
    }
  );
  
  // Handle variable references in console statements
  result = result.replace(
    /console\.error\(([^,)]+)(?:,\s*([^)]+))?\)/g,
    (match, error, context) => {
      if (context) {
        return `await logger.error('Error occurred', { error: ${error.trim()}, ${context.trim()} })`;
      } else {
        return `await logger.error('Error occurred', { error: ${error.trim()} })`;
      }
    }
  );
  
  result = result.replace(
    /console\.warn\(([^,)]+)(?:,\s*([^)]+))?\)/g,
    (match, data, context) => {
      if (context) {
        return `await logger.warn('Warning', { ${data.trim()}, ${context.trim()} })`;
      } else {
        return `await logger.warn('Warning', { ${data.trim()} })`;
      }
    }
  );
  
  return result;
}

// Process each file
filesToProcess.forEach(filePath => {
  try {
    const fullPath = path.resolve(filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    const updatedContent = replaceConsoleStatements(content);
    
    if (content !== updatedContent) {
      fs.writeFileSync(fullPath, updatedContent, 'utf8');
      console.log(`Updated: ${filePath}`);
    } else {
      console.log(`No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
});

console.log('Console statement cleanup completed!');