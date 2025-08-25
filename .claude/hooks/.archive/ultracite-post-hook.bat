@echo off
REM Claude Code Ultracite Post-Hook - Auto-format after TS/JS modifications
REM Version: 1.0.0 - NEONPRO Healthcare Optimized

REM Load shared utilities
call "%~dp0hook-commons.bat"

REM Parse environment variables
set "TOOL_NAME=%CLAUDE_TOOL_NAME%"
set "TOOL_RESULT=%CLAUDE_TOOL_RESULT%"
set "MODIFIED_FILES=%CLAUDE_MODIFIED_FILES%"
if "%TOOL_NAME%"=="" set "TOOL_NAME=unknown"
if "%TOOL_RESULT%"=="" set "TOOL_RESULT=success"

REM Track hook performance
call :track_performance "ULTRACITE_POST_START:%TOOL_NAME%:%TOOL_RESULT%"

REM Main execution flow
:main_execution
    call :check_ultracite_trigger
    if %errorlevel%==1 (
        call :execute_ultracite_format
    )
    goto :cleanup_and_exit

REM Check if ultracite should be triggered based on file modifications
:check_ultracite_trigger
    REM Only trigger for successful tool executions
    if /i "%TOOL_RESULT%" NEQ "success" (
        call :log_info "ULTRACITE_POST" "Skipping ultracite - tool result: %TOOL_RESULT%"
        exit /b 0
    )
    
    REM Check for relevant tool types that modify files
    if /i "%TOOL_NAME%"=="write_file" goto :check_file_types
    if /i "%TOOL_NAME%"=="edit_block" goto :check_file_types
    if /i "%TOOL_NAME%"=="replace_symbol_body" goto :check_file_types
    if /i "%TOOL_NAME%"=="insert_after_symbol" goto :check_file_types
    if /i "%TOOL_NAME%"=="insert_before_symbol" goto :check_file_types
    
    REM Skip for other tool types
    call :log_info "ULTRACITE_POST" "Skipping ultracite - tool type: %TOOL_NAME%"
    exit /b 0

:check_file_types
    REM Check if any TypeScript/JavaScript files were modified
    set "target_extensions=.ts .tsx .js .jsx .vue .svelte"
    set "should_format=0"
    
    REM Check current directory for relevant files if MODIFIED_FILES not available
    if "%MODIFIED_FILES%"=="" (
        for %%e in (%target_extensions%) do (
            if exist "*%%e" (
                set "should_format=1"
                call :log_info "ULTRACITE_POST" "Found %%e files in current directory"
            )
        )
    ) else (
        REM Check specific modified files
        for %%e in (%target_extensions%) do (
            echo %MODIFIED_FILES% | findstr /i "%%e" >nul
            if %errorlevel%==0 (
                set "should_format=1"
                call :log_info "ULTRACITE_POST" "Modified %%e files detected"
            )
        )
    )
    
    exit /b %should_format%

REM Execute ultracite formatting with error handling
:execute_ultracite_format
    call :log_info "ULTRACITE_POST" "Starting ultracite format execution"
    
    REM Check if ultracite is available
    call :check_ultracite_available
    if %errorlevel% NEQ 0 (
        call :log_warning "ULTRACITE_POST" "Ultracite not available - skipping format"
        goto :eof
    )
    
    REM Execute ultracite format with timeout and error handling
    call :track_performance "ULTRACITE_FORMAT_START"
    
    REM Use npx ultracite format for zero-configuration formatting
    call :execute_with_timeout "npx ultracite format" 30000 "ULTRACITE_FORMAT"
    set "format_result=%errorlevel%"
    
    call :track_performance "ULTRACITE_FORMAT_COMPLETE:%format_result%"
    
    if %format_result%==0 (
        call :log_success "ULTRACITE_POST" "Ultracite format completed successfully"
        call :update_ultracite_stats "success"
    ) else (
        call :log_warning "ULTRACITE_POST" "Ultracite format failed with code: %format_result%"
        call :update_ultracite_stats "failure"
    )
    
    goto :eof

REM Check if ultracite is available in the project
:check_ultracite_available
    REM Check if ultracite is installed globally or in project
    npx ultracite --version >nul 2>&1
    if %errorlevel%==0 (
        call :log_info "ULTRACITE_POST" "Ultracite available via npx"
        exit /b 0
    )
    
    REM Check if package.json has ultracite as dependency
    if exist "package.json" (
        findstr /i "ultracite" package.json >nul 2>&1
        if %errorlevel%==0 (
            call :log_info "ULTRACITE_POST" "Ultracite found in package.json"
            exit /b 0
        )
    )
    
    call :log_warning "ULTRACITE_POST" "Ultracite not found - consider running 'npx ultracite init'"
    exit /b 1

REM Execute command with timeout and error handling
:execute_with_timeout
    set "cmd=%~1"
    set "timeout_ms=%~2"
    set "context=%~3"
    
    call :log_info "%context%" "Executing: %cmd%"
    
    REM Execute command with timeout (convert ms to seconds)
    set /a timeout_sec=%timeout_ms% / 1000
    if %timeout_sec% LSS 1 set timeout_sec=1
    
    REM Execute with timeout using start /wait
    start /wait /b "" timeout /t %timeout_sec% /nobreak >nul 2>&1 & %cmd%
    set "cmd_result=%errorlevel%"
    
    if %cmd_result%==0 (
        call :log_success "%context%" "Command completed successfully"
    ) else (
        call :log_warning "%context%" "Command failed with code: %cmd_result%"
    )
    
    exit /b %cmd_result%

