const i18n = require('i18n')
const { getHttpClient } = require('../../../utils/commonApi')

function displaySuccessMessageReport() {
  console.log('\n' + i18n.__('reportSuccessMessage'))
}

function getAllDependenciesArray(packageJson) {
  const {
    dependencies,
    optionalDependencies,
    devDependencies,
    peerDependencies
  } = packageJson

  const allDep = {
    ...dependencies,
    ...devDependencies,
    ...optionalDependencies,
    ...peerDependencies
  }

  return Object.entries(allDep)
}

function checkIfDepIsScoped(arrDep) {
  let count = 0
  arrDep.forEach(([key, value]) => {
    if (!key.startsWith('@')) {
      console.log(` WARNING not scoped: ${key}:${value}`)
      count++
    }
  })
  return count
}

const dependencyRiskReport = async (packageJson, config) => {
  const arrDep = getAllDependenciesArray(packageJson)
  const unRegisteredDeps = await checkIfDepIsRegisteredOnNPM(arrDep, config)
  let scopedCount = checkIfDepIsScoped(unRegisteredDeps)

  return {
    scopedCount: scopedCount,
    unRegisteredCount: unRegisteredDeps.length
  }
}

const checkIfDepIsRegisteredOnNPM = async (arrDep, config) => {
  let promises = []
  let unRegisteredDeps = []
  const client = getHttpClient(config)

  for (const [index, element] of arrDep) {
    const query = `query artifactByGAV($name: String!, $language: String!, $groupName: String, $version: String!, $nameCheck: Boolean) {
    artifact: exactVersion(name: $name, language: $language, groupName: $groupName, version: $version, nameCheck: $nameCheck) {
        version
        cves {
            baseScore
        }}}`

    const data = {
      query: query,
      variables: {
        name: index,
        version: element,
        language: 'node',
        nameCheck: true
      }
    }

    promises.push(client.checkLibrary(data))
  }

  await Promise.all(promises).then(response => {
    response.forEach(res => {
      const libName = JSON.parse(res.request.body)
      if (res.statusCode === 200) {
        if (res.body.data.artifact == null) {
          unRegisteredDeps.push([
            libName.variables.name,
            libName.variables.version
          ])
        }
      }
    })
  })

  if (unRegisteredDeps.length !== 0) {
    console.log(
      '\n Dependencies Risk Report',
      '\n\n Private libraries that are not scoped. We recommend these libraries are reviewed and the scope claimed to prevent dependency confusion breaches'
    )
  }

  return unRegisteredDeps
}

const createLibraryHeader = (
  id,
  numberOfVulnerableLibraries,
  numberOfCves,
  name
) => {
  name
    ? console.log(` Application Name: ${name} | Application ID: ${id}`)
    : console.log(` Application ID: ${id}`)
  console.log(
    ` Found ${numberOfVulnerableLibraries} vulnerable libraries containing ${numberOfCves} CVE's`
  )
}

const breakPipeline = () => {
  failOptionError()
  process.exit(1)
}

const parameterOptions = hasSomeVulnerabilitiesReported => {
  const inputtedCLIOptions = cliOptions.getCommandLineArgs()
  let cveSeverityOption = inputtedCLIOptions['cve_severity']
  let fail = inputtedCLIOptions['fail']
  let cve_threshold = inputtedCLIOptions['cve_threshold']
  let expr
  if (cveSeverityOption && fail && cve_threshold) {
    expr = 'SeverityAndThreshold'
  } else if (!cveSeverityOption && fail && cve_threshold) {
    expr = 'ThresholdOnly'
  } else if (!cve_threshold && fail && hasSomeVulnerabilitiesReported[0]) {
    expr = 'FailOnly'
  }
  return expr
}

const analyseReportOptions = hasSomeVulnerabilitiesReported => {
  const inputtedCLIOptions = cliOptions.getCommandLineArgs()
  let cve_threshold = inputtedCLIOptions['cve_threshold']
  let cveSeverity
  let criticalSeverity
  let highSeverity
  let mediumSeverity
  let lowSeverity

  switch (parameterOptions(hasSomeVulnerabilitiesReported)) {
    case 'SeverityAndThreshold':
      cveSeverity = inputtedCLIOptions['cve_severity'].severity
      criticalSeverity = hasSomeVulnerabilitiesReported[2].critical
      highSeverity = hasSomeVulnerabilitiesReported[2].high
      mediumSeverity = hasSomeVulnerabilitiesReported[2].medium
      lowSeverity = hasSomeVulnerabilitiesReported[2].low

      if (cveSeverity === 'HIGH') {
        if (cve_threshold < highSeverity + criticalSeverity) {
          breakPipeline()
        }
      }

      if (cveSeverity === 'MEDIUM') {
        if (cve_threshold < mediumSeverity + highSeverity) {
          breakPipeline()
        }
      }

      if (cveSeverity === 'LOW') {
        if (cve_threshold < lowSeverity + mediumSeverity + highSeverity) {
          breakPipeline()
        }
      }
      break
    case 'ThresholdOnly':
      if (cve_threshold < hasSomeVulnerabilitiesReported[1]) {
        breakPipeline()
      }
      break
    case 'FailOnly':
      breakPipeline()
      break
  }
}

