const i18n = require('i18n')
const { zipValidator } = require('./scan')
const fileFinder = require('./fileUtils')
const { supportedLanguages } = require('../constants/constants')

const autoDetectFileAndLanguage = async configToUse => {
  const entries = await fileFinder.findFile()

  if (entries.length === 1) {
    console.log(i18n.__('foundScanFile', entries[0]))

    if (hasWhiteSpace(entries[0])) {
      console.log(i18n.__('fileHasWhiteSpacesError'))
      process.exit(1)
    }

    configToUse.file = entries[0]
    if (configToUse.name === undefined) {
      configToUse.name = entries[0]
    }
    zipValidator(configToUse)
    assignLanguage(entries, configToUse)
  } else {
    errorOnFileDetection(entries)
  }
}

const hasWhiteSpace = s => {
  const filename = s.split('/').pop()
  return filename.indexOf(' ') >= 0
}

const errorOnFileDetection = entries => {
  if (entries.length > 1) {
    console.log(i18n.__('searchingDirectoryScan'))
    for (let file in entries) {
      console.log('-', entries[file])
    }
    console.log('')
    console.log(i18n.__('specifyFileScanError'))
  } else {
    console.log(i18n.__('noFileFoundScan'))
    console.log('')
    console.log(i18n.__('specifyFileScanError'))
  }
  process.exit(1)
}

const assignLanguage = (entries, configToUse) => {
  let split = entries[0].split('.')
  const fileType = split[split.length - 1]
  if (fileType === 'war' || fileType === 'jar') {
    console.log('Language is Java')
    configToUse.language = 'JAVA'
  } else if (fileType === 'dll') {
    console.log('Language is Dotnet')
    configToUse.language = 'DOTNET'
  } else if (fileType === 'js') {
    console.log('Language is Javascript')
    configToUse.language = supportedLanguages.JAVASCRIPT
  } else if (fileType === 'zip') {
    if (configToUse.language !== supportedLanguages.JAVASCRIPT) {
      console.log(i18n.__('zipErrorScan'))
      process.exit(1)
    }
    console.log('Language is Javascript within zip file')
  } else {
    console.log(i18n.__('unknownFileErrorScan'))
    process.exit(1)
  }
}

module.exports = {
  autoDetectFileAndLanguage,
  assignLanguage,
  errorOnFileDetection
}
