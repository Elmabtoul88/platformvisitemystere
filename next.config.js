/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Note: These TS/ESLint ignore options might not be necessary in JS,
  // but we keep them for consistency or if mixed code exists.
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
    ],
  },
};

module.exports = nextConfig;
