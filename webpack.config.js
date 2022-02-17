const path = require('path');
const webpack = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const { extendDefaultPlugins } = require('svgo');

const isDevelopmentMode = process.env.NODE_ENV === 'development';

const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all'
        }
    };

    if (!isDevelopmentMode) {
        config.minimizer = [
            new TerserWebpackPlugin(),
            new CssMinimizerPlugin(),
        ];
    }

    return config;
};

const plugins = () => {
    const plugins = [
        new HTMLWebpackPlugin({
            title: 'Blume Slim - инновационное средство для похудения!',
            template: './index.html',
            filename: 'index.html',
            inject: 'body',
            minify: {
                collapseWhitespace: !isDevelopmentMode,
            },
            favicon: path.resolve(__dirname, 'src/assets/favicons/favicon.ico')
        }),
        new CleanWebpackPlugin(),
       /* new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src/assets'),
                    to: path.resolve(__dirname, 'dist/assets')
                }
            ]
        }),*/
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css'
        }),
    ];

    if (isDevelopmentMode) {
        plugins.push(new webpack.HotModuleReplacementPlugin());
    }

    if (!isDevelopmentMode) {
        plugins.push(new CssMinimizerPlugin());
        plugins.push(new TerserWebpackPlugin());
        plugins.push(new ImageMinimizerPlugin({
            minimizerOptions: {
                plugins: [
                    ['gifsicle', { interlaced: true }],
                    ['jpegtran', { progressive: true }],
                    ['optipng', { optimizationLevel: 5 }],
                    [
                        'svgo',
                        {
                            plugins: extendDefaultPlugins([
                                {
                                    name: 'removeViewBox',
                                    active: false,
                                },
                                {
                                    name: 'addAttributesToSVGElement',
                                    params: {
                                        attributes: [{ xmlns: 'http://www.w3.org/2000/svg' }],
                                    },
                                },
                            ]),
                        },
                    ],
                ]
            }
        }))
    }

    return plugins;
};

const rules = () => {
    return [
        {
            test: /\.css$/,
            use: [
                {
                    loader: MiniCssExtractPlugin.loader,
                },
                'css-loader'
            ]
        },
        {
            test: /\.scss$/,
            use: [
                {
                    loader: MiniCssExtractPlugin.loader,
                },
                'css-loader',
                'sass-loader'
            ]
        },
        {
            test: /\.(png|jp(e*)g|gif)$/,
            type: 'asset/resource'
            /*use: [
                {
                    loader: 'url-loader',
                    options: {
                        limit: 8192
                    }
                }
            ]*/
        },
        {
            test: /\.(ttf|woff|woff2|eot|svg|otf)$/,
            use: [
                {
                    loader: 'url-loader',
                    options: {
                        limit: 8000,
                        name: 'assets/fonts/[hash]-[name].[ext]'
                    }
                }
            ],
        },
        {
            test: /\.html$/,
            use: [
                {
                    loader: 'html-loader',
                    options: {
                        sources: true
                    }
                }
            ]
        }
    ];
};

module.exports = {
    target: 'web',
    context: path.resolve(__dirname, 'src'),
    entry: {
        main: './index.js'
    },
    mode: 'development',
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: plugins(),
    optimization: optimization(),
    resolve: {
        extensions: [
            '.js', '.scss'
        ],
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@assets': path.resolve(__dirname, 'assets')
        }
    },
    module: {
        rules: rules(),
    },
    devServer: {
        port: 5050,
        hot: true,
    }
}