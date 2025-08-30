const { execSync } = require('child_process');

try {
  console.log('Adding files to staging...');
  execSync('git add .', { cwd: '/home/vibecoder/neonpro', stdio: 'inherit' });
  
  console.log('Committing changes...');
  execSync('git commit -m "chore: finalize bun migration configuration updates"', { cwd: '/home/vibecoder/neonpro', stdio: 'inherit' });
  
  console.log('Pushing current branch...');
  execSync('git push origin coderabbitai/utg/b3d6a5a', { cwd: '/home/vibecoder/neonpro', stdio: 'inherit' });
  
  console.log('Checking out main...');
  execSync('git checkout main', { cwd: '/home/vibecoder/neonpro', stdio: 'inherit' });
  
  console.log('Pulling latest main...');
  execSync('git pull origin main', { cwd: '/home/vibecoder/neonpro', stdio: 'inherit' });
  
  console.log('Merging branch...');
  execSync('git merge coderabbitai/utg/b3d6a5a', { cwd: '/home/vibecoder/neonpro', stdio: 'inherit' });
  
  console.log('Pushing main...');
  execSync('git push origin main', { cwd: '/home/vibecoder/neonpro', stdio: 'inherit' });
  
  console.log('Git operations completed successfully!');
} catch (error) {
  console.error('Error during git operations:', error.message);
  process.exit(1);
}