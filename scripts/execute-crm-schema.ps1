# Script PowerShell para executar schema CRM no Supabase
# Usar variáveis de ambiente para segurança
$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$accessToken = $env:SUPABASE_ACCESS_TOKEN  
$projectRef = $env:SUPABASE_PROJECT_REF

# Verificar se as variáveis estão configuradas
if (-not $supabaseUrl) {
    Write-Host "❌ ERRO: NEXT_PUBLIC_SUPABASE_URL não encontrada!" -ForegroundColor Red
    exit 1
}

if (-not $accessToken) {
    Write-Host "❌ ERRO: SUPABASE_ACCESS_TOKEN não encontrada!" -ForegroundColor Red
    exit 1
}

if (-not $projectRef) {
    Write-Host "❌ ERRO: SUPABASE_PROJECT_REF não encontrada!" -ForegroundColor Red
    exit 1
}

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
