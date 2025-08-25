@echo off
REM Claude Code Archon Status Hook - Auto-update Archon MCP task status
REM Version: 1.0.0 - ARCHON-FIRST RULE Implementation

REM Load shared utilities
call "%~dp0hook-commons.bat"

REM Parse environment variables
set "TOOL_NAME=%CLAUDE_TOOL_NAME%"
set "TOOL_RESULT=%CLAUDE_TOOL_RESULT%"
set "TOOL_PARAMS=%CLAUDE_TOOL_PARAMS%"
if "%TOOL_NAME%"=="" set "TOOL_NAME=unknown"
if "%TOOL_RESULT%"=="" set "TOOL_RESULT=success"

REM Track hook performance
call :track_performance "ARCHON_STATUS_START:%TOOL_NAME%:%TOOL_RESULT%"

REM Main execution flow
:main_execution
    call :check_archon_integration
    if %errorlevel%==1 (
        call :process_archon_status_update
    )
    goto :cleanup_and_exit

REM Check if this tool execution should trigger Archon status updates
:check_archon_integration
    REM Only process successful tool executions
    if /i "%TOOL_RESULT%" NEQ "success" (
        call :log_info "ARCHON_STATUS" "Skipping - tool result: %TOOL_RESULT%"
        exit /b 0
    )
    
    REM Check for task management related tools
    if /i "%TOOL_NAME%"=="Task" goto :archon_relevant
    if /i "%TOOL_NAME%"=="TodoWrite" goto :archon_relevant
    if /i "%TOOL_NAME%"=="ExitPlanMode" goto :archon_relevant
    
    REM Check for implementation tools (indicate task progress)
    if /i "%TOOL_NAME%"=="write_file" goto :implementation_progress
    if /i "%TOOL_NAME%"=="edit_block" goto :implementation_progress
    if /i "%TOOL_NAME%"=="replace_symbol_body" goto :implementation_progress
    if /i "%TOOL_NAME%"=="start_process" goto :implementation_progress
    
    REM Check for research tools (indicate task research phase)
    if /i "%TOOL_NAME%"=="perform_rag_query" goto :research_progress
    if /i "%TOOL_NAME%"=="search_code_examples" goto :research_progress
    if /i "%TOOL_NAME%"=="get-library-docs" goto :research_progress
    
    REM Check for validation tools (indicate task review phase)
    if /i "%TOOL_NAME%"=="execute_sql" goto :validation_progress
    if /i "%TOOL_NAME%"=="list_tables" goto :validation_progress
    if /i "%TOOL_NAME%"=="get_advisors" goto :validation_progress
    
    REM Skip for other tool types
    call :log_info "ARCHON_STATUS" "No Archon integration needed for: %TOOL_NAME%"
    exit /b 0

:archon_relevant
    call :log_info "ARCHON_STATUS" "Archon-relevant tool detected: %TOOL_NAME%"
    exit /b 1

:implementation_progress  
    call :log_info "ARCHON_STATUS" "Implementation progress detected: %TOOL_NAME%"
    exit /b 1

:research_progress
    call :log_info "ARCHON_STATUS" "Research progress detected: %TOOL_NAME%"
    exit /b 1

:validation_progress
    call :log_info "ARCHON_STATUS" "Validation progress detected: %TOOL_NAME%"
    exit /b 1

REM Process Archon MCP status updates based on tool usage patterns
:process_archon_status_update
    call :log_info "ARCHON_STATUS" "Processing Archon status update"
    
    REM Load or initialize task state
    call :load_task_state
    
    REM Determine status update based on tool pattern
    call :analyze_tool_pattern
    
    REM Execute status update if needed
    if defined ARCHON_STATUS_UPDATE (
        call :execute_archon_status_update
    )
    
    REM Update task tracking state
    call :update_task_state
    
    goto :eof

REM Load current task state from cache
:load_task_state
    set "task_state_file=%CACHE_DIR%\archon-task-state.json"
    set "CURRENT_TASK_ID="
    set "CURRENT_TASK_STATUS="
    set "CURRENT_PROJECT_ID="
    
    if exist "%task_state_file%" (
        REM Parse basic task state (simplified JSON parsing)
        for /f "usebackq tokens=2 delims=:," %%i in (`findstr "task_id" "%task_state_file%"`) do (
            set "CURRENT_TASK_ID=%%i"
            set "CURRENT_TASK_ID=!CURRENT_TASK_ID:"=!"
            set "CURRENT_TASK_ID=!CURRENT_TASK_ID: =!"
        )
        
        for /f "usebackq tokens=2 delims=:," %%i in (`findstr "status" "%task_state_file%"`) do (
            set "CURRENT_TASK_STATUS=%%i"
            set "CURRENT_TASK_STATUS=!CURRENT_TASK_STATUS:"=!"
            set "CURRENT_TASK_STATUS=!CURRENT_TASK_STATUS: =!"
        )
        
        call :log_info "ARCHON_STATE" "Loaded task state: %CURRENT_TASK_ID% (%CURRENT_TASK_STATUS%)"
    ) else (
        call :log_info "ARCHON_STATE" "No existing task state - will auto-detect"
    )
    
    goto :eof

