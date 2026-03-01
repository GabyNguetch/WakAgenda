import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "**" },
    ],
  },
  // Ajout du Proxy
  async rewrites() {
    // URL de ton backend (production ou dev)
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://wakagenda-backend.onrender.com';
    
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;