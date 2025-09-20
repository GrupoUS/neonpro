import fs from 'fs';
import path from 'path';

const servicesPath = path.join(__dirname, '../../../../src');
const filePath = path.join(servicesPath, 'ai-provider-router.ts');

console.log('Checking file:', filePath);
console.log('File exists:', fs.existsSync(filePath));

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath, 'utf8');
  const consoleLogCount = (content.match(/console\.log/g) || []).length;
  const lineCount = content.split('\n').length;

  console.log('Console.log count:', consoleLogCount);
  console.log('Line count:', lineCount);
  console.log('Should have 0 console.log:', consoleLogCount === 0);
  console.log('Should be <= 1000 lines:', lineCount <= 1000);

  // These should fail
  if (consoleLogCount > 0) {
    console.log('❌ Console.log test should fail');
  }

  if (lineCount > 1000) {
    console.log('❌ File size test should fail');
  }
}
