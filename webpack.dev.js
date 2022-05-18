const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const mode = 'development';

module.exports = {
  output: {
    path: path.resolve(__dirname, 'public'),
  },
  mode,
  resolve: {
    extensions: [".js"]
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: path.resolve(__dirname, './src/index.html'),
      filename: path.resolve(__dirname, './public/index.html')
    }),
  ],
  devtool: 'eval-source-map',
  devServer: {
    contentBase: [
      path.join(__dirname, 'public'),
    ],
    compress: true,
    port: 8080,
    inline: true
  },
};
