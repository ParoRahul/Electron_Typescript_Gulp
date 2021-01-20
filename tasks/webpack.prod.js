const { merge } = require('webpack-merge')
const { rendererConfig } = require('./webpack.common')

// eslint-disable-next-line @typescript-eslint/naming-convention
const MiniCssExtractPlugin  = require('mini-css-extract-plugin')

module.exports = merge ({},rendererConfig, {
    mode: "production",
    output: {
        filename: "[name].[contenthash].js",
        path: rendererConfig.output.path,
    },
    module: {
        rules: [
          {
            test: /\.(scss|css)$/,
            use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
          },
        ],
    },
    plugins: [  new MiniCssExtractPlugin({filename: "[name].[contenthash].css"})],
})