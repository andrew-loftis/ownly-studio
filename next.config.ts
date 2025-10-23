import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Ensure Next picks this folder as the workspace root
    root: __dirname,
  },
};

export default nextConfig;
