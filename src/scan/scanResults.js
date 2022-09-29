const commonApi = require('../utils/commonApi')
const requestUtils = require('../../src/utils/requestUtils')
const oraFunctions = require('../utils/oraWrapper')
const _ = require('lodash')
const i18n = require('i18n')
const oraWrapper = require('../utils/oraWrapper')
const readLine = require('readline')

const getScanId = async (config, codeArtifactId, client) => {
  return client
    .getScanId(config, codeArtifactId)
    .then(res => {
      if (res.statusCode == 429) {
        throw new Error(i18n.__('exceededFreeTier'))
      }
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
  newProject,
  timeout,
  startScanSpinner
) => {
  const client = commonApi.getHttpClient(config)
  let scanId = await getScanId(config, codeArtifactId, client)

  // send metrics event to sast-event-collector
  if (
    process.env.CODESEC_INVOCATION_ENVIRONMENT &&
    process.env.CODESEC_INVOCATION_ENVIRONMENT.toUpperCase() === 'GITHUB'
  ) {
    await client.createNewEvent(config, scanId, newProject)
  }

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
          if (config.debug) {
            oraFunctions.failSpinner(
              startScanSpinner,
              i18n.__(
                'scanNotCompleted',
                'https://docs.contrastsecurity.com/en/binary-package-preparation.html'
              )
            )
          }
          if (
            result?.body?.errorMessage ===
            'Unable to determine language for code artifact'
          ) {
            console.log(result.body.errorMessage)
            console.log(
              'Try scanning again using --language param. ',
              i18n.__('scanOptionsLanguageSummary')
            )
          }
          oraWrapper.stopSpinner(startScanSpinner)
          console.log('Contrast Scan Finished')
          process.exit(1)
        }
      }
      let endTime = new Date() - startTime
      if (requestUtils.millisToSeconds(endTime) > timeout) {
        oraFunctions.failSpinner(
          startScanSpinner,
          'Contrast Scan timed out at the specified ' + timeout + ' seconds.'
        )

        const isCI = process.env.CONTRAST_CODESEC_CI
          ? JSON.parse(process.env.CONTRAST_CODESEC_CI.toLowerCase())
          : false
        if (!isCI) {
          const retry = await retryScanPrompt()
          timeout = retry.timeout
        } else {
          console.log('Please try again, allowing more time')
          process.exit(1)
        }
      }
    }
  }
}

const retryScanPrompt = async () => {
  const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve, reject) => {
    requestUtils.timeOutError(30000, reject)

    rl.question(
      '🔁 Do you want to continue waiting on Scan? [Y/N]\n',
      async input => {
        if (input.toLowerCase() === 'yes' || input.toLowerCase() === 'y') {
          console.log('Continuing wait for Scan')
          rl.close()
          resolve({ timeout: 300 })
        } else if (
          input.toLowerCase() === 'no' ||
          input.toLowerCase() === 'n'
        ) {
          rl.close()
          console.log('Contrast Scan Retry Cancelled: Exiting')
          resolve(process.exit(1))
        } else {
          rl.close()
          console.log('Invalid Input: Exiting')
          resolve(process.exit(1))
        }
      }
    )
  }).catch(e => {
    throw e
  })
}

const returnScanResultsInstances = async (config, scanId) => {
  const client = commonApi.getHttpClient(config)
  let result
  try {
    result = await client.getScanResultsInstances(config, scanId)
    if (JSON.stringify(result.statusCode) == 200) {
      return { body: result.body, statusCode: result.statusCode }
    }

    if (JSON.stringify(result.statusCode) == 503) {
      return { statusCode: result.statusCode }
    }
  } catch (e) {
    if (config.debug) {
      console.log(e.message.toString())
    }
  }
}

module.exports = {
  getScanId: getScanId,
  returnScanResults: returnScanResults,
  pollScanResults: pollScanResults,
  returnScanResultsInstances: returnScanResultsInstances,
  retryScanPrompt
}
