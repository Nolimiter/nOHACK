/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove export settings for Vercel deployment
  trailingSlash: false, // Standard Next.js behavior
  images: {
    unoptimized: false, // Let Vercel handle image optimization
  },
  // Remove basePath and assetPrefix for Vercel
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;