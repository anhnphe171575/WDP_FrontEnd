const path = require('path');

module.exports = {
  reactStrictMode: true,

  images: {
    domains: ['res.cloudinary.com', 'example.com'],
  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  },

  i18n: {
    locales: ['en', 'vi'],
    defaultLocale: 'vi',
  },

  webpack(config, options) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname),
    };
    return config;
  },

  // basePath: '/myapp',
};
