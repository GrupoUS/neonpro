#!/usr/bin/env python3
import subprocess
import os
import sys

def run_git_command(command, description):
    """Execute a git command and handle errors"""
    print(f"\n=== {description} ===")
    try:
        result = subprocess.run(command, shell=True, cwd='/home/vibecoder/neonpro', 
                              capture_output=True, text=True, check=True)
        print(f"SUCCESS: {result.stdout}")
        if result.stderr:
            print(f"STDERR: {result.stderr}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"ERROR: {e}")
        print(f"STDOUT: {e.stdout}")
        print(f"STDERR: {e.stderr}")
        return False

def main():
    os.chdir('/home/vibecoder/neonpro')
    
    # Step 1: Add all changes
    if not run_git_command('git add .', 'Adding all changes to staging'):
        sys.exit(1)
    
    # Step 2: Check if there are changes to commit
    try:
        result = subprocess.run('git diff --cached --quiet', shell=True, cwd='/home/vibecoder/neonpro')
        if result.returncode == 0:
            print("No changes to commit")
        else:
            # Step 3: Commit changes
            if not run_git_command('git commit -m "chore: finalize bun migration configuration updates"', 
                                 'Committing changes'):
                sys.exit(1)
    except Exception as e:
        print(f"Error checking for changes: {e}")
    
    # Step 4: Push current branch
    if not run_git_command('git push origin coderabbitai/utg/b3d6a5a', 
                          'Pushing current branch to origin'):
        sys.exit(1)
    
    # Step 5: Checkout main
    if not run_git_command('git checkout main', 'Checking out main branch'):
        sys.exit(1)
    
    # Step 6: Merge the branch
    if not run_git_command('git merge coderabbitai/utg/b3d6a5a', 
                          'Merging branch into main'):
        print("Merge failed - there might be conflicts to resolve")
        sys.exit(1)
    
    # Step 7: Push main
    if not run_git_command('git push origin main', 'Pushing main to origin'):
        sys.exit(1)
    
    print("\n=== Git operations completed successfully! ===")

if __name__ == '__main__':
    main()