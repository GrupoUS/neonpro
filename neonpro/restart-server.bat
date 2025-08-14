@echo off
cd /d "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro"
echo Clearing Next.js cache...
if exist .next rmdir /s /q .next
if exist .swc rmdir /s /q .swc
echo Cache cleared successfully
echo Starting development server...
npm run dev
pause