# Update Interface Imports to Use Relative Paths
# This script updates all interface imports to use relative paths 
# instead of path aliases (@/) or (@types/)

# For Windows PowerShell
# Updated: 25/05/2025
# Author: Deej Potter

$frontendRoot = Join-Path -Path $PSScriptRoot -ChildPath "frontend"
$typesRoot = Join-Path -Path $PSScriptRoot -ChildPath "types"

# Get all TypeScript files in the frontend
$files = Get-ChildItem -Path $frontendRoot -Recurse -Include "*.ts", "*.tsx" | Where-Object { $_.FullName -notlike "*\node_modules\*" }

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    $fileDir = Split-Path -Parent $file.FullName
    
    # Calculate relative path from the file to the types directory
    $relativePath = Resolve-Path $typesRoot -Relative -ErrorAction SilentlyContinue
    if (-not $relativePath) {
        # If Resolve-Path fails, calculate manually
        $relativePath = (Resolve-Path $typesRoot).Path
    }
    
    # Convert to relative path from the file's directory
    $relPathFromFile = [System.IO.Path]::GetRelativePath($fileDir, (Resolve-Path $typesRoot).Path)
    
    # Replace @/interfaces/box-shipping-calculator with the relative path
    $content = $content -replace '@/interfaces/box-shipping-calculator', "$relPathFromFile/interfaces/box-shipping-calculator"
    
    # Replace @types/interfaces/box-shipping-calculator with the relative path
    $content = $content -replace '@types/interfaces/box-shipping-calculator', "$relPathFromFile/interfaces/box-shipping-calculator"
    
    # Only write to the file if changes were made
    if ($content -ne $originalContent) {
        Write-Host "Updating imports in: $($file.FullName)"
        Set-Content -Path $file.FullName -Value $content
    }
}

Write-Host "Import paths updated successfully!"
