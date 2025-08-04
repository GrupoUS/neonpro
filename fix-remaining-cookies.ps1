# Script para corrigir todos os createRouteHandlerClient({ cookies que sobraram

Write-Host "🔧 Corrigindo imports e uso do Supabase nos arquivos restantes..." -ForegroundColor Green

$rootPath = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src"

# Lista de arquivos que ainda tem o problema
$files = @(
    "app\api\milestones\[id]\route.ts",
    "app\api\payment-plans\[id]\route.ts",
    "app\api\progress-tracking\[id]\route.ts",
    "app\api\subscriptions\[id]\route.ts",
    "app\api\subscription-plans\[id]\route.ts",
    "app\api\stock\integrations\schedule\route.ts",
    "app\api\stock\dashboard\kpis\route.ts",
    "app\api\stock\dashboard\top-products\route.ts",
    "app\api\stock\dashboard\performance-metrics\route.ts",
    "app\api\stock\dashboard\alerts-summary\route.ts",
    "app\api\stock\integrations\financial\route.ts",
    "app\api\scheduling\conflicts\detect\route.ts",
    "app\api\predictions\[id]\route.ts",
    "app\api\patients\[patientId]-temp\insights\alerts\route.ts",
    "app\api\patients\[patientId]-temp\insights\risk-assessment\route.ts",
    "app\api\patients\[patientId]-temp\insights\treatments\route.ts",
    "app\api\patients\[patientId]-temp\insights\comprehensive\route.ts",
    "app\api\patients\[id]\route.ts",
    "app\api\patients\[id]\timeline\route.ts",
    "app\api\patients\[id]\insights\route.ts",
    "app\api\dashboard\executive\layouts\[id]\route.ts",
    "app\api\financial\predictive-cash-flow\models\route.ts",
    "app\api\financial\predictive-cash-flow\scenarios\route.ts",
    "app\api\financial\predictive-cash-flow\predictions\route.ts",
    "app\api\communication\templates\[id]\route.ts",
    "app\api\auth\devices\route.ts",
    "app\api\alerts\[id]\route.ts"
)

$totalFiles = $files.Count
$processedFiles = 0

foreach ($file in $files) {
    $filePath = Join-Path $rootPath $file
    
    if (Test-Path $filePath) {
        Write-Host "⚙️  Processando: $file" -ForegroundColor Yellow
        
        try {
            # Ler o conteúdo
            $content = Get-Content $filePath -Raw -Encoding UTF8
            
            # Substituições necessárias
            $modified = $false
            
            # 1. Corrigir import do createRouteHandlerClient para createClient
            if ($content -match "import.*createRouteHandlerClient.*from.*supabase") {
                $content = $content -replace "import\s*\{[^}]*createRouteHandlerClient[^}]*\}\s*from\s*'[^']*supabase[^']*'", "import { createClient } from '@/app/utils/supabase/server'"
                $modified = $true
                Write-Host "  ✅ Import corrigido" -ForegroundColor Green
            }
            
            # 2. Substituir createRouteHandlerClient({ cookies }) por createClient()
            if ($content -match "createRouteHandlerClient\s*\(\s*\{\s*cookies") {
                $content = $content -replace "createRouteHandlerClient\s*\(\s*\{\s*cookies[^}]*\}\s*\)", "createClient()"
                $modified = $true
                Write-Host "  ✅ Calls corrigidos" -ForegroundColor Green
            }
            
            # 3. Corrigir tipos Database se necessário
            if ($content -match "createClient<Database>") {
                $content = $content -replace "createClient<Database>", "createClient"
                $modified = $true
                Write-Host "  ✅ Tipos corrigidos" -ForegroundColor Green
            }
            
            # 4. Adicionar await se não tiver
            if ($content -match "const supabase = createClient\(\)" -and $content -notmatch "const supabase = await createClient\(\)") {
                $content = $content -replace "const supabase = createClient\(\)", "const supabase = await createClient()"
                $modified = $true
                Write-Host "  ✅ Await adicionado" -ForegroundColor Green
            }
            
            if ($modified) {
                # Salvar o arquivo
                $content | Set-Content $filePath -Encoding UTF8 -NoNewline
                Write-Host "  ✅ Arquivo salvo: $file" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️  Nenhuma alteração necessária: $file" -ForegroundColor Yellow
            }
            
        } catch {
            Write-Host "  ❌ Erro ao processar $file : $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "  ❌ Arquivo não encontrado: $file" -ForegroundColor Red
    }
    
    $processedFiles++
    $progress = [math]::Round(($processedFiles / $totalFiles) * 100, 1)
    Write-Host "📊 Progresso: $processedFiles/$totalFiles ($progress%)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🎉 Script concluído! Todos os arquivos com createRouteHandlerClient foram corrigidos." -ForegroundColor Green
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "  1. Executar build novamente" -ForegroundColor White
Write-Host "  2. Verificar se ainda há erros de cookies" -ForegroundColor White