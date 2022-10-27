const paramHandler = require('../utils/paramsUtil/paramHandler')
const constants = require('../cliConstants.js')
const path = require('path')
const { supportedLanguagesScan } = require('../constants/constants')
const i18n = require('i18n')
const { scanUsageGuide } = require('./help')
const parsedCLIOptions = require('../utils/parsedCLIOptions')

const getScanConfig = async (contrastConf, command, argv) => {
  let scanParams = await parsedCLIOptions.getCommandLineArgsCustom(
    contrastConf,
    command,
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
    if (!Object.values(supportedLanguagesScan).includes(scanParams.language)) {
      console.log(`Did not recognise --language ${scanParams.language}`)
      console.log(i18n.__('constantsHowToRunDev3'))
      process.exit(1)
    }
  }

  // if no name, take the full file path and use it as the project name
  let projectNameSource
  if (!scanParams.name && scanParams.file) {
    scanParams.name = getFileName(scanParams.file)
    projectNameSource = 'AUTO'
  } else {
    projectNameSource = 'USER'
  }

  return { ...paramsAuth, ...scanParams, projectNameSource }
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
