@echo off
REM Claude Code Sequential Thinking Hook - Complexity ≥3 trigger for constitutional thinking
REM Version: 1.0.0 - Meta-cognitive monitoring and complex problem detection

REM Load shared utilities
call "%~dp0hook-commons.bat"

REM Parse environment variables
set "TOOL_NAME=%CLAUDE_TOOL_NAME%"
set "TOOL_RESULT=%CLAUDE_TOOL_RESULT%"
set "TOOL_PARAMS=%CLAUDE_TOOL_PARAMS%"
if "%TOOL_NAME%"=="" set "TOOL_NAME=unknown"
if "%TOOL_RESULT%"=="" set "TOOL_RESULT=success"

REM Track hook performance
call :track_performance "SEQUENTIAL_THINKING_START:%TOOL_NAME%:%TOOL_RESULT%"

REM Main execution flow
:main_execution
    call :check_complexity_trigger
    if %errorlevel%==1 (
        call :evaluate_sequential_thinking_need
    )
    goto :cleanup_and_exit

REM Check if sequential thinking should be triggered based on complexity
:check_complexity_trigger
    REM Only process successful operations
    if /i "%TOOL_RESULT%" NEQ "success" (
        call :log_info "SEQUENTIAL_THINKING" "Skipping - tool result: %TOOL_RESULT%"
        exit /b 0
    )
    
    REM Check for tools that indicate complex problem-solving
    if /i "%TOOL_NAME%"=="Task" goto :check_task_complexity
    if /i "%TOOL_NAME%"=="create_project" goto :high_complexity
    if /i "%TOOL_NAME%"=="create_task" goto :check_task_creation_complexity
    
    REM Check for research tools (may indicate complex analysis needed)
    if /i "%TOOL_NAME%"=="perform_rag_query" goto :check_research_complexity
    if /i "%TOOL_NAME%"=="search_code_examples" goto :check_research_complexity
    if /i "%TOOL_NAME%"=="deep_researcher_start" goto :high_complexity
    
    REM Check for implementation complexity indicators
    if /i "%TOOL_NAME%"=="write_file" goto :check_implementation_complexity
    if /i "%TOOL_NAME%"=="edit_block" goto :check_implementation_complexity
    if /i "%TOOL_NAME%"=="apply_migration" goto :high_complexity
    
    REM Check for healthcare complexity indicators
    if /i "%TOOL_NAME%"=="execute_sql" goto :check_healthcare_complexity
    if /i "%TOOL_NAME%"=="deploy_edge_function" goto :medium_complexity
    
    REM Skip for simple operations
    call :log_info "SEQUENTIAL_THINKING" "No complexity trigger for: %TOOL_NAME%"
    exit /b 0

:check_task_complexity
    call :log_info "TASK_COMPLEXITY" "Analyzing task complexity"
    
    REM Check task parameters for complexity indicators
    call :analyze_task_parameters
    exit /b %errorlevel%

:check_task_creation_complexity
    call :log_info "TASK_CREATION" "Analyzing task creation complexity"
    
    REM New task creation often indicates planning complexity
    call :analyze_task_creation_parameters
    exit /b %errorlevel%

:check_research_complexity
    call :log_info "RESEARCH_COMPLEXITY" "Analyzing research complexity"
    
    REM Research queries may indicate complex problem analysis
    call :analyze_research_parameters
    exit /b %errorlevel%

:check_implementation_complexity
    call :log_info "IMPLEMENTATION_COMPLEXITY" "Analyzing implementation complexity"
    
    REM File modifications may indicate complex implementation
    call :analyze_implementation_parameters
    exit /b %errorlevel%

:check_healthcare_complexity
    call :log_info "HEALTHCARE_COMPLEXITY" "Analyzing healthcare complexity"
    
    REM Healthcare operations are inherently complex due to compliance
    call :analyze_healthcare_parameters
    exit /b %errorlevel%

:high_complexity
    call :log_info "COMPLEXITY_ASSESSMENT" "High complexity detected for: %TOOL_NAME%"
    exit /b 1

