const commonApi = require('../../utils/commonApi')
const {
  ReportCompositeKey,
  ReportList,
  ReportModelStructure
} = require('./models/reportListModel')
const { orderBy } = require('lodash')
const chalk = require('chalk')
const {
  countVulnerableLibrariesBySeverity,
  orderByHighestPriority,
  findHighestSeverityCVE,
  findNameAndVersion,
  severityCountAllCVEs,
  findCVESeverity
} = require('./utils/reportUtils')
const { SeverityCountModel } = require('./models/severityCountModel')
const {
  ReportOutputBodyModel,
  ReportOutputHeaderModel,
  ReportOutputModel
} = require('./models/reportOutputModel')
const {
  CE_URL,
  CRITICAL_COLOUR,
  HIGH_COLOUR,
  LOW_COLOUR,
  MEDIUM_COLOUR,
  NOTE_COLOUR
} = require('../../constants/constants')
const Table = require('cli-table3')
const { ReportGuidanceModel } = require('./models/reportGuidanceModel')
const i18n = require('i18n')

const createSummaryMessageTop = (numberOfVulnerableLibraries, numberOfCves) => {
  numberOfVulnerableLibraries === 1
    ? console.log(`Found 1 vulnerable library containing ${numberOfCves} CVE`)
    : console.log(
        `Found ${numberOfVulnerableLibraries} vulnerable libraries containing ${numberOfCves} CVEs`
      )
}

const createSummaryMessageBottom = numberOfVulnerableLibraries => {
  numberOfVulnerableLibraries === 1
    ? console.log(`Found 1 vulnerability`)
    : console.log(`Found ${numberOfVulnerableLibraries} vulnerabilities`)
}

const getReport = async (config, reportId) => {
  const client = commonApi.getHttpClient(config)
  return client
    .getReportById(config, reportId)
    .then(res => {
      if (res.statusCode === 200) {
        return res.body
      } else {
        console.log(JSON.stringify(res.statusCode))
        commonApi.handleResponseErrors(res, 'report')
      }
    })
    .catch(err => {
      console.log(err)
    })
}

const printVulnerabilityResponse = (
  config,
  vulnerableLibraries,
  numberOfVulnerableLibraries,
  numberOfCves,
  guidance
) => {
  let hasSomeVulnerabilitiesReported = false
  printFormattedOutput(
    config,
    vulnerableLibraries,
    numberOfVulnerableLibraries,
    numberOfCves,
    guidance
  )
  if (Object.keys(vulnerableLibraries).length > 0) {
    hasSomeVulnerabilitiesReported = true
  }
  return hasSomeVulnerabilitiesReported
}

const printFormattedOutput = (
  config,
  libraries,
  numberOfVulnerableLibraries,
  numberOfCves,
  guidance
) => {
  createSummaryMessageTop(numberOfVulnerableLibraries, numberOfCves)
  console.log()
  const report = new ReportList()

  for (const library of libraries) {
    const { name, version } = findNameAndVersion(library, config)

    const newOutputModel = new ReportModelStructure(
      new ReportCompositeKey(
        name,
        version,
        findHighestSeverityCVE(library.cveArray),
        severityCountAllCVEs(
          library.cveArray,
          new SeverityCountModel()
        ).getTotal
      ),
      library.cveArray
    )
    report.reportOutputList.push(newOutputModel)
  }

  const outputOrderedByLowestSeverityAndLowestNumOfCvesFirst = orderBy(
    report.reportOutputList,
    [
      reportListItem => {
        return reportListItem.compositeKey.highestSeverity.priority
      },
      reportListItem => {
        return reportListItem.compositeKey.numberOfSeverities
      }
    ],
    ['asc', 'desc']
  )

  let contrastHeaderNumCounter = 0
  for (const reportModel of outputOrderedByLowestSeverityAndLowestNumOfCvesFirst) {
    contrastHeaderNumCounter++
    const { libraryName, libraryVersion, highestSeverity } =
      reportModel.compositeKey
    const numOfCVEs = reportModel.cveArray.length

    const table = getReportTable()

    const header = buildHeader(
      highestSeverity,
      contrastHeaderNumCounter,
      libraryName,
      libraryVersion,
      numOfCVEs
    )

    const advice = gatherRemediationAdvice(
      guidance,
      libraryName,
      libraryVersion
    )

    const body = buildBody(reportModel.cveArray, advice)

    const reportOutputModel = new ReportOutputModel(header, body)

    table.push(
      reportOutputModel.body.issueMessage,
      reportOutputModel.body.adviceMessage
    )

    console.log(
      reportOutputModel.header.vulnMessage,
      reportOutputModel.header.introducesMessage
    )
    console.log(table.toString() + '\n')
  }

  createSummaryMessageBottom(numberOfVulnerableLibraries)
  const {
    criticalMessage,
    highMessage,
    mediumMessage,
    lowMessage,
    noteMessage
  } = buildFooter(outputOrderedByLowestSeverityAndLowestNumOfCvesFirst)
  console.log(
    `${criticalMessage} | ${highMessage} | ${mediumMessage} | ${lowMessage} | ${noteMessage}`
  )

  if (config.host !== CE_URL) {
    console.log(
      '\n' + chalk.bold('View your full dependency tree in Contrast:')
    )
    console.log(
      `${config.host}/Contrast/static/ng/index.html#/${config.organizationId}/applications/${config.applicationId}/libs/dependency-tree`
    )
  }
}

