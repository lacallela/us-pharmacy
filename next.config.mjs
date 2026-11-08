/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': ['./data/**/*'],
      '/admin/**/*': ['./data/**/*'],
      '/**/*': ['./data/**/*'],
    },
  },
};

export default nextConfig;
