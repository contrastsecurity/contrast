import chalk from 'chalk'
import { groupBy, sortBy, capitalize, minBy } from 'lodash'
import i18n from 'i18n'
import { log } from './logUtils'

// fix for using `plural`
// https://github.com/mashpie/i18n-node/issues/429
i18n.setLocale('en')

class PrintVulnerability {
  index: number
  vulnerability: any
  group?: any[]
  title: string
  severity: string
  remediation: string
  description: string
  recommendation: string
  whatHappened: string

  constructor(index: number, vulnerability: any, group?: any[]) {
    const {
      severityText,
      title,
      description,
      remediation,
      categoryText
    } = vulnerability

    this.group = group
    this.vulnerability = vulnerability
    this.index = index
    this.title = title
    this.severity = capitalize(severityText)
    this.description = underlineLinks(description)
    this.remediation = remediation?.description
    this.recommendation = ''
    this.whatHappened = ''

    if (categoryText === 'PERMISSIONS') {
      this.formatPermissions()
    } else if (categoryText === 'DEPENDENCIES') {
      this.formatDependencies()
    }
  }

  formatPermissions() {
    const { leastPrivilege, comment } = this.vulnerability.evidence
    const violatingPolicies = leastPrivilege?.violatingPolicies || []

    const filteredPolicies = violatingPolicies
      .filter((vp: any) => vp?.suggestedPolicy?.suggestedPolicyCode?.length)
      .map((vp: any) => vp?.suggestedPolicy)

    const shouldNumerate = filteredPolicies.length > 1
    filteredPolicies.forEach((policies: any, i: number) => {
      const { suggestedPolicyCode, description } = policies

      suggestedPolicyCode.forEach((policy: any) => {
        const { snippet, title } = policy
        this.recommendation += shouldNumerate
          ? ` ${i + 1}. ${description}\n`
          : `${description}\n`

        if (title !== 'DELETE POLICY') {
          this.recommendation += `${snippet}\n`
        }
      })
    })

    if (comment?.length) {
      const splitComment = (comment: string) => {
        const [policy, description] = comment.split(':').map(c => c.trim())
        return { policy, description }
      }
      const groupByPolicy = groupBy(comment, c => splitComment(c).policy)

      Object.entries(groupByPolicy).forEach(([policy, commentArr]) => {
        const comments = commentArr
          .map(splitComment)
          .map(({ description }) => ` - ${description}`)
          .join('\n')
        this.whatHappened += i18n.__('whatHappenedItem', { policy, comments })
      })
    }
  }

  formatDependencies() {
    if (!this.group?.length) {
      this.recommendation = this.vulnerability?.remediation?.description
      return
    }

    const maxSeverity = minBy(this.group, 'severity')
    this.title = i18n.__('vulnerableDependency')
    this.severity = capitalize(maxSeverity.severityText)
    this.recommendation = maxSeverity.remediation?.description

    const library = groupByDependency({ title: this.vulnerability.title })
    const [packageName, version] = library.split(':')
    const allCves = this.group.map(groupByCVE)

    this.description = i18n.__mf('vulnerableDependencyDescriptions', {
      NUM: this.group.length,
      packageName,
      version,
      cves: allCves.join(' | ')
    })
  }

  print() {
    log(`${this.index}.`)
    // prettier-ignore
    log(`${chalk.bold(this.severity)} | ${chalk.bold(this.title)} ${this.description}`)

    if (this.whatHappened) {
      log(`\n${chalk.bold(i18n.__('whatHappenedTitle'))}\n${this.whatHappened}`)
    }

    if (this.recommendation) {
      log(`${chalk.bold(i18n.__('recommendation'))}\n${this.recommendation}`)
    }

    log('')
  }
}

const groupByCVE = ({ title }: any) =>
  title.substring(0, title.indexOf('[') - 1)

const groupByDependency = ({ title }: any) =>
  title.substring(title.indexOf('[') + 1, title.indexOf(']'))

const printResults = (results: any[]) => {
  //filter out any vulnerabs which is not least privilege or dependencies- cli does not handle other vulnerabs yet
  const vulnerabs = results.filter(r => r.category === 1 || r.category === 4)
  const sortBySeverity = sortBy(vulnerabs, ['severity', 'title'])
  const notDependencies = sortBySeverity.filter(r => r.category !== 1)
  const dependencies = sortBySeverity.filter(r => r.category === 1)
  const dependenciesByLibrary = groupBy(dependencies, groupByDependency)

  log('')

  notDependencies.forEach((vulnerability: any, index: number) => {
    const printVulnerab = new PrintVulnerability(index + 1, vulnerability)
    printVulnerab.print()
  })
  const prevIndex = notDependencies.length + 1
  Object.entries(dependenciesByLibrary).forEach(([, group], i) => {
    const printVulnerab = new PrintVulnerability(prevIndex + i, group[0], group)
    printVulnerab.print()
  })

  const dependenciesCount = Object.keys(dependenciesByLibrary).length
  const resultCount = notDependencies.length + dependenciesCount
  log(i18n.__n('foundVulnerabilities', resultCount), { bold: true })

  const counters = getNotDependenciesCounters(notDependencies)
  if (dependenciesCount) {
    counters.push(i18n.__n('dependenciesCount', dependenciesCount))
  }
  log(counters.join(' | '), { bold: true })
}

const getNotDependenciesCounters = (notDependencies: any[]) => {
  const groupByType = groupBy(notDependencies, ['categoryText'])
  return Object.values(groupByType).map(
    group => `${group.length} ${capitalize(group[0].categoryText)}`
  )
}

const underlineLinks = (text: string) => {
  if (!text) {
    return text
  }
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.replace(urlRegex, chalk.underline('$1'))
}

function toLowerKeys(obj: Record<string, unknown>) {
  return Object.keys(obj).reduce((accumulator, key) => {
    const new_key = `${key[0].toLowerCase()}${key.slice(1)}`
    accumulator[new_key] = obj[key]
    return accumulator
  }, {} as Record<string, unknown>)
}

export { toLowerKeys, printResults }
export const exportedForTesting = {
  underlineLinks,
  printResults,
  PrintVulnerability
}
