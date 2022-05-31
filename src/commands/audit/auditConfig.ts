import paramHandler from '../../utils/paramsUtil/paramHandler'
import constants from '../../constants'
import cliOptions from '../../utils/parsedCLIOptions'
import languageAnalysisEngine from '../../audit/languageAnalysisEngine/constants'

const {
  supportedLanguages: { NODE, JAVASCRIPT }
} = languageAnalysisEngine

export const getAuditConfig = (argv: string[]): { [key: string]: string } => {
  const auditParameters = cliOptions.getCommandLineArgsCustom(
    argv,
    constants.commandLineDefinitions.auditOptionDefinitions
  )
  const paramsAuth = paramHandler.getAuth(auditParameters)

  if (
    auditParameters.language === undefined ||
    auditParameters.language === null
  ) {
    //error no language
    console.log('error, --language parameter is required')
    process.exit(1)
  } else if (auditParameters.language.toUpperCase() === JAVASCRIPT) {
    auditParameters.language = NODE.toLowerCase()
  }

  // @ts-ignore
  return { ...paramsAuth, ...auditParameters }
}
