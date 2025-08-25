@echo off
REM Claude Code Proactive Hooks - Enhanced Subagent Stop Hook
REM Version: 1.0.0
REM Description: Executes proactive commands when a subagent completes a task
REM
REM This hook is triggered when a subagent stops/completes execution.
REM It automatically executes configured commands for task completion scenarios.

REM ============================================================================
REM INITIALIZATION AND SETUP
REM ============================================================================

REM Load shared utilities
call "%~dp0hook-commons.bat"

REM Initialize hook execution
call :log_info "SUBAGENT_STOP" "Subagent stop hook initiated"
call :log_info "SUBAGENT_STOP" "Hook triggered at: %CLAUDE_TIMESTAMP%"

REM Parse command line arguments (if provided by Claude Code)
set "SUBAGENT_NAME=%~1"
set "TASK_STATUS=%~2"
set "TASK_ID=%~3"

REM Set defaults if not provided
if "%SUBAGENT_NAME%"=="" set "SUBAGENT_NAME=unknown"
if "%TASK_STATUS%"=="" set "TASK_STATUS=success"
if "%TASK_ID%"=="" set "TASK_ID=%RANDOM%"

REM Log subagent details
call :log_info "SUBAGENT_STOP" "Subagent: %SUBAGENT_NAME%"
call :log_info "SUBAGENT_STOP" "Status: %TASK_STATUS%"
call :log_info "SUBAGENT_STOP" "Task ID: %TASK_ID%"

REM ============================================================================
REM PROACTIVE COMMAND EXECUTION
REM ============================================================================

:main_execution
    REM Check if configuration exists
    call :config_exists
    if %errorlevel% NEQ 0 (
        call :log_warning "SUBAGENT_STOP" "Hook configuration not found - using defaults"
        goto :execute_default_commands
    )

    REM Execute task completion commands based on status
    call :log_info "SUBAGENT_STOP" "Executing proactive task completion commands"
    call :execute_task_completion_commands "%TASK_STATUS%"
    
    REM Update plan state
    call :update_plan_state "task_completed:%SUBAGENT_NAME%:%TASK_STATUS%"
    
    goto :cleanup_and_exit

REM ============================================================================
REM DEFAULT COMMAND EXECUTION (when no config available)
REM ============================================================================

:execute_default_commands
    call :log_info "SUBAGENT_STOP" "Executing default task completion workflow"
    
    REM Default success commands
    if "%TASK_STATUS%"=="success" (
        call :log_success "SUBAGENT_STOP" "Task completed successfully - running default checks"
        
        REM Check for package.json and run basic npm commands
        call :check_package_json
        if %errorlevel%==0 (
            call :log_info "SUBAGENT_STOP" "Found package.json - checking for npm scripts"
            
            REM Try to run lint if script exists (Biome)
            call :check_npm_script "lint"
            if %errorlevel%==0 (
                call :log_info "SUBAGENT_STOP" "Running npm run lint (Biome)"
                npm run lint
                if %errorlevel%==0 (
                    call :log_success "SUBAGENT_STOP" "Biome linting completed successfully"
                ) else (
                    call :log_warning "SUBAGENT_STOP" "Biome linting completed with warnings/errors"
                )
            )
            
            REM Try to run tests if script exists
            call :check_npm_script "test"
            if %errorlevel%==0 (
                call :log_info "SUBAGENT_STOP" "Running npm run test"
                npm run test
                if %errorlevel%==0 (
                    call :log_success "SUBAGENT_STOP" "Tests completed successfully"
                ) else (
                    call :log_warning "SUBAGENT_STOP" "Tests completed with failures"
                )
            )
        )
        
        REM Basic success notification
        call :log_success "SUBAGENT_STOP" "Task completion workflow finished successfully"
        echo [%date% %time%] Task completed successfully by %SUBAGENT_NAME%
        
    ) else (
        REM Default failure handling
        call :log_error "SUBAGENT_STOP" "Task completed with failure status"
        echo [%date% %time%] Task completed with failures by %SUBAGENT_NAME% - check logs
    )
    
    goto :cleanup_and_exit

REM ============================================================================
REM ENHANCED TASK COMPLETION WORKFLOW
REM ============================================================================

:execute_enhanced_workflow
    REM This would be called from the commons function but can be customized here
    call :log_info "SUBAGENT_STOP" "Executing enhanced task completion workflow"
    
    REM Pre-command checks
    call :log_info "SUBAGENT_STOP" "Running pre-command environment checks"
    
    REM Check project type and run appropriate commands
    if exist "package.json" (
        call :execute_nodejs_workflow
    ) else if exist "requirements.txt" (
        call :execute_python_workflow  
    ) else if exist "Cargo.toml" (
        call :execute_rust_workflow
    ) else (
        call :execute_generic_workflow
    )
    
    goto :eof

:execute_nodejs_workflow
    call :log_info "SUBAGENT_STOP" "Executing Node.js project workflow"
    
    REM Run linting
    call :check_npm_script "lint"
    if %errorlevel%==0 (
        call :execute_command_with_retry "npm" "run lint" "2" "2"
    )
    
    REM Run tests
    call :check_npm_script "test"
    if %errorlevel%==0 (
        call :execute_command_with_retry "npm" "run test" "2" "2"
    )
    
    REM Run type checking
    call :check_npm_script "type-check"
    if %errorlevel%==0 (
        call :execute_command_with_retry "npm" "run type-check" "2" "2"
    )
    
    goto :eof

:execute_python_workflow
    call :log_info "SUBAGENT_STOP" "Executing Python project workflow"
    
    REM Check for common Python tools and run them
    where flake8 >nul 2>&1
    if %errorlevel%==0 (
        call :execute_command_with_retry "flake8" "." "2" "2"
    )
    
    where pytest >nul 2>&1
    if %errorlevel%==0 (
        call :execute_command_with_retry "pytest" "" "2" "2"
    )
    
    goto :eof

:execute_rust_workflow
    call :log_info "SUBAGENT_STOP" "Executing Rust project workflow"
    
    REM Run cargo check
    call :execute_command_with_retry "cargo" "check" "2" "2"
    
    REM Run cargo test
    call :execute_command_with_retry "cargo" "test" "2" "2"
    
    goto :eof

:execute_generic_workflow
    call :log_info "SUBAGENT_STOP" "Executing generic project workflow"
    
    REM Generic commands - just notification
    echo Task completed successfully - no specific project type detected
    call :log_success "SUBAGENT_STOP" "Generic workflow completed"
    
    goto :eof

REM ============================================================================
REM CLEANUP AND EXIT
REM ============================================================================

:cleanup_and_exit
    REM Perform cleanup operations
    call :cleanup_temp_files
    
    REM Log completion
    call :log_success "SUBAGENT_STOP" "Subagent stop hook completed successfully"
    call :log_info "SUBAGENT_STOP" "Hook execution time: %CLAUDE_TIMESTAMP%"
    
    REM Final success notification
    echo [%date% %time%] Subagent Stop Hook: Task completion workflow finished
    
    REM Exit without error
    exit /b 0

REM ============================================================================
REM ERROR HANDLING
REM ============================================================================

:error_handler
    call :log_error "SUBAGENT_STOP" "Hook execution failed: %~1"
    echo [%date% %time%] Subagent Stop Hook: Error occurred - %~1
    
    REM Exit with error code but don't break Claude Code execution
    exit /b 1

REM ============================================================================
REM HOOK EXECUTION START
REM ============================================================================

REM Start main execution
goto :main_execution