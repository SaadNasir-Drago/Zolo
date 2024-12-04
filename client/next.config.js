/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // This should be at the top level

  eslint: {
    ignoreDuringBuilds: true, // Add the eslint configuration here
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    
    return config; // Make sure to return the config properly
  },
};

module.exports = nextConfig;
