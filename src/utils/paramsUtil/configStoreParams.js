const validationCheck = require('../validationCheck')
const commonApi = require('../commonApi')
const config = require('../getConfig')
const { APP_NAME, APP_VERSION } = require('../../constants/constants')

const getAuth = () => {
  const ContrastConf = config.localConfig(APP_NAME, APP_VERSION)
  let ContrastConfToUse = {}
  if (validationCheck.checkConfigHasRequiredValues(ContrastConf)) {
    ContrastConfToUse.apiKey = ContrastConf.get('apiKey')
    ContrastConfToUse.organizationId = ContrastConf.get('organizationId')
    ContrastConfToUse.host = commonApi.getValidHost(ContrastConf.get('host'))
    ContrastConfToUse.authorization = ContrastConf.get('authorization')
    ContrastConfToUse.version = ContrastConf.get('version')
  }
  return ContrastConfToUse
}

module.exports = { getAuth: getAuth }
