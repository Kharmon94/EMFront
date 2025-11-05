/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Hardcoded for Railway production deployment
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://rails-production-4b36.up.railway.app',
  },
  experimental: {
    optimizePackageImports: ['react-icons'],
  },
  // Enable standalone mode for Docker deployment
  output: 'standalone',
  // Disable image optimization for Railway
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig

