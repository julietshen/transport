/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove the static export configuration for Vercel deployment
  // output: 'export',
  images: {
    unoptimized: true,
  },
  // Remove basePath for Vercel deployment
  // Vercel handles the domain correctly without these settings
  // ...(process.env.NODE_ENV === 'production' ? {
  //   basePath: '/transport',
  //   assetPrefix: '/transport/'
  // } : {}),
  // We can't use rewrites with output: 'export'
  // The scraped data should be placed directly in the public folder
  // and will be accessible at /scraped-data.json
}

module.exports = nextConfig 