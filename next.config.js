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

    // Security headers can be added here if needed
    // headers: async () => [],

    // Redirects can be added here if needed
    // redirects: async () => [],

}

module.exports = nextConfig