:medium_complexity
    call :log_info "COMPLEXITY_ASSESSMENT" "Medium complexity detected for: %TOOL_NAME%"
    exit /b 1

REM Analyze task parameters for complexity indicators
:analyze_task_parameters
    set "complexity_score=0"
    set "complexity_reasons="
    
    REM Check for multi-step task indicators
    echo %TOOL_PARAMS% | findstr /i "multi\|complex\|integration\|architecture" >nul
    if %errorlevel%==0 (
        set /a complexity_score+=2
        set "complexity_reasons=%complexity_reasons% multi-step-indicators"
    )
    
    REM Check for healthcare task indicators
    echo %TOOL_PARAMS% | findstr /i "patient\|clinic\|medical\|lgpd\|anvisa\|cfm" >nul
    if %errorlevel%==0 (
        set /a complexity_score+=2
        set "complexity_reasons=%complexity_reasons% healthcare-complexity"
    )
    
    REM Check for system integration indicators
    echo %TOOL_PARAMS% | findstr /i "database\|api\|service\|microservice" >nul
    if %errorlevel%==0 (
        set /a complexity_score+=1
        set "complexity_reasons=%complexity_reasons% system-integration"
    )
    
    REM Check for security/compliance indicators
    echo %TOOL_PARAMS% | findstr /i "security\|audit\|compliance\|encryption" >nul
    if %errorlevel%==0 (
        set /a complexity_score+=2
        set "complexity_reasons=%complexity_reasons% security-compliance"
    )
    
    call :log_info "TASK_ANALYSIS" "Complexity score: %complexity_score% - Reasons:%complexity_reasons%"
    
    REM Trigger if complexity ≥3
    if %complexity_score% GEQ 3 (
        call :log_info "TASK_ANALYSIS" "Complexity ≥3 detected - triggering sequential thinking"
        exit /b 1
    )
    
    exit /b 0

REM Analyze task creation parameters
:analyze_task_creation_parameters
    set "creation_complexity=0"
    
    REM New task creation indicates planning complexity
    set /a creation_complexity+=1
    
    REM Check for feature indicators
    echo %TOOL_PARAMS% | findstr /i "feature.*authentication\|feature.*payment\|feature.*workflow" >nul
    if %errorlevel%==0 (
        set /a creation_complexity+=2
        call :log_info "TASK_CREATION" "Complex feature detected"
    )
    
    REM Check for healthcare features
    echo %TOOL_PARAMS% | findstr /i "patient.*data\|medical.*record\|clinical.*workflow" >nul
    if %errorlevel%==0 (
        set /a creation_complexity+=2
        call :log_info "TASK_CREATION" "Healthcare feature detected"
    )
    
    if %creation_complexity% GEQ 3 (
        call :log_info "TASK_CREATION" "Complex task creation detected"
        exit /b 1
    )
    
    exit /b 0

REM Analyze research parameters
:analyze_research_parameters
    set "research_complexity=0"
    
    REM Research indicates analytical complexity
    set /a research_complexity+=1
    
    REM Check for complex research topics
    echo %TOOL_PARAMS% | findstr /i "architecture\|scalability\|performance\|security" >nul
    if %errorlevel%==0 (
        set /a research_complexity+=2
        call :log_info "RESEARCH_ANALYSIS" "Complex research topic detected"
    )
    
    REM Check for healthcare research
    echo %TOOL_PARAMS% | findstr /i "medical\|healthcare\|lgpd\|compliance" >nul
    if %errorlevel%==0 (
        set /a research_complexity+=2
        call :log_info "RESEARCH_ANALYSIS" "Healthcare research detected"
    )
    
    REM Check for multi-technology research
    echo %TOOL_PARAMS% | findstr /i "integration\|microservice\|distributed" >nul
    if %errorlevel%==0 (
        set /a research_complexity+=1
        call :log_info "RESEARCH_ANALYSIS" "Multi-technology research detected"
    )
    
    if %research_complexity% GEQ 3 (
        call :log_info "RESEARCH_ANALYSIS" "Complex research detected"
        exit /b 1
    )
    
    exit /b 0

