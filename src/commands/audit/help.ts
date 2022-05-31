import commandLineUsage from 'command-line-usage'
import i18n from 'i18n'
import constants from '../../constants'

const auditUsageGuide = commandLineUsage([
  {
    header: i18n.__('auditHeader'),
    content: [i18n.__('auditHeaderMessage')]
  },
  {
    header: i18n.__('constantsPrerequisitesHeader'),
    content: [
      '{bold ' +
        i18n.__('constantsAuditPrerequisitesContentSupportedLanguages') +
        '}',
      '{bold ' +
        i18n.__('constantsAuditPrerequisitesContentJava') +
        '}' +
        i18n.__('constantsAuditPrerequisitesContentMessage'),
      '',
      '{italic ' + i18n.__('constantsJavaNote') + '}',
      '{italic ' + i18n.__('constantsJavaNoteGradle') + '}',
      '',
      '{bold ' +
        i18n.__('constantsAuditPrerequisitesContentDotNet') +
        '}' +
        i18n.__('constantsAuditPrerequisitesContentDotNetMessage'),
      '{bold ' +
        i18n.__('constantsAuditPrerequisitesContentLanguageNode') +
        '}' +
        i18n.__('constantsAuditPrerequisitesContentLanguageNodeMessage'),
      '{bold ' +
        i18n.__('constantsAuditPrerequisitesContentLanguageRuby') +
        '}' +
        i18n.__('constantsAuditPrerequisitesContentLanguageRubyMessage'),
      '{bold ' +
        i18n.__('constantsAuditPrerequisitesContentLanguagePython') +
        '}' +
        i18n.__('constantsAuditPrerequisitesContentLanguagePythonMessage')
    ]
  },
  {
    header: i18n.__('constantsAuditOptions'),
    optionList: constants.commandLineDefinitions.auditOptionDefinitions
  }
])

export { auditUsageGuide }
