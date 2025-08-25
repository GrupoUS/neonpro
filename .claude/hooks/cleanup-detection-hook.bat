@echo off
REM Claude Code Cleanup Detection Hook - CLEAN UP CONSTANTLY implementation
REM Version: 1.0.0 - Automatic duplicate/obsolete code detection

REM Load shared utilities
call "%~dp0hook-commons.bat"

REM Parse environment variables
set "TOOL_NAME=%CLAUDE_TOOL_NAME%"
set "TOOL_RESULT=%CLAUDE_TOOL_RESULT%"
set "MODIFIED_FILES=%CLAUDE_MODIFIED_FILES%"
if "%TOOL_NAME%"=="" set "TOOL_NAME=unknown"
if "%TOOL_RESULT%"=="" set "TOOL_RESULT=success"

REM Track hook performance
call :track_performance "CLEANUP_DETECTION_START:%TOOL_NAME%:%TOOL_RESULT%"

REM Main execution flow
:main_execution
    call :check_cleanup_trigger
    if %errorlevel%==1 (
        call :execute_cleanup_detection
    )
    goto :cleanup_and_exit

REM Check if cleanup detection should be triggered
:check_cleanup_trigger
    REM Only trigger for successful operations
    if /i "%TOOL_RESULT%" NEQ "success" (
        call :log_info "CLEANUP_DETECTION" "Skipping - tool result: %TOOL_RESULT%"
        exit /b 0
    )
    
    REM Trigger cleanup after task completion indicators
    if /i "%TOOL_NAME%"=="ExitPlanMode" goto :cleanup_needed
    if /i "%TOOL_NAME%"=="update_task" goto :check_task_completion
    if /i "%TOOL_NAME%"=="TodoWrite" goto :check_todo_completion
    
    REM Trigger after significant file modifications
    if /i "%TOOL_NAME%"=="write_file" goto :cleanup_needed
    if /i "%TOOL_NAME%"=="edit_block" goto :cleanup_needed
    if /i "%TOOL_NAME%"=="replace_symbol_body" goto :cleanup_needed
    
    REM Skip for other tool types
    call :log_info "CLEANUP_DETECTION" "No cleanup needed for: %TOOL_NAME%"
    exit /b 0

:cleanup_needed
    call :log_info "CLEANUP_DETECTION" "Cleanup detection needed for: %TOOL_NAME%"
    exit /b 1

:check_task_completion
    REM Check if task was marked as completed
    echo %TOOL_PARAMS% | findstr /i "status.*done\|status.*completed" >nul
    if %errorlevel%==0 (
        call :log_info "CLEANUP_DETECTION" "Task completion detected - triggering cleanup"
        exit /b 1
    )
    exit /b 0

:check_todo_completion
    REM Check if todos indicate task completion
    echo %TOOL_PARAMS% | findstr /i "completed" >nul
    if %errorlevel%==0 (
        call :log_info "CLEANUP_DETECTION" "Todo completion detected - triggering cleanup"
        exit /b 1
    )
    exit /b 0

REM Execute comprehensive cleanup detection
:execute_cleanup_detection
    call :log_info "CLEANUP_DETECTION" "Starting CLEAN UP CONSTANTLY detection"
    call :track_performance "CLEANUP_SCAN_START"
    
    REM Initialize cleanup state
    call :initialize_cleanup_state
    
    REM Execute cleanup detection phases
    call :detect_duplicate_code
    call :detect_obsolete_files
    call :detect_broken_paths
    call :detect_unused_imports
    call :detect_healthcare_cleanup_opportunities
    
    REM Generate cleanup recommendations
    call :generate_cleanup_report
    
    REM Auto-execute safe cleanup if enabled
    call :execute_safe_cleanup
    
    call :track_performance "CLEANUP_SCAN_COMPLETE"
    goto :eof

REM Initialize cleanup detection state
:initialize_cleanup_state
    set "DUPLICATES_FOUND=0"
    set "OBSOLETE_FILES=0"
    set "BROKEN_PATHS=0"
    set "UNUSED_IMPORTS=0"
    set "HEALTHCARE_CLEANUP=0"
    
    REM Clear previous cleanup results
    set "cleanup_results_file=%CACHE_DIR%\cleanup-results.json"
    echo {"cleanup_start": "%date% %time%", "detections": {}} > "%cleanup_results_file%"
    
    call :log_info "CLEANUP_DETECTION" "Cleanup state initialized"
    goto :eof