REM Analyze implementation parameters
:analyze_implementation_parameters
    set "impl_complexity=0"
    
    REM Check file content for complexity indicators
    if defined CLAUDE_MODIFIED_FILES (
        echo %CLAUDE_MODIFIED_FILES% | findstr /i "\.config\.\|\.setup\.\|\.migration\." >nul
        if %errorlevel%==0 (
            set /a impl_complexity+=2
            call :log_info "IMPL_ANALYSIS" "Configuration/migration files detected"
        )
        
        echo %CLAUDE_MODIFIED_FILES% | findstr /i "service\|controller\|middleware" >nul
        if %errorlevel%==0 (
            set /a impl_complexity+=1
            call :log_info "IMPL_ANALYSIS" "Service architecture files detected"
        )
    )
    
    REM Check for database operations
    echo %TOOL_PARAMS% | findstr /i "database\|migration\|schema\|sql" >nul
    if %errorlevel%==0 (
        set /a impl_complexity+=2
        call :log_info "IMPL_ANALYSIS" "Database operations detected"
    )
    
    if %impl_complexity% GEQ 3 (
        call :log_info "IMPL_ANALYSIS" "Complex implementation detected"
        exit /b 1
    )
    
    exit /b 0

REM Analyze healthcare-specific complexity
:analyze_healthcare_parameters
    set "healthcare_complexity=0"
    
    REM Healthcare operations are inherently complex
    set /a healthcare_complexity+=2
    
    REM Check for specific healthcare complexity indicators
    echo %TOOL_PARAMS% | findstr /i "patient.*data\|medical.*record" >nul
    if %errorlevel%==0 (
        set /a healthcare_complexity+=2
        call :log_info "HEALTHCARE_ANALYSIS" "Patient data operations detected"
    )
    
    REM LGPD compliance adds complexity
    echo %TOOL_PARAMS% | findstr /i "lgpd\|consent\|privacy\|audit" >nul
    if %errorlevel%==0 (
        set /a healthcare_complexity+=1
        call :log_info "HEALTHCARE_ANALYSIS" "LGPD compliance operations detected"
    )
    
    REM Multi-tenant healthcare is complex
    echo %TOOL_PARAMS% | findstr /i "clinic.*isolation\|tenant.*data" >nul
    if %errorlevel%==0 (
        set /a healthcare_complexity+=1
        call :log_info "HEALTHCARE_ANALYSIS" "Multi-tenant healthcare detected"
    )
    
    if %healthcare_complexity% GEQ 3 (
        call :log_info "HEALTHCARE_ANALYSIS" "Complex healthcare operation detected"
        exit /b 1
    )
    
    exit /b 0

REM Evaluate if sequential thinking is needed
:evaluate_sequential_thinking_need
    call :log_info "SEQUENTIAL_THINKING" "Evaluating sequential thinking requirement"
    call :track_performance "SEQUENTIAL_EVALUATION_START"
    
    REM Load current thinking state
    call :load_thinking_state
    
    REM Check if sequential thinking was recently used
    call :check_recent_thinking_usage
    
    REM Determine thinking mode needed
    call :determine_thinking_mode
    
    REM Log sequential thinking recommendation
    call :recommend_sequential_thinking
    
    REM Update thinking state
    call :update_thinking_state
    
    call :track_performance "SEQUENTIAL_EVALUATION_COMPLETE"
    goto :eof

REM Load current thinking state from cache
:load_thinking_state
    set "thinking_state_file=%CACHE_DIR%\sequential-thinking-state.json"
    set "RECENT_THINKING=0"
    set "THINKING_MODE=basic"
    set "COMPLEXITY_LEVEL=1"
    
    if exist "%thinking_state_file%" (
        REM Parse thinking state (simplified)
        for /f "usebackq tokens=2 delims=:," %%i in (`findstr "recent_usage" "%thinking_state_file%"`) do (
            set "RECENT_THINKING=%%i"
            set "RECENT_THINKING=!RECENT_THINKING:"=!"
            set "RECENT_THINKING=!RECENT_THINKING: =!"
        )
        
        for /f "usebackq tokens=2 delims=:," %%i in (`findstr "complexity_level" "%thinking_state_file%"`) do (
            set "COMPLEXITY_LEVEL=%%i"
            set "COMPLEXITY_LEVEL=!COMPLEXITY_LEVEL:"=!"
            set "COMPLEXITY_LEVEL=!COMPLEXITY_LEVEL: =!"
        )
        
        call :log_info "THINKING_STATE" "Loaded state: recent=%RECENT_THINKING%, complexity=%COMPLEXITY_LEVEL%"
    ) else (
        call :log_info "THINKING_STATE" "No existing thinking state - initializing"
    )
    
    goto :eof

