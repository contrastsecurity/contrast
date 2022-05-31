const i18n = require('i18n')
const fileFinder = require('./fileUtils')

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

module.exports = {
  autoDetectFileAndLanguage,
  errorOnFileDetection
}
