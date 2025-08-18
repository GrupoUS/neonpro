@echo off
cd /d E:\neonpro
echo Running Biome check for security package...
npx @biomejs/biome check packages/security/src --verbose

echo.
echo Applying Biome auto-fixes...
npx @biomejs/biome check packages/security/src --apply

echo.
echo Final check after fixes...
npx @biomejs/biome check packages/security/src --verbose

pause