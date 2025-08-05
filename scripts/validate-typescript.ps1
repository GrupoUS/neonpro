#!/usr/bin/env pwsh

# TypeScript Validation Script V3.0
# Focus on specific modules with memory management

param(
    [string]$Mode = "quick",  # quick, full, incremental
    [string]$Package = "",    # specific package to validate
    [int]$MaxMemory = 6144    # max memory in MB
)

Write-Host "🔍 NeonPro TypeScript Validation V3.0" -ForegroundColor Cyan
Write-Host "Mode: $Mode | Package: $Package | Max Memory: ${MaxMemory}MB" -ForegroundColor Gray

# Set Node.js memory options
$env:NODE_OPTIONS = "--max-old-space-size=$MaxMemory"

# Base directory
$BaseDir = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro"
Set-Location $BaseDir

function Test-TypeScriptFile {
    param([string]$FilePath)
    
    Write-Host "Validating: $FilePath" -ForegroundColor Yellow
    $result = & npx tsc --noEmit --skipLibCheck --isolatedModules $FilePath 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $FilePath - OK" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $FilePath - ERRORS" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        return $false
    }
}

function Test-PackageTypes {
    param([string]$PackagePath)
    
    Write-Host "`n📦 Testing package: $PackagePath" -ForegroundColor Cyan
    
    if (!(Test-Path $PackagePath)) {
        Write-Host "❌ Package path not found: $PackagePath" -ForegroundColor Red
        return $false
    }
    
    $success = $true
    
    # Find TypeScript files
    $tsFiles = Get-ChildItem -Path $PackagePath -Filter "*.ts" -Recurse | Where-Object { 
        $_.FullName -notmatch "node_modules" -and 
        $_.FullName -notmatch "\.next" -and
        $_.FullName -notmatch "dist" -and
        $_.FullName -notmatch "__tests__" -and
        $_.FullName -notmatch "\.test\." -and
        $_.FullName -notmatch "\.spec\."
    }
    
    foreach ($file in $tsFiles) {
        if (!(Test-TypeScriptFile $file.FullName)) {
            $success = $false
        }
    }
    
    return $success
}

# Main validation logic
switch ($Mode) {
    "quick" {
        Write-Host "`n🚀 Quick validation - Types only" -ForegroundColor Cyan
        
        # Test our new type files
        $typeFiles = @(
            "$BaseDir\types\global.d.ts",
            "$BaseDir\types\supabase.d.ts", 
            "$BaseDir\types\auth.d.ts",
            "$BaseDir\types\medical.d.ts",
            "$BaseDir\types\ui.d.ts"
        )
        
        $allSuccess = $true
        foreach ($file in $typeFiles) {
            if (Test-Path $file) {
                if (!(Test-TypeScriptFile $file)) {
                    $allSuccess = $false
                }
            } else {
                Write-Host "⚠️  Type file not found: $file" -ForegroundColor Yellow
            }
        }
        
        if ($allSuccess) {
            Write-Host "`n🎉 All type files are valid!" -ForegroundColor Green
        }
    }
    
    "incremental" {
        Write-Host "`n📈 Incremental validation by package" -ForegroundColor Cyan
        
        $packages = @(
            "packages\types",
            "packages\ui", 
            "packages\config",
            "packages\utils"
        )
        
        foreach ($pkg in $packages) {
            Test-PackageTypes "$BaseDir\$pkg"
        }
    }
    
    "full" {
        Write-Host "`n🔥 Full project validation" -ForegroundColor Cyan
        Write-Host "⚠️  This may take several minutes and use significant memory" -ForegroundColor Yellow
        
        try {
            Write-Host "Running full TypeScript check..." -ForegroundColor Gray
            $result = & npx tsc --noEmit --project . 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "🎉 Full validation successful!" -ForegroundColor Green
            } else {
                Write-Host "❌ Full validation failed:" -ForegroundColor Red
                Write-Host $result -ForegroundColor Red
            }
        } catch {
            Write-Host "💥 Full validation crashed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    default {
        Write-Host "❌ Invalid mode: $Mode" -ForegroundColor Red
        Write-Host "Valid modes: quick, incremental, full" -ForegroundColor Gray
    }
}

# Package-specific validation
if ($Package -ne "") {
    Write-Host "`n🎯 Testing specific package: $Package" -ForegroundColor Cyan
    Test-PackageTypes "$BaseDir\$Package"
}

Write-Host "`n✨ Validation complete!" -ForegroundColor Cyan