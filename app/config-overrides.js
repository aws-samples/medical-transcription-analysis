const webpack = require('webpack');

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};

  Object.assign(fallback, {
    crypto: 'crypto-browserify',
    stream: 'stream-browserify',
    assert: 'assert',
    http: 'stream-http',
    os: 'os-browserify',
    path: 'path-browserify',
    url: 'url',
    https: 'https-browserify',
  });

  config.resolve.fallback = fallback;

  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ]);

  return config;
};
