Write-Host "Verificando cookies() restantes..."

$files = Get-ChildItem -Path . -Recurse -Include "*.ts","*.tsx","*.js","*.jsx" | Where-Object { $_.FullName -notmatch "node_modules" }

$found = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName
    $lineNum = 0
    foreach ($line in $content) {
        $lineNum++
        if ($line -match "cookies\(\)") {
            Write-Host "FOUND: $($file.Name):$lineNum - $($line.Trim())"
            $found++
        }
    }
}

if ($found -eq 0) {
    Write-Host "OK: Nenhuma ocorrencia de cookies() encontrada!"
} else {
    Write-Host "TOTAL: $found ocorrencias encontradas"
}