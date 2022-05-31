const commandLineUsage = require('command-line-usage')
const i18n = require('i18n')
const { en_locales } = require('./constants/locales.js')

i18n.configure({
  staticCatalog: {
    en: en_locales()
  },
  defaultLocale: 'en'
})

// CLI options that we will allow and handle
const scanOptionDefinitions = [
  {
    name: 'name',
    alias: 'n',
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}: ' +
      i18n.__('constantsProjectName')
  },
  {
    name: 'language',
    alias: 'l',
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}: ' +
      i18n.__('scanOptionsLanguageSummary')
  },
  {
    name: 'file',
    alias: 'f',
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}: ' +
      i18n.__('scanOptionsFileNameSummary')
  },
  {
    name: 'project-id',
    alias: 'p',
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}: ' +
      i18n.__('constantsProjectId')
  },
  {
    name: 'timeout',
    alias: 't',
    type: Number,
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}: ' +
      i18n.__('scanOptionsTimeoutSummary')
  },
  {
    name: 'organization-id',
    alias: 'o',
    description:
      '{bold ' +
      i18n.__('constantsRequired') +
      '}: ' +
      i18n.__('constantsOrganizationId')
  },
  {
    name: 'api-key',
    description:
      '{bold ' +
      i18n.__('constantsRequired') +
      '}: ' +
      i18n.__('constantsApiKey')
  },
  {
    name: 'authorization',
    description:
      '{bold ' +
      i18n.__('constantsRequired') +
      '}: ' +
      i18n.__('constantsAuthorization')
  },
  {
    name: 'host',
    description:
      '{bold ' +
      i18n.__('constantsRequired') +
      '}: ' +
      i18n.__('constantsHostId')
  },
  {
    name: 'proxy',
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}: ' +
      i18n.__('constantsProxyServer')
  },
  {
    name: 'ff',
    type: Boolean,
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}: ' +
      i18n.__('constantsProxyServer')
  },
  {
    name: 'ignore-cert-errors',
    type: Boolean,
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}:' +
      i18n.__('constantsIgnoreCertErrors')
  },
  {
    name: 'verbose',
    alias: 'v',
    type: Boolean,
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}:' +
      i18n.__('scanOptionsVerboseSummary')
  },
  {
    name: 'save',
    alias: 's',
    description:
      '{bold ' + i18n.__('constantsOptional') + '}:' + i18n.__('constantsSave')
  },
  {
    name: 'help',
    alias: 'h',
    type: Boolean
  },
  {
    name: 'debug',
    alias: 'd',
    type: Boolean
  }
]

const authOptionDefinitions = [
  {
    name: 'help',
    alias: 'h',
    type: Boolean
  }
]

const configOptionDefinitions = [
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'Help text'
  },
  {
    name: 'clear',
    alias: 'c',
    type: Boolean,
    description: 'Clear the currently stored config'
  }
]

const auditOptionDefinitions = [
  {
    name: 'application-id',
    description:
      '{bold ' +
      i18n.__('constantsRequired') +
      '}: ' +
      i18n.__('constantsApplicationId')
  },
  {
    name: 'application-name',
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}: ' +
      i18n.__('constantsApplicationName')
  },
  {
    name: 'project-path',
    defaultValue: process.env.PWD,
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}: ' +
      i18n.__('constantsProjectPath')
  },
  {
    name: 'app-groups',
    description:
      '{bold ' +
      i18n.__('constantsOptionalForCatalogue') +
      '}: ' +
      i18n.__('constantsAppGroups')
  },
  {
    name: 'sub-project',
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}: ' +
      i18n.__('constantsGradleMultiProject')
  },
  {
    name: 'metadata',
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}: ' +
      i18n.__('constantsMetadata')
  },
  {
    name: 'tags',
    description:
      '{bold ' + i18n.__('constantsOptional') + '}: ' + i18n.__('constantsTags')
  },
  {
    name: 'code',
    description:
      '{bold ' + i18n.__('constantsOptional') + '}: ' + i18n.__('constantsCode')
  },
  {
    name: 'ignore-dev',
    type: Boolean,
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}: ' +
      i18n.__('constantsIgnoreDev')
  },
  {
    name: 'maven-settings-path'
  },
  {
    name: 'language',
    alias: 'l',
    description:
      '{bold ' +
      i18n.__('constantsRequiredCatalogue') +
      '}: ' +
      i18n.__('constantsLanguage')
  },
  {
    name: 'organization-id',
    alias: 'o',
    description:
      '{bold ' +
      i18n.__('constantsRequired') +
      '}: ' +
      i18n.__('constantsOrganizationId')
  },
  {
    name: 'api-key',
    description:
      '{bold ' +
      i18n.__('constantsRequired') +
      '}: ' +
      i18n.__('constantsApiKey')
  },
  {
    name: 'authorization',
    description:
      '{bold ' +
      i18n.__('constantsRequired') +
      '}: ' +
      i18n.__('constantsAuthorization')
  },
  {
    name: 'host',
    alias: 'h',
    description:
      '{bold ' +
      i18n.__('constantsRequired') +
      '}: ' +
      i18n.__('constantsHostId')
  },
  {
    name: 'proxy',
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}: ' +
      i18n.__('constantsProxyServer')
  },
  {
    name: 'ignore-cert-errors',
    type: Boolean,
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}:' +
      i18n.__('constantsIgnoreCertErrors')
  },
  {
    name: 'save',
    alias: 's',
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}: ' +
      i18n.__('auditOptionsSaveDescription')
  }
]

const mainUsageGuide = commandLineUsage([
  {
    header: i18n.__('constantsHeader'),
    content: [i18n.__('constantsContrastContent')]
  },
  {
    header: i18n.__('constantsUsage'),
    content: [i18n.__('constantsUsageCommandExample')]
  },
  {
    header: i18n.__('constantsCommands'),
    content: [
      { name: i18n.__('authName'), summary: i18n.__('helpAuthSummary') },
      { name: i18n.__('scanName'), summary: i18n.__('helpScanSummary') },
      { name: i18n.__('lambdaName'), summary: i18n.__('helpLambdaSummary') },
      { name: i18n.__('versionName'), summary: i18n.__('helpVersionSummary') },
      { name: i18n.__('configName'), summary: i18n.__('helpConfigSummary') },
      { name: i18n.__('helpName'), summary: i18n.__('helpSummary') }
    ]
  },
  {
    content: '{underline https://www.contrastsecurity.com}'
  }
])

const mainDefinition = [{ name: 'command', defaultOption: true }]

module.exports = {
  commandLineDefinitions: {
    mainUsageGuide,
    mainDefinition,
    scanOptionDefinitions,
    auditOptionDefinitions,
    authOptionDefinitions,
    configOptionDefinitions
  }
}
