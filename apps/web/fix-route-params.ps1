# Script para corrigir parametros de rotas do Next.js 15

$files = @(
    "E:\neonpro\apps\web\app\api\retention-analytics\metrics\clinic\[clinicId]\route.ts",
    "E:\neonpro\apps\web\app\api\treatment-success\outcomes\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\tax\nfe\[id]\cancel\route.ts",
    "E:\neonpro\apps\web\app\api\report-builder\sharing\[reportId]\route.ts",
    "E:\neonpro\apps\web\app\api\report-builder\reports\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\retention-analytics\dashboard\[clinicId]\route.ts",
    "E:\neonpro\apps\web\app\api\report-builder\analytics\[reportId]\route.ts",
    "E:\neonpro\apps\web\app\api\progress-tracking\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\retention-analytics\predictions\[clinicId]\route.ts",
    "E:\neonpro\apps\web\app\api\predictive-analytics\training\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\predictive-analytics\predictions\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\tax\nfe\[id]\authorize\route.ts",
    "E:\neonpro\apps\web\app\api\retention-analytics\metrics\[patientId]\route.ts",
    "E:\neonpro\apps\web\app\api\retention-analytics\strategies\[clinicId]\route.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Corrigindo: $file"
        
        $content = Get-Content $file -Raw
        
        # Corrigir definicoes de parametros
        $content = $content -replace '{ params }: { params: { (\w+): string } }', '{ params }: { params: Promise<{ $1: string }> }'
        
        # Adicionar desestruturacao de parametros apos try {
        $content = $content -replace '(\s+try {\s*)', '$1`n    const resolvedParams = await params;`n'
        
        # Substituir uso direto de params.xxx por resolvedParams.xxx
        $content = $content -replace 'params\.(\w+)', 'resolvedParams.$1'
        
        Set-Content $file $content -Encoding UTF8
        Write-Host "Corrigido: $file"
    } else {
        Write-Host "Arquivo nao encontrado: $file"
    }
}

Write-Host "Correcao de parametros concluida!"