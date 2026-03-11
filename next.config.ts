import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Fix for "Cross origin request detected" warning in Cloud Workstations
  experimental: {
    serverActions: {
      allowedOrigins: [
        '6000-firebase-studio-1773164205444.cluster-qmsugz722jg6qxf6wapsr2r5hc.cloudworkstations.dev',
        'localhost:9002'
      ]
    }
  }
};

export default nextConfig;
