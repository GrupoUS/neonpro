const { execSync } = require('child_process');

try {
  console.log('=== ANALYZING CURRENT PROJECT STRUCTURE ===\n');
  
  // Run the file reading script
  const output = execSync('node read_current_files.js', { 
    cwd: __dirname,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 // 1MB buffer
  });
  
  console.log(output);
  
} catch (error) {
  console.error('Error running analysis:', error.message);
  if (error.stdout) {
    console.log('STDOUT:', error.stdout);
  }
  if (error.stderr) {
    console.log('STDERR:', error.stderr);
  }
}