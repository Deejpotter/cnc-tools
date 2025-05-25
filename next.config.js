/**
 * Next.js Configuration File
 * Updated: 25/05/2025
 * Author: Deej Potter
 * 
 * This configures Next.js for both local development and Netlify deployment.
 * @type {import('next').NextConfig}
 */

// Set NODE_OPTIONS to suppress specific deprecation warnings from external libraries
process.env.NODE_OPTIONS = process.env.NODE_OPTIONS || '';
if (!process.env.NODE_OPTIONS.includes('--no-deprecation')) {
    process.env.NODE_OPTIONS += ' --no-deprecation';
}

const nextConfig = {
    images: {
        domains: ['www.gravatar.com'],
    },

    // Configure how Next.js handles trailing slashes in URLs
    trailingSlash: false,

    // Configure output for Netlify compatibility
    output: 'standalone',    // Optimize for serverless environments
    experimental: {
        // Enable optimizations for serverless deployments
        serverComponentsExternalPackages: ['mongodb'],
    },

    // Prevent API routes from being incorrectly bundled
    webpack: (config, { isServer }) => {
        if (isServer) {
            // Ensure API routes are properly bundled for serverless
            config.optimization.moduleIds = 'named';
        }
        return config;
    },

    // Enable better error tracing for API routes
    onDemandEntries: {
        // Period (in ms) where the server will keep pages in the buffer
        maxInactiveAge: 60 * 1000,
        // Number of pages that should be kept simultaneously without being disposed
        pagesBufferLength: 5,
    },
}

module.exports = nextConfig
