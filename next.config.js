/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  productionBrowserSourceMaps: false,
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = 'eval-cheap-module-source-map';
    }
    // Exclude client directory from build
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/client/**', '**/node_modules/**']
    };
    return config;
  },
}

module.exports = nextConfig
