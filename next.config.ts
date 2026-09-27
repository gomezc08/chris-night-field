import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./src/sanity/lib/imageLoader.ts",
  },
};

export default nextConfig;
