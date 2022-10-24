const i18n = require('i18n')
const fileFinder = require('./fileUtils')

const autoDetectFingerprintInfo = async filePath => {
  let complexObj = await fileFinder.findAllFiles(filePath)
  let result = []
  let count = 0
  complexObj.forEach(i => {
    count++
    result.push({ filePath: i, id: count.toString() })
  })

  return result
}

const autoDetectFileAndLanguage = async configToUse => {
  const entries = await fileFinder.findFile()

  if (entries.length === 1) {
    console.log(i18n.__('foundScanFile', entries[0]))

    if (hasWhiteSpace(entries[0])) {
      console.log(i18n.__('fileHasWhiteSpacesError'))
      process.exit(1)
    }

    if (fileFinder.fileIsEmpty(entries[0])) {
      console.log(i18n.__('scanFileIsEmpty'))
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

const autoDetectAuditFilesAndLanguages = async filePath => {
  let languagesFound = []

  console.log(i18n.__('searchingAuditFileDirectory', filePath))

  await fileFinder.findFilesJava(languagesFound, filePath)
  await fileFinder.findFilesJavascript(languagesFound, filePath)
  await fileFinder.findFilesPython(languagesFound, filePath)
  await fileFinder.findFilesGo(languagesFound, filePath)
  await fileFinder.findFilesPhp(languagesFound, filePath)
  await fileFinder.findFilesRuby(languagesFound, filePath)
  await fileFinder.findFilesDotNet(languagesFound, filePath)

  if (languagesFound) {
    return languagesFound
  }

  return []
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

const errorOnAuditFileDetection = entries => {
  if (entries.length > 1) {
    console.log(i18n.__('searchingDirectoryScan'))
    for (let file in entries) {
      console.log('-', entries[file])
    }
    console.log('')
    console.log(i18n.__('specifyFileAuditNotFound'))
  } else {
    console.log(i18n.__('noFileFoundScan'))
    console.log('')
    console.log(i18n.__('specifyFileAuditNotFound'))
  }
}

module.exports = {
  autoDetectFileAndLanguage,
  errorOnFileDetection,
  autoDetectAuditFilesAndLanguages,
  errorOnAuditFileDetection,
  autoDetectFingerprintInfo
}
