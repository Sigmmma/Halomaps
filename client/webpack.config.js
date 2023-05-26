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
				test: /\.(gif)$/,
				type: 'asset/resource',
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
	},
	mode: process.argv.NODE_ENV === 'production' ? 'production' : 'development',
	devtool: 'inline-source-map',
};
