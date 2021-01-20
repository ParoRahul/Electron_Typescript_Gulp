const path = require("path")
// import * as Fs from 'fs'

const { getProductName } = require('./packageInfo')

const productName = getProductName()

const windowsIdentifierName = 'exampleApp'

const projectRoot = path.join(__dirname, '..')

// const publishChannels = ['production', 'test', 'beta']

module.exports.getDistRoot = function getDistpath() {
  return path.join(projectRoot, 'dist')
}

module.exports.getExecutableName = function getExecutableName(){
  const suffix = process.env.NODE_ENV === 'dev' ? '-dev' : ''
  if (process.platform === 'win32') {
    return `${windowsIdentifierName}${suffix}`
  } else if (process.platform === 'linux') {
    return 'desktop'
  } else {
    return productName
  }
}

module.exports.getDistpath = function () {
  return path.join( getDistRoot(),`${getExecutableName()}-${process.platform}-x64`)
}

/* module.exports.getWindowsInstallerName = function (){
  return `${getExecutableName()}Setup.msi`
}

export function getDistpath() {
  return path.join( getDistRoot(),`${getExecutableName()}-${process.platform}-x64`)
}

export function getOSXZipName() {
  return `${productName}.zip`
}

export function getOSXZippath() {
  return path.join(getDistpath(), '..', getOSXZipName())
}

export function getWindowsInstallerpath() {
  return path.join(getDistpath(), '..', 'installer', getWindowsInstallerName())
}

export function getWindowsStandaloneName() {
  const productName = getExecutableName()
  return `${productName}Setup.exe`
}

export function getWindowsStandalonepath() {
  return path.join(getDistpath(), '..', 'installer', getWindowsStandaloneName())
}

export function getWindowsFullNugetPackageName() {
  return `${windowsIdentifierName}-${version}-full.nupkg`
}

export function getWindowsFullNugetPackagepath() {
  return path.join(
    getDistpath(),
    '..',
    'installer',
    getWindowsFullNugetPackageName()
  )
}

export function getWindowsDeltaNugetPackageName() {
  return `${windowsIdentifierName}-${version}-delta.nupkg`
}

export function getWindowsDeltaNugetPackagepath() {
  return path.join(
    getDistpath(),
    '..',
    'installer',
    getWindowsDeltaNugetPackageName()
  )
} */

module.exports.getChannel= function () {
  return process.env.NODE_ENV || 'development'
}
