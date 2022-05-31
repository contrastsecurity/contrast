const paramHandler = require('../utils/paramsUtil/paramHandler')
const constants = require('../../src/constants.js')
const parsedCLIOptions = require('../../src/utils/parsedCLIOptions')
const path = require('path')
const {
  supportedLanguages
} = require('../audit/languageAnalysisEngine/constants')
const i18n = require('i18n')
const { scanUsageGuide } = require('./help')

const getScanConfig = argv => {
  let scanParams = parsedCLIOptions.getCommandLineArgsCustom(
    argv,
    constants.commandLineDefinitions.scanOptionDefinitions
  )

  if (scanParams.help) {
    printHelpMessage()
    process.exit(0)
  }

  const paramsAuth = paramHandler.getAuth(scanParams)

  if (scanParams.language) {
    scanParams.language = scanParams.language.toUpperCase()
    if (!Object.values(supportedLanguages).includes(scanParams.language)) {
      console.log(`Did not recognise --language ${scanParams.language}`)
      console.log(i18n.__('constantsHowToRunDev3'))
      process.exit(0)
    }
  }

  // if no name, take the full file path and use it as the project name
  if (!scanParams.name && scanParams.file) {
    scanParams.name = getFileName(scanParams.file)
  }

  return { ...paramsAuth, ...scanParams }
}

const getFileName = file => {
  // from '/Users/x/y/spring-async.war' to 'spring-async.war'
  return file.split(path.sep).pop()
}

const printHelpMessage = () => {
  console.log(scanUsageGuide)
}

module.exports = {
  getScanConfig,
  getFileName,
  printHelpMessage
}
