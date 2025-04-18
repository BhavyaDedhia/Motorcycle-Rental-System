/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'images.unsplash.com',
      'www.google.com',
      'imgd.aeplcdn.com',
      'www.bikewale.com',
      'cdn.pixabay.com',
      'upload.wikimedia.org',
      'www.motorcyclevalley.com',
      'www.motorcyclenews.com',
      'www.visordown.com',
      'www.motorcycle.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig; 