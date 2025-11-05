import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker/Railway deployment
  output: 'standalone',
  
  // Configure image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
      },
      {
        protocol: 'https',
        hostname: '**.ipfs.dweb.link',
      },
    ],
  },
  
  // Enable React strict mode
  reactStrictMode: true,
  
  // Experimental features for PWA
  experimental: {
    optimizePackageImports: ['@solana/wallet-adapter-react', '@solana/web3.js'],
  },
};

export default nextConfig;
