/** @type {import('next').NextConfig} */
const nextConfig = {
 output: 'export', // This enables static export for GitHub Pages
  trailingSlash: true, // Add trailing slashes to URLs for GitHub Pages compatibility
  images: {
    unoptimized: true, // Required for GitHub Pages static export
  },
  basePath: '/nOHACK', // GitHub Pages subdirectory path
  assetPrefix: '/nOHACK/', // Prefix for assets to work correctly on GitHub Pages
};

module.exports = nextConfig;