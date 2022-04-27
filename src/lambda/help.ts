import commandLineUsage from 'command-line-usage'
import i18n from 'i18n'

const lambdaUsageGuide = commandLineUsage([
  {
    header: i18n.__('lambdaHeader'),
    content: [i18n.__('lambdaSummary')]
  },
  {
    header: i18n.__('constantsPrerequisitesHeader'),
    content: [i18n.__('lambdaPrerequisitesContent')]
  },
  {
    header: i18n.__('constantsUsage'),
    content: [i18n.__('lambdaUsage')]
  },
  {
    header: i18n.__('constantsOptions'),
    content: [
      {
        name: i18n.__('lambdaFunctionNameOption'),
        summary: i18n.__('lambdaFunctionNameSummery')
      },
      {
        name: i18n.__('lambdaEndpointOption'),
        summary:
          '{italic ' +
          i18n.__('constantsOptional') +
          '}: ' +
          i18n.__('lambdaEndpointSummery')
      },
      {
        name: i18n.__('lambdaRegionOption'),
        summary:
          '{italic ' +
          i18n.__('constantsOptional') +
          '}: ' +
          i18n.__('lambdaRegionSummery')
      },
      {
        name: i18n.__('lambdaProfileOption'),
        summary:
          '{italic ' +
          i18n.__('constantsOptional') +
          '}: ' +
          i18n.__('lambdaProfileSummery')
      },
      {
        name: i18n.__('lambdaJsonOption'),
        summary:
          '{italic ' +
          i18n.__('constantsOptional') +
          '}: ' +
          i18n.__('lambdaJsonSummery')
      },
      {
        name: i18n.__('lambdaVerboseOption'),
        summary:
          '{italic ' +
          i18n.__('constantsOptional') +
          '}: ' +
          i18n.__('lambdaVerbosSummery')
      }
    ]
  },
  {
    content: [
      { name: i18n.__('lambdaHelpOption'), summary: i18n.__('helpSummary') }
    ]
  },
  {
    content: '{underline https://www.contrastsecurity.com}'
  }
])

export { lambdaUsageGuide }
