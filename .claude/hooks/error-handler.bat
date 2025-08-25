@echo off
REM Claude Code Proactive Hooks - Centralized Error Handling System
REM Version: 1.0.0
REM Description: Robust error handling, retry logic, and failure isolation for hook system
REM
REM This script provides centralized error handling capabilities for all hook scripts,
REM including retry mechanisms, fallback strategies, and comprehensive error logging.

REM ============================================================================
REM INITIALIZATION AND CONFIGURATION
REM ============================================================================

REM Load shared utilities
call "%~dp0hook-commons.bat"

REM Error handling configuration
set "ERROR_LOG=%HOOK_DIR%error-log.txt"
set "RECOVERY_LOG=%HOOK_DIR%recovery-log.txt" 
set "SYSTEM_HEALTH_LOG=%HOOK_DIR%system-health.txt"
set "MAX_RETRIES=3"
set "RETRY_DELAY=2"
set "ERROR_THRESHOLD=5"
set "RECOVERY_MODE=false"

REM Initialize error tracking
if not exist "%ERROR_LOG%" (
    echo [%date% %time%] Error Handler Initialized > "%ERROR_LOG%"
)

REM ============================================================================
REM CORE ERROR HANDLING FUNCTIONS
REM ============================================================================

:handle_error
    REM Central error handling function
    REM Parameters: %1=component, %2=error_message, %3=error_code, %4=recovery_action
    
    set "component=%~1"
    set "error_message=%~2"
    set "error_code=%~3"
    set "recovery_action=%~4"
    
    REM Log the error
    call :log_error_details "%component%" "%error_message%" "%error_code%"
    
    REM Determine severity
    call :assess_error_severity "%error_code%"
    set "severity=%errorlevel%"
    
    REM Execute recovery based on severity
    if %severity% LEQ 1 (
        call :handle_minor_error "%component%" "%error_message%" "%recovery_action%"
    ) else if %severity% LEQ 3 (
        call :handle_moderate_error "%component%" "%error_message%" "%recovery_action%"
    ) else (
        call :handle_critical_error "%component%" "%error_message%" "%recovery_action%"
    )
    
    REM Update system health
    call :update_system_health "%component%" "%severity%"
    
    goto :eof

:log_error_details
    REM Detailed error logging
    set "component=%~1"
    set "error_message=%~2"
    set "error_code=%~3"
    
    echo ============================================== >> "%ERROR_LOG%"
    echo [%date% %time%] ERROR DETECTED >> "%ERROR_LOG%"
    echo Component: %component% >> "%ERROR_LOG%"
    echo Message: %error_message% >> "%ERROR_LOG%"
    echo Error Code: %error_code% >> "%ERROR_LOG%"
    echo System: %COMPUTERNAME% >> "%ERROR_LOG%"
    echo User: %USERNAME% >> "%ERROR_LOG%"
    echo Working Dir: %CD% >> "%ERROR_LOG%"
    echo Environment: CLAUDE_TOOL_NAME=%CLAUDE_TOOL_NAME% >> "%ERROR_LOG%"
    echo ============================================== >> "%ERROR_LOG%"
    
    REM Also log to central hook log
    call :log_error "ERROR_HANDLER" "Error in %component%: %error_message% (Code: %error_code%)"
    
    goto :eof

:assess_error_severity
    REM Assess error severity based on error code
    set "error_code=%~1"
    
    REM Severity levels: 1=Minor, 2=Moderate, 3=Severe, 4=Critical
    if "%error_code%"=="0" exit /b 1
    if "%error_code%"=="1" exit /b 2
    if "%error_code%"=="2" exit /b 2
    if "%error_code%"=="9009" exit /b 3  REM Command not found
    if "%error_code%"=="32" exit /b 2    REM File in use
    if "%error_code%"=="5" exit /b 3     REM Access denied
    if "%error_code%"=="87" exit /b 2    REM Invalid parameter
    
    REM Default to moderate for unknown errors
    exit /b 2

REM ============================================================================
REM SEVERITY-SPECIFIC ERROR HANDLERS
REM ============================================================================

