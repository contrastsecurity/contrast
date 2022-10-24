const commandLineUsage = require('command-line-usage')
const i18n = require('i18n')
const { en_locales } = require('./constants/locales.js')
const { parseSeverity } = require('./common/fail')
const { commonHelpLinks } = require('./common/commonHelp')

i18n.configure({
  staticCatalog: {
    en: en_locales()
  },
  defaultLocale: 'en'
})

const sharedOptionDefinitions = [
  {
    name: 'proxy',
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}: ' +
      i18n.__('constantsProxyServer')
  },
  {
    name: 'key',
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}: ' +
      i18n.__('constantsProxyKey')
  },
  {
    name: 'cacert',
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}: ' +
      i18n.__('constantsProxyCaCert')
  },
  {
    name: 'cert',
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}: ' +
      i18n.__('constantsProxyCert')
  },
  {
    name: 'ignore-cert-errors',
    type: Boolean,
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}:' +
      i18n.__('constantsIgnoreCertErrors')
  }
]

// CLI options that we will allow and handle
const scanOptionDefinitions = [
  ...sharedOptionDefinitions,
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
    name: 'project-path',
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}: ' +
      i18n.__('constantsProjectPath')
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
    name: 'fail',
    type: Boolean,
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}: ' +
      i18n.__('failOptionMessage')
  },
  {
    name: 'severity',
    type: severity => parseSeverity(severity),
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}: ' +
      i18n.__('constantsSeverity')
  },
  {
    name: 'ff',
    type: Boolean,
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}: ' +
      i18n.__('constantsDoNotWaitForScan')
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
    name: 'label',
    description:
      '{bold ' + i18n.__('constantsOptional') + '}:' + i18n.__('scanLabel')
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
  },
  {
    name: 'experimental',
    alias: 'e',
    type: Boolean
  },
  {
    name: 'application-name',
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}: ' +
      i18n.__('constantsApplicationName')
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
  ...sharedOptionDefinitions,
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
    name: 'file',
    alias: 'f',
    defaultValue: process.cwd().concat('/'),
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}: ' +
      i18n.__('constantsFilePath')
  },
  {
    name: 'fail',
    type: Boolean,
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}: ' +
      i18n.__('failOptionMessage')
  },
  {
    name: 'severity',
    type: severity => parseSeverity(severity),
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}: ' +
      i18n.__('constantsSeverity')
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
    alias: 'i',
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
    name: 'fingerprint',
    type: Boolean
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
    name: 'save',
    alias: 's',
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}: ' +
      i18n.__('auditOptionsSaveDescription') +
      i18n.__('auditOptionsSaveOptionsDescription')
  },
  {
    name: 'experimental',
    alias: 'e',
    type: Boolean
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
    name: 'help',
    alias: 'h',
    type: Boolean
  },
  {
    name: 'debug',
    alias: 'd',
    type: Boolean
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
    name: 'track',
    type: Boolean,
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}:' +
      i18n.__('auditOptionsTrackSummary')
  },
  {
    name: 'branch',
    description:
      '{bold ' +
      i18n.__('constantsOptional') +
      '}:' +
      i18n.__('auditOptionsBranchSummary')
  }
]

const mainUsageGuide = commandLineUsage([
  {
    header: i18n.__('constantsHeader'),
    content: [
      i18n.__('constantsContrastContent'),
      i18n.__('constantsContrastCategories')
    ]
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
      { name: i18n.__('auditName'), summary: i18n.__('helpAuditSummary') },
      { name: i18n.__('versionName'), summary: i18n.__('helpVersionSummary') },
      { name: i18n.__('configName'), summary: i18n.__('helpConfigSummary') },
      { name: i18n.__('helpName'), summary: i18n.__('helpSummary') }
    ]
  },
  {
    header: i18n.__('configHeader2'),
    content: [
      { name: i18n.__('clearHeader'), summary: i18n.__('clearContent') }
    ]
  },
  commonHelpLinks()[0],
  commonHelpLinks()[1]
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
