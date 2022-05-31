const i18n = require('i18n')
const commonApi = require('../commonApi')
const commonReport = require('./commonReportingFunctions')

function displaySuccessMessageVulnerabilities() {
  console.log(i18n.__('vulnerabilitiesSuccessMessage'))
}

const vulnerabilityReport = async (analysis, applicationId, config) => {
  let depRiskReportCount = {}
  if (analysis.language === 'NODE') {
    depRiskReportCount = await commonReport.dependencyRiskReport(
      analysis.node.packageJSON,
      config
    )
  }
  if (config['report']) {
    const reportResponse = await commonReport.getReport(applicationId)
    if (reportResponse !== undefined) {
      const libraryVulnerabilityInput = createLibraryVulnerabilityInput(
        reportResponse.reports
      )
      const libraryVulnerabilityResponse = await getLibraryVulnerabilities(
        libraryVulnerabilityInput,
        applicationId
      )

      const severity = config['cve_severity']
      const id = applicationId
      const name = config.applicationName
      const hasSomeVulnerabilitiesReported = formatVulnerabilityOutput(
        libraryVulnerabilityResponse,
        severity,
        id,
        name,
        depRiskReportCount,
        config
      )
      commonReport.analyseReportOptions(hasSomeVulnerabilitiesReported)
    }
  }
}

const createLibraryVulnerabilityInput = report => {
  const language = Object.keys(report[0].report)[0]
  const reportTree = report[0].report[language].dependencyTree
  const libraries = reportTree[Object.keys(reportTree)[0]]

  let gav = []
  // eslint-disable-next-line
  for (const key of Object.keys(libraries)) {
    gav.push({
      name: libraries[key].name,
      group: libraries[key].group,
      version: libraries[key].resolved
    })
  }

  return {
    name_group_versions: gav,
    language: language.toUpperCase()
  }
}

const oldCountSeverity = vulnerableLibraries => {
  const severityCount = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  }

  vulnerableLibraries.forEach(lib => {
    lib.vulns.forEach(vuln => {
      if (vuln.severity_code === 'HIGH') {
        severityCount['high'] += 1
      } else if (vuln.severity_code === 'MEDIUM') {
        severityCount['medium'] += 1
      } else if (vuln.severity_code === 'LOW') {
        severityCount['low'] += 1
      } else if (vuln.severity_code === 'CRITICAL') {
        severityCount['critical'] += 1
      }
    })
  })
  return severityCount
}

const parseVulnerabilites = libraryVulnerabilityResponse => {
  let parsedVulnerabilites = {}
  let vulnName = libraryVulnerabilityResponse.libraries
  for (let x in vulnName) {
    let vuln = vulnName[x].vulns
    if (vuln.length > 0) {
      let libname =
        vulnName[x].group +
        '/' +
        vulnName[x].file_name +
        '@' +
        vulnName[x].file_version
      parsedVulnerabilites[libname] = vulnName[x].vulns
    }
  }
  return parsedVulnerabilites
}

const formatVulnerabilityOutput = (
  libraryVulnerabilityResponse,
  severity,
  id,
  name,
  depRiskReportCount,
  config
) => {
  let vulnerableLibraries = libraryVulnerabilityResponse.libraries.filter(
    data => {
      return data.vulns.length > 0
    }
  )

  const numberOfVulnerableLibraries = vulnerableLibraries.length
  let numberOfCves = 0
  vulnerableLibraries.forEach(lib => (numberOfCves += lib.vulns.length))
  commonReport.createLibraryHeader(
    id,
    numberOfVulnerableLibraries,
    numberOfCves,
    name
  )

  const severityCount = oldCountSeverity(vulnerableLibraries)

  // parse so filter code will work for both new (ignore dev dep) and current report
  let vulnerabilities = parseVulnerabilites(libraryVulnerabilityResponse)
  let filteredVulns = commonReport.filterVulnerabilitiesBySeverity(
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

  if (depRiskReportCount && depRiskReportCount.scopedCount === 0) {
    console.log(' No private libraries that are not scoped detected')
  }

  console.log(
    ' \n Please go to the Contrast UI to view your dependency tree: \n' +
      ` \n ${config.host}/Contrast/static/ng/index.html#/${config.organizationId}/applications/${config.applicationId}/libs/dependency-tree`
  )
  return [hasSomeVulnerabilitiesReported, numberOfCves, severityCount]
}

const getLibraryVulnerabilities = async (input, applicationId) => {
  const requestBody = input
  const addParams = agent.getAdditionalParams()
  const userParams = await util.getParams(applicationId)
  const protocol = getValidHost(userParams.host)
  const client = commonApi.getHttpClient(userParams, protocol, addParams)

  return client
    .getLibraryVulnerabilities(requestBody, userParams)
    .then(res => {
      if (res.statusCode === 200) {
        displaySuccessMessageVulnerabilities()
        return res.body
      } else {
        handleResponseErrors(res, 'vulnerabilities')
      }
    })
    .catch(err => {
      console.log(err)
    })
}

module.exports = {
  vulnerabilityReport: vulnerabilityReport,
  getLibraryVulnerabilities: getLibraryVulnerabilities,
  formatVulnerabilityOutput: formatVulnerabilityOutput,
  createLibraryVulnerabilityInput: createLibraryVulnerabilityInput
}
