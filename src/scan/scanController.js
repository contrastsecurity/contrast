const i18n = require('i18n')
const {
  returnOra,
  startSpinner,
  succeedSpinner
} = require('../utils/oraWrapper')
const populateProjectIdAndProjectName = require('./populateProjectIdAndProjectName')
const scan = require('./scan')
const scanResults = require('./scanResults')
const autoDetection = require('./autoDetection')
const paramHandler = require('../utils/paramsUtil/paramHandler')
const fileFunctions = require('./fileUtils')

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

const startScan = async () => {
  let paramsAuth = paramHandler.getAuth()
  let getScanSubCommands = paramHandler.getScanSubCommands()
  const configToUse = { ...paramsAuth, ...getScanSubCommands }
  if (configToUse.file === undefined || configToUse.file === null) {
    await autoDetection.autoDetectFileAndLanguage(configToUse)
  } else {
    if (fileFunctions.fileExists(configToUse.file)) {
      scan.zipValidator(configToUse)
      autoDetection.assignLanguage([configToUse.file], configToUse)
    } else {
      console.log(i18n.__('fileNotExist'))
      process.exit(0)
    }
  }

  if (!configToUse.projectId) {
    configToUse.projectId = await populateProjectIdAndProjectName.populateProjectId(
      configToUse
    )
  }
  const codeArtifactId = await scan.sendScan(configToUse)

  if (!configToUse.ff) {
    const startScanSpinner = returnOra('Contrast Scan started')
    startSpinner(startScanSpinner)
    const scanDetail = await scanResults.returnScanResults(
      configToUse,
      codeArtifactId,
      getTimeout(configToUse),
      startScanSpinner
    )
    const scanResultsInstances = await scanResults.returnScanResultsInstances(
      configToUse,
      scanDetail.id
    )
    succeedSpinner(startScanSpinner, 'Contrast Scan complete')
    const projectOverview = await scanResults.returnScanProjectById(configToUse)
    return { projectOverview, scanResultsInstances }
  }
}

module.exports = {
  startScan: startScan
}
