@echo off
echo.
echo ===============================================
echo   NeonPro Test Migration Validator
echo ===============================================
echo.

cd /d "%~dp0"

echo Running migration validation...
echo.

node tools\testing\validate-migration.js

echo.
echo Validation complete!
echo.
pause