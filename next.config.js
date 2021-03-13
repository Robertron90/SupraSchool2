const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(
              __dirname,
              'node_modules',
              '@zoomus',
              'instantsdk',
              'dist',
              'lib'
            ),
            to: path.resolve(__dirname, 'public', 'lib'),
          },
        ],
      })
    );

    return config;
  },
};