REM Check recent thinking usage patterns
:check_recent_thinking_usage
    set "thinking_log=%CACHE_DIR%\thinking-usage.log"
    set "recent_count=0"
    
    if exist "%thinking_log%" (
        REM Count recent thinking activities (last hour)
        for /f %%c in ('findstr /c:"SEQUENTIAL_THINKING" "%thinking_log%" ^| find /c /v ""') do (
            set "recent_count=%%c"
        )
    )
    
    if %recent_count% GTR 0 (
        set "RECENT_THINKING=1"
        call :log_info "THINKING_USAGE" "Recent sequential thinking detected: %recent_count% instances"
    ) else (
        call :log_info "THINKING_USAGE" "No recent sequential thinking detected"
    )
    
    goto :eof

REM Determine appropriate thinking mode based on complexity
:determine_thinking_mode
    REM Map complexity to thinking modes from CLAUDE.md
    if %COMPLEXITY_LEVEL% LEQ 3 (
        set "THINKING_MODE=basic"
        set "THINKING_DESCRIPTION=THINK - Basic reasoning for L1-L3 complexity"
    ) else if %COMPLEXITY_LEVEL% LEQ 7 (
        set "THINKING_MODE=enhanced"
        set "THINKING_DESCRIPTION=THINK_HARDER - Enhanced reasoning for L4-L7 complexity"
    ) else (
        set "THINKING_MODE=meta_cognitive"
        set "THINKING_DESCRIPTION=ULTRA_THINK - Meta-cognitive for L8-L10 complexity"
    )
    
    call :log_info "THINKING_MODE" "Determined mode: %THINKING_MODE% (%THINKING_DESCRIPTION%)"
    goto :eof

REM Recommend sequential thinking usage
:recommend_sequential_thinking
    call :log_info "SEQUENTIAL_RECOMMENDATION" "Generating sequential thinking recommendation"
    
    REM Create recommendation based on complexity and context
    set "recommendation_file=%CACHE_DIR%\sequential-thinking-recommendation.md"
    (
        echo # Sequential Thinking Recommendation
        echo ## Generated: %date% %time%
        echo ## Trigger: %TOOL_NAME% ^(%TOOL_RESULT%^)
        echo.
        echo ### Complexity Assessment
        echo - **Level**: %COMPLEXITY_LEVEL%/10
        echo - **Mode Recommended**: %THINKING_MODE%
        echo - **Description**: %THINKING_DESCRIPTION%
        echo.
        echo ### Reasoning
        if /i "%TOOL_NAME%"=="Task" (
            echo Complex task management detected. Sequential thinking recommended for:
            echo - Multi-step task planning and decomposition
            echo - Healthcare compliance consideration
            echo - Risk assessment and mitigation planning
        ) else if /i "%TOOL_NAME%"=="create_project" (
            echo Project creation complexity detected. Sequential thinking recommended for:
            echo - Architecture planning and design decisions
            echo - Technology stack evaluation
            echo - Healthcare compliance framework setup
        ) else if /i "%TOOL_NAME%"=="perform_rag_query" (
            echo Research complexity detected. Sequential thinking recommended for:
            echo - Multi-perspective analysis of research findings
            echo - Cross-validation of multiple sources
            echo - Healthcare-specific compliance considerations
        ) else (
            echo Complex operation detected. Sequential thinking recommended for:
            echo - Problem decomposition and systematic analysis
            echo - Multi-step solution planning
            echo - Quality and compliance validation
        )
        echo.
        echo ### Constitutional Framework Application
        echo Apply the 5-observer lens for comprehensive analysis:
        echo 1. **Technical**: Implementation viability + performance impact
        echo 2. **Security**: Vulnerability assessment + data protection
        echo 3. **User**: Experience quality + accessibility compliance
        echo 4. **Future**: Maintainability + scalability considerations
        echo 5. **Ethics**: Constitutional principles + regulatory alignment
        echo.
        if /i "%TOOL_NAME%"=="execute_sql" (
            echo ### Healthcare Enhancement
            echo Enhanced validation for medical applications:
            echo - LGPD compliance in data operations
            echo - Patient data protection protocols
            echo - Medical audit trail requirements
            echo - Multi-tenant data isolation validation
        )
    ) > "%recommendation_file%"
    
    if %RECENT_THINKING%==0 (
        call :log_success "SEQUENTIAL_RECOMMENDATION" "✓ Sequential thinking recommended for complexity %COMPLEXITY_LEVEL%"
    ) else (
        call :log_info "SEQUENTIAL_RECOMMENDATION" "Sequential thinking already in use - continued application recommended"
    )
    
    goto :eof