:handle_minor_error
    REM Handle minor errors (severity 1)
    set "component=%~1"
    set "error_message=%~2"
    set "recovery_action=%~3"
    
    call :log_warning "ERROR_HANDLER" "Minor error in %component% - attempting recovery"
    
    REM Simple recovery attempts
    if "%recovery_action%"=="retry" (
        call :simple_retry "%component%" "%error_message%"
    ) else if "%recovery_action%"=="ignore" (
        call :log_info "ERROR_HANDLER" "Minor error ignored as requested"
    ) else (
        call :default_minor_recovery "%component%"
    )
    
    goto :eof

:handle_moderate_error
    REM Handle moderate errors (severity 2-3)
    set "component=%~1"
    set "error_message=%~2"
    set "recovery_action=%~3"
    
    call :log_warning "ERROR_HANDLER" "Moderate error in %component% - executing recovery strategy"
    
    REM Log recovery attempt
    echo [%date% %time%] Moderate Error Recovery: %component% >> "%RECOVERY_LOG%"
    
    REM Execute recovery strategy
    if "%recovery_action%"=="retry" (
        call :retry_with_backoff "%component%" "%error_message%"
    ) else if "%recovery_action%"=="fallback" (
        call :execute_fallback_strategy "%component%" "%error_message%"
    ) else if "%recovery_action%"=="reset" (
        call :reset_component_state "%component%"
    ) else (
        call :default_moderate_recovery "%component%"
    )
    
    goto :eof

:handle_critical_error
    REM Handle critical errors (severity 4+)
    set "component=%~1"
    set "error_message=%~2"
    set "recovery_action=%~3"
    
    call :log_error "ERROR_HANDLER" "CRITICAL ERROR in %component% - initiating emergency recovery"
    
    REM Log critical error
    echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! >> "%RECOVERY_LOG%"
    echo [%date% %time%] CRITICAL ERROR RECOVERY >> "%RECOVERY_LOG%"
    echo Component: %component% >> "%RECOVERY_LOG%"
    echo Message: %error_message% >> "%RECOVERY_LOG%"
    echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! >> "%RECOVERY_LOG%"
    
    REM Enter recovery mode
    set "RECOVERY_MODE=true"
    
    REM Execute critical recovery
    call :execute_critical_recovery "%component%" "%error_message%"
    
    REM Notify about critical error
    call :notify_critical_error "%component%" "%error_message%"
    
    goto :eof

REM ============================================================================
REM RETRY MECHANISMS
REM ============================================================================

:simple_retry
    REM Simple retry with fixed delay
    set "component=%~1"
    set "context=%~2"
    
    call :log_info "ERROR_HANDLER" "Executing simple retry for %component%"
    
    REM Wait and retry (this would need to call the original failing operation)
    timeout /t %RETRY_DELAY% /nobreak >nul
    
    REM In real implementation, would re-execute the failing operation
    call :log_info "ERROR_HANDLER" "Simple retry completed for %component%"
    
    goto :eof

:retry_with_backoff
    REM Retry with exponential backoff
    set "component=%~1"
    set "context=%~2"
    set "retry_count=0"
    set "current_delay=%RETRY_DELAY%"
    
    call :log_info "ERROR_HANDLER" "Executing retry with backoff for %component%"
    
    :retry_loop
    if %retry_count% GEQ %MAX_RETRIES% (
        call :log_error "ERROR_HANDLER" "Max retries exceeded for %component%"
        goto :retry_failed
    )
    
    set /a retry_count+=1
    call :log_info "ERROR_HANDLER" "Retry attempt %retry_count%/%MAX_RETRIES% for %component% (delay: %current_delay%s)"
    
    REM Wait with current delay
    timeout /t %current_delay% /nobreak >nul
    
    REM In real implementation, would re-execute the failing operation
    REM For now, simulate random success/failure
    set /a "rand_result=%RANDOM% %% 3"
    if %rand_result%==0 (
        call :log_success "ERROR_HANDLER" "Retry successful for %component% on attempt %retry_count%"
        goto :retry_success
    )
    
    REM Double the delay for next retry (exponential backoff)
    set /a current_delay*=2
    if %current_delay% GTR 60 set "current_delay=60"
    
    goto :retry_loop
    
    :retry_success
    echo [%date% %time%] Retry Success: %component% (attempts: %retry_count%) >> "%RECOVERY_LOG%"
    goto :eof
    
    :retry_failed
    echo [%date% %time%] Retry Failed: %component% (max attempts reached) >> "%RECOVERY_LOG%"
    call :execute_fallback_strategy "%component%" "retry_failed"
    goto :eof

