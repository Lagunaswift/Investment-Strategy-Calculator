/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Enable Fast Refresh with better error handling
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  
  // Add environment variables
  env: {
    API_BASE_URL: process.env.NEXT_PUBLIC_MARKET_API_URL || ''
  },
  
  // Add image optimization settings
  images: {
    domains: [],
    unoptimized: false
  },
  
  // Serverless configuration
  serverRuntimeConfig: {
    enabled: process.env.NODE_ENV === 'production'
  }
};

module.exports = nextConfig;
