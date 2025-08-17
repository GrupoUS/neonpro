# Script PowerShell para executar schema CRM no Supabase
param(
    [string]$ProjectRef = $env:SUPABASE_PROJECT_REF,
    [string]$AccessToken = $env:SUPABASE_ACCESS_TOKEN
)

# Verificar se as variáveis de ambiente estão configuradas
if (-not $ProjectRef) {
    Write-Host "❌ ERRO: Variable SUPABASE_PROJECT_REF não encontrada!" -ForegroundColor Red
    Write-Host "💡 Configure no .env.local: SUPABASE_PROJECT_REF=gfkskrkbnawkuppazkpt" -ForegroundColor Yellow
    exit 1
}

if (-not $AccessToken) {
    Write-Host "❌ ERRO: Variable SUPABASE_ACCESS_TOKEN não encontrada!" -ForegroundColor Red  
    Write-Host "💡 Configure no .env.local: SUPABASE_ACCESS_TOKEN=seu_token_aqui" -ForegroundColor Yellow
    exit 1
}

Write-Host "🚀 Executando Schema CRM no Supabase..." -ForegroundColor Green
Write-Host "🔑 Project: $ProjectRef" -ForegroundColor Cyan

# Ler o arquivo SQL
$sqlFile = "10-setup-crm-tables.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ Arquivo SQL não encontrado: $sqlFile" -ForegroundColor Red
    exit 1
}

$sqlContent = Get-Content $sqlFile -Raw
Write-Host "📝 SQL Schema carregado. Tamanho: $($sqlContent.Length) caracteres" -ForegroundColor Yellow

# URL da API do Supabase para executar SQL
$apiUrl = "https://api.supabase.com/v1/projects/$ProjectRef/database/query"

# Headers para a requisição
$headers = @{
    "Authorization" = "Bearer $AccessToken"
    "Content-Type" = "application/json"
}

# Body da requisição
$bodyObject = @{
    query = $sqlContent
}
$body = $bodyObject | ConvertTo-Json

try {
    Write-Host "🔄 Executando SQL no Supabase..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Headers $headers -Body $body -ErrorAction Stop
    
    Write-Host "✅ Schema CRM executado com sucesso!" -ForegroundColor Green
    Write-Host "📊 Resposta recebida do Supabase" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Erro ao executar schema:" -ForegroundColor Red
    Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Detalhes do erro:" -ForegroundColor Yellow
            Write-Host $responseBody -ForegroundColor Red
        } catch {
            Write-Host "Não foi possível ler detalhes do erro" -ForegroundColor Yellow
        }
    }
}
