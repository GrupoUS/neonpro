# Script para corrigir todos os imports de supabase/server

$ErrorActionPreference = "Continue"

Write-Host "=== CORREÇÃO DE IMPORTS SUPABASE ===" -ForegroundColor Yellow
Write-Host "Corrigindo imports '@/lib/supabase/server' para '@/app/utils/supabase/server'..." -ForegroundColor Cyan

# Lista de arquivos para corrigir (baseado na busca anterior)
$files = @(
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\subscription-plans\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\subscriptions\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\subscription\plans\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\subscription\payment\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\subscription\current\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\scheduling\waitlist\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\recurring-payments\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\recurring-payments\retry\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\progress-tracking\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\progress-analytics\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\predictions\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\payments\pix\status\[id]\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\payments\pix\webhook\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\payments\pix\create\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\notifications\test\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\notifications\email\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\notifications\push\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\payment-plans\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\multi-session-analysis\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\patients\integration\search\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\patients\integration\quick-access\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\milestones\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\lgpd\data-subject-rights\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\lgpd\consent\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\lgpd\compliance\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\lgpd\breach\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\lgpd\audit\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\installments\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\health\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\dashboard\executive\reports\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\dashboard\executive\widgets\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\dashboard\executive\layouts\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\dashboard\executive\kpis\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\dashboard\executive\alerts\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\communication\templates\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\compliance\automation\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\bank-reconciliation\transactions\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\bank-reconciliation\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\compliance\automation\monitoring\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\compliance\automation\config\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\compliance\automation\alerts\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\backup\configs\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\automated-analysis\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\backup\configs\[id]\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\backup\status\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\backup\recovery\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\automated-analysis\reports\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\automated-analysis\processing\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\backup\metrics\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\automated-analysis\photo-pairs\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\backup\jobs\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\auth\roles\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\audit\reports\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\audit\statistics\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\audit\logs\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\auth\security\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\auth\session\devices\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\auth\session\terminate\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\auth\session\analytics\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\auth\session\validate\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\auth\session\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\auth\session\refresh\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\auth\session\extend\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\auth\session\security\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\auth\notifications\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\analytics\advanced\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\alerts\route.ts"
)

$sucessos = 0
$erros = 0

foreach ($file in $files) {
    if (Test-Path $file) {
        try {
            $content = Get-Content $file -Raw -Encoding UTF8
            $originalContent = $content
            
            # Corrigir o import
            $content = $content -replace "from '@/lib/supabase/server'", "from '@/app/utils/supabase/server'"
            
            if ($content -ne $originalContent) {
                Set-Content -Path $file -Value $content -Encoding UTF8
                Write-Host "✅ Corrigido: $(Split-Path $file -Leaf)" -ForegroundColor Green
                $sucessos++
            } else {
                Write-Host "ℹ️ Não precisa correção: $(Split-Path $file -Leaf)" -ForegroundColor Blue
            }
        } catch {
            Write-Host "❌ Erro em $(Split-Path $file -Leaf): $($_.Exception.Message)" -ForegroundColor Red
            $erros++
        }
    } else {
        Write-Host "⚠️ Arquivo não encontrado: $(Split-Path $file -Leaf)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== RESULTADO FINAL ===" -ForegroundColor Yellow
Write-Host "✅ Sucessos: $sucessos" -ForegroundColor Green
Write-Host "❌ Erros: $erros" -ForegroundColor Red
Write-Host "✅ Correção de imports concluída!" -ForegroundColor Green