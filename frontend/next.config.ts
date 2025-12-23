import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
 
const isDev = process.env.NODE_ENV === 'development';
const forceImageOptimization = process.env.NEXT_PUBLIC_LH === 'true';
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
const usesLocalApi = /localhost|127\\.0\\.0\\.1|\\[::1\\]/.test(apiUrl);
const shouldOptimizeImages = forceImageOptimization || !usesLocalApi;

const nextConfig: NextConfig = {
  // External packages for server components
  productionBrowserSourceMaps: true,
  serverExternalPackages: ['@tsparticles/engine', '@tsparticles/slim'],
  
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    // Enable optimizePackageImports for better tree shaking
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-label', '@radix-ui/react-slot'],
  },
  
  // Turbopack configuration (moved from experimental)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Bundle analyzer for production builds
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
        };
      }

      // Optimize bundle splitting
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          maxSize: 244000, // 244KB
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          maxSize: 244000,
        }
      };
      
      return config;
    },
  }),
  
  // Image optimization
  images: {
    // Enable modern formats
    formats: ['image/webp', 'image/avif'],
    // Add image optimization
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    // Enable responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [35, 60, 65, 70, 75],
    // Loader optimization
    loader: 'default',
    // Disable optimization in dev unless explicitly running Lighthouse.
    unoptimized: isDev ? !shouldOptimizeImages : false,
    // Allow images from localhost for development
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: '**', // Allow any HTTPS hostname for production
      },
    ],
  },
  
  // Enable compression
  compress: true,
  
  // Enable React compiler optimizations
  reactStrictMode: true,
  
  // Power optimizations
  poweredByHeader: false,
  
  // Output optimization
  output: 'standalone',
  
  // Headers for performance and security
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
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  },
  
  // Enable logging for production debugging
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
};
 
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
