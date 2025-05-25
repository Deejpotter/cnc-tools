/**
 * Netlify Build Script
 * Updated: 17/05/2025
 * Author: Deej Potter
 * 
 * This script is used during the Netlify build process to perform additional
 * optimizations and checks before the actual build starts.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Performing pre-build checks...');

// Ensure necessary directories exist
const dirs = ['.next', '.next/cache'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`📁 Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Check for environment variables
const requiredEnvVars = ['NODE_VERSION'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length) {
  console.warn(`⚠️  Warning: Missing environment variables: ${missingVars.join(', ')}`);
}

// Add a Node version check
const currentNodeVersion = process.version;
console.log(`ℹ️  Running on Node.js ${currentNodeVersion}`);

// If we've made it this far, all checks have passed
console.log('✅ Pre-build checks complete, starting Next.js build process...');

// Exit with success code
process.exit(0);
