// helpful:
// https://www.robinwieruch.de/minimal-react-webpack-babel-setup/
// https://www.valentinog.com/blog/webpack/
// https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html

module.exports = {
	entry: './index.js',
	module: {
	  rules: [
		{
		  test: /\.(js)$/,
		  exclude: /node_modules/,
		  use: ['babel-loader']
		},
		{ 
		  test: /\.tsx?$/, 
		  loader: "awesome-typescript-loader" 
		}
	  ],
    },
	resolve: {
		extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
	},
	output: {
		path: __dirname + '/dist',
		publicPath: '/',
		filename: 'bundle.js'
	},
    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",
	
};