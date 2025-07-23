# Script PowerShell para executar schema CRM no Supabase
$supabaseUrl = "https://gfkskrkbnawkuppazkpt.supabase.co"
$accessToken = "sbp_40a721931e7ff98b4f6979a5bcb2a28c8ea5c0dc"
$projectRef = "gfkskrkbnawkuppazkpt"

Write-Host "🚀 Executando Schema CRM no Supabase..." -ForegroundColor Green
Write-Host "📊 URL: $supabaseUrl" -ForegroundColor Cyan
Write-Host "🔑 Project: $projectRef" -ForegroundColor Cyan

# Ler o arquivo SQL
$sqlFile = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\scripts\10-setup-crm-tables.sql"
$sqlContent = Get-Content $sqlFile -Raw

Write-Host "📝 SQL Schema carregado. Tamanho: $($sqlContent.Length) caracteres" -ForegroundColor Yellow

# URL da API do Supabase para executar SQL
$apiUrl = "https://api.supabase.com/v1/projects/$projectRef/database/query"

# Headers para a requisição
$headers = @{
    "Authorization" = "Bearer $accessToken"
    "Content-Type" = "application/json"
    "Prefer" = "params=single-object"
}

# Body da requisição
$body = @{
    "query" = $sqlContent
} | ConvertTo-Json

try {
    Write-Host "🔄 Executando SQL no Supabase..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Headers $headers -Body $body
    
    Write-Host "✅ Schema CRM executado com sucesso!" -ForegroundColor Green
    Write-Host "📊 Resposta:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 3 | Write-Host
    
}
catch {
    Write-Host "❌ Erro ao executar schema:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Detalhes do erro:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor Red
    }
}
