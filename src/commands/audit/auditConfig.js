const { getCommandLineArgsCustom } = require('../../utils/parsedCLIOptions')
const constants = require('../../cliConstants')
const paramHandler = require('../../utils/paramsUtil/paramHandler')

const getAuditConfig = async (contrastConf, command, argv) => {
  const auditParameters = await getCommandLineArgsCustom(
    contrastConf,
    command,
    argv,
    constants.commandLineDefinitions.auditOptionDefinitions
  )
  const paramsAuth = paramHandler.getAuth(auditParameters)
  const javaAgreement = paramHandler.getAgreement()
  return { ...paramsAuth, ...auditParameters, ...javaAgreement }
}

module.exports = {
  getAuditConfig
}
