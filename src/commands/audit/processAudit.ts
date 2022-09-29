import { getAuditConfig } from './auditConfig'
import { auditUsageGuide } from './help'
import { processSca } from '../scan/sca/scaAnalysis'
import { sendTelemetryConfigAsObject } from '../../telemetry/telemetry'
import { ContrastConf } from '../../utils/getConfig'
import chalk from 'chalk'

export type parameterInput = string[]

export const processAudit = async (
  contrastConf: ContrastConf,
  argv: parameterInput
) => {
  if (argv.indexOf('--help') != -1) {
    printHelpMessage()
    process.exit(0)
  }

  const config = await getAuditConfig(contrastConf, 'audit', argv)
  await processSca(config)
  postRunMessage()
  await sendTelemetryConfigAsObject(
    config,
    'audit',
    argv,
    'SUCCESS',
    // @ts-ignore
    config.language
  )
}

const printHelpMessage = () => {
  console.log(auditUsageGuide)
}

const postRunMessage = () => {
  console.log('\n' + chalk.underline.bold('Other Codesec Features:'))
  console.log("'contrast scan' to run CodeSec’s industry leading SAST scanner")
  console.log("'contrast lambda' to secure your AWS serverless functions\n")
}
