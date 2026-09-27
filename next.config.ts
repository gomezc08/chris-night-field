import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev-only route indicator sits on top of the scene's bottom-left controls.
  // Compile and runtime errors still show without it.
  devIndicators: false,
  images: {
    loader: "custom",
    loaderFile: "./src/sanity/lib/imageLoader.ts",
  },
};

export default nextConfig;
