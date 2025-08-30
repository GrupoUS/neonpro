const fs = require('fs');
const path = require('path');

// Simple Git operations by writing to a log file
const logFile = '/home/vibecoder/neonpro/git_log.txt';

try {
  // Check if we're in the right directory
  const currentDir = process.cwd();
  fs.appendFileSync(logFile, `Current directory: ${currentDir}\n`);
  
  // Check if .git exists
  const gitDir = path.join('/home/vibecoder/neonpro', '.git');
  if (fs.existsSync(gitDir)) {
    fs.appendFileSync(logFile, 'Git repository found\n');
    
    // Read current branch
    const headFile = path.join(gitDir, 'HEAD');
    const headContent = fs.readFileSync(headFile, 'utf8').trim();
    fs.appendFileSync(logFile, `Current HEAD: ${headContent}\n`);
    
    // Try to execute git commands using child_process
    const { spawn } = require('child_process');
    
    const gitAdd = spawn('git', ['add', '.'], { cwd: '/home/vibecoder/neonpro' });
    
    gitAdd.stdout.on('data', (data) => {
      fs.appendFileSync(logFile, `git add stdout: ${data}`);
    });
    
    gitAdd.stderr.on('data', (data) => {
      fs.appendFileSync(logFile, `git add stderr: ${data}`);
    });
    
    gitAdd.on('close', (code) => {
      fs.appendFileSync(logFile, `git add exited with code ${code}\n`);
      
      if (code === 0) {
        // Proceed with commit
        const gitCommit = spawn('git', ['commit', '-m', 'chore: finalize bun migration configuration updates'], { cwd: '/home/vibecoder/neonpro' });
        
        gitCommit.stdout.on('data', (data) => {
          fs.appendFileSync(logFile, `git commit stdout: ${data}`);
        });
        
        gitCommit.stderr.on('data', (data) => {
          fs.appendFileSync(logFile, `git commit stderr: ${data}`);
        });
        
        gitCommit.on('close', (code) => {
          fs.appendFileSync(logFile, `git commit exited with code ${code}\n`);
          fs.appendFileSync(logFile, 'Git operations completed\n');
        });
      }
    });
    
  } else {
    fs.appendFileSync(logFile, 'No Git repository found\n');
  }
  
} catch (error) {
  fs.appendFileSync(logFile, `Error: ${error.message}\n`);
}