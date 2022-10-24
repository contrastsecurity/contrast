import commandLineUsage from 'command-line-usage'
import i18n from 'i18n'
import { commonHelpLinks } from '../common/commonHelp'

const lambdaUsageGuide = commandLineUsage([
  {
    header: i18n.__('lambdaHeader'),
    content: [i18n.__('lambdaSummary')]
  },
  {
    header: i18n.__('constantsPrerequisitesHeader'),
    content: [
      '{bold ' +
        i18n.__('lambdaPrerequisitesContentLambdaLanguages') +
        '}\n\n' +
        '{bold ' +
        i18n.__('lambdaPrerequisitesContentLambdaDescriptionTitle') +
        '}' +
        i18n.__('lambdaPrerequisitesContentLambdaDescription')
    ]
  },
  {
    header: i18n.__('constantsUsage'),
    content: [i18n.__('lambdaUsage')]
  },
  {
    header: i18n.__('constantsOptions'),
    content: [
      {
        name: '{bold ' + i18n.__('lambdaFunctionNameOption') + '}',
        summary: i18n.__('lambdaFunctionNameSummery')
      },
      {
        name: '{bold ' + i18n.__('lambdaListFunctionsOption') + '}',
        summary: i18n.__('lambdaListFunctionsSummery')
      },
      {
        name: '{bold ' + i18n.__('lambdaEndpointOption') + '}',
        summary:
          '{bold ' +
          i18n.__('constantsOptional') +
          '}: ' +
          i18n.__('lambdaEndpointSummery')
      },
      {
        name: '{bold ' + i18n.__('lambdaRegionOption') + '}',
        summary:
          '{bold ' +
          i18n.__('constantsOptional') +
          '}: ' +
          i18n.__('lambdaRegionSummery')
      },
      {
        name: '{bold ' + i18n.__('lambdaProfileOption') + '}',
        summary:
          '{bold ' +
          i18n.__('constantsOptional') +
          '}: ' +
          i18n.__('lambdaProfileSummery')
      },
      {
        name: '{bold ' + i18n.__('lambdaJsonOption') + '}',
        summary:
          '{bold ' +
          i18n.__('constantsOptional') +
          '}: ' +
          i18n.__('lambdaJsonSummery')
      },
      {
        name: '{bold ' + i18n.__('lambdaVerboseOption') + '}',
        summary:
          '{bold ' +
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
  commonHelpLinks()[0],
  commonHelpLinks()[1]
])

export { lambdaUsageGuide }
