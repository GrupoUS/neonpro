# Script para corrigir todos os arquivos route.ts com padrao params problematico

$apiDir = "E:\neonpro\apps\web\app\api"
$filesProcessed = 0
$filesModified = 0

Write-Host "Iniciando correcao de arquivos route.ts..."

# Buscar todos os arquivos route.ts que contem o padrao problematico
$files = Get-ChildItem -Path $apiDir -Recurse -Name "route.ts" | ForEach-Object {
    $fullPath = Join-Path $apiDir $_
    $content = Get-Content $fullPath -ErrorAction SilentlyContinue | Out-String
    if ($content -and $content -match '\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*\{[^}]*\}\s*\}') {
        $fullPath
    }
}

Write-Host "Encontrados $($files.Count) arquivos para corrigir"

foreach ($file in $files) {
    try {
        $filesProcessed++
        Write-Host "Processando: $file"
        
        $content = Get-Content $file | Out-String
        $originalContent = $content
        
        # Correcao 1: Alterar tipo de params para Promise
        $content = $content -replace '\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*\{\s*([^}]+)\s*\}\s*\}', '{ params }: { params: Promise<{ $1 }> }'
        
        # Correcao 2: Adicionar desestruturacao apos try {
        $content = $content -replace '(try\s*\{)', '$1`n    const { id } = await params;'
        $content = $content -replace '(try\s*\{)', '$1`n    const { patientId } = await params;'
        $content = $content -replace '(try\s*\{)', '$1`n    const { clinicId } = await params;'
        $content = $content -replace '(try\s*\{)', '$1`n    const { reportId } = await params;'
        $content = $content -replace '(try\s*\{)', '$1`n    const { credentialId } = await params;'
        $content = $content -replace '(try\s*\{)', '$1`n    const { action } = await params;'
        
        # Correcao 3: Substituir params.id por id (e outras variaveis)
        $content = $content -replace 'params\.id', 'id'
        $content = $content -replace 'params\.patientId', 'patientId'
        $content = $content -replace 'params\.clinicId', 'clinicId'
        $content = $content -replace 'params\.reportId', 'reportId'
        $content = $content -replace 'params\.credentialId', 'credentialId'
        $content = $content -replace 'params\.action', 'action'
        
        # Verificar se houve mudancas
        if ($content -ne $originalContent) {
            $content | Set-Content -Path $file -Encoding UTF8
            $filesModified++
            Write-Host "  Arquivo modificado"
        } else {
            Write-Host "  Nenhuma alteracao necessaria"
        }
        
    } catch {
        Write-Host "  Erro ao processar: $($_.Exception.Message)"
    }
}

Write-Host "`nResumo:"
Write-Host "Arquivos processados: $filesProcessed"
Write-Host "Arquivos modificados: $filesModified"
Write-Host "Correcao concluida!"