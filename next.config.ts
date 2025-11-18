import path from "path";
import type { NextConfig } from "next";
import type { Configuration as WebpackConfig } from "webpack";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  images: {
    domains: ["images.unsplash.com"],
  },
  webpack: (config: WebpackConfig) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    // 👇👇 Cast ici !
    (config.resolve.alias as { [key: string]: string })['@'] = path.resolve(process.cwd());
    return config;
  },
};

export default nextConfig;
