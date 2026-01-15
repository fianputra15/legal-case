import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use typed routes
  typedRoutes: true,
  
  // Empty turbopack config to silence the warning
  turbopack: {},
  
  // Page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
};

export default nextConfig;
