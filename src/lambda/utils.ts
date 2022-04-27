import chalk from 'chalk'
import { capitalize, groupBy, minBy, sortBy } from 'lodash'
import { log } from './logUtils'

const groupByCVE = ({ title }: any) =>
  title.substring(0, title.indexOf('[') - 1)

const groupByDependency = ({ title }: any) =>
  title.substring(title.indexOf('[') + 1, title.indexOf(']'))

const prettyPrintResults = (results: any[]) => {
  log('')

  //filter out any vulnerabs which is not least privilege or dependencies- cli does not handle other vulnerabs yet
  const vulnerabs = results.filter(r => r.category === 1 || r.category === 4)
  const sortBySeverity = sortBy(vulnerabs, ['severity', 'title'])
  const notDependencies = sortBySeverity.filter(r => r.category !== 1)
  const dependencies = sortBySeverity.filter(r => r.category === 1)
  const dependenciesByLibrary = groupBy(dependencies, groupByDependency)
  const dependenciesCount = Object.keys(dependenciesByLibrary).length

  notDependencies.forEach(printVulnerability)

  const prevIndex = notDependencies.length + 1
  Object.entries(dependenciesByLibrary).forEach(([library, group], i) => {
    const maxSeverity = minBy(group, 'severity')
    const allCves = group.map(groupByCVE)

    log(prevIndex + i)
    log(
      `${chalk.bold(capitalize(maxSeverity.severityText))} | ${chalk.bold(
        'Vulnerable dependency'
      )} ${library} has ${group.length} known CVEs`
    )
    log(allCves.join(', '))
    if (maxSeverity.remediation?.description) {
      log(
        `${chalk.bold('Recommendation:')} ${
          maxSeverity.remediation.description
        }`
      )
    }
    log('')
  })

  const resultCount = notDependencies.length + dependenciesCount
  const groupByType = groupBy(notDependencies, ['categoryText'])
  const summary = Object.values(groupByType).map(
    group => `${group.length} ${capitalize(group[0].categoryText)}`
  )
  log(`Found ${resultCount} vulnerabilities`, { bold: true })
  summary.push(`${dependenciesCount} Dependencies`)

  log(chalk.bold(summary.join(' | ')))
}

const underlineLinks = (text: string) => {
  if (!text) {
    return text
  }

  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.replace(urlRegex, chalk.underline('$1'))
}

const printVulnerability = (vulnerability: any, index: number) => {
  log(index + 1)
  const descriptionWithLinks = underlineLinks(vulnerability.description)
  log(
    `${chalk.bold(capitalize(vulnerability.severityText))} | ${chalk.bold(
      vulnerability.title
    )} ${descriptionWithLinks}`
  )

  const category = vulnerability?.categoryText
  switch (category) {
    case 'PERMISSIONS':
      printLeastPrivilegeRemediation(vulnerability)
      break
    default:
      printRemediation(vulnerability)
  }
  log('')
}

const printLeastPrivilegeRemediation = (vulnerability: any) => {
  log(
    `${chalk.bold(
      'Recommendation:'
    )} Replace the existing policies with the following`
  )

  const violatingPolicies =
    vulnerability?.evidence?.leastPrivilege?.violatingPolicies || []

  violatingPolicies
    .filter((vp: any) => vp?.suggestedPolicy?.suggestedPolicyCode?.length)
    .map((vp: any) => vp?.suggestedPolicy?.suggestedPolicyCode)
    .forEach((policies: any) => {
      policies.forEach((policy: any) => {
        console.log(policy.snippet)
      })
    })
}

const printRemediation = (vulnerability: any) => {
  log(`Remediation - ${vulnerability?.remediation?.description || 'Unknown'}`)
}

function toLowerKeys(obj: Record<string, unknown>) {
  return Object.keys(obj).reduce((accumulator, key) => {
    const new_key = `${key[0].toLowerCase()}${key.slice(1)}`
    accumulator[new_key] = obj[key]
    return accumulator
  }, {} as Record<string, unknown>)
}

export { toLowerKeys, prettyPrintResults }

export const exportedForTesting = {
  printLeastPrivilegeRemediation,
  printRemediation,
  printVulnerability,
  underlineLinks
}
