const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const { ModuleFederationPlugin } = require('webpack').container;

const isProd = process.env.NODE_ENV === 'production';
const publicHost = process.env.ATM_DEV_PUBLIC_HOST || 'localhost';
const MF_PORT = Number(process.env.ATM_TEMPLATE_MF_PORT || 3090);
const apiProxy =
  process.env.TOOL_API_PROXY_TARGET || `http://127.0.0.1:${process.env.TOOL_API_PORT || 8080}`;

/** Имя remote в host ATM должно совпадать с config.ui.remoteKey (замените при клонировании) */
const remoteName =
  process.env.ATM_TEMPLATE_REMOTE_NAME || 'remote_template';

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    publicPath: isProd ? '/' : `http://${publicHost}:${MF_PORT}/`,
    clean: true,
    uniqueName: 'atm_remote',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.ATM_TEMPLATE_REMOTE_NAME': JSON.stringify(remoteName),
    }),
    new ModuleFederationPlugin({
      name: remoteName,
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.js',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.3.1' },
        'react-dom': { singleton: true, requiredVersion: '^18.3.1' },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  devServer: {
    port: MF_PORT,
    host: '0.0.0.0',
    allowedHosts: 'all',
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    historyApiFallback: true,
    proxy: [
      {
        context: ['/v1'],
        target: apiProxy,
        changeOrigin: true,
      },
    ],
  },
};
