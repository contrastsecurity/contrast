import {
  ReportCVEModel,
  ReportLibraryModel
} from '../models/reportLibraryModel'
import { ReportSeverityModel } from '../models/reportSeverityModel'
import languageAnalysisEngine from '../../../constants/constants'
import {
  CRITICAL_COLOUR,
  CRITICAL_PRIORITY,
  HIGH_COLOUR,
  HIGH_PRIORITY,
  LOW_COLOUR,
  LOW_PRIORITY,
  MEDIUM_COLOUR,
  MEDIUM_PRIORITY,
  NOTE_COLOUR,
  NOTE_PRIORITY
} from '../../../constants/constants'
import { orderBy } from 'lodash'
import { SeverityCountModel } from '../models/severityCountModel'
import { ReportModelStructure } from '../models/reportListModel'
const {
  supportedLanguages: { GO }
} = languageAnalysisEngine

export function findHighestSeverityCVE(cveArray: ReportCVEModel[]) {
  const mappedToReportSeverityModels = cveArray.map(cve => findCVESeverity(cve))

  //order and get first
  return orderBy(mappedToReportSeverityModels, cve => cve?.priority)[0]
}

export function orderByHighestPriority(cves: ReportCVEModel[]) {
  return orderBy(cves, ['priority'], ['asc'])
}

export function findCVESeverity(cve: ReportCVEModel) {
  const cveName = cve.name as string
  if (cve.cvss3SeverityCode === 'CRITICAL' || cve.severityCode === 'CRITICAL') {
    return new ReportSeverityModel(
      'CRITICAL',
      CRITICAL_PRIORITY,
      CRITICAL_COLOUR,
      cveName
    )
  } else if (cve.cvss3SeverityCode === 'HIGH' || cve.severityCode === 'HIGH') {
    return new ReportSeverityModel('HIGH', HIGH_PRIORITY, HIGH_COLOUR, cveName)
  } else if (
    cve.cvss3SeverityCode === 'MEDIUM' ||
    cve.severityCode === 'MEDIUM'
  ) {
    return new ReportSeverityModel(
      'MEDIUM',
      MEDIUM_PRIORITY,
      MEDIUM_COLOUR,
      cveName
    )
  } else if (cve.cvss3SeverityCode === 'LOW' || cve.severityCode === 'LOW') {
    return new ReportSeverityModel('LOW', LOW_PRIORITY, LOW_COLOUR, cveName)
  } else if (cve.cvss3SeverityCode === 'NOTE' || cve.severityCode === 'NOTE') {
    return new ReportSeverityModel('NOTE', NOTE_PRIORITY, NOTE_COLOUR, cveName)
  }
}

export function convertGenericToTypedLibraryVulns(libraries: any) {
  return Object.entries(libraries).map(([name, cveArray]) => {
    return new ReportLibraryModel(name, cveArray as ReportCVEModel[])
  })
}

export function severityCountAllLibraries(
  vulnerableLibraries: ReportLibraryModel[],
  severityCount: SeverityCountModel
) {
  vulnerableLibraries.forEach(lib =>
    severityCountAllCVEs(lib.cveArray, severityCount)
  )
  return severityCount
}

export function severityCountAllCVEs(
  cveArray: ReportCVEModel[],
  severityCount: SeverityCountModel
) {
  const severityCountInner = severityCount
  cveArray.forEach(cve => severityCountSingleCVE(cve, severityCountInner))
  return severityCountInner
}

export function severityCountSingleCVE(
  cve: ReportCVEModel,
  severityCount: SeverityCountModel
) {
  if (cve.cvss3SeverityCode === 'CRITICAL' || cve.severityCode === 'CRITICAL') {
    severityCount.critical += 1
  } else if (cve.cvss3SeverityCode === 'HIGH' || cve.severityCode === 'HIGH') {
    severityCount.high += 1
  } else if (
    cve.cvss3SeverityCode === 'MEDIUM' ||
    cve.severityCode === 'MEDIUM'
  ) {
    severityCount.medium += 1
  } else if (cve.cvss3SeverityCode === 'LOW' || cve.severityCode === 'LOW') {
    severityCount.low += 1
  } else if (cve.cvss3SeverityCode === 'NOTE' || cve.severityCode === 'NOTE') {
    severityCount.note += 1
  }

  return severityCount
}

export function findNameAndVersion(library: ReportLibraryModel, config: any) {
  if (config.language.toUpperCase() === GO) {
    const nameVersion = library.name.split('@')
    const name = nameVersion[0]
    const version = nameVersion[1]

    return { name, version }
  } else {
    //spreads items from split into set so no duplicates appear
    const uniqueSplitLibraryName = [...new Set(library.name.split('/'))]
    const nameVersion = uniqueSplitLibraryName[1].split('@')

    let parentLibrary
    let name
    if (
      uniqueSplitLibraryName[0] !== 'null' &&
      uniqueSplitLibraryName[0] !== '' &&
      !uniqueSplitLibraryName[1].includes(uniqueSplitLibraryName[0])
    ) {
      //if the parent lib (element 0) is not null, not blank and not already part of the library name
      //e.g. shared-ini-file-loader-1.0.0-rc.3 is very generic - converts to @aws-sdk/shared-ini-file-loader-1.0.0-rc.3
      parentLibrary = uniqueSplitLibraryName[0]
      name = `${parentLibrary}/${nameVersion[0]}`
    } else {
      name = nameVersion[0]
    }

    const version = nameVersion[1]

    return { name, version }
  }
}

export function countVulnerableLibrariesBySeverity(
  reportModelStructure: ReportModelStructure[]
) {
  const severityCount = new SeverityCountModel()
  reportModelStructure.forEach(vuln => {
    const currentSeverity = vuln.compositeKey.highestSeverity.severity
    if (currentSeverity === 'CRITICAL') {
      severityCount.critical += 1
    } else if (currentSeverity === 'HIGH') {
      severityCount.high += 1
    } else if (currentSeverity === 'MEDIUM') {
      severityCount.medium += 1
    } else if (currentSeverity === 'LOW') {
      severityCount.low += 1
    } else if (currentSeverity === 'NOTE') {
      severityCount.note += 1
    }
  })

  return severityCount
}
