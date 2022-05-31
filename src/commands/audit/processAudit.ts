import { startAudit } from './auditController'
import { getAuditConfig } from './auditConfig'
import { auditUsageGuide } from './help'

export type parameterInput = string[]

export const processAudit = async (argv: parameterInput) => {
  if (argv.indexOf('--help') != -1) {
    printHelpMessage()
    process.exit(1)
  }
  const config = getAuditConfig(argv)
  const auditResults = await startAudit(config)
}

const printHelpMessage = () => {
  console.log(auditUsageGuide)
}
