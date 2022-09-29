const i18n = require('i18n')

const processFail = (config, reportResults) => {
  if (config.severity !== undefined) {
    if (
      reportResults[config.severity] !== undefined &&
      isSeverityViolation(config.severity, reportResults)
    ) {
      failPipeline('failSeverityOptionErrorMessage')
    }
  }

  if (config.severity === undefined && reportResults.total > 0) {
    failPipeline('failThresholdOptionErrorMessage')
  }
}

const isSeverityViolation = (severity, reportResults) => {
  let count = 0
  switch (severity) {
    case 'critical':
      count += reportResults.critical
      break
    case 'high':
      count += reportResults.high + reportResults.critical
      break
    case 'medium':
      count +=
        reportResults.medium + reportResults.high + reportResults.critical
      break
    case 'low':
      count +=
        reportResults.high +
        reportResults.critical +
        reportResults.medium +
        reportResults.low
      break
    case 'note':
      if (reportResults.note == reportResults.total) {
        count = 0
      } else {
        count = reportResults.total
      }
      break
    default:
      count = 0
  }
  return count > 0
}

const failPipeline = (message = '') => {
  console.log(
    '\n ******************************** ' +
      i18n.__('snapshotFailureHeader') +
      ' *********************************\n' +
      i18n.__(message)
  )
  process.exit(2)
}

const parseSeverity = severity => {
  const severities = ['NOTE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
  if (severities.includes(severity.toUpperCase())) {
    return severity.toLowerCase()
  } else {
    console.log(
      severity +
        ' Not recognised as a severity type please use LOW, MEDIUM, HIGH, CRITICAL, NOTE'
    )
    return undefined
  }
}

module.exports = {
  failPipeline,
  processFail,
  isSeverityViolation,
  parseSeverity
}
