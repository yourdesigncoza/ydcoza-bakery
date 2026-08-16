import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root; a stray lockfile in a parent directory otherwise
  // makes Turbopack guess at it.
  turbopack: { root: import.meta.dirname },
  images: {
    // Rendered previews and customer inspiration photos are served from Blob.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
