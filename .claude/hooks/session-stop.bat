@echo off
REM Claude Code Proactive Hooks - Session Stop Hook
REM Version: 1.0.0
REM Description: Executes final cleanup and summary when Claude Code session ends
REM
REM This hook is triggered when the Claude Code session stops and provides
REM final plan summarization, cleanup, and completion workflows.

REM ============================================================================
REM INITIALIZATION AND SETUP
REM ============================================================================

REM Load shared utilities
call "%~dp0hook-commons.bat"

REM Initialize hook execution
call :log_info "SESSION_STOP" "Session stop hook initiated"
call :log_info "SESSION_STOP" "Session ended at: %CLAUDE_TIMESTAMP%"

REM Parse command line arguments (if provided by Claude Code)
set "SESSION_ID=%~1"
set "SESSION_STATUS=%~2"

REM Set defaults if not provided
if "%SESSION_ID%"=="" set "SESSION_ID=session_%RANDOM%"
if "%SESSION_STATUS%"=="" set "SESSION_STATUS=normal"

REM Log session details
call :log_info "SESSION_STOP" "Session ID: %SESSION_ID%"
call :log_info "SESSION_STOP" "Session Status: %SESSION_STATUS%"

REM ============================================================================
REM SESSION COMPLETION WORKFLOW
REM ============================================================================

:main_execution
    REM Execute final plan completion check
    call :final_plan_completion_check
    
    REM Generate session summary
    call :generate_session_summary
    
    REM Execute final cleanup
    call :execute_final_cleanup
    
    REM Run final commands if plan was completed
    call :execute_session_completion_commands
    
    REM Archive session data
    call :archive_session_data
    
    goto :cleanup_and_exit

:final_plan_completion_check
    call :log_info "SESSION_STOP" "Performing final plan completion check"
    
    REM Use plan state manager to check completion
    where node >nul 2>&1
    if %errorlevel%==0 (
        call "%~dp0plan-state-manager.bat" check-completion > "%CACHE_DIR%\final-completion-check.json"
        if %errorlevel%==0 (
            REM Parse completion result (simplified)
            findstr "\"isCompleted\".*true" "%CACHE_DIR%\final-completion-check.json" >nul 2>&1
            if %errorlevel%==0 (
                call :log_success "SESSION_STOP" "Plan completion confirmed"
                set "PLAN_COMPLETED=true"
            ) else (
                call :log_warning "SESSION_STOP" "Plan completion not detected"
                set "PLAN_COMPLETED=false"
            )
        )
    ) else (
        REM Fallback completion check
        call :basic_completion_check
    )
    
    goto :eof

:basic_completion_check
    call :log_info "SESSION_STOP" "Using basic completion check (Node.js not available)"
    
    set "PLAN_COMPLETED=false"
    
    REM Check for build/test activity
    if exist "%CACHE_DIR%\tool-usage.log" (
        findstr /i "npm.*build\|npm.*test\|build.*success" "%CACHE_DIR%\tool-usage.log" >nul 2>&1
        if %errorlevel%==0 (
            set "PLAN_COMPLETED=true"
            call :log_info "SESSION_STOP" "Basic completion indicators found"
        )
    )
    
    goto :eof

