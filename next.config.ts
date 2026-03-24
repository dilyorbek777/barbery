import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Native apps can't use Next.js server-side image optimization
  }
};

export default nextConfig;
