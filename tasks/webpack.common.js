const path = require("path")

const webpack = require('webpack')
const {merge} = require('webpack-merge')

const htmlWebpackPlugin = require('html-webpack-plugin')

// eslint-disable-next-line @typescript-eslint/naming-convention
// const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const { getChannel } = require('../scripts/distInfo')

const channel = getChannel()

const replacements = {    
  __DARWIN__: process.platform === 'darwin',
  __WIN32__: process.platform === 'win32',
  __LINUX__: process.platform === 'linux',
  __DEV__: channel === 'dev',
  __RELEASE_CHANNEL__: JSON.stringify(channel),
  'process.platform': JSON.stringify(process.platform),
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'dev'),
  'process.env.TEST_ENV': JSON.stringify(process.env.TEST_ENV),
}

const externals = ['7zip']

const outputDirMain = '../temp/main'

const outputDirRenderer = '../temp/renderer'

if (channel === 'development') {
    externals.push('devtron')
}

const commonConfig = {
    optimization: {
      noEmitOnErrors: true,
    },
    plugins: [
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/
      }),
    ],
    resolve: {
      extensions: ['.ts','.js'],
    },
    node: {
      __dirname: false,
      __filename: false,
    },
}

module.exports.mainConfig = merge( {}, commonConfig,
    {
      entry: { main: path.resolve(__dirname, '../src/main-process/bootstrap') },
      module: {
        rules: [
          {
            test: /\.ts$/,
            include: [path.resolve(__dirname, '../src/main-process'),
                      path.resolve(__dirname, '../src/common')],
            use: [ { loader: 'ts-loader' },],
            exclude: /node_modules/,
          }
        ],
      },
      output: {
        filename: '[name].js',
        path: path.resolve(__dirname,  outputDirMain),
        libraryTarget: 'amd'
      },
      target: 'electron-main',
      plugins: [
        new webpack.DefinePlugin(
          Object.assign({}, replacements, {
            __PROCESS_KIND__: JSON.stringify('main'),
          })
        ),
      ],
    },
)

module.exports.rendererConfig = merge({}, commonConfig, {
    entry: { renderer: path.resolve(__dirname, '../src/renderer-process/index') },
    module: {
      rules: [
        {
          test: /\.ts$/,
          include: path.resolve(__dirname, '../src/renderer-process'),
          use: [ { loader: 'ts-loader' },],
          exclude: /node_modules/,
        },
        {
          test: /\.html$/i,
          use: ['html-loader'],
        },
        {
            test: /\.(jpe?g|png|gif|ico)$/,
            use: {
              loader: "file-loader",
              options: {
                  name: "[name].[ext]",
                  outputPath: "images"
              }
          }
        }
      ],
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname,  outputDirRenderer),
    },
    target: 'electron-renderer',
    plugins: [
      new htmlWebpackPlugin({
        template: path.resolve(__dirname, '../src/index.html'),
        chunks: ['renderer'],
      }),
      new webpack.DefinePlugin(
        Object.assign({}, replacements, {
          __PROCESS_KIND__: JSON.stringify('renderer'),
        })
      ),
    ],
})