const {
  getSeverityCounts,
  createSummaryMessageTop,
  printVulnInfo,
  getReportTable,
  getIssueRow,
  printNoVulnFoundMsg
} = require('../../audit/report/commonReportingFunctions')
const { orderBy } = require('lodash')
const { assignBySeverity } = require('../../scan/formatScanOutput')
const chalk = require('chalk')
const { CE_URL } = require('../../constants/constants')
const common = require('../../common/fail')

const processAuditReport = (config, results) => {
  let severityCounts = {}
  if (results !== undefined) {
    severityCounts = formatScaServicesReport(config, results)
  }

  if (config.fail) {
    common.processFail(config, severityCounts)
  }
}
const formatScaServicesReport = (config, results) => {
  const projectOverviewCount = getSeverityCounts(results)

  if (projectOverviewCount.total === 0) {
    printNoVulnFoundMsg()
    return projectOverviewCount
  } else {
    let total = 0
    const numberOfCves = results.length
    const table = getReportTable()
    let contrastHeaderNumCounter = 0
    let assignPriorityToResults = results.map(result =>
      assignBySeverity(result, result)
    )
    const numberOfVulns = results
      .map(result => result.vulnerabilities)
      .reduce((a, b) => {
        return (total += b.length)
      }, 0)
    const outputOrderedByLowestSeverityAndLowestNumOfCvesFirst = orderBy(
      assignPriorityToResults,
      [
        reportListItem => {
          return reportListItem.priority
        },
        reportListItem => {
          return reportListItem.vulnerabilities.length
        }
      ],
      ['asc', 'desc']
    )

    for (const result of outputOrderedByLowestSeverityAndLowestNumOfCvesFirst) {
      contrastHeaderNumCounter++
      const cvesNum = result.vulnerabilities.length
      const grammaticallyCorrectVul =
        result.vulnerabilities.length > 1 ? 'vulnerabilities' : 'vulnerability'

      const headerColour = chalk.hex(result.colour)
      const headerRow = [
        headerColour(
          `CONTRAST-${contrastHeaderNumCounter.toString().padStart(3, '0')}`
        ),
        headerColour(`-`),
        headerColour(`[${result.severity}] `) +
          headerColour.bold(`${result.artifactName}`) +
          ` introduces ${cvesNum} ${grammaticallyCorrectVul}`
      ]

      const adviceRow = [
        chalk.bold(`Advice`),
        chalk.bold(`:`),
        `Change to version ${result.remediationAdvice.latestStableVersion}`
      ]

      let assignPriorityToVulns = result.vulnerabilities.map(result =>
        assignBySeverity(result, result)
      )
      const issueRow = getIssueRow(assignPriorityToVulns)

      table.push(headerRow, issueRow, adviceRow)
      console.log()
    }

    console.log()
    createSummaryMessageTop(numberOfCves, numberOfVulns)
    console.log(table.toString() + '\n')
    printVulnInfo(projectOverviewCount)

    if (config.host !== CE_URL) {
      console.log(
        '\n' + chalk.bold('View your full dependency tree in Contrast:')
      )
      console.log(
        `${config.host}/Contrast/static/ng/index.html#/${config.organizationId}/applications/${config.applicationId}/libs/dependency-tree`
      )
    }
    return projectOverviewCount
  }
}
module.exports = {
  formatScaServicesReport,
  processAuditReport
}
