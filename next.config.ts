import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // Serve the printable static guide at a clean, extensionless URL.
      { source: "/userguidelines", destination: "/userguidelines.html" },
    ];
  },
};

export default nextConfig;
