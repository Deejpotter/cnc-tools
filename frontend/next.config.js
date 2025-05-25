/**
 * Next.js Configuration File
 * Updated: 25/05/2025
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
}

module.exports = nextConfig
