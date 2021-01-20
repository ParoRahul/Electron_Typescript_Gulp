'use strict'

const gulp = require('gulp')

const webpack = require('webpack')

const {merge} = require('webpack-merge')

const webpackDevServer 	 = require('webpack-dev-server')

const uiConfigDev = require('./webpack.dev')

const port = 8080

gulp.task('devServer', function(){

  const config = merge({},uiConfigDev,{
    devServer: {
      contentBase: uiConfigDev.output.path,
      historyApiFallback: true,
      compress: true,
      hot: true,
      port: port,
      publicPath: "/",
    },
    target: 'web',
  })

  const serverConfig = webpack(config)
  new webpackDevServer(serverConfig,{ stats: { colors: true,  assetsSort: '!size' }})
  .listen( port, 'localhost', (error) => {
    if(error){       
        console.error("[webpack-dev-server]", "http://localhost:8080/webpack-dev-server/index.html")
        throw new Error("webpack-dev-server", error)
    }
  })
})