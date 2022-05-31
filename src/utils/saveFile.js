const { SARIF_FILE } = require('../constants/constants')
const commonApi = require('./commonApi')
const saveResults = require('../scan/saveResults')
const i18n = require('i18n')

const saveScanFile = async (config, scanResults) => {
  if (config.save === null || config.save.toUpperCase() === SARIF_FILE) {
    const scanId = scanResults.scanDetail.id
    const client = commonApi.getHttpClient(config)
    const rawResults = await client.getSpecificScanResultSarif(config, scanId)
    await saveResults.writeResultsToFile(rawResults?.body)
  } else {
    console.log(i18n.__('scanNoFiletypeSpecifiedForSave'))
  }
}

module.exports = {
  saveScanFile: saveScanFile
}
