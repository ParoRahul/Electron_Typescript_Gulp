
'use strict'

const path = require('path')
const fs = require('fs')
const  url = require('url')

const { app, protocol } = require('electron')

process.on('uncaughtException', function (error = new Error()) {
  if (error.message != null) {
    console.log(error.message)
  }
  if (error.stack != null) {
    console.log(error.stack)
  }
})

process.on('unhandledRejection', function (reason = {}) {
  console.error('unhandled Rejection with details')
  console.error(reason)
})

/* import "reflect-metadata"
import { container } from 'tsyringe'
import { Application, Iapplication } from './application' */


const userDataPath = path.join(app.getPath('appData'), 'myApp')

function setNodeCachedDir() {
  const nodeCachedDataDir = path.join(userDataPath, 'CachedData')
  fs.mkdir(nodeCachedDataDir, { recursive: true }, function (error) {
    if (error && error.code !== 'EXIST') {
      throw error
    } else {
      process.env['APP_NODE_CACHED_DATA_DIR'] = nodeCachedDataDir || ''
    }
  })
}

function setCurrentWorkingDirectory() {
  try {
    if (process.platform === 'win32') {
        process.env['APP_CWD'] = process.cwd() // remember as environment variable
        process.chdir(path.dirname(app.getPath('exe'))) // always set application folder as cwd
    } else if (process.env['APP_CWD']) {
        process.chdir(process.env['APP_CWD'])
    }
  } catch (err) {
    console.error(err)
  }
}

function setAppStoragePath(){
  const appSettingsPath = path.join(userDataPath,'settings.json')
  fs.exists(appSettingsPath, (exists) => {
    if (!exists){
      fs.writeFileSync(appSettingsPath, JSON.stringify({}, null, 4))
    }
  })
}

function launchApplication() {
  const loader = require('./loader')
  loader.config({
      nodeRequire: require,
      nodeMain: __filename,
      baseUrl: url.pathToFileURL(__dirname),
      catchError: true,
      isBuild: process.env['MYAPP_DEV']
  })
  //const reflect = require('reflect-metadata')
  loader(['./main-process/bootstrap'],
      function( bootstrap ) {
        bootstrap.instantiateApplication().then(()=>{
          if (process.env['MYAPP_DEV'] ){
            console.log(`LOG: ${new Date().toLocaleTimeString()} Loading MainProcess ...`)
          }
        },
        function (error) {
          console.error(`Error: ${new Date().toLocaleTimeString()} ${error}`)
        })
      },
      function (error) {
        console.error(`Error: ${new Date().toLocaleTimeString()} ${error}`)
      }
  )
}

function setupCrashReport() {
  const { crashReporter } = require('electron')
  crashReporter.start({
    productName: 'mockapp',
    companyName: 'RahulComp',
    uploadToServer: false,
    ignoreSystemCrashHandler: false,
    submitURL: 'https://crashreporter.xyz.com',
    compress: true
  })
}

function startup() {
  //console.log(`userDataPath ${userDataPath}`);
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'app-resource',
      privileges: { secure: true, supportFetchAPI: true, corsEnabled: true },
    },
  ])
  app.setPath('userData', userDataPath)
  app.setPath('crashDumps', path.join(userDataPath, 'crashDumps'))
  app.setAppLogsPath(path.join(userDataPath, 'logs'))
  app.on('will-finish-launching', setupCrashReport)
  app.on('ready', launchApplication)
}

setNodeCachedDir()

setCurrentWorkingDirectory()

setAppStoragePath()

startup()