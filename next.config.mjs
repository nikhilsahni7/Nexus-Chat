/** @type {import('next').NextConfig} */
const nextConfig = {
  // include cloudinray.com domain in images

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  reactStrictMode: true,
};

export default nextConfig;
