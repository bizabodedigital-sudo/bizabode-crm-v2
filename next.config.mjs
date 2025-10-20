/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Externalize PDFKit to prevent bundling issues
  serverExternalPackages: ['pdfkit'],
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react', '@/components/ui'],
  },
  // Speed up dev compilation
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
}

export default nextConfig
