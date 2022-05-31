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
const fileFunctions = require('./fileUtils')
const { performance } = require('perf_hooks')

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

const fileAndLanguageLogic = async configToUse => {
  if (configToUse.file) {
    if (!fileFunctions.fileExists(configToUse.file)) {
      console.log(i18n.__('fileNotExist'))
      process.exit(1)
    }
    return configToUse
  } else {
    if (configToUse.file === undefined || configToUse.file === null) {
      await autoDetection.autoDetectFileAndLanguage(configToUse)
    }
  }
}

const startScan = async configToUse => {
  const startTime = performance.now()
  await fileAndLanguageLogic(configToUse)

  if (!configToUse.projectId) {
    configToUse.projectId = await populateProjectIdAndProjectName.populateProjectId(
      configToUse
    )
  }
  const codeArtifactId = await scan.sendScan(configToUse)

  if (!configToUse.ff) {
    const startScanSpinner = returnOra('🚀 Contrast Scan started')
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
    const endTime = performance.now()
    const scanDurationMs = endTime - startTime
    succeedSpinner(startScanSpinner, 'Contrast Scan complete')
    console.log(
      `----- Scan completed in ${(scanDurationMs / 1000).toFixed(2)}s -----`
    )
    const projectOverview = await scanResults.returnScanProjectById(configToUse)
    return { projectOverview, scanDetail, scanResultsInstances }
  }
}

module.exports = {
  startScan: startScan
}
