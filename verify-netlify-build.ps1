#!/bin/bash
# Netlify Build Verification Script for Windows/PowerShell
# Updated: 25/05/2025
# Author: Deej Potter

echo "===================================================="
echo "   NETLIFY BUILD VERIFICATION SCRIPT"
echo "===================================================="
echo ""
echo "This script simulates the Netlify build environment"
echo "to catch build errors before deployment."
echo ""

# Set environment variables to match Netlify
$env:NETLIFY = "true"
$env:NODE_ENV = "production"

# Ensure we're in the frontend directory
cd frontend

# Clean any previous build artifacts
echo "Cleaning previous build artifacts..."
if (Test-Path -Path .next) {
    Remove-Item -Path .next -Recurse -Force
}

# Install dependencies fresh
echo "Installing dependencies..."
yarn install

# Run the build
echo "Running build..."
yarn build

# Check build status
if ($LASTEXITCODE -ne 0) {
    echo "===================================================="
    echo "   BUILD FAILED!"
    echo "===================================================="
    echo "The build process returned an error code: $LASTEXITCODE"
    
    # Check for common TypeScript path resolution issues
    echo ""
    echo "Checking for TypeScript path issues..."
    
    # Look for imports that might cause problems
    $pathIssues = Select-String -Path "**/*.ts*" -Pattern "@/interfaces|@types/" -Exclude "node_modules/*" -ErrorAction SilentlyContinue
    
    if ($pathIssues) {
        echo "Found potential path alias issues in these files:"
        $pathIssues | ForEach-Object {
            echo "  - $($_.Path):$($_.LineNumber) - $($_.Line.Trim())"
        }
        echo ""
        echo "SUGGESTION: Use relative imports instead of path aliases."
        echo "Run the update-to-relative-paths.ps1 script to fix these issues."
    }
    
    echo "Please fix the issues before deploying to Netlify."
    exit 1
} else {
    echo "===================================================="
    echo "   BUILD SUCCESSFUL!"
    echo "===================================================="
    
    # Check if standalone directory exists (as specified in netlify.toml)
    if (Test-Path -Path .next/standalone) {
        echo "✅ Standalone directory exists as expected."
    } else {
        echo "❌ WARNING: .next/standalone directory not found!"
        echo "   This may cause deployment issues on Netlify."
        echo "   Check your next.config.js and netlify.toml settings."
    }
    
    echo "Your build should work on Netlify."
    echo "You can safely proceed with deployment."
}

# Return to the root directory
cd ..