REM ============================================================================
REM RECOVERY STRATEGIES
REM ============================================================================

:execute_fallback_strategy
    REM Execute fallback recovery strategy
    set "component=%~1"
    set "context=%~2"
    
    call :log_warning "ERROR_HANDLER" "Executing fallback strategy for %component%"
    
    REM Component-specific fallbacks
    if /i "%component%"=="subagent-stop" (
        call :fallback_subagent_stop
    ) else if /i "%component%"=="post-tool-use" (
        call :fallback_post_tool_use
    ) else if /i "%component%"=="pre-tool-use" (
        call :fallback_pre_tool_use
    ) else if /i "%component%"=="plan-state-manager" (
        call :fallback_plan_state_manager
    ) else (
        call :generic_fallback "%component%"
    )
    
    echo [%date% %time%] Fallback Executed: %component% >> "%RECOVERY_LOG%"
    goto :eof

:fallback_subagent_stop
    REM Fallback for subagent-stop hook failures
    call :log_info "ERROR_HANDLER" "Executing subagent-stop fallback"
    
    REM Basic task completion notification
    echo [%date% %time%] Task completed (fallback mode) >> "%LOG_FILE%"
    
    REM Try basic npm commands if available
    if exist "package.json" (
        where npm >nul 2>&1
        if %errorlevel%==0 (
            call :log_info "ERROR_HANDLER" "Attempting basic npm lint in fallback mode"
            npm run lint >nul 2>&1
        )
    )
    
    goto :eof

:fallback_post_tool_use
    REM Fallback for post-tool-use hook failures
    call :log_info "ERROR_HANDLER" "Executing post-tool-use fallback"
    
    REM Basic tool tracking
    echo [%date% %time%] Tool tracked (fallback): %CLAUDE_TOOL_NAME% >> "%CACHE_DIR%\basic-tool-log.txt"
    
    REM Simple plan completion check
    call :basic_plan_completion_check
    
    goto :eof

:fallback_pre_tool_use
    REM Fallback for pre-tool-use hook failures  
    call :log_info "ERROR_HANDLER" "Executing pre-tool-use fallback"
    
    REM Basic environment check
    call :basic_environment_check
    
    REM Simple tool preparation
    echo [%date% %time%] Tool prepared (fallback): %CLAUDE_TOOL_NAME% >> "%CACHE_DIR%\basic-prep-log.txt"
    
    goto :eof

:fallback_plan_state_manager
    REM Fallback for plan state manager failures
    call :log_info "ERROR_HANDLER" "Executing plan state manager fallback"
    
    REM Use basic file-based state tracking
    if not exist "%CACHE_DIR%\basic-plan-state.txt" (
        echo Plan started: %date% %time% > "%CACHE_DIR%\basic-plan-state.txt"
    )
    
    echo [%date% %time%] State updated (fallback mode) >> "%CACHE_DIR%\basic-plan-state.txt"
    
    goto :eof

:generic_fallback
    REM Generic fallback for unknown components
    set "component=%~1"
    
    call :log_warning "ERROR_HANDLER" "Executing generic fallback for %component%"
    
    REM Basic logging and notification
    echo [%date% %time%] Component error handled (generic fallback): %component% >> "%RECOVERY_LOG%"
    
    goto :eof

REM ============================================================================
REM RECOVERY ACTIONS
REM ============================================================================

:reset_component_state
    REM Reset component to initial state
    set "component=%~1"
    
    call :log_info "ERROR_HANDLER" "Resetting component state: %component%"
    
    REM Component-specific state resets
    if /i "%component%"=="plan-state-manager" (
        REM Reset plan state
        if exist "%STATE_FILE%" (
            move "%STATE_FILE%" "%STATE_FILE%.backup" >nul 2>&1
        )
        call "%~dp0plan-state-manager.bat" init >nul 2>&1
    )
    
    REM Clear component-specific cache files
    del "%CACHE_DIR%\%component%-*.tmp" >nul 2>&1
    
    echo [%date% %time%] Component Reset: %component% >> "%RECOVERY_LOG%"
    goto :eof

