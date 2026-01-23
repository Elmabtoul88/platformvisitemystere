/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
    ],
  },
  // Environment variables prefixed with NEXT_PUBLIC_ are automatically available client-side.
  // You only need this section if you have server-side only variables you want to expose differently,
  // or for complex build-time configurations.
  // env: {
  //   // Example: Make a server-only variable available at build time
  //   // BUILD_TIME_INFO: process.env.SERVER_ONLY_VARIABLE,
  // },
};

module.exports = nextConfig;