function getReportTable() {
  return new Table({
    chars: {
      top: '',
      'top-mid': '',
      'top-left': '',
      'top-right': '',
      bottom: '',
      'bottom-mid': '',
      'bottom-left': '',
      'bottom-right': '',
      left: '',
      'left-mid': '',
      mid: '',
      'mid-mid': '',
      right: '',
      'right-mid': '',
      middle: ' '
    },
    style: { 'padding-left': 0, 'padding-right': 0 },
    colAligns: ['right'],
    wordWrap: true,
    colWidths: [12, 1, 100]
  })
}
function buildHeader(
  highestSeverity,
  contrastHeaderNum,
  libraryName,
  version,
  numOfCVEs
) {
  const vulnerabilityPluralised =
    numOfCVEs > 1 ? 'vulnerabilities' : 'vulnerability'
  const formattedHeaderNum = buildFormattedHeaderNum(contrastHeaderNum)

  const headerColour = chalk.hex(highestSeverity.colour)
  const headerNumAndSeverity = headerColour(
    `${formattedHeaderNum} - [${highestSeverity.severity}]`
  )
  const libraryNameAndVersion = headerColour.bold(`${libraryName}-${version}`)
  const vulnMessage = `${headerNumAndSeverity} ${libraryNameAndVersion}`

  const introducesMessage = `introduces ${numOfCVEs} ${vulnerabilityPluralised}`

  return new ReportOutputHeaderModel(vulnMessage, introducesMessage)
}

function buildBody(cveArray, advice) {
  let assignPriorityToVulns = cveArray.map(result => findCVESeverity(result))

  const issueMessage = getIssueRow(assignPriorityToVulns)

  //todo different advice based on remediationGuidance being available or now
  // console.log(advice)

  const minOrMax = advice.maximum ? advice.maximum : advice.minimum
  const displayAdvice = minOrMax
    ? `Change to version ${chalk.bold(minOrMax)}`
    : 'No recommendation is available according to our data. Upgrade to the latest stable is the best advice we can give.'

  const adviceMessage = [chalk.bold('Advice'), ':', displayAdvice]

  return new ReportOutputBodyModel(issueMessage, adviceMessage)
}

function getIssueRow(cveArray) {
  orderByHighestPriority(cveArray)
  const cveMessagesList = getIssueCveMsgList(cveArray)
  return [chalk.bold('Issue'), ':', `${cveMessagesList.join(', ')}`]
}

function gatherRemediationAdvice(guidance, libraryName, libraryVersion) {
  const guidanceModel = new ReportGuidanceModel()

  const data = guidance[libraryName + '@' + libraryVersion]

  if (data) {
    guidanceModel.minimum = data.minUpgradeVersion
    guidanceModel.maximum = data.maxUpgradeVersion
  }

  return guidanceModel
}

