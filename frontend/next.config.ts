import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
 
const nextConfig: NextConfig = {
  // Enable experimental features for better performance
  experimental: {
    // Enable optimizePackageImports for better tree shaking
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  
  // Image optimization
  images: {
    // Enable modern formats
    formats: ['image/webp', 'image/avif'],
    // Add image optimization
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    // Enable responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Enable compression
  compress: true,
  
  // Enable React compiler optimizations
  reactStrictMode: true,
  
  // Enable SWC minification
  swcMinify: true,
  
  // Optimize bundle
  webpack: (config, { isServer }) => {
    // Optimize for production
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    return config;
  },
  
  // Power optimizations
  poweredByHeader: false,
  
  // Headers for performance
  async headers() {
    return [
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
 
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);