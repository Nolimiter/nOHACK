# nOHACK Deployment Guide

## Table of Contents
1. [GitHub Pages Deployment](#github-pages-deployment)
2. [Vercel Deployment](#vercel-deployment)
3. [Environment Variables](#environment-variables)
4. [Build Configuration](#build-configuration)

## GitHub Pages Deployment

This project is configured for deployment on GitHub Pages using GitHub Actions.

### Prerequisites
- A GitHub account
- Admin access to the repository
- The project must be pushed to a GitHub repository

### Steps
1. Ensure your `next.config.js` file has the correct configuration for GitHub Pages:
   ```js
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
   ```

2. The GitHub Actions workflow file `.github/workflows/deploy.yml` is already configured in the repository.

3. Enable GitHub Pages in your repository settings:
   - Go to your repository on GitHub
   - Navigate to Settings > Pages
   - Select "Deploy from a branch"
   - Choose "gh-pages" as the branch and "/ (root)" as the folder
   - Click "Save"

4. After pushing changes to the main branch, GitHub Actions will automatically build and deploy your site to the `gh-pages` branch.

### Accessing Your Site
Your site will be available at: `https://<your-username>.github.io/nOHACK/`

## Vercel Deployment

Alternatively, you can deploy this project to Vercel for a more seamless experience with Next.js applications.

### Prerequisites
- A Vercel account (https://vercel.com/signup)

### Steps
1. Install the Vercel CLI: `npm install -g vercel`
2. Navigate to the frontend directory: `cd nOHACK/frontend`
3. Run `vercel` and follow the prompts
4. Link your GitHub repository to Vercel for automatic deployments

## Environment Variables

For the frontend application, you may need to set the following environment variables:

```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Build Configuration

The project is configured to build as a static export, which is required for GitHub Pages deployment. The following settings in `next.config.js` are important:

- `output: 'export'` - Enables static export
- `trailingSlash: true` - Ensures all routes have trailing slashes
- `images.unoptimized: true` - Required for GitHub Pages compatibility
- `basePath` and `assetPrefix` - Ensure assets are loaded correctly when hosted in a subdirectory