REM Update thinking state cache
:update_thinking_state
    set "thinking_state_file=%CACHE_DIR%\sequential-thinking-state.json"
    
    REM Update thinking state JSON
    (
        echo {
        echo   "last_trigger": "%TOOL_NAME%",
        echo   "last_update": "%date% %time%",
        echo   "complexity_level": %COMPLEXITY_LEVEL%,
        echo   "thinking_mode": "%THINKING_MODE%",
        echo   "recent_usage": 1,
        echo   "recommendation_generated": true
        echo }
    ) > "%thinking_state_file%"
    
    REM Log thinking usage
    set "thinking_log=%CACHE_DIR%\thinking-usage.log"
    echo [%date% %time%] SEQUENTIAL_THINKING_TRIGGER tool=%TOOL_NAME% complexity=%COMPLEXITY_LEVEL% mode=%THINKING_MODE% >> "%thinking_log%"
    
    call :log_info "THINKING_STATE" "Updated thinking state and usage log"
    goto :eof

REM Integration with constitutional framework
:apply_constitutional_framework
    call :log_info "CONSTITUTIONAL" "Applying constitutional framework for complex analysis"
    
    REM Create constitutional analysis template
    set "constitutional_file=%CACHE_DIR%\constitutional-analysis-template.md"
    (
        echo # Constitutional Analysis Framework
        echo ## For Complex Task: %TOOL_NAME%
        echo.
        echo ### 5-Observer Analysis
        echo.
        echo #### 1. Technical Observer
        echo - Implementation viability assessment
        echo - Performance impact evaluation
        echo - Architecture compatibility validation
        echo - Healthcare system integration considerations
        echo.
        echo #### 2. Security Observer
        echo - Vulnerability assessment and mitigation
        echo - Data protection protocol compliance
        echo - Patient data security validation
        echo - LGPD compliance verification
        echo.
        echo #### 3. User Observer
        echo - Experience quality and usability
        echo - Accessibility compliance ^(WCAG 2.1 AA+^)
        echo - Healthcare interface usability
        echo - Medical workflow efficiency
        echo.
        echo #### 4. Future Observer
        echo - Maintainability and code quality
        echo - Scalability considerations
        echo - Healthcare system evolution
        echo - Regulatory adaptation capability
        echo.
        echo #### 5. Ethics Observer
        echo - Constitutional principles alignment
        echo - Regulatory compliance ^(LGPD/ANVISA/CFM^)
        echo - Medical ethics compliance
        echo - Patient privacy and autonomy
        echo.
        echo ### Meta-Cognitive Monitoring
        echo - Strategy awareness and approach effectiveness
        echo - Progress tracking toward goals
        echo - Method success evaluation and adjustment
        echo - Confidence quantification and validation
    ) > "%constitutional_file%"
    
    call :log_success "CONSTITUTIONAL" "Constitutional framework template generated"
    goto :eof

