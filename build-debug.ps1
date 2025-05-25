# Build Debug Script for Next.js on Netlify
# Updated: 25/05/2025
# Author: Deej Potter

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "    NEXT.JS BUILD DEBUG INFORMATION" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Show Node and NPM versions
Write-Host "Node Version:" -ForegroundColor Yellow
node -v
Write-Host "NPM Version:" -ForegroundColor Yellow
npm -v
Write-Host "Yarn Version:" -ForegroundColor Yellow
yarn -v

# Check Next.js version
Write-Host "Next.js Version:" -ForegroundColor Yellow
$nextVersion = Get-Content .\frontend\package.json | ConvertFrom-Json | Select-Object -ExpandProperty dependencies | Select-Object -ExpandProperty next
Write-Host "next@$nextVersion"

# Check for common issues
Write-Host "`nChecking for common issues..." -ForegroundColor Yellow

# Check Next.js dependencies
$pkg = Get-Content .\frontend\package.json | ConvertFrom-Json
$deps = $pkg.dependencies

# Check for React versions
Write-Host "React version: $($deps.react)" -ForegroundColor Cyan
Write-Host "React DOM version: $($deps.'react-dom')" -ForegroundColor Cyan

# Check for missing peer dependencies
Write-Host "`nChecking for missing peer dependencies..." -ForegroundColor Yellow
cd frontend
$peerDepResult = yarn check --verify-tree 2>&1
if ($peerDepResult -match "error") {
    Write-Host "Peer dependency issues found:" -ForegroundColor Red
    Write-Host $peerDepResult -ForegroundColor Red
} else {
    Write-Host "No peer dependency issues found" -ForegroundColor Green
}
cd ..

# Check node_modules structure
Write-Host "`nChecking node_modules structure..." -ForegroundColor Yellow
if (Test-Path -Path .\frontend\node_modules\next) {
    Write-Host "Next.js is properly installed in node_modules" -ForegroundColor Green
} else {
    Write-Host "WARNING: Next.js not found in node_modules!" -ForegroundColor Red
}

# Display environment variables that might affect the build
Write-Host "`nEnvironment variables that might affect the build:" -ForegroundColor Yellow
Write-Host "NODE_ENV: $env:NODE_ENV" -ForegroundColor Cyan

# Check for TypeScript path mappings
Write-Host "`nChecking TypeScript path mappings..." -ForegroundColor Yellow
try {
    $tsconfigFrontend = Get-Content .\frontend\tsconfig.json | ConvertFrom-Json
    Write-Host "Frontend tsconfig paths:" -ForegroundColor Cyan
    $tsconfigFrontend.compilerOptions.paths | ConvertTo-Json -Depth 1
    
    $tsconfigBase = Get-Content .\tsconfig.base.json | ConvertFrom-Json
    Write-Host "Base tsconfig paths:" -ForegroundColor Cyan
    $tsconfigBase.compilerOptions.paths | ConvertTo-Json -Depth 1
} catch {
    Write-Host "Error reading tsconfig files: $_" -ForegroundColor Red
}

# Scan for problematic import paths
Write-Host "`nScanning for problematic import paths..." -ForegroundColor Yellow
$importIssues = 0
$files = Get-ChildItem -Path .\frontend\app -Recurse -Include "*.ts", "*.tsx" | Select-Object -ExpandProperty FullName

foreach ($file in $files) {
    $content = Get-Content -Path $file -Raw
    
    # Check for @/interfaces imports (which should now be @types/interfaces)
    if ($content -match '@/interfaces/box-shipping-calculator') {
        Write-Host "⚠️ Found problematic import in: $file" -ForegroundColor Red
        $importIssues++
    }
}

if ($importIssues -gt 0) {
    Write-Host "`n⚠️ Found $importIssues files with problematic import paths." -ForegroundColor Red
    Write-Host "   Run 'update-imports.ps1' to fix these issues." -ForegroundColor Yellow
} else {
    Write-Host "`n✅ No problematic import paths found." -ForegroundColor Green
}

Write-Host "`nBuild debug information complete." -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
