import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      {
        source: "/craft/:slug*",
        destination: "/item/:slug*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
