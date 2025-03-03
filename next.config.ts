/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during build in production
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during build
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['food-classifier-backend.onrender.com'],
    // Allow using remote patterns
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;