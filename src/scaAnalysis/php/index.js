const { readFile, parseProjectFiles } = require('./analysis')
const { createPhpTSMessage } = require('../common/formatMessage')
const { parsePHPLockFileForScaServices } = require('./phpNewServicesMapper')

const phpAnalysis = config => {
  let analysis = readFiles(config)

  if (config.experimental) {
    return parsePHPLockFileForScaServices(analysis.rawLockFileContents)
  } else {
    const phpDep = parseProjectFiles(analysis)
    return createPhpTSMessage(phpDep)
  }
}

const readFiles = config => {
  let php = {}

  php.composerJSON = JSON.parse(readFile(config, 'composer.json'))

  php.rawLockFileContents = JSON.parse(readFile(config, 'composer.lock'))

  return php
}

module.exports = {
  phpAnalysis: phpAnalysis
}
