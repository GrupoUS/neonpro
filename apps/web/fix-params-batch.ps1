# Script para corrigir todos os arquivos route.ts com params problematico

$apiDir = "E:\neonpro\apps\web\app\api"
$filesProcessed = 0
$filesModified = 0

Write-Host "Iniciando correcao em lote de arquivos route.ts..."

# Buscar todos os arquivos route.ts
$allFiles = Get-ChildItem -Path $apiDir -Recurse -Filter "route.ts"

Write-Host "Encontrados $($allFiles.Count) arquivos route.ts"

foreach ($fileInfo in $allFiles) {
    try {
        $filesProcessed++
        $file = $fileInfo.FullName
        Write-Host "Processando ($filesProcessed/$($allFiles.Count)): $($fileInfo.Name) em $($fileInfo.DirectoryName)"
        
        $content = Get-Content $file | Out-String
        $originalContent = $content
        
        # Verificar se tem o padrao problematico
        if ($content -match '\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*\{[^}]*id[^}]*string[^}]*\}\s*\}') {
            Write-Host "  Encontrado padrao problematico - corrigindo..."
            
            # Correcao 1: Alterar tipo de params para Promise
            $content = $content -replace '\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*\{([^}]+)\}\s*\}', '{ params }: { params: Promise<{$1}> }'
            
            # Correcao 2: Adicionar desestruturacao apos try {
            if ($content -match 'params\.id') {
                $content = $content -replace '(try\s*\{)', '$1`n    const { id } = await params;'
                $content = $content -replace 'params\.id', 'id'
            }
            if ($content -match 'params\.patientId') {
                $content = $content -replace '(try\s*\{)', '$1`n    const { patientId } = await params;'
                $content = $content -replace 'params\.patientId', 'patientId'
            }
            if ($content -match 'params\.clinicId') {
                $content = $content -replace '(try\s*\{)', '$1`n    const { clinicId } = await params;'
                $content = $content -replace 'params\.clinicId', 'clinicId'
            }
            if ($content -match 'params\.reportId') {
                $content = $content -replace '(try\s*\{)', '$1`n    const { reportId } = await params;'
                $content = $content -replace 'params\.reportId', 'reportId'
            }
            if ($content -match 'params\.credentialId') {
                $content = $content -replace '(try\s*\{)', '$1`n    const { credentialId } = await params;'
                $content = $content -replace 'params\.credentialId', 'credentialId'
            }
            if ($content -match 'params\.action') {
                $content = $content -replace '(try\s*\{)', '$1`n    const { action } = await params;'
                $content = $content -replace 'params\.action', 'action'
            }
            
            # Salvar arquivo modificado
            $content | Set-Content -Path $file
            $filesModified++
            Write-Host "  Arquivo modificado com sucesso"
        } else {
            Write-Host "  Nenhum padrao problematico encontrado"
        }
        
    } catch {
        Write-Host "  ERRO ao processar: $($_.Exception.Message)"
    }
}

Write-Host "`nResumo Final:"
Write-Host "Arquivos processados: $filesProcessed"
Write-Host "Arquivos modificados: $filesModified"
Write-Host "Correcao em lote concluida!"