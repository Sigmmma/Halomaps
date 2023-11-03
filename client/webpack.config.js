const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: './src/index.tsx',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: 'ts-loader',
			},
			{
				test: /\.(gif|ico|png)$/,
				type: 'asset/resource',
			},
			{
				test: /\.html$/,
				loader: 'html-loader',
			},
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"],
			},
		],
	},
	plugins: [new HtmlWebpackPlugin({
		favicon: path.join(__dirname, 'static', 'favicon.ico'),
		template: path.join(__dirname, 'static', 'index.html'),
	})],
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist'),
		publicPath: '/index.cfm',
	},
	mode: process.argv.NODE_ENV === 'production' ? 'production' : 'development',
	devtool: 'inline-source-map',
	devServer: {
		// Need "server" to handle initial redirect so we can actually load React.
		// See: https://ui.dev/react-router-cannot-get-url-refresh
		historyApiFallback: {
			index: '/index.cfm',
		},
	},
};
