// helpful:
// https://www.robinwieruch.de/minimal-react-webpack-babel-setup/
// https://www.valentinog.com/blog/webpack/
// https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html
const path = require('path');

const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: './index.js',
  mode: isDevelopment ? 'development' : 'production',
  devServer: {
    hot: true,
    static: {
      directory: path.join(__dirname , "")
    },
    port: 3000,
  },
  module: {
	  rules: [
      {
		  test: /\.(js)$/,
		  exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: "defaults" }]
              ],              
              plugins: [isDevelopment && 'react-refresh/babel'].filter(Boolean),
            },
          },
        ],
      },
      {
		  test: /\.css$/,
		  use: ['style-loader', 'css-loader'],
      }
	  ],
  },
  plugins: [
    isDevelopment && new ReactRefreshWebpackPlugin(),
  ].filter(Boolean),
  resolve: {
    extensions: [".webpack.js", ".web.js", ".js"]
  },
  output: {
    path: __dirname + '/dist',
    publicPath: '/dist',
    filename: 'bundle.js'
  },
  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",
	
};