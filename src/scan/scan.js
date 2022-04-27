const commonApi = require('../utils/commonApi.js')
const fileUtils = require('../scan/fileUtils')
const allowedFileTypes = ['.jar', '.war', '.js', '.zip']
const i18n = require('i18n')
const AdmZip = require('adm-zip')
const oraWrapper = require('../utils/oraWrapper')
const { supportedLanguages } = require('../constants/constants')

const isFileAllowed = scanOption => {
  let valid = false
  allowedFileTypes.forEach(fileType => {
    if (scanOption.endsWith(fileType)) {
      valid = true
    }
  })
  return valid
}

const sendScan = async config => {
  if (!isFileAllowed(config.file)) {
    console.log(i18n.__('scanErrorFileMessage'))
    process.exit(9)
  } else {
    fileUtils.checkFilePermissions(config.file)
    const client = commonApi.getHttpClient(config)

    const startUploadSpinner = oraWrapper.returnOra(i18n.__('uploadingScan'))
    oraWrapper.startSpinner(startUploadSpinner)

    return await client
      .sendArtifact(config)
      .then(res => {
        if (res.statusCode === 201) {
          oraWrapper.succeedSpinner(
            startUploadSpinner,
            i18n.__('uploadingScanSuccessful')
          )
          if (config.verbose) {
            console.log(i18n.__('responseMessage', res.body))
          }
          return res.body.id
        } else {
          oraWrapper.failSpinner(
            startUploadSpinner,
            i18n.__('uploadingScanFail')
          )
          process.exit(1)
        }
      })
      .catch(err => {
        console.log(err)
      })
  }
}

const zipValidator = configToUse => {
  if (configToUse.file.endsWith('.zip')) {
    let zipFileName = configToUse.file.split('/').pop()
    try {
      let zip = new AdmZip(configToUse.file)
      let zipEntries = zip.getEntries()
      zipEntries.forEach(function(zipEntry) {
        if (
          !zipEntry.entryName.includes('._') &&
          !zipEntry.entryName.includes('/.')
        ) {
          if (!zipEntry.isDirectory) {
            if (!zipEntry.entryName.endsWith('.js')) {
              console.log(i18n.__('scanZipError', zipFileName))
              process.exit(1)
            }
          }
        }
      })
      configToUse.language = supportedLanguages.JAVASCRIPT
    } catch {
      console.log(i18n.__('zipFileException'))
    }
  }
}

const formatScanOutput = (overview, results) => {
  console.log()
  console.log('Here are your top priorities to fix')
  console.log()

  results.content.forEach(entry => {
    console.log(entry.severity, 'ID:', entry.id)
    console.log(
      entry.ruleId,
      'in',
      entry.locations[0]?.physicalLocation.artifactLocation.uri,
      '@',
      entry.codeFlows[0]?.threadFlows[0]?.locations[0]?.location
        ?.physicalLocation?.region?.startLine
    )
    console.log()
  })

  const totalVulnerabilities =
    overview.critical +
    overview.high +
    overview.medium +
    overview.low +
    overview.note

  console.log(`Found ${totalVulnerabilities} vulnerabilities`)
  console.log(
    i18n.__(
      'foundDetailedVulnerabilities',
      overview.critical,
      overview.high,
      overview.medium,
      overview.low,
      overview.note
    )
  )
}

module.exports = {
  sendScan: sendScan,
  allowedFileTypes: allowedFileTypes,
  isFileAllowed: isFileAllowed,
  formatScanOutput: formatScanOutput,
  zipValidator: zipValidator
}