:generate_session_summary
    call :log_info "SESSION_STOP" "Generating session summary"
    
    set "SUMMARY_FILE=%CACHE_DIR%\session-summary-%date:/=-%-%time::=-.txt"
    set "SUMMARY_FILE=%SUMMARY_FILE: =%"
    
    (
        echo ================================================================
        echo CLAUDE CODE SESSION SUMMARY
        echo ================================================================
        echo Session ID: %SESSION_ID%
        echo Session Status: %SESSION_STATUS%
        echo End Time: %date% %time%
        echo Plan Completed: %PLAN_COMPLETED%
        echo ================================================================
        echo.
        echo TOOL USAGE SUMMARY:
    ) > "%SUMMARY_FILE%"
    
    REM Add tool usage summary
    if exist "%CACHE_DIR%\tool-usage.log" (
        echo Tool usage count: >> "%SUMMARY_FILE%"
        for /f %%i in ('find /c /v "" "%CACHE_DIR%\tool-usage.log"') do echo   Total tools used: %%i >> "%SUMMARY_FILE%"
        
        echo. >> "%SUMMARY_FILE%"
        echo Most recent tools: >> "%SUMMARY_FILE%"
        powershell "Get-Content '%CACHE_DIR%\tool-usage.log' | Select-Object -Last 5" >> "%SUMMARY_FILE%" 2>nul
    ) else (
        echo   No tool usage recorded >> "%SUMMARY_FILE%"
    )
    
    REM Add task summary
    echo. >> "%SUMMARY_FILE%"
    echo TASK SUMMARY: >> "%SUMMARY_FILE%"
    
    if exist "%CACHE_DIR%\todo-activity.log" (
        for /f %%i in ('find /c "TodoWrite" "%CACHE_DIR%\todo-activity.log"') do echo   TodoWrite executions: %%i >> "%SUMMARY_FILE%"
    )
    
    if exist "%CACHE_DIR%\task-activity.log" (
        for /f %%i in ('find /c "Task" "%CACHE_DIR%\task-activity.log"') do echo   Subagent tasks: %%i >> "%SUMMARY_FILE%"
    )
    
    REM Add error summary
    echo. >> "%SUMMARY_FILE%"
    echo ERROR SUMMARY: >> "%SUMMARY_FILE%"
    
    if exist "%HOOK_DIR%error-log.txt" (
        for /f %%i in ('find /c "ERROR" "%HOOK_DIR%error-log.txt"') do (
            if %%i GTR 0 (
                echo   Errors encountered: %%i >> "%SUMMARY_FILE%"
                echo   Check error-log.txt for details >> "%SUMMARY_FILE%"
            ) else (
                echo   No errors encountered >> "%SUMMARY_FILE%"
            )
        )
    ) else (
        echo   No error log found >> "%SUMMARY_FILE%"
    )
    
    REM Add performance summary
    echo. >> "%SUMMARY_FILE%"
    echo PERFORMANCE SUMMARY: >> "%SUMMARY_FILE%"
    
    if exist "%CACHE_DIR%\hook-performance.log" (
        for /f %%i in ('find /c /v "" "%CACHE_DIR%\hook-performance.log"') do echo   Hook executions: %%i >> "%SUMMARY_FILE%"
    )
    
    echo ================================================================ >> "%SUMMARY_FILE%"
    
    call :log_success "SESSION_STOP" "Session summary generated: %SUMMARY_FILE%"
    
    goto :eof

:execute_session_completion_commands
    call :log_info "SESSION_STOP" "Executing session completion commands"
    
    REM Execute final commands based on plan completion status
    if "%PLAN_COMPLETED%"=="true" (
        call :execute_successful_completion_commands
    ) else (
        call :execute_partial_completion_commands
    )
    
    goto :eof

:execute_successful_completion_commands
    call :log_success "SESSION_STOP" "Executing successful completion workflow"
    
    REM Check if configuration exists for final commands
    call :config_exists
    if %errorlevel%==0 (
        REM Use plan completion commands from configuration
        call :execute_plan_completion_commands "success"
    ) else (
        REM Default successful completion workflow
        call :default_successful_completion
    )
    
    goto :eof

:execute_partial_completion_commands
    call :log_warning "SESSION_STOP" "Executing partial completion workflow"
    
    REM Basic cleanup and notification for incomplete sessions
    echo [%date% %time%] Session ended with partial completion >> "%LOG_FILE%"
    
    REM Try to save current state
    where node >nul 2>&1
    if %errorlevel%==0 (
        call "%~dp0plan-state-manager.bat" finalize "partial" >nul 2>&1
    )
    
    goto :eof

:default_successful_completion
    call :log_info "SESSION_STOP" "Executing default successful completion workflow"
    
    REM Final build if package.json exists
    if exist "package.json" (
        call :check_npm_script "build"
        if %errorlevel%==0 (
            call :log_info "SESSION_STOP" "Running final build"
            npm run build
            if %errorlevel%==0 (
                call :log_success "SESSION_STOP" "Final build completed successfully"
            ) else (
                call :log_warning "SESSION_STOP" "Final build completed with warnings"
            )
        )
    )
    
    REM Success notification
    echo.
    echo ================================================================
    echo SESSION COMPLETED SUCCESSFULLY
    echo ================================================================
    echo Plan execution completed with all tasks finished
    echo Time: %date% %time%
    echo Check %SUMMARY_FILE% for detailed summary
    echo ================================================================
    echo.
    
    goto :eof

:execute_final_cleanup
    call :log_info "SESSION_STOP" "Executing final cleanup operations"
    
    REM Cleanup temporary files older than current session
    call :cleanup_temp_files
    
    REM Rotate large log files
    call :rotate_log_files
    
    REM Archive old state files
    call :archive_old_states
    
    REM Clean up old backups
    call :cleanup_old_backups
    
    call :log_success "SESSION_STOP" "Final cleanup completed"
    
    goto :eof

