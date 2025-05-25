# Update Interface Imports Script
# This script will update all @/interfaces/box-shipping-calculator imports to @types/interfaces/box-shipping-calculator
# For use in Windows PowerShell

$files = Get-ChildItem -Path "$PSScriptRoot\frontend" -Recurse -Include "*.ts", "*.tsx" | Select-Object -ExpandProperty FullName

foreach ($file in $files) {
    $content = Get-Content -Path $file -Raw
    $updatedContent = $content -replace '@/interfaces/box-shipping-calculator', '@types/interfaces/box-shipping-calculator'
    
    # Only update files that actually need changes
    if ($content -ne $updatedContent) {
        Write-Host "Updating imports in: $file"
        Set-Content -Path $file -Value $updatedContent
    }
}

Write-Host "Import paths updated successfully!"
