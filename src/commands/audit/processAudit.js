const auditConfig = require('./auditConfig')
const { auditUsageGuide } = require('./help')
const scaController = require('../scan/sca/scaAnalysis')
const { sendTelemetryConfigAsObject } = require('../../telemetry/telemetry')
const { postRunMessage } = require('../../common/commonHelp')

const processAudit = async (contrastConf, argvMain) => {
  if (argvMain.indexOf('--help') !== -1) {
    printHelpMessage()
    process.exit(0)
  }

  const config = await auditConfig.getAuditConfig(
    contrastConf,
    'audit',
    argvMain
  )
  await scaController.processSca(config)
  if (!config.fingerprint) {
    postRunMessage('audit')
    await sendTelemetryConfigAsObject(
      config,
      'audit',
      argvMain,
      'SUCCESS',
      config.language
    )
  }
}

const printHelpMessage = () => {
  console.log(auditUsageGuide)
}

module.exports = {
  processAudit
}
