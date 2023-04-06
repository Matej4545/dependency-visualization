/** @type {import('next').NextConfig} */
const nextConfig = {
  // React Strict Mode must be turned off in order to render the graph properly
  // See https://github.com/vasturiano/react-force-graph/issues/390 for more details
  reactStrictMode: false,
  swcMinify: true,
  output: "standalone",
  webpack: (config) => {
    // this will override the experiments
    config.experiments = { ...config.experiments, topLevelAwait: true };
    // this will just update topLevelAwait property of config.experiments
    // config.experiments.topLevelAwait = true
    return config;
  },
};

module.exports = nextConfig;
