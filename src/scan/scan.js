const commonApi = require('../utils/commonApi.js')
const fileUtils = require('../scan/fileUtils')
const allowedFileTypes = ['.jar', '.war', '.js', '.zip', '.exe']
const i18n = require('i18n')
const oraWrapper = require('../utils/oraWrapper')
const chalk = require('chalk')

const isFileAllowed = scanOption => {
  let valid = false
  allowedFileTypes.forEach(fileType => {
    if (scanOption.endsWith(fileType)) {
      valid = true
    }
  })
  return valid
}

const stripMustacheTags = oldString => {
  return oldString
    .replace(/\n/g, ' ')
    .replace(/{{.*?}}/g, '\n')
    .replace(/\$\$LINK_DELIM\$\$/g, '\n')
    .replace(/\s+/g, ' ')
    .trim()
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
          if (config.debug) {
            console.log(res.statusCode)
            console.log(config)
          }
          oraWrapper.failSpinner(
            startUploadSpinner,
            i18n.__('uploadingScanFail')
          )
          if (res.statusCode === 403) {
            console.log(i18n.__('permissionsError'))
            process.exit(1)
          }
          console.log(i18n.__('genericServiceError', res.statusCode))
          process.exit(1)
        }
      })
      .catch(err => {
        console.log(err)
      })
  }
}

const formatScanOutput = (overview, results) => {
  console.log()

  if (results.content.length === 0) {
    console.log(i18n.__('scanNoVulnerabilitiesFound'))
  } else {
    let message =
      overview.critical || overview.high
        ? 'Here are your top priorities to fix'
        : "No major issues, here's what we found"
    console.log(chalk.bold(message))
    console.log()

    const groups = getGroups(results.content)
    groups.forEach(entry => {
      console.log(
        chalk.bold(
          `${entry.severity} | ${entry.ruleId} (${entry.lineInfoSet.size})`
        )
      )
      let count = 1
      entry.lineInfoSet.forEach(lineInfo => {
        console.log(`\t ${count}. ${lineInfo}`)
        count++
      })

      if (entry?.cwe && entry?.cwe.length > 0) {
        formatLinks('cwe', entry.cwe)
      }
      if (entry?.reference && entry?.reference.length > 0) {
        formatLinks('reference', entry.reference)
      }
      if (entry?.owasp && entry?.owasp.length > 0) {
        formatLinks('owasp', entry.owasp)
      }
      console.log(chalk.bold('How to fix:'))
      console.log(entry.recommendation)
      console.log()
    })

    const totalVulnerabilities =
      overview.critical +
      overview.high +
      overview.medium +
      overview.low +
      overview.note

    let vulMessage =
      totalVulnerabilities === 1 ? `vulnerability` : `vulnerabilities`
    console.log(chalk.bold(`Found ${totalVulnerabilities} ${vulMessage}`))
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
}

const formatLinks = (objName, entry) => {
  console.log(chalk.bold(objName + ':'))
  entry.forEach(link => {
    console.log(link)
  })
  console.log()
}

const getGroups = content => {
  const groupTypeSet = new Set(content.map(({ ruleId }) => ruleId))
  let groupTypeResults = []
  groupTypeSet.forEach(groupName => {
    let groupResultsObj = {
      ruleId: groupName,
      lineInfoSet: new Set(),
      cwe: '',
      owasp: '',
      reference: '',
      recommendation: '',
      severity: ''
    }
    content.forEach(resultEntry => {
      if (resultEntry.ruleId === groupName) {
        groupResultsObj.severity = resultEntry.severity
        groupResultsObj.cwe = resultEntry.cwe
        groupResultsObj.owasp = resultEntry.owasp
        groupResultsObj.reference = resultEntry.reference
        groupResultsObj.recommendation = resultEntry.recommendation
          ? stripMustacheTags(resultEntry.recommendation)
          : 'No Recommendations Data Found'
        groupResultsObj.lineInfoSet.add(formattedCodeLine(resultEntry))
      }
    })
    groupTypeResults.push(groupResultsObj)
  })
  return groupTypeResults
}

const formattedCodeLine = resultEntry => {
  let lineUri = resultEntry.locations[0]?.physicalLocation.artifactLocation.uri
  return lineUri + ' @ ' + setLineNumber(resultEntry)
}

const setLineNumber = resultEntry => {
  return resultEntry.codeFlows?.[0]?.threadFlows[0]?.locations[0]?.location
    ?.physicalLocation?.region?.startLine
    ? resultEntry.codeFlows[0]?.threadFlows[0]?.locations[0]?.location
        ?.physicalLocation?.region?.startLine
    : resultEntry.locations[0]?.physicalLocation?.region?.startLine
}

module.exports = {
  sendScan: sendScan,
  getGroups: getGroups,
  allowedFileTypes: allowedFileTypes,
  isFileAllowed: isFileAllowed,
  stripMustacheTags: stripMustacheTags,
  formatScanOutput: formatScanOutput,
  formatLinks: formatLinks
}
