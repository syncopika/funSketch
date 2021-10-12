// helpful:
// https://www.robinwieruch.de/minimal-react-webpack-babel-setup/
// https://www.valentinog.com/blog/webpack/
// https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html
const path = require('path');

module.exports = {
	entry: './index.js',
	mode: 'development',
	devServer: {
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
		  use: ['babel-loader']
		}
	  ],
    },
	resolve: {
		extensions: [".webpack.js", ".web.js", ".js"]
	},
	output: {
		path: __dirname + '/dist',
		publicPath: '/',
		filename: 'bundle.js'
	},
    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",
	
};