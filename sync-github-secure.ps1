#!/usr/bin/env pwsh
# SINCRONIZACAO SEGURA GITHUB - NEONPRO
# Versao: 1.0 - Token seguro na pasta env/

param(
    [string]$Message = "NEONPRO: Sincronizacao automatica $(Get-Date -Format 'yyyy-MM-dd HH:mm')",
    [switch]$Force = $false
)

Write-Host "INICIANDO SINCRONIZACAO SEGURA NEONPRO" -ForegroundColor Green

# Verificar se existe o token
$TokenPath = "env/github-token.txt"
if (-not (Test-Path $TokenPath)) {
    Write-Error "Token nao encontrado em $TokenPath"
    Write-Host "Crie o arquivo com: echo 'seu_token_aqui' > env/github-token.txt"
    exit 1
}

# Ler token do arquivo
try {
    $GitHubToken = Get-Content $TokenPath -ErrorAction Stop
    Write-Host "Token carregado com sucesso" -ForegroundColor Green
} catch {
    Write-Error "Erro ao ler token: $_"
    exit 1
}

# Configurar remote com token
Write-Host "Configurando remote seguro..." -ForegroundColor Yellow
git remote set-url origin "https://$GitHubToken@github.com/GrupoUS/neonpro.git"

# Status do repositorio
Write-Host "Status do repositorio:" -ForegroundColor Blue
git status --short

# Adicionar arquivos (exceto pasta env/)
Write-Host "Adicionando arquivos (env/ bloqueado)..." -ForegroundColor Yellow
git add .

# Verificar se ha mudancas
$Changes = git status --porcelain
if (-not $Changes) {
    Write-Host "Nenhuma alteracao para commitar" -ForegroundColor Green
    exit 0
}

# Fazer commit
Write-Host "Fazendo commit..." -ForegroundColor Yellow
git commit -m $Message

# Push para GitHub
Write-Host "Enviando para GitHub..." -ForegroundColor Yellow
if ($Force) {
    git push origin clean-branch --force
} else {
    git push origin clean-branch
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "SINCRONIZACAO CONCLUIDA COM SUCESSO!" -ForegroundColor Green
    Write-Host "Repositorio: https://github.com/GrupoUS/neonpro" -ForegroundColor Cyan
} else {
    Write-Error "Erro na sincronizacao. Codigo: $LASTEXITCODE"
    exit 1
}

# Limpar token da memoria por seguranca
$GitHubToken = $null
Write-Host "Token limpo da memoria" -ForegroundColor Gray