function buildFormattedHeaderNum(contrastHeaderNum) {
  return `CONTRAST-${contrastHeaderNum.toString().padStart(3, '0')}`
}

const buildFooter = reportModelStructure => {
  const { critical, high, medium, low, note } =
    countVulnerableLibrariesBySeverity(reportModelStructure)

  const criticalMessage = chalk
    .hex(CRITICAL_COLOUR)
    .bold(`${critical} Critical`)
  const highMessage = chalk.hex(HIGH_COLOUR).bold(`${high} High`)
  const mediumMessage = chalk.hex(MEDIUM_COLOUR).bold(`${medium} Medium`)
  const lowMessage = chalk.hex(LOW_COLOUR).bold(`${low} Low`)
  const noteMessage = chalk.hex(NOTE_COLOUR).bold(`${note} Note`)

  return {
    criticalMessage,
    highMessage,
    mediumMessage,
    lowMessage,
    noteMessage
  }
}

const getIssueCveMsgList = results => {
  const cveMessages = []

  results.forEach(reportSeverityModel => {
    // @ts-ignore
    const { colour, severity, name } = reportSeverityModel

    const severityShorthand = chalk
      .hex(colour)
      .bold(`[${severity.charAt(0).toUpperCase()}]`)

    const builtMessage = severityShorthand + name
    cveMessages.push(builtMessage)
  })
  return cveMessages
}

const getSeverityCounts = results => {
  const acc = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    note: 0,
    total: 0
  }
  if (results && results.length > 0) {
    results.forEach(i => {
      acc[i.severity.toLowerCase()] += 1
      acc.total += 1
      return acc
    })
  }

  return acc
}

const printNoVulnFoundMsg = () => {
  console.log(i18n.__('scanNoVulnerabilitiesFound'))
  console.log(i18n.__('scanNoVulnerabilitiesFoundSecureCode'))
  console.log(i18n.__('scanNoVulnerabilitiesFoundGoodWork'))
  console.log(chalk.bold(`Found 0 vulnerabilities`))
  console.log(
    i18n.__(
      'foundDetailedVulnerabilities',
      String(0),
      String(0),
      String(0),
      String(0),
      String(0)
    )
  )
}
const printVulnInfo = projectOverview => {
  const totalVulnerabilities = projectOverview.total

  createSummaryMessageBottom(totalVulnerabilities)
  const formattedValues = severityFormatted(projectOverview)
  console.log(
    i18n.__(
      'foundDetailedVulnerabilities',
      String(formattedValues.criticalFormatted),
      String(formattedValues.highFormatted),
      String(formattedValues.mediumFormatted),
      String(formattedValues.lowFormatted),
      String(formattedValues.noteFormatted)
    )
  )
}

const severityFormatted = projectOverview => {
  const criticalFormatted = chalk
    .hex(CRITICAL_COLOUR)
    .bold(`${projectOverview.critical} Critical`)
  const highFormatted = chalk
    .hex(HIGH_COLOUR)
    .bold(`${projectOverview.high} High`)
  const mediumFormatted = chalk
    .hex(MEDIUM_COLOUR)
    .bold(`${projectOverview.medium} Medium`)
  const lowFormatted = chalk.hex(LOW_COLOUR).bold(`${projectOverview.low} Low`)
  const noteFormatted = chalk
    .hex(NOTE_COLOUR)
    .bold(`${projectOverview.note} Note`)

  return {
    criticalFormatted,
    highFormatted,
    mediumFormatted,
    lowFormatted,
    noteFormatted
  }
}

module.exports = {
  createSummaryMessageTop,
  getReport,
  createSummaryMessageBottom,
  printVulnerabilityResponse,
  printFormattedOutput,
  getReportTable,
  buildHeader,
  buildBody,
  getIssueRow,
  gatherRemediationAdvice,
  buildFormattedHeaderNum,
  getIssueCveMsgList,
  getSeverityCounts,
  printNoVulnFoundMsg,
  printVulnInfo
}
