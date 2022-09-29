const scanConfig = require('../../scan/scanConfig')
const { startScan } = require('../../scan/scanController')
const { saveScanFile } = require('../../utils/saveFile')
const { ScanResultsModel } = require('../../scan/models/scanResultsModel')
const { formatScanOutput } = require('../../scan/formatScanOutput')
const { processSca } = require('./sca/scaAnalysis')
const common = require('../../common/fail')
const { sendTelemetryConfigAsObject } = require('../../telemetry/telemetry')
const chalk = require('chalk')
const generalAPI = require('../../utils/generalAPI')

const processScan = async (contrastConf, argv) => {
  let config = await scanConfig.getScanConfig(contrastConf, 'scan', argv)
  let output = undefined
  config.mode = await generalAPI.getMode(config)

  //try SCA analysis first
  if (config.experimental) {
    await processSca(config, argv)
  }

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
  }

  if (config.fail) {
    common.processFail(config, output)
  }

  postRunMessage()
}

const postRunMessage = () => {
  console.log('\n' + chalk.underline.bold('Other Codesec Features:'))
  console.log(
    "'contrast audit' to find vulnerabilities in your open source dependencies"
  )
  console.log("'contrast lambda' to secure your AWS serverless functions\n")
}

module.exports = {
  processScan
}
