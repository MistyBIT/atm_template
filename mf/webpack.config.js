const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const { ModuleFederationPlugin } = require('webpack').container;

const publicHost = process.env.ATM_DEV_PUBLIC_HOST || 'localhost';
const MF_PORT = Number(process.env.ATM_TEMPLATE_MF_PORT || 3090);
const apiProxy =
  process.env.TOOL_API_PROXY_TARGET || `http://127.0.0.1:${process.env.TOOL_API_PORT || 8080}`;

/** Абсолютный URL чанков MF. Нельзя использовать '/' при встраивании с другого origin (host) — remoteEntry тогда грузит чанки с порта страницы (:3000). */
const rawMfPublic = String(process.env.ATM_MF_PUBLIC_PATH || '').trim();
const mfPublicPath = rawMfPublic
  ? `${rawMfPublic.replace(/\/$/, '')}/`
  : `http://${publicHost}:${MF_PORT}/`;

/** Origin MF без завершающего слэша — для fetch /v1 при встраивании в host (иначе /v1 уходит на :3000). */
const mfPublicOrigin = mfPublicPath.replace(/\/$/, '');

/** Имя remote в host ATM должно совпадать с config.ui.remoteKey (замените при клонировании) */
const remoteName =
  process.env.ATM_TEMPLATE_REMOTE_NAME || 'remote_template';

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    publicPath: mfPublicPath,
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
      'process.env.ATM_TOOL_MF_PUBLIC_ORIGIN': JSON.stringify(mfPublicOrigin),
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
