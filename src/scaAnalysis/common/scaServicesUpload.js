const commonApi = require('../../utils/commonApi')
const { APP_VERSION } = require('../../constants/constants')
const requestUtils = require('../../utils/requestUtils')

const scaTreeUpload = async (analysis, config) => {
  const requestBody = {
    applicationId: config.applicationId,
    dependencyTree: analysis,
    organizationId: config.organizationId,
    language: config.language,
    tool: {
      name: 'Contrast Codesec',
      version: APP_VERSION
    }
  }

  if (config.branch) {
    requestBody.branchName = config.branch
  }

  const client = commonApi.getHttpClient(config)
  const reportID = await client
    .scaServiceIngest(requestBody, config)
    .then(res => {
      if (res.statusCode === 201) {
        return res.body.libraryIngestJobId
      } else {
        throw new Error(res.statusCode + ` error ingesting dependencies`)
      }
    })
    .catch(err => {
      throw err
    })
  if (config.debug) {
    console.log(' polling report', reportID)
  }

  let keepChecking = true
  let res
  while (keepChecking) {
    res = await client.scaServiceReportStatus(config, reportID).then(res => {
      if (config.debug) {
        console.log(res.statusCode)
        console.log(res.body)
      }
      if (res.body.status === 'COMPLETED') {
        keepChecking = false
        return client.scaServiceReport(config, reportID).then(res => {
          return [res.body, reportID]
        })
      }
    })

    if (!keepChecking) {
      return [res, reportID]
    }
    await requestUtils.sleep(5000)
  }
  return [res, reportID]
}

module.exports = {
  scaTreeUpload
}
