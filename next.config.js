/** @type {import('next').NextConfig} */
const nextConfig = {
  
  serverExternalPackages: ['sharp'],
  images: {
    unoptimized: true
  },
  // Ensure we're using the app directory structure
  // useFileSystemPublicRoutes: false
}

module.exports = nextConfig 