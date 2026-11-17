/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pages are pre-rendered at build time; the only server code is /api/contact
  // (real form submissions). Deployed on Vercel.
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};
export default nextConfig;
