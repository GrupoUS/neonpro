# Script para corrigir duplicações de const supabase
Write-Host "Corrigindo duplicações de const supabase..." -ForegroundColor Cyan

$baseDir = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api"

# Buscar todos os arquivos .ts recursivamente
$tsFiles = Get-ChildItem -Path $baseDir -Filter "*.ts" -Recurse

$totalFiles = $tsFiles.Count
$processedFiles = 0
$fixedFiles = 0

Write-Host "Total de arquivos encontrados: $totalFiles" -ForegroundColor Yellow

foreach ($file in $tsFiles) {
    $processedFiles++
    $relativePath = $file.FullName.Replace($baseDir, "")
    
    Write-Host "[$processedFiles/$totalFiles] Verificando: $relativePath" -ForegroundColor White
    
    try {
        # Ler conteúdo do arquivo
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        
        if ($content -match "const supabase = const supabase = createClient") {
            Write-Host "  Encontrada duplicação - corrigindo..." -ForegroundColor Yellow
            
            # Fazer backup
            $backupPath = $file.FullName + ".backup-fix"
            Copy-Item $file.FullName $backupPath -Force
            
            # Corrigir duplicação
            $content = $content -replace "const supabase = const supabase = createClient\(\)", "const supabase = createClient()"
            
            # Salvar arquivo corrigido
            Set-Content $file.FullName $content -Encoding UTF8 -NoNewline
            
            Write-Host "  CORRIGIDO: Duplicação removida" -ForegroundColor Green
            $fixedFiles++
        }
        else {
            Write-Host "  OK: Nenhuma duplicação encontrada" -ForegroundColor Blue
        }
    }
    catch {
        Write-Host "  ERRO: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nRESUMO:" -ForegroundColor Cyan
Write-Host "  Total verificado: $processedFiles arquivos" -ForegroundColor White
Write-Host "  Arquivos corrigidos: $fixedFiles" -ForegroundColor Green

Write-Host "`nProximo passo: Executar pnpm build --filter=@neonpro/web" -ForegroundColor Yellow