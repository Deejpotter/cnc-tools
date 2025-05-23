/**
 * Next.js Configuration File
 * Updated: 24/05/2025
 * Author: Deej Potter
 * 
 * This configures Next.js for both local development and Netlify deployment.
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    images: {
        domains: ['www.gravatar.com'],
    },
    // Configure how Next.js handles trailing slashes in URLs
    trailingSlash: false,

    // Use server-side rendering instead of static export to support Server Actions
    // output: 'export', // Removed to enable Server Actions

    // This ensures compatibility with Netlify's plugin-nextjs
    distDir: '.next',

    // Security headers can be added here if needed
    // headers: async () => [],

    // Redirects can be added here if needed
    // redirects: async () => [],

}

module.exports = nextConfig
