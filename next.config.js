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
    experimental: {
    esmExternals: 'loose'
  },
  
  // Configure webpack to handle FFmpeg and Web Workers
  webpack: (config, { isServer }) => {
    // Don't process FFmpeg on the server side
    if (isServer) {
      config.externals.push('@ffmpeg/ffmpeg', '@ffmpeg/util');
    } else {
      // Client-side configuration for FFmpeg
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // Handle Web Workers
    config.module.rules.push({
      test: /\.worker\.js$/,
      use: { loader: 'worker-loader' },
    });

    return config;
  },
  
  // Configure headers for SharedArrayBuffer (needed for FFmpeg)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
  }