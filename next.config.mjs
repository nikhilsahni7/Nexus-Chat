/** @type {import('next').NextConfig} */
const nextConfig = {
  // include cloudinray.com domain in images

  images: {
    domains: ["res.cloudinary.com"],
  },
};

export default nextConfig;
