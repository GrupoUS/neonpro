# Script PowerShell para executar schema CRM no Supabase
param(
    [string]$ProjectRef = "gfkskrkbnawkuppazkpt",
    [string]$AccessToken = "sbp_40a721931e7ff98b4f6979a5bcb2a28c8ea5c0dc"
)

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