:rotate_log_files
    REM Rotate log files if they're too large
    for %%F in ("%LOG_FILE%") do (
        if %%~zF GTR 5242880 (
            move "%LOG_FILE%" "%LOG_FILE%.%date:/=-%-%time::=%"
            echo [%date% %time%] Session Stop Hook: Log rotated due to size > "%LOG_FILE%"
        )
    )
    goto :eof

:archive_old_states
    REM Archive old state files
    set "ARCHIVE_DIR=%CACHE_DIR%\archived-states"
    if not exist "%ARCHIVE_DIR%" mkdir "%ARCHIVE_DIR%" >nul 2>&1
    
    REM Move completed state files to archive
    for %%f in ("%CACHE_DIR%\*.json") do (
        findstr "completed\|finalized" "%%f" >nul 2>&1
        if %errorlevel%==0 (
            move "%%f" "%ARCHIVE_DIR%\" >nul 2>&1
        )
    )
    goto :eof

:cleanup_old_backups
    REM Clean up backups older than 30 days
    if exist "%CACHE_DIR%\state-backups" (
        forfiles /p "%CACHE_DIR%\state-backups" /d -30 /c "cmd /c del @path" >nul 2>&1
    )
    
    if exist "%CACHE_DIR%\emergency-backup*" (
        forfiles /p "%CACHE_DIR%" /m "emergency-backup*" /d -7 /c "cmd /c rmdir /s /q @path" >nul 2>&1
    )
    
    goto :eof

:archive_session_data
    call :log_info "SESSION_STOP" "Archiving session data"
    
    REM Create session archive directory
    set "SESSION_ARCHIVE_DIR=%CACHE_DIR%\sessions\%SESSION_ID%"
    if not exist "%SESSION_ARCHIVE_DIR%" mkdir "%SESSION_ARCHIVE_DIR%" >nul 2>&1
    
    REM Archive session-specific files
    if exist "%SUMMARY_FILE%" copy "%SUMMARY_FILE%" "%SESSION_ARCHIVE_DIR%\summary.txt" >nul 2>&1
    if exist "%CACHE_DIR%\final-completion-check.json" copy "%CACHE_DIR%\final-completion-check.json" "%SESSION_ARCHIVE_DIR%\" >nul 2>&1
    
    REM Archive activity logs
    if exist "%CACHE_DIR%\tool-usage.log" copy "%CACHE_DIR%\tool-usage.log" "%SESSION_ARCHIVE_DIR%\" >nul 2>&1
    if exist "%CACHE_DIR%\todo-activity.log" copy "%CACHE_DIR%\todo-activity.log" "%SESSION_ARCHIVE_DIR%\" >nul 2>&1
    if exist "%CACHE_DIR%\task-activity.log" copy "%CACHE_DIR%\task-activity.log" "%SESSION_ARCHIVE_DIR%\" >nul 2>&1
    
    call :log_success "SESSION_STOP" "Session data archived to: %SESSION_ARCHIVE_DIR%"
    
    goto :eof

REM ============================================================================
REM CLEANUP AND EXIT
REM ============================================================================

:cleanup_and_exit
    REM Final log entries
    call :log_success "SESSION_STOP" "Session stop hook completed successfully"
    call :log_info "SESSION_STOP" "Final timestamp: %CLAUDE_TIMESTAMP%"
    
    REM Display final message
    echo [%date% %time%] Claude Code Session Stop Hook: Completed successfully
    if defined SUMMARY_FILE (
        echo Session summary available at: %SUMMARY_FILE%
    )
    
    REM Exit without error
    exit /b 0

REM ============================================================================
REM ERROR HANDLING
REM ============================================================================

:error_handler
    call :log_error "SESSION_STOP" "Hook execution failed: %~1"
    echo [%date% %time%] Session Stop Hook: Error occurred - %~1
    
    REM Try to save a basic session summary even on error
    echo Session ended with errors at %date% %time% > "%CACHE_DIR%\session-error-summary.txt"
    echo Error: %~1 >> "%CACHE_DIR%\session-error-summary.txt"
    
    REM Exit with error but don't break session cleanup
    exit /b 1

REM ============================================================================
REM HOOK EXECUTION START
REM ============================================================================

REM Start main execution
goto :main_execution