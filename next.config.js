/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Only use basePath in production
  ...(process.env.NODE_ENV === 'production' ? {
    basePath: '/transport',
    assetPrefix: '/transport/'
  } : {}),
  // We can't use rewrites with output: 'export'
  // The scraped data should be placed directly in the public folder
  // and will be accessible at /scraped-data.json
}

module.exports = nextConfig 