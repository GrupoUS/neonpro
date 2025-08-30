#!/usr/bin/env python3
import subprocess
import os
import sys
from datetime import datetime

def log_message(message, level="INFO"):
    """Log messages with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {level}: {message}")

def run_command(command, description):
    """Run a shell command and handle errors"""
    log_message(f"Executing: {description}")
    log_message(f"Command: {command}")
    
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd="/home/vibecoder/neonpro",
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )
        
        if result.stdout:
            print(result.stdout)
        
        if result.returncode == 0:
            log_message(f"✅ {description} completed successfully")
            return True
        else:
            log_message(f"❌ {description} failed with exit code {result.returncode}", "ERROR")
            if result.stderr:
                log_message(f"Error output: {result.stderr}", "ERROR")
            return False
            
    except subprocess.TimeoutExpired:
        log_message(f"❌ {description} timed out after 5 minutes", "ERROR")
        return False
    except Exception as e:
        log_message(f"❌ {description} failed with exception: {str(e)}", "ERROR")
        return False

def main():
    """Execute the complete Git workflow"""
    log_message("Starting Git workflow execution")
    
    # Change to project directory
    os.chdir("/home/vibecoder/neonpro")
    log_message(f"Working directory: {os.getcwd()}")
    
    # Git workflow steps
    steps = [
        ("git status", "Check current Git status"),
        ("git add .", "Stage all changes"),
        ("git commit -m 'Automated commit before workflow completion'", "Commit staged changes"),
        ("git push origin coderabbitai/utg/b3d6a5a", "Push current branch to origin"),
        ("git checkout main", "Checkout to main branch"),
        ("git pull origin main", "Pull latest changes from main"),
        ("git merge coderabbitai/utg/b3d6a5a --no-ff -m 'Merge branch coderabbitai/utg/b3d6a5a into main'", "Merge feature branch into main"),
        ("git push origin main", "Push updated main branch to origin")
    ]
    
    # Execute each step
    for i, (command, description) in enumerate(steps, 1):
        log_message(f"\n=== Step {i}/{len(steps)}: {description} ===")
        
        if not run_command(command, description):
            log_message(f"❌ Workflow failed at step {i}: {description}", "ERROR")
            
            # Write error log
            with open("git_workflow_error.log", "w") as f:
                f.write(f"Git Workflow Error Log\n")
                f.write(f"Timestamp: {datetime.now().isoformat()}\n")
                f.write(f"Failed at step: {i} - {description}\n")
                f.write(f"Command: {command}\n")
            
            sys.exit(1)
    
    # Success - log completion
    log_message("\n🎉 Git workflow completed successfully!")
    
    # Final verification
    log_message("\n=== Final Verification ===")
    run_command("git branch --show-current", "Show current branch")
    run_command("git log --oneline -3", "Show recent commits")
    
    # Write success log
    with open("git_workflow_completion.log", "w") as f:
        f.write(f"Git Workflow Completion Log\n")
        f.write(f"Timestamp: {datetime.now().isoformat()}\n")
        f.write(f"Status: SUCCESS\n")
        f.write(f"Operations Completed:\n")
        f.write(f"- Pushed branch coderabbitai/utg/b3d6a5a to origin\n")
        f.write(f"- Checked out to main branch\n")
        f.write(f"- Pulled latest changes from main\n")
        f.write(f"- Merged feature branch into main\n")
        f.write(f"- Pushed updated main branch to origin\n")
    
    log_message("📝 Workflow completion logged to git_workflow_completion.log")

if __name__ == "__main__":
    main()