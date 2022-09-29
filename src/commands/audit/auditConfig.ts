import paramHandler from '../../utils/paramsUtil/paramHandler'
import constants from '../../constants'
import { getCommandLineArgsCustom } from '../../utils/parsedCLIOptions'
import { ContrastConf } from '../../utils/getConfig'

export const getAuditConfig = async (
  contrastConf: ContrastConf,
  command: string,
  argv: string[]
): Promise<{ [key: string]: string }> => {
  const auditParameters = await getCommandLineArgsCustom(
    contrastConf,
    command,
    argv,
    constants.commandLineDefinitions.auditOptionDefinitions
  )
  const paramsAuth = paramHandler.getAuth(auditParameters)

  // @ts-ignore
  return { ...paramsAuth, ...auditParameters }
}
