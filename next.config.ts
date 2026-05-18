import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server-side file system access enabled by default in Next.js
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.thegatheringhub.biz" }],
        destination: "https://thegatheringhub.biz/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
