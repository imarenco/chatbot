/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure compatibility with Node.js 16
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig 