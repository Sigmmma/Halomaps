const { existsSync } = require('fs');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { DefinePlugin } = require('webpack');
const { merge } = require('webpack-merge');

// TODO can we make this less stupid? This is stupid.
const PROD_CONF_FILE = '../prod_conf.json';
const prodConfig = existsSync(PROD_CONF_FILE) ? require(PROD_CONF_FILE) : {};

const DEFAULT_SERVER_URL = 'http://localhost:9123';

function processEnvPlugin({ server_url, client_base_url }) {
	return new DefinePlugin({
		'process.env': {
			SERVER_URL: JSON.stringify(server_url),
			CLIENT_BASE_URL: JSON.stringify(client_base_url),
		},
	});
}

const DEV_CONFIG = {
	mode: 'development',
	devtool: 'inline-source-map',
	devServer: {
		historyApiFallback: {
			verbose: true,
		},
	},
	plugins: [processEnvPlugin({
		server_url: DEFAULT_SERVER_URL,
		client_base_url: '', // On localhost with no webserver
	})],
};

const PROD_CONFIG = {
	mode: 'production',
	devServer: {
		port: prodConfig.clientPort,
		historyApiFallback: {
			verbose: true,
		},
	},
	performance: {
		hints: false,
	},
	plugins: [processEnvPlugin({
		server_url: prodConfig.serverUrl ?? DEFAULT_SERVER_URL,
		client_base_url: prodConfig.clientBaseUrl ?? '',
	})],
};

module.exports = merge({
	entry: './src/index.tsx',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: 'ts-loader',
			},
			{
				test: /\.(gif|ico|png|jpg)$/i,
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
		clean: true,
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist'),
	},
	devServer: {
		historyApiFallback: {
			disableDotRule: true,
		},
		static: './static',
		port: 9000,
	},
}, process.env.NODE_ENV === 'production' ? PROD_CONFIG : DEV_CONFIG);
