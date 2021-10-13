// helpful:
// https://www.robinwieruch.de/minimal-react-webpack-babel-setup/
// https://www.valentinog.com/blog/webpack/
// https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html
const path = require('path');

const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = {
	entry: './index.js',
	mode: 'development',
	devServer: {
		hot: true,
		static: {
			directory: path.join(__dirname , "")
		},
		port: 3000,
	},
	plugins: [
		new ReactRefreshWebpackPlugin(),
	],
	module: {
	  rules: [
		{
		  test: /\.(js)$/,
		  exclude: /node_modules/,
		  loader: 'babel-loader',
		  options: {
			plugins: ['react-refresh/babel'],
		  },
		}
	  ],
    },
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