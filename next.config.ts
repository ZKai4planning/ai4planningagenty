import type { NextConfig } from "next";
import { fileURLToPath } from "url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    // Force Next to use this project as the root even if parent lockfiles exist.
    root: rootDir,
  },
};

export default nextConfig;
