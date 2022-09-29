const commandLineUsage = require('command-line-usage')
const i18n = require('i18n')
const constants = require('../constants')
const { commonHelpLinks } = require('../common/commonHelp')

const scanUsageGuide = commandLineUsage([
  {
    header: i18n.__('scanHeader')
  },
  {
    header: i18n.__('constantsPrerequisitesHeader'),
    content: [
      '{bold ' + i18n.__('constantsPrerequisitesContentScanLanguages') + '}',
      i18n.__('constantsPrerequisitesContent'),
      '',
      i18n.__('constantsUsageCommandInfo'),
      i18n.__('constantsUsageCommandInfo24Hours')
    ]
  },
  {
    header: i18n.__('constantsScanOptions'),
    optionList: constants.commandLineDefinitions.scanOptionDefinitions,
    hide: [
      'project-id',
      'organization-id',
      'api-key',
      'authorization',
      'host',
      'proxy',
      'help',
      'ff',
      'ignore-cert-errors',
      'verbose',
      'debug',
      'experimental',
      'application-name'
    ]
  },
  commonHelpLinks()
])

module.exports = {
  scanUsageGuide
}
