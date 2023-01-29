/** @type {import('next').NextConfig} */
const nextConfig = {
  // React Strict Mode must be turned off in order to render the graph properly
  // See https://github.com/vasturiano/react-force-graph/issues/390 for more details
  reactStrictMode: false,
  swcMinify: true,
  output: 'standalone',
};

module.exports = nextConfig;
