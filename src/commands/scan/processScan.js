const { startScan } = require('../../scan/scanController')
const { formatScanOutput } = require('../../scan/scan')
const { scanUsageGuide } = require('../../scan/help')
const scanConfig = require('../../scan/scanConfig')
const { saveScanFile } = require('../../utils/saveFile')

const processScan = async argvMain => {
  let config = scanConfig.getScanConfig(argvMain)

  let scanResults = await startScan(config)
  if (scanResults) {
    formatScanOutput(
      scanResults?.projectOverview,
      scanResults?.scanResultsInstances
    )
  }

  if (config.save !== undefined) {
    await saveScanFile(config, scanResults)
  }
}

module.exports = {
  processScan
}
