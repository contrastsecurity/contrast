const commonApi = require('../../utils/commonApi')
const { APP_VERSION } = require('../../constants/constants')

const commonSendSnapShot = async (analysis, config) => {
  let requestBody = {}
  config.experimental === true
    ? (requestBody = sendToSCAServices(config, analysis))
    : (requestBody = {
        appID: config.applicationId,
        cliVersion: APP_VERSION,
        snapshot: analysis
      })

  const client = commonApi.getHttpClient(config)
  return client
    .sendSnapshot(requestBody, config)
    .then(res => {
      if (res.statusCode === 201) {
        return res.body
      } else {
        throw new Error(res.statusCode + ` error processing dependencies`)
      }
    })
    .catch(err => {
      throw err
    })
}

const sendToSCAServices = (config, analysis) => {
  return {
    applicationId: config.applicationId,
    dependencyTree: analysis,
    organizationId: config.organizationId,
    language: config.language,
    tool: {
      name: 'Contrast Codesec',
      version: APP_VERSION
    }
  }
}

module.exports = {
  commonSendSnapShot
}
