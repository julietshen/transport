/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // We need to choose one approach - either static export OR server rendering
  // For Vercel and to ensure proper asset loading, let's NOT use static export
  // output: 'export',
  
  // Configure images for Vercel
  images: {
    unoptimized: true,
  },
  
  // Ensure all paths work correctly without path prefixes
  // No basePath needed for Vercel deployment
  
  // Force a new deployment on Vercel
}

module.exports = nextConfig 