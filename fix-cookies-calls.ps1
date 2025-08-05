# Fix incorrect cookies() calls in various files
Write-Host "=== FIXING COOKIES CALLS ==="

$cookiesFiles = @{
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\server\trpc\context.ts" = @{
        "search" = "cookies\(\)\s*\nconst supabase = createServerClient"
        "replace" = "const supabase = createServerClient"
    }
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\lib\supabase\server.ts" = @{
        "search" = "cookies\(\)\s*\n\s*return createServerClient"
        "replace" = "return createServerClient"
    }
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\lib\supabase\connection-pool-manager.ts" = @{
        "search" = "cookies\(\)\s*\n\s*const client = createServerClient"
        "replace" = "const client = createServerClient"
    }
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\utils\supabase\server.ts" = @{
        "search" = "cookies\(\)\s*\n\s*return createServerClient"
        "replace" = "return createServerClient"
    }
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\audit\alerts\route.ts" = @{
        "search" = "cookies\(\)\s*\nconst supabase = createClient"
        "replace" = "const supabase = createClient"
    }
}

foreach ($file in $cookiesFiles.Keys) {
    $config = $cookiesFiles[$file]
    
    if (Test-Path $file) {
        $fileName = Split-Path $file -Leaf
        Write-Host "Corrigindo cookies() em: $fileName"
        
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Apply specific replacement for this file
        $content = $content -replace $config["search"], $config["replace"]
        
        # Save with UTF-8 encoding
        $content | Out-File -FilePath $file -Encoding UTF8 -NoNewline
        Write-Host "OK: $fileName"
    } else {
        Write-Host "ARQUIVO NAO ENCONTRADO: $file"
    }
}

# Also check if there are any other isolated cookies() calls
Write-Host "`n=== PROCURANDO OUTRAS OCORRENCIAS ==="

$allFiles = Get-ChildItem -Path "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src" -Recurse -Filter "*.ts" -File

foreach ($file in $allFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    
    if ($content -match "^\s*cookies\(\)\s*$") {
        Write-Host "Encontrado cookies() isolado em: $($file.FullName)"
        $content = $content -replace "^\s*cookies\(\)\s*$", ""
        $content | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
        Write-Host "Removido cookies() isolado de: $($file.Name)"
    }
}

Write-Host "`n=== CORRECAO COMPLETA! ==="