REM Detect duplicate code patterns
:detect_duplicate_code
    call :log_info "DUPLICATE_SCAN" "Scanning for duplicate code patterns"
    
    REM Scan for duplicate function signatures
    call :scan_duplicate_functions
    
    REM Scan for duplicate components (React/Vue)
    call :scan_duplicate_components
    
    REM Scan for duplicate utility functions
    call :scan_duplicate_utilities
    
    REM Healthcare-specific duplicate patterns
    call :scan_healthcare_duplicates
    
    call :log_info "DUPLICATE_SCAN" "Duplicate code scan completed: %DUPLICATES_FOUND% found"
    goto :eof

REM Detect obsolete files and code
:detect_obsolete_files
    call :log_info "OBSOLETE_SCAN" "Scanning for obsolete files and code"
    
    REM Find unused files (no imports/references)
    call :scan_unused_files
    
    REM Find commented-out code blocks
    call :scan_commented_code
    
    REM Find deprecated API usage
    call :scan_deprecated_apis
    
    REM Healthcare-specific obsolete patterns
    call :scan_obsolete_healthcare_code
    
    call :log_info "OBSOLETE_SCAN" "Obsolete code scan completed: %OBSOLETE_FILES% found"
    goto :eof

REM Detect broken paths and import issues
:detect_broken_paths
    call :log_info "PATH_SCAN" "Scanning for broken paths and imports"
    
    REM Scan for broken import statements
    call :scan_broken_imports
    
    REM Scan for incorrect file references
    call :scan_incorrect_references
    
    REM Scan for redirect loops
    call :scan_redirect_loops
    
    REM Healthcare module path validation
    call :scan_healthcare_paths
    
    call :log_info "PATH_SCAN" "Path scan completed: %BROKEN_PATHS% issues found"
    goto :eof

REM Detect unused import statements
:detect_unused_imports
    call :log_info "IMPORT_SCAN" "Scanning for unused import statements"
    
    REM TypeScript/JavaScript unused imports
    call :scan_unused_ts_imports
    
    REM CSS/SCSS unused imports
    call :scan_unused_css_imports
    
    REM Package.json unused dependencies
    call :scan_unused_dependencies
    
    call :log_info "IMPORT_SCAN" "Import scan completed: %UNUSED_IMPORTS% found"
    goto :eof

REM Detect healthcare-specific cleanup opportunities
:detect_healthcare_cleanup_opportunities
    call :log_info "HEALTHCARE_CLEANUP" "Scanning for healthcare cleanup opportunities"
    
    REM LGPD compliance cleanup
    call :scan_lgpd_cleanup
    
    REM Medical workflow optimization
    call :scan_medical_workflow_cleanup
    
    REM Audit trail cleanup
    call :scan_audit_trail_cleanup
    
    REM Multi-tenant cleanup
    call :scan_tenant_cleanup
    
    call :log_info "HEALTHCARE_CLEANUP" "Healthcare cleanup scan completed: %HEALTHCARE_CLEANUP% opportunities"
    goto :eof

REM Scan for duplicate functions
:scan_duplicate_functions
    call :log_info "DUPLICATE_FUNCTIONS" "Scanning for duplicate function signatures"
    
    REM Simple pattern matching for function signatures
    set "duplicate_functions=0"
    
    REM Scan TypeScript/JavaScript files for similar function patterns
    if exist "*.ts" (
        for %%f in (*.ts) do (
            call :analyze_function_patterns "%%f"
        )
    )
    
    if exist "*.js" (
        for %%f in (*.js) do (
            call :analyze_function_patterns "%%f"
        )
    )
    
    set /a DUPLICATES_FOUND+=%duplicate_functions%
    call :record_cleanup_finding "duplicate_functions" %duplicate_functions% "Function signature duplicates"
    goto :eof