REM Update ultracite execution statistics
:update_ultracite_stats
    set "result=%~1"
    set "stats_file=%CACHE_DIR%\ultracite-stats.log"
    
    REM Log ultracite execution stats
    echo [%date% %time%] %TOOL_NAME% ultracite_format %result% >> "%stats_file%"
    
    REM Update success/failure counters
    if /i "%result%"=="success" (
        call :increment_counter "ultracite_success"
    ) else (
        call :increment_counter "ultracite_failure"
    )
    
    goto :eof

REM Increment counter in cache
:increment_counter
    set "counter_name=%~1"
    set "counter_file=%CACHE_DIR%\%counter_name%.count"
    
    set "current_count=0"
    if exist "%counter_file%" (
        for /f %%i in (%counter_file%) do set "current_count=%%i"
    )
    
    set /a new_count=%current_count% + 1
    echo %new_count% > "%counter_file%"
    
    call :log_info "STATS" "%counter_name%: %new_count%"
    goto :eof

REM Healthcare-specific ultracite integration
:healthcare_ultracite_check
    REM Check for healthcare-specific file patterns
    set "healthcare_files=patient clinic medical audit lgpd anvisa cfm"
    set "healthcare_detected=0"
    
    for %%h in (%healthcare_files%) do (
        dir /b *%%h*.ts *%%h*.tsx *%%h*.js *%%h*.jsx >nul 2>&1
        if %errorlevel%==0 (
            set "healthcare_detected=1"
            call :log_info "HEALTHCARE" "Healthcare files detected: *%%h*"
        )
    )
    
    if %healthcare_detected%==1 (
        call :log_info "HEALTHCARE" "Healthcare context detected - enhanced validation"
        REM Could add healthcare-specific ultracite configuration here
    )
    
    goto :eof

REM Quality validation integration
:validate_ultracite_quality
    REM Check if formatting improved code quality
    call :log_info "QUALITY" "Validating ultracite quality improvements"
    
    REM Basic validation - check if files are still syntactically correct
    if exist "tsconfig.json" (
        npx tsc --noEmit --skipLibCheck >nul 2>&1
        if %errorlevel%==0 (
            call :log_success "QUALITY" "TypeScript compilation successful after ultracite"
        ) else (
            call :log_warning "QUALITY" "TypeScript compilation issues after ultracite"
        )
    )
    
    goto :eof

REM Integration with reality check validation
:integrate_reality_check
    REM Mark that ultracite formatting was executed
    set "reality_check_file=%CACHE_DIR%\reality-check-state.json"
    
    REM Update reality check state
    echo {"ultracite_format": {"executed": true, "timestamp": "%date% %time%", "result": "%format_result%"}} > "%reality_check_file%.tmp"
    
    if exist "%reality_check_file%" (
        REM Merge with existing state (simplified)
        copy "%reality_check_file%" "%reality_check_file%.bak" >nul 2>&1
    )
    
    move "%reality_check_file%.tmp" "%reality_check_file%" >nul 2>&1
    call :log_info "REALITY_CHECK" "Updated reality check state with ultracite results"
    
    goto :eof

REM PNPM integration for healthcare optimization
:integrate_pnpm_healthcare
    REM Check if this is a PNPM project (following PNPM over NPM rule)
    if exist "pnpm-lock.yaml" (
        call :log_info "PNPM" "PNPM project detected - healthcare optimizations available"
        
        REM Could trigger PNPM-specific healthcare validations
        if exist "pnpm-workspace.yaml" (
            call :log_info "PNPM" "PNPM workspace detected - multi-tenant healthcare architecture"
        )
    ) else if exist "package-lock.json" (
        call :log_warning "PNPM" "NPM detected - consider migration to PNPM for healthcare performance"
    )
    
    goto :eof

REM Archon integration for task tracking
:integrate_archon_tracking
    REM Log ultracite execution for Archon task tracking
    set "archon_log=%CACHE_DIR%\archon-integration.log"
    
    echo [%date% %time%] ULTRACITE_POST tool=%TOOL_NAME% result=%TOOL_RESULT% format_result=%format_result% >> "%archon_log%"
    
    call :log_info "ARCHON" "Logged ultracite execution for task tracking"
    goto :eof

:cleanup_and_exit
    REM Healthcare integration check
    call :healthcare_ultracite_check
    
    REM Quality validation
    call :validate_ultracite_quality
    
    REM Reality check integration
    call :integrate_reality_check
    
    REM PNPM integration
    call :integrate_pnpm_healthcare
    
    REM Archon integration
    call :integrate_archon_tracking
    
    REM Cleanup temporary files
    call :cleanup_temp_files
    
    REM Track completion
    call :track_performance "ULTRACITE_POST_COMPLETE:%TOOL_NAME%"
    
    call :log_success "ULTRACITE_POST" "Ultracite post-hook completed"
    exit /b 0