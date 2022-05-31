const commonApi = require('../utils/commonApi')
const requestUtils = require('../../src/utils/requestUtils')
const oraFunctions = require('../utils/oraWrapper')
const _ = require('lodash')
const i18n = require('i18n')

const getScanId = async (config, codeArtifactId, client) => {
  return client
    .getScanId(config, codeArtifactId)
    .then(res => {
      return res.body.id
    })
    .catch(err => {
      console.log(err)
    })
}

const pollScanResults = async (config, scanId, client) => {
  await requestUtils.sleep(5000)
  return client
    .getSpecificScanResult(config, scanId)
    .then(res => {
      return res
    })
    .catch(err => {
      console.log(err)
    })
}

const returnScanResults = async (
  config,
  codeArtifactId,
  timeout,
  startScanSpinner
) => {
  const client = commonApi.getHttpClient(config)
  let scanId = await getScanId(config, codeArtifactId, client)
  let startTime = new Date()
  let complete = false
  if (!_.isNil(scanId)) {
    while (!complete) {
      let result = await pollScanResults(config, scanId, client)
      if (JSON.stringify(result.statusCode) == 200) {
        if (result.body.status === 'COMPLETED') {
          complete = true
          return result.body
        }
        if (result.body.status === 'FAILED') {
          complete = true
          oraFunctions.failSpinner(startScanSpinner, 'Contrast Scan Failed.')
          console.log(result.body.errorMessage)
          if (
            result.body.errorMessage ===
            'Unable to determine language for code artifact'
          ) {
            console.log(
              'Try scanning again using --language param. ',
              i18n.__('scanOptionsLanguageSummary')
            )
          }
          process.exit(1)
        }
      }
      let endTime = new Date() - startTime
      if (requestUtils.millisToSeconds(endTime) > timeout) {
        oraFunctions.failSpinner(
          startScanSpinner,
          'Contrast Scan timed out at the specified ' + timeout + ' seconds.'
        )
        console.log('Please try again, allowing more time.')
        process.exit(1)
      }
    }
  }
}

const returnScanResultsInstances = async (config, scanId) => {
  const client = commonApi.getHttpClient(config)
  let result
  try {
    result = await client.getScanResultsInstances(config, scanId)
    if (JSON.stringify(result.statusCode) == 200) {
      return result.body
    }
  } catch (e) {
    console.log(e.message.toString())
  }
}

const returnScanProjectById = async config => {
  const client = commonApi.getHttpClient(config)
  let result
  try {
    result = await client.getScanProjectById(config)
    if (JSON.stringify(result.statusCode) == 200) {
      return result.body
    }
  } catch (e) {
    console.log(e.message.toString())
  }
}

module.exports = {
  getScanId: getScanId,
  returnScanResults: returnScanResults,
  pollScanResults: pollScanResults,
  returnScanResultsInstances: returnScanResultsInstances,
  returnScanProjectById: returnScanProjectById
}
