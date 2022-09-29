import {
  ScanResultsInstances,
  ScanResultsModel
} from './models/scanResultsModel'
import i18n from 'i18n'
import chalk from 'chalk'
import { ResultContent } from './models/resultContentModel'
import { GroupedResultsModel } from './models/groupedResultsModel'
import { sortBy } from 'lodash'
import Table from 'cli-table3'
import {
  CRITICAL_COLOUR,
  HIGH_COLOUR,
  LOW_COLOUR,
  MEDIUM_COLOUR,
  NOTE_COLOUR
} from '../constants/constants'
import {
  getSeverityCounts,
  printVulnInfo
} from '../audit/report/commonReportingFunctions'

export function formatScanOutput(scanResults: ScanResultsModel) {
  const { scanResultsInstances } = scanResults

  const projectOverview = getSeverityCounts(scanResultsInstances.content)
  if (scanResultsInstances.content.length === 0) {
    console.log(i18n.__('scanNoVulnerabilitiesFound'))
    console.log(i18n.__('scanNoVulnerabilitiesFoundSecureCode'))
    console.log(i18n.__('scanNoVulnerabilitiesFoundGoodWork'))
  } else {
    const message =
      projectOverview.critical || projectOverview.high
        ? 'Here are your top priorities to fix'
        : "No major issues, here's what we found"
    console.log(chalk.bold(message))
    console.log()

    let defaultView = getDefaultView(scanResultsInstances.content)

    let count = 0
    defaultView.forEach(entry => {
      count++
      let table = new Table({
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
      let learnRow: string[] = []
      let adviceRow = []
      const headerColour = chalk.hex(entry.colour)
      const headerRow = [
        headerColour(`CONTRAST-${count.toString().padStart(3, '0')}`),
        headerColour(`-`),
        headerColour(`[${entry.severity}] `) +
          headerColour.bold(`${entry.ruleId}`) +
          entry.message
      ]

      const codePath = entry.codePath?.replace(/^@/, '')

      const codeRow = [
        chalk.hex('#F6F5F5').bold(`Code`),
        chalk.hex('#F6F5F5').bold(`:`),
        chalk.hex('#F6F5F5').bold(`${codePath}`)
      ]
      const issueRow = [chalk.bold(`Issue`), chalk.bold(`:`), `${entry.issue}`]

      table.push(headerRow, codeRow, issueRow)

      if (entry?.advice) {
        adviceRow = [
          chalk.bold('Advice'),
          chalk.bold(`:`),
          stripTags(entry.advice)
        ]
        table.push(adviceRow)
      }

      if (entry?.learn && entry?.learn.length > 0) {
        learnRow = [
          chalk.bold('Learn'),
          chalk.bold(`:`),
          chalk.hex('#97f7f7').bold.underline(entry.learn[0])
        ]
        table.push(learnRow)
      }
      console.log(table.toString())
      console.log()
    })
  }
  printVulnInfo(projectOverview)

  return projectOverview
}

export function formatLinks(objName: string, entry: any[]) {
  const line = chalk.bold(objName + '  : ')
  if (entry.length === 1) {
    console.log(line + chalk.hex('#97DCF7').bold.underline(entry[0]))
  } else {
    console.log(line)
    entry.forEach(link => {
      console.log(chalk.hex('#97DCF7').bold.underline(link))
    })
  }
}

export function getDefaultView(content: ResultContent[]) {
  const groupTypeResults = [] as GroupedResultsModel[]

  content.forEach(resultEntry => {
    const groupResultsObj = new GroupedResultsModel(resultEntry.ruleId)
    groupResultsObj.severity = resultEntry.severity
    groupResultsObj.ruleId = resultEntry.ruleId
    groupResultsObj.issue = stripTags(resultEntry.issue)
    groupResultsObj.advice = resultEntry.advice
    groupResultsObj.learn = resultEntry.learn
    groupResultsObj.message = resultEntry.message?.text
      ? editVulName(resultEntry.message.text) +
        ':' +
        getSourceLineNumber(resultEntry)
      : ''
    groupResultsObj.codePath = getLocationsSyncInfo(resultEntry)
    groupTypeResults.push(groupResultsObj)
    assignBySeverity(resultEntry, groupResultsObj)
  })

  return sortBy(groupTypeResults, ['priority'])
}
export function editVulName(message: string) {
  return message.substring(message.indexOf(' in '))
}
export function getLocationsSyncInfo(resultEntry: ResultContent) {
  const locationsMessage =
    resultEntry.locations[0]?.physicalLocation?.artifactLocation?.uri || ''
  const locationsLineNumber =
    resultEntry.locations[0]?.physicalLocation?.region?.startLine || ''

  if (!locationsLineNumber) {
    return '@' + locationsMessage
  }

  return '@' + locationsMessage + ':' + locationsLineNumber
}

export function getSourceLineNumber(resultEntry: ResultContent) {
  const locationsLineNumber =
    resultEntry.locations[0]?.physicalLocation?.region?.startLine || ''
  let codeFlowLineNumber = getCodeFlowInfo(resultEntry)

  return codeFlowLineNumber ? codeFlowLineNumber : locationsLineNumber
}

export function getCodeFlowInfo(resultEntry: ResultContent) {
  let result: any
  resultEntry.codeFlows[0]?.threadFlows.forEach((i: { locations: any[] }) => {
    return (result = i.locations.find(
      (locations: { importance: string }) =>
        locations.importance === 'essential'
    ))
  })

  return result?.location?.physicalLocation?.region?.startLine
}

export function stripTags(oldString: string) {
  return oldString.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
}

export function assignBySeverity(
  entry: ResultContent,
  assignedObj: GroupedResultsModel
) {
  if (entry.severity.toUpperCase() === 'CRITICAL') {
    assignedObj.priority = 1
    assignedObj.colour = CRITICAL_COLOUR
    return assignedObj
  } else if (entry.severity.toUpperCase() === 'HIGH') {
    assignedObj.priority = 2
    assignedObj.colour = HIGH_COLOUR
    return assignedObj
  } else if (entry.severity.toUpperCase() === 'MEDIUM') {
    assignedObj.priority = 3
    assignedObj.colour = MEDIUM_COLOUR
    return assignedObj
  } else if (entry.severity.toUpperCase() === 'LOW') {
    assignedObj.priority = 4
    assignedObj.colour = LOW_COLOUR
    return assignedObj
  } else if (entry.severity.toUpperCase() === 'NOTE') {
    assignedObj.priority = 5
    assignedObj.colour = NOTE_COLOUR
    return assignedObj
  }
}
