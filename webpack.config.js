require('dotenv').config();
const path = require('path');
const webpack = require('webpack');

const webpackConfig = {
  entry: {
    app: [
      'babel-polyfill',
      'react-hot-loader/patch',
      './src/index',
    ],
  },
  output: {
    path: path.resolve(__dirname, './public'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  module: {
    loaders: [
      { test: /\.js[x]?$/,
        exclude: /node_modules/,
        loader: 'babel-loader?cacheDirectory',
        query: {
          presets: [
            [
              'latest', {
                es2015: {
                  modules: false,
                },
              },
            ],
            'react',
          ],
          plugins: [
            'react-hot-loader/babel',
          ],
        },
      },

    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devServer: {
    contentBase: './static/',
    hot: true,
    inline: true,
    stats: true,
    clientLogLevel: 'info',
    proxy: [
      {
        context: ['/api'],
        target: `http://localhost:${process.env.PORT}`,
      },
    ],
  },
  devtool: 'eval',
  cache: true,
  plugins: [
    new webpack.DefinePlugin({
      AUTH0_CLIENT_ID: JSON.stringify(process.env.AUTH0_CLIENT_ID),
      AUTH0_DOMAIN: JSON.stringify(process.env.AUTH0_DOMAIN),
    }),
  ],
};

webpackConfig.module.loaders.push({
  test: /\.(scss|css)$/,
  loaders: ['style-loader', 'css-loader', 'sass-loader'],
});

module.exports = webpackConfig;
