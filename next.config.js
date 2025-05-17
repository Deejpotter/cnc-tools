/**
 * Next.js Configuration File
 * Updated: 17/05/2025
 * Author: Deej Potter
 * 
 * This configures Next.js for both local development and Netlify deployment.
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    images: {
        domains: ['www.gravatar.com'],
    },
    // Explicitly set output directory for Netlify builds
    output: 'standalone',

    // Configure how Next.js handles trailing slashes in URLs
    trailingSlash: false,

    // Security headers can be added here if needed
    // headers: async () => [],

    // Redirects can be added here if needed
    // redirects: async () => [],

}

module.exports = nextConfig
