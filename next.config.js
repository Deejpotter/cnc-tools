/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['www.gravatar.com'],
    },
    // transpilePackages: ['tstl', 'ecol'], // Removed as @pluslab/3d-bin-packing is no longer used
}

module.exports = nextConfig
