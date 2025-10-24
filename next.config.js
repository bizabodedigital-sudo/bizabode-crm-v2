/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['mongoose'],
  images: {
    domains: ['localhost'],
  },
  // Enable standalone output for Docker
  output: 'standalone',
  // Webpack configuration to fix Next.js 15 build issues
  webpack: (config, { isServer }) => {
    // Disable problematic minifier in Docker builds
    if (process.env.NODE_ENV === "production" && process.env.DOCKER_BUILD) {
      config.optimization.minimize = false;
    }
    return config;
  },
  experimental: {
    esmExternals: false, // Prevents "WebpackError is not a constructor"
  },
  eslint: { 
    ignoreDuringBuilds: true 
  },
  typescript: { 
    ignoreBuildErrors: true 
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  // Redirects for production
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;
