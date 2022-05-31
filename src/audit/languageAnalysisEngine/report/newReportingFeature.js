const commonReport = require('./commonReportingFunctions')
const { handleResponseErrors } = require('../commonApi')
const { getHttpClient } = require('../../../utils/commonApi')

const vulnReportWithoutDevDep = async (
  analysis,
  applicationId,
  snapshotId,
  config
) => {
  if (config.report) {
    const reportResponse = await getSpecReport(snapshotId, config)
    if (reportResponse !== undefined) {
      const severity = config.cveSeverity
      const id = applicationId
      const name = config.applicationName
      const hasSomeVulnerabilitiesReported = formatVulnerabilityOutput(
        reportResponse.vulnerabilities,
        severity,
        id,
        name,
        config
      )
      commonReport.analyseReportOptions(hasSomeVulnerabilitiesReported)
    }
  }
}

const getSpecReport = async (reportId, config) => {
  const client = getHttpClient(config)

  return client
    .getSpecificReport(config, reportId)
    .then(res => {
      if (res.statusCode === 200) {
        commonReport.displaySuccessMessageReport()
        return res.body
      } else {
        handleResponseErrors(res, 'report')
      }
    })
    .catch(err => {
      console.log(err)
    })
}

const countSeverity = vulnerabilities => {
  const severityCount = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  }

  // eslint-disable-next-line
  for (const key of Object.keys(vulnerabilities)) {
    vulnerabilities[key].forEach(vuln => {
      if (vuln.severityCode === 'HIGH') {
        severityCount['high'] += 1
      } else if (vuln.severityCode === 'MEDIUM') {
        severityCount['medium'] += 1
      } else if (vuln.severityCode === 'LOW') {
        severityCount['low'] += 1
      } else if (vuln.severityCode === 'CRITICAL') {
        severityCount['critical'] += 1
      }
    })
  }
  return severityCount
}

const formatVulnerabilityOutput = (
  vulnerabilities,
  severity,
  id,
  name,
  config
) => {
  const numberOfVulnerableLibraries = Object.keys(vulnerabilities).length
  let numberOfCves = 0

  // eslint-disable-next-line
  for (const key of Object.keys(vulnerabilities)) {
    numberOfCves += vulnerabilities[key].length
  }

  commonReport.createLibraryHeader(
    id,
    numberOfVulnerableLibraries,
    numberOfCves,
    name
  )

  const severityCount = countSeverity(vulnerabilities)
  const filteredVulns = commonReport.filterVulnerabilitiesBySeverity(
    severity,
    vulnerabilities
  )

  let hasSomeVulnerabilitiesReported
  hasSomeVulnerabilitiesReported = commonReport.printVulnerabilityResponse(
    severity,
    filteredVulns,
    vulnerabilities
  )

  console.log(
    '\n **************************' +
      ` Found ${numberOfVulnerableLibraries} vulnerable libraries containing ${numberOfCves} CVE's ` +
      '************************** '
  )

  console.log(
    ' \n Please go to the Contrast UI to view your dependency tree: \n' +
      ` \n ${config.host}/Contrast/static/ng/index.html#/${config.organizationId}/applications/${config.applicationId}/libs/dependency-tree`
  )
  return [hasSomeVulnerabilitiesReported, numberOfCves, severityCount]
}

module.exports = {
  vulnReportWithoutDevDep: vulnReportWithoutDevDep,
  formatVulnerabilityOutput: formatVulnerabilityOutput,
  getSpecReport: getSpecReport
}