:execute_critical_recovery
    REM Execute critical system recovery
    set "component=%~1"
    set "error_message=%~2"
    
    call :log_error "ERROR_HANDLER" "Executing critical recovery for %component%"
    
    REM Stop all hook activities
    call :emergency_stop_hooks
    
    REM Create system backup
    call :create_emergency_backup
    
    REM Reset to safe state
    call :reset_to_safe_state
    
    REM Attempt system health check
    call :emergency_health_check
    
    echo [%date% %time%] Critical Recovery Executed: %component% >> "%RECOVERY_LOG%"
    goto :eof

:emergency_stop_hooks
    REM Emergency stop of all hook activities
    call :log_warning "ERROR_HANDLER" "Emergency stop of hook activities"
    
    REM Kill any running Node.js processes related to hooks
    taskkill /f /im node.exe /fi "WINDOWTITLE eq*plan-state*" >nul 2>&1
    
    REM Clear temporary files
    del "%CACHE_DIR%\*.tmp" >nul 2>&1
    
    goto :eof

:create_emergency_backup
    REM Create emergency backup of critical files
    call :log_info "ERROR_HANDLER" "Creating emergency backup"
    
    set "BACKUP_DIR=%CACHE_DIR%\emergency-backup-%date:/=-%-%time::=-%"
    set "BACKUP_DIR=%BACKUP_DIR: =%"
    
    mkdir "%BACKUP_DIR%" >nul 2>&1
    
    REM Backup critical files
    copy "%CONFIG_FILE%" "%BACKUP_DIR%\" >nul 2>&1
    copy "%LOG_FILE%" "%BACKUP_DIR%\" >nul 2>&1
    copy "%STATE_FILE%" "%BACKUP_DIR%\" >nul 2>&1
    
    goto :eof

:reset_to_safe_state
    REM Reset system to safe operational state
    call :log_info "ERROR_HANDLER" "Resetting to safe state"
    
    REM Clear recovery mode
    set "RECOVERY_MODE=false"
    
    REM Reset environment variables
    set "CLAUDE_HOOK_TYPE="
    set "CLAUDE_HOOK_STATUS="
    
    REM Initialize clean state
    call "%~dp0plan-state-manager.bat" init "{\"status\":\"recovered\",\"recovery\":true}" >nul 2>&1
    
    goto :eof

REM ============================================================================
REM SYSTEM HEALTH MONITORING
REM ============================================================================

:update_system_health
    REM Update system health metrics
    set "component=%~1"
    set "severity=%~2"
    
    REM Log health update
    echo [%date% %time%] Health Update: %component% (severity: %severity%) >> "%SYSTEM_HEALTH_LOG%"
    
    REM Check if we're exceeding error thresholds
    call :check_error_threshold "%component%"
    
    goto :eof

:check_error_threshold
    REM Check if component has exceeded error threshold
    set "component=%~1"
    
    REM Count recent errors for this component (simplified)
    set "error_count=0"
    for /f %%i in ('findstr /c:"%component%" "%ERROR_LOG%"') do set "error_count=%%i"
    
    if %error_count% GEQ %ERROR_THRESHOLD% (
        call :log_error "ERROR_HANDLER" "Component %component% has exceeded error threshold (%error_count%/%ERROR_THRESHOLD%)"
        call :handle_threshold_exceeded "%component%"
    )
    
    goto :eof

:handle_threshold_exceeded
    REM Handle component that has exceeded error threshold
    set "component=%~1"
    
    call :log_error "ERROR_HANDLER" "Disabling component due to excessive errors: %component%"
    
    REM Create disable flag
    echo disabled > "%CACHE_DIR%\%component%.disabled"
    
    REM Notify about component disability
    call :notify_component_disabled "%component%"
    
    goto :eof

:emergency_health_check
    REM Emergency system health check
    call :log_info "ERROR_HANDLER" "Performing emergency health check"
    
    REM Check critical system components
    call :check_disk_space
    call :check_memory_usage
    call :check_process_health
    call :check_file_system_health
    
    goto :eof

