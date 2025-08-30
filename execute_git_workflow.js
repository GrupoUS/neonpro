const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Change to the project directory
process.chdir('/home/vibecoder/neonpro');

console.log('Starting Git workflow execution...');
console.log('Working directory:', process.cwd());

// Make the shell script executable
try {
    fs.chmodSync('./complete_git_workflow.sh', '755');
    console.log('✅ Made script executable');
} catch (error) {
    console.error('❌ Failed to make script executable:', error.message);
    process.exit(1);
}

// Execute the shell script
const gitProcess = spawn('/bin/bash', ['./complete_git_workflow.sh'], {
    stdio: 'inherit',
    cwd: '/home/vibecoder/neonpro'
});

gitProcess.on('close', (code) => {
    if (code === 0) {
        console.log('\n🎉 Git workflow completed successfully!');
        
        // Log final status to a file
        const statusLog = `Git Workflow Completion Log\n` +
                         `Timestamp: ${new Date().toISOString()}\n` +
                         `Exit Code: ${code}\n` +
                         `Status: SUCCESS\n` +
                         `Operations Completed:\n` +
                         `- Pushed branch coderabbitai/utg/b3d6a5a to origin\n` +
                         `- Checked out to main branch\n` +
                         `- Pulled latest changes from main\n` +
                         `- Merged feature branch into main\n` +
                         `- Pushed updated main branch to origin\n`;
        
        fs.writeFileSync('./git_workflow_completion.log', statusLog);
        console.log('📝 Workflow completion logged to git_workflow_completion.log');
    } else {
        console.error(`\n❌ Git workflow failed with exit code: ${code}`);
        
        // Log failure status
        const errorLog = `Git Workflow Error Log\n` +
                        `Timestamp: ${new Date().toISOString()}\n` +
                        `Exit Code: ${code}\n` +
                        `Status: FAILED\n`;
        
        fs.writeFileSync('./git_workflow_error.log', errorLog);
        console.log('📝 Error logged to git_workflow_error.log');
        process.exit(1);
    }
});

gitProcess.on('error', (error) => {
    console.error('❌ Failed to start Git workflow:', error.message);
    process.exit(1);
});