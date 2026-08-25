import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  // Cloudinary ya entrega cada variante redimensionada, comprimida y en formato automático.
  // Evitamos una segunda optimización en Railway y permitimos las rutas /media con variante.
  images: { unoptimized: true },
};

export default nextConfig;
