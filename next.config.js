/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'ranktop.net',
          },
        ],
        destination: 'https://ranktop.net/:path*',
        permanent: true,
      },
    ]
  },
};

module.exports = nextConfig;