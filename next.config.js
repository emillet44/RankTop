/** @type {import('next').NextConfig} */

module.exports = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'storage.googleapis.com',
          port: '',
          pathname: '/ranktop-i/**',
        },
      ],
    },
  }