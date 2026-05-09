import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  // Railway deployment: runs as standard Node.js server (next start)
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Required for ioredis (server-side only)
  serverExternalPackages: ["ioredis"],
};

export default nextConfig;
