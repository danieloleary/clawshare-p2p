/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // GitHub Pages uses /{repo}/ path
  basePath: process.env.GITHUB_PAGES ? '/c2c' : '',
};

export default nextConfig;
