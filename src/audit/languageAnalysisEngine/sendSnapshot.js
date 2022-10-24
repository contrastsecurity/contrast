const commonApi = require('../../utils/commonApi')
const _ = require('lodash')
const oraFunctions = require('../../utils/oraWrapper')
const i18n = require('i18n')
const oraWrapper = require('../../utils/oraWrapper')
const requestUtils = require('../../utils/requestUtils')
const { performance } = require('perf_hooks')

const pollSnapshotResults = async (config, snapshotId, client) => {
  await requestUtils.sleep(5000)
  return client
    .getReportStatusById(config, snapshotId)
    .then(res => {
      return res
    })
    .catch(err => {
      console.log(err)
    })
}

const getTimeout = config => {
  if (config.timeout) {
    return config.timeout
  } else {
    if (config.verbose) {
      console.log('Timeout set to 5 minutes')
    }
    return 300
  }
}

const pollForSnapshotCompletion = async (config, snapshotId, reportSpinner) => {
  const client = commonApi.getHttpClient(config)
  const startTime = performance.now()
  const timeout = getTimeout(config)

  let complete = false
  if (!_.isNil(snapshotId)) {
    while (!complete) {
      let result = await pollSnapshotResults(config, snapshotId, client)
      if (result.statusCode === 200) {
        if (result.body.status === 'PROCESSED') {
          complete = true
          return result.body
        }
        if (result.body.status === 'FAILED') {
          complete = true
          if (config.debug) {
            oraFunctions.failSpinner(
              reportSpinner,
              i18n.__('auditNotCompleted')
            )
          }
          console.log(result.body.errorMessage)
          oraWrapper.stopSpinner(reportSpinner)
          console.log('Contrast audit finished')
          process.exit(1)
        }
      }
      const endTime = performance.now() - startTime
      if (requestUtils.millisToSeconds(endTime) > timeout) {
        oraFunctions.failSpinner(
          reportSpinner,
          'Contrast audit timed out at the specified timeout of ' +
            timeout +
            ' seconds.'
        )
        throw new Error('You can update the timeout using --timeout')
      }
    }
  }
}

module.exports = {
  pollForSnapshotCompletion
}