REM Analyze tool usage pattern to determine status update needed
:analyze_tool_pattern
    set "ARCHON_STATUS_UPDATE="
    set "UPDATE_REASON="
    
    REM Task management tools
    if /i "%TOOL_NAME%"=="Task" (
        call :analyze_task_tool_usage
        goto :eof
    )
    
    REM Research phase detection
    if /i "%TOOL_NAME%"=="perform_rag_query" (
        call :detect_research_phase
        goto :eof
    )
    
    if /i "%TOOL_NAME%"=="search_code_examples" (
        call :detect_research_phase  
        goto :eof
    )
    
    REM Implementation phase detection
    if /i "%TOOL_NAME%"=="write_file" (
        call :detect_implementation_phase
        goto :eof
    )
    
    if /i "%TOOL_NAME%"=="edit_block" (
        call :detect_implementation_phase
        goto :eof
    )
    
    REM Validation phase detection
    if /i "%TOOL_NAME%"=="execute_sql" (
        call :detect_validation_phase
        goto :eof
    )
    
    REM Plan completion detection
    if /i "%TOOL_NAME%"=="ExitPlanMode" (
        set "ARCHON_STATUS_UPDATE=review"
        set "UPDATE_REASON=Plan completed - ready for review"
        call :log_info "ARCHON_ANALYSIS" "Plan completion detected"
        goto :eof
    )
    
    goto :eof

REM Analyze Task tool usage for direct task management
:analyze_task_tool_usage
    REM Check if this was a task status update
    echo %TOOL_PARAMS% | findstr /i "status.*doing" >nul
    if %errorlevel%==0 (
        set "ARCHON_STATUS_UPDATE=doing"
        set "UPDATE_REASON=Task marked as doing via Task tool"
        call :log_info "ARCHON_ANALYSIS" "Direct task status update to doing"
        goto :eof
    )
    
    echo %TOOL_PARAMS% | findstr /i "status.*review" >nul
    if %errorlevel%==0 (
        set "ARCHON_STATUS_UPDATE=review"
        set "UPDATE_REASON=Task marked as review via Task tool"
        call :log_info "ARCHON_ANALYSIS" "Direct task status update to review"
        goto :eof
    )
    
    echo %TOOL_PARAMS% | findstr /i "status.*done" >nul
    if %errorlevel%==0 (
        set "ARCHON_STATUS_UPDATE=done"
        set "UPDATE_REASON=Task marked as done via Task tool"
        call :log_info "ARCHON_ANALYSIS" "Direct task status update to done"
        goto :eof
    )
    
    goto :eof

REM Detect research phase and update to doing if needed
:detect_research_phase
    if /i "%CURRENT_TASK_STATUS%"=="todo" (
        set "ARCHON_STATUS_UPDATE=doing"
        set "UPDATE_REASON=Research phase detected - task in progress"
        call :log_info "ARCHON_ANALYSIS" "Research phase - updating todo to doing"
    ) else (
        call :log_info "ARCHON_ANALYSIS" "Research activity in current task (%CURRENT_TASK_STATUS%)"
    )
    goto :eof

REM Detect implementation phase
:detect_implementation_phase
    if /i "%CURRENT_TASK_STATUS%"=="todo" (
        set "ARCHON_STATUS_UPDATE=doing"
        set "UPDATE_REASON=Implementation phase detected - task in progress"
        call :log_info "ARCHON_ANALYSIS" "Implementation phase - updating todo to doing"
    ) else if /i "%CURRENT_TASK_STATUS%"=="" (
        set "ARCHON_STATUS_UPDATE=doing"
        set "UPDATE_REASON=Implementation activity detected - assuming task in progress"
        call :log_info "ARCHON_ANALYSIS" "Implementation phase - assuming doing status"
    ) else (
        call :log_info "ARCHON_ANALYSIS" "Implementation activity in current task (%CURRENT_TASK_STATUS%)"
    )
    goto :eof

