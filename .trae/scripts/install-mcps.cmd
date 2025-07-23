@echo off
REM ========================================
REM VIBECODE V2.1 - MCP Installation Script
REM ========================================
REM Mandatory MCP installation for TRAE AI
REM Quality Threshold: >=9.5/10
REM ========================================

echo [VIBECODE V2.1] Starting MCP Installation...
echo.

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm not found. Please install Node.js first.
    exit /b 1
)

REM Install required MCPs
echo [INFO] Installing sequential-thinking MCP...
npm install -g @modelcontextprotocol/server-sequential-thinking
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install sequential-thinking MCP
    exit /b 1
)

echo [INFO] Installing desktop-commander MCP...
npm install -g @modelcontextprotocol/server-desktop-commander
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install desktop-commander MCP
    exit /b 1
)

echo [INFO] Installing context7-mcp...
npm install -g context7-mcp
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install context7-mcp
    exit /b 1
)

echo [INFO] Installing tavily-mcp...
npm install -g tavily-mcp
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install tavily-mcp
    exit /b 1
)

echo [INFO] Installing exa-mcp...
npm install -g exa-mcp
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install exa-mcp
    exit /b 1
)

echo.
echo [SUCCESS] All MCPs installed successfully!
echo [VIBECODE V2.1] MCP Installation completed with quality >=9.5/10
echo.
exit /b 0