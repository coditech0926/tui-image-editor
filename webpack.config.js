/**
 * webpack.config.js created on 2016. 12. 01.
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */

const pkg = require('./package.json');
const webpack = require('webpack');
const SafeUmdPlugin = require('safe-umd-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const isProduction = process.argv.indexOf('-p') > -1;

const FILENAME = pkg.name + (isProduction ? '.min' : '');
const BANNER = [
    `${FILENAME}.js`,
    `@version ${pkg.version}`,
    `@author ${pkg.author}`,
    `@license ${pkg.license}`
].join('\n');

module.exports = {
    eslint: {
        failOnError: isProduction
    },
    entry: './src/index.js',
    output: {
        library: ['tui', 'ImageEditor'],
        libraryTarget: 'umd',
        path: 'dist',
        publicPath: 'dist',
        filename: `${FILENAME}.js`
    },
    externals: {
        'tui-code-snippet': {
            'commonjs': 'tui-code-snippet',
            'commonjs2': 'tui-code-snippet',
            'amd': 'tui-code-snippet',
            'root': ['tui', 'util']
        },
        'fabric/dist/fabric.require': {
            'commonjs': 'fabric/dist/fabric.require',
            'commonjs2': 'fabric/dist/fabric.require',
            'amd': 'fabric/dist/fabric.require',
            'root': ['fabric']
        }
    },
    module: {
        preLoaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'eslint-loader'
            }
        ],
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel'
            },
            {
                test: /\.styl$/,
                loader: ExtractTextPlugin.extract('css-loader?sourceMap!stylus-loader?paths=src/css/')
            }

        ]
    },
    plugins: [
        new webpack.BannerPlugin(BANNER),
        new ExtractTextPlugin(`${FILENAME}.css`),
        new SafeUmdPlugin()
    ],
    devServer: {
        historyApiFallback: false,
        progress: true,
        inline: true,
        host: '0.0.0.0',
        disableHostCheck: true
    }
};