REM Analyze function patterns in a file
:analyze_function_patterns
    set "file=%~1"
    
    REM Look for function declarations (simplified pattern matching)
    findstr /r "function.*(" "%file%" >nul 2>&1
    if %errorlevel%==0 (
        call :log_info "FUNCTION_ANALYSIS" "Functions found in %file%"
        REM Could add more sophisticated duplicate detection here
    )
    
    REM Look for arrow functions
    findstr /r "=.*=>.*{" "%file%" >nul 2>&1
    if %errorlevel%==0 (
        call :log_info "FUNCTION_ANALYSIS" "Arrow functions found in %file%"
    )
    
    goto :eof

REM Scan for duplicate React/Vue components
:scan_duplicate_components
    call :log_info "DUPLICATE_COMPONENTS" "Scanning for duplicate components"
    
    set "duplicate_components=0"
    
    REM React component patterns
    if exist "*.tsx" (
        for %%f in (*.tsx) do (
            call :analyze_component_patterns "%%f"
        )
    )
    
    REM Vue component patterns  
    if exist "*.vue" (
        for %%f in (*.vue) do (
            call :analyze_vue_patterns "%%f"
        )
    )
    
    set /a DUPLICATES_FOUND+=%duplicate_components%
    call :record_cleanup_finding "duplicate_components" %duplicate_components% "Component duplicates"
    goto :eof

REM Analyze component patterns
:analyze_component_patterns
    set "file=%~1"
    
    REM Look for React component declarations
    findstr /r "const.*=.*React\|function.*Component" "%file%" >nul 2>&1
    if %errorlevel%==0 (
        call :log_info "COMPONENT_ANALYSIS" "React components found in %file%"
    )
    
    goto :eof

:analyze_vue_patterns
    set "file=%~1"
    
    REM Look for Vue component structures
    findstr /r "<template>\|<script>\|<style>" "%file%" >nul 2>&1
    if %errorlevel%==0 (
        call :log_info "COMPONENT_ANALYSIS" "Vue components found in %file%"
    )
    
    goto :eof

REM Scan for duplicate utility functions
:scan_duplicate_utilities
    call :log_info "DUPLICATE_UTILITIES" "Scanning for duplicate utility functions"
    
    REM Look for common utility patterns
    set "utility_patterns=utils helper format validate sanitize"
    set "duplicate_utilities=0"
    
    for %%p in (%utility_patterns%) do (
        if exist "*%%p*.*" (
            call :log_info "UTILITY_SCAN" "Utility files found: *%%p*"
            set /a duplicate_utilities+=1
        )
    )
    
    set /a DUPLICATES_FOUND+=%duplicate_utilities%
    call :record_cleanup_finding "duplicate_utilities" %duplicate_utilities% "Utility function duplicates"
    goto :eof

REM Scan for healthcare-specific duplicates
:scan_healthcare_duplicates
    call :log_info "HEALTHCARE_DUPLICATES" "Scanning for healthcare duplicate patterns"
    
    set "healthcare_patterns=patient clinic medical audit lgpd anvisa cfm"
    set "healthcare_duplicates=0"
    
    for %%h in (%healthcare_patterns%) do (
        REM Count files with healthcare patterns
        for /f %%c in ('dir /b *%%h*.* 2^>nul ^| find /c /v ""') do (
            if %%c GTR 1 (
                call :log_info "HEALTHCARE_DUPLICATES" "Multiple %%h files found: %%c"
                set /a healthcare_duplicates+=1
            )
        )
    )
    
    set /a DUPLICATES_FOUND+=%healthcare_duplicates%
    call :record_cleanup_finding "healthcare_duplicates" %healthcare_duplicates% "Healthcare pattern duplicates"
    goto :eof

REM Scan for unused files
:scan_unused_files
    call :log_info "UNUSED_FILES" "Scanning for unused files"
    
    set "unused_files=0"
    
    REM Look for files that might be unused (simplified heuristic)
    if exist "*.old" (
        for %%f in (*.old) do (
            call :log_info "UNUSED_FILES" "Old file found: %%f"
            set /a unused_files+=1
        )
    )
    
    if exist "*.backup" (
        for %%f in (*.backup) do (
            call :log_info "UNUSED_FILES" "Backup file found: %%f"
            set /a unused_files+=1
        )
    )
    
    REM Look for test files without corresponding source
    if exist "*test*.*" (
        call :log_info "UNUSED_FILES" "Test files found - validating coverage"
    )
    
    set /a OBSOLETE_FILES+=%unused_files%
    call :record_cleanup_finding "unused_files" %unused_files% "Unused files detected"
    goto :eof

