import {
  getReport,
  printNoVulnFoundMsg,
  printVulnerabilityResponse
} from './commonReportingFunctions'
import {
  convertGenericToTypedLibraryVulns,
  severityCountAllLibraries
} from './utils/reportUtils'
import i18n from 'i18n'
import chalk from 'chalk'
import * as constants from '../../constants/constants'
import { SeverityCountModel } from './models/severityCountModel'
import * as common from '../../common/fail'

export function convertKeysToStandardFormat(config: any, guidance: any) {
  let convertedGuidance = guidance

  switch (config.language) {
    case constants.supportedLanguages.JAVA:
    case constants.supportedLanguages.GO:
    case constants.supportedLanguages.PHP:
      break
    case constants.supportedLanguages.NODE:
    case constants.supportedLanguages.DOTNET:
    case constants.supportedLanguages.PYTHON:
    case constants.supportedLanguages.RUBY:
      convertedGuidance = convertJSDotNetPython(guidance)
      break
  }
  return convertedGuidance
}

export function convertJSDotNetPython(guidance: any) {
  const returnObject = {}

  Object.entries(guidance).forEach(([key, value]) => {
    const splitKey = key.split('/')
    if (splitKey.length === 2) {
      // @ts-ignore
      returnObject[splitKey[1]] = value
    }
  })
  return returnObject
}

export function formatVulnerabilityOutput(
  libraryVulnerabilityResponse: any,
  id: string,
  config: any,
  remediationGuidance: any
) {
  const vulnerableLibraries = convertGenericToTypedLibraryVulns(
    libraryVulnerabilityResponse
  )

  const guidance = convertKeysToStandardFormat(config, remediationGuidance)

  const numberOfVulnerableLibraries = vulnerableLibraries.length

  if (numberOfVulnerableLibraries === 0) {
    printNoVulnFoundMsg()
    return [false, 0, [new SeverityCountModel()]]
  } else {
    let numberOfCves = 0
    vulnerableLibraries.forEach(lib => (numberOfCves += lib.cveArray.length))

    const hasSomeVulnerabilitiesReported = printVulnerabilityResponse(
      config,
      vulnerableLibraries,
      numberOfVulnerableLibraries,
      numberOfCves,
      guidance
    )
    let severityCount = new SeverityCountModel()
    severityCount = severityCountAllLibraries(
      vulnerableLibraries,
      severityCount
    )
    severityCount.total = severityCount.getTotal
    return [hasSomeVulnerabilitiesReported, numberOfCves, severityCount]
  }
}

export async function vulnerabilityReportV2(config: any, reportId: string) {
  console.log()
  const reportResponse = await getReport(config, reportId)

  if (reportResponse !== undefined) {
    let output = formatVulnerabilityOutput(
      reportResponse.vulnerabilities,
      config.applicationId,
      config,
      reportResponse.remediationGuidance
        ? reportResponse.remediationGuidance
        : {}
    )

    if (config.fail) {
      common.processFail(config, output[2])
    }
  }
}
