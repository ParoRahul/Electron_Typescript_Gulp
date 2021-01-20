const appPackage = require('../package.json')

const getProductName = function() {
  const productName = appPackage.productName
  return process.env.NODE_ENV === 'dev' ? `${productName}-dev` : productName
}

const getCompanyName = function() {
  return appPackage.companyName
}

const getVersion = function() {
  return appPackage.version
}

const getBundleID = function() {
  return process.env.NODE_ENV === 'dev'? `${appPackage.bundleID}Dev` : appPackage.bundleID
}

module.exports = {
  getProductName,
  getCompanyName,
  getVersion,
  getBundleID
}
