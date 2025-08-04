# NEONPRO COOKIES IMPORT FIX SCRIPT
# Corrige todos os usos incorretos de createRouteHandlerClient({ cookies }) para createClient()
# Baseado nas melhores práticas do Supabase SSR

Write-Host "🚀 NEONPRO: Iniciando correção de imports de cookies..." -ForegroundColor Cyan

# Array de arquivos que precisam ser corrigidos (baseado na busca anterior)
$apiFiles = @(
    "src\app\api\notifications\test\route.ts",
    "src\app\api\payment-plans\[id]\route.ts",
    "src\app\api\scheduling\waitlist\route.ts",
    "src\app\api\progress-tracking\[id]\route.ts",
    "src\app\api\progress-tracking\route.ts",
    "src\app\api\subscription\plans\route.ts",
    "src\app\api\subscription\payment\route.ts",
    "src\app\api\subscription\current\route.ts",
    "src\app\api\subscription-plans\[id]\route.ts",
    "src\app\api\subscriptions\[id]\route.ts",
    "src\app\api\stock\integrations\financial\route.ts",
    "src\app\api\stock\integrations\schedule\route.ts",
    "src\app\api\stock\dashboard\kpis\route.ts",
    "src\app\api\stock\dashboard\performance-metrics\route.ts",
    "src\app\api\stock\dashboard\top-products\route.ts",
    "src\app\api\stock\dashboard\alerts-summary\route.ts",
    "src\app\api\subscription-plans\route.ts",
    "src\app\api\subscriptions\route.ts",
    "src\app\api\scheduling\conflicts\detect\route.ts",
    "src\app\api\progress-analytics\route.ts",
    "src\app\api\recurring-payments\route.ts",
    "src\app\api\recurring-payments\retry\route.ts",
    "src\app\api\payment-plans\route.ts",
    "src\app\api\notifications\email\route.ts",
    "src\app\api\predictions\route.ts",
    "src\app\api\notifications\push\route.ts",
    "src\app\api\predictions\[id]\route.ts",
    "src\app\api\milestones\route.ts",
    "src\app\api\milestones\[id]\route.ts",
    "src\app\api\dashboard\executive\widgets\route.ts",
    "src\app\api\patients\[id]\route.ts",
    "src\app\api\patients\[id]\timeline\route.ts",
    "src\app\api\patients\[patientId]-temp\insights\alerts\route.ts",
    "src\app\api\patients\[patientId]-temp\insights\risk-assessment\route.ts",
    "src\app\api\patients\[id]\insights\route.ts",
    "src\app\api\patients\[patientId]-temp\insights\treatments\route.ts",
    "src\app\api\patients\[patientId]-temp\insights\comprehensive\route.ts",
    "src\app\api\installments\route.ts",
    "src\app\api\multi-session-analysis\route.ts",
    "src\app\api\dashboard\executive\reports\route.ts",
    "src\app\api\dashboard\executive\layouts\[id]\route.ts",
    "src\app\api\lgpd\compliance\route.ts",
    "src\app\api\lgpd\consent\route.ts",
    "src\app\api\lgpd\breach\route.ts",
    "src\app\api\dashboard\executive\alerts\route.ts",
    "src\app\api\lgpd\data-subject-rights\route.ts",
    "src\app\api\dashboard\executive\kpis\route.ts",
    "src\app\api\dashboard\executive\layouts\route.ts",
    "src\app\api\lgpd\audit\route.ts",
    "src\app\api\financial\predictive-cash-flow\scenarios\route.ts",
    "src\app\api\financial\predictive-cash-flow\predictions\route.ts",
    "src\app\api\financial\predictive-cash-flow\models\route.ts",
    "src\app\api\analytics\advanced\route.ts",
    "src\app\api\auth\security\route.ts",
    "src\app\api\auth\session\route.ts",
    "src\app\api\alerts\[id]\route.ts",
    "src\app\api\auth\notifications\route.ts",
    "src\app\api\compliance\automation\route.ts",
    "src\app\api\compliance\automation\alerts\route.ts",
    "src\app\api\compliance\automation\config\route.ts",
    "src\app\api\communication\templates\route.ts",
    "src\app\api\compliance\automation\monitoring\route.ts",
    "src\app\api\communication\templates\[id]\route.ts",
    "src\app\api\auth\devices\route.ts",
    "src\app\api\compliance\data-subject\route.ts",
    "src\app\api\compliance\consent\route.ts",
    "src\app\api\alerts\route.ts",
    "src\app\api\automated-analysis\route.ts",
    "src\app\api\automated-analysis\photo-pairs\route.ts",
    "src\app\api\automated-analysis\reports\route.ts",
    "src\app\api\automated-analysis\processing\route.ts",
    "src\app\api\audit\logs\route.ts",
    "src\app\api\audit\statistics\route.ts",
    "src\app\api\audit\reports\route.ts",
    "src\app\api\audit\alerts\route.ts"
)

$baseDir = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web"
$totalFiles = $apiFiles.Count
$processedFiles = 0
$successCount = 0
$errorCount = 0

