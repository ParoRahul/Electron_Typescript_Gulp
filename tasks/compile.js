'use strict'

const gulp = require('gulp')
const typesscript = require('gulp-typescript')
const del = require('del')

/* const webpack = require('webpack-stream')

const {merge} = require('webpack-merge')

const {mainConfig} = require('./webpack.common')
const uiConfigDev = require('./webpack.dev')
const uiConfigProd = require('./webpack.prod')

const paths = {
  mainProcessdir: '../src/main-process/*.ts',
  rendederProcessdir: '../src/main/*',
  mainOutDir : mainConfig.output.path,
  rendererOutDir : uiConfigProd.output.path
}

gulp.task('clean-main',async function(){
    await del(['./temp/main-process'])
})

gulp.task('compile-main', gulp.series('clean-main', function() {
    const extraConfig = process.env.NODE_ENV == 'development'?
                        { mode: 'development', devtool:'source-map'}:
                        { mode: 'production'}
    return gulp.src(paths.mainProcessdir)
    .pipe(webpack(merge({}, mainConfig,extraConfig)) )
    .pipe(gulp.dest(mainConfig.output.path))
}))

gulp.task('clean-renderer',async function(){
  await del.sync(['./temp/renderer-process'])
})

gulp.task('compile-renderer', gulp.series('clean-renderer',function() {
  let rendererConfig = process.env.NODE_ENV == 'development' ? uiConfigDev : uiConfigProd
  // rendererConfig = merge({}, rendererConfig,{ })
  // console.log(rendererConfig.output.path)
  return  gulp.src(paths.rendederProcessdir)
              .pipe(webpack(rendererConfig))
              .pipe(gulp.dest(rendererConfig.output.path))
}))

gulp.task('compile', gulp.series('clean',gulp.parallel('compile-main', 'compile-renderer')))

*/


const RESOUCE_LIST = [{source:'./src/*.js', dest: './temp'},
    {source:'./src/renderer-process/*.js', dest: './temp/renderer-process'},
    {source:'./src/renderer-process/*.html', dest: './temp/renderer-process'},
    {source:'./src/renderer-process/media/*', dest: './temp/renderer-process/media'},
    {source:'./src/renderer-process/base/aria/*.css', dest: './temp/renderer-process/base/aria'},
    {source:'./src/renderer-process/base/messagelist/*.css', dest: './temp/renderer-process/base/messagelist'}
  ]

gulp.task('clean',async function(){
    await del.sync(['./temp'])
})


gulp.task('move-resource',async function(){
    RESOUCE_LIST.forEach(item => {
      gulp.src(item['source']).pipe(gulp.dest(item['dest']))
    })
})

gulp.task('transpile', gulp.series('clean',function () {
  const tsProject = typesscript.createProject('tsconfig.json')
  return tsProject.src()
          .pipe(tsProject())
          .js.pipe(gulp.dest('temp'))
}, 'move-resource'))