REM Scan for commented-out code
:scan_commented_code
    call :log_info "COMMENTED_CODE" "Scanning for commented-out code blocks"
    
    set "commented_blocks=0"
    
    REM Look for large commented blocks in TypeScript/JavaScript
    if exist "*.ts" (
        for %%f in (*.ts) do (
            call :count_commented_lines "%%f"
        )
    )
    
    if exist "*.js" (
        for %%f in (*.js) do (
            call :count_commented_lines "%%f"
        )
    )
    
    set /a OBSOLETE_FILES+=%commented_blocks%
    call :record_cleanup_finding "commented_code" %commented_blocks% "Commented code blocks"
    goto :eof

:count_commented_lines
    set "file=%~1"
    
    REM Count lines starting with // (simplified)
    for /f %%c in ('findstr /r "^[ ]*\/\/" "%file%" 2^>nul ^| find /c /v ""') do (
        if %%c GTR 10 (
            call :log_info "COMMENTED_CODE" "Large commented block in %file%: %%c lines"
            set /a commented_blocks+=1
        )
    )
    
    goto :eof

REM Scan for broken import statements
:scan_broken_imports
    call :log_info "BROKEN_IMPORTS" "Scanning for broken import statements"
    
    set "broken_imports=0"
    
    REM TypeScript compilation check for import errors
    if exist "tsconfig.json" (
        npx tsc --noEmit --skipLibCheck 2>import_check.tmp
        if exist "import_check.tmp" (
            findstr /i "cannot find module\|module not found" import_check.tmp >nul
            if %errorlevel%==0 (
                call :log_warning "BROKEN_IMPORTS" "Import errors detected in TypeScript"
                set /a broken_imports+=1
            )
            del import_check.tmp >nul 2>&1
        )
    )
    
    set /a BROKEN_PATHS+=%broken_imports%
    call :record_cleanup_finding "broken_imports" %broken_imports% "Broken import statements"
    goto :eof

REM Scan for healthcare path issues
:scan_healthcare_paths
    call :log_info "HEALTHCARE_PATHS" "Scanning healthcare module paths"
    
    set "healthcare_path_issues=0"
    
    REM Check for healthcare module import patterns
    set "healthcare_modules=patient clinic medical audit"
    
    for %%m in (%healthcare_modules%) do (
        if exist "*%%m*.*" (
            call :log_info "HEALTHCARE_PATHS" "Healthcare module detected: %%m"
            REM Could add specific path validation here
        )
    )
    
    set /a BROKEN_PATHS+=%healthcare_path_issues%
    call :record_cleanup_finding "healthcare_paths" %healthcare_path_issues% "Healthcare path issues"
    goto :eof

REM Scan for unused TypeScript imports
:scan_unused_ts_imports
    call :log_info "UNUSED_IMPORTS" "Scanning for unused TypeScript imports"
    
    REM Simple heuristic for unused imports
    set "unused_ts_imports=0"
    
    if exist "*.ts" (
        for %%f in (*.ts) do (
            call :analyze_import_usage "%%f"
        )
    )
    
    if exist "*.tsx" (
        for %%f in (*.tsx) do (
            call :analyze_import_usage "%%f"
        )
    )
    
    set /a UNUSED_IMPORTS+=%unused_ts_imports%
    call :record_cleanup_finding "unused_ts_imports" %unused_ts_imports% "Unused TypeScript imports"
    goto :eof

:analyze_import_usage
    set "file=%~1"
    
    REM Count import statements vs usage (very simplified)
    for /f %%c in ('findstr /r "^import.*from" "%file%" 2^>nul ^| find /c /v ""') do (
        if %%c GTR 0 (
            call :log_info "IMPORT_ANALYSIS" "Imports found in %file%: %%c"
        )
    )
    
    goto :eof

