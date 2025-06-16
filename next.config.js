/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    CUSTOM_KEY: 'my-value',
  },
  images: {
    domains: ['localhost', 'db.88toy.co.kr'],
  },
  async rewrites() {
    return [
      {
        source: '/api/notion/:path*',
        destination: '/api/notion/:path*',
      },
      {
        source: '/api/nas/:path*',
        destination: '/api/nas/:path*',
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;