const getReport = async applicationId => {
  const userParams = await util.getParams(applicationId)
  const addParams = agent.getAdditionalParams()
  const protocol = getValidHost(userParams.host)
  const client = commonApi.getHttpClient(userParams, protocol, addParams)
  return client
    .getReport(userParams)
    .then(res => {
      if (res.statusCode === 200) {
        displaySuccessMessageReport()
        return res.body
      } else {
        handleResponseErrors(res, 'report')
      }
    })
    .catch(err => {
      console.log(err)
    })
}

const printVulnerabilityResponse = (
  severity,
  filteredVulns,
  vulnerabilities
) => {
  let hasSomeVulnerabilitiesReported = false
  if (severity) {
    returnCveData(filteredVulns)
    if (Object.keys(filteredVulns).length > 0)
      hasSomeVulnerabilitiesReported = true
  } else {
    returnCveData(vulnerabilities)
    if (Object.keys(vulnerabilities).length > 0)
      hasSomeVulnerabilitiesReported = true
  }
  return hasSomeVulnerabilitiesReported
}

const returnCveData = libraries => {
  console.log('\n ************************************************************')

  for (const [key, value] of Object.entries(libraries)) {
    const parts = key.split('/')
    const nameVersion = parts[1].split('@')
    const group = parts[0]
    const name = nameVersion[0]
    const version = nameVersion[1]

    const libName =
      group !== 'null'
        ? `${group}/${name}/${version} is vulnerable`
        : `${name}/${version} is vulnerable`

    console.log('\n\n ' + libName)
    value.forEach(vuln => {
      let sevCode = vuln.severityCode || vuln.severity_code
      console.log('\n ' + vuln.name + ' ' + sevCode + '\n ' + vuln.description)
    })
  }
}

function searchHighCVEs(vuln) {
  let sevCode = vuln.severityCode || vuln.severity_code
  if (sevCode === 'HIGH') {
    return vuln
  }
}

function searchMediumCVEs(vuln) {
  let sevCode = vuln.severityCode || vuln.severity_code
  if (sevCode === 'HIGH' || sevCode === 'MEDIUM') {
    return vuln
  }
}

function searchLowCVEs(vuln) {
  let sevCode = vuln.severityCode || vuln.severity_code
  if (sevCode === 'HIGH' || sevCode === 'MEDIUM' || sevCode === 'LOW') {
    return vuln
  }
}

const filterVulnerabilitiesBySeverity = (severity, vulnerabilities) => {
  let filteredVulns = []
  if (severity) {
    for (let x in vulnerabilities) {
      if (severity.severity === 'HIGH') {
        let highVulnerability = vulnerabilities[x].filter(searchHighCVEs)
        if (highVulnerability.length > 0) {
          filteredVulns[x] = highVulnerability
        }
      } else if (severity.severity === 'MEDIUM') {
        let mediumVulnerability = vulnerabilities[x].filter(searchMediumCVEs)
        if (mediumVulnerability.length > 0) {
          filteredVulns[x] = mediumVulnerability
        }
      } else if (severity.severity === 'LOW') {
        let lowVulnerability = vulnerabilities[x].filter(searchLowCVEs)
        if (lowVulnerability.length > 0) {
          filteredVulns[x] = lowVulnerability
        }
      }
    }
  }
  return filteredVulns
}

module.exports = {
  displaySuccessMessageReport: displaySuccessMessageReport,
  getAllDependenciesArray: getAllDependenciesArray,
  dependencyRiskReport: dependencyRiskReport,
  createLibraryHeader: createLibraryHeader,
  breakPipeline: breakPipeline,
  parameterOptions: parameterOptions,
  analyseReportOptions: analyseReportOptions,
  getReport: getReport,
  checkIfDepIsScoped: checkIfDepIsScoped,
  checkIfDepIsRegisteredOnNPM: checkIfDepIsRegisteredOnNPM,
  filterVulnerabilitiesBySeverity: filterVulnerabilitiesBySeverity,
  searchLowCVEs: searchLowCVEs,
  searchMediumCVEs: searchMediumCVEs,
  searchHighCVEs: searchHighCVEs,
  returnCveData: returnCveData,
  printVulnerabilityResponse: printVulnerabilityResponse
}