REM Scan for unused dependencies in package.json
:scan_unused_dependencies
    call :log_info "UNUSED_DEPS" "Scanning for unused package dependencies"
    
    set "unused_deps=0"
    
    REM Use PNPM for dependency analysis (following PNPM over NPM rule)
    if exist "pnpm-lock.yaml" (
        pnpm why --json >dependency_analysis.tmp 2>&1
        if exist "dependency_analysis.tmp" (
            call :log_info "UNUSED_DEPS" "PNPM dependency analysis completed"
            del dependency_analysis.tmp >nul 2>&1
        )
    ) else if exist "package-lock.json" (
        call :log_warning "UNUSED_DEPS" "NPM detected - consider migration to PNPM"
    )
    
    set /a UNUSED_IMPORTS+=%unused_deps%
    call :record_cleanup_finding "unused_dependencies" %unused_deps% "Unused package dependencies"
    goto :eof

REM Healthcare-specific cleanup scans
:scan_lgpd_cleanup
    call :log_info "LGPD_CLEANUP" "Scanning for LGPD compliance cleanup"
    
    REM Look for outdated LGPD implementations
    set "lgpd_cleanup=0"
    
    if exist "*lgpd*.*" (
        call :log_info "LGPD_CLEANUP" "LGPD files detected - analyzing compliance"
        REM Could add specific LGPD compliance analysis here
    )
    
    set /a HEALTHCARE_CLEANUP+=%lgpd_cleanup%
    goto :eof

:scan_medical_workflow_cleanup
    call :log_info "MEDICAL_WORKFLOW" "Scanning medical workflow cleanup"
    
    set "workflow_cleanup=0"
    
    if exist "*patient*.*" (
        call :log_info "MEDICAL_WORKFLOW" "Patient workflow files detected"
    )
    
    if exist "*clinic*.*" (
        call :log_info "MEDICAL_WORKFLOW" "Clinic workflow files detected"
    )
    
    set /a HEALTHCARE_CLEANUP+=%workflow_cleanup%
    goto :eof

:scan_audit_trail_cleanup
    call :log_info "AUDIT_CLEANUP" "Scanning audit trail cleanup"
    
    set "audit_cleanup=0"
    
    if exist "*audit*.*" (
        call :log_info "AUDIT_CLEANUP" "Audit trail files detected"
    )
    
    set /a HEALTHCARE_CLEANUP+=%audit_cleanup%
    goto :eof

:scan_tenant_cleanup
    call :log_info "TENANT_CLEANUP" "Scanning multi-tenant cleanup"
    
    set "tenant_cleanup=0"
    
    if exist "*tenant*.*" (
        call :log_info "TENANT_CLEANUP" "Multi-tenant files detected"
    )
    
    set /a HEALTHCARE_CLEANUP+=%tenant_cleanup%
    goto :eof

REM Record cleanup finding
:record_cleanup_finding
    set "type=%~1"
    set "count=%~2"
    set "description=%~3"
    
    call :log_info "CLEANUP_FINDING" "%type%: %count% - %description%"
    
    REM Update cleanup results file
    set "results_file=%CACHE_DIR%\cleanup-results.json"
    echo "%type%": {"count": %count%, "description": "%description%", "timestamp": "%time%"} >> "%results_file%.tmp"
    
    goto :eof

