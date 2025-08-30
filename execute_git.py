#!/usr/bin/env python3
import subprocess
import os

try:
    # Change to the project directory
    os.chdir('/home/vibecoder/neonpro')
    
    # Execute the Node.js script
    result = subprocess.run(['/usr/local/bin/node', 'git_operations.js'], 
                          capture_output=True, text=True, check=True)
    
    print('STDOUT:')
    print(result.stdout)
    
    if result.stderr:
        print('STDERR:')
        print(result.stderr)
        
    print('Git operations completed successfully!')
    
except subprocess.CalledProcessError as e:
    print(f'Error executing git operations: {e}')
    print(f'Return code: {e.returncode}')
    if e.stdout:
        print(f'STDOUT: {e.stdout}')
    if e.stderr:
        print(f'STDERR: {e.stderr}')
except Exception as e:
    print(f'Unexpected error: {e}')