REM Detect validation/testing phase
:detect_validation_phase
    if /i "%CURRENT_TASK_STATUS%"=="doing" (
        call :check_validation_completion
        if %errorlevel%==1 (
            set "ARCHON_STATUS_UPDATE=review"
            set "UPDATE_REASON=Validation phase completed - ready for review"
            call :log_info "ARCHON_ANALYSIS" "Validation complete - updating doing to review"
        )
    ) else (
        call :log_info "ARCHON_ANALYSIS" "Validation activity in current task (%CURRENT_TASK_STATUS%)"
    )
    goto :eof

REM Check if validation activities indicate task completion
:check_validation_completion
    REM Count recent validation activities
    set "validation_count=0"
    set "validation_log=%CACHE_DIR%\validation-activities.log"
    
    REM Check for multiple validation activities in recent history
    if exist "%validation_log%" (
        for /f %%i in ('findstr /c:"validation" "%validation_log%" ^| find /c /v ""') do set "validation_count=%%i"
    )
    
    REM Log current validation activity
    echo [%date% %time%] %TOOL_NAME% validation >> "%validation_log%"
    
    REM If enough validation activities, consider task ready for review
    if %validation_count% GEQ 2 (
        call :log_info "VALIDATION_CHECK" "Multiple validation activities detected (%validation_count%)"
        exit /b 1
    ) else (
        call :log_info "VALIDATION_CHECK" "Validation activity logged (%validation_count%)"
        exit /b 0
    )

REM Execute Archon MCP status update
:execute_archon_status_update
    call :log_info "ARCHON_UPDATE" "Executing status update: %ARCHON_STATUS_UPDATE%"
    call :log_info "ARCHON_UPDATE" "Reason: %UPDATE_REASON%"
    
    REM Prepare archon command parameters
    set "archon_cmd=archon:manage_task"
    set "archon_action=update"
    
    if defined CURRENT_TASK_ID (
        set "archon_task_id=%CURRENT_TASK_ID%"
    ) else (
        call :auto_detect_current_task
        if not defined AUTO_DETECTED_TASK_ID (
            call :log_warning "ARCHON_UPDATE" "No task ID available - skipping update"
            goto :eof
        )
        set "archon_task_id=%AUTO_DETECTED_TASK_ID%"
    )
    
    REM Execute the status update (simulated - would integrate with actual MCP)
    call :simulate_archon_mcp_call "%archon_cmd%" "%archon_action%" "%archon_task_id%" "%ARCHON_STATUS_UPDATE%"
    
    if %errorlevel%==0 (
        call :log_success "ARCHON_UPDATE" "Task %archon_task_id% updated to %ARCHON_STATUS_UPDATE%"
        
        REM Update local task state
        set "CURRENT_TASK_STATUS=%ARCHON_STATUS_UPDATE%"
        
        REM Log to Archon integration log
        call :log_archon_integration "%archon_task_id%" "%ARCHON_STATUS_UPDATE%" "%UPDATE_REASON%"
    ) else (
        call :log_warning "ARCHON_UPDATE" "Failed to update task status in Archon MCP"
    )
    
    goto :eof

REM Auto-detect current task from recent activity
:auto_detect_current_task
    set "AUTO_DETECTED_TASK_ID="
    set "recent_tasks_log=%CACHE_DIR%\recent-tasks.log"
    
    REM Check for recent task references in logs
    if exist "%recent_tasks_log%" (
        for /f "usebackq tokens=3" %%i in (`findstr "task-" "%recent_tasks_log%" ^| sort /r ^| head -1`) do (
            set "AUTO_DETECTED_TASK_ID=%%i"
        )
    )
    
    if defined AUTO_DETECTED_TASK_ID (
        call :log_info "AUTO_DETECT" "Auto-detected task: %AUTO_DETECTED_TASK_ID%"
    ) else (
        call :log_warning "AUTO_DETECT" "Could not auto-detect current task"
    )
    
    goto :eof

REM Simulate Archon MCP call (placeholder for actual integration)
:simulate_archon_mcp_call
    set "cmd=%~1"
    set "action=%~2" 
    set "task_id=%~3"
    set "new_status=%~4"
    
    call :log_info "ARCHON_MCP" "Simulating: %cmd%(%action%, %task_id%, %new_status%)"
    
    REM In actual implementation, this would make real MCP call
    REM For now, simulate success with logging
    set "mcp_log=%CACHE_DIR%\archon-mcp-calls.log"
    echo [%date% %time%] %cmd% action=%action% task_id=%task_id% status=%new_status% result=success >> "%mcp_log%"
    
    REM Simulate occasional failures for realistic testing
    set /a "random_fail=%RANDOM% %% 100"
    if %random_fail% LSS 5 (
        call :log_warning "ARCHON_MCP" "Simulated MCP call failure"
        exit /b 1
    )
    
    call :log_success "ARCHON_MCP" "MCP call successful"
    exit /b 0

