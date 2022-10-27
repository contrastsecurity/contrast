const scanConfig = require('../../scan/scanConfig')
const { startScan } = require('../../scan/scanController')
const { saveScanFile } = require('../../utils/saveFile')
const { ScanResultsModel } = require('../../scan/models/scanResultsModel')
const { formatScanOutput } = require('../../scan/formatScanOutput')
const common = require('../../common/fail')
const { sendTelemetryConfigAsObject } = require('../../telemetry/telemetry')
const { postRunMessage } = require('../../common/commonHelp')

const processScan = async (contrastConf, argv) => {
  let config = await scanConfig.getScanConfig(contrastConf, 'scan', argv)
  let output = undefined

  let scanResults = new ScanResultsModel(await startScan(config))
  await sendTelemetryConfigAsObject(
    config,
    'scan',
    argv,
    'SUCCESS',
    scanResults.scanDetail.language
  )

  if (scanResults.scanResultsInstances !== undefined) {
    output = formatScanOutput(scanResults)
  }

  if (config.save !== undefined) {
    await saveScanFile(config, scanResults)
  } else {
    console.log('\nUse contrast scan --save to save results as a SARIF')
  }

  if (config.fail) {
    common.processFail(config, output)
  }

  postRunMessage('scan')
}

module.exports = {
  processScan
}
