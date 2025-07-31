/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'instagram.com',
      },
      {
        protocol: 'https',
        hostname: '*.instagram.com',
      },
      {
        protocol: 'https',
        hostname: 'tiktok.com',
      },
      {
        protocol: 'https',
        hostname: '*.tiktok.com',
      },
      {
        protocol: 'https',
        hostname: 'youtube.com',
      },
      {
        protocol: 'https',
        hostname: '*.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'youtu.be',
      },
      {
        protocol: 'https',
        hostname: 'linkedin.com',
      },
      {
        protocol: 'https',
        hostname: '*.linkedin.com',
      }
    ]
  },
  // Configure larger request body limits for Server Actions
  experimental: {
    serverActions: {
      // Increase body size limit to 10MB (from default 1MB)
      bodySizeLimit: '10mb',
    },
  }
};

export default nextConfig;
