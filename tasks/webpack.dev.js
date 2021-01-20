const { merge } = require('webpack-merge')
const { rendererConfig } = require('./webpack.common')

module.exports = merge({}, rendererConfig, {
    mode: 'development',
    devtool: 'source-map',
    output: {
      filename: '[name].js',
      path: rendererConfig.output.path,
      
    },
    module: {
      rules: [
        {
          test: /\.(scss|css)$/,
          use: ['style-loader', 'css-loader?sourceMap', 'sass-loader?sourceMap'],
        },
      ],
    }
})