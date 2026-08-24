import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Static export so Cloudflare Pages can deploy from Git without a Node server.
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
