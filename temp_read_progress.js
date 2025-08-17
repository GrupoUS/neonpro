const fs = require('fs');

try {
  const content = fs.readFileSync('./.claude/todos/phase5-progress.md', 'utf8');
  console.log('=== PROGRESS FILE CONTENT ===');
  console.log(content);
} catch (e) {
  console.error('Error:', e.message);
}