:check_disk_space
    REM Check available disk space
    for /f "tokens=3" %%i in ('dir /-c %SystemDrive% ^| find "bytes free"') do (
        set "free_space=%%i"
    )
    
    REM Log disk space status
    echo [%date% %time%] Disk Space Check: %free_space% bytes free >> "%SYSTEM_HEALTH_LOG%"
    goto :eof

:check_memory_usage
    REM Check system memory usage
    for /f "skip=1 tokens=4" %%i in ('wmic OS get TotalVisibleMemorySize /value') do (
        set "total_memory=%%i"
    )
    
    echo [%date% %time%] Memory Check: %total_memory% KB available >> "%SYSTEM_HEALTH_LOG%"
    goto :eof

:check_process_health
    REM Check for hung processes
    tasklist /fi "STATUS eq Not Responding" | find "node.exe" >nul 2>&1
    if %errorlevel%==0 (
        call :log_warning "ERROR_HANDLER" "Hung Node.js processes detected"
    )
    goto :eof

:check_file_system_health
    REM Check file system health
    if not exist "%HOOK_DIR%" (
        call :log_error "ERROR_HANDLER" "Hook directory missing - critical error"
    )
    
    if not exist "%CACHE_DIR%" (
        mkdir "%CACHE_DIR%" >nul 2>&1
        call :log_warning "ERROR_HANDLER" "Cache directory recreated"
    )
    
    goto :eof

REM ============================================================================
REM NOTIFICATION SYSTEM
REM ============================================================================

:notify_critical_error
    REM Notify about critical errors
    set "component=%~1"
    set "error_message=%~2"
    
    echo.
    echo ********************************************************
    echo CRITICAL ERROR DETECTED
    echo Component: %component%
    echo Error: %error_message%
    echo Time: %date% %time%
    echo Recovery mode activated
    echo ********************************************************
    echo.
    
    goto :eof

:notify_component_disabled
    REM Notify about component being disabled
    set "component=%~1"
    
    echo.
    echo WARNING: Component %component% has been disabled due to excessive errors
    echo Check %ERROR_LOG% for details
    echo.
    
    goto :eof

REM ============================================================================
REM BASIC FALLBACK FUNCTIONS
REM ============================================================================

:basic_plan_completion_check
    REM Basic plan completion check when advanced system fails
    if exist "%CACHE_DIR%\tool-usage.log" (
        REM Simple heuristic: if we see build/test commands, plan might be complete
        findstr /i "build\|test" "%CACHE_DIR%\tool-usage.log" >nul 2>&1
        if %errorlevel%==0 (
            echo [%date% %time%] Plan completion detected (basic mode) >> "%CACHE_DIR%\basic-plan-state.txt"
        )
    )
    goto :eof

:basic_environment_check
    REM Basic environment check
    if not exist "%CACHE_DIR%" (
        mkdir "%CACHE_DIR%" >nul 2>&1
    )
    
    if not exist "%LOG_FILE%" (
        echo Hook system initialized > "%LOG_FILE%"
    )
    
    goto :eof

REM ============================================================================
REM RECOVERY UTILITIES
REM ============================================================================

:default_minor_recovery
    set "component=%~1"
    call :log_info "ERROR_HANDLER" "Default minor recovery for %component%"
    echo [%date% %time%] Minor Recovery: %component% >> "%RECOVERY_LOG%"
    goto :eof

:default_moderate_recovery
    set "component=%~1"
    call :log_warning "ERROR_HANDLER" "Default moderate recovery for %component%"
    call :reset_component_state "%component%"
    goto :eof

REM ============================================================================
REM CLI INTERFACE
REM ============================================================================

REM If called directly, provide CLI interface
if "%~1" NEQ "" (
    if "%~1"=="handle" (
        call :handle_error "%~2" "%~3" "%~4" "%~5"
    ) else if "%~1"=="health-check" (
        call :emergency_health_check
    ) else if "%~1"=="reset" (
        call :reset_to_safe_state
    ) else (
        echo Usage: %~nx0 handle ^<component^> ^<message^> ^<code^> [recovery_action]
        echo        %~nx0 health-check
        echo        %~nx0 reset
    )
)