REM Healthcare complexity awareness
:assess_healthcare_complexity_factors
    call :log_info "HEALTHCARE_COMPLEXITY" "Assessing healthcare-specific complexity factors"
    
    set "healthcare_factors=0"
    set "healthcare_reasons="
    
    REM Patient data complexity
    echo %TOOL_PARAMS% | findstr /i "patient" >nul
    if %errorlevel%==0 (
        set /a healthcare_factors+=2
        set "healthcare_reasons=%healthcare_reasons% patient-data"
    )
    
    REM LGPD compliance complexity
    echo %TOOL_PARAMS% | findstr /i "lgpd\|consent\|privacy" >nul
    if %errorlevel%==0 (
        set /a healthcare_factors+=2
        set "healthcare_reasons=%healthcare_reasons% lgpd-compliance"
    )
    
    REM Multi-tenant healthcare complexity
    echo %TOOL_PARAMS% | findstr /i "clinic\|tenant" >nul
    if %errorlevel%==0 (
        set /a healthcare_factors+=1
        set "healthcare_reasons=%healthcare_reasons% multi-tenant"
    )
    
    REM Audit trail complexity
    echo %TOOL_PARAMS% | findstr /i "audit\|trail\|logging" >nul
    if %errorlevel%==0 (
        set /a healthcare_factors+=1
        set "healthcare_reasons=%healthcare_reasons% audit-trail"
    )
    
    if %healthcare_factors% GTR 0 (
        call :log_info "HEALTHCARE_COMPLEXITY" "Healthcare factors: %healthcare_factors% - %healthcare_reasons%"
        set /a COMPLEXITY_LEVEL+=%healthcare_factors%
    )
    
    goto :eof

REM Integration with other systems
:integrate_with_quality_validation
    REM Sequential thinking integration with quality validation
    set "quality_integration_file=%CACHE_DIR%\quality-thinking-integration.json"
    
    echo {"sequential_thinking": {"triggered": true, "complexity": %COMPLEXITY_LEVEL%, "mode": "%THINKING_MODE%", "timestamp": "%date% %time%"}} > "%quality_integration_file%"
    
    call :log_info "QUALITY_INTEGRATION" "Updated quality validation with thinking requirements"
    goto :eof

:integrate_with_archon_tracking
    REM Log sequential thinking for Archon task tracking
    set "archon_thinking_log=%CACHE_DIR%\archon-thinking-integration.log"
    
    echo [%date% %time%] SEQUENTIAL_THINKING_TRIGGER tool=%TOOL_NAME% complexity=%COMPLEXITY_LEVEL% mode=%THINKING_MODE% healthcare_factors=%healthcare_factors% >> "%archon_thinking_log%"
    
    call :log_info "ARCHON_INTEGRATION" "Logged sequential thinking for task tracking"
    goto :eof

:integrate_with_reality_check
    REM Update reality check with thinking requirements
    set "reality_thinking_file=%CACHE_DIR%\reality-thinking-integration.json"
    
    echo {"thinking_required": true, "complexity_level": %COMPLEXITY_LEVEL%, "constitutional_framework": true} > "%reality_thinking_file%"
    
    call :log_info "REALITY_CHECK" "Updated reality check with thinking requirements"
    goto :eof

:cleanup_and_exit
    REM Apply constitutional framework for complex tasks
    if %COMPLEXITY_LEVEL% GEQ 3 (
        call :apply_constitutional_framework
    )
    
    REM Assess healthcare complexity
    call :assess_healthcare_complexity_factors
    
    REM System integrations
    call :integrate_with_quality_validation
    call :integrate_with_archon_tracking
    call :integrate_with_reality_check
    
    REM Cleanup temporary files
    call :cleanup_temp_files
    
    REM Track completion
    call :track_performance "SEQUENTIAL_THINKING_COMPLETE:%TOOL_NAME%"
    
    REM Log final status
    if %COMPLEXITY_LEVEL% GEQ 3 (
        call :log_success "SEQUENTIAL_THINKING" "✓ Sequential thinking triggered for complexity %COMPLEXITY_LEVEL% (%THINKING_MODE%)"
    ) else (
        call :log_info "SEQUENTIAL_THINKING" "Complexity %COMPLEXITY_LEVEL% - basic reasoning sufficient"
    )
    
    exit /b 0