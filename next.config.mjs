/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: `npm run build` writes a deployable site to /out.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};
export default nextConfig;
