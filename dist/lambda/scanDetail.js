'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.pollScanDetail = void 0
const requestUtils_1 = require('../utils/requestUtils')
const pollScanDetail = async (
  config,
  params,
  scanId,
  httpClient,
  pollCount,
  showProgress = false
) => {
  await (0, requestUtils_1.sleep)(5000)
  return httpClient.getFunctionScan(config, params, scanId).then(res => {
    const { resultsCount = 0 } = res?.body?.data?.scan || {}
    if (showProgress) {
      process.stdout.write(
        `\rScanning (${resultsCount} results found so far)${'.'.repeat(
          pollCount
        )}`
      )
    }
    if (res.statusCode === 200) {
      return res
    } else {
      throw Error(`Failed to get scan detail: ${res.statusCode} ${res.body}`)
    }
  })
}
exports.pollScanDetail = pollScanDetail