REM Log Archon integration activity
:log_archon_integration
    set "task_id=%~1"
    set "new_status=%~2"
    set "reason=%~3"
    set "integration_log=%CACHE_DIR%\archon-integration.log"
    
    echo [%date% %time%] ARCHON_INTEGRATION task_id=%task_id% status=%new_status% reason="%reason%" tool=%TOOL_NAME% >> "%integration_log%"
    
    call :log_info "ARCHON_INTEGRATION" "Logged integration activity"
    goto :eof

REM Update task state cache
:update_task_state
    set "task_state_file=%CACHE_DIR%\archon-task-state.json"
    
    REM Create/update task state JSON (simplified)
    (
        echo {
        echo   "task_id": "%CURRENT_TASK_ID%",
        echo   "status": "%CURRENT_TASK_STATUS%",
        echo   "last_update": "%date% %time%",
        echo   "last_tool": "%TOOL_NAME%",
        echo   "last_update_reason": "%UPDATE_REASON%"
        echo }
    ) > "%task_state_file%"
    
    call :log_info "ARCHON_STATE" "Updated task state cache"
    goto :eof

REM Healthcare-specific task context awareness
:check_healthcare_context
    REM Check if current activity involves healthcare files
    set "healthcare_indicators=patient clinic medical audit lgpd anvisa cfm"
    set "healthcare_context=0"
    
    for %%h in (%healthcare_indicators%) do (
        echo %TOOL_PARAMS% | findstr /i "%%h" >nul
        if %errorlevel%==0 (
            set "healthcare_context=1"
            call :log_info "HEALTHCARE" "Healthcare context detected: %%h"
        )
    )
    
    if %healthcare_context%==1 (
        call :log_info "HEALTHCARE" "Enhanced Archon tracking for healthcare task"
        REM Could add healthcare-specific status tracking here
    )
    
    goto :eof

REM Integration with reality check validation
:integrate_reality_check
    REM Mark that Archon status update was executed
    set "reality_check_file=%CACHE_DIR%\reality-check-state.json"
    
    REM Update reality check state with Archon integration
    if defined ARCHON_STATUS_UPDATE (
        echo {"archon_integration": {"executed": true, "status_update": "%ARCHON_STATUS_UPDATE%", "timestamp": "%date% %time%"}} > "%reality_check_file%.archon"
        call :log_info "REALITY_CHECK" "Updated reality check with Archon integration"
    )
    
    goto :eof

REM PNPM project context for healthcare optimization
:check_pnpm_healthcare_context
    if exist "pnpm-lock.yaml" (
        call :log_info "PNPM" "PNPM healthcare project - enhanced Archon tracking"
        
        REM Check for healthcare-specific workspace configuration
        if exist "pnpm-workspace.yaml" (
            findstr /i "medical\|patient\|healthcare" pnpm-workspace.yaml >nul
            if %errorlevel%==0 (
                call :log_info "PNPM_HEALTHCARE" "Healthcare workspace detected in PNPM config"
            )
        )
    )
    
    goto :eof

REM Task-driven development workflow enforcement
:enforce_task_driven_workflow
    REM Ensure ARCHON-FIRST RULE compliance
    if /i "%TOOL_NAME%"=="TodoWrite" (
        if not defined CURRENT_TASK_ID (
            call :log_warning "ARCHON_FIRST" "VIOLATION: TodoWrite used before Archon task management"
            call :log_warning "ARCHON_FIRST" "Remember: ARCHON-FIRST RULE - use Archon before TodoWrite"
        )
    )
    
    goto :eof

:cleanup_and_exit
    REM Healthcare context check
    call :check_healthcare_context
    
    REM Reality check integration
    call :integrate_reality_check
    
    REM PNPM healthcare context
    call :check_pnpm_healthcare_context
    
    REM Workflow enforcement
    call :enforce_task_driven_workflow
    
    REM Cleanup temporary files
    call :cleanup_temp_files
    
    REM Track completion
    call :track_performance "ARCHON_STATUS_COMPLETE:%TOOL_NAME%"
    
    call :log_success "ARCHON_STATUS" "Archon status hook completed"
    exit /b 0