Write-Host "📁 Total de arquivos para processar: $totalFiles" -ForegroundColor Yellow

foreach ($apiFile in $apiFiles) {
    $processedFiles++
    $fullPath = Join-Path $baseDir $apiFile
    
    Write-Host "[$processedFiles/$totalFiles] Processando: $apiFile" -ForegroundColor White
    
    if (-not (Test-Path $fullPath)) {
        Write-Host "  ⚠️  Arquivo não encontrado: $fullPath" -ForegroundColor Yellow
        continue
    }
    
    try {
        # Ler conteúdo do arquivo
        $content = Get-Content $fullPath -Raw -Encoding UTF8
        
        if (-not $content) {
            Write-Host "  ⚠️  Arquivo vazio: $apiFile" -ForegroundColor Yellow
            continue
        }
        
        # Fazer backup do arquivo original
        $backupPath = $fullPath + ".backup"
        Copy-Item $fullPath $backupPath -Force
        
        # Verificar se precisa corrigir import
        $needsImportFix = $false
        if ($content -match "createRouteHandlerClient" -and $content -notmatch "import.*createClient.*from.*@/lib/supabase/client") {
            $needsImportFix = $true
        }
        
        # 1. CORRIGIR IMPORTS - Adicionar ou substituir import do Supabase
        if ($needsImportFix) {
            # Remover imports antigos do Supabase
            $content = $content -replace "import.*createRouteHandlerClient.*from.*@supabase.*\r?\n", ""
            $content = $content -replace "import.*createServerComponentClient.*from.*@supabase.*\r?\n", ""
            
            # Encontrar onde inserir o novo import (depois dos imports do Next.js)
            if ($content -match "(import.*from.*['""]next/.*['""].*\r?\n)") {
                $lastNextImport = $matches[0]
                $insertPoint = $content.IndexOf($lastNextImport) + $lastNextImport.Length
                $newImport = "import { createClient } from '@/lib/supabase/client'`r`n"
                $content = $content.Insert($insertPoint, $newImport)
            }
            else {
                # Se não há imports do Next.js, inserir no início
                $content = "import { createClient } from '@/lib/supabase/client'`r`n" + $content
            }
        }
        
        # 2. CORRIGIR USOS DE createRouteHandlerClient({ cookies })
        # Substituir todas as ocorrências problemáticas
        $originalContent = $content
        
        # Pattern 1: createRouteHandlerClient({ cookies })  (linha incompleta)
        $content = $content -replace "createRouteHandlerClient\(\{\s*cookies\s*$", "const supabase = createClient()"
        
        # Pattern 2: createRouteHandlerClient<Database>({ cookies })
        $content = $content -replace "createRouteHandlerClient<Database>\(\{\s*cookies\s*$", "const supabase = createClient()"
        
        # Pattern 3: createRouteHandlerClient({ cookies }) em uma linha
        $content = $content -replace "createRouteHandlerClient\(\{\s*cookies\s*\}\)", "const supabase = createClient()"
        
        # Pattern 4: createRouteHandlerClient<Database>({ cookies }) em uma linha
        $content = $content -replace "createRouteHandlerClient<Database>\(\{\s*cookies\s*\}\)", "const supabase = createClient()"
        
        # 3. REMOVER LINHAS SOLTAS QUE SOBRARAM (linhas com apenas espaços/quebras)
        $content = $content -replace "\r?\n\s*\r?\n\s*\r?\n", "`r`n`r`n"
        
        # Verificar se houve mudanças
        if ($content -ne $originalContent) {
            # Salvar arquivo corrigido
            Set-Content $fullPath $content -Encoding UTF8 -NoNewline
            Write-Host "  ✅ CORRIGIDO: Import e usage patterns atualizados" -ForegroundColor Green
            $successCount++
        }
        else {
            Write-Host "  ℹ️  IGNORADO: Nenhuma mudança necessária" -ForegroundColor Blue
            # Remover backup se não houve mudanças
            Remove-Item $backupPath -Force
        }
        
    }
    catch {
        Write-Host "  ❌ ERRO: $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
        
        # Restaurar backup em caso de erro
        if (Test-Path "$fullPath.backup") {
            Copy-Item "$fullPath.backup" $fullPath -Force
            Remove-Item "$fullPath.backup" -Force
        }
    }
}

Write-Host "`n🎯 RESUMO DA CORREÇÃO:" -ForegroundColor Cyan
Write-Host "  📊 Total processado: $processedFiles arquivos" -ForegroundColor White
Write-Host "  ✅ Sucessos: $successCount arquivos" -ForegroundColor Green
Write-Host "  ❌ Erros: $errorCount arquivos" -ForegroundColor Red

if ($successCount -gt 0) {
    Write-Host "`n🔧 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
    Write-Host "  1️⃣  Verificar se existe o arquivo: @/lib/supabase/client" -ForegroundColor White
    Write-Host "  2️⃣  Executar: pnpm build --filter=@neonpro/web" -ForegroundColor White
    Write-Host "  3️⃣  Verificar se o build está funcionando" -ForegroundColor White
}

Write-Host "`n✨ Script finalizado!" -ForegroundColor Cyan