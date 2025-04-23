import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.mux.com",
      }
    ],
    domains: ['0egndxnu6x.ufs.sh']
    
  }
};

export default nextConfig;