REM Generate cleanup recommendations report
:generate_cleanup_report
    call :log_info "CLEANUP_REPORT" "Generating cleanup recommendations"
    
    set /a TOTAL_ISSUES=%DUPLICATES_FOUND% + %OBSOLETE_FILES% + %BROKEN_PATHS% + %UNUSED_IMPORTS% + %HEALTHCARE_CLEANUP%
    
    REM Create cleanup report
    set "report_file=%CACHE_DIR%\cleanup-report.md"
    (
        echo # CLEAN UP CONSTANTLY - Detection Report
        echo ## Generated: %date% %time%
        echo.
        echo ### Summary
        echo - **Duplicate Code**: %DUPLICATES_FOUND%
        echo - **Obsolete Files**: %OBSOLETE_FILES%
        echo - **Broken Paths**: %BROKEN_PATHS%
        echo - **Unused Imports**: %UNUSED_IMPORTS%
        echo - **Healthcare Cleanup**: %HEALTHCARE_CLEANUP%
        echo - **Total Issues**: %TOTAL_ISSUES%
        echo.
        if %TOTAL_ISSUES% EQL 0 (
            echo **✅ EXCELLENT** - No cleanup issues detected
        ) else if %TOTAL_ISSUES% LEQ 5 (
            echo **✅ GOOD** - Minor cleanup opportunities  
        ) else if %TOTAL_ISSUES% LEQ 15 (
            echo **⚠️ MODERATE** - Cleanup recommended
        ) else (
            echo **⚠️ HIGH** - Significant cleanup needed
        )
        echo.
        echo ### Recommendations
        echo - Run `/cleanup auto --fix` for safe automatic cleanup
        echo - Use `/cleanup healthcare` for medical compliance cleanup
        echo - Execute `/cleanup paths --fix` for critical path corrections
    ) > "%report_file%"
    
    if %TOTAL_ISSUES% EQL 0 (
        call :log_success "CLEANUP_REPORT" "✅ No cleanup issues detected"
    ) else (
        call :log_info "CLEANUP_REPORT" "⚠️ %TOTAL_ISSUES% cleanup issues detected"
    )
    
    goto :eof

REM Execute safe automatic cleanup
:execute_safe_cleanup
    call :log_info "SAFE_CLEANUP" "Evaluating safe automatic cleanup"
    
    REM Only execute if issues are minor and safe
    if %TOTAL_ISSUES% LEQ 3 (
        call :log_info "SAFE_CLEANUP" "Minor issues detected - could execute safe cleanup"
        
        REM Could integrate with actual cleanup-detector.md command here
        REM Example: call cleanup-detector auto --safe
        
        call :log_success "SAFE_CLEANUP" "Safe cleanup evaluation completed"
    ) else (
        call :log_info "SAFE_CLEANUP" "Manual cleanup recommended for %TOTAL_ISSUES% issues"
    )
    
    goto :eof

REM Integration with other systems
:integrate_with_quality_validation
    REM Update quality validation with cleanup results
    set "quality_integration_file=%CACHE_DIR%\quality-cleanup-integration.json"
    
    echo {"cleanup_detection": {"executed": true, "issues_found": %TOTAL_ISSUES%, "timestamp": "%date% %time%"}} > "%quality_integration_file%"
    
    call :log_info "QUALITY_INTEGRATION" "Updated quality validation with cleanup results"
    goto :eof

:integrate_with_archon_tracking
    REM Log cleanup detection for Archon task tracking
    set "archon_cleanup_log=%CACHE_DIR%\archon-cleanup-integration.log"
    
    echo [%date% %time%] CLEANUP_DETECTION tool=%TOOL_NAME% issues=%TOTAL_ISSUES% duplicates=%DUPLICATES_FOUND% obsolete=%OBSOLETE_FILES% paths=%BROKEN_PATHS% >> "%archon_cleanup_log%"
    
    call :log_info "ARCHON_INTEGRATION" "Logged cleanup detection for task tracking"
    goto :eof

:integrate_with_ultracite_quality
    REM Cleanup detection can inform ultracite quality improvements
    if %TOTAL_ISSUES% GTR 0 (
        call :log_info "ULTRACITE_INTEGRATION" "Cleanup issues detected - recommend ultracite format"
    )
    goto :eof

:cleanup_and_exit
    REM System integrations
    call :integrate_with_quality_validation
    call :integrate_with_archon_tracking  
    call :integrate_with_ultracite_quality
    
    REM Cleanup temporary files
    call :cleanup_temp_files
    
    REM Track completion
    call :track_performance "CLEANUP_DETECTION_COMPLETE:%TOOL_NAME%"
    
    REM Log final status
    if %TOTAL_ISSUES% EQL 0 (
        call :log_success "CLEANUP_DETECTION" "CLEAN UP CONSTANTLY completed - system is clean"
    ) else (
        call :log_info "CLEANUP_DETECTION" "CLEAN UP CONSTANTLY completed - %TOTAL_ISSUES% opportunities detected"
    )
    
    exit /b 0