@echo off
echo Fazendo deploy do NeonPro no Vercel...

REM Fazer build local primeiro
echo Building project locally...
call npm run build

if %errorlevel% neq 0 (
    echo Build failed locally!
    exit /b 1
)

echo Build succeeded! Deploying to Vercel...

REM Deploy com Vercel usando build local
vercel --prod --yes --prebuilt

